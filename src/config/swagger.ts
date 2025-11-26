/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

// swagger.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import dotenv from "dotenv";
import { BASE_URL, BASE_PATH} from "./loader";
dotenv.config();

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Data Provisioning REST API",
      version: "1.0.0",
      description: "API documentation",
    },
    servers: [
      {
        url: `${BASE_URL}${BASE_PATH}`, // Combine BASE_URL + BASE_PATH
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
  apis: 
    // For both development (TypeScript) and production (JavaScript) environments
    process.env.NODE_ENV === "production" 
      ? ["dist/routes/*.js"] 
      : ["src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app: Express) => {
  app.use(`${BASE_PATH}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
