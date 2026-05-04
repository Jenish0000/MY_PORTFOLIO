/* ============================================================
   script-mobile.js
   ----------------------------------------------------------------
   Mobile-only (≤1024px) GSAP choreography.

   Two scroll-driven timelines:
   1. Hero pin (200vh) — Jenish/photo/Karki → skills → work
   2. Services (1100vh container, no pin) — 5-card stack

   Services container is 1100vh tall (CSS), giving 1000vh of
   scroll runway. With scrub: 0.1 (was 0.3) the timeline keeps
   tight pace with scroll — all 5 card phases complete before
   about-curtain fires. Reverses on scroll up: about → 5 → 4 →
   3 → 2 → 1 → work text.
   ============================================================ */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  if (window.innerWidth > 1024) return;

  let mobileTimeline = null;
  let servicesTimeline = null;
  let isReady = false;

  function waitForMaster() {
    const start = Date.now();

    function check() {
      const masterExists = ScrollTrigger.getAll().some(function (st) {
        return st.trigger === document.body;
      });

      if (masterExists) {
        setTimeout(init, 50);
      } else if (Date.now() - start < 8000) {
        setTimeout(check, 100);
      } else {
        init();
      }
    }

    check();
  }

  function init() {
    if (isReady) return;
    isReady = true;

    // Kill the desktop master (trigger === body) AND the auxiliary
    // triggers for about/quote curtains. These were created by
    // script.js against the desktop layout — their start positions
    // reflect a much shorter services section. We must kill and
    // recreate them so they recompute against the new mobile layout
    // where services is 1500vh tall and #aboutTrigger sits much
    // further down the document.
    ScrollTrigger.getAll().forEach(function (st) {
      const triggerId = st.trigger && st.trigger.id;
      if (
        st.trigger === document.body ||
        triggerId === 'aboutTrigger' ||
        triggerId === 'quoteTrigger'
      ) {
        st.kill(true);
      }
    });

    gsap.set([
      '#sideLeft', '#sideRight',
      '#skillsText', '#workText',
      '#sharedPhoto', '.photo-spacer',
      '#serviceCard', '#serviceCard2', '#serviceCard3',
      '#serviceCard4', '#serviceCard5'
    ], {
      clearProps: 'transform,opacity,filter,willChange'
    });

    document.body.classList.add('mobile-anim-active');

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        buildTimeline();
        buildServicesTimeline();

        // Recreate about + quote triggers AGAINST the new mobile
        // layout. Now that services is 1500vh and the document is
        // restructured, their start positions ('top bottom' /
        // 'top center') will compute correctly from the live DOM.
        // Without this, about-curtain fires at the old desktop
        // scroll position — which corresponds to the middle of
        // services in mobile, NOT the end.
        buildAuxiliaryTriggers();

        ScrollTrigger.refresh();
      });
    });
  }

  // ============================================================
  // AUXILIARY TRIGGERS — about + quote curtains
  // Mirrors the logic from script.js's buildMasterTimeline(), but
  // run AFTER mobile-anim-active CSS is applied so positions are
  // calculated against the new layout (services 1500vh tall).
  // ============================================================
  function buildAuxiliaryTriggers() {
    const aboutEl = document.getElementById('about');
    const quoteEl = document.getElementById('quote');

    if (document.getElementById('aboutTrigger') && aboutEl) {
      ScrollTrigger.create({
        trigger: '#aboutTrigger',
        start: 'top bottom',
        onEnter:     function () { aboutEl.classList.add('open'); },
        onLeaveBack: function () { aboutEl.classList.remove('open'); }
      });
    }

    if (document.getElementById('quoteTrigger') && quoteEl) {
      ScrollTrigger.create({
        trigger: '#quoteTrigger',
        start: 'top center',
        onEnter:     function () { quoteEl.classList.add('open'); },
        onLeaveBack: function () { quoteEl.classList.remove('open'); }
      });
    }
  }

  // ============================================================
  // HERO/SKILLS/WORK TIMELINE — pin .hero-content for 200vh
  // ============================================================
  function buildTimeline() {
    const hero        = document.getElementById('hero');
    const heroContent = document.querySelector('.hero-content');
    const sideLeft    = document.getElementById('sideLeft');
    const sideRight   = document.getElementById('sideRight');
    const photo       = document.querySelector('.photo-spacer');
    const skillsText  = document.getElementById('skillsText');
    const workText    = document.getElementById('workText');

    if (!hero || !heroContent || !photo || !skillsText || !workText) {
      console.warn('[script-mobile] missing hero elements');
      return;
    }

    gsap.set([sideLeft, sideRight], { y: 0, opacity: 1 });
    gsap.set(photo, { y: 0 });
    gsap.set(skillsText, { y: '100vh', opacity: 0 });
    gsap.set(workText,   { y: '-100vh', opacity: 0 });

    mobileTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=200%',
        pin: heroContent,
        pinSpacing: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });

    // PHASE 1 — Hero → Skills
    mobileTimeline
      .to(sideLeft,  { y: -120, opacity: 0, duration: 0.3, ease: 'power2.in'    }, 0)
      .to(sideRight, { y:  120, opacity: 0, duration: 0.3, ease: 'power2.in'    }, 0)
      .to(photo,     { y: '25vh',           duration: 0.45, ease: 'power2.inOut' }, 0)
      .fromTo(skillsText,
        { y: '100vh', opacity: 0 },
        { y: '15vh',  opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.05
      );

    // PHASE 2 — Skills → Work
    mobileTimeline
      .to(skillsText, { y: '-100vh', opacity: 0, duration: 0.3, ease: 'power2.in'  }, 0.55)
      .to(photo,      { y: '-25vh',              duration: 0.4, ease: 'power2.inOut' }, 0.55)
      .fromTo(workText,
        { y: '-100vh', opacity: 0 },
        { y: '55vh',   opacity: 1, duration: 0.35, ease: 'power2.out' },
        0.6
      );

    // TAIL — fade work-text + photo so they don't bleed into services
    mobileTimeline.to([workText, photo], { opacity: 0, duration: 0.05, ease: 'power1.in' }, 0.95);
  }

  // ============================================================
  // SERVICES CARD-STACK TIMELINE
  //
  // Container is 1100vh tall (CSS). Cards are position:fixed at
  // viewport center. Timeline scrubs from services.top hitting
  // viewport.top to services.bottom hitting viewport.bottom —
  // 1000vh of scroll runway. 5 cards × 200vh per phase.
  //
  // scrub: 0.1 (very low lag) so timeline tracks scroll tightly
  // and reaches progress 0.95+ by the time about-curtain fires.
  // ============================================================
  function buildServicesTimeline() {
    const services = document.getElementById('services');
    if (!services) {
      console.warn('[script-mobile] no #services');
      return;
    }

    const cardIds = [
      'serviceCard', 'serviceCard2', 'serviceCard3',
      'serviceCard4', 'serviceCard5'
    ];
    const cards = cardIds
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    if (cards.length === 0) return;

    // Initial state — all cards centered, shifted offscreen below
    gsap.set(cards, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: '100vh',
      rotation: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      willChange: 'transform, opacity, filter'
    });

    // Pack all 5 card phases into the first 90% of the timeline. The
    // last 10% becomes a natural "hold zone" where card 5 stays at y:0
    // — exactly matching script.js desktop hold logic at progress 0.84:
    //   master.to('#serviceCard5', { y: 0, duration: 0.16 }, 0.84);
    // This buffer means about-curtain doesn't fire the moment card 5
    // arrives — user scrolls past card 5 into the hold zone first, and
    // reverse-scroll from about-me lands on card 5 (not card 4).
    const cardSpan = 0.9;
    const phaseLen = cardSpan / cards.length;  // 0.18 each card

    servicesTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: services,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.05,                   // ← KEY CHANGE: was 0.1, now 0.05 for tightest tracking
        invalidateOnRefresh: true
      }
    });

    cards.forEach(function (card, i) {
      const enterAt = i * phaseLen;

      // Card slides up from below to centered.
      servicesTimeline.to(card, {
        y: 0,
        ease: 'power3.out',
        duration: phaseLen * 0.7
      }, enterAt);

      // Previous card pushed up, dimmed, blurred, scaled — stacked-behind effect.
      if (i > 0) {
        servicesTimeline.to(cards[i - 1], {
          y: '-8vh',
          opacity: 0.5,
          scale: 0.92,
          filter: 'blur(6px)',
          ease: 'power2.inOut',
          duration: phaseLen * 0.7
        }, enterAt);
      }
    });

    // No tail fade — card 5 stays fully visible during the hold zone
    // (progress 0.846 to 1.0). When about-curtain opens (z-index 25)
    // it covers the cards (z-index 14-18) on its own. On reverse
    // scroll, about-curtain closes and card 5 is immediately visible
    // because we never faded it. Card 5 → card 4 → ... → card 1
    // reverses cleanly via scrub.
  }

  if (document.readyState === 'complete') {
    waitForMaster();
  } else {
    window.addEventListener('load', waitForMaster);
  }
})();
