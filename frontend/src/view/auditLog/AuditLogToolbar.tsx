import { useDispatch, useSelector } from 'react-redux';
import { Tooltip } from 'react-tooltip';
import { i18n } from 'src/i18n';
import actions from 'src/modules/auditLog/auditLogActions';
import selectors from 'src/modules/auditLog/auditLogSelectors';
import { AppDispatch } from 'src/modules/store';
import ButtonIcon from 'src/view/shared/ButtonIcon';
import Toolbar from 'src/view/shared/styles/Toolbar';

function AuditLogToolbar(props) {
  const loading = useSelector(selectors.selectLoading);
  const exportLoading = useSelector(
    selectors.selectExportLoading,
  );
  const hasRows = useSelector(selectors.selectHasRows);
  const dispatch = useDispatch<AppDispatch>();

  const doExport = () => {
    dispatch(actions.doExport());
  };

  const disabled = !hasRows || loading;

  return (
    <Toolbar>
      <span
        data-tip={i18n('common.noDataToExport')}
        data-tip-disable={!disabled}
        data-for="audit-log-toolbar-export-tooltip"
      >
        <button
          className="btn btn-light"
          type="button"
          disabled={disabled}
          onClick={doExport}
        >
          <ButtonIcon
            loading={exportLoading}
            iconClass="far fa-file-excel"
          />{' '}
          {i18n('common.export')}
        </button>
      </span>
      <Tooltip id="audit-log-toolbar-export-tooltip" />
    </Toolbar>
  );
}

export default AuditLogToolbar;
