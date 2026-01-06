import cors from "cors";
import "./config/env.js";
import app from "./app.js";

import patientRoutes from "./routes/patients.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import encountersRoutes from "./routes/encounters.routes.js";
import authRoutes from "./routes/auth.routes.js";
import portalRoutes from "./routes/portal.routes.js";

// Apply CORS middleware here with correct frontend origin
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use("/patients", patientRoutes);
app.use("/qr", qrRoutes);
app.use("/patients", encountersRoutes);
app.use("/auth", authRoutes);
app.use("/portal", portalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
