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
      '/parking-spaces and /parking-spaces/* → BACKEND_URL/parking-spaces/*',
      '/reservations and /reservations/* → BACKEND_URL/reservations/*',
      '/payments and /payments/* → BACKEND_URL/payments/*',
      '/notifications and /notifications/* → BACKEND_URL/notifications/*',
      '/maps and /maps/* → BACKEND_URL/maps/*',
      '/health/* → BACKEND_URL/health/*',
    ];
  }
}
