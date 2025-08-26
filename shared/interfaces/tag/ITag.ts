export interface ITag {
  id?: string;
  title?: string;
  tenant: string;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITagCreate {
  title?: string;
  tenant: string;
}

export interface ITagUpdate {
  title?: string;
  tenant?: string;
}

export interface ITagFilter {
  title?: string;
  tenant?: string;
  importHash?: string;
}
