require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const HttpError = require("./utils/http-error");
const mongoose = require("mongoose");
const cors = require("cors");

const contestRoutes = require("./routes/contest-routes");
const usersRoutes = require("./routes/users-routes");
const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/api/contest", contestRoutes);
app.use("/api/users", usersRoutes);

app.get("/", (req, res, next) => {
  res.status(200).json({
    message: "Success to build backend app",
  });
});

app.use((req, res, next) => {
  throw new HttpError("Tidak dapat menemukan rute yang diminta.", 404);
});
app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500).json({
    message: error.message || "Kesalahan server/koneksi, silakan coba lagi.",
  });
});

mongoose
  .connect(process.env.DATABASE_URL, { useNewUrlParser: true })
  .then(() => app.listen(5000))
  .catch((err) => {
    console.log(err);
  });
