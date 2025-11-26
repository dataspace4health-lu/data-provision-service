/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

const assert = require('node:assert');
const { describe, it } = require('node:test');

describe('project metadata', () => {
  it('has a meaningful package description', () => {
    const pkg = require('../package.json');
    assert.ok(pkg.description && pkg.description.length > 10);
  });
});
