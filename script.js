// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.5)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
    }
    
    lastScroll = currentScroll;
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe cards
document.querySelectorAll('.card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe review cards
document.querySelectorAll('.review-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Observe stats
document.querySelectorAll('.stat').forEach((stat, index) => {
    stat.style.opacity = '0';
    stat.style.transform = 'translateY(20px)';
    stat.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
    observer.observe(stat);
});

// Active nav link on scroll
window.addEventListener('scroll', () => {
    let current = '';
    
    document.querySelectorAll('section[id]').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('nav a').forEach(link => {
        link.style.color = '#fff';
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = '#ff8c00';
        }
    });
});

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Mobile menu toggle (if needed for smaller screens)
function setupMobileMenu() {
    const navbar = document.querySelector('.navbar');
    const nav = document.querySelector('nav');
    
    if (window.innerWidth < 768) {
        // Add mobile-specific adjustments if needed
    }
}

window.addEventListener('resize', setupMobileMenu);
setupMobileMenu();

// Prevent FOUC (Flash of Unstyled Content)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.style.opacity = '1';
    });
} else {
    document.body.style.opacity = '1';
}

// WhatsApp link customization
function setupWhatsAppLinks() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    const message = encodeURIComponent(
        "Hello! I'm interested in booking at Family Hostel Bali. Can you tell me more about availability and pricing?"
    );
    
    whatsappLinks.forEach(link => {
        const phoneNumber = '6287780052590';
        link.href = `https://wa.me/${phoneNumber}?text=${message}`;
    });
}

setupWhatsAppLinks();

// Log that script loaded
console.log('✅ Family Hostel Bali website loaded successfully!');
