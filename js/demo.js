/* ============================================
   SMARTONATION.AI - DEMO JS
   Handles webhook integration and demo UI for AI automation demos
   ============================================ */

/* ============================================
   DEMO CONFIGURATION
   
   To add a new demo:
   1. Add a product card in products.html with data-demo="your-demo-id"
   2. Add configuration here with your workflow webhook URL
   3. Ensure your workflow accepts POST requests with JSON payload
   
   Webhook URL format: https://your-workflow-endpoint.com/webhook/your-workflow-id
   ============================================ */
const DEMO_CONFIG = {
    'youtube-summarizer': {
        webhookUrl: 'https://aidoorbox.app.n8n.cloud/webhook/6f87007a-75fd-42c8-8afb-3da835c11836', // Your workflow webhook URL
        // Payload fields expected by workflow:
        //   email: user's email
        //   youtube_url: YouTube URL
        inputField: 'youtube_url',
        emailField: 'email'
    },
    'document-summarizer': {
        webhookUrl: 'https://aidoorbox.app.n8n.cloud/webhook/doc-summarizer', // ⚠️ REQUIRED: Add your webhook URL for document summarizer
        // Payload fields expected (sent as FormData):
        //   name: user's name
        //   email: user's email
        //   document: file to be summarized (multipart/form-data)
        nameField: 'name',
        emailField: 'email',
        fileField: 'document',
        hasFileUpload: true // Flag to indicate file upload handling
    },
    'local-service-finder': {
        webhookUrl: 'https://aidoorbox.app.n8n.cloud/webhook/local-service-finder', // ⚠️ REQUIRED: Add your webhook URL for local service finder
        // Payload fields expected:
        //   email: user's email
        //   service_type: type of service requested
        //   city: city location
        emailField: 'email',
        serviceTypeField: 'service_type',
        cityField: 'city'
    },
    'youtube-learning-report': {
        webhookUrl: 'https://aidoorbox.app.n8n.cloud/webhook/topic', // ⚠️ REQUIRED: Add your webhook URL for YouTube learning report
        // Payload fields expected:
        //   topic: topic to be searched
        //   email: user's email
        topicField: 'topic',
        emailField: 'email'
    },
    'multi-model-ai-summarizer': {
        webhookUrl: 'https://aidoorbox.app.n8n.cloud/webhook/80e2adbb-c596-4e04-9ca6-61016c928ea7', // ⚠️ REQUIRED: Add your webhook URL for multi-model AI summarizer
        // Payload fields expected:
        //   chat: user's prompt or content to summarize
        //   email: user's email
        chatField: 'chat',
        emailField: 'email'
    },
    // Add more demos here as you create them
    // Example:
    // 'email-analyzer': {
    //     webhookUrl: 'https://your-workflow-endpoint.com/webhook/email-analyzer',
    //     inputField: 'email',
    //     inputPlaceholder: 'Enter email content...',
    //     inputType: 'text'
    // }
};

// Initialize demos when page loads
document.addEventListener('DOMContentLoaded', () => {
    initDemos();
});

function initDemos() {
    const demoButtons = document.querySelectorAll('[data-demo]');
    
    demoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const demoId = button.getAttribute('data-demo');
            toggleDemo(demoId);
        });
    });
    
    // Handle demo form submissions
    document.querySelectorAll('.demo-form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const demoId = form.closest('.demo-container').getAttribute('data-demo-id');
            runDemo(demoId, form);
        });
    });
}

