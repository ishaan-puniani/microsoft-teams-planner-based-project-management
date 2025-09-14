import { IFile } from '../file/IFile';

export interface ITask {
  id?: string;
  title?: string;
  description?: string;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  estimatedStart?: Date;
  estimatedEnd?: Date;
  workStart?: Date;
  workEnd?: Date;
  template?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskCreate {
  title?: string;
  description?: string;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  estimatedStart?: Date;
  estimatedEnd?: Date;
  workStart?: Date;
  workEnd?: Date;
  template?: string;
  tenant: string;
}

export interface ITaskUpdate {
  title?: string;
  description?: string;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  estimatedStart?: Date;
  estimatedEnd?: Date;
  workStart?: Date;
  workEnd?: Date;
  template?: string;
  tenant?: string;
}

export interface ITaskFilter {
  title?: string;
  leadBy?: string;
  reviewedBy?: string;
  tenant?: string;
  estimatedStartFrom?: Date;
  estimatedStartTo?: Date;
  estimatedEndFrom?: Date;
  estimatedEndTo?: Date;
  workStartFrom?: Date;
  workStartTo?: Date;
  workEndFrom?: Date;
  workEndTo?: Date;
  importHash?: string;
}
