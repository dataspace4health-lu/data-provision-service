<<<<<<< Updated upstream
import { Request, Response, NextFunction } from 'express';
import { Client, Issuer } from 'openid-client';
import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_ISSUER, OIDC_REDIRECT_URI, OIDC_BEARER_REALM } from '../config/loader';
=======
import { Request, Response, NextFunction } from "express";
import { Client, Issuer } from "openid-client";
import {
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_ISSUER,
  OIDC_REDIRECT_URI,
  OIDC_LOGIN_URL,
  OIDC_IDP_ALIAS,
} from "../config/loader";
>>>>>>> Stashed changes

let issuer: Issuer<Client> | null = null;
let client: Client;

async function initializeOidcClient(): Promise<Client> {
  try {
    issuer = await Issuer.discover(`${OIDC_ISSUER}`);
    client = new issuer.Client({
      client_id: OIDC_CLIENT_ID || "client-id",
      client_secret: OIDC_CLIENT_SECRET,
      redirect_uris: [OIDC_REDIRECT_URI || "http://localhost:3000/callback"],
      response_types: ["code"],
    });

    console.log("OIDC client initialized successfully");

    await client.grant({ grant_type: "client_credentials" });

    console.log("OIDC client credentials verified successfully");
    return client;
  } catch (error) {
    console.error("OIDC initialization failed:", error);
    throw error;
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!issuer) {
      await initializeOidcClient();
    }
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Bearer token found in request headers");
      return unauthorized(req, res);
    }

    const token = authHeader.split(" ")[1];
    console.log("TOKEN:", token);
    const userInfo = await client.userinfo(token); // simplest way to validate
    console.log("userInfo:", userInfo);

    // Optionally attach user info to req for downstream use
    (req as any).user = userInfo;

    next();
  } catch (err) {
    return unauthorized(req, res);
  }
}

function unauthorized(req: Request, res: Response) {
  console.log("Unauthorized access attempt");
  console.log("req", req);

<<<<<<< Updated upstream
  const authHeader = [
    `Bearer realm="${OIDC_BEARER_REALM}"`,
    `error="invalid_token"`,
    `error_description="Token is missing or invalid"`,
    `authorization_uri="${OIDC_ISSUER}/token"`
  ].join(', ');
  res.status(401)
    .set('WWW-Authenticate', authHeader)
    .json({
=======
  // Get the original request URL to use as redirect_uri
  const protocol = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const originalUrl = req.originalUrl || req.url;
  const fullRequestUrl = `${protocol}://${host}${originalUrl}`;

  const authorizationUri = `${OIDC_LOGIN_URL}?client_id=${OIDC_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    fullRequestUrl
  )}&response_type=code&scope=openid&kc_idp_hint=${OIDC_IDP_ALIAS}`;

  // Check if User-Agent header exists
  const userAgent = req.headers["user-agent"];

  if (userAgent) {
    // User-Agent exists, return a redirect response
    console.log("User-Agent found, redirecting to authorization URI");
    return res.redirect(302, authorizationUri);
  } else {
    // No User-Agent, return a 401 Unauthorized with WWW-Authenticate header
    console.log("No User-Agent found, returning 401 Unauthorized");
    const authHeader = [
      `Bearer realm="example"`,
      `error="invalid_token"`,
      `error_description="Token is missing or invalid"`,
      `authorization_uri="${authorizationUri}"`,
    ].join(", ");

    res.status(401).set("WWW-Authenticate", authHeader).json({
>>>>>>> Stashed changes
      error: "unauthorized",
      error_description: "Access token is missing or invalid",
    });
  }
}
