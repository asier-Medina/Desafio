
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import sequelize from "./config/postgres.js";
import apiRouter from "./routes/api.routes.js";

import { notFound, errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();
app.disable("x-powered-by");
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error(`CORS: origin ${origin} no permitido`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", mensaje: "Backend en marcha 🚀" });
});

app.use("/api", apiRouter);
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Postgres conectado");
    app.listen(PORT, () => {
      console.log(`\n✅ Backend escuchando en http://localhost:${PORT}`);
      console.log(`   Prueba: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("❌ Error al arrancar:", error.message);
    process.exit(1);
  }
};

start();
