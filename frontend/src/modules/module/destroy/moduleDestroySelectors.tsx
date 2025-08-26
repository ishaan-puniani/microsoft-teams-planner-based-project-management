import { createSelector } from 'reselect';

const selectRaw = (state) => state.module.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const moduleDestroySelectors = {
  selectLoading,
};

export default moduleDestroySelectors;
