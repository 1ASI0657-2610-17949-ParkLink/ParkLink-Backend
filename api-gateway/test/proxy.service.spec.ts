import type { HttpService } from '@nestjs/axios';
import type { Request, Response } from 'express';
import { of } from 'rxjs';
import { ProxyService } from '../src/proxy/proxy.service';

describe('ProxyService', () => {
  it('forwards method, body and authorization header', async () => {
    const httpService = {
      request: jest.fn().mockReturnValue(of({ status: 200, data: { ok: true } })),
    } as unknown as HttpService;
    const service = new ProxyService(httpService);
    const request = {
      method: 'POST',
      originalUrl: '/auth/login?x=1',
      body: { email: 'test@parklink.test' },
      headers: { authorization: 'Bearer token', host: 'localhost:3000' },
    } as unknown as Request;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await service.forward(request, response, 'http://localhost:3001');

    expect(httpService.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'http://localhost:3001/auth/login?x=1',
        data: { email: 'test@parklink.test' },
        headers: { authorization: 'Bearer token' },
      }),
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({ ok: true });
  });

  it('retries one transient upstream 5xx before responding', async () => {
    const httpService = {
      request: jest
        .fn()
        .mockReturnValueOnce(of({ status: 502, data: { error: 'bad gateway' }, headers: {} }))
        .mockReturnValueOnce(of({ status: 200, data: { ok: true }, headers: {} })),
    } as unknown as HttpService;
    const service = new ProxyService(httpService);
    const request = {
      method: 'GET',
      originalUrl: '/parking-spaces/search',
      headers: {},
    } as unknown as Request;
    const response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;

    await service.forward(request, response, 'http://localhost:3001');

    expect(httpService.request).toHaveBeenCalledTimes(2);
    expect(response.status).toHaveBeenCalledWith(200);
  });
});
