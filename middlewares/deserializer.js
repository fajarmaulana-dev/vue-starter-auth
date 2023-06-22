require("dotenv").config();
const HttpError = require("../utils/http-error");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    let access_token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      access_token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.access_token) {
      access_token = req.cookies.access_token;
    }
    if (!access_token) return next(new HttpError("Autentikasi gagal", 403));
    const decoded = jwt.verify(access_token, process.env.SECRET_KEY);
    if (!decoded)
      return next(
        new HttpError(
          "Token tidak valid atau kamu mungkin belum terdaftar sebagai panitia FIM.",
          403
        )
      );
    const exist = await User.findById(decoded.userId);
    if (!exist)
      return next(
        new HttpError(
          "Pengguna dengan token ini sudah tidak terdaftar di FIM.",
          403
        )
      );
    res.locals.user = exist;
    next();
  } catch (err) {
    next(err);
  }
};
