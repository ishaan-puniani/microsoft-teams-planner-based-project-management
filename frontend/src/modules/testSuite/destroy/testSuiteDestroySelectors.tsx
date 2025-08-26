import { createSelector } from 'reselect';

const selectRaw = (state) => state.testSuite.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testSuiteDestroySelectors = {
  selectLoading,
};

export default testSuiteDestroySelectors;
