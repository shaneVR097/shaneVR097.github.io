document.addEventListener('DOMContentLoaded', function() {

    // --- THEME TOGGLE ---
    const themeToggleButton = document.getElementById('theme-toggle');
    const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    // Priority: 1. localStorage, 2. OS preference, 3. Default to light
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = prefersDarkScheme.matches ? 'dark-mode' : 'light-mode';
    }

    function applyTheme(theme) {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme);
        if (themeToggleButton) {
            themeToggleButton.setAttribute('aria-pressed', theme === 'dark-mode');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn("Could not save theme to localStorage:", e);
        }
    }

    applyTheme(currentTheme); // Apply initial theme

    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            let newTheme = document.body.classList.contains('dark-mode') ? 'light-mode' : 'dark-mode';
            applyTheme(newTheme);
        });
    }

    // Listen for OS theme changes if no manual theme is set
    if (prefersDarkScheme) {
        prefersDarkScheme.addEventListener('change', e => {
            // Only update if user hasn't manually set a theme via localStorage
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark-mode' : 'light-mode';
                applyTheme(newTheme);
            }
        });
    }


    // --- PRELOADER ---
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 500); 
            setTimeout(() => { 
                if (preloader.parentNode) {
                    preloader.parentNode.removeChild(preloader);
                }
            }, 1500); 
        });
    }

    // --- AGE CALCULATION ---
    const ageDisplay = document.getElementById('ageDisplay');
    if (ageDisplay) {
        try {
            const birthDate = new Date(2004, 2, 31); // Month is 0-indexed (2 = March)
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            ageDisplay.textContent = age;
        } catch (e) {
            console.error("Error calculating age:", e);
            ageDisplay.textContent = "N/A";
        }
    }

    // --- SMOOTH SCROLLING & ACTIVE NAV LINK ---
    const navLinks = document.querySelectorAll('.nav-menu a');
    const sections = document.querySelectorAll('main section[id]'); // Ensure sections have IDs
    const headerElement = document.querySelector('.site-header');
    const mobileMenuToggle = document.querySelector('.menu-toggle'); // For closing mobile menu

    if (navLinks.length && sections.length && headerElement) {
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                if (!targetId || !targetId.startsWith("#") || targetId === "#") return;
                
                e.preventDefault();
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerOffset = headerElement.offsetHeight;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }

                // Close mobile menu if active
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu && navMenu.classList.contains('active') && mobileMenuToggle) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    const icon = mobileMenuToggle.querySelector('i');
                    if (icon) {
                        icon.classList.replace('fa-times', 'fa-bars');
                    }
                }
            });
        });
    
        function updateActiveNavLink() {
            let currentSectionId = '';
            const headerHeight = headerElement.offsetHeight;
            // Adjust scroll position check to be more forgiving
            // Trigger when section top is within a range from header bottom
            const scrollThreshold = window.innerHeight / 2; 

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                // More robust check: if current scroll position is within the section,
                // or if the section top is close to the top of the viewport.
                // Prioritize sections that are more "in view".
                if (window.pageYOffset >= sectionTop - scrollThreshold / 2 && window.pageYOffset < sectionBottom - scrollThreshold / 2) {
                     currentSectionId = section.getAttribute('id');
                }
            });
            
            // If no section is actively "in the middle", highlight the one closest to top
            if (!currentSectionId && sections.length > 0) {
                 let minDistance = Infinity;
                 sections.forEach(section => {
                     const distance = Math.abs((section.offsetTop - headerHeight) - window.pageYOffset);
                     if (distance < minDistance) {
                         minDistance = distance;
                         currentSectionId = section.getAttribute('id');
                     }
                 });
            }


            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.substring(1) === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveNavLink);
        window.addEventListener('resize', updateActiveNavLink); // Recalculate on resize
        updateActiveNavLink(); // Initial call
    }


    // --- STICKY HEADER BEHAVIOR ---
    if (headerElement) {
        let lastScrollTop = 0;
        window.addEventListener('scroll', () => {
            let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            if (scrollTop > 80) { 
                headerElement.classList.add('scrolled');
            } else {
                headerElement.classList.remove('scrolled');
            }

            // Hide header on scroll down, show on scroll up (for larger screens)
            if (window.innerWidth > 768) { 
                if (scrollTop > lastScrollTop && scrollTop > headerElement.offsetHeight * 2) { 
                    // Scrolling Down
                    headerElement.style.top = `-${headerElement.offsetHeight + 20}px`; // +20 for a bit more clearance
                } else { 
                    // Scrolling Up or at top
                    headerElement.style.top = '0';
                }
            } else {
                 headerElement.style.top = '0'; // Always visible on mobile
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        });
    }
    
    // --- SCROLL TO TOP BUTTON VISIBILITY ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                if (scrollToTopBtn.style.display !== 'flex') { // Check to avoid redundant style changes
                    scrollToTopBtn.style.display = 'flex'; 
                    setTimeout(() => scrollToTopBtn.style.opacity = '1', 10); // Slight delay for display then opacity
                }
            } else {
                if (scrollToTopBtn.style.opacity === '1') { // Check to avoid redundant style changes
                    scrollToTopBtn.style.opacity = '0';
                    setTimeout(() => { 
                        if(scrollToTopBtn.style.opacity === '0') scrollToTopBtn.style.display = 'none';
                    }, 300); // Match CSS transition duration
                }
            }
        });
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const staggerContainers = document.querySelectorAll('.stagger-children');
    let animationObserverInstance; 

    if (typeof IntersectionObserver !== 'undefined') {
        const observerCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    
                    if (entry.target.classList.contains('stagger-children')) {
                        const children = entry.target.querySelectorAll('.stagger-item');
                        children.forEach((child, index) => {
                            child.style.transitionDelay = `${index * 0.12}s`; // Stagger delay
                            child.classList.add('is-visible'); // Animate children
                        });
                    }
                     observer.unobserve(entry.target); // Animate only once
                } 
            });
        };
        animationObserverInstance = new IntersectionObserver(observerCallback, {
            rootMargin: '0px 0px -100px 0px', // Trigger when element is 100px from bottom of viewport
            threshold: 0.1 
        });
        animatedElements.forEach(el => animationObserverInstance.observe(el));
        staggerContainers.forEach(el => animationObserverInstance.observe(el)); // Observe stagger containers themselves
    } else { // Fallback for no IntersectionObserver
        console.warn("IntersectionObserver not supported. Animations will show immediately.");
        animatedElements.forEach(el => el.classList.add('is-visible'));
        staggerContainers.forEach(el => {
            el.classList.add('is-visible');
            const children = el.querySelectorAll('.stagger-item');
            children.forEach(child => child.classList.add('is-visible'));
        });
    }

    // --- HERO H1 CHARACTER ANIMATION ---
    const heroH1 = document.querySelector('.hero-section h1.animate-on-scroll-parent');
    if (heroH1) {
        const chars = heroH1.querySelectorAll('.char-animate');
        if (chars.length > 0 && typeof IntersectionObserver !== 'undefined') {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        chars.forEach((char, index) => {
                            setTimeout(() => {
                                char.style.opacity = '1';
                                char.style.transform = 'translateY(0) rotate(0deg)';
                            }, index * 55); // Slightly adjusted delay
                        });
                        heroObserver.unobserve(entry.target); 
                    }
                });
            }, { threshold: 0.4 }); // Trigger when 40% of H1 is visible
            heroObserver.observe(heroH1);
        } else if (chars.length > 0) { // Fallback for no IntersectionObserver
            chars.forEach(char => {
                char.style.opacity = '1';
                char.style.transform = 'translateY(0) rotate(0deg)';
            });
        }
    }

    // --- TABS FUNCTIONALITY ---
    const tabLinksNodeList = document.querySelectorAll('.tab-link');
    const tabContentsNodeList = document.querySelectorAll('.tab-content');

    if (tabLinksNodeList.length && tabContentsNodeList.length) {
        // Make openTab globally accessible if called from HTML onclick
        window.openTab = function(event, tabName) { 
            tabContentsNodeList.forEach(content => content.classList.remove('active'));
            tabLinksNodeList.forEach(link => link.classList.remove('active'));

            const tabToActivate = document.getElementById(tabName);
            if (tabToActivate) {
                tabToActivate.classList.add('active');
                // Re-initialize Slick carousels within the newly active tab
                if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
                    $(tabToActivate).find('.project-image-album-slider, .achievement-image-album').slick('setPosition');
                }
                
                // Ensure elements in newly active tab get animated if they haven't yet
                if (typeof IntersectionObserver !== 'undefined' && animationObserverInstance) {
                    const newlyVisibleAnimatedElements = tabToActivate.querySelectorAll('.animate-on-scroll:not(.is-visible), .stagger-children:not(.is-visible)');
                    newlyVisibleAnimatedElements.forEach(el => {
                        animationObserverInstance.observe(el);   
                    });
                }
            }
            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }
        }

        // Activate the first tab by default or the one marked 'active' in HTML
        let activeTabFound = false;
        tabLinksNodeList.forEach(link => {
            if (link.classList.contains('active')) {
                activeTabFound = true;
                const onclickAttr = link.getAttribute('onclick');
                if (onclickAttr) {
                    const activeTabIdMatch = onclickAttr.match(/'([^']+)'/);
                    if (activeTabIdMatch && activeTabIdMatch[1]) {
                         // Call openTab with a mock event if needed, or just set content active
                         openTab({ currentTarget: link }, activeTabIdMatch[1]);
                    }
                }
            }
        });
        if (!activeTabFound && tabLinksNodeList[0]) {
             tabLinksNodeList[0].click(); // Simulate click to trigger openTab
        }
    }

    // --- COPYRIGHT YEAR ---
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- MOBILE MENU TOGGLE ---
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const isActive = navMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (isActive) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }
    
    // --- JQUERY DEPENDENT INITIALIZATIONS ---
    if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
        $('.project-image-album-slider, .achievement-image-album').each(function() {
            const $slider = $(this);
            if ($slider.hasClass('slick-initialized')) { // Avoid re-initializing
                $slider.slick('setPosition'); // Just reposition if already initialized (e.g., in tabs)
                return;
            }

            const isProjectAlbum = $slider.hasClass('project-image-album-slider');
            const $captionContainer = isProjectAlbum ? $slider.closest('.project-card').find('.project-image-caption') : null;
            const $titleOverlay = $captionContainer ? $captionContainer.find('.image-title-overlay') : null;
            const $subtextOverlay = $captionContainer ? $captionContainer.find('.image-subtext-overlay') : null;

            let slickOptions = {
                dots: true,
                arrows: false, // Using Lightbox for nav often, or custom arrows if added
                infinite: $slider.children('div:not(.youtube-placeholder)').length > 1,
                speed: 500, 
                slidesToShow: 1,
                slidesToScroll: 1,
                fade: true, 
                cssEase: 'cubic-bezier(0.65, 0.05, 0.36, 1)', // Smooth fade
                adaptiveHeight: false, 
                autoplay: false, // Controlled by hover
                lazyLoad: 'ondemand' // Good for performance
            };
            
            $slider.slick(slickOptions);

            if (isProjectAlbum && $captionContainer && $titleOverlay && $subtextOverlay) { 
                function updateCaption($currentSlide) {
                    if (!$currentSlide || $currentSlide.length === 0) return;
                    
                    const $anchor = $currentSlide.children('a').first(); 
                    const $imgOrPlaceholder = $anchor.length ? $anchor.children().first() : $currentSlide.children().first(); 
                    
                    let title = '', subtext = '';
                    let showCaption = false;

                    if ($imgOrPlaceholder.is('img') && $imgOrPlaceholder.data('title')) {
                        title = $imgOrPlaceholder.data('title');
                        subtext = $imgOrPlaceholder.data('subtext') || '';
                        showCaption = true;
                    } else if ($imgOrPlaceholder.hasClass('youtube-placeholder')) {
                        title = 'Project Demo'; 
                        subtext = 'Click to watch on YouTube';
                        showCaption = true;
                    }
                    
                    $titleOverlay.text(title);
                    $subtextOverlay.text(subtext);
                    $captionContainer.css('opacity', showCaption ? 1 : 0);
                }
                
                // Initial caption update
                setTimeout(() => { 
                     const currentSlickSlide = $slider.find('.slick-current');
                     if (currentSlickSlide.length) updateCaption(currentSlickSlide);
                }, 150); // Ensure slick is fully initialized

                // Update caption on slide change
                $slider.on('afterChange', function(event, slick, currentSlideIndex){
                    const $currentSlideElement = $(slick.$slides[currentSlideIndex]);
                    updateCaption($currentSlideElement);
                });
            }
            
            // Auto-scroll on hover for sliders with this class
            if ($slider.hasClass('auto-scroll-hover')) {
                let slickInstance = $slider.slick('getSlick');
                if (slickInstance && slickInstance.slideCount > 1) {
                    $slider.on('mouseenter', function() {
                       $(this).slick('slickSetOption', 'autoplay', true, false); 
                       $(this).slick('slickSetOption', 'autoplaySpeed', 2800, true); // Slightly slower speed
                    }).on('mouseleave', function() {
                        $(this).slick('slickPause');
                        $(this).slick('slickSetOption', 'autoplay', false, true);
                    });
                }
            }

            // YouTube placeholder click logic
            $slider.find('.youtube-placeholder').on('click', function() {
                const videoId = $(this).data('youtube-id');
                const placeholderVideoIds = [ // Keep this as per your HTML if these are specific placeholders
                    "YOUR_YOUTUBE_VIDEO_ID_HERE", "VIDEO_ID_V2X",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_WOR_AUTO",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_MAGLOCK",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_HRM",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_PIZZA",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_GUESS",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_CALC",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_WOR_HW",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_FIRE",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_PLASTIC",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_STRESS"
                ]; // Consider a simpler placeholder like "YOUTUBE_PLACEHOLDER" if possible

                if (videoId && videoId.trim() !== "" && !placeholderVideoIds.includes(videoId.toUpperCase())) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank', 'noopener,noreferrer');
                } else if (videoId) { 
                    // Fallback: try to open the first image of the album in lightbox if it's a placeholder
                    const firstImageLink = $(this).closest('.slick-slider').find('.slick-slide:not(.slick-cloned) a[data-lightbox]').first();
                    if (firstImageLink.length) {
                        firstImageLink.trigger('click'); // Simulate click to open Lightbox
                    } else {
                        // A more user-friendly notification could be a custom modal
                        alert("Video demo is not yet available for this project, and no images are configured for enlargement.");
                    }
                }
            });
        });
        
        // Lightbox Initialization (global)
        if (typeof lightbox !== 'undefined') {
            lightbox.option({
              'resizeDuration': 280,
              'wrapAround': true,
              'fadeDuration': 380,
              'imageFadeDuration': 380,
              'alwaysShowNavOnTouchDevices': true,
              'disableScrolling': true, // Helps prevent background scroll issues
              'albumLabel': "Image %1 of %2"
            });
        }

    } else {
        console.error("jQuery or Slick Carousel is not loaded. Some features will not work.");
    }

}); // End DOMContentLoaded
