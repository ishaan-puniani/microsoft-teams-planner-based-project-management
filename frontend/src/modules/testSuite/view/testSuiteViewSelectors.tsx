import { createSelector } from 'reselect';

const selectRaw = (state) => state.testSuite.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testSuiteViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default testSuiteViewSelectors;
