import { describe, expect, it } from '@jest/globals';
import * as moduleApi from '../../src';

describe('test-module-1776499764420 public exports smoke', () => {
  it('exposes MODULE_INFO with an explicit preparatory status', () => {
    expect(moduleApi.MODULE_INFO).toBeDefined();
    expect(moduleApi.MODULE_INFO.name).toBe('test-module-1776499764420');
    expect(moduleApi.MODULE_INFO.status).toBe('PREPARATORY');
    expect(moduleApi.MODULE_INFO.implementation).toBe('scaffold');
  });
});
