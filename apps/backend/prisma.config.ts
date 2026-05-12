import { defineConfig } from 'prisma/config';
import { join } from 'node:path';

export default defineConfig({
  schema: join(__dirname, '..', '..', 'apps', 'backend', 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});