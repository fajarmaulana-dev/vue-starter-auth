const HttpError = require("../utils/http-error");

module.exports = (req, res, next) => {
  try {
    const user = res.locals.user;
    if (!user) return next(new HttpError("Token tidak valid.", 403));
    next();
  } catch (err) {
    next(err);
  }
};
