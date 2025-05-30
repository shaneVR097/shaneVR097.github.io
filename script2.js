//**`script2.js` (No changes needed from the previous full `script2.js` if only achievements HTML/CSS changed. Re-pasting for completeness, assuming project albums are still desired).**
document.addEventListener('DOMContentLoaded', function() {

    // --- PRELOADER ---
    const preloader = document.querySelector('.preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('loaded');
            }, 500); 
            setTimeout(() => { 
                if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
            }, 1500); 
        });
    }

    // --- AGE CALCULATION ---
    const ageDisplay = document.getElementById('ageDisplay');
    if (ageDisplay) {
        try {
            const birthDate = new Date(2004, 2, 31); // Month is 0-indexed (0 for Jan, 2 for Mar)
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
    const sections = document.querySelectorAll('main section');
    const headerElement = document.querySelector('.site-header');

    if (navLinks.length && sections.length && headerElement) {
        navLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === "#") return;
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
                const navMenu = document.querySelector('.nav-menu');
                const menuToggleIcon = document.querySelector('.menu-toggle i');
                if (navMenu && navMenu.classList.contains('active') && menuToggleIcon) {
                    navMenu.classList.remove('active');
                    menuToggleIcon.classList.replace('fa-times', 'fa-bars');
                }
            });
        });
    
        function updateActiveNavLink() {
            let currentSectionId = '';
            const headerHeight = headerElement.offsetHeight;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 80; // Increased offset
                if (window.pageYOffset >= sectionTop) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href && href.substring(1) === currentSectionId) {
                    link.classList.add('active');
                }
            });
        }
        window.addEventListener('scroll', updateActiveNavLink);
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
            if (window.innerWidth > 768) { 
                if (scrollTop > lastScrollTop && scrollTop > headerElement.offsetHeight * 2) { 
                    headerElement.style.top = `-${headerElement.offsetHeight + 15}px`;
                } else { 
                    headerElement.style.top = '0';
                }
            } else {
                 headerElement.style.top = '0'; 
            }
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; 
        });
    }
    
    // --- SCROLL TO TOP BUTTON VISIBILITY ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
                scrollToTopBtn.style.display = 'flex'; 
                setTimeout(() => scrollToTopBtn.style.opacity = '1', 10);
            } else {
                scrollToTopBtn.style.opacity = '0';
                setTimeout(() => { if(scrollToTopBtn.style.opacity === '0') scrollToTopBtn.style.display = 'none';}, 300);
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
                            child.style.transitionDelay = `${index * 0.10}s`;
                            child.classList.add('is-visible');
                        });
                    }
                } else {
                    entry.target.classList.remove('is-visible');
                    if (entry.target.classList.contains('stagger-children')) {
                        const children = entry.target.querySelectorAll('.stagger-item');
                        children.forEach((child) => {
                            child.classList.remove('is-visible');
                            child.style.transitionDelay = `0s`; 
                        });
                    }
                }
            });
        };
        animationObserverInstance = new IntersectionObserver(observerCallback, {
            rootMargin: '0px 0px -50px 0px', 
            threshold: 0.05
        });
        animatedElements.forEach(el => animationObserverInstance.observe(el));
        staggerContainers.forEach(el => animationObserverInstance.observe(el));
    } else {
        animatedElements.forEach(el => el.classList.add('is-visible'));
        staggerContainers.forEach(el => {
            el.classList.add('is-visible');
            const children = el.querySelectorAll('.stagger-item');
            children.forEach(child => child.classList.add('is-visible'));
        });
    }

    // --- HERO H1 CHARACTER ANIMATION ---
    const heroH1 = document.querySelector('.hero-section h1');
    if (heroH1 && heroH1.classList.contains('animate-on-scroll-parent')) {
        const chars = heroH1.querySelectorAll('.char-animate');
        if (typeof IntersectionObserver !== 'undefined') {
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        chars.forEach((char, index) => {
                            setTimeout(() => {
                                char.style.opacity = '1';
                                char.style.transform = 'translateY(0) rotate(0deg)';
                            }, index * 55); 
                        });
                        heroObserver.unobserve(entry.target); 
                    }
                });
            }, { threshold: 0.3 });
            heroObserver.observe(heroH1);
        } else { 
            chars.forEach(char => {
                char.style.opacity = '1';
                char.style.transform = 'translateY(0) rotate(0deg)';
            });
        }
    }

    // --- TABS FUNCTIONALITY ---
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabLinks.length && tabContents.length) {
        window.openTab = function(event, tabName) { 
            tabContents.forEach(content => content.classList.remove('active'));
            tabLinks.forEach(link => link.classList.remove('active'));

            const tabToActivate = document.getElementById(tabName);
            if (tabToActivate) {
                tabToActivate.classList.add('active');
                $(tabToActivate).find('.project-image-album-slider').slick('setPosition');
                
                if (typeof IntersectionObserver !== 'undefined' && animationObserverInstance) {
                    const newlyVisibleAnimatedElements = tabToActivate.querySelectorAll('.animate-on-scroll, .stagger-children');
                    newlyVisibleAnimatedElements.forEach(el => {
                        animationObserverInstance.unobserve(el); 
                        animationObserverInstance.observe(el);   
                    });
                }
            }
            if (event && event.currentTarget) {
                event.currentTarget.classList.add('active');
            }
        }

        let activeTabFound = false;
        tabLinks.forEach(link => {
            if (link.classList.contains('active')) {
                activeTabFound = true;
                const onclickAttr = link.getAttribute('onclick');
                if (onclickAttr) {
                    const activeTabIdMatch = onclickAttr.match(/'([^']+)'/);
                    if (activeTabIdMatch && activeTabIdMatch[1]) {
                         openTab({currentTarget: link}, activeTabIdMatch[1]);
                    }
                }
            }
        });
        if (!activeTabFound && tabLinks[0]) {
             tabLinks[0].click(); 
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
            const icon = menuToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('active')) {
                    icon.classList.replace('fa-bars', 'fa-times');
                } else {
                    icon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }
    
    // --- JQUERY DEPENDENT INITIALIZATIONS ---
    if (typeof jQuery !== 'undefined') {
        // --- PROJECT IMAGE ALBUM SLIDER ---
        $('.project-image-album-slider').each(function() {
            const $slider = $(this);
            const $captionContainer = $slider.siblings('.project-image-caption'); 
            const $titleOverlay = $captionContainer.find('.image-title-overlay');
            const $subtextOverlay = $captionContainer.find('.image-subtext-overlay');

            $slider.slick({
                dots: true,
                infinite: false, 
                speed: 400,
                fade: true,
                cssEase: 'cubic-bezier(0.7, 0, 0.3, 1)', 
                adaptiveHeight: false, 
                prevArrow: '<button type="button" class="slick-prev-custom"><i class="fas fa-chevron-left"></i></button>',
                nextArrow: '<button type="button" class="slick-next-custom"><i class="fas fa-chevron-right"></i></button>'
            });

            function updateCaption($currentSlide) {
                const $imgOrPlaceholder = $currentSlide.children().first(); 
                if ($imgOrPlaceholder.is('img') && $imgOrPlaceholder.data('title')) {
                    $titleOverlay.text($imgOrPlaceholder.data('title'));
                    $subtextOverlay.text($imgOrPlaceholder.data('subtext') || '');
                    $captionContainer.css('opacity', 1);
                } else if ($imgOrPlaceholder.hasClass('youtube-placeholder')) {
                    $titleOverlay.text('Project Demo'); 
                    $subtextOverlay.text('Click to watch on YouTube');
                    $captionContainer.css('opacity', 1);
                }
                 else {
                    $titleOverlay.text('');
                    $subtextOverlay.text('');
                    $captionContainer.css('opacity', 0);
                }
            }
            
            setTimeout(() => {
                 updateCaption($slider.find('.slick-current'));
            }, 100);


            $slider.on('afterChange', function(event, slick, currentSlide){
                updateCaption($(slick.$slides[currentSlide]));
            });

            $slider.find('.youtube-placeholder').on('click', function() {
                const videoId = $(this).data('youtube-id');
                const placeholderVideoIds = [
                    "YOUR_YOUTUBE_VIDEO_ID_HERE",
                    "YOUR_YOUTUBE_VIDEO_ID_HERE_V2E",
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
                ];
                if (videoId && !placeholderVideoIds.includes(videoId.toUpperCase())) {
                    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                } else {
                    alert("YouTube video link not yet configured for this project.");
                }
            });
        });
        
    } else {
        console.error("jQuery is not loaded. Slick Carousel and other jQuery-dependent features will not work.");
    }

}); // End DOMContentLoaded