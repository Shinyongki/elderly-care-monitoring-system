const http = require('http');
const path = require('path');
const fs = require('fs');

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/' || req.url === '/index.html') {
    const indexPath = path.join(__dirname, 'client', 'index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Elderly Care Monitoring</title>
          <meta charset="utf-8">
        </head>
        <body>
          <h1>노인돌봄서비스 현장 모니터링 시스템</h1>
          <p>서버가 정상적으로 실행되고 있습니다!</p>
          <p>포트: 4000</p>
          <p>시간: ${new Date().toLocaleString()}</p>
          <div>
            <h2>테스트 페이지</h2>
            <button onclick="testApi()">API 테스트</button>
            <div id="result"></div>
          </div>
          <script>
            function testApi() {
              document.getElementById('result').innerHTML = '✅ 서버 연결 성공!';
            }
          </script>
        </body>
        </html>
      `);
    }
  } else if (req.url.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      message: 'API 서버 정상 작동', 
      timestamp: new Date().toISOString(),
      url: req.url 
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end('<h1>404 - Page Not Found</h1>');
  }
});

const PORT = 4000;
server.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ Simple HTTP Server running at http://localhost:${PORT}`);
  console.log(`✅ Time: ${new Date().toLocaleString()}`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});