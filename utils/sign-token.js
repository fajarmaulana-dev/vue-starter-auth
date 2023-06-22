require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = async (user) => {
  const access_token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.SECRET_KEY,
    { expiresIn: "10m" }
  );

  const refresh_token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.REFRESH_KEY,
    { expiresIn: "1d" }
  );
  return { accessToken: access_token, refreshToken: refresh_token };
};
