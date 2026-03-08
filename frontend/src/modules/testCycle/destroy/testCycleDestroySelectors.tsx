import { createSelector } from 'reselect';

const selectRaw = (state) => state.testCycle.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testCycleDestroySelectors = {
  selectLoading,
};

export default testCycleDestroySelectors;
