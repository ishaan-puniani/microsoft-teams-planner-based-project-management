import { createSelector } from 'reselect';

const selectRaw = (state) => state.taskTemplate.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const taskTemplateViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default taskTemplateViewSelectors;
