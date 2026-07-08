import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import express, { type Express, type Request, type Response } from 'express';
import {
  HttpExceptionFilter,
  ResponseInterceptor,
} from '../../libs/common/src';
import { AppModule } from './app.module';

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const SWAGGER_TITLE = 'ParkLink API Gateway';
const SWAGGER_DESCRIPTION = 'API Gateway que redirige todas las solicitudes al backend consolidado de ParkLink.';
const IS_BEARER_AUTH_ENABLED = true;
const SWAGGER_JSON_PATH = '/docs-json';

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
    .setVersion('1.0')
    .addTag('Proxy', 'Rutas proxy al backend consolidado')
    .addTag('Health', 'Endpoints de salud del gateway');

  if (IS_BEARER_AUTH_ENABLED) {
    swaggerBuilder.addBearerAuth();
  }

  const swaggerConfig = swaggerBuilder.build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  registerSwaggerDocs(app, document);
}

function registerSwaggerDocs(app: INestApplication, document: OpenAPIObject): void {
  const server = app.getHttpAdapter().getInstance() as Express;
  const html = buildSwaggerHtml(SWAGGER_TITLE);

  server.get(SWAGGER_JSON_PATH, (_request: Request, response: Response) => {
    response.type('application/json').send(document);
  });
  server.get(['/', '/docs', '/docs/'], (_request: Request, response: Response) => {
    response.type('html').send(html);
  });
}

function buildSwaggerHtml(title: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fafafa; }
      .swagger-ui .topbar { display: none; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: '${SWAGGER_JSON_PATH}',
          dom_id: '#swagger-ui',
          deepLinking: true,
          presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
          layout: 'StandaloneLayout',
        });
      };
    </script>
  </body>
</html>`;
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
  console.log(`Backend URL: ${configService.get<string>('BACKEND_URL') ?? 'NOT SET'}`);
  await app.listen(port);
}

if (!process.env.VERCEL) {
  void bootstrap();
}
