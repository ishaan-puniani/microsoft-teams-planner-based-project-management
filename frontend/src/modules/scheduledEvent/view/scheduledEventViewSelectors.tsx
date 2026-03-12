import { createSelector } from 'reselect';

const selectRaw = (state) => state.scheduledEvent.view;

const selectRecord = createSelector([selectRaw], (raw) => raw.record);

const selectLoading = createSelector([selectRaw], (raw) =>
  Boolean(raw.loading),
);

const scheduledEventViewSelectors = {
  selectLoading,
  selectRecord,
  selectRaw,
};

export default scheduledEventViewSelectors;
