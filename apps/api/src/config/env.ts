import { parseEnv } from '@datascrapper/config';

// Parse and export env — throws on invalid config
export const env = parseEnv(process.env);
