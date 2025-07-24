import { Request, Response, NextFunction } from 'express';
import { Client, Issuer } from 'openid-client';
import { OIDC_CLIENT_ID, OIDC_CLIENT_SECRET, OIDC_ISSUER, OIDC_REDIRECT_URI } from '../config/loader';

let issuer: Issuer<Client> | null = null;
let client: Client;

async function initializeOidcClient(): Promise<Client> {
  try {
    issuer = await Issuer.discover(`${OIDC_ISSUER}`);
    client = new issuer.Client({
      client_id: OIDC_CLIENT_ID || "client-id",
      client_secret: OIDC_CLIENT_SECRET,
      redirect_uris: [OIDC_REDIRECT_URI || "http://localhost:3000/callback"],
      response_types: ['code'],
    });

    console.log('OIDC client initialized successfully');

    await client.grant({ grant_type: 'client_credentials' });

    console.log('OIDC client credentials verified successfully');
    return client;
  } catch (error) {
    console.error('OIDC initialization failed:', error);
    throw error;
  }
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  try {
    if (!issuer) {
      await initializeOidcClient();
    }
    const authHeader = req.headers.authorization;
    console.log("authHeader:", authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return unauthorized(res);
    }

    const token = authHeader.split(' ')[1];
    console.log("TOKEN:", token);
    const userInfo = await client.userinfo(token); // simplest way to validate
    console.log("userInfo:", userInfo);


    // Optionally attach user info to req for downstream use
    (req as any).user = userInfo;

    next();
  } catch (err) {
    return unauthorized(res);
  }
}

function unauthorized(res: Response) {
  res.status(401)
    .set('WWW-Authenticate', `Bearer realm="example", error="invalid_token", error_description="Token is missing or invalid", authorization_uri="${OIDC_ISSUER}/token"`)
    .json({
      error: "unauthorized",
      error_description: "Access token is missing or invalid"
    });
}
