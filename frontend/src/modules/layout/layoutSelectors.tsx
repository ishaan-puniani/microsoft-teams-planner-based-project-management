import { createSelector } from 'reselect';

const selectRaw = (state) => state.layout;

const selectMenuVisible = createSelector(
  [selectRaw],
  (layout) => Boolean(layout.menuVisible),
);

const selectLoading = createSelector(
  [selectRaw],
  (layout) => Boolean(layout.loading),
);

const selectLanguage = createSelector(
  [selectRaw],
  (layout) => layout.language,
);

const selectSelectedProject = createSelector(
  [selectRaw],
  (layout) => layout.selectedProject,
);

const layoutSelectors = {
  selectRaw,
  selectMenuVisible,
  selectLoading,
  selectLanguage,
  selectSelectedProject,
};

export default layoutSelectors;
