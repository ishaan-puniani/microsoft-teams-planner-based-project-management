import { IScheduledEvent } from '../../interfaces/scheduledEvent/IScheduledEvent';
import { ListResponse, SingleResponse } from '../shared/BaseTypes';

export type ScheduledEventListResponse = ListResponse<IScheduledEvent>;
export type ScheduledEventSingleResponse = SingleResponse<IScheduledEvent>;

// Legacy alias for backward compatibility
export type ScheduledEventResponse = ScheduledEventListResponse;
