(()=>{
  const body=document.body;
  const toggle=document.querySelector('.menu-toggle');
  const panel=document.querySelector('.menu-panel');
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Persistent theme switch; warm parchment by default, with a restrained charcoal/bronze dark palette.
  const themeToggle=document.querySelector('.theme-toggle');
  const themeLabel=themeToggle?.querySelector('.theme-label');
  const themeSymbol=themeToggle?.querySelector('.theme-symbol');
  const storedTheme=(()=>{try{return localStorage.getItem('kcreatives-theme')}catch(error){return null}})();
  const preferredTheme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  const applyTheme=(theme)=>{
    document.documentElement.dataset.theme=theme;
    if(themeToggle){
      const dark=theme==='dark';
      themeToggle.setAttribute('aria-pressed',String(dark));
      themeToggle.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');
      if(themeLabel)themeLabel.textContent=dark?'Light mode':'Dark mode';
      if(themeSymbol)themeSymbol.textContent=dark?'☼':'◐';
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#171715':'#f0ede5');
  };
  applyTheme(storedTheme==='dark'||storedTheme==='light'?storedTheme:preferredTheme);
  themeToggle?.addEventListener('click',()=>{
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    applyTheme(next);
    try{localStorage.setItem('kcreatives-theme',next)}catch(error){}
  });

  // Capsule navigation gently contracts on scroll without hiding the brand or controls.
  const header=document.querySelector('.site-header');
  let headerFrame=0;
  const updateHeader=()=>{
    header?.classList.toggle('is-scrolled',window.scrollY>24);
    headerFrame=0;
  };
  window.addEventListener('scroll',()=>{
    if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);
  },{passive:true});
  updateHeader();

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
  document.querySelectorAll('.menu-panel a,.capsule-links a').forEach(link=>{
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

  // A barely-there pointer tilt on the hero artwork, only for fine pointers.
  if(!reduceMotion&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){
    document.querySelectorAll('.hero-poster').forEach(poster=>{
      poster.addEventListener('pointermove',event=>{
        const bounds=poster.getBoundingClientRect();
        const x=(event.clientX-bounds.left)/bounds.width-.5;
        const y=(event.clientY-bounds.top)/bounds.height-.5;
        poster.style.setProperty('--poster-tilt-x',`${(-y*2.2).toFixed(2)}deg`);
        poster.style.setProperty('--poster-tilt-y',`${(x*2.2).toFixed(2)}deg`);
      });
      poster.addEventListener('pointerleave',()=>{
        poster.style.setProperty('--poster-tilt-x','0deg');
        poster.style.setProperty('--poster-tilt-y','0deg');
      });
    });
  }

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


  // Desktop-only cursor and magnetic CTA: restrained, opt-in to fine pointers.
  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(finePointer&&!reduceMotion){
    const orb=document.createElement('div');
    orb.className='cursor-orb';
    orb.setAttribute('aria-hidden','true');
    body.appendChild(orb);
    let pointerX=-20,pointerY=-20,orbX=-20,orbY=-20,orbFrame=0;
    const moveOrb=()=>{
      orbX+=(pointerX-orbX)*.22;
      orbY+=(pointerY-orbY)*.22;
      orb.style.left=orbX+'px';
      orb.style.top=orbY+'px';
      if(Math.abs(pointerX-orbX)>.15||Math.abs(pointerY-orbY)>.15)orbFrame=requestAnimationFrame(moveOrb);
      else orbFrame=0;
    };
    document.addEventListener('pointermove',event=>{
      pointerX=event.clientX;pointerY=event.clientY;
      orb.classList.add('is-visible');
      if(!orbFrame)orbFrame=requestAnimationFrame(moveOrb);
    },{passive:true});
    document.addEventListener('pointerleave',()=>orb.classList.remove('is-visible'));
    document.querySelectorAll('a,button').forEach(el=>{
      el.addEventListener('pointerenter',()=>orb.classList.add('is-active'));
      el.addEventListener('pointerleave',()=>orb.classList.remove('is-active'));
    });

    document.querySelectorAll('.button').forEach(button=>{
      button.addEventListener('pointermove',event=>{
        const rect=button.getBoundingClientRect();
        const dx=(event.clientX-(rect.left+rect.width/2))*.08;
        const dy=(event.clientY-(rect.top+rect.height/2))*.12;
        button.style.setProperty('--mag-x',Math.max(-5,Math.min(5,dx))+'px');
        button.style.setProperty('--mag-y',Math.max(-5,Math.min(5,dy))+'px');
        button.style.transform='translate3d(var(--mag-x),var(--mag-y),0)';
      });
      button.addEventListener('pointerleave',()=>{
        button.style.removeProperty('--mag-x');
        button.style.removeProperty('--mag-y');
        button.style.removeProperty('transform');
      });
    });
  }

  // Subtle scroll-linked drift gives the concept artwork physical depth without video assets.
  if(!reduceMotion&&'IntersectionObserver'in window){
    const artCards=[...document.querySelectorAll('.work-card .artboard')];
    let artFrame=0;
    const driftArt=()=>{
      artCards.forEach(art=>{
        const rect=art.getBoundingClientRect();
        if(rect.bottom<0||rect.top>window.innerHeight)return;
        const progress=(rect.top+rect.height/2-window.innerHeight/2)/window.innerHeight;
        art.style.setProperty('--art-drift',(progress*-10).toFixed(2)+'px');
      });
      artFrame=0;
    };
    window.addEventListener('scroll',()=>{
      if(!artFrame)artFrame=requestAnimationFrame(driftArt);
    },{passive:true});
    driftArt();
  }

})();