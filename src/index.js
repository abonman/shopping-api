const express = require("express");
// require('dotenv').config({path:__dirname+'../config/.env'})
const bodyParser = require("body-parser");
const app = express();
// db
const db = require("./model");
db.sequelize.sync();//{force:true}

// parse requests application/json
app.use(express.json());

// parse requests application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  return res.json({ message: "Welcome to çaroki application." });
});

// listen 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

const userRouter = require('./router/user')
const productRouter = require('./router/product')
const orderRouter = require('./router/order')

app.use(userRouter)
app.use(productRouter)
app.use(orderRouter)

/* 
In development, you may need to drop existing tables and re-sync database. 
Just use force: true as following code:

db.sequelize.sync({ force: true }).then(() => {
  ("Drop and re-sync db.");
}); 

*/