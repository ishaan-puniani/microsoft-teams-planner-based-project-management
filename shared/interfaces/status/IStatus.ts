export interface IStatus {
  id?: string;
  name?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStatusCreate {
  name?: string;
  tenant: string;
}

export interface IStatusUpdate {
  name?: string;
  tenant?: string;
}

export interface IStatusFilter {
  name?: string;
  tenant?: string;
  importHash?: string;
}
