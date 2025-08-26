/// File is generated from https://studio.fabbuilder.com - task

import { z } from 'zod';

const TaskSchema = z.object({
  title: z.string().trim(),
  description: z.string().trim(),
  attachment: z.array(z.string()),
  leadBy: z.string(),
  reviewedBy: z.string(),
  estimatedStart: z.date(),
  estimatedEnd: z.date(),
  workStart: z.date(),
  workEnd: z.date(),
});

export default TaskSchema;

/// File is generated from https://studio.fabbuilder.com - task
