import fs from 'fs';
import formidable from 'formidable-serverless';
import MsTaskService from '../../integrations/msGraph/msTaskService';
import ApiResponseHandler from '../apiResponseHandler';
import { getMsPlannerAuth } from './getMsPlannerAuth';

const MAX_FILE_BYTES = 25 * 1024 * 1024;

export default async (req, res, next) => {
  try {
    const msPlannerAuth = getMsPlannerAuth(req);
    if (!msPlannerAuth) {
      return ApiResponseHandler.error(
        req,
        res,
        new Error('Microsoft Planner is not configured for this tenant.'),
      );
    }
    const planId = req.params.planId;

    const form = new formidable.IncomingForm();
    form.maxFileSize = MAX_FILE_BYTES;

    const { files } = await new Promise<{ fields: any; files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const raw = files.file;
    const file = Array.isArray(raw) ? raw[0] : raw;
    if (!file?.path) {
      return ApiResponseHandler.error(req, res, new Error('Missing file field "file".'));
    }

    let buffer: Buffer;
    try {
      buffer = fs.readFileSync(file.path);
    } finally {
      try {
        fs.unlinkSync(file.path);
      } catch {
        /* ignore */
      }
    }

    const originalName = file.name || 'upload';
    const mime = file.type || 'application/octet-stream';

    const payload = await MsTaskService.uploadPlannerTaskFileForPlan(
      planId,
      originalName,
      mime,
      buffer,
      msPlannerAuth,
    );

    await ApiResponseHandler.success(req, res, payload);
  } catch (error: any) {
    if (error?.message?.includes?.('maxFileSize') || error?.code === 'LIMIT_FILE_SIZE') {
      return ApiResponseHandler.error(
        req,
        res,
        new Error(`File too large (max ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))} MB).`),
      );
    }
    await ApiResponseHandler.error(req, res, error);
  }
};
