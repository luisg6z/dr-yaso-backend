import { defineConfig } from 'drizzle-kit';
import { envs } from './src/config/envs';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: envs.databaseUrl,
  },
});
