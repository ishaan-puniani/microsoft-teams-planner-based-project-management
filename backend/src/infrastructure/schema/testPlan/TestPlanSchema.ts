/// File is generated from https://studio.fabbuilder.com - testPlan

import { z } from 'zod';

const TestPlanSchema = z.object({
  title: z.string().trim(),
  scope: z.string().trim(),
  objective: z.string().trim(),
});

export default TestPlanSchema;

/// File is generated from https://studio.fabbuilder.com - testPlan
