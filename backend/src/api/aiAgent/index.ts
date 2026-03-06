import createTasksFromTranscript from './createTasksFromTranscript';
import refinePlannerContent from './refinePlannerContent';
import plannerSuggestEpics from './plannerSuggestEpics';
import plannerSuggestUserStoriesForEpic from './plannerSuggestUserStoriesForEpic';
import plannerSuggestTasksForUserStory from './plannerSuggestTasksForUserStory';
import plannerSuggestTodosForTask from './plannerSuggestTodosForTask';

export default (app) => {
  app.post('/tenant/:tenantId/ai-agent/tasks-from-transcript', createTasksFromTranscript);
  app.post('/tenant/:tenantId/ai-agent/planner-refine', refinePlannerContent);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-epics', plannerSuggestEpics);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-user-story-for-epic', plannerSuggestUserStoriesForEpic);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-tasks-for-user-story-of-epic', plannerSuggestTasksForUserStory);
  app.post('/tenant/:tenantId/ai-agent/planner-suggest-todos-for-task', plannerSuggestTodosForTask);
};