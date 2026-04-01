import createTasksFromTranscript from './createTasksFromTranscript';
import refinePlannerContent from './refinePlannerContent';
import organizeTasksInPorject from './organizeTasksInPorject';
import plannerSuggestEpics from './plannerSuggestEpics';
import plannerSuggestUserStoriesForEpic from './plannerSuggestUserStoriesForEpic';
import plannerSuggestTasksForUserStory from './plannerSuggestTasksForUserStory';
import plannerSuggestTodosForTask from './plannerSuggestTodosForTask';
import suggestTestCasesForTask from './suggestTestCasesForTask';
import plannerSuggestTaskEstimations from './plannerSuggestTaskEstimations';
import plannerSuggestProjectEstimations from './plannerSuggestProjectEstimations';
import suggestProjectDescription from './suggestProjectDescription';
import suggestProjectIntegrations from './suggestProjectIntegrations';
import chat from './chat';
import { chatHistory } from './chatHistory';

export default (app) => {
  app.post('/tenant/:tenantId/ai-agent/chat/:projectId',chat );
  app.get('/tenant/:tenantId/ai-agent/chat-session/:projectId', chatHistory);
  app.get('/tenant/:tenantId/ai-agent/organize-project-tasks/:projectId', organizeTasksInPorject);
  
  app.get('/tenant/:tenantId/ai-agent/suggest-estimations-for-task/:projectId/:taskId', plannerSuggestTaskEstimations);
  app.get('/tenant/:tenantId/ai-agent/suggest-estimations-for-project/:projectId', plannerSuggestProjectEstimations);
  
  app.post('/tenant/:tenantId/ai-agent/tasks-from-transcript', createTasksFromTranscript);
  app.post('/tenant/:tenantId/ai-agent/planner-refine', refinePlannerContent);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-epics', plannerSuggestEpics);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-user-story-for-epic', plannerSuggestUserStoriesForEpic);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-tasks-for-user-story-of-epic', plannerSuggestTasksForUserStory);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-todos-for-task', plannerSuggestTodosForTask);
  app.post('/tenant/:tenantId/ai-agent/suggest-test-cases-for-task', suggestTestCasesForTask);
  app.post('/tenant/:tenantId/ai-agent/suggest-project-description', suggestProjectDescription);
  app.post('/tenant/:tenantId/ai-agent/suggest-project-integrations', suggestProjectIntegrations);
};