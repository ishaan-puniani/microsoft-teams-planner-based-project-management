import { createSelector } from 'reselect';

const selectRaw = (state) => state.taskTemplate.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const taskTemplateDestroySelectors = {
  selectLoading,
};

export default taskTemplateDestroySelectors;
