// Main JavaScript for Eslam Mohamed Portfolio

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                mobileMenu.classList.remove('hidden');
                menuIcon.setAttribute('data-lucide', 'x');
            } else {
                mobileMenu.classList.add('hidden');
                menuIcon.setAttribute('data-lucide', 'menu');
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });

        // Close menu on clicking mobile nav link
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                if (menuIcon) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            });
        });
    }

    // 3. Dynamic Footer Year
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // 4. Smooth Scroll Navigation Handler (Exact 80px Header Height Offset)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            const targetElement = document.querySelector(href);
            if (targetElement) {
                e.preventDefault();
                const headerHeight = 70;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. Scroll Active Link Highlighting (Scroll-Spy)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a[href^="#"]');

    function highlightActiveSection() {
        const scrollY = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const bodyHeight = document.body.offsetHeight;

        // Bottom-of-page check: If scrolled to the end of page, force activate #contact
        if (windowHeight + Math.ceil(scrollY) >= bodyHeight - 20) {
            navLinks.forEach(link => {
                link.classList.remove('text-indigo-400', 'font-bold', 'text-white');
                if (link.getAttribute('href') === '#contact') {
                    link.classList.add('text-indigo-400', 'font-bold');
                }
            });
            return;
        }

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('text-indigo-400', 'font-bold', 'text-white');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('text-indigo-400', 'font-bold');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveSection);

    // 5. Scroll Fade-in Observer Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-6');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatableElements = document.querySelectorAll('.group, .skill-tag, section h2, #experience .relative');
    animatableElements.forEach(el => {
        el.classList.add('transition-all', 'duration-500', 'opacity-0', 'translate-y-6');
        fadeObserver.observe(el);
    });

    // 6. Theme Toggle (Dark / Light Mode with Tsunami Wave Flood Reveal)
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
    const htmlEl = document.documentElement;

    function applyTheme(isDark) {
        if (isDark) {
            htmlEl.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlEl.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
        updateThemeIcons(isDark);
    }

    function updateThemeIcons(isDark) {
        const sunIcons = document.querySelectorAll('.theme-icon-sun');
        const moonIcons = document.querySelectorAll('.theme-icon-moon');
        sunIcons.forEach(ic => ic.classList.toggle('hidden', !isDark));
        moonIcons.forEach(ic => ic.classList.toggle('hidden', isDark));
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }

    function toggleThemeWithTsunami(e) {
        const isCurrentlyDark = htmlEl.classList.contains('dark');
        const nextThemeIsDark = !isCurrentlyDark;

        // Fallback for browsers without View Transitions API or reduced motion
        if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            applyTheme(nextThemeIsDark);
            return;
        }

        // Get click coordinates (x, y) or fallback to top-right corner
        const x = e ? e.clientX : window.innerWidth - 40;
        const y = e ? e.clientY : 40;

        // Calculate max radius needed to reach the farthest screen corner
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            applyTheme(nextThemeIsDark);
        });

        transition.ready.then(() => {
            document.documentElement.animate(
                {
                    clipPath: [
                        `circle(0px at ${x}px ${y}px)`,
                        `circle(${endRadius}px at ${x}px ${y}px)`
                    ]
                },
                {
                    duration: 500,
                    easing: 'ease-in-out',
                    pseudoElement: '::view-transition-new(root)'
                }
            );
        });
    }

    // Initialize saved theme preference or default to Dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(prefersDark);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', (e) => {
            toggleThemeWithTsunami(e);
        });
    }

    if (themeToggleMobileBtn) {
        themeToggleMobileBtn.addEventListener('click', (e) => {
            toggleThemeWithTsunami(e);
        });
    }

    // 7. Generic Project Carousel Controller (MENA & Aflami)
    function setupCarousel(carouselSelector, trackSelector, prevSelector, nextSelector, dotSelector) {
        const carousel = document.querySelector(carouselSelector);
        if (!carousel) return;
        const track = carousel.querySelector(trackSelector);
        const prevBtn = carousel.querySelector(prevSelector);
        const nextBtn = carousel.querySelector(nextSelector);
        const dots = carousel.querySelectorAll(dotSelector);
        let currentSlide = 0;
        const totalSlides = dots.length;

        function updateCarousel(index) {
            currentSlide = (index + totalSlides) % totalSlides;
            track.style.transform = `translateX(-${currentSlide * 100}%)`;
            dots.forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.className = `${dotSelector.replace('.', '')} w-2.5 h-2.5 rounded-full bg-indigo-400 transition-all`;
                } else {
                    dot.className = `${dotSelector.replace('.', '')} w-1.5 h-1.5 rounded-full bg-white/40 transition-all`;
                }
            });
        }

        if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateCarousel(currentSlide - 1); });
        if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateCarousel(currentSlide + 1); });
        dots.forEach((dot, i) => dot.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); updateCarousel(i); }));

        // Touch Swipe Gestures for Mobile
        let touchStartX = 0;
        let touchStartY = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    updateCarousel(currentSlide + 1);
                } else {
                    updateCarousel(currentSlide - 1);
                }
            }
        }, { passive: true });
    }

    setupCarousel('.mena-carousel', '.mena-track', '.mena-prev', '.mena-next', '.mena-dot');
    setupCarousel('.aflami-carousel', '.aflami-track', '.aflami-prev', '.aflami-next', '.aflami-dot');
    setupCarousel('.arabcare-carousel', '.arabcare-track', '.arabcare-prev', '.arabcare-next', '.arabcare-dot');
    setupCarousel('.almonqez-carousel', '.almonqez-track', '.almonqez-prev', '.almonqez-next', '.almonqez-dot');
    setupCarousel('.abah-carousel', '.abah-track', '.abah-prev', '.abah-next', '.abah-dot');
    setupCarousel('.highness-carousel', '.highness-track', '.highness-prev', '.highness-next', '.highness-dot');

    // 8. Full-Screen Image Lightbox Viewer with Carousel Support
    const lightbox = document.getElementById('image-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');

    let lightboxImages = [];
    let currentLightboxIndex = 0;

    function updateLightbox(index) {
        if (lightboxImages.length === 0) return;
        currentLightboxIndex = (index + lightboxImages.length) % lightboxImages.length;
        const currentImg = lightboxImages[currentLightboxIndex];

        // 1. Fade out current image
        lightboxImg.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
        lightboxImg.style.opacity = '0';
        lightboxImg.style.transform = 'scale(0.97)';

        // 2. Swap src and fade back in
        setTimeout(() => {
            lightboxImg.src = currentImg.src;
            lightboxImg.alt = currentImg.alt || 'Full View Showcase';
            if (lightboxCaption) lightboxCaption.textContent = currentImg.alt || '';
            if (lightboxCounter) {
                lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${lightboxImages.length}`;
                lightboxCounter.classList.toggle('hidden', lightboxImages.length <= 1);
            }
            if (lightboxPrev) lightboxPrev.classList.toggle('hidden', lightboxImages.length <= 1);
            if (lightboxNext) lightboxNext.classList.toggle('hidden', lightboxImages.length <= 1);

            lightboxImg.style.opacity = '1';
            lightboxImg.style.transform = 'scale(1)';
        }, 150);
    }

    if (lightbox && lightboxImg) {
        document.querySelectorAll('.mena-track img, .aflami-track img, .arabcare-track img, .almonqez-track img, .abah-track img, .highness-track img, #projects img, #about img').forEach(img => {
            // Ignore logo icons or explicitly excluded images
            if (img.src.includes('thechance') || img.classList.contains('no-lightbox')) return;

            img.classList.add('cursor-pointer');
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                // Determine image set (if inside a carousel, grab all sibling carousel images)
                const carouselTrack = img.closest('.mena-track, .aflami-track, .arabcare-track, .almonqez-track, .abah-track, .highness-track, .carousel-track');
                if (carouselTrack) {
                    lightboxImages = Array.from(carouselTrack.querySelectorAll('img'));
                } else {
                    lightboxImages = [img];
                }
                const index = lightboxImages.indexOf(img);
                updateLightbox(index >= 0 ? index : 0);
                lightbox.classList.remove('hidden');
                lightbox.classList.add('flex');
                document.body.classList.add('overflow-hidden');
            });
        });

        const closeLightbox = () => {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
            document.body.classList.remove('overflow-hidden');
        };

        if (lightboxClose) lightboxClose.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });
        if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentLightboxIndex - 1); });
        if (lightboxNext) lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); updateLightbox(currentLightboxIndex + 1); });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });

        document.addEventListener('keydown', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') updateLightbox(currentLightboxIndex - 1);
            if (e.key === 'ArrowRight') updateLightbox(currentLightboxIndex + 1);
        });

        // Touch Swipe Gestures for Lightbox Modal
        let lbTouchStartX = 0;
        let lbTouchStartY = 0;

        lightbox.addEventListener('touchstart', (e) => {
            lbTouchStartX = e.changedTouches[0].screenX;
            lbTouchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            if (lightbox.classList.contains('hidden')) return;
            const lbTouchEndX = e.changedTouches[0].screenX;
            const lbTouchEndY = e.changedTouches[0].screenY;
            const deltaX = lbTouchEndX - lbTouchStartX;
            const deltaY = lbTouchEndY - lbTouchStartY;

            if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX < 0) {
                    updateLightbox(currentLightboxIndex + 1);
                } else {
                    updateLightbox(currentLightboxIndex - 1);
                }
            }
        }, { passive: true });
    }

    // 9. Floating Back to Top Button Controller
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
            }
        });
    }

    // 10. Interactive Projects Technology Filter Engine (Flicker-Free)
    const filterBtns = document.querySelectorAll('.project-filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (filterBtns.length > 0 && projectCards.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');

                // Update active state on buttons
                filterBtns.forEach(b => {
                    b.classList.remove('bg-indigo-600', '!text-white', 'shadow-lg', 'shadow-indigo-500/25', 'border-indigo-500');
                    b.classList.add('bg-slate-900', 'border-slate-800', 'text-slate-300');
                });
                btn.classList.add('bg-indigo-600', '!text-white', 'shadow-lg', 'shadow-indigo-500/25', 'border-indigo-500');
                btn.classList.remove('bg-slate-900', 'border-slate-800', 'text-slate-300');

                // Instant flicker-free filtering without layout jumps
                projectCards.forEach(card => {
                    const categories = card.getAttribute('data-category') || '';
                    const isMatch = filter === 'all' || categories.split(' ').includes(filter);

                    if (isMatch) {
                        card.classList.remove('is-filtered-out');
                    } else {
                        card.classList.add('is-filtered-out');
                    }
                });
            });
        });
    }
});
