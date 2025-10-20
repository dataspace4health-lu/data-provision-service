import { Request, Response } from 'express';
import { getFileStream } from '../services/dataAsset.service';
import { BASE_FILE_PATH } from '../config/loader';
import path from 'path';

export async function getDataAsset(req: Request, res: Response) {
    const { filename } = req.params;
    console.log("Received filename:", filename);
    const fullPath = path.resolve(BASE_FILE_PATH || 'data', filename);
    try {
        
        const result = await getFileStream(fullPath);
        console.log("result:", result);
        res.download(fullPath);
    } catch (err: any) {
        res.status(404).json({
            message: err.message || 'An error occurred while retrieving the data asset'
        });
    }

}