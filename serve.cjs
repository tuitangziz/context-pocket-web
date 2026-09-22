// Optional local preview. Only app assets are served; no uploads, no dependencies.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assets = {'/':'index.html','/index.html':'index.html','/style.css':'style.css','/core.js':'core.js','/app.js':'app.js','/icon.svg':'icon.svg'};
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'};
const port = Number(process.env.PORT || 8765);
http.createServer((req,res) => {
  const name = assets[new URL(req.url,'http://localhost').pathname];
  if (!name || !['GET','HEAD'].includes(req.method)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, {'Content-Type':types[path.extname(name)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if (req.method === 'HEAD') res.end(); else fs.createReadStream(path.join(__dirname,name)).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Context Pocket: http://127.0.0.1:${port} (Ctrl+C to stop)`));
