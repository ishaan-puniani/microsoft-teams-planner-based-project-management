/// File is generated from https://studio.fabbuilder.com - tag

import { ITag } from '../../interfaces/tag/ITag';
import {
  ListResponse,
  SingleResponse,
} from '../shared/BaseTypes';

// Entity-specific response types using shared generics
export type TagListResponse = ListResponse<ITag>;
export type TagSingleResponse = SingleResponse<ITag>;

// Legacy alias for backward compatibility (can be removed later)
export type TagResponse = TagListResponse;

/// File is generated from https://studio.fabbuilder.com - tag
