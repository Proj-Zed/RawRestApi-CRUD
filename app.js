const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const routes = require("./Routes/index");
require("dotenv").config();

const app = express();
const dbURI = process.env.DATABASE_URI;
const port = process.env.PORT;

//Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(helmet());

const limiter = rateLimit({
  max: 3000, // 3000 request
  windowMs: 60 * 60 * 1000, //In one hour
  message: "Too many request from this IP, please try again in an hour",
});

//Routes
app.use("/api", limiter);
app.use(routes);

//MongoDB Options
const options = {
  // useNewUrlParser: true,
  //useUnifiedTopology: true,
  // useFindAndModify: false,
  // useCreateIndex: true,
};

mongoose.connect(dbURI, options).then((res) => {
  console.log("Connected in", res.connections[0].name);
  app.listen(port, () => {
    console.log(`Server is running in ${port}`);
  });
});
