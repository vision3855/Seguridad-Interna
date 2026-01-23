const express = require("express");
const connectDB = require("./db/connect.js");
const patanaRoutes = require("./routes/patana.routes.js");
require("dotenv").config();

const app = express();
app.use(express.json());

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss");
const rateLimiter = require("express-rate-limit");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(express.json());

app.use(helmet());
app.use(cors());
const sanitize = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  sanitize(req.body);
  sanitize(req.params);
  sanitize(req.query);
  next();
});

app.use("/patana", patanaRoutes);

app.get("/", (req, res) => {
  res.send("Well well");
});

const PORT = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, console.log(`server is listening on port ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

start();
