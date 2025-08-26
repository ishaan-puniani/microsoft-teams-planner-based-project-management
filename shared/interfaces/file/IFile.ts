export interface IFile {
  id?: string;
  name: string;
  sizeInBytes?: number;
  privateUrl?: string;
  publicUrl?: string;
  tenant?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFileCreate {
  name: string;
  sizeInBytes?: number;
  privateUrl?: string;
  publicUrl?: string;
  tenant?: string;
}

export interface IFileUpdate {
  name?: string;
  sizeInBytes?: number;
  privateUrl?: string;
  publicUrl?: string;
  tenant?: string;
}

export interface IFileFilter {
  name?: string;
  tenant?: string;
}
