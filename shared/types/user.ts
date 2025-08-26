import { IUser, IUserCreate, IUserUpdate, IUserFilter } from '../interfaces/user/IUser';

export type UserEntity = IUser;
export type UserCreateData = IUserCreate;
export type UserUpdateData = IUserUpdate;
export type UserFilterData = IUserFilter;

export type UserProvider = 'local' | 'google' | 'microsoft' | 'github';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export type UserRole = 'admin' | 'user' | 'guest';
