const http = require('http');

http.get('http://127.0.0.1:5000/api/health', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Health Check Response:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});
