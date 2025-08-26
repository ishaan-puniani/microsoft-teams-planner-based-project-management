import { IFile } from '../file/IFile';

export interface ITestCase {
  id?: string;
  title?: string;
  description?: string;
  steps?: any;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITestCaseCreate {
  title?: string;
  description?: string;
  steps?: any;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  tenant: string;
}

export interface ITestCaseUpdate {
  title?: string;
  description?: string;
  steps?: any;
  attachment?: IFile[];
  leadBy?: string;
  reviewedBy?: string;
  tenant?: string;
}

export interface ITestCaseFilter {
  title?: string;
  leadBy?: string;
  reviewedBy?: string;
  tenant?: string;
  importHash?: string;
}
