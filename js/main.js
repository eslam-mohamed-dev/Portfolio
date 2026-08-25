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

    // 6. Theme Toggle (Dark / Light Mode)
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

    // Initialize saved theme preference or default to Dark mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = savedTheme ? savedTheme === 'dark' : true;
    applyTheme(prefersDark);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isCurrentlyDark = htmlEl.classList.contains('dark');
            applyTheme(!isCurrentlyDark);
        });
    }

    if (themeToggleMobileBtn) {
        themeToggleMobileBtn.addEventListener('click', () => {
            const isCurrentlyDark = htmlEl.classList.contains('dark');
            applyTheme(!isCurrentlyDark);
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
    }

    setupCarousel('.mena-carousel', '.mena-track', '.mena-prev', '.mena-next', '.mena-dot');
    setupCarousel('.aflami-carousel', '.aflami-track', '.aflami-prev', '.aflami-next', '.aflami-dot');
    setupCarousel('.arabcare-carousel', '.arabcare-track', '.arabcare-prev', '.arabcare-next', '.arabcare-dot');

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
        document.querySelectorAll('.mena-track img, .aflami-track img, .arabcare-track img, #projects img, #about img').forEach(img => {
            img.classList.add('cursor-pointer');
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                // Determine image set (if inside a carousel, grab all sibling carousel images)
                const carouselTrack = img.closest('.mena-track, .aflami-track, .arabcare-track, .carousel-track');
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
    }
});
