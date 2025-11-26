/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router } from "express";
// import { oidcMiddleware } from "../middleware/auth.middleware";
import { getDataAsset } from "../controllers/dataAsset.controller";
import { authenticateToken } from "../middleware/oidc.middleware";


const router = Router();
/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Retrieve a data asset by filename
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the data asset file to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved the data asset
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Data asset not found
 */
router.get("/:filename", authenticateToken, getDataAsset);

export default router;
