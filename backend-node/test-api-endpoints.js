const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:8000/api';
let authToken = null;
let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  errors: []
};

// Test data
const testData = {
  admin: {
    email: 'admin@healthtime.com',
    password: 'admin123'
  },
  doctor: {
    email: 'doctor@healthtime.com',
    password: 'doctor123'
  },
  patient: {
    email: 'patient@healthtime.com',
    password: 'patient123'
  }
};

// Helper functions
function logTest(testName, status, message = '') {
  testResults.total++;
  if (status === 'PASS') {
    testResults.passed++;
    console.log(`✅ ${testName}`.green);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${message}`.red);
    testResults.errors.push({ test: testName, error: message });
  }
}

function logSection(sectionName) {
  console.log(`\n${'='.repeat(50)}`.cyan);
  console.log(`Testing: ${sectionName}`.cyan.bold);
  console.log(`${'='.repeat(50)}`.cyan);
}

async function makeRequest(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {}
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testAuthentication() {
  logSection('Authentication APIs');
  
  // Test login
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: testData.admin.email,
    password: testData.admin.password
  });

  if (loginResult.success && loginResult.data.token) {
    authToken = loginResult.data.token;
    logTest('Admin Login', 'PASS');
  } else {
    logTest('Admin Login', 'FAIL', loginResult.error);
    return false;
  }

  // Test token validation
  const profileResult = await makeRequest('GET', '/auth/profile', null, authToken);
  if (profileResult.success) {
    logTest('Token Validation', 'PASS');
  } else {
    logTest('Token Validation', 'FAIL', profileResult.error);
  }

  return true;
}

async function testHospitalAvailability() {
  logSection('Hospital Availability APIs');

  // Test GET all availability
  const getAllResult = await makeRequest('GET', '/hospital-availability', null, authToken);
  logTest('GET Hospital Availability', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET nearby search
  const nearbyResult = await makeRequest('GET', '/hospital-availability/search/nearby?latitude=12.9716&longitude=77.5946&radius=25', null, authToken);
  logTest('GET Nearby Hospital Facilities', nearbyResult.success ? 'PASS' : 'FAIL', nearbyResult.error);

  // Test POST create availability (would need valid hospital_id)
  const createData = {
    hospital_id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
    facility_type: 'operation_theater',
    facility_name: 'OT-1',
    available_date: '2024-12-01',
    available_time_slots: [{ start: '09:00', end: '17:00', status: 'available' }],
    facility_cost_per_hour: 5000
  };
  
  const createResult = await makeRequest('POST', '/hospital-availability', createData, authToken);
  logTest('POST Create Hospital Availability', createResult.status === 404 ? 'PASS' : 'FAIL', 'Expected 404 for non-existent hospital');
}

async function testDoctorAvailability() {
  logSection('Doctor Availability APIs');

  // Test GET all availability
  const getAllResult = await makeRequest('GET', '/doctor-availability', null, authToken);
  logTest('GET Doctor Availability', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET traveling doctors
  const travelingResult = await makeRequest('GET', '/doctor-availability/search/traveling?target_city=Hyderabad', null, authToken);
  logTest('GET Traveling Doctors', travelingResult.success ? 'PASS' : 'FAIL', travelingResult.error);
}

async function testReviews() {
  logSection('Reviews APIs');

  // Test GET all reviews
  const getAllResult = await makeRequest('GET', '/reviews');
  logTest('GET Reviews (Public)', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET reviews for entity
  const entityResult = await makeRequest('GET', '/reviews/entity/doctor/123e4567-e89b-12d3-a456-426614174000');
  logTest('GET Entity Reviews', entityResult.success ? 'PASS' : 'FAIL', entityResult.error);

  // Test POST create review (requires auth)
  const createData = {
    reviewable_type: 'doctor',
    reviewable_id: '123e4567-e89b-12d3-a456-426614174000',
    reviewer_type: 'patient',
    rating: 5,
    review_text: 'Excellent doctor!'
  };
  
  const createResult = await makeRequest('POST', '/reviews', createData, authToken);
  logTest('POST Create Review', createResult.status === 404 ? 'PASS' : 'FAIL', 'Expected 404 for non-existent doctor');
}

async function testTestimonials() {
  logSection('Testimonials APIs');

  // Test GET featured testimonials
  const featuredResult = await makeRequest('GET', '/testimonials/featured');
  logTest('GET Featured Testimonials', featuredResult.success ? 'PASS' : 'FAIL', featuredResult.error);

  // Test GET all testimonials
  const getAllResult = await makeRequest('GET', '/testimonials');
  logTest('GET All Testimonials', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET doctor testimonials
  const doctorResult = await makeRequest('GET', '/testimonials/doctor/123e4567-e89b-12d3-a456-426614174000');
  logTest('GET Doctor Testimonials', doctorResult.success ? 'PASS' : 'FAIL', doctorResult.error);
}

async function testServiceTiles() {
  logSection('Service Tiles APIs');

  // Test GET active service tiles
  const activeResult = await makeRequest('GET', '/service-tiles/active');
  logTest('GET Active Service Tiles', activeResult.success ? 'PASS' : 'FAIL', activeResult.error);

  // Test GET all service tiles
  const getAllResult = await makeRequest('GET', '/service-tiles');
  logTest('GET All Service Tiles', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test search service tiles
  const searchResult = await makeRequest('GET', '/service-tiles/search?q=orthopedic');
  logTest('Search Service Tiles', searchResult.success ? 'PASS' : 'FAIL', searchResult.error);

  // Test POST create service tile (admin only)
  const createData = {
    service_name: 'test_surgery',
    display_name: 'Test Surgery',
    description: 'Test surgery for API testing',
    avg_cost_min: 10000,
    avg_cost_max: 50000
  };
  
  const createResult = await makeRequest('POST', '/service-tiles', createData, authToken);
  logTest('POST Create Service Tile', createResult.success ? 'PASS' : 'FAIL', createResult.error);
}

async function testFeaturedContent() {
  logSection('Featured Content APIs');

  // Test GET landing page content
  const landingResult = await makeRequest('GET', '/featured-content/landing');
  logTest('GET Landing Page Content', landingResult.success ? 'PASS' : 'FAIL', landingResult.error);

  // Test GET all featured content
  const getAllResult = await makeRequest('GET', '/featured-content');
  logTest('GET All Featured Content', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET stats (admin only)
  const statsResult = await makeRequest('GET', '/featured-content/stats', null, authToken);
  logTest('GET Featured Content Stats', statsResult.success ? 'PASS' : 'FAIL', statsResult.error);
}

async function testFeatureConfigurations() {
  logSection('Feature Configurations APIs');

  // Test GET active configuration
  const activeResult = await makeRequest('GET', '/feature-configurations/active');
  logTest('GET Active Configuration', activeResult.success ? 'PASS' : 'FAIL', activeResult.error);

  // Test GET all configurations (admin only)
  const getAllResult = await makeRequest('GET', '/feature-configurations', null, authToken);
  logTest('GET All Configurations', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET by deployment ID
  const deploymentResult = await makeRequest('GET', '/feature-configurations/deployment/default_healthtime');
  logTest('GET Configuration by Deployment ID', deploymentResult.success ? 'PASS' : 'FAIL', deploymentResult.error);
}

async function testOTPLogs() {
  logSection('OTP Management APIs');

  // Test POST generate OTP
  const generateData = {
    phone: '+919876543210',
    otp_type: 'login',
    delivery_method: 'sms'
  };
  
  const generateResult = await makeRequest('POST', '/otp-logs/generate', generateData);
  logTest('POST Generate OTP', generateResult.success ? 'PASS' : 'FAIL', generateResult.error);

  // Test POST verify OTP (will fail with invalid OTP)
  const verifyData = {
    otp_code: '123456',
    phone: '+919876543210',
    otp_type: 'login'
  };
  
  const verifyResult = await makeRequest('POST', '/otp-logs/verify', verifyData);
  logTest('POST Verify OTP', verifyResult.status === 400 ? 'PASS' : 'FAIL', 'Expected 400 for invalid OTP');

  // Test GET OTP logs (admin only)
  const logsResult = await makeRequest('GET', '/otp-logs', null, authToken);
  logTest('GET OTP Logs', logsResult.success ? 'PASS' : 'FAIL', logsResult.error);

  // Test GET OTP stats (admin only)
  const statsResult = await makeRequest('GET', '/otp-logs/stats', null, authToken);
  logTest('GET OTP Statistics', statsResult.success ? 'PASS' : 'FAIL', statsResult.error);
}

async function testCommissionAgreements() {
  logSection('Commission Agreements APIs');

  // Test GET all agreements (admin only)
  const getAllResult = await makeRequest('GET', '/commission-agreements', null, authToken);
  logTest('GET Commission Agreements', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET active agreements (admin only)
  const activeResult = await makeRequest('GET', '/commission-agreements/active', null, authToken);
  logTest('GET Active Agreements', activeResult.success ? 'PASS' : 'FAIL', activeResult.error);

  // Test GET stats (admin only)
  const statsResult = await makeRequest('GET', '/commission-agreements/stats', null, authToken);
  logTest('GET Agreement Statistics', statsResult.success ? 'PASS' : 'FAIL', statsResult.error);
}

async function testCommissionTransactions() {
  logSection('Commission Transactions APIs');

  // Test GET all transactions (admin only)
  const getAllResult = await makeRequest('GET', '/commission-transactions', null, authToken);
  logTest('GET Commission Transactions', getAllResult.success ? 'PASS' : 'FAIL', getAllResult.error);

  // Test GET stats (admin only)
  const statsResult = await makeRequest('GET', '/commission-transactions/stats', null, authToken);
  logTest('GET Transaction Statistics', statsResult.success ? 'PASS' : 'FAIL', statsResult.error);
}

async function testLandingPageAnalytics() {
  logSection('Landing Page Analytics APIs');

  // Test POST track interaction
  const trackData = {
    session_id: 'test-session-123',
    clicked_tile: 'orthopedic',
    page_section: 'service_tiles',
    user_location: { city: 'Hyderabad', country: 'India' }
  };
  
  const trackResult = await makeRequest('POST', '/landing-page-analytics/track', trackData);
  logTest('POST Track Analytics', trackResult.success ? 'PASS' : 'FAIL', trackResult.error);

  // Test GET analytics data (admin only)
  const analyticsResult = await makeRequest('GET', '/landing-page-analytics', null, authToken);
  logTest('GET Analytics Data', analyticsResult.success ? 'PASS' : 'FAIL', analyticsResult.error);

  // Test GET dashboard (admin only)
  const dashboardResult = await makeRequest('GET', '/landing-page-analytics/dashboard', null, authToken);
  logTest('GET Analytics Dashboard', dashboardResult.success ? 'PASS' : 'FAIL', dashboardResult.error);

  // Test GET heatmap (admin only)
  const heatmapResult = await makeRequest('GET', '/landing-page-analytics/heatmap', null, authToken);
  logTest('GET Analytics Heatmap', heatmapResult.success ? 'PASS' : 'FAIL', heatmapResult.error);
}

async function testExistingAPIs() {
  logSection('Existing Core APIs');

  // Test patients API
  const patientsResult = await makeRequest('GET', '/patients', null, authToken);
  logTest('GET Patients', patientsResult.success ? 'PASS' : 'FAIL', patientsResult.error);

  // Test doctors API
  const doctorsResult = await makeRequest('GET', '/doctors', null, authToken);
  logTest('GET Doctors', doctorsResult.success ? 'PASS' : 'FAIL', doctorsResult.error);

  // Test hospitals API
  const hospitalsResult = await makeRequest('GET', '/hospitals', null, authToken);
  logTest('GET Hospitals', hospitalsResult.success ? 'PASS' : 'FAIL', hospitalsResult.error);

  // Test surgeries API
  const surgeriesResult = await makeRequest('GET', '/surgeries', null, authToken);
  logTest('GET Surgeries', surgeriesResult.success ? 'PASS' : 'FAIL', surgeriesResult.error);

  // Test implants API
  const implantsResult = await makeRequest('GET', '/implants', null, authToken);
  logTest('GET Implants', implantsResult.success ? 'PASS' : 'FAIL', implantsResult.error);

  // Test bookings API
  const bookingsResult = await makeRequest('GET', '/bookings', null, authToken);
  logTest('GET Bookings', bookingsResult.success ? 'PASS' : 'FAIL', bookingsResult.error);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting HealthTime API Endpoint Tests'.blue.bold);
  console.log(`Base URL: ${BASE_URL}`.gray);
  console.log(`Timestamp: ${new Date().toISOString()}`.gray);

  try {
    // Test authentication first
    const authSuccess = await testAuthentication();
    if (!authSuccess) {
      console.log('\n❌ Authentication failed. Skipping tests that require auth.'.red);
      return;
    }

    // Test all new APIs
    await testHospitalAvailability();
    await testDoctorAvailability();
    await testReviews();
    await testTestimonials();
    await testServiceTiles();
    await testFeaturedContent();
    await testFeatureConfigurations();
    await testOTPLogs();
    await testCommissionAgreements();
    await testCommissionTransactions();
    await testLandingPageAnalytics();

    // Test existing APIs
    await testExistingAPIs();

  } catch (error) {
    console.error('Test runner error:', error.message);
  }

  // Print summary
  console.log(`\n${'='.repeat(50)}`.cyan);
  console.log('TEST SUMMARY'.cyan.bold);
  console.log(`${'='.repeat(50)}`.cyan);
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`.green);
  console.log(`Failed: ${testResults.failed}`.red);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

  if (testResults.errors.length > 0) {
    console.log('\nFailed Tests:'.red.bold);
    testResults.errors.forEach(error => {
      console.log(`- ${error.test}: ${error.error}`.red);
    });
  }

  console.log('\n✨ API Testing Complete!'.blue.bold);
}

// Check if server is running
async function checkServerHealth() {
  try {
    const response = await makeRequest('GET', '/');
    if (response.success) {
      console.log('✅ Server is running and accessible'.green);
      return true;
    } else {
      console.log('❌ Server health check failed'.red);
      return false;
    }
  } catch (error) {
    console.log(`❌ Cannot connect to server at ${BASE_URL}`.red);
    console.log('Please ensure the server is running with: npm start'.yellow);
    return false;
  }
}

// Run tests
async function main() {
  const serverHealthy = await checkServerHealth();
  if (serverHealthy) {
    await runAllTests();
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runAllTests,
  checkServerHealth,
  testResults
};
