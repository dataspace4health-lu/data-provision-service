/*
 * Copyright 2025 NTT DATA Luxembourg
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { parse as csvParse } from 'csv-parse';
import { AppError } from '../utils/errors/custom.error';

export interface FileValidationResult {
    detectedType: string;
    mimeType: string;
    size: number;
    parsedContent: any;
}

export class FileValidationService {
    async validateFile(filePath: string): Promise<FileValidationResult> {
        if (!fs.existsSync(filePath)) {
            throw new AppError('File not found', 404);
        }

        // Read file stats and content
        const stats = fs.statSync(filePath);
        const buffer = fs.readFileSync(filePath);

        // Detect file type using file-type package
        let detectedType: string;
        let mimeType: string;

        try {
            // Dynamic import for 'file-type' to avoid CommonJS compatibility issues.
            const { fileTypeFromBuffer } = await import('file-type');
            const fileTypeResult = await fileTypeFromBuffer(buffer);

            if (fileTypeResult) {
                detectedType = fileTypeResult.ext;
                mimeType = fileTypeResult.mime;
            } else {
                // Fallback to extension-based detection for text files
                const extension = filePath.split('.').pop()?.toLowerCase() || '';
                detectedType = extension;
                mimeType = this.getMimeType(extension);
            }
        } catch (error) {
            // Fallback if file-type import fails
            const extension = filePath.split('.').pop()?.toLowerCase() || '';
            detectedType = extension;
            mimeType = this.getMimeType(extension);
        }

        // Parse content based on detected type
        const content = buffer.toString('utf8');
        let parsedContent;

        try {
            switch (detectedType) {
                case 'json':
                    parsedContent = JSON.parse(content);
                    break;
                case 'csv':
                    parsedContent = await this.parseCSV(content);
                    break;
                case 'txt':
                    parsedContent = content;
                    break;
                default:
                    parsedContent = content;
            }
        } catch (error: any) {
            throw new AppError(`Invalid ${detectedType} format: ${error.message}`, 400);
        }

        return {
            detectedType,
            mimeType,
            size: stats.size,
            parsedContent
        };
    }

    private async parseCSV(content: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            csvParse(content, { columns: true, skip_empty_lines: true }, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    private getMimeType(extension: string): string {
        const types: { [key: string]: string } = {
            'json': 'application/json',
            'csv': 'text/csv',
            'txt': 'text/plain'
        };
        return types[extension] || 'application/octet-stream';
    }
}

export const fileValidationService = new FileValidationService();
