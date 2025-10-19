import { promises as fs } from 'fs';
import * as path from 'path';

const DEFAULT_LOG_PATH = process.env.LOG_FILE || path.join(process.cwd(), 'logs', 'events-service.log');

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function appendLine(line: string) {
  await ensureDir(DEFAULT_LOG_PATH);
  await fs.appendFile(DEFAULT_LOG_PATH, line + '\n', { encoding: 'utf8' });
}

export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

function baseRecord(level: LogLevel, msg: string, extra?: Record<string, any>) {
  return {
    ts: new Date().toISOString(),
    level,
    message: msg,
    ...extra,
  };
}

export const logger = {
  async info(message: string, extra?: Record<string, any>) {
    const rec = baseRecord('info', message, extra);
    console.log(JSON.stringify(rec));
    await appendLine(JSON.stringify(rec));
  },
  async error(message: string, extra?: Record<string, any>) {
    const errExtra: Record<string, any> = { ...extra };
    // If extra contains an Error, serialize it
    if (extra && extra.error instanceof Error) {
      const e = extra.error as Error;
      errExtra.error = { name: e.name, message: e.message, stack: e.stack };
    }
    const rec = baseRecord('error', message, errExtra);
    console.log(JSON.stringify(rec));
    await appendLine(JSON.stringify(rec));
  },
  async warn(message: string, extra?: Record<string, any>) {
    const rec = baseRecord('warn', message, extra);
    await appendLine(JSON.stringify(rec));
  },
  async debug(message: string, extra?: Record<string, any>) {
    const rec = baseRecord('debug', message, extra);
    await appendLine(JSON.stringify(rec));
  },
  path: DEFAULT_LOG_PATH,
};
