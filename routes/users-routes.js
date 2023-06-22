const express = require("express");
const { check } = require("express-validator");
const router = express.Router();

const usersControllers = require("../controllers/users-controller");
const deserializer = require("../middlewares/deserializer");
const requireUser = require("../middlewares/require-user");

const checkPass = (param) => [
  check(param, "Password tidak boleh memuat spasi.").matches(/^\S+$/),
  check(param, "Password harus terdiri dari minimal 8 karakter.").isLength({
    min: 8,
  }),
  check(param, "Password harus memuat minimal 1 karakter unik.").matches(
    /[\W+_]/
  ),
  check(param, "Password harus memuat minimal 1 angka.").matches(/\d/),
  check(param, "Password harus memuat minimal 1 huruf kecil.").matches(/[a-z]/),
  check(param, "Password harus memuat minimal 1 huruf kapital.").matches(
    /[A-Z]/
  ),
];

const checkMail = check("email", "Email tidak valid.").isEmail();

router.post(
  "/login",
  [checkMail, ...checkPass("password")],
  usersControllers.login
);
router.post("/refresh", usersControllers.refresh);
router.post("/sendmail", usersControllers.sendLink);
router.patch("/reset", [...checkPass("password")], usersControllers.resetPass);
router.post(
  "/signup",
  [checkMail, ...checkPass("password")],
  usersControllers.signup
);
router.get("/", usersControllers.getUsers);
router.get("/logout", usersControllers.logout);

router.use(deserializer, requireUser);
router.patch(
  "/update/:id",
  [...checkPass("password"), ...checkPass("newPassword")],
  usersControllers.changePass
);

module.exports = router;
