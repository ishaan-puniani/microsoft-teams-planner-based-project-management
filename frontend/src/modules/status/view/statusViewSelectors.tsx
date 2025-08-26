import { createSelector } from 'reselect';

const selectRaw = (state) => state.status.view;

const selectRecord = createSelector(
  [selectRaw],
  (raw) => raw.record,
);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const statusViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default statusViewSelectors;
