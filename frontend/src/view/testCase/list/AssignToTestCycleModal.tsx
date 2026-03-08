import { Modal } from 'bootstrap';
import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import { i18n } from 'src/i18n';
import TestCycleService from 'src/modules/testCycle/testCycleService';
import Message from 'src/view/shared/message';

const AssignToTestCycleModal = (props) => {
  const { testCaseIds, onSuccess, onClose } = props;
  const modalRef = useRef<any>();
  const [modalInstance, setModalInstance] = useState<any>(null);
  const [options, setOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    value: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (modalRef.current) {
      const modal = new Modal(modalRef.current);
      modal.show();
      setModalInstance(modal);
    }
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const data = await TestCycleService.listAutocomplete('', 100);
        setOptions(
          (data || []).map((item) => ({
            value: item.id,
            label: item.label || item.title || item.id,
          })),
        );
      } catch (e) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const closeModal = () => {
    if (modalInstance) {
      modalInstance.hide();
      onClose();
    }
  };

  const doAssign = async () => {
    if (!selectedOption || submitting) return;
    setSubmitting(true);
    try {
      await TestCycleService.assignTestCases(
        selectedOption.value,
        testCaseIds,
      );
      Message.success(
        i18n('entities.testCase.assignToTestCycle.success'),
      );
      onSuccess();
      closeModal();
    } catch (e) {
      // Message handled by authAxios / Errors
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {i18n('entities.testCase.assignToTestCycle.title')}
            </h5>
            <button
              type="button"
              className="close"
              onClick={closeModal}
              data-dismiss="modal"
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="col-form-label">
                {i18n(
                  'entities.testCase.assignToTestCycle.selectTestCycle',
                )}
              </label>
              <Select
                className="w-100"
                value={selectedOption}
                onChange={setSelectedOption}
                options={options}
                isClearable
                placeholder={
                  loading
                    ? i18n('autocomplete.loading')
                    : i18n(
                        'entities.testCase.assignToTestCycle.selectTestCycle',
                      )
                }
                isDisabled={loading}
                noOptionsMessage={() =>
                  i18n('autocomplete.noOptions')
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light btn-sm"
              data-dismiss="modal"
              onClick={closeModal}
            >
              {i18n('common.cancel')}
            </button>
            <button
              type="button"
              onClick={doAssign}
              className="btn btn-primary btn-sm"
              disabled={!selectedOption || submitting}
            >
              {submitting
                ? i18n('autocomplete.loading')
                : i18n('common.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignToTestCycleModal;
