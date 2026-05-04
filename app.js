const express = require("express");
const connectDB = require("./db/connect.js");
const patanaRoutes = require("./routes/patana.routes.js");
const ingresoRoutes = require("./routes/ingresoPatana.routes.js");
//const imageRoutes = require('./routes/imagesRoutes');
const imageRoutes = require('./routes/imagesRoute.js');
const visitRoutes = require('./routes/visitReport.route.js');
const filterRoutes = require("./routes/PatanaRoutes.js");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss");
const rateLimiter = require("express-rate-limit");
const authRoutes = require('./routes/authRoutes');

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  }),
);
app.use(express.json());

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors({
  origin: '*', // Allow all origins, or specify your React app URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

//patch test

const sanitize = (obj) => {
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    }
  }
};
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  sanitize(req.body);
  sanitize(req.params);
  sanitize(req.query);
  next();
});

app.use('/api/auth', authRoutes)
app.use('/api/images', imageRoutes);
app.use("/patana", patanaRoutes);
app.use("/ingreso", ingresoRoutes);
app.use("/visit", visitRoutes);
app.use("/api/patanas", filterRoutes);

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
