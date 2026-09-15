const https = require('https');
const options = {
  hostname: 'auranova-backend.onrender.com',
  port: 443,
  path: '/api/admin/orders',
  method: 'GET',
};
// Wait, I need an admin token to call /api/admin/orders.
