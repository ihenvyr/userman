const http = require('http');
const httpProxy = require('http-proxy');
const debug = require('debug')('http');
const axios = require('axios');
const target = { ip: '192.168.1.2' };

const sleep = (timeout) => new Promise(resolve => setTimeout(() => resolve(), timeout));

proxy = httpProxy.createProxyServer({});

proxy.on('error', (error) => {
  debug(`${target.ip}: ${error}`);
});

const server = http.createServer(async (req, res) => {
  if (req.url.includes('/check/')) {
    const ip = req.url.replace('/check/', '');
    const message = await axios.get(`http://${ip}`, { timeout: 4000 }).then(() => 'valid').catch(() => 'invalid');

    if (message === 'valid') {
      target.ip = ip;
    }

    return res.end(JSON.stringify({ message }));
  }

  proxy.web(req, res, {
    target: `http://${target.ip}`
  });
});

console.log("listening on port 8000");
server.listen(8000);