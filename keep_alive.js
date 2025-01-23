const http = require('http');
const server = http.createServer((req, res) => { res.end('Bot is alive!'); });
server.listen(3000);