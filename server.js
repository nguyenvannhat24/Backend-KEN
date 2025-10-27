// server.js
const http = require("http");
const app = require("./app");
const { initSocket } = require("./config/socket");

const port = process.env.PORT || 3005;
const server = http.createServer(app);

initSocket(server);

server.listen(port, () => {
  console.log(`✅ Server is running on port ${port}`);
});
