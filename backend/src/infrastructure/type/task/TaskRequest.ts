/// File is generated from https://studio.fabbuilder.com - task

import { ITask } from '../../interfaces/task/ITask';
import { ITaskFilter } from '../../interfaces/task/ITaskFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type TaskRequest = FilterableRequest<ITaskFilter>;
export type TaskCreateRequest = CreateRequest<ITask>;
export type TaskUpdateRequest = UpdateRequest<ITask>;

/// File is generated from https://studio.fabbuilder.com - task
