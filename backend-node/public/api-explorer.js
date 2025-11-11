let apiData = null;

// Get token from URL parameter or localStorage
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token') || localStorage.getItem('access_token');

// Debug: Log token status
console.log('Token found:', token ? 'Yes' : 'No');
console.log('Token length:', token ? token.length : 0);

// Load API documentation
async function loadApiDocs() {
    // Check if token exists
    if (!token || token === 'null' || token === 'undefined') {
        document.getElementById('loading').style.display = 'none';
        const errorDiv = document.getElementById('error');
        errorDiv.innerHTML = `
            <strong>🔑 No Authentication Token</strong><br>
            Please login as an admin first, then return to this page.<br><br>
            <a href="http://localhost:3000/admin" style="color: #667eea; text-decoration: underline;">← Back to Admin Dashboard</a>
        `;
        errorDiv.style.display = 'block';
        return;
    }

    try {
        console.log('Fetching API docs...');
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch('/api/docs/endpoints', {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Response status:', response.status);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Authentication failed. Please ensure you are logged in as an admin user.');
            }
            throw new Error(`Failed to load API documentation (Status: ${response.status}). Please check if the backend server is running.`);
        }

        apiData = await response.json();
        console.log('API docs loaded successfully');
        document.getElementById('loading').style.display = 'none';
        document.getElementById('content').style.display = 'block';
        renderCategories(apiData.categories);
    } catch (error) {
        console.error('Error loading API docs:', error);
        document.getElementById('loading').style.display = 'none';
        const errorDiv = document.getElementById('error');
        
        if (error.name === 'AbortError') {
            errorDiv.innerHTML = `
                <strong>⏱️ Request Timeout</strong><br>
                The backend server is not responding. Please ensure:<br>
                1. Backend server is running: <code>cd backend-node && npm start</code><br>
                2. Server is accessible at: <code>http://localhost:8000</code><br>
                3. You are logged in as an admin user
            `;
        } else if (error.message.includes('Failed to fetch')) {
            errorDiv.innerHTML = `
                <strong>🔌 Connection Error</strong><br>
                Cannot connect to the backend server. Please:<br>
                1. Start the backend: <code>cd backend-node && npm start</code><br>
                2. Verify it's running at: <code>http://localhost:8000</code><br>
                3. Check your network connection
            `;
        } else {
            errorDiv.innerHTML = `<strong>❌ Error:</strong> ${error.message}`;
        }
        
        errorDiv.style.display = 'block';
    }
}

// Render categories
function renderCategories(categories) {
    const container = document.getElementById('categories');
    container.innerHTML = '';

    categories.forEach((category, index) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'category';
        categoryDiv.innerHTML = `
            <div class="category-header" onclick="toggleCategory(${index})">
                <h2>${category.name}</h2>
                <p class="category-description">${category.description}</p>
                <span class="endpoint-count">${category.endpoints.length} endpoints</span>
            </div>
            <div class="endpoints" id="category-${index}">
                ${category.endpoints.map((endpoint, eIndex) => renderEndpoint(endpoint, index, eIndex)).join('')}
            </div>
        `;
        container.appendChild(categoryDiv);
    });

    // Expand first category by default
    if (categories.length > 0) {
        document.getElementById('category-0').classList.add('show');
    }
}

// Render endpoint
function renderEndpoint(endpoint, catIndex, epIndex) {
    const id = `endpoint-${catIndex}-${epIndex}`;
    return `
        <div class="endpoint">
            <div class="endpoint-summary" onclick="toggleEndpoint('${id}')">
                <span class="method method-${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                <span class="path">${endpoint.path}</span>
                <span class="description">${endpoint.description}</span>
                ${endpoint.requiresAuth ? '<span class="auth-badge">🔒 Auth Required</span>' : ''}
            </div>
            <div class="endpoint-details" id="${id}">
                <div class="detail-section">
                    <h4>Details</h4>
                    <p><strong>Full URL:</strong> <code>${apiData.baseUrl}${endpoint.path}</code></p>
                    ${endpoint.roles ? `<p><strong>Required Roles:</strong> ${endpoint.roles.map(r => `<span class="role-badge">${r}</span>`).join('')}</p>` : ''}
                    ${endpoint.contentType ? `<p><strong>Content Type:</strong> <code>${endpoint.contentType}</code></p>` : ''}
                </div>
                ${endpoint.body ? `
                    <div class="detail-section">
                        <h4>Request Body</h4>
                        <pre class="code-block">${JSON.stringify(endpoint.body, null, 2)}</pre>
                    </div>
                ` : ''}
                ${endpoint.queryParams ? `
                    <div class="detail-section">
                        <h4>Query Parameters</h4>
                        <pre class="code-block">${JSON.stringify(endpoint.queryParams, null, 2)}</pre>
                    </div>
                ` : ''}
                ${endpoint.response ? `
                    <div class="detail-section">
                        <h4>Response Example</h4>
                        <pre class="code-block">${JSON.stringify(endpoint.response, null, 2)}</pre>
                    </div>
                ` : ''}
                <div class="detail-section">
                    <h4>cURL Example</h4>
                    <pre class="code-block" id="curl-${id}">${generateCurl(endpoint)}</pre>
                    <button class="copy-button" onclick="copyCurl('curl-${id}')">📋 Copy cURL</button>
                </div>
            </div>
        </div>
    `;
}

// Generate cURL command
function generateCurl(endpoint) {
    let curl = `curl -X ${endpoint.method} "${apiData.baseUrl}${endpoint.path}"`;
    
    if (endpoint.requiresAuth) {
        curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    }
    
    if (endpoint.method !== 'GET' && endpoint.body) {
        curl += ` \\\n  -H "Content-Type: application/json"`;
        curl += ` \\\n  -d '${JSON.stringify(endpoint.body)}'`;
    }
    
    return curl;
}

// Toggle category
function toggleCategory(index) {
    const element = document.getElementById(`category-${index}`);
    element.classList.toggle('show');
}

// Toggle endpoint
function toggleEndpoint(id) {
    const element = document.getElementById(id);
    element.classList.toggle('show');
}

// Copy cURL
function copyCurl(id) {
    const element = document.getElementById(id);
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert('cURL command copied to clipboard!');
    });
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!apiData) return;

            const filtered = apiData.categories.map(cat => ({
                ...cat,
                endpoints: cat.endpoints.filter(ep => 
                    ep.path.toLowerCase().includes(query) ||
                    ep.description.toLowerCase().includes(query) ||
                    ep.method.toLowerCase().includes(query)
                )
            })).filter(cat => cat.endpoints.length > 0);

            renderCategories(query ? filtered : apiData.categories);
        });
    }

    // Load API docs on page load
    loadApiDocs();
});
