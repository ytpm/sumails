import { createLogger } from './logger';
import { APP_CONFIG } from '@/config';

// Create a single logger that supports both formats
export const logger = createLogger({ level: APP_CONFIG.LOG_LEVEL });
