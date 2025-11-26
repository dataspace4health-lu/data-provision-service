/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Express, Request, Response } from "express";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import { setupSwagger } from "./config/swagger";
import datasetRoutes from "./routes/dataset.routes";
import { PORT, BASE_PATH } from "./config/loader";

dotenv.config();

const app: Express = express();
const port = PORT || 3000;
const basePath = BASE_PATH || "";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
app.use(express.json());
app.use(cors({
    origin: "*",
}));
app.use(session({
    secret: 'your-secret-key', // Replace with a secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Set to true if using HTTPS
}));

// Routes
app.get(`${basePath}/`, (req: Request, res: Response) => {
    res.redirect(`${basePath}/api-docs/`);
});

// Health check endpoint
app.get(`${basePath}/health`, (req: Request, res: Response) => {
    res.status(200).json({ 
        status: "healthy", 
        timestamp: new Date().toISOString(),
        uptime: process.uptime() 
    });
});

app.use(`${basePath}/files`, datasetRoutes);

// Swagger
setupSwagger(app);

// Start server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}${basePath}`);
});
