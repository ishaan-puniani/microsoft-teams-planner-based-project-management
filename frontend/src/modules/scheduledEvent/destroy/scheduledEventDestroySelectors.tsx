import { createSelector } from 'reselect';

const selectRaw = (state) => state.scheduledEvent.destroy;

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const scheduledEventDestroySelectors = {
  selectLoading,
};

export default scheduledEventDestroySelectors;
