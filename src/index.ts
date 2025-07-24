import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { setupSwagger } from "./config/swagger";
import datasetRoutes from "./routes/dataset.routes";
import { PORT } from "./config/loader";

dotenv.config();

const app: Express = express();
const port = PORT || 3000;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
app.use(express.json());
app.use(cors({
    origin: "*",
}));

// Routes
app.get("/", (req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
});

app.use('/api/files', datasetRoutes);

// Swagger
setupSwagger(app);

// Start server
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
