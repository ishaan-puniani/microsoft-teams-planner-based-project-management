import { i18n } from 'src/i18n';
import exporterFields from 'src/modules/taskTemplate/list/taskTemplateListExporterFields';
import selectors from 'src/modules/taskTemplate/list/taskTemplateListSelectors';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import Errors from 'src/modules/shared/error/errors';
import Exporter from 'src/modules/shared/exporter/exporter';

const prefix = 'TASK_TEMPLATE_LIST';

const taskTemplateListActions = {
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
    return {
      type: taskTemplateListActions.CLEAR_ALL_SELECTED,
    };
  },

  doToggleAllSelected() {
    return {
      type: taskTemplateListActions.TOGGLE_ALL_SELECTED,
    };
  },

  doToggleOneSelected(id) {
    return {
      type: taskTemplateListActions.TOGGLE_ONE_SELECTED,
      payload: id,
    };
  },

  doReset: () => async (dispatch) => {
    dispatch({
      type: taskTemplateListActions.RESETED,
    });

    dispatch(taskTemplateListActions.doFetch());
  },

  doExport: () => async (dispatch, getState) => {
    try {
      if (!exporterFields || !exporterFields.length) {
        throw new Error('exporterFields is required');
      }

      dispatch({
        type: taskTemplateListActions.EXPORT_STARTED,
      });

      const filter = selectors.selectFilter(getState());
      const response = await TaskTemplateService.list(
        filter,
        selectors.selectOrderBy(getState()),
        null,
        null,
      );

      new Exporter(
        exporterFields,
        i18n('entities.taskTemplate.exporterFileName'),
      ).transformAndExportAsExcelFile(response.rows);

      dispatch({
        type: taskTemplateListActions.EXPORT_SUCCESS,
      });
    } catch (error) {
      Errors.handle(error);

      dispatch({
        type: taskTemplateListActions.EXPORT_ERROR,
      });
    }
  },

  doChangePagination:
    (pagination) => async (dispatch, getState) => {
      dispatch({
        type: taskTemplateListActions.PAGINATION_CHANGED,
        payload: pagination,
      });

      dispatch(taskTemplateListActions.doFetchCurrentFilter());
    },

  doChangeSort: (sorter) => async (dispatch, getState) => {
    dispatch({
      type: taskTemplateListActions.SORTER_CHANGED,
      payload: sorter,
    });

    dispatch(taskTemplateListActions.doFetchCurrentFilter());
  },

  doFetchCurrentFilter:
    () => async (dispatch, getState) => {
      const filter = selectors.selectFilter(getState());
      const rawFilter =
        selectors.selectRawFilter(getState());
      dispatch(
        taskTemplateListActions.doFetch(filter, rawFilter, true),
      );
    },

  doFetch:
    (filter?, rawFilter?, keepPagination = false) =>
    async (dispatch, getState) => {
      try {
        dispatch({
          type: taskTemplateListActions.FETCH_STARTED,
          payload: { filter, rawFilter, keepPagination },
        });

        const response = await TaskTemplateService.list(
          filter,
          selectors.selectOrderBy(getState()),
          selectors.selectLimit(getState()),
          selectors.selectOffset(getState()),
        );

        dispatch({
          type: taskTemplateListActions.FETCH_SUCCESS,
          payload: {
            rows: response.rows,
            count: response.count,
          },
        });
      } catch (error) {
        Errors.handle(error);

        dispatch({
          type: taskTemplateListActions.FETCH_ERROR,
        });
      }
    },
};

export default taskTemplateListActions;
