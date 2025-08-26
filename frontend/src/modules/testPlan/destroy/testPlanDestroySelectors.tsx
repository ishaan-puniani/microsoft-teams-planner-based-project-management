import { createSelector } from 'reselect';

const selectRaw = (state) => state.testPlan.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const testPlanDestroySelectors = {
  selectLoading,
};

export default testPlanDestroySelectors;
