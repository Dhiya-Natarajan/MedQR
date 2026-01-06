import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("AUTH DEBUG: Missing or invalid Authorization header:", authHeader);
    return res.status(403).json({
      message: "Medical Report Restricted Access",
      debug_info: "Missing or invalid header"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AUTH DEBUG: Token verified successfully. Payload:", decoded);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH DEBUG: JWT Verification Error:", err.message);
    return res.status(403).json({
      message: "Medical Report Restricted Access",
      debug_info: err.message
    });
  }
}
