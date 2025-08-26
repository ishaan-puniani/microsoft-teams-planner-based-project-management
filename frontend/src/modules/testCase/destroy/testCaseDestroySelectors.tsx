import { createSelector } from 'reselect';

const selectRaw = (state) => state.testCase.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testCaseDestroySelectors = {
  selectLoading,
};

export default testCaseDestroySelectors;
