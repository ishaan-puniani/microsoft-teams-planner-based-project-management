import { useCallback, useMemo } from 'react';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import AutocompleteInMemoryFormItem from 'src/view/shared/form/items/AutocompleteInMemoryFormItem';

const MsPlanAutocompleteFormItem = (props) => {
  const fetchFn = useCallback(
    (value, limit) => {
      return MsPlannerService.listPlansAutocomplete(value, limit, props.groupId);
    },
    [props.groupId],
  );

  const mapper = useMemo(() => ({
    toAutocomplete(originalValue) {
      if (!originalValue) {
        return null;
      }

      const value = originalValue.id;
      let label = originalValue.label;

      if (originalValue.name) {
        label = originalValue.name;
      }
      return {
        key: value,
        value,
        label,
      };
    },

    toValue(originalValue) {
      if (!originalValue) {
        return null;
      }

      return {
        id: originalValue.value,
        label: originalValue.label,
      };
    },
  }), []);

  return (
    <>
      <AutocompleteInMemoryFormItem
        {...props}
        fetchFn={fetchFn}
        mapper={mapper}
        onOpenModal={() => {}}
        hasPermissionToCreate={false}
      />
    </>
  );
};

export default MsPlanAutocompleteFormItem;
