import { Modal } from 'bootstrap';
import { useEffect, useRef, useState } from 'react';

const ConfirmModal = (props) => {
  const modalRef = useRef<any>();
  const [modalInstance, setModalInstance] =
    useState<any>(null);

  useEffect(() => {
    if (modalRef.current) {
      const modal = new Modal(modalRef.current);
      modal.show();
      setModalInstance(modal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onConfirm = () => {
    (window as any).$(modalRef.current).modal('hide');
    return props.onConfirm();
  };

  const closeModal = () => {
    if (modalInstance) {
      modalInstance.hide();
      const modal = new Modal(modalRef.current);
      modal.hide();
      props.onClose();
    }
  };

  return (
    <div ref={modalRef} className="modal" tabIndex={-1}>
      <div className="modal-dialog modal-sm">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{props.title}</h5>
            <button
              type="button"
              className="close"
              onClick={closeModal}
              data-dismiss="modal"
            >
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-light btn-sm"
              data-dismiss="modal"
              onClick={closeModal}
            >
              {props.cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="btn btn-primary btn-sm"
            >
              {props.okText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
