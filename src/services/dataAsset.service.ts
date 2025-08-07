import fs from 'fs';
import path from 'path';
import { BASE_FILE_PATH } from '../config/loader';
import { fileValidationService } from './fileValidation.service';
import { AppError } from '../utils/errors/custom.error';

export async function getFileStream(fullPath: string) {
  console.log("Processing file:", fullPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error('Dataset file not found');
  }

  try {
    // Validate and parse the file
    const result = await fileValidationService.validateFile(fullPath);

    console.log('File validation successful:', {
      type: result.detectedType,
      size: result.size
    });

    return {
      content: result.parsedContent,
      contentType: result.mimeType,
      fileType: result.detectedType,
      size: result.size
    };

  } catch (error: any) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(`File processing failed: ${error.message}`, 500);
  }
}
