import { config } from 'dotenv';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

const serviceRoot = dirname(fileURLToPath(import.meta.url));

config({ path: join(serviceRoot, '.env') });
const fallbackDatabaseUrl = 'mysql://USER:PASSWORD@VM_PUBLIC_IP:3306/parklink_db';

export default defineConfig({
  schema: join(serviceRoot, 'prisma/schema.prisma'),
  migrations: {
    path: join(serviceRoot, 'prisma/migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? fallbackDatabaseUrl,
  },
});
