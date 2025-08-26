/// File is generated from https://studio.fabbuilder.com - testCase

import { z } from 'zod';

const TestCaseSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  attachment: z.array(z.string()),
  leadBy: z.string(),
  reviewedBy: z.string(),
});

export default TestCaseSchema;

/// File is generated from https://studio.fabbuilder.com - testCase
