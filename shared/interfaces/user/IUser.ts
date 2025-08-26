import { IFile } from '../file/IFile';
import { ITenantUser } from '../tenantUser/ITenantUser';

export interface IUser {
  id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  provider?: string;
  providerId?: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  avatars?: IFile[];
  tenants?: ITenantUser[];
  jwtTokenInvalidBefore?: Date;
  createdBy?: string;
  updatedBy?: string;
  importHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserCreate {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  provider?: string;
  providerId?: string;
  email: string;
  password?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  avatars?: IFile[];
  tenants?: ITenantUser[];
  jwtTokenInvalidBefore?: Date;
}

export interface IUserUpdate {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  provider?: string;
  providerId?: string;
  email?: string;
  password?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  emailVerificationTokenExpiresAt?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiresAt?: Date;
  avatars?: IFile[];
  tenants?: ITenantUser[];
  jwtTokenInvalidBefore?: Date;
}

export interface IUserFilter {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  emailVerified?: boolean;
  provider?: string;
  importHash?: string;
}
