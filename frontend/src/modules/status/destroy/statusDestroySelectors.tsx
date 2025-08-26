import { createSelector } from 'reselect';

const selectRaw = (state) => state.status.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const statusDestroySelectors = {
  selectLoading,
};

export default statusDestroySelectors;
