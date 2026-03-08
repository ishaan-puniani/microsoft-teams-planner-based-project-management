import { createSelector } from 'reselect';

const selectRaw = (state) => state.testCycle.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testCycleViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default testCycleViewSelectors;
