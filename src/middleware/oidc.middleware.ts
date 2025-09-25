import { Request, Response, NextFunction } from 'express';
import { Client, Issuer } from 'openid-client';
import {
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_ISSUER,
  OIDC_REDIRECT_URI,
  OIDC_LOGIN_URL,
  OIDC_IDP_ALIAS,
  OIDC_BEARER_REALM,
} from '../config/loader';

let issuer: Issuer<Client> | null = null;
let client: Client;

async function initializeOidcClient(): Promise<Client> {
  try {
    issuer = await Issuer.discover(`${OIDC_ISSUER}`);
    client = new issuer.Client({
      client_id: OIDC_CLIENT_ID || 'client-id',
      client_secret: OIDC_CLIENT_SECRET,
      redirect_uris: [OIDC_REDIRECT_URI || 'http://localhost:3000/callback'],
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

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!issuer) {
      await initializeOidcClient();
    }

    if (!(await isAuthorized(req))) {
      console.log("Unauthoriued");
      return unauthorized(req, res);
    }

    const userInfo = await client.userinfo(req.session.token || ''); // simplest way to validate
    console.log('userInfo:', userInfo);

    // Optionally attach user info to req for downstream use
    (req as any).user = userInfo;

    next();
  } catch (err) {
    console.error((err as Error).name + ": " + (err as Error).message);
    return unauthorized(req, res);
  }
}

async function isAuthorized(req: Request) : Promise<boolean> {
  if (req.session.token) {
    console.log('TOKEN already saved:', req.session.token);
    return true;
  }
  
  const authHeader = req.headers.authorization;
  console.log('authHeader:', authHeader);
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    console.log('TOKEN:', token);

    req.session.token = token;   // Save token in session
    return true;
  }

  const code = req.query.code as string;
  console.log('request query:', req.query);
  console.log('request query code:', code);
  const fullRequestUrl = getOriginalFullUrl(req);
  console.log('request url:', fullRequestUrl);
  if(code) {
    // Exchange authorization code for tokens
    const tokenSet = await client.grant({
      grant_type: 'authorization_code',
      code: code, // Replace with the actual authorization code
      redirect_uri: fullRequestUrl.origin + fullRequestUrl.pathname, // Must match the redirect URI used in the authorization request
    });

    console.log("Got token set: ", tokenSet);

    req.session.token = tokenSet.access_token;   // Save token in session
    return true;
  }

  return false;
}

function unauthorized(req: Request, res: Response) {
  console.log('Unauthorized access attempt');
  const fullRequestUrl = getOriginalFullUrl(req);
  console.log('fullRequestUrl', fullRequestUrl);
  const authorizationUri = `${OIDC_LOGIN_URL}?client_id=${OIDC_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    fullRequestUrl.toString()
  )}&response_type=code&scope=openid&kc_idp_hint=${OIDC_IDP_ALIAS}`;

  // Check if User-Agent header exists
  const userAgent = req.headers['user-agent'];
  if (userAgent) {
    // User-Agent exists, return a redirect response
    console.log('User-Agent found:', userAgent);
    console.log('Redirecting to authorization URI');
    return res.redirect(302, authorizationUri);
  } else {
    // No User-Agent, return a 401 Unauthorized with WWW-Authenticate header
    console.log('No User-Agent found, returning 401 Unauthorized');
    const authHeader = [
      `Bearer realm="${OIDC_BEARER_REALM}"`,
      `error="invalid_token"`,
      `error_description="Token is missing or invalid"`,
      `authorization_uri="${OIDC_ISSUER}/token"`,
    ].join(', ');

    res.status(401).set('WWW-Authenticate', authHeader).json({
      error: 'unauthorized',
      error_description: 'Access token is missing or invalid',
    });
  }
}

function getOriginalFullUrl(req: Request) : URL {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.headers.host;
  return new URL(`${protocol}://${host}${req.originalUrl}`);
}
