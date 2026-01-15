import { Router, Request, Response } from "express";

const routes = Router();

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
