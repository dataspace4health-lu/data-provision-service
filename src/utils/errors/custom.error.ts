/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

// src/errors/custom.error.ts
export class AppError extends Error {
    constructor(
      public message: string,
      public statusCode: number = 400,
      public details?: any
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }