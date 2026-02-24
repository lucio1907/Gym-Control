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
      const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";
      if (!origin || origin.replace(/\/$/, "") === allowedOrigin.replace(/\/$/, "")) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    credentials: true,
  })
);
app.use(cookieParser());

app.use(routes);

export default app;
