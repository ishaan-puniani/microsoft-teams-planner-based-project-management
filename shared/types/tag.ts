import { ITag, ITagCreate, ITagUpdate, ITagFilter } from '../interfaces/tag/ITag';

export type TagEntity = ITag;
export type TagCreateData = ITagCreate;
export type TagUpdateData = ITagUpdate;
export type TagFilterData = ITagFilter;

export type TagType = 'task' | 'requirement' | 'test' | 'bug' | 'feature' | 'general';

export type TagColor = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'gray';
