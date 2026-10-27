(()=>{
  const body=document.body;
  const toggle=document.querySelector('.menu-toggle');
  const panel=document.querySelector('.menu-panel');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Navigation stays compact, keyboard-accessible, and easy to dismiss.
  if(toggle&&panel){
    const close=()=>{
      body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded','false');
      toggle.setAttribute('aria-label','Open navigation');
    };
    toggle.addEventListener('click',()=>{
      const open=body.classList.toggle('menu-open');
      toggle.setAttribute('aria-expanded',String(open));
      toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation');
    });
    panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
    document.addEventListener('keydown',event=>{if(event.key==='Escape')close()});
    document.addEventListener('click',event=>{
      if(body.classList.contains('menu-open')&&!panel.contains(event.target)&&!toggle.contains(event.target))close();
    });
  }

  // Mark the current page in the shared navigation.
  const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  document.querySelectorAll('.menu-panel a').forEach(link=>{
    const target=(link.getAttribute('href')||'').split('/').pop().toLowerCase();
    if(target===current)link.setAttribute('aria-current','page');
  });

  document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());

  // Fine, low-cost scroll progress indicator.
  const progress=document.createElement('div');
  progress.className='scroll-progress';
  progress.setAttribute('aria-hidden','true');
  body.prepend(progress);
  let scrollFrame=false;
  const updateProgress=()=>{
    const root=document.documentElement;
    const max=root.scrollHeight-window.innerHeight;
    root.style.setProperty('--scroll-progress',max>0?String(Math.min(1,Math.max(0,window.scrollY/max))):'0');
    scrollFrame=false;
  };
  window.addEventListener('scroll',()=>{
    if(!scrollFrame){scrollFrame=true;window.requestAnimationFrame(updateProgress)}
  },{passive:true});
  updateProgress();

  // Reveal content in small groups; no external animation library required.
  const revealTargets=[
    '.page-hero .kicker','.page-hero h1','.page-hero p',
    '.featured-work .featured-heading','.featured-work .work-card','.featured-work .featured-link',
    '.home-approach .approach-head','.home-approach .approach-item',
    '.home-second-top','.home-services .home-service','.home-lastline','.home-footer',
    '.info-row','.studio-panel','.brief-form','.contact-band .wrap'
  ];
  const targets=[...new Set(revealTargets.flatMap(selector=>[...document.querySelectorAll(selector)]))];
  targets.forEach(el=>{
    el.classList.add('reveal');
    const siblings=[...el.parentElement.children].filter(node=>targets.includes(node));
    const index=siblings.indexOf(el);
    el.style.setProperty('--reveal-delay',`${Math.max(0,index)*65}ms`);
  });
  if(!reduceMotion&&'IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    targets.forEach(el=>observer.observe(el));
  }else targets.forEach(el=>el.classList.add('in'));

  // FAQ disclosure controls.
  document.querySelectorAll('.faq-q').forEach(button=>button.addEventListener('click',()=>{
    const item=button.closest('.faq-item');
    const open=item.classList.toggle('open');
    button.setAttribute('aria-expanded',String(open));
  }));

  // The project brief is prepared locally; it is never represented as a server submission.
  const form=document.querySelector('#briefForm');
  if(form){
    const feedback=document.querySelector('#briefFeedback');
    form.addEventListener('submit',async event=>{
      event.preventDefault();
      if(!form.reportValidity())return;
      const data=new FormData(form);
      const brief='KCREATIVES PROJECT ENQUIRY\\n\\nName: '+data.get('name')+'\\nBusiness: '+(data.get('business')||'Not specified')+'\\nService: '+data.get('service')+'\\nProject details: '+data.get('details')+'\\n\\nYour Business. Seen. Remembered. Chosen.';
      try{
        await navigator.clipboard.writeText(brief);
        feedback.textContent='Brief copied. Paste it into your preferred messaging or email app to send it to Kcreatives.';
      }catch(error){
        const output=document.querySelector('#briefOutput');
        output.hidden=false;
        output.value=brief;
        output.focus();
        output.select();
        feedback.textContent='Copy the brief below and send it to Kcreatives through your preferred contact channel.';
      }
    });
  }
})();