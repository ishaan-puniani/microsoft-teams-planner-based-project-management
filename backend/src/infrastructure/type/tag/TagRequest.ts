/// File is generated from https://studio.fabbuilder.com - tag

import { ITag } from '../../interfaces/tag/ITag';
import { ITagFilter } from '../../interfaces/tag/ITagFilter';
import {
  FilterableRequest,
  CreateRequest,
  UpdateRequest,
} from '../shared/BaseTypes';

// Entity-specific request types using shared generics
export type TagRequest = FilterableRequest<ITagFilter>;
export type TagCreateRequest = CreateRequest<ITag>;
export type TagUpdateRequest = UpdateRequest<ITag>;

/// File is generated from https://studio.fabbuilder.com - tag
