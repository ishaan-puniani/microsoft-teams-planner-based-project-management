import { IFile, IFileCreate, IFileUpdate, IFileFilter } from '../interfaces/file/IFile';

export type FileEntity = IFile;
export type FileCreateData = IFileCreate;
export type FileUpdateData = IFileUpdate;
export type FileFilterData = IFileFilter;

export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';

export type FileStatus = 'uploading' | 'uploaded' | 'processing' | 'processed' | 'error';
