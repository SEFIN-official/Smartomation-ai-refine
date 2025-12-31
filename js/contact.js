/* ============================================
   SMARTONATION.AI - CONTACT FORM JS
   Handles contact form submission to n8n webhook
   ============================================ */

/* ============================================
   CONTACT FORM CONFIGURATION
   
   Add your n8n webhook URL here for contact form submissions.
   The webhook should receive: name, email, company, message
   And forward the email to: ai@doorbox.ai
   ============================================ */
const CONTACT_WEBHOOK_URL = 'https://aidoorbox.app.n8n.cloud/webhook/373b7523-8da3-4e4e-a8cc-70d82261d990'; // ⚠️ REQUIRED: Add your n8n webhook URL for contact form
// Example: 'https://aidoorbox.app.n8n.cloud/webhook/contact-form'
// Your n8n workflow should receive: name, email, company, message
// And send email to: ai@doorbox.ai

// Initialize contact form when page loads
document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
});

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleContactSubmit);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('contactMessage');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        company: document.getElementById('company').value.trim() || 'Not provided',
        message: document.getElementById('message').value.trim()
    };
    
    // Validate
    if (!formData.name || !formData.email || !formData.message) {
        showMessage(messageDiv, 'Please fill in all required fields.', false);
        return;
    }
    
    // Check if webhook URL is configured
    if (!CONTACT_WEBHOOK_URL || CONTACT_WEBHOOK_URL.trim() === '') {
        showMessage(messageDiv, 'Contact form webhook is not configured. Please contact the administrator.', false);
        return;
    }
    
    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Sending...';
    
    // Clear previous message
    messageDiv.style.display = 'none';
    messageDiv.className = '';
    messageDiv.textContent = '';
    
    // Send to n8n webhook
    fetch(CONTACT_WEBHOOK_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Success
        showMessage(messageDiv, 'Thank you for your message! We have received your inquiry and will get back to you soon at ' + formData.email + '.', true);
        
        // Reset form
        form.reset();
    })
    .catch(error => {
        console.error('Contact form error:', error);
        showMessage(messageDiv, 'Sorry, there was an error sending your message. Please try again or email us directly at ai@doorbox.ai', false);
    })
    .finally(() => {
        // Re-enable form
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    });
}

function showMessage(messageDiv, text, isSuccess) {
    messageDiv.style.display = 'block';
    messageDiv.className = isSuccess ? 'demo-output success active' : 'demo-output error active';
    messageDiv.textContent = text;
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

