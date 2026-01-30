import { Router, Request, Response } from "express";
import profileRouter from "./profiles/profile.routes";
import errorHandler from "../middlewares/errorHandler.middleware";
import qrsRouter from "./qrs/qrs.routes";

const routes = Router();

routes.use("/api/profiles", profileRouter);
routes.use("/api/qrs", qrsRouter);

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
