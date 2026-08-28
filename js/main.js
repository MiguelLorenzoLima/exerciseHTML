/* =====================================================
   MAIN.JS — Concerto Visual Identity
   GSAP + ScrollTrigger + Lenis + Navbar + Mobile Menu
   ===================================================== */

(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* =====================================================
       LENIS — Smooth Scroll
       ===================================================== */
    function initLenis() {
        if (prefersReducedMotion || typeof Lenis === 'undefined') {
            document.documentElement.style.scrollBehavior = 'smooth';
            return;
        }

        try {
            var lenis = new Lenis({
                duration: 1.2,
                easing: function (t) {
                    return Math.min(1, 1.001 - Math.pow(2, -10 * t));
                },
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            if (typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add(function (time) {
                    lenis.raf(time * 1000);
                });
                gsap.ticker.lagSmoothing(0);
            }
        } catch (e) {
            document.documentElement.style.scrollBehavior = 'smooth';
        }
    }

    /* =====================================================
       NAVBAR — Scroll Effect
       ===================================================== */
    function initNavbar() {
        var navbar = document.querySelector('.navbar');
        if (!navbar) return;

        var threshold = 50;

        function update() {
            if (window.scrollY > threshold) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* =====================================================
       MOBILE MENU
       ===================================================== */
    function initMobileMenu() {
        var hamburger = document.querySelector('.nav-hamburger');
        var nav = document.querySelector('.navbar-nav');
        var overlay = document.querySelector('.nav-overlay');

        if (!hamburger || !nav) return;

        function toggle() {
            var isOpen = nav.classList.contains('open');
            hamburger.classList.toggle('active');
            nav.classList.toggle('open');
            if (overlay) overlay.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', !isOpen);
            document.body.style.overflow = isOpen ? '' : 'hidden';
        }

        function close() {
            hamburger.classList.remove('active');
            nav.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }

        hamburger.addEventListener('click', toggle);
        if (overlay) overlay.addEventListener('click', close);

        nav.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', close);
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('open')) {
                close();
            }
        });
    }

    /* =====================================================
       REVEAL ANIMATIONS — GSAP ScrollTrigger
       ===================================================== */
    function initRevealAnimations() {
        if (prefersReducedMotion) {
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('revealed');
            });
            return;
        }

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            document.querySelectorAll('.reveal').forEach(function (el) {
                el.classList.add('revealed');
            });
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('.reveal').forEach(function (el, i) {
            gsap.fromTo(el,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 88%',
                        once: true,
                        onEnter: function () { el.classList.add('revealed'); }
                    },
                    delay: (i % 3) * 0.1
                }
            );
        });
    }

    /* =====================================================
       FORM — Validation Feedback
       ===================================================== */
    function initFormValidation() {
        var form = document.querySelector('form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var isValid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#c94444';
                    field.addEventListener('input', function handler() {
                        field.style.borderColor = '';
                        field.removeEventListener('input', handler);
                    });
                }
            });

            if (isValid) {
                var btn = form.querySelector('.btn-primary');
                var original = btn.textContent;
                btn.textContent = 'Receita adicionada!';
                btn.style.backgroundColor = '#5a9a6e';
                btn.disabled = true;

                setTimeout(function () {
                    btn.textContent = original;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                    form.reset();
                }, 2500);
            }
        });
    }

    /* =====================================================
       INIT
       ===================================================== */
    function init() {
        initLenis();
        initNavbar();
        initMobileMenu();
        initRevealAnimations();
        initFormValidation();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
