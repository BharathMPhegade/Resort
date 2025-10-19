// Wait until the entire page (DOM) is loaded
document.addEventListener('DOMContentLoaded', function() {

    // ============================================================
    // 🧭 1. MOBILE MENU TOGGLE
    // ============================================================
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        // Toggle navigation menu open/close
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when any link inside it is clicked
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close menu if user clicks outside the nav area
        document.addEventListener('click', function(event) {
            const clickedInsideNav = navMenu.contains(event.target) || navToggle.contains(event.target);
            if (!clickedInsideNav && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // ============================================================
    // 📅 2. SET FOOTER COPYRIGHT YEAR DYNAMICALLY
    // ============================================================
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // ============================================================
    // 🎁 3. REVEAL ALL PACKAGES SECTION ON BUTTON CLICK
    // ============================================================
    const allPackagesSection = document.getElementById('all-packages');
    const explorePackagesBtn = document.getElementById('explorePackagesBtn');
    const menuAllPackageClick = document.getElementById('MenuallPackageclick');

    // Function to handle showing packages section
    function showPackagesSection(e) {
        if (e) e.preventDefault();
        
        // Show the packages section
        allPackagesSection.style.display = 'block';
        
        // Add a small delay to ensure the display change has taken effect
        setTimeout(function() {
            // Smooth scroll to the packages section
            allPackagesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Add a subtle animation effect
            allPackagesSection.style.opacity = '0';
            allPackagesSection.style.transform = 'translateY(20px)';
            
            let opacity = 0;
            let translateY = 20;
            const fadeIn = setInterval(function() {
                opacity += 0.05;
                translateY -= 1;
                allPackagesSection.style.opacity = opacity;
                allPackagesSection.style.transform = `translateY(${translateY}px)`;
                
                if (opacity >= 1) {
                    clearInterval(fadeIn);
                    allPackagesSection.style.opacity = '';
                    allPackagesSection.style.transform = '';
                }
            }, 20);
        }, 100);
    }

    // Add event listeners to all package buttons
    const packageButtons = [
        document.getElementById('explorePackagesBtn'),
        document.getElementById('MenuallPackageclick')
    ];

    packageButtons.forEach(button => {
        if (button && allPackagesSection) {
            button.addEventListener('click', showPackagesSection);
        }
    });

    // ============================================================
    // 🏨 4. BOOKING FORM VALIDATION + SUBMISSION
    // ============================================================
		const bookingForm = document.getElementById('bookingForm');
		const formStatus = document.getElementById('formStatus');
		if (bookingForm && formStatus) {
        // Set minimum date to today for check-in
        const today = new Date().toISOString().split('T')[0];
        const checkinInput = document.getElementById('checkin');
        const checkoutInput = document.getElementById('checkout');
        
        if (checkinInput) {
            checkinInput.min = today;
            
            // Update checkout min date when checkin changes
            checkinInput.addEventListener('change', function() {
                if (checkoutInput) {
                    checkoutInput.min = this.value;
                }
            });
        }

        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // prevent normal form submission
            
            // Reset status and field styles
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            const fields = bookingForm.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.style.borderColor = '';
            });
            
            // Show loading message
            formStatus.textContent = "Submitting your request...";
            formStatus.className = 'form-status info';
            
            // Validate required fields
            let isValid = true;
            const requiredFields = bookingForm.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = 'var(--color-accent)';
                }
            });

            // Validate dates
            const checkin = bookingForm.querySelector('input[name="checkin"]');
            const checkout = bookingForm.querySelector('input[name="checkout"]');
            const today = new Date().toISOString().split('T')[0];

            if (checkin.value && checkin.value < today) {
                isValid = false;
                formStatus.textContent = "Check-in date can't be in the past.";
                formStatus.className = 'form-status error';
                checkin.style.borderColor = 'var(--color-accent)';
            } else if (checkout.value && checkout.value <= checkin.value) {
                isValid = false;
                formStatus.textContent = "Check-out date must be after check-in date.";
                formStatus.className = 'form-status error';
                checkout.style.borderColor = 'var(--color-accent)';
            }

            // Validate phone number format
            const phone = bookingForm.querySelector('input[name="phone"]');
            const phoneRegex = /^[0-9]{10}$/;
            if (phone.value && !phoneRegex.test(phone.value)) {
                isValid = false;
                formStatus.textContent = "Please enter a valid 10-digit phone number.";
                formStatus.className = 'form-status error';
                phone.style.borderColor = 'var(--color-accent)';
            }

            // Stop submission if invalid
            if (!isValid) {
                if (!formStatus.textContent) {
                    formStatus.textContent = 'Please fill in all required fields.';
                    formStatus.className = 'form-status error';
                }
                return;
            }

            // Submit to FormSubmit.co
            const formData = new FormData(bookingForm);
            const submitBtn = bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';

            fetch(bookingForm.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Success
                    formStatus.textContent = "✅ Request submitted successfully! We'll contact you shortly.";
                    formStatus.className = 'form-status success';
                    
                    // Reset form after 3 seconds
                    setTimeout(function() {
                        bookingForm.reset();
                        formStatus.textContent = "";
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalBtnText;
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Form submission error:', error);
                formStatus.textContent = "❌ There was an error submitting your request. Please try again or contact us directly.";
                formStatus.className = 'form-status error';
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            });
        });
    }

    // ============================================================
    // 📦 5. PACKAGES HORIZONTAL SCROLL FUNCTIONALITY
    // ============================================================
    function initPackagesScroll() {
        const scrollWrapper = document.getElementById('packagesScrollWrapper');
        const scrollPrev = document.getElementById('scrollPrevBtn');
        const scrollNext = document.getElementById('scrollNextBtn');
        const scrollDots = document.getElementById('scrollDots');
        
        if (!scrollWrapper || !scrollPrev || !scrollNext || !scrollDots) {
            console.log('Packages scroll elements not found');
            return;
        }
        
        const packages = document.querySelectorAll('.scroll-card');
        const dots = [];
        
        // Clear existing dots
        scrollDots.innerHTML = '';
        
        // Create dots for each package
        packages.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = `scroll-dot ${index === 0 ? 'active' : ''}`;
            dot.setAttribute('aria-label', `Go to package ${index + 1}`);
            dot.addEventListener('click', () => {
                scrollToPackage(index);
            });
            scrollDots.appendChild(dot);
            dots.push(dot);
        });
        
        function getCardWidth() {
            if (packages.length === 0) return 0;
            const card = packages[0];
            const style = window.getComputedStyle(card);
            const margin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            return card.offsetWidth + margin;
        }
        
        function updateNavigation() {
            if (packages.length === 0) return;
            
            const scrollLeft = scrollWrapper.scrollLeft;
            const cardWidth = getCardWidth();
            const activeIndex = Math.min(Math.round(scrollLeft / cardWidth), packages.length - 1);
            
            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeIndex);
            });
            
            // Update button states
            scrollPrev.disabled = scrollLeft <= 10;
            scrollNext.disabled = scrollLeft >= (scrollWrapper.scrollWidth - scrollWrapper.clientWidth - 10);
        }
        
        function scrollToPackage(index) {
            const card = packages[index];
            const containerWidth = scrollWrapper.clientWidth;
            const cardWidth = getCardWidth();
            
            const scrollPosition = index * cardWidth;
            
            scrollWrapper.scrollTo({
                left: scrollPosition,
                behavior: 'smooth'
            });
        }
        
        // Previous button
        scrollPrev.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            scrollWrapper.scrollBy({
                left: -cardWidth,
                behavior: 'smooth'
            });
        });
        
        // Next button
        scrollNext.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            scrollWrapper.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        });
        
        // Update navigation on scroll
        scrollWrapper.addEventListener('scroll', updateNavigation);
        
        // Update navigation on resize
        window.addEventListener('resize', updateNavigation);
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Only activate if user is not typing in a form field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollPrev.click();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollNext.click();
            }
        });
        
        // Initial update
        updateNavigation();
        
        console.log('Packages scroll initialized with', packages.length, 'packages');
    }

    // ============================================================
    // 🖼️ 6. HERO SLIDER FUNCTIONALITY
    // ============================================================
    function initHeroSlider() {
        const slides = document.querySelectorAll('.slide');
        const dots = document.querySelectorAll('.dot');
        const prevArrow = document.querySelector('.slider-arrow.prev');
        const nextArrow = document.querySelector('.slider-arrow.next');
        
        if (!slides.length || !dots.length) {
            console.log('Slider elements not found');
            return;
        }

        let currentSlide = 0;
        let slideInterval;
        let isAnimating = false;

        // Function to show specific slide
        function showSlide(n) {
            if (isAnimating) return;
            isAnimating = true;

            // Remove active class from all slides and dots
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            // Handle slide boundaries
            if (n >= slides.length) {
                currentSlide = 0;
            } else if (n < 0) {
                currentSlide = slides.length - 1;
            } else {
                currentSlide = n;
            }
            
            // Add active class to current slide and dot
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            // Reset animation flag after transition
            setTimeout(() => {
                isAnimating = false;
            }, 600);
        }

        // Next slide function
        function nextSlide() {
            showSlide(currentSlide + 1);
        }

        // Previous slide function
        function prevSlide() {
            showSlide(currentSlide - 1);
        }

        // Start automatic sliding
        function startSlider() {
            slideInterval = setInterval(nextSlide, 5000);
        }

        // Stop automatic sliding
        function stopSlider() {
            clearInterval(slideInterval);
        }

        // Event listeners for arrows (if they exist)
        if (prevArrow) {
            prevArrow.addEventListener('click', function() {
                stopSlider();
                prevSlide();
                startSlider();
            });
        }

        if (nextArrow) {
            nextArrow.addEventListener('click', function() {
                stopSlider();
                nextSlide();
                startSlider();
            });
        }

        // Event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', function() {
                stopSlider();
                showSlide(index);
                startSlider();
            });
        });

        // Pause slider on hover
        const slider = document.querySelector('.hero-slider');
        if (slider) {
            slider.addEventListener('mouseenter', stopSlider);
            slider.addEventListener('mouseleave', startSlider);

            // Touch swipe support for mobile
            let touchStartX = 0;
            let touchEndX = 0;
            let touchStartY = 0;
            let isSwiping = false;

            slider.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
                touchStartY = e.changedTouches[0].screenY;
                isSwiping = true;
                stopSlider();
            });

            slider.addEventListener('touchmove', function(e) {
                if (!isSwiping) return;
                e.preventDefault();
            });

            slider.addEventListener('touchend', function(e) {
                if (!isSwiping) return;
                
                touchEndX = e.changedTouches[0].screenX;
                const touchEndY = e.changedTouches[0].screenY;
                const diffX = touchStartX - touchEndX;
                const diffY = touchStartY - touchEndY;
                
                // Only handle horizontal swipes
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    e.preventDefault();
                    handleSwipe(diffX);
                }
                
                isSwiping = false;
                startSlider();
            });

            function handleSwipe(diffX) {
                const swipeThreshold = 50;
                
                if (Math.abs(diffX) > swipeThreshold) {
                    if (diffX > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            }
        }

        // Initialize slider
        showSlide(currentSlide);
        startSlider();
    }

    // ============================================================
    // 📱 7. ADDITIONAL ENHANCEMENTS
    // ============================================================
    
    // Add loading state to buttons when clicked
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add a small visual feedback
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // Lazy loading for images (if needed)
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ============================================================
    // 🚀 INITIALIZE ALL FUNCTIONALITY
    // ============================================================
    
    // Initialize packages scroll
    initPackagesScroll();
    
    // Initialize hero slider
    initHeroSlider();
    
    // Add a small delay to ensure everything is loaded
    setTimeout(() => {
        console.log('All JavaScript functionality loaded');
    }, 100);

}); // <-- This was missing in your original code