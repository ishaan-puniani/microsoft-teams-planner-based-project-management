import { IModule, IModuleCreate, IModuleUpdate, IModuleFilter } from '../interfaces/module/IModule';

export type ModuleEntity = IModule;
export type ModuleCreateData = IModuleCreate;
export type ModuleUpdateData = IModuleUpdate;
export type ModuleFilterData = IModuleFilter;

export type ModuleStatus = 'active' | 'inactive' | 'archived';

export type ModuleType = 'feature' | 'component' | 'service' | 'utility';
