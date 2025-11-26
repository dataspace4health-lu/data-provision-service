/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

import 'express-session';

declare module 'express-session' {
  interface SessionData {
    token?: string; // replace `string` with the actual type if different
  }
}
