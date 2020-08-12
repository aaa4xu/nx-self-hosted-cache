const http = require('http');

const request = http.request(
  {
    host: 'localhost',
    port: '80',
    timeout: 2000,
    path: '/metrics',
  },
  (res) => {
    process.exit(res.statusCode === 200 ? 0 : 1);
  },
);

request.on('error', () => process.exit(1));
request.end();
