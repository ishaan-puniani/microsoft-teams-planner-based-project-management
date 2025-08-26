import { createSelector } from 'reselect';

const selectRaw = (state) => state.requirement.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const requirementViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default requirementViewSelectors;
