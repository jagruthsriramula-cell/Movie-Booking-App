const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const PORT = 4000;
const BACKEND = "http://localhost:3000";
const ROOT = path.join(__dirname);
const MIME = { ".html":"text/html", ".js":"application/javascript", ".css":"text/css", ".json":"application/json", ".png":"image/png", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".ico":"image/x-icon" };
function proxy(req, res) {
  const target = new URL(BACKEND + req.url.slice(4));
  const request = http.request({ hostname:target.hostname, port:target.port, path:target.pathname + target.search, method:req.method, headers:{...req.headers, host:`localhost:${target.port}`} }, response => { res.writeHead(response.statusCode, response.headers); response.pipe(res); });
  request.on("error", () => { res.writeHead(502, {"Content-Type":"application/json"}); res.end(JSON.stringify({message:"Backend server is not running on port 3000"})); });
  req.pipe(request);
}
http.createServer((req,res) => {
  if (req.url.startsWith("/api/")) return proxy(req,res);
  let requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (requestPath === "/") requestPath = "/index.html";
  const filePath = path.normalize(path.join(ROOT, requestPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(filePath, (err,data) => { if (err) { res.writeHead(404, {"Content-Type":"text/plain"}); return res.end("Not found"); } res.writeHead(200, {"Content-Type":MIME[path.extname(filePath)] || "application/octet-stream"}); res.end(data); });
}).listen(PORT, () => console.log(`Frontend running on http://localhost:${PORT}`));
