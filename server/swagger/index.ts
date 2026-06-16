import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import spec from "./openapi";

const swaggerOptions = {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Quelm API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
};

export const swaggerRouter = Router();

swaggerRouter.use("/", swaggerUi.serveFiles(undefined, swaggerOptions), swaggerUi.setup(spec, swaggerOptions));

swaggerRouter.get("/openapi.json", (_req, res) => {
  res.json(spec);
});
