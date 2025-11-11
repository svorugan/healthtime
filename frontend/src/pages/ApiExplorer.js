import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

const ApiExplorer = () => {
  const [apiDocs, setApiDocs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);

  useEffect(() => {
    loadApiDocs();
  }, []);

  const loadApiDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token || token === 'null') {
        setError('Please login as an admin first.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/docs/endpoints`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });

      setApiDocs(response.data);
      // Expand first category by default
      if (response.data.categories.length > 0) {
        setExpandedCategories({ [response.data.categories[0].name]: true });
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading API docs:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please ensure the backend server is running.');
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Authentication failed. Please ensure you are logged in as an admin.');
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to backend server. Please check if it\'s running.');
      } else {
        setError(err.response?.data?.detail || err.message || 'Failed to load API documentation');
      }
      setLoading(false);
    }
  };

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const toggleEndpoint = (endpoint) => {
    setSelectedEndpoint(selectedEndpoint === endpoint ? null : endpoint);
  };

  const getFilteredCategories = () => {
    if (!apiDocs || !searchQuery) return apiDocs?.categories || [];

    const query = searchQuery.toLowerCase();
    return apiDocs.categories
      .map(category => ({
        ...category,
        endpoints: category.endpoints.filter(endpoint =>
          endpoint.path.toLowerCase().includes(query) ||
          endpoint.description.toLowerCase().includes(query) ||
          endpoint.method.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.endpoints.length > 0);
  };

  const generateCurl = (endpoint) => {
    let curl = `curl -X ${endpoint.method} "${apiDocs.baseUrl}${endpoint.path}"`;
    
    if (endpoint.requiresAuth) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    }
    
    if (endpoint.method !== 'GET' && endpoint.body) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${JSON.stringify(endpoint.body)}'`;
    }
    
    return curl;
  };

  const copyCurl = (endpoint) => {
    const curl = generateCurl(endpoint);
    navigator.clipboard.writeText(curl).then(() => {
      alert('cURL command copied to clipboard!');
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading API documentation...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8">
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-bold text-xl mb-2">❌ Error</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.history.back()}
                className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-2xl p-8 mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔌 API Explorer</h1>
          <p className="text-gray-600 text-lg">Explore and test all backend API endpoints</p>
          
          {apiDocs && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">VERSION</p>
                <p className="text-2xl font-bold text-purple-600">{apiDocs.version}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">BASE URL</p>
                <p className="text-sm font-mono text-blue-600 truncate">{apiDocs.baseUrl}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-semibold">ENDPOINTS</p>
                <p className="text-2xl font-bold text-green-600">
                  {apiDocs.categories.reduce((sum, cat) => sum + cat.endpoints.length, 0)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search endpoints by path, method, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
          />
        </div>

        {/* Categories */}
        <div className="space-y-4">
          {getFilteredCategories().map((category) => (
            <div key={category.name} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Category Header */}
              <div
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 cursor-pointer hover:from-gray-100 hover:to-gray-200 transition"
                onClick={() => toggleCategory(category.name)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-1">
                      {expandedCategories[category.name] ? '▼' : '▶'} {category.name}
                    </h2>
                    <p className="text-gray-600">{category.description}</p>
                  </div>
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold">
                    {category.endpoints.length} endpoints
                  </span>
                </div>
              </div>

              {/* Endpoints */}
              {expandedCategories[category.name] && (
                <div className="p-4 space-y-3">
                  {category.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-400 transition">
                      {/* Endpoint Summary */}
                      <div
                        className="p-4 cursor-pointer hover:bg-gray-50 transition flex items-center gap-4 flex-wrap"
                        onClick={() => toggleEndpoint(endpoint)}
                      >
                        <span className={`px-3 py-1 rounded font-bold text-sm uppercase min-w-[80px] text-center ${
                          endpoint.method === 'GET' ? 'bg-blue-500 text-white' :
                          endpoint.method === 'POST' ? 'bg-green-500 text-white' :
                          endpoint.method === 'PUT' ? 'bg-orange-500 text-white' :
                          endpoint.method === 'PATCH' ? 'bg-cyan-500 text-white' :
                          'bg-red-500 text-white'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="font-mono font-semibold text-gray-800 flex-1 min-w-[200px]">
                          {endpoint.path}
                        </span>
                        <span className="text-gray-600 flex-[2] min-w-[200px]">
                          {endpoint.description}
                        </span>
                        {endpoint.requiresAuth && (
                          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                            🔒 Auth Required
                          </span>
                        )}
                      </div>

                      {/* Endpoint Details */}
                      {selectedEndpoint === endpoint && (
                        <div className="bg-gray-50 p-6 border-t-2 border-gray-200">
                          {/* Details Section */}
                          <div className="mb-6">
                            <h4 className="text-purple-600 font-bold text-lg mb-3">Details</h4>
                            <div className="space-y-2">
                              <p><strong>Full URL:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{apiDocs.baseUrl}{endpoint.path}</code></p>
                              {endpoint.roles && (
                                <p>
                                  <strong>Required Roles:</strong>{' '}
                                  {endpoint.roles.map((role, i) => (
                                    <span key={i} className="bg-purple-600 text-white px-2 py-1 rounded text-sm mr-2">
                                      {role}
                                    </span>
                                  ))}
                                </p>
                              )}
                              {endpoint.contentType && (
                                <p><strong>Content Type:</strong> <code className="bg-gray-200 px-2 py-1 rounded">{endpoint.contentType}</code></p>
                              )}
                            </div>
                          </div>

                          {/* Request Body */}
                          {endpoint.body && (
                            <div className="mb-6">
                              <h4 className="text-purple-600 font-bold text-lg mb-3">Request Body</h4>
                              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {JSON.stringify(endpoint.body, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Query Parameters */}
                          {endpoint.queryParams && (
                            <div className="mb-6">
                              <h4 className="text-purple-600 font-bold text-lg mb-3">Query Parameters</h4>
                              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {JSON.stringify(endpoint.queryParams, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* Response Example */}
                          {endpoint.response && (
                            <div className="mb-6">
                              <h4 className="text-purple-600 font-bold text-lg mb-3">Response Example</h4>
                              <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                                {JSON.stringify(endpoint.response, null, 2)}
                              </pre>
                            </div>
                          )}

                          {/* cURL Example */}
                          <div>
                            <h4 className="text-purple-600 font-bold text-lg mb-3">cURL Example</h4>
                            <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-sm mb-2">
                              {generateCurl(endpoint)}
                            </pre>
                            <button
                              onClick={() => copyCurl(endpoint)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                            >
                              📋 Copy cURL
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiExplorer;
