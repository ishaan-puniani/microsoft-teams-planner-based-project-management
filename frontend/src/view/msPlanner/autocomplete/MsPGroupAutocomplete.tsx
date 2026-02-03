import MsPlannerService from 'src/modules/msPlanner/msPlannerService';
import AutocompleteInMemoryFormItem from 'src/view/shared/form/items/AutocompleteInMemoryFormItem';

const MsPGroupAutocompleteFormItem = (props) => {
  const fetchFn = (value, limit) => {
    return MsPlannerService.listGroupsAutocomplete(value, limit);
  };

  const mapper = {
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
  };

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

export default MsPGroupAutocompleteFormItem;
