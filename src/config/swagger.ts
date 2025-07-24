// swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { BASE_URL } from "./loader";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API with Swagger",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: BASE_URL || "http://localhost:3000", // fallback in case BASE_URL is not defined
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: []
      }
    ],
  },
  apis: ["src/routes/*.ts"], // ✅ Path to your API route files
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