function toggleDemo(demoId) {
    const demoContainer = document.querySelector(`[data-demo-id="${demoId}"]`);
    
    if (!demoContainer) {
        console.error(`Demo container not found for: ${demoId}`);
        return;
    }
    
    // Toggle visibility
    demoContainer.classList.toggle('active');
    
    // Scroll to demo if opening
    if (demoContainer.classList.contains('active')) {
        setTimeout(() => {
            demoContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function runDemo(demoId, form) {
    const config = DEMO_CONFIG[demoId];
    
    if (!config) {
        showError('Demo configuration not found. Please contact support.');
        return;
    }
    
    if (!config.webhookUrl) {
        showError('Webhook URL not configured. Please add your webhook URL in js/demo.js');
        return;
    }
    
    const emailInput = form.querySelector('.demo-input-email');
    const urlInput = form.querySelector('.demo-input-url');
    const submitBtn = form.querySelector('.demo-submit');
    const output = form.closest('.demo-container').querySelector('.demo-output');
    
    if (!submitBtn || !output) {
        showError('Demo form elements not found.');
        return;
    }
    
    let payload = {};
    let inputsToDisable = [];
    let useFormData = false;
    
    // Check if this demo requires file upload
    if (config.hasFileUpload) {
        const nameInput = form.querySelector('.demo-input-name');
        const emailInput = form.querySelector('.demo-input-email');
        const fileInput = form.querySelector('.demo-input-file');
        
        if (!nameInput || !emailInput || !fileInput) {
            showError('Demo form elements not found.');
            return;
        }
        
        const nameValue = nameInput.value.trim();
        const emailValue = emailInput.value.trim();
        const file = fileInput.files[0];
        
        if (!nameValue || !emailValue || !file) {
            showError('Please fill in all fields including the document file.');
            return;
        }
        
        // Use FormData for file uploads
        useFormData = true;
        const formData = new FormData();
        formData.append(config.nameField || 'name', nameValue);
        formData.append(config.emailField || 'email', emailValue);
        formData.append(config.fileField || 'document', file);
        
        inputsToDisable = [nameInput, emailInput, fileInput];
        
        // Disable form during request
        inputsToDisable.forEach(el => el.disabled = true);
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="loading"></span> Running automation...';
        
        // Clear previous output
        output.classList.remove('active', 'success', 'error');
        output.textContent = '';
        
        // Call workflow webhook with FormData (no Content-Type header - browser sets it with boundary)
        fetch(config.webhookUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Display success result
            displayResult(output, data, true);
        })
        .catch(error => {
            console.error('Demo error:', error);
            displayResult(output, {
                error: 'Failed to run automation. Please check your webhook URL and try again.',
                details: error.message
            }, false);
        })
        .finally(() => {
            // Re-enable form
            inputsToDisable.forEach(el => el.disabled = false);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Run Automation';
        });
        
        return; // Exit early for file upload handling
    }
    
    // Special handling for local-service-finder (email + service type + city)
    if (config.serviceTypeField && config.cityField) {
        const serviceTypeInput = form.querySelector('.demo-input-service-type');
        const cityInput = form.querySelector('.demo-input-city');
        
        if (!emailInput || !serviceTypeInput || !cityInput) {
            showError('Demo form elements not found.');
            return;
        }
        
        const emailValue = emailInput.value.trim();
        const serviceTypeValue = serviceTypeInput.value.trim();
        const cityValue = cityInput.value.trim();
        
        if (!emailValue || !serviceTypeValue || !cityValue) {
            showError('Please fill in all fields: email, service type, and city.');
            return;
        }
        
        payload[config.emailField] = emailValue;
        payload[config.serviceTypeField] = serviceTypeValue;
        payload[config.cityField] = cityValue;
        inputsToDisable = [emailInput, serviceTypeInput, cityInput];
    }
    // Special handling for youtube-learning-report (topic + email)
    else if (config.topicField) {
        const topicInput = form.querySelector('.demo-input-topic');
        
        if (!emailInput || !topicInput) {
            showError('Demo form elements not found.');
            return;
        }
        
        const emailValue = emailInput.value.trim();
        const topicValue = topicInput.value.trim();
        
        if (!emailValue || !topicValue) {
            showError('Please fill in both topic and email fields.');
            return;
        }
        
        payload[config.topicField] = topicValue;
        payload[config.emailField] = emailValue;
        inputsToDisable = [topicInput, emailInput];
    }
    // Special handling for multi-model-ai-summarizer (chat + email)
    else if (config.chatField) {
        const chatInput = form.querySelector('.demo-input-chat');
        
        if (!emailInput || !chatInput) {
            showError('Demo form elements not found.');
            return;
        }
        
        const emailValue = emailInput.value.trim();
        const chatValue = chatInput.value.trim();
        
        if (!emailValue || !chatValue) {
            showError('Please fill in both chat prompt and email fields.');
            return;
        }
        
        payload[config.chatField] = chatValue;
        payload[config.emailField] = emailValue;
        inputsToDisable = [chatInput, emailInput];
    }
    // Special handling for demos that require both email + URL (like youtube-summarizer)
    else if (config.emailField && emailInput && urlInput) {
        const emailValue = emailInput.value.trim();
        const urlValue = urlInput.value.trim();
        
        if (!emailValue || !urlValue) {
            showError('Please enter both email and YouTube URL.');
            return;
        }
        
        payload[config.emailField] = emailValue;
        payload[config.inputField] = urlValue;
        inputsToDisable = [emailInput, urlInput];
    } else {
        // Default single-input behavior (keeps other demos working)
        const singleInput = form.querySelector('.demo-input');
        
        if (!singleInput) {
            showError('Demo input field not found.');
            return;
        }
        
        const inputValue = singleInput.value.trim();
        
        if (!inputValue) {
            showError('Please enter a value.');
            return;
        }
        
        payload[config.inputField] = inputValue;
        inputsToDisable = [singleInput];
    }
    
    // Disable form during request
    inputsToDisable.forEach(el => el.disabled = true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Running automation...';
    
    // Clear previous output
    output.classList.remove('active', 'success', 'error');
    output.textContent = '';
    
    // Call workflow webhook with constructed payload
    fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // Display success result
        displayResult(output, data, true);
    })
    .catch(error => {
        console.error('Demo error:', error);
        displayResult(output, {
            error: 'Failed to run automation. Please check your webhook URL and try again.',
            details: error.message
        }, false);
    })
    .finally(() => {
        // Re-enable form
        inputsToDisable.forEach(el => el.disabled = false);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Run Automation';
    });
}

function displayResult(outputElement, data, isSuccess) {
    outputElement.classList.add('active');
    
    if (isSuccess) {
        outputElement.classList.add('success');
        outputElement.classList.remove('error');
        
        // Show custom message when workflow starts successfully
        outputElement.textContent = 'Check your inbox — something good is waiting 😉';
    } else {
        outputElement.classList.add('error');
        outputElement.classList.remove('success');
        
        const errorMsg = data.error || data.message || 'An error occurred';
        outputElement.textContent = errorMsg;
        
        if (data.details) {
            outputElement.textContent += '\n\nDetails: ' + data.details;
        }
    }
}

function showError(message) {
    alert(message); // Simple alert for now, can be enhanced with a toast notification
}

// Utility function to add a new demo configuration
function addDemoConfig(demoId, config) {
    DEMO_CONFIG[demoId] = config;
}

// Export for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DEMO_CONFIG, addDemoConfig };
}
