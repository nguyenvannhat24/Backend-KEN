const express = require('express');
const app = express();
const port = 3005;
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const userRouter = require("./router/auth.routes");

const memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

const keycloak = new Keycloak({ store: memoryStore });
app.use(keycloak.middleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

require('./config/db'); 

// routes
app.use('/api', userRouter(keycloak));

app.listen(port, () => {
  console.log(`✅ Server is running at http://localhost:${port}`);
});
