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
        let isHorizontalSwipe = false;

        carousel.addEventListener('touchstart', (e) => {
            if (!e.touches.length) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isHorizontalSwipe = false;
        }, { passive: true });

        carousel.addEventListener('touchmove', (e) => {
            if (!e.touches.length) return;
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;

            // Lock vertical scrolling if user is intentionally swiping horizontally (> 8px)
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
                isHorizontalSwipe = true;
                if (e.cancelable) {
                    e.preventDefault();
                }
            }
        }, { passive: false });

        carousel.addEventListener('touchend', (e) => {
            if (!isHorizontalSwipe) return;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;

            if (Math.abs(deltaX) > 30) {
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

    // Global Flag Tracking Navigation From Mobile App Grid Icons
    let jumpedFromPhone = false;

    // 9. Floating Back to Top Button Controller (Smart 2-Stage Navigation)
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 400) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
                backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
                // Reset flag when scrolled back up near top
                jumpedFromPhone = false;
            }
        });

        backToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (jumpedFromPhone) {
                // Stage 1: Scroll back to the Mobile Device in Hero section
                const phoneEl = document.getElementById('phone-screen-container') || document.getElementById('phone-mode-toggle');
                if (phoneEl) {
                    phoneEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Reset flag so subsequent click scrolls to top of page
                jumpedFromPhone = false;
            } else {
                // Stage 2: Scroll all the way to top of page
                window.scrollTo({ top: 0, behavior: 'smooth' });
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

    // 11. Hero Right Column Interactive CRT Smartphone State Engine
    const phoneScreenContainer = document.getElementById('phone-screen-container');
    const phoneScreenCode = document.getElementById('phone-screen-code');
    const phoneScreenOs = document.getElementById('phone-screen-os');
    const phoneModeToggle = document.getElementById('phone-mode-toggle');
    const phoneModeLabel = document.getElementById('phone-mode-label');
    const codeTyperContainer = document.getElementById('hero-code-typer');

    if (phoneScreenContainer && codeTyperContainer) {
        let currentMode = 'code'; // 'code' or 'os'
        let isTransitioning = false;
        let activeLineDiv = null;
        let osTimer = null;
        let typewriterTimeout = null;

        const codeStructure = [
            { indent: 0, tokens: [
                { text: 'object ', class: 'text-purple-400 font-bold' },
                { text: 'EslamMohamed ', class: 'text-indigo-300 font-bold' },
                { text: ': ', class: 'text-slate-400' },
                { text: 'MobileDeveloper ', class: 'text-emerald-400 font-bold' },
                { text: '{', class: 'text-slate-200' }
            ]},
            { indent: 1, tokens: [
                { text: 'val ', class: 'text-purple-400' },
                { text: 'primaryStack ', class: 'text-slate-200' },
                { text: '= ', class: 'text-slate-400' },
                { text: 'listOf', class: 'text-sky-400' },
                { text: '(', class: 'text-slate-300' },
                { text: '"Flutter"', class: 'text-emerald-300' },
                { text: ', ', class: 'text-slate-400' },
                { text: '"Kotlin CMP"', class: 'text-emerald-300' },
                { text: ')', class: 'text-slate-300' }
            ]},
            { indent: 1, tokens: [
                { text: 'val ', class: 'text-purple-400' },
                { text: 'architecture ', class: 'text-slate-200' },
                { text: '= ', class: 'text-slate-400' },
                { text: 'CleanArchitecture ', class: 'text-indigo-300' },
                { text: '+ ', class: 'text-purple-400' },
                { text: 'MVVM', class: 'text-indigo-300' }
            ]},
            { indent: 1, tokens: [
                { text: 'val ', class: 'text-purple-400' },
                { text: 'performanceBoost ', class: 'text-slate-200' },
                { text: '= ', class: 'text-slate-400' },
                { text: '70.percent', class: 'text-emerald-400 font-bold' }
            ]},
            { indent: 0, tokens: [] },
            { indent: 1, tokens: [
                { text: 'fun ', class: 'text-purple-400' },
                { text: 'buildProducts', class: 'text-sky-400' },
                { text: '() ', class: 'text-slate-300' },
                { text: '= ', class: 'text-slate-400' },
                { text: 'Deliver', class: 'text-indigo-300' },
                { text: '(', class: 'text-slate-300' }
            ]},
            { indent: 2, tokens: [
                { text: 'activeUsers ', class: 'text-slate-300' },
                { text: '= ', class: 'text-slate-400' },
                { text: '25000', class: 'text-amber-400 font-bold' },
                { text: ',', class: 'text-slate-400' }
            ]},
            { indent: 2, tokens: [
                { text: 'stability ', class: 'text-slate-300' },
                { text: '= ', class: 'text-slate-400' },
                { text: '99.9.percent', class: 'text-emerald-400 font-bold' }
            ]},
            { indent: 1, tokens: [{ text: ')', class: 'text-slate-300' }] },
            { indent: 0, tokens: [{ text: '}', class: 'text-slate-200' }] }
        ];

        // CRT Screen State Switcher
        function triggerCrtSwitch(targetMode) {
            if (isTransitioning) return;
            isTransitioning = true;
            if (osTimer) clearTimeout(osTimer);
            if (typewriterTimeout) clearTimeout(typewriterTimeout);

            // Phase 1: CRT Power Off Flash & Collapse
            phoneScreenContainer.classList.remove('crt-on');
            phoneScreenContainer.classList.add('crt-off');

            setTimeout(() => {
                // Phase 2: Switch Screen View
                currentMode = targetMode;
                if (targetMode === 'os') {
                    if (phoneScreenCode) phoneScreenCode.classList.add('hidden');
                    if (phoneScreenOs) phoneScreenOs.classList.remove('hidden');
                    if (phoneModeLabel) phoneModeLabel.textContent = '📱 Mobile OS';
                    // Remains open on Mobile OS permanently (no auto return to code)
                } else {
                    if (phoneScreenOs) phoneScreenOs.classList.add('hidden');
                    if (phoneScreenCode) phoneScreenCode.classList.remove('hidden');
                    if (phoneModeLabel) phoneModeLabel.textContent = '💻 Code Mode';
                    startCharacterTypewriter();
                }

                // Phase 3: CRT Power On Flash & Expand
                phoneScreenContainer.classList.remove('crt-off');
                phoneScreenContainer.classList.add('crt-on');

                setTimeout(() => {
                    phoneScreenContainer.classList.remove('crt-on');
                    isTransitioning = false;
                }, 450);
            }, 450);
        }

        // Typewriter Engine
        function startCharacterTypewriter() {
            codeTyperContainer.innerHTML = '';
            let lineIdx = 0;
            activeLineDiv = null;

            function processLine() {
                if (currentMode !== 'code') return;

                if (lineIdx >= codeStructure.length) {
                    if (activeLineDiv) activeLineDiv.classList.remove('bg-indigo-500/10');
                    activeLineDiv = null;

                    // Show final build success line
                    const successDiv = document.createElement('div');
                    successDiv.className = 'font-mono text-indigo-400 font-bold animate-pulse pt-1 flex items-center gap-1.5';
                    successDiv.innerHTML = '<span class="text-emerald-400">✓</span> <span class="text-slate-400">Build Successful</span> <span class="w-1.5 h-3.5 bg-indigo-400 inline-block animate-ping"></span>';
                    codeTyperContainer.appendChild(successDiv);

                    // Pause 2 seconds then trigger CRT switch to Mobile OS screen
                    typewriterTimeout = setTimeout(() => {
                        triggerCrtSwitch('os');
                    }, 2200);
                    return;
                }

                if (activeLineDiv) activeLineDiv.classList.remove('bg-indigo-500/10');

                const lineData = codeStructure[lineIdx];
                const lineDiv = document.createElement('div');
                activeLineDiv = lineDiv;
                
                const indentClass = lineData.indent === 2 ? 'pl-8' : (lineData.indent === 1 ? 'pl-4' : 'pl-0');
                lineDiv.className = `font-mono text-slate-300 whitespace-pre-wrap rounded px-1 transition-colors duration-200 bg-indigo-500/10 ${indentClass}`;
                codeTyperContainer.appendChild(lineDiv);

                if (lineData.tokens.length === 0) {
                    lineDiv.innerHTML = '&nbsp;';
                    lineIdx++;
                    typewriterTimeout = setTimeout(processLine, 40);
                    return;
                }

                let tokenIdx = 0;
                let charIdx = 0;
                let currentTokenSpan = null;

                function typeChar() {
                    if (currentMode !== 'code') return;

                    if (tokenIdx >= lineData.tokens.length) {
                        lineIdx++;
                        const isClosingLine = lineData.tokens.length === 1 && lineData.tokens[0].text.length === 1;
                        const lineDelay = isClosingLine ? 160 : 50;
                        typewriterTimeout = setTimeout(processLine, lineDelay);
                        return;
                    }

                    const currentToken = lineData.tokens[tokenIdx];
                    
                    if (charIdx === 0) {
                        currentTokenSpan = document.createElement('span');
                        currentTokenSpan.className = currentToken.class || 'text-slate-300';
                        lineDiv.appendChild(currentTokenSpan);
                    }

                    const ch = currentToken.text[charIdx];
                    const charSpan = document.createElement('span');
                    charSpan.className = 'char-type-glow';
                    charSpan.textContent = ch;
                    currentTokenSpan.appendChild(charSpan);

                    charIdx++;

                    if (charIdx >= currentToken.text.length) {
                        tokenIdx++;
                        charIdx = 0;
                    }

                    typewriterTimeout = setTimeout(typeChar, Math.floor(Math.random() * 4) + 2);
                }

                typeChar();
            }

            processLine();
        }

        // Manual Mode Switcher Pill Toggle
        if (phoneModeToggle) {
            phoneModeToggle.addEventListener('click', () => {
                const nextMode = currentMode === 'code' ? 'os' : 'code';
                triggerCrtSwitch(nextMode);
            });
        }

        // Clickable App Grid Icon Navigation to Project Cards
        const appJumpButtons = document.querySelectorAll('[data-app-jump]');
        appJumpButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = btn.getAttribute('data-app-jump');
                const targetCard = document.getElementById(targetId);

                if (targetCard) {
                    // Flag that navigation originated from mobile app icon
                    jumpedFromPhone = true;

                    // Smooth Scroll to top of target project card
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    // Highlight Project Card with glowing ring aura
                    targetCard.classList.add('ring-2', 'ring-indigo-500', 'shadow-2xl', 'shadow-indigo-500/50');
                    setTimeout(() => {
                        targetCard.classList.remove('ring-2', 'ring-indigo-500', 'shadow-2xl', 'shadow-indigo-500/50');
                    }, 2500);
                }
            });
        });

        // Live Real System Clock Tracker for Phone Emulator (System 12h/24h + 2-digit padded 00:00)
        function updatePhoneStatusClock() {
            const clockEl = document.getElementById('phone-status-clock');
            if (!clockEl) return;
            const now = new Date();
            
            // Format using system locale (respects 12h / 24h system setting)
            const options = { hour: '2-digit', minute: '2-digit' };
            let timeStr = now.toLocaleTimeString([], options);
            
            // Remove AM/PM text if present in locale output to keep clean status bar time
            timeStr = timeStr.replace(/\s?[AP]M/i, '').trim();
            
            clockEl.textContent = timeStr;
        }
        updatePhoneStatusClock();
        setInterval(updatePhoneStatusClock, 1000);

        // Start Initial Code Mode
        startCharacterTypewriter();
    }
});
