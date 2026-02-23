import { Router, Request, Response } from "express";
import profileRouter from "./profiles/profile.routes";
import errorHandler from "../middlewares/errorHandler.middleware";
import qrsRouter from "./qrs/qrs.routes";
import attendanceRouter from "./attendance/attendance.routes";
import routinesRouter from "./routines/routines.routes";
import adminRouter from "./admin/admin.routes";
import paymentsRouter from "./payments/payments.routes";
import settingsRouter from "./settings/settings.routes";

const routes = Router();

routes.use("/api/profiles", profileRouter);
routes.use("/api/qrs", qrsRouter);
routes.use("/api/attendance", attendanceRouter)
routes.use("/api/routines", routinesRouter);
routes.use("/api/admins", adminRouter);
routes.use("/api/payments", paymentsRouter);
routes.use("/api/settings", settingsRouter);

routes.use(errorHandler)

routes.get("/", (req: Request, res: Response) => {
  res.json({
    response: { message: "API in development", version: "v0.1", status: "OK" },
  });
});

routes.use((req: Request, res: Response) => {
  res.status(404).json({
    response: { message: `${req.url} not found`, status: "Not Found" },
  });
});

export default routes;
