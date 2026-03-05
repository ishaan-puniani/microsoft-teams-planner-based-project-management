import createTasksFromTranscript from './createTasksFromTranscript';

export default (app) => {
  app.post('/tenant/:tenantId/ai-agent/tasks-from-transcript', createTasksFromTranscript);
};