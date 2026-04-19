import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../errorHandler';

function mockRes(): Response {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  return res;
}

describe('errorHandler', () => {
  it('returns custom status code from error', () => {
    const err = Object.assign(new Error('Not found'), { status: 404 });
    const res = mockRes();

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('defaults to 500 when no status on error', () => {
    const err = new Error('Something broke');
    const res = mockRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Something broke' });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('uses default message when error has no message', () => {
    const err = { status: 500 } as Error & { status: number };
    const res = mockRes();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, {} as Request, res, vi.fn() as NextFunction);

    expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    consoleSpy.mockRestore();
  });
});
