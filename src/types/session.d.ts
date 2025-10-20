import 'express-session';

declare module 'express-session' {
  interface SessionData {
    token?: string; // replace `string` with the actual type if different
  }
}
