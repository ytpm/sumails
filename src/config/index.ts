import { LogLevel } from "@/lib/logger";

export const APP_CONFIG = {
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.NONE,
}