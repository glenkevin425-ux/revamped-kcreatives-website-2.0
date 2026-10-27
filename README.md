# Kcreatives — Studio Website

A responsive, single-page creative studio website for Kcreatives, built with HTML, CSS, and vanilla JavaScript for simple Vercel deployment.

## Included

- Editorial typography and a restrained paper / ink / electric-blue visual system.
- Responsive navigation and layouts for mobile, tablet, and desktop.
- Motion-reduced experience and scroll-reveal interactions.
- Services, concept portfolio, studio philosophy, process, FAQ, and project inquiry flow.
- A project brief builder that prepares a copyable brief without pretending a backend or email integration exists.

## Important content note

The two portfolio visuals are explicitly labelled concept explorations. Replace them with verified Kcreatives client work when ready. No client results, testimonials, or contact details have been invented.

## Deploy to Vercel

1. Import `glenkevin425-ux/revamped-kcreatives-website-2.0` into Vercel.
2. Select **Other** as the framework preset if asked.
3. Leave the build command and output directory empty for a static site, or set the output directory to `.` if required by the project settings.
4. Deploy. Vercel will serve `index.html` from the repository root.

No build step or environment variables are required. The Google Fonts stylesheet requires an internet connection; the page falls back to system fonts if it cannot load.

## Before launch

- Replace the concept portfolio with actual work where possible.
- Add verified contact channels and official social links.
- If desired, connect the inquiry form to a real form endpoint or backend. The current brief builder copies the project brief locally and does not send it to Kcreatives automatically.
- Test the deployed page on real mobile devices and check the final Vercel URL.
