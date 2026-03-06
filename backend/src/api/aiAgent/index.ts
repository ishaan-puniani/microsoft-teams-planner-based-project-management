import createTasksFromTranscript from './createTasksFromTranscript';
import refinePlannerContent from './refinePlannerContent';

export default (app) => {
  app.post('/tenant/:tenantId/ai-agent/tasks-from-transcript', createTasksFromTranscript);
  app.post('/tenant/:tenantId/ai-agent/planner-refine', refinePlannerContent);
};