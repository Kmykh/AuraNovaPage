import fetch from 'node-fetch';

const baseUrl = 'https://auranova-backend.onrender.com';
const endpoints = [
  '/api/health',
  '/api/products',
  '/api/delivery-zones',
  '/api/meeting-points',
  '/api/payment-info',
  '/api/business-settings'
];

async function testEndpoints() {
  console.log('Testing live backend endpoints...\n');
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`);
      if (res.ok) {
        console.log(`✅ [${res.status}] GET ${endpoint} - SUCCESS`);
      } else {
        console.log(`❌ [${res.status}] GET ${endpoint} - FAILED`);
      }
    } catch (error) {
      console.log(`❌ GET ${endpoint} - ERROR: ${error.message}`);
    }
  }
}

testEndpoints();
