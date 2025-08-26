/// File is generated from https://studio.fabbuilder.com - task

import { ITask } from '../../interfaces/task/ITask';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type TaskListResponse = ListResponse<ITask>;
export type TaskSingleResponse = SingleResponse<ITask>;

// Legacy alias for backward compatibility (can be removed later)
export type TaskResponse = TaskListResponse;

/// File is generated from https://studio.fabbuilder.com - task
