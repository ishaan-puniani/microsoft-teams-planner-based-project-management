import { createSelector } from 'reselect';

const selectRaw = (state) => state.requirement.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const requirementDestroySelectors = {
  selectLoading,
};

export default requirementDestroySelectors;
