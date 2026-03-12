import { i18n } from 'src/i18n';
import Errors from 'src/modules/shared/error/errors';
import Exporter from 'src/modules/shared/exporter/exporter';
import exporterFields from 'src/modules/scheduledEvent/list/scheduledEventListExporterFields';
import selectors from 'src/modules/scheduledEvent/list/scheduledEventListSelectors';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';

const prefix = 'SCHEDULEDEVENT_LIST';

const scheduledEventListActions = {
  FETCH_STARTED: `${prefix}_FETCH_STARTED`,
  FETCH_SUCCESS: `${prefix}_FETCH_SUCCESS`,
  FETCH_ERROR: `${prefix}_FETCH_ERROR`,

  RESETED: `${prefix}_RESETED`,
  TOGGLE_ONE_SELECTED: `${prefix}_TOGGLE_ONE_SELECTED`,
  TOGGLE_ALL_SELECTED: `${prefix}_TOGGLE_ALL_SELECTED`,
  CLEAR_ALL_SELECTED: `${prefix}_CLEAR_ALL_SELECTED`,

  PAGINATION_CHANGED: `${prefix}_PAGINATION_CHANGED`,
  SORTER_CHANGED: `${prefix}_SORTER_CHANGED`,

  EXPORT_STARTED: `${prefix}_EXPORT_STARTED`,
  EXPORT_SUCCESS: `${prefix}_EXPORT_SUCCESS`,
  EXPORT_ERROR: `${prefix}_EXPORT_ERROR`,

  doClearAllSelected() {
    return { type: scheduledEventListActions.CLEAR_ALL_SELECTED };
  },

  doToggleAllSelected() {
    return { type: scheduledEventListActions.TOGGLE_ALL_SELECTED };
  },

  doToggleOneSelected(id) {
    return { type: scheduledEventListActions.TOGGLE_ONE_SELECTED, payload: id };
  },

  doReset: () => async (dispatch) => {
    dispatch({ type: scheduledEventListActions.RESETED });
    dispatch(scheduledEventListActions.doFetch());
  },

  doExport: () => async (dispatch, getState) => {
    try {
      if (!exporterFields || !exporterFields.length) {
        throw new Error('exporterFields is required');
      }
      dispatch({ type: scheduledEventListActions.EXPORT_STARTED });
      const filter = selectors.selectFilter(getState());
      const response = await ScheduledEventService.list(
        filter,
        selectors.selectOrderBy(getState()),
        null,
        null,
      );
      new Exporter(
        exporterFields,
        i18n('entities.scheduledEvent.exporterFileName'),
      ).transformAndExportAsExcelFile(response.rows);
      dispatch({ type: scheduledEventListActions.EXPORT_SUCCESS });
    } catch (error) {
      Errors.handle(error);
      dispatch({ type: scheduledEventListActions.EXPORT_ERROR });
    }
  },

  doChangePagination: (pagination) => async (dispatch) => {
    dispatch({ type: scheduledEventListActions.PAGINATION_CHANGED, payload: pagination });
    dispatch(scheduledEventListActions.doFetchCurrentFilter());
  },

  doChangeSort: (sorter) => async (dispatch) => {
    dispatch({ type: scheduledEventListActions.SORTER_CHANGED, payload: sorter });
    dispatch(scheduledEventListActions.doFetchCurrentFilter());
  },

  doFetchCurrentFilter: () => async (dispatch, getState) => {
    const filter = selectors.selectFilter(getState());
    const rawFilter = selectors.selectRawFilter(getState());
    dispatch(scheduledEventListActions.doFetch(filter, rawFilter, true));
  },

  doFetch:
    (filter?, rawFilter?, keepPagination = false) =>
    async (dispatch, getState) => {
      try {
        dispatch({
          type: scheduledEventListActions.FETCH_STARTED,
          payload: { filter, rawFilter, keepPagination },
        });
        const response = await ScheduledEventService.list(
          filter,
          selectors.selectOrderBy(getState()),
          selectors.selectLimit(getState()),
          selectors.selectOffset(getState()),
        );
        dispatch({
          type: scheduledEventListActions.FETCH_SUCCESS,
          payload: { rows: response.rows, count: response.count },
        });
      } catch (error) {
        Errors.handle(error);
        dispatch({ type: scheduledEventListActions.FETCH_ERROR });
      }
    },
};

export default scheduledEventListActions;
