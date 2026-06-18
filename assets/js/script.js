/**
 * Aaditi Bhatade Portfolio Website Core Interactivity
 * Built with Vanilla JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Preloader Loading Control
       ========================================================================== */
    const preloader = document.getElementById('preloader');
    
    // Fallback in case load takes too long
    const forceHidePreloader = setTimeout(() => {
        if (preloader) {
            preloader.classList.add('fade-out');
        }
    }, 2500);

    window.addEventListener('load', () => {
        clearTimeout(forceHidePreloader);
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
            }
        }, 500);
    });

    /* ==========================================================================
       2. Light / Dark Theme Toggle
       ========================================================================== */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load initial theme state
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
        
        // Re-initialize particles with theme colors if canvas exists
        if (typeof initCanvas === 'function') {
            initCanvas();
        }
    });

    /* ==========================================================================
       3. Custom Cursor Tracker (Fluid dot & lag ring)
       ========================================================================== */
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    
    // Flag to check if cursor is active (prevent jumping on page load)
    let isCursorMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!isCursorMoving) {
            outlineX = mouseX;
            outlineY = mouseY;
            isCursorMoving = true;
        }

        // Instantly move inner dot
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Animate outer ring with a slight lag (lerp interpolation)
    function animateCursor() {
        if (isCursorMoving) {
            const lerpFactor = 0.15; // Speed of tracking ring
            outlineX += (mouseX - outlineX) * lerpFactor;
            outlineY += (mouseY - outlineY) * lerpFactor;
            
            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover state effect on clickable tags
    const clickables = document.querySelectorAll('a, button, .filter-btn, .project-card, input, textarea');
    clickables.forEach(item => {
        item.addEventListener('mouseenter', () => {
            document.body.classList.add('cursor-hover-active');
        });
        item.addEventListener('mouseleave', () => {
            document.body.classList.remove('cursor-hover-active');
        });
    });

    // Hide custom cursor when mouse leaves viewport
    document.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '0';
        cursorOutline.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '1';
        cursorOutline.style.opacity = '1';
    });

    /* ==========================================================================
       4. HTML5 Canvas Particles Background
       ========================================================================== */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Mouse interactive radius position
    let particleMouse = {
        x: null,
        y: null,
        radius: 120
    };

    window.addEventListener('mousemove', (e) => {
        particleMouse.x = e.clientX;
        particleMouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        particleMouse.x = null;
        particleMouse.y = null;
    });

    window.addEventListener('resize', () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        initCanvas();
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle node
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update movement
        update() {
            // Keep within boundary limits
            if (this.x > canvasWidth || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvasHeight || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse proximity interaction (push away)
            if (particleMouse.x !== null && particleMouse.y !== null) {
                let dx = this.x - particleMouse.x;
                let dy = this.y - particleMouse.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < particleMouse.radius) {
                    const force = (particleMouse.radius - distance) / particleMouse.radius;
                    const forceX = (dx / distance) * force * 3;
                    const forceY = (dy / distance) * force * 3;
                    
                    this.x += forceX;
                    this.y += forceY;
                }
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    function initCanvas() {
        particlesArray = [];
        
        // Define density based on window scale
        const numberOfParticles = Math.floor((canvasWidth * canvasHeight) / 14000);
        
        // Resolve particle themes colors dynamically
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const color = isDark ? 'rgba(6, 182, 212, 0.2)' : 'rgba(124, 58, 237, 0.15)'; // Cyan for dark, Purple for light
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 2 + 1;
            let x = Math.random() * (canvasWidth - size * 2) + size;
            let y = Math.random() * (canvasHeight - size * 2) + size;
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect node dots with interactive wire lines
    function connectParticles() {
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const lineColorBase = isDark ? 'rgba(6, 182, 212,' : 'rgba(124, 58, 237,';
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                let maxConnectionDistance = 110;
                if (distance < maxConnectionDistance) {
                    // Normalize opacity based on length distance
                    let opacity = 1 - (distance / maxConnectionDistance);
                    ctx.strokeStyle = `${lineColorBase} ${opacity * 0.12})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connectParticles();
        requestAnimationFrame(animateParticles);
    }

    initCanvas();
    animateParticles();

    /* ==========================================================================
       5. Spotlight Mouse Movements (Linear Border Spotlight)
       ========================================================================== */
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    
    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse coordinate relative to card bounds
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set variables dynamically
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* ==========================================================================
       6. Typing Animation (Hero Section text loop)
       ========================================================================== */
    const typedTextEl = document.getElementById('typed-roles');
    const roles = [
        "Computer Engineering Student",
        "Full Stack Developer",
        "AI Enthusiast"
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;

    function typeRoleEffect() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            typedTextEl.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 50; // Deleting goes faster
        } else {
            typedTextEl.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 100; // Normal typing speed
        }

        // Handling phrase boundaries
        if (!isDeleting && charIndex === currentRole.length) {
            typingSpeed = 1800; // Hold full text before deleting
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typingSpeed = 500; // Delay before starting next word
        }

        setTimeout(typeRoleEffect, typingSpeed);
    }
    
    if (typedTextEl) {
        setTimeout(typeRoleEffect, 1000); // Start typed effect
    }

    /* ==========================================================================
       7. Scroll Reveal & Stats Counters (Intersection Observer)
       ========================================================================== */
    const revealSections = document.querySelectorAll('.scroll-reveal');
    const skillsSection = document.getElementById('skills');
    const statsNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    // Section reveal observer
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Trigger Skill Bar transitions when skills are revealed
                if (entry.target.id === 'skills') {
                    skillsSection.classList.add('active-anim');
                }
                
                // Trigger achievements counter when achievements are visible
                if (entry.target.id === 'achievements' && !statsAnimated) {
                    animateStats();
                    statsAnimated = true;
                }
                
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, {
        threshold: 0.15 // Trigger when 15% is visible
    });

    revealSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Stats counting animation
    function animateStats() {
        statsNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            let current = 0;
            const duration = 1500; // Counter total millisecond run time
            const stepTime = Math.max(Math.floor(duration / target), 15);
            
            const counter = setInterval(() => {
                if (target < 10) {
                    current += 1;
                } else if (target > 1000) {
                    current += 19;
                } else {
                    current += Math.ceil(target / 45); // Smooth rate scaling
                }
                
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(counter);
                } else {
                    stat.textContent = current;
                }
            }, stepTime);
        });
    }

    /* ==========================================================================
       8. Sticky Navbar & Progress Indicator & Active Section Highlighting
       ========================================================================== */
    const navbar = document.getElementById('main-navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const scrollBar = document.getElementById('scroll-bar');
    
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // Sticky bar slide feedback
        if (currentScrollY > 100) {
            navbar.style.top = '10px';
        } else {
            navbar.style.top = '20px';
        }
        
        lastScrollY = currentScrollY;

        // Update progress bar
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0) {
            const scrollPercent = (currentScrollY / docHeight) * 94; // Keep 30px bounds on ends
            scrollBar.style.width = `calc(${scrollPercent}% + 30px)`;
        }

        // Active Section ScrollSpy Highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.clientHeight;
            if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        if (currentSectionId) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    /* ==========================================================================
       9. Mobile Toggle Navigation Menu
       ========================================================================== */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Close menu if clicked outside bounds
    document.addEventListener('click', (e) => {
        if (!navbar.contains(e.target) && navMenu.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    });

    /* ==========================================================================
       10. Projects Filter Logic
       ========================================================================== */
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button classes
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const categories = card.getAttribute('data-categories');
                
                // Hide with transition
                card.style.opacity = '0';
                card.style.transform = 'translateY(15px)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || categories.includes(filterValue)) {
                        card.classList.add('show');
                        // Trigger re-draw animation
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 50);
                    } else {
                        card.classList.remove('show');
                    }
                }, 300); // Sync with CSS transition
            });
        });
    });

    /* ==========================================================================
       11. Contact Form Validations & Simulated Submission Check
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const successOverlay = document.getElementById('form-success-overlay');
    const btnSubmitForm = document.getElementById('btn-submit-form');
    const btnText = btnSubmitForm.querySelector('.btn-text');
    const btnSpinner = btnSubmitForm.querySelector('.btn-spinner');
    const successResetBtn = document.getElementById('btn-success-reset');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Grab values
        const nameInput = document.getElementById('form-name');
        const emailInput = document.getElementById('form-email');
        const subjectInput = document.getElementById('form-subject');
        const msgTextarea = document.getElementById('form-message');

        // Reset errors
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('invalid');
        });

        // 1. Name Check
        if (nameInput.value.trim() === '') {
            nameInput.parentElement.classList.add('invalid');
            isValid = false;
        }

        // 2. Email Check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            emailInput.parentElement.classList.add('invalid');
            isValid = false;
        }

        // 3. Subject Check
        if (subjectInput.value.trim() === '') {
            subjectInput.parentElement.classList.add('invalid');
            isValid = false;
        }

        // 4. Message Check
        if (msgTextarea.value.trim() === '') {
            msgTextarea.parentElement.classList.add('invalid');
            isValid = false;
        }

        if (isValid) {
            // Simulated form submit trigger loading animation
            btnSubmitForm.disabled = true;
            btnText.classList.add('hidden');
            btnSpinner.classList.remove('hidden');

            setTimeout(() => {
                // Submit complete, active success modal overlay
                successOverlay.classList.add('active');
                
                // Clear inputs
                contactForm.reset();
                
                // Restore submit buttons
                btnSubmitForm.disabled = false;
                btnText.classList.remove('hidden');
                btnSpinner.classList.add('hidden');
            }, 1800); // 1.8 seconds loading screen
        }
    });

    successResetBtn.addEventListener('click', () => {
        successOverlay.classList.remove('active');
    });

    /* ==========================================================================
       12. Back-to-Top circular scroll progress button
       ========================================================================== */
    const backToTopBtn = document.getElementById('back-to-top');
    const progressCircle = document.querySelector('.progress-ring-circle');
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    // Set dash details
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Show/hide button
        if (scrollTop > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }

        // Update progress circle indicator
        if (docHeight > 0) {
            const progress = scrollTop / docHeight;
            const offset = circumference - (progress * circumference);
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress();

    // Scroll to top on click
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

});
