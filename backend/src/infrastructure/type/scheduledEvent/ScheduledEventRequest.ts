import { IScheduledEvent } from '../../interfaces/scheduledEvent/IScheduledEvent';
import { IScheduledEventFilter } from '../../interfaces/scheduledEvent/IScheduledEventFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

export type ScheduledEventRequest = FilterableRequest<IScheduledEventFilter>;
export type ScheduledEventCreateRequest = CreateRequest<IScheduledEvent>;
export type ScheduledEventUpdateRequest = UpdateRequest<IScheduledEvent>;
