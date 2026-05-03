if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

// ============================================================
// HASH NAVIGATION — when arriving from a case study back-link
// (e.g. index.html#projects), skip the JK loader entirely and
// jump straight to the target section.
// ============================================================
const HAS_HASH = !!(window.location.hash && window.location.hash.length > 1);

if (!HAS_HASH) {
  window.scrollTo(0, 0);
}

window.addEventListener('beforeunload', () => window.scrollTo(0, 0));
window.addEventListener('pageshow', (e) => {
  if (e.persisted && !HAS_HASH) window.scrollTo(0, 0);
});

gsap.registerPlugin(ScrollTrigger);

gsap.set('#workText',     { yPercent: -50, x: window.innerWidth, opacity:    0 });
gsap.set('#skillsText',   { yPercent: -50, x: 0, opacity: 0 });
gsap.set('#serviceCard',  { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
gsap.set('#serviceCard2', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
gsap.set('#serviceCard3', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
gsap.set('#serviceCard4', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
gsap.set('#serviceCard5', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
gsap.set('#sharedPhoto',  { xPercent: -50, yPercent: -50, x: 0, y: 50, rotation: 0, scale: 1, opacity: 0 });


window.addEventListener('load', () => {
  if (!HAS_HASH) {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  const loader      = document.getElementById('loader');
  const emblem      = document.getElementById('emblem');
  const letterJ     = document.getElementById('letterJ');
  const letterK     = document.getElementById('letterK');
  const logoTarget  = document.getElementById('logoTarget');
  const sideLeft    = document.getElementById('sideLeft');
  const sideRight   = document.getElementById('sideRight');
  const sharedPhoto = document.getElementById('sharedPhoto');
  const skillsText  = document.getElementById('skillsText');
  const workText    = document.getElementById('workText');
  const topRight    = document.getElementById('topRight');
  const gridBg      = document.getElementById('gridBg');
  const gridGlow    = document.getElementById('gridGlow');
  const menuToggle  = document.getElementById('menuToggle');
  const menuClose   = document.getElementById('menuClose');
  const navOverlay  = document.getElementById('navOverlay');
  const siteHeader  = document.getElementById('siteHeader');

  gsap.set(emblem, { x: -window.innerWidth*0.45, y: window.innerHeight*0.45, scale: 0.6, opacity: 0 });
  gsap.set(letterJ, { x: -window.innerWidth*0.5, opacity: 0 });
  gsap.set(letterK, { x: window.innerWidth*0.5, opacity: 0 });
  gsap.set(sideLeft,  { y: 50, opacity: 0 });
  gsap.set(sideRight, { y: 50, opacity: 0 });

  // ============================================================
  // HASH-SKIP PATH — bypass loader, jump to end states, scroll
  // ============================================================
  if (HAS_HASH) {
    // Hide loader entirely
    gsap.set(loader, { opacity: 0, pointerEvents: 'none', display: 'none' });
    gsap.set(logoTarget, { opacity: 1 });

    // Jump hero + chrome to revealed end-state
    gsap.set([sideLeft, sideRight], { y: 0, opacity: 1 });
    gsap.set(sharedPhoto, { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 });
    gsap.set(topRight, { opacity: 1 });

    gridBg.classList.add('visible');
    gridGlow.classList.add('visible');
    document.body.classList.remove('loading');

    buildMasterTimeline();
    ScrollTrigger.refresh();

    // Scroll to the hash target after layout settles
    requestAnimationFrame(() => {
      const target = document.querySelector(window.location.hash);
      if (target) {
        const targetY = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, Math.max(0, targetY - 20));
        // Re-fire after a beat in case ScrollTrigger or GSAP nudged us
        setTimeout(() => {
          const t2 = document.querySelector(window.location.hash);
          if (t2) {
            const y2 = t2.getBoundingClientRect().top + window.scrollY;
            window.scrollTo(0, Math.max(0, y2 - 20));
          }
        }, 120);
      }
      attachAuxHandlers();
    });

    return; // skip the loader timeline below
  }

  // ============================================================
  // ORIGINAL LOADER PATH (no hash)
  // ============================================================
  function getLogoTransform() {
    const t = logoTarget.getBoundingClientRect();
    const s = loader.getBoundingClientRect();
    const scale = (t.width / s.width) * 1.6;
    return {
      x: (t.left + t.width/2) - (s.left + s.width/2),
      y: (t.top + t.height/2) - (s.top + s.height/2),
      scale: scale
    };
  }

  /* ===== LOADER ===== */
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Horse slides in from bottom-left to center
  tl.to({}, { duration: 0.4 });
  tl.to(emblem, { x:0, y:0, scale:1, opacity:1, duration:1.3 });

  // 2. J and K slide in from sides
  tl.to(letterJ, { x:0, opacity:1, duration:0.9 }, '-=0.3');
  tl.to(letterK, { x:0, opacity:1, duration:0.9 }, '<');

  // Hold so user can see the full composition
  tl.to({}, { duration: 0.5 });

  // 3. Shrink + move to logo position in one smooth motion
  tl.to(loader, {
    duration: 1.4,
    ease: 'power3.inOut',
    onStart: () => {
      const t = getLogoTransform();
      gsap.to(loader, {
        x: t.x,
        y: t.y,
        scale: t.scale,
        duration: 1.4,
        ease: 'power3.inOut'
      });
    }
  });

  // Fade background to transparent during the move
  tl.to(loader, { backgroundColor: 'rgba(0,0,0,0)', duration: 0.5 }, '-=1.0');

  tl.add(() => {
    gsap.set(logoTarget, { opacity: 0 });
    loader.style.zIndex = '30';
    loader.style.pointerEvents = 'none';
    gsap.set(sharedPhoto, { xPercent: -50, yPercent: -50, x: 0, y: 50, rotation: 0, scale: 1, opacity: 0 });
    gsap.set(sideLeft,  { y: 50, opacity: 0 });
    gsap.set(sideRight, { y: 50, opacity: 0 });
    gsap.set(workText,   { yPercent: -50, x: window.innerWidth, opacity: 0 });
    gsap.set(skillsText, { yPercent: -50, x: 0, opacity: 0 });
    gsap.set('#serviceCard',  { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
    gsap.set('#serviceCard2', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
    gsap.set('#serviceCard3', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
    gsap.set('#serviceCard4', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
    gsap.set('#serviceCard5', { yPercent: -50, y: window.innerHeight * 1.5, opacity: 1 });
  });

  tl.to([sharedPhoto, sideLeft, sideRight], {
    y: 0, opacity: 1, duration: 1.2, ease: 'power3.out'
  });
  tl.to(topRight, { opacity: 1, duration: 0.8 }, '<+0.3');

  tl.add(() => {
    gridBg.classList.add('visible');
    gridGlow.classList.add('visible');
    document.body.classList.remove('loading');
    buildMasterTimeline();
    ScrollTrigger.refresh();
    attachAuxHandlers();
  });


  /* ============================================================
     ONE MASTER TIMELINE — drives all homepage scroll animations
     ============================================================ */
  function buildMasterTimeline() {

    const master = gsap.timeline({
      scrollTrigger: {
        trigger: 'body',
        start: 'top top',
        end: () => '+=' + document.querySelector('#aboutTrigger').offsetTop,
        scrub: 1.2
      }
    });

    // ===== Phase 1: Hero → Skills =====
    master.to(sideLeft, {
      x: () => -window.innerWidth * 0.7, opacity: 0,
      ease: 'power2.inOut', duration: 0.07
    }, 0);

    master.to(sideRight, {
      x: () => window.innerWidth * 0.7, opacity: 0,
      ease: 'power2.inOut', duration: 0.07
    }, 0);

    master.to(sharedPhoto, {
      x: () => window.innerWidth * 0.22,
      rotation: 12, scale: 1.12,
      ease: 'power2.inOut', duration: 0.09
    }, 0);

    master.fromTo(skillsText,
      { y: 60, opacity: 0 },
      { y: 0, opacity: 1, ease: 'power2.out', duration: 0.06 },
      0.04
    );

    // ===== Phase 2: Skills → Work =====
    master.to(skillsText, {
      x: () => -window.innerWidth,
      ease: 'power2.inOut', duration: 0.09
    }, 0.13);

    master.to(sharedPhoto, {
      x: () => -window.innerWidth * 0.22, rotation: 0,
      ease: 'power2.inOut', duration: 0.09
    }, 0.13);

    master.fromTo(workText,
      { x: () => window.innerWidth, opacity: 0 },
      { x: 0, opacity: 1, ease: 'power2.out', duration: 0.09 },
      0.13
    );

    // ===== Phase 3+4: Work → Card 01 =====
    master.to(workText, {
      x: () => -window.innerWidth * 1.3,
      ease: 'power2.inOut', duration: 0.06
    }, 0.26);

    master.to(sharedPhoto, {
      x: () => -window.innerWidth * 1.3,
      ease: 'power2.inOut', duration: 0.06
    }, 0.26);

    master.set(sharedPhoto, {
      x: () => window.innerWidth * 1.3, rotation: 0
    }, 0.32);

    master.to(sharedPhoto, {
      x: () => window.innerWidth * 0.22, rotation: 8,
      ease: 'power2.out', duration: 0.08
    }, 0.32);

    master.to('#serviceCard', {
      y: 0, ease: 'power3.out', duration: 0.08
    }, 0.32);

    // ===== Phase 5: Card 01 → Card 02 =====
    master.to('#serviceCard', {
      y: -50, x: -20, rotation: -2.5,
      opacity: 0.65, filter: 'blur(8px)', scale: 0.92,
      ease: 'power2.inOut', duration: 0.06
    }, 0.46);

    master.to('#serviceCard2', {
      y: 0, ease: 'power3.out', duration: 0.06
    }, 0.46);

    // ===== Phase 6: Card 02 → Card 03 =====
    master.to('#serviceCard2', {
      y: -50, x: -20, rotation: -2.5,
      opacity: 0.65, filter: 'blur(8px)', scale: 0.92,
      ease: 'power2.inOut', duration: 0.06
    }, 0.56);

    master.to('#serviceCard3', {
      y: 0, ease: 'power3.out', duration: 0.06
    }, 0.56);

    // ===== Phase 7: Card 03 → Card 04 =====
    master.to('#serviceCard3', {
      y: -50, x: -20, rotation: -2.5,
      opacity: 0.65, filter: 'blur(8px)', scale: 0.92,
      ease: 'power2.inOut', duration: 0.06
    }, 0.66);

    master.to('#serviceCard4', {
      y: 0, ease: 'power3.out', duration: 0.06
    }, 0.66);

    // ===== Phase 8: Card 04 → Card 05 =====
    master.to('#serviceCard4', {
      y: -50, x: -20, rotation: -2.5,
      opacity: 0.65, filter: 'blur(8px)', scale: 0.92,
      ease: 'power2.inOut', duration: 0.06
    }, 0.78);

    master.to('#serviceCard5', {
      y: 0, ease: 'power3.out', duration: 0.06
    }, 0.78);

    // Hold both states stable through end of master
    master.to('#serviceCard5', { y: 0, duration: 0.16 }, 0.84);
    master.to('#serviceCard4', {
      y: -50, x: -20, rotation: -2.5,
      opacity: 0.65, filter: 'blur(8px)', scale: 0.92,
      duration: 0.16
    }, 0.84);


    // ===== Auxiliary triggers =====
    ScrollTrigger.create({
      trigger: '#skills',
      start: 'top 70%',
      onEnter:     () => gsap.to(loader, { opacity: 0, duration: 0.4 }),
      onLeaveBack: () => gsap.to(loader, { opacity: 1, duration: 0.4 })
    });

    gsap.to(siteHeader, {
      y: -8, ease: 'none',
      immediateRender: false,
      scrollTrigger: { trigger: '#skills', start: 'top bottom', end: 'top top', scrub: 0.5 }
    });

    // ===== About curtain =====
    ScrollTrigger.create({
      trigger: '#aboutTrigger',
      start: 'top center',
      onEnter:     () => document.getElementById('about').classList.add('open'),
      onLeaveBack: () => document.getElementById('about').classList.remove('open')
    });

    // ===== Quote curtain =====
    ScrollTrigger.create({
      trigger: '#quoteTrigger',
      start: 'top center',
      onEnter:     () => document.getElementById('quote').classList.add('open'),
      onLeaveBack: () => document.getElementById('quote').classList.remove('open')
    });

    setTimeout(() => ScrollTrigger.refresh(), 100);
  }


  // ============================================================
  // Auxiliary handlers (cursor glow, nav, scroll, lightbox, theme)
  // Wrapped in a function so both paths (loader and hash-skip)
  // can call it.
  // ============================================================
  function attachAuxHandlers() {

    /* ===== CURSOR GLOW ===== */
    let mouseX = innerWidth/2, mouseY = innerHeight/2;
    let glowX = mouseX, glowY = mouseY;
    addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    function animateGlow() {
      glowX += (mouseX - glowX) * 0.12;
      glowY += (mouseY - glowY) * 0.12;
      gridGlow.style.left = glowX + 'px';
      gridGlow.style.top  = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }
    animateGlow();


    /* ===== NAV OVERLAY ===== */
    function openNav() {
      navOverlay.classList.add('open');
      navOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      navOverlay.classList.remove('open');
      navOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    menuToggle.addEventListener('click', () => {
      if (navOverlay.classList.contains('open')) closeNav();
      else openNav();
    });
    menuClose.addEventListener('click', closeNav);

    /* ===== ALL HASH LINKS smooth-scroll (nav + footer) ===== */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const isInNav = link.closest('.nav-list, .nav-contact');
        if (isInNav) closeNav();

        const delay = isInNav ? 700 : 0;
        setTimeout(() => {
          const targetY = target.getBoundingClientRect().top + window.scrollY;
          smoothScrollTo(targetY, 1800);
        }, delay);
      });
    });

    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeNav();
    });

    addEventListener('resize', () => ScrollTrigger.refresh());


    /* ===== PROJECTS reveal ===== */
    const projectsSection = document.getElementById('projects');
    if (projectsSection) {
      ScrollTrigger.create({
        trigger: projectsSection,
        start: 'top 95%',
        onEnter: () => projectsSection.classList.add('in-view'),
        onLeaveBack: () => projectsSection.classList.remove('in-view')
      });
      // If we landed here via hash, force the in-view state immediately
      if (HAS_HASH && window.location.hash === '#projects') {
        projectsSection.classList.add('in-view');
      }
    }

    /* ===== CAREER reveal ===== */
    const careerSection = document.getElementById('career');
    if (careerSection) {
      ScrollTrigger.create({
        trigger: careerSection,
        start: 'top 80%',
        onEnter: () => careerSection.classList.add('in-view'),
        onLeaveBack: () => careerSection.classList.remove('in-view')
      });
    }

    /* ===== SMOOTH SCROLL HELPER ===== */
    function smoothScrollTo(targetY, duration = 1800) {
      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);
        window.scrollTo(0, startY + distance * eased);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    /* ===== BACK TO TOP ===== */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', () => {
        smoothScrollTo(0, 2200);
      });
    }

    /* ===== LIGHTBOX ===== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    // Note: new project cards use .project-hook-card / .project-also-card
    // and navigate to case study pages directly. The legacy .project-card
    // handler stays in case any old markup exists.
    document.querySelectorAll('.project-card[data-img]').forEach(card => {
      card.addEventListener('click', (e) => {
        const src = card.getAttribute('data-img');
        if (!src) return;
        e.preventDefault();
        lightboxImg.src = src;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { lightboxImg.src = ''; }, 400);
    }
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });

    /* ===== THEME TOGGLE ===== */
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('theme-light');
        const isLight = document.body.classList.contains('theme-light');
        const newSrc = isLight ? 'assets/blackbg.png' : 'assets/horse-flag.png';
        document.querySelectorAll('.logo-emblem, .footer-logo img, .emblem').forEach(img => {
          img.src = newSrc;
        });
      });
    }
  }
});