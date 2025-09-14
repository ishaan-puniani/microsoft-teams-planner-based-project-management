import { createSelector } from 'reselect';

const selectRaw = (state) => state.taskTemplate.form;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectInitLoading = createSelector(
  [selectRaw],
  (raw) => Boolean(raw.initLoading),
);

const selectSaveLoading = createSelector(
  [selectRaw],
  (raw) => Boolean(raw.saveLoading),
);

const taskTemplateFormSelectors = {
  selectInitLoading,
  selectSaveLoading,
  selectRecord,
  selectRaw,
};

export default taskTemplateFormSelectors;
