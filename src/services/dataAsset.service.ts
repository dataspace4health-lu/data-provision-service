import fs from 'fs';
import path from 'path';
import { BASE_FILE_PATH } from '../config/loader';

function getContentType(filename: string) {
  if (filename.endsWith('.json')) return 'application/json';
  if (filename.endsWith('.txt')) return 'text/plain';
  if (filename.endsWith('.csv')) return 'text/csv';
  // extend as needed
  return 'application/octet-stream';
}

export function getFileStream(fullPath: string) {
  console.log("fullPath:", fullPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error('Dataset file not found');
  }

  const stream = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(stream);
}
