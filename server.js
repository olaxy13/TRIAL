const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser"); //In order to get access to the post data we have to use body-parser. Basically what the body-parser is which allows express to read the body and then parse that into a Json object that we can understand
const passport = require("passport"); //to privatise routes

const users = require("./routes/api/users");
const leaves = require("./routes/api/leaves");
const company = require("./routes/api/company");
const employee = require("./routes/api/employee");
// const email = require("./routes/api/email")
// const posts = require("./routes/api/posts");

const app = express();
app.get('/', (req, res) => res.send('Hello World'));

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// //DB Config
const db = require("./config/key").mongoURI;

//Connect to MongoDB through mongoose
// mongoose
//   .connect(db)
//   .then(() => console.log("MongoDB Conected"))
//   .catch((err) => console.log(err));

//Passport middleware
app.use(passport.initialize());

//Passport Config
require("./config/passport")(passport);

//we would be putting our route in different files using the express route
//we use it to connect to our files or variables repectively
app.use("/api/users", users);
app.use("/api/leaves", leaves);
app.use("/api/company", company);
app.use("/api/employee", employee);

const port = process.env.PORT || 5000; //incase we want to send to heroku

app.listen(port, () =>
  console.log(`Server Welcomes you to a new world  running on ${port}`)
);

