import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const whitelist = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
      ].filter(Boolean).map(url => url!.replace(/\/$/, ""));

      if (!origin || whitelist.includes(origin.replace(/\/$/, ""))) {
        callback(null, true);
      } else {
        console.error(`[CORS] Acceso denegado para el origen: ${origin}`);
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.use(routes);

export default app;
