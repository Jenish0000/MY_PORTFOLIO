/* ============================================================
   script-mobile.js
   ----------------------------------------------------------------
   Mobile-only (≤1024px) vertical scroll-jacking choreography for
   the hero → skills → work transition.

   Three states, two transitions, all driven by scroll position:

   State A (Hero):     [Jenish text / Photo / Karki text]
   State B (Skills):   [Skills text at top   /  Photo at bottom]
   State C (Work):     [Photo at top         /  Work text at bottom]

   This file does NOT touch script.js. It waits for the desktop
   master timeline to be created, then kills it (its trigger is
   document.body), clears any inline transforms it left behind,
   adds body.mobile-anim-active (which flips a set of CSS rules
   in style.css), and builds its own pinned timeline.

   Auxiliary triggers from script.js (about/quote curtains,
   projects/career in-view) are NOT killed — they have different
   triggers and continue to work.
   ============================================================ */

(function () {
  'use strict';

  // Bail if GSAP not present
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  // Bail if not on mobile/tablet at load time
  if (window.innerWidth > 1024) return;

  let mobileTimeline = null;
  let isReady = false;

  // ============================================================
  // Wait for the desktop master timeline to be created.
  // It uses trigger: 'body'. Built either at end of loader anim
  // (~5s) or immediately on hash navigation. Poll until found.
  // ============================================================
  function waitForMaster() {
    const start = Date.now();

    function check() {
      const masterExists = ScrollTrigger.getAll().some(function (st) {
        return st.trigger === document.body;
      });

      if (masterExists) {
        // Give it one extra tick to settle
        setTimeout(init, 50);
      } else if (Date.now() - start < 8000) {
        setTimeout(check, 100);
      } else {
        // Timeout — desktop master never appeared. Init anyway.
        init();
      }
    }

    check();
  }

  // ============================================================
  // INIT — kill desktop master, clear transforms, build mobile TL
  // ============================================================
  function init() {
    if (isReady) return;
    isReady = true;

    // Kill the desktop master timeline (trigger === body).
    // .kill(true) reverts its tween effects on elements.
    ScrollTrigger.getAll().forEach(function (st) {
      if (st.trigger === document.body) {
        st.kill(true);
      }
    });

    // Clear inline transforms/opacity left behind by desktop GSAP
    // on hero text, skills/work text, photo, and service cards.
    gsap.set([
      '#sideLeft', '#sideRight',
      '#skillsText', '#workText',
      '#sharedPhoto', '.photo-spacer',
      '#serviceCard', '#serviceCard2', '#serviceCard3',
      '#serviceCard4', '#serviceCard5'
    ], {
      clearProps: 'transform,opacity,filter,willChange'
    });

    // Activate the mobile-anim CSS rules in style.css
    document.body.classList.add('mobile-anim-active');

    // Two RAFs to let layout settle, then build timeline
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        buildTimeline();
        ScrollTrigger.refresh();
      });
    });
  }

  // ============================================================
  // BUILD MOBILE TIMELINE
  // Pin .hero-content for 200vh of scroll. Inside that pin, run
  // the three-state choreography via a scrubbed timeline.
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
      console.warn('[script-mobile] missing elements, aborting');
      return;
    }

    // ===== Initial states (State A: Hero) =====
    // sideLeft/sideRight: visible at natural position
    // photo: at center of hero-content (its natural grid position)
    // skillsText: hidden, offscreen below
    // workText:   hidden, offscreen above
    gsap.set([sideLeft, sideRight], { y: 0, opacity: 1 });
    gsap.set(photo, { y: 0 });
    gsap.set(skillsText, { y: '100vh', opacity: 0 });
    gsap.set(workText,   { y: '-100vh', opacity: 0 });

    mobileTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '+=200%',          // 2 viewports of scroll runway
        pin: heroContent,       // pin the hero stack
        pinSpacing: true,
        scrub: 0.8,             // small lag for buttery feel
        invalidateOnRefresh: true,
        anticipatePin: 1
      }
    });

    // ============================================================
    // PHASE 1 — Hero → Skills    (timeline 0 to ~0.45)
    //   Jenish slides up & fades.
    //   Karki  slides down & fades.
    //   Photo  translates DOWN ~25vh (now in lower portion).
    //   Skills text rises from below into upper portion.
    // ============================================================
    mobileTimeline
      .to(sideLeft, {
        y: -120, opacity: 0,
        duration: 0.3, ease: 'power2.in'
      }, 0)
      .to(sideRight, {
        y: 120, opacity: 0,
        duration: 0.3, ease: 'power2.in'
      }, 0)
      .to(photo, {
        y: '25vh',
        duration: 0.45, ease: 'power2.inOut'
      }, 0)
      .fromTo(skillsText,
        { y: '100vh', opacity: 0 },
        { y: '15vh',  opacity: 1, duration: 0.4, ease: 'power2.out' },
        0.05
      );

    // ============================================================
    // (Hold ~0.45 → 0.55) — State B is fully visible here.
    // No new tweens. With scrub, this gives the user a stable
    // "skills" frame as they scroll through this range.
    // ============================================================

    // ============================================================
    // PHASE 2 — Skills → Work    (timeline 0.55 to ~0.9)
    //   Skills text exits UP and offscreen.
    //   Photo translates UP ~50vh (from +25vh down to -25vh up).
    //   Work text descends from above into lower portion.
    // ============================================================
    mobileTimeline
      .to(skillsText, {
        y: '-100vh', opacity: 0,
        duration: 0.3, ease: 'power2.in'
      }, 0.55)
      .to(photo, {
        y: '-25vh',
        duration: 0.4, ease: 'power2.inOut'
      }, 0.55)
      .fromTo(workText,
        { y: '-100vh', opacity: 0 },
        { y: '55vh',   opacity: 1, duration: 0.35, ease: 'power2.out' },
        0.6
      );

    // ============================================================
    // TAIL (timeline 0.95 → 1.0)
    // Fade out the work-text + photo so they don't bleed into
    // services after the pin ends. Without this, both stay
    // position:fixed and overlay the next sections.
    // ============================================================
    mobileTimeline.to([workText, photo], {
      opacity: 0,
      duration: 0.05,
      ease: 'power1.in'
    }, 0.95);
  }

  // ============================================================
  // Boot
  // ============================================================
  if (document.readyState === 'complete') {
    waitForMaster();
  } else {
    window.addEventListener('load', waitForMaster);
  }
})();
