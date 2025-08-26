import { ITask, ITaskCreate, ITaskUpdate, ITaskFilter } from '../interfaces/task/ITask';

export type TaskEntity = ITask;
export type TaskCreateData = ITaskCreate;
export type TaskUpdateData = ITaskUpdate;
export type TaskFilterData = ITaskFilter;

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'cancelled';

export type TaskType = 'feature' | 'bug' | 'improvement' | 'documentation' | 'testing';
