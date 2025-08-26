/// File is generated from https://studio.fabbuilder.com - module

import { z } from 'zod';

const ModuleSchema = z.object({
  title: z.string().trim(),
  details: z.string().trim(),
});

export default ModuleSchema;

/// File is generated from https://studio.fabbuilder.com - module
