import { z } from 'zod';

const envSchema = z.object({
  DB_PASSWORD: z.string().min(32, 'DB_PASSWORD trop court (min 32 caractères)'),
  JWT_SECRET: z.string().min(64, 'JWT_SECRET trop court (min 64 caractères)'),
  JWT_REFRESH_SECRET: z.string().min(64, 'JWT_REFRESH_SECRET trop court (min 64 caractères)'),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().regex(/^\d+$/, 'PORT doit être un nombre').transform(Number)
});

export const validateEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error('❌ Variables d\'environnement invalides :');
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
    console.error('\n💡 Exécutez: node scripts/generate-secrets.js');
    process.exit(1);
  }
};
