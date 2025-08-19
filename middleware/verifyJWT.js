const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

module.exports = function verifyJWT(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }
  try {
    const decodedToken = jwt.verify(token, JWT_SECRET);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token." });
  }
};
