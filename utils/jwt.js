import jwt from "jsonwebtoken";

const secret = "defaultSecret"; // keep it constant for tests

// Generate token once
export const generateToken = () => {
  return jwt.sign(
    { id: 1, email: "test@example.com", role: "admin" },
    secret,
    { noTimestamp: true } // no iat/exp
  );
};

// Middleware
export const verifyToken = (req, res, next) => {
  console.log('in verify token')
  const authHeader = req.headers["authorization"];
  console.log(authHeader , "auth headers");
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader; // expect "Bearer <token>"

  console.log(token , "token ")
  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};
