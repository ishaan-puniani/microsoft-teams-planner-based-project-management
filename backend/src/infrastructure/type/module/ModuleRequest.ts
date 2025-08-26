/// File is generated from https://studio.fabbuilder.com - module

import { IModule } from '../../interfaces/module/IModule';
import { IModuleFilter } from '../../interfaces/module/IModuleFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type ModuleRequest =
  FilterableRequest<IModuleFilter>;
export type ModuleCreateRequest = CreateRequest<IModule>;
export type ModuleUpdateRequest = UpdateRequest<IModule>;

/// File is generated from https://studio.fabbuilder.com - module
