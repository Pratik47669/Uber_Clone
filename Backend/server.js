require('dotenv').config();   // 👈 ye line sabse upar

const http = require('http');
const app = require('./app'); 
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
