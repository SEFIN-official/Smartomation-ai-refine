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

const DEMO_TEST_API_BASE = getApiBase();

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

    const endpoint = resolveEndpoint(config.endpoint);

    fetch(endpoint, state.fetchOptions)
        .then(async response => {
            if (!response.ok) {
                const detail = await extractErrorDetail(response);
                throw new Error(`HTTP ${response.status}${detail ? ` - ${detail}` : ''}`);
            }
            return response.json();
        })
        .then(data => {
            displayResult(output, data, true);
        })
        .catch(error => {
            displayResult(output, {
                error: 'Failed to run automation endpoint.',
                details: error.message,
                endpoint
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
        const message = data && data.error
            ? data.error
            : 'Automation failed. Please try again.';
        outputElement.innerHTML = `<strong>${escapeHtml(message)}</strong>`;
        return;
    }

    const emailAddress = getEmailAddress(data);
    const emailStatus = getEmailStatus(data);

    if (emailStatus === 'sent') {
        outputElement.innerHTML = `<strong>Email sent to ${escapeHtml(emailAddress || 'the provided email')}.</strong><div style="margin-top:6px;">Please check your inbox and spam folder.</div>`;
        return;
    }

    if (emailStatus === 'failed') {
        outputElement.innerHTML = `<strong>Automation completed, but email could not be sent to ${escapeHtml(emailAddress || 'the provided email')}.</strong><div style="margin-top:6px;">Please verify SMTP credentials and try again.</div>`;
        return;
    }

    outputElement.innerHTML = `<strong>Automation completed for ${escapeHtml(emailAddress || 'the provided email')}.</strong><div style="margin-top:6px;">Please check your inbox.</div>`;
}

function getEmailAddress(payload) {
    if (!payload || typeof payload !== 'object') {
        return '';
    }

    if (payload.result && typeof payload.result.email === 'string') {
        return payload.result.email;
    }

    if (typeof payload.email === 'string') {
        return payload.email;
    }

    return '';
}

function getEmailStatus(payload) {
    if (!payload || typeof payload !== 'object') {
        return '';
    }

    if (payload.email && typeof payload.email.status === 'string') {
        return payload.email.status.toLowerCase();
    }

    return '';
}

function showError(message) {
    alert(message);
}

function getApiBase() {
    const metaBase = document
        .querySelector('meta[name="demo-test-api-base"]')
        ?.getAttribute('content')
        ?.trim();

    const windowBase = typeof window.DEMO_TEST_API_BASE === 'string'
        ? window.DEMO_TEST_API_BASE.trim()
        : '';

    const base = metaBase || windowBase || '';
    return base.endsWith('/') ? base.slice(0, -1) : base;
}

function resolveEndpoint(path) {
    return DEMO_TEST_API_BASE ? `${DEMO_TEST_API_BASE}${path}` : path;
}

async function extractErrorDetail(response) {
    try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const payload = await response.json();
            if (payload && typeof payload === 'object') {
                return payload.detail || payload.error || JSON.stringify(payload);
            }
            return String(payload);
        }

        const text = await response.text();
        return text.trim();
    } catch (_error) {
        return '';
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
