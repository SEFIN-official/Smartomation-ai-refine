/* ============================================
   SMARTOMATION.AI - DEMO TEST JS
   Hidden testing page wired to internal API endpoints
   ============================================ */

const DEMO_TEST_CONFIG = {
    demo1: {
        endpoint: '/api/demo-test/demo1/run',
        emailField: 'email',
        inputField: 'youtube_url'
    },
    demo2: {
        endpoint: '/api/demo-test/demo2/run',
        emailField: 'email',
        fileField: 'document',
        hasFileUpload: true
    },
    demo3: {
        endpoint: '/api/demo-test/demo3/run',
        emailField: 'email',
        topicField: 'topic'
    },
    demo4: {
        endpoint: '/api/demo-test/demo4/run',
        queryField: 'query',
        emailField: 'email'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initDemoTestPage();
});

function initDemoTestPage() {
    document.querySelectorAll('[data-demo]').forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            const demoId = button.getAttribute('data-demo');
            toggleDemo(demoId);
        });
    });

    document.querySelectorAll('.demo-form').forEach(form => {
        form.addEventListener('submit', event => {
            event.preventDefault();
            const demoId = form.closest('.demo-container').getAttribute('data-demo-id');
            runDemo(demoId, form);
        });
    });
}

function toggleDemo(demoId) {
    const container = document.querySelector(`[data-demo-id="${demoId}"]`);
    if (!container) {
        return;
    }

    container.classList.toggle('active');

    if (container.classList.contains('active')) {
        setTimeout(() => {
            container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 120);
    }
}

function runDemo(demoId, form) {
    const config = DEMO_TEST_CONFIG[demoId];
    if (!config) {
        showError('Demo configuration is missing.');
        return;
    }

    const submitBtn = form.querySelector('.demo-submit');
    const output = form.closest('.demo-container').querySelector('.demo-output');

    if (!submitBtn || !output) {
        showError('Demo UI elements are missing.');
        return;
    }

    const state = buildRequestState(config, form);
    if (!state.ok) {
        displayResult(output, { error: state.error }, false);
        return;
    }

    state.inputs.forEach(input => {
        input.disabled = true;
    });
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading"></span> Running automation...';

    output.classList.remove('active', 'success', 'error');
    output.textContent = '';

    fetch(config.endpoint, state.fetchOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayResult(output, data, true);
        })
        .catch(error => {
            displayResult(output, {
                error: 'Failed to run automation endpoint.',
                details: error.message
            }, false);
        })
        .finally(() => {
            state.inputs.forEach(input => {
                input.disabled = false;
            });
            submitBtn.disabled = false;
            submitBtn.textContent = 'Run Automation';
        });
}

function buildRequestState(config, form) {
    if (config.hasFileUpload) {
        const emailInput = form.querySelector('.demo-input-email');
        const fileInput = form.querySelector('.demo-input-file');

        if (!emailInput || !fileInput || !fileInput.files[0]) {
            return { ok: false, error: 'Please fill email and select a PDF file.' };
        }

        const selectedFile = fileInput.files[0];
        if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
            return { ok: false, error: 'Only PDF files are supported.' };
        }

        const body = new FormData();
        body.append(config.emailField, emailInput.value.trim());
        body.append(config.fileField, fileInput.files[0]);

        return {
            ok: true,
            inputs: [emailInput, fileInput],
            fetchOptions: { method: 'POST', body }
        };
    }

    const emailInput = form.querySelector('.demo-input-email');
    const urlInput = form.querySelector('.demo-input-url');
    const topicInput = form.querySelector('.demo-input-topic');
    const queryInput = form.querySelector('.demo-input-query');

    const payload = {};
    const inputs = [];

    if (config.queryField && queryInput) {
        if (!emailInput || !queryInput) {
            return { ok: false, error: 'Expected query and email.' };
        }

        payload[config.queryField] = queryInput.value.trim();
        payload[config.emailField] = emailInput.value.trim();
        inputs.push(queryInput, emailInput);
    } else if (config.topicField) {
        if (!emailInput || !topicInput) {
            return { ok: false, error: 'Expected topic and email.' };
        }

        payload[config.topicField] = topicInput.value.trim();
        payload[config.emailField] = emailInput.value.trim();
        inputs.push(topicInput, emailInput);
    } else {
        if (!emailInput || !urlInput) {
            return { ok: false, error: 'Expected email and URL.' };
        }

        payload[config.emailField] = emailInput.value.trim();
        payload[config.inputField] = urlInput.value.trim();
        inputs.push(emailInput, urlInput);
    }

    const hasMissingValue = Object.values(payload).some(value => !value);
    if (hasMissingValue) {
        return { ok: false, error: 'Please fill all required fields.' };
    }

    return {
        ok: true,
        inputs,
        fetchOptions: {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }
    };
}

function displayResult(outputElement, data, isSuccess) {
    outputElement.classList.add('active');
    outputElement.classList.remove('success', 'error');
    outputElement.classList.add(isSuccess ? 'success' : 'error');

    if (!isSuccess) {
        outputElement.innerHTML = `<strong>Error:</strong> ${escapeHtml(data.error || 'Unknown error')}`;
        return;
    }

    const result = data.result ? JSON.stringify(data.result, null, 2) : JSON.stringify(data, null, 2);
    outputElement.innerHTML = '<strong>Automation completed</strong><pre style="margin-top:10px;white-space:pre-wrap;">' + escapeHtml(result) + '</pre>';
}

function showError(message) {
    alert(message);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
