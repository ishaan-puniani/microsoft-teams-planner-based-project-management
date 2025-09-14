import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import selectors from 'src/modules/taskTemplate/taskTemplateSelectors';
import TaskTemplateService from 'src/modules/taskTemplate/taskTemplateService';
import AutocompleteInMemoryFormItem from 'src/view/shared/form/items/AutocompleteInMemoryFormItem';
import TaskTemplateFormModal from 'src/view/taskTemplate/form/TaskTemplateFormModal';

const TaskTemplateAutocompleteFormItem = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { setValue, getValues } = useFormContext();

  const hasPermissionToCreate = useSelector(
    selectors.selectPermissionToCreate,
  );

  const doCloseModal = () => {
    setModalVisible(false);
  };

  const doOpenModal = () => {
    setModalVisible(true);
  };

  const doCreateSuccess = (record) => {
    if (props.mode === 'multiple') {
      const currentValue = getValues(props.name) || [];
      setValue(props.name, [...currentValue, record], {
        shouldValidate: false,
        shouldDirty: true,
      });
    } else {
      setValue(props.name, record, {
        shouldValidate: false,
        shouldDirty: true,
      });
    }

    doCloseModal();
  };

  const fetchFn = (value, limit) => {
    return TaskTemplateService.listAutocomplete(value, limit);
  };

  const mapper = {
    toAutocomplete(original) {
      if (!original) {
        return undefined;
      }

      const value = original.id;
      const label = original.label;

      return {
        key: value,
        value,
        label,
      };
    },

    toValue(original) {
      if (!original) {
        return undefined;
      }

      return {
        id: original.value,
        label: original.label,
      };
    },
  };

  return (
    <>
      <AutocompleteInMemoryFormItem
        {...props}
        fetchFn={fetchFn}
        mapper={mapper}
        onOpenModal={doOpenModal}
        hasPermissionToCreate={hasPermissionToCreate}
      />

      {modalVisible && (
        <TaskTemplateFormModal
          visible={modalVisible}
          onCancel={doCloseModal}
          onSuccess={doCreateSuccess}
        />
      )}
    </>
  );
};

export default TaskTemplateAutocompleteFormItem;
