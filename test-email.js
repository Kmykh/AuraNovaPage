const http = require('http');

const data = JSON.stringify({
  order: {
    orderCode: 'PED-TEST-123',
    trackingToken: 'TOKEN-ABC-789'
  },
  customer: {
    email: 'test@example.com'
  },
  items: [],
  subtotal: 0,
  deliveryType: 0,
  estimatedDeliveryCost: 0,
  emailType: 'receipt',
  preview: true
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/send-email',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    if (body.includes('TOKEN-ABC-789')) {
      console.log('SUCCESS: Tracking token found in email HTML!');
    } else {
      console.log('FAILED: Tracking token NOT found in email HTML.');
      console.log(body);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(data);
req.end();
