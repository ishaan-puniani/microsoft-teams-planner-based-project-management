import { useCallback, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import MsPlannerService from 'src/modules/msPlanner/msPlannerService';

const MsPlanAutocompleteFormItem = (props) => {
  const showGroupPicker = props.showGroupPicker || false;

  const [groups, setGroups] = useState<any[]>([]);
  const [groupId, setGroupId] = useState<string | null>(
    null,
  );
  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState<string | null>(null);

  const {
    watch,
    setValue,
    register,
    formState: { touchedFields, errors, isSubmitted },
  } = useFormContext();
  const originalValue = watch(props.name);

  useEffect(() => {
    register(props.name);
  }, [register, props.name]);

  const handleSelectOne = (value) => {
    setValue(props.name, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
    props.onChange && props.onChange(value);
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const groups =
        await MsPlannerService.listGroupsAutocomplete(
          null,
          100,
        );
      setGroups(groups);
      setGroupId(groups[0].id);
    };
    fetchGroups();
  }, []);

  const fetchPlansFn = useCallback(
    async (value, limit) => {
      const plans =
        await MsPlannerService.listPlansAutocomplete(
          value,
          limit,
          groupId,
        );
      setPlans(plans);
      setPlanId(plans[0].id);
      return plans;
    },
    [groupId],
  );

  useEffect(() => {
    if (groupId) {
      fetchPlansFn(null, 100);
    }
  }, [fetchPlansFn, groupId]);

  return (
    <>
      {showGroupPicker && (
        <select
          value={groupId || ''}
          onChange={(e) => setGroupId(e.target.value)}
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.label}
            </option>
          ))}
        </select>
      )}
      {groupId && (
        <select
          value={planId || ''}
          onChange={(e) => handleSelectOne(e.target.value)}
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.label}
            </option>
          ))}
        </select>
      )}
    </>
  );
};
export default MsPlanAutocompleteFormItem;
