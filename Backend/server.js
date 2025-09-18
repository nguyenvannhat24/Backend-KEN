const express = require('express');
const app = express();
const port = 3005;
const userRouter = require("./router/indexRouter");
const login = require("./router/Authentication/login");
require('./config/db'); 
// Route đơn giản
app.get('/', (req, res) => {
  res.send('Hello Node.js Project!');
});

app.use('/api/user', userRouter);

app.use('/api' , login);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
