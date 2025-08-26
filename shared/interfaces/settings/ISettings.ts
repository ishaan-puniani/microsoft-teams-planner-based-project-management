import { IFile } from '../file/IFile';

export interface ISettings {
  id?: string;
  theme: string;
  backgroundImages?: IFile[];
  logos?: IFile[];
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISettingsCreate {
  theme: string;
  backgroundImages?: IFile[];
  logos?: IFile[];
  tenant: string;
}

export interface ISettingsUpdate {
  theme?: string;
  backgroundImages?: IFile[];
  logos?: IFile[];
  tenant?: string;
}

export interface ISettingsFilter {
  theme?: string;
  tenant?: string;
}
