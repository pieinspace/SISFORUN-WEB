import dotenv from 'dotenv';

export function loadConfig() {
  dotenv.config();
}

export const PORT = process.env.PORT || 4000;
export const DATABASE_URL = process.env.DATABASE_URL || '';
