require("dotenv").config();
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const HttpError = require("../utils/http-error");
const User = require("../models/user");
const { nanoid } = require("nanoid");
const Token = require("../models/token");
const sendEmail = require("../utils/sendEmail");
const signToken = require("../utils/sign-token");

const bad = "Kesalahan server/koneksi, silakan coba lagi.";

const refreshCookie = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  maxAge: 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

const accessCookie = {
  expires: new Date(Date.now() + 10 * 60 * 1000),
  maxAge: 10 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (err) {
    return next(new HttpError(bad, 500));
  }
  res.json({ emails: users.map((user) => user.email) });
};

const signup = async (req, res, next) => {
  const error = validationResult(req);
  const errorMsg = error.errors.map((e) => e.msg);
  if (errorMsg.length > 0) return next(new HttpError(errorMsg[0], 422));

  const { email, password } = req.body;
  let exist;
  try {
    exist = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError(bad, 500));
  }
  if (exist) return next(new HttpError("Email ini telah terdaftar.", 409));

  const hashedPass = await bcrypt.hash(password, 12);
  const createdUser = new User({
    name: email.split("@")[0],
    email,
    password: hashedPass,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  res.status(201).json({ message: "Registrasi berhasil." });
};

const login = async (req, res, next) => {
  const error = validationResult(req);
  const errorMsg = error.errors.map((e) => e.msg);
  if (errorMsg.length > 0) return next(new HttpError(errorMsg[0], 422));

  const { email, password } = req.body;
  let exist;
  try {
    exist = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError(bad, 500));
  }
  if (!exist)
    return next(
      new HttpError(
        "Kamu belum terdaftar sebagai member, silakan daftarkan diri terlebih dahulu.",
        403
      )
    );

  const isValidPass = await bcrypt.compare(password, exist.password);
  if (!isValidPass)
    return next(new HttpError("Password yang kamu masukkan salah.", 403));

  const { accessToken, refreshToken } = await signToken(exist);

  res.cookie("refresh_token", refreshToken, refreshCookie);
  res.cookie("access_token", accessToken, accessCookie);
  res.status(200).json({
    message: "Login berhasil.",
    data: {
      userId: exist.id,
      name: exist.name,
      email: exist.email,
      date: new Date(),
      appmark: true,
    },
  });
};

const logout = (req, res, next) => {
  res.cookie("refresh_token", "", { maxAge: -1 });
  res.cookie("access_token", "", { maxAge: -1 });
  res.status(200).json({ message: "Logout berhasil." });
};

const refresh = async (req, res, next) => {
  const refresh_token = req.cookies.refresh_token;
  if (!refresh_token)
    return next(new HttpError("Tidak dapat merefresh token.", 403));
  const decoded = jwt.verify(refresh_token, process.env.REFRESH_KEY);
  if (!decoded) return next(new HttpError("Tidak dapat merefresh token.", 403));

  const accessToken = jwt.sign(
    { userId: decoded.userId, email: decoded.email },
    process.env.SECRET_KEY,
    { expiresIn: "10m" }
  );
  res.cookie("access_token", accessToken, accessCookie);
  res
    .status(200)
    .json({ message: "Refresh token berhasil.", data: new Date() });
};

const changePass = async (req, res, next) => {
  const error = validationResult(req);
  const errorMsg = error.errors.map((e) => e.msg);
  if (errorMsg.length > 0) return next(new HttpError(errorMsg[0], 422));

  const { password, newPassword } = req.body;
  const id = req.params.id;
  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  const isValidPass = await bcrypt.compare(password, user.password);
  if (!isValidPass)
    return next(
      new HttpError("Kata sandi lama yang kamu masukkan salah.", 422)
    );

  const hashedPass = await bcrypt.hash(newPassword, 12);
  user.password = hashedPass;
  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  res.status(200).json({ message: "Pembaruan kata sandi berhasil." });
};

const sendLink = async (req, res, next) => {
  const { email } = req.body;
  let exist;
  try {
    exist = await User.findOne({ email });
  } catch (err) {
    return next(new HttpError(bad, 500));
  }
  if (!exist) {
    return next(
      new HttpError(
        "Pengguna dengan email yang diberikan belum terdaftar di aplikasi.",
        422
      )
    );
  }

  const createdToken = new Token({
    userId: exist.id,
    token: nanoid(30),
  });
  try {
    await createdToken.save();
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  const link = `${process.env.BASE_URL}/auth/reset?id=${createdToken.userId}&token=${createdToken.token}`;
  try {
    await sendEmail(exist.email, "Reset Kata Sandi FIM", link, exist.name);
  } catch (err) {
    return next(new HttpError("Email gagal terkirim, silakan coba lagi.", 500));
  }

  res.status(200).json({
    message:
      "Email berhasil dikirim ke akun emailmu, segera akses tautan pada email sebelum 15 menit.",
  });
};

const resetPass = async (req, res, next) => {
  const error = validationResult(req);
  const errorMsg = error.errors.map((e) => e.msg);
  if (errorMsg.length > 0) return next(new HttpError(errorMsg[0], 422));

  const { id, token } = req.query;
  const { password } = req.body;
  let isValidToken;
  try {
    isValidToken = await Token.findOne({ userId: id, token });
  } catch (err) {
    return next(new HttpError(bad, 500));
  }
  if (!isValidToken)
    return next(
      new HttpError(
        "Token reset sandi tidak valid atau telah kadaluwarsa. Silakan ajukan permintaan email baru melalui halaman Request Token Penggantian Sandi.",
        410
      )
    );

  let user;
  try {
    user = await User.findById(id);
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  const hashedPass = await bcrypt.hash(password, 12);
  user.password = hashedPass;
  try {
    await user.save();
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  try {
    await Token.deleteOne({ token });
  } catch (err) {
    return next(new HttpError(bad, 500));
  }

  res
    .status(200)
    .json({ message: "Pembaruan kata sandi berhasil, silakan login kembali." });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
exports.logout = logout;
exports.refresh = refresh;
exports.changePass = changePass;
exports.sendLink = sendLink;
exports.resetPass = resetPass;
exports.excludeFields = ["password"];
