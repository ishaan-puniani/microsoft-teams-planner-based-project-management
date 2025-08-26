export interface IModule {
  id?: string;
  title?: string;
  details?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IModuleCreate {
  title?: string;
  details?: string;
  tenant: string;
}

export interface IModuleUpdate {
  title?: string;
  details?: string;
  tenant?: string;
}

export interface IModuleFilter {
  title?: string;
  tenant?: string;
  importHash?: string;
}
