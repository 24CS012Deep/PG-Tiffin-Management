import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "Not authorized, token missing" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    console.log(`🚫 Admin access denied for: ${req.user.email} (Role: ${req.user.role})`);
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

export const studentOnly = (req, res, next) => {
  if (req.user.role !== "student")
    return res.status(403).json({ message: "Student access only" });
  next();
};

export const customerOnly = (req, res, next) => {
  if (req.user.role !== "customer")
    return res.status(403).json({ message: "Customer access only" });
  next();
};
