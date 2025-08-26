import { IStatus, IStatusCreate, IStatusUpdate, IStatusFilter } from '../interfaces/status/IStatus';

export type StatusEntity = IStatus;
export type StatusCreateData = IStatusCreate;
export type StatusUpdateData = IStatusUpdate;
export type StatusFilterData = IStatusFilter;

export type StatusType = 'task' | 'requirement' | 'test' | 'bug' | 'feature';

export type StatusColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'gray';
