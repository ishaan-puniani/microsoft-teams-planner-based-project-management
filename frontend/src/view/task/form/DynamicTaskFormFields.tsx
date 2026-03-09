import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import InputNumberFormItem from 'src/view/shared/form/items/InputNumberFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import SwitchFormItem from 'src/view/shared/form/items/SwitchFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';
import { TaskTemplateField } from './DynamicTaskSchema';

export type { TaskTemplateField };

export interface ChecklistItem {
  label: string;
  done: boolean;
}

interface DynamicTaskFormFieldsProps {
  templateFields: TaskTemplateField[];
  loadingTemplate: boolean;
}

const DynamicTaskFormFields: React.FC<DynamicTaskFormFieldsProps> = ({
  templateFields,
  loadingTemplate,
}) => {
  const { control } = useFormContext();

  // Function to render template fields using Controller
  const renderTemplateField = (field: TaskTemplateField) => {
    const fieldName = `templateData.${field.name}`;
    const fieldLabel = field.label || field.name;

    return (
      <div key={fieldName} className="col-lg-7 col-md-8 col-12">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={
            field.type === 'CHECKLIST' ? [] : field.defaultValue ?? ''
          }
          render={({ field: controllerField, fieldState: { error } }) => {
            const commonProps = {
              ...controllerField,
              label: fieldLabel,
              required: field.required,
              errorMessage: error?.message,
            };

            switch (field.type) {
              case 'TEXT':
                return <InputFormItem {...commonProps} />;
              case 'TEXTAREA':
                return <TextAreaFormItem {...commonProps} />;
              case 'NUMBER':
                return <InputNumberFormItem {...commonProps} />;
              case 'DATE':
                return <DatePickerFormItem {...commonProps} showTimeInput />;
              case 'SELECT':
                return (
                  <SelectFormItem
                    {...commonProps}
                    options={field.options?.map((option) => ({
                      value: option,
                      label: option,
                    })) || []}
                  />
                );
              case 'BOOLEAN':
                return <SwitchFormItem {...commonProps} />;
              case 'CHECKLIST': {
                const items: ChecklistItem[] = Array.isArray(controllerField.value)
                  ? controllerField.value
                  : [];
                return (
                  <div className="form-group">
                    {fieldLabel && (
                      <label className="form-label">
                        {fieldLabel}
                        {field.required && <span className="text-danger ms-1">*</span>}
                      </label>
                    )}
                    <p className="text-muted small mb-2">
                      Add checklist items for this task. You can mark each as done when complete.
                    </p>
                    <div className="border rounded p-2 bg-light">
                      {items.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            className="form-check-input flex-shrink-0"
                            id={`${fieldName}-${idx}-done`}
                            checked={!!item.done}
                            onChange={(e) => {
                              const next = items.map((i, iidx) =>
                                iidx === idx ? { ...i, done: e.target.checked } : i
                              );
                              controllerField.onChange(next);
                            }}
                          />
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            value={item.label}
                            onChange={(e) => {
                              const next = items.map((i, iidx) =>
                                iidx === idx ? { ...i, label: e.target.value } : i
                              );
                              controllerField.onChange(next);
                            }}
                            placeholder="Item label"
                          />
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm flex-shrink-0"
                            onClick={() => {
                              const next = items.filter((_, i) => i !== idx);
                              controllerField.onChange(next);
                            }}
                            title="Remove item"
                          >
                            <i className="fas fa-times" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          controllerField.onChange([...items, { label: '', done: false }]);
                        }}
                      >
                        <i className="fas fa-plus me-1" />
                        Add item
                      </button>
                    </div>
                    {error?.message && (
                      <div className="invalid-feedback d-block">{error.message}</div>
                    )}
                  </div>
                );
              }
              default:
                return <InputFormItem {...commonProps} />;
            }
          }}
        />
      </div>
    );
  };

  if (loadingTemplate) {
    return (
      <div className="col-12">
        {/* <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading template fields...</span>
          </div>
        </div> */}
      </div>
    );
  }

  if (templateFields.length === 0) {
    return null;
  }

  return (
    <>
      <div className="col-12">
        <div className="d-flex align-items-center mb-3">
          <i className="fas fa-layer-group me-2"></i>
          <h6 className="mb-0">Template Fields</h6>
        </div>
      </div>
      {templateFields.map((field) => renderTemplateField(field))}
    </>
  );
};

export default DynamicTaskFormFields;
