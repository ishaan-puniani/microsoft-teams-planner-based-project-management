/// File is generated from https://studio.fabbuilder.com - requirement

import { z } from 'zod';

const RequirementSchema = z.object({
  title: z.string().trim(),
  background: z.string().trim(),
  acceptanceCriteria: z.string().trim(),
});

export default RequirementSchema;

/// File is generated from https://studio.fabbuilder.com - requirement
