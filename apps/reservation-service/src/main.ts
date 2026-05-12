import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { type Express, type Request, type Response } from 'express';
import {
  HttpExceptionFilter,
  ResponseInterceptor,
} from '@parklink/common';
import { AppModule } from './app.module';

const DEFAULT_PORT = 3004;
const SWAGGER_TITLE = 'ParkLink Reservation Service API';
const SWAGGER_DESCRIPTION = 'Servicio de reservas de espacios de estacionamiento de ParkLink.';
const SWAGGER_TAGS = ['Reservations', 'Health'];
const IS_BEARER_AUTH_ENABLED = true;

type RequestListener = (request: Request, response: Response) => void;

let cachedServer: Express | undefined;

function configureApplication(app: INestApplication): void {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  const swaggerBuilder = new DocumentBuilder()
    .setTitle(SWAGGER_TITLE)
    .setDescription(SWAGGER_DESCRIPTION)
    .setVersion('1.0');

  if (IS_BEARER_AUTH_ENABLED) {
    swaggerBuilder.addBearerAuth();
  }

  SWAGGER_TAGS.forEach((tag) => swaggerBuilder.addTag(tag));

  const swaggerConfig = swaggerBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
}

async function createVercelServer(): Promise<Express> {
  if (cachedServer) {
    return cachedServer;
  }

  const server = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    bufferLogs: true,
  });

  configureApplication(app);
  await app.init();
  cachedServer = server;

  return server;
}

export default async function handler(request: Request, response: Response): Promise<void> {
  const server = await createVercelServer();
  const listener = server as unknown as RequestListener;
  listener(request, response);
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  configureApplication(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? DEFAULT_PORT;
  await app.listen(port);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
