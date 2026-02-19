/* ============================================
   SMARTONATION.AI - ENTERPRISE JS
   Advanced animations and interactions
   ============================================ */

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
    
    // Set active nav link based on current page
    setActiveNavLink();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Navbar scroll effect
    initNavbarScroll();
    
    // Parallax effect for hero
    initParallax();
    
    // Staggered card animations
    initStaggeredAnimations();
    
    // Blog modal: Read more opens full content
    initBlogModal();
    
    // Sticky CTA bar (show after scroll)
    initStickyCTA();
});

// Sticky CTA bar - show after user scrolls past hero
function initStickyCTA() {
    const bar = document.querySelector('.sticky-cta-bar');
    if (!bar) return;
    
    const showAfter = 400;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > showAfter) {
            bar.classList.add('visible');
        } else {
            bar.classList.remove('visible');
        }
    }, { passive: true });
}

// Set active navigation link
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (currentPath.endsWith(href) || 
            (currentPath.endsWith('/') && href === 'index.html') ||
            (currentPath.endsWith('/') && href === '/')) {
            link.classList.add('active');
        }
    });
}

// Enhanced scroll-triggered animations with stagger
function initScrollAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if (fadeElements.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Stagger animation for cards
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index % 3 * 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
}

// Subtle parallax effect for hero
function initParallax() {
    const hero = document.querySelector('.hero');
    const heroBackground = document.querySelector('.hero-background');
    
    if (!hero || !heroBackground) return;
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        
        if (scrolled < hero.offsetHeight) {
            heroBackground.style.transform = `perspective(1000px) rotateX(2deg) translateY(${rate}px)`;
        }
    }, { passive: true });
    
    // Mouse move parallax on hero
    hero.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { width, height } = hero.getBoundingClientRect();
        const x = (clientX / width - 0.5) * 20;
        const y = (clientY / height - 0.5) * 20;
        
        heroBackground.style.transform = `perspective(1000px) rotateX(${2 + y * 0.1}deg) rotateY(${x * 0.1}deg)`;
    });
}

// Blog modal: open full post content in overlay
function initBlogModal() {
    const modal = document.getElementById('blogModal');
    if (!modal) return;
    
    const backdrop = modal.querySelector('.blog-modal-backdrop');
    const closeBtn = modal.querySelector('.blog-modal-close');
    const imgEl = modal.querySelector('.blog-modal-image');
    const dateEl = modal.querySelector('.blog-modal-date');
    const titleEl = modal.querySelector('.blog-modal-title');
    const bodyEl = modal.querySelector('.blog-modal-body');
    
    function openModal(card) {
        const img = card.querySelector('.blog-image img');
        const date = card.querySelector('.blog-date');
        const title = card.querySelector('.product-title');
        const fullContent = card.querySelector('.blog-full-content');
        if (!img || !date || !title || !fullContent) return;
        imgEl.src = img.src;
        imgEl.alt = img.alt || title.textContent;
        dateEl.textContent = date.textContent;
        dateEl.setAttribute('datetime', date.getAttribute('datetime') || '');
        titleEl.textContent = title.textContent;
        bodyEl.innerHTML = fullContent.innerHTML;
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    
    document.querySelectorAll('.blog-read-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.blog-card');
            if (card) openModal(card);
        });
    });
    
    document.querySelectorAll('.blog-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.blog-read-more')) return;
            openModal(card);
        });
    });
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
}

// Staggered animations for card grids
function initStaggeredAnimations() {
    const cardGrids = document.querySelectorAll('.card-grid, .product-grid');
    
    cardGrids.forEach(grid => {
        const cards = grid.querySelectorAll('.card, .product-card');
        cards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.05}s`;
        });
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offsetTop = target.offsetTop - 100;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Button ripple effect
document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});



