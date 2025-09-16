import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const {
  NODE_ENV,
  PORT,
  BASE_URL,
  BASE_PATH,
  BASE_FILE_PATH,
  OIDC_ISSUER,
  OIDC_CLIENT_ID = 'client-id',
  OIDC_CLIENT_SECRET,
  OIDC_CALLBACK_URL,
  OIDC_REDIRECT_URI,
  OIDC_IDP_ALIAS,
  OIDC_LOGIN_URL,
  OIDC_BEARER_REALM = 'ds4h',
} = process.env;
