import { config } from 'dotenv';
import { join } from 'node:path';
import { defineConfig } from 'prisma/config';

const projectRoot = import.meta.dirname;

config({ path: join(projectRoot, 'apps/auth-service/.env') });

export default defineConfig({
  schema: join(projectRoot, 'prisma/local/schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://USER:PASSWORD@localhost:3306/parklink_db',
  },
});
