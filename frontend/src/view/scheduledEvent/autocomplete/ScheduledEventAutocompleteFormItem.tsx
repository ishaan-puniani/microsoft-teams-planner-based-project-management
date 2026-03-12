import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useSelector } from 'react-redux';
import selectors from 'src/modules/scheduledEvent/scheduledEventSelectors';
import ScheduledEventService from 'src/modules/scheduledEvent/scheduledEventService';
import AutocompleteInMemoryFormItem from 'src/view/shared/form/items/AutocompleteInMemoryFormItem';
import ScheduledEventFormModal from 'src/view/scheduledEvent/form/ScheduledEventFormModal';

const ScheduledEventAutocompleteFormItem = (props) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { setValue, getValues } = useFormContext();

  const hasPermissionToCreate = useSelector(selectors.selectPermissionToCreate);

  const doCreateSuccess = (record) => {
    const { name, mode } = props;
    if (mode && mode === 'multiple') {
      setValue(name, [...(getValues()[name] || []), record], {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue(name, record, { shouldValidate: true, shouldDirty: true });
    }
    setModalVisible(false);
  };

  const fetchFn = (value, limit) => ScheduledEventService.listAutocomplete(value, limit);

  const mapper = {
    toAutocomplete(originalValue) {
      if (!originalValue) return null;
      const value = originalValue.id;
      let label = originalValue.label;
      if (originalValue.title) label = originalValue.title;
      return { key: value, value, label };
    },
    toValue(originalValue) {
      if (!originalValue) return null;
      return { id: originalValue.value, label: originalValue.label };
    },
  };

  return (
    <>
      <AutocompleteInMemoryFormItem
        {...props}
        fetchFn={fetchFn}
        mapper={mapper}
        onOpenModal={() => setModalVisible(true)}
        hasPermissionToCreate={hasPermissionToCreate}
      />
      {modalVisible && (
        <ScheduledEventFormModal
          onClose={() => setModalVisible(false)}
          onSuccess={doCreateSuccess}
        />
      )}
    </>
  );
};

export default ScheduledEventAutocompleteFormItem;
