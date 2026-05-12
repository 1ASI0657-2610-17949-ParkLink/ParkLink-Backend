import { config } from 'dotenv';
import { join } from 'node:path';
import { defineConfig } from 'prisma/config';

config({ path: join(import.meta.dirname, 'apps', 'backend', '.env') });

export default defineConfig({
  schema: join(import.meta.dirname, 'apps', 'backend', 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});