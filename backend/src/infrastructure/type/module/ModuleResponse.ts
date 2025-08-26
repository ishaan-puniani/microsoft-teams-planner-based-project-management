/// File is generated from https://studio.fabbuilder.com - module

import { IModule } from '../../interfaces/module/IModule';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type ModuleListResponse = ListResponse<IModule>;
export type ModuleSingleResponse = SingleResponse<IModule>;

// Legacy alias for backward compatibility (can be removed later)
export type ModuleResponse = ModuleListResponse;

/// File is generated from https://studio.fabbuilder.com - module
