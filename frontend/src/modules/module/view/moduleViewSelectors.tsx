import { createSelector } from 'reselect';

const selectRaw = (state) => state.module.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const moduleViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default moduleViewSelectors;
