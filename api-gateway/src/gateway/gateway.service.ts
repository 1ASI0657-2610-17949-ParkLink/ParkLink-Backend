import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getStatus() {
    return {
      service: 'parklink-api-gateway',
      status: 'running',
      proxy: 'consolidated-backend',
    };
  }

  getRoutes(): string[] {
    return [
      '/auth/* → BACKEND_URL/auth/*',
      '/users/* → BACKEND_URL/users/*',
      '/parking-spaces/* → BACKEND_URL/parking-spaces/*',
      '/reservations/* → BACKEND_URL/reservations/*',
      '/payments/* → BACKEND_URL/payments/*',
      '/notifications/* → BACKEND_URL/notifications/*',
      '/maps/* → BACKEND_URL/maps/*',
      '/health/* → BACKEND_URL/health/*',
    ];
  }
}