import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import DatePickerFormItem from 'src/view/shared/form/items/DatePickerFormItem';
import InputFormItem from 'src/view/shared/form/items/InputFormItem';
import InputNumberFormItem from 'src/view/shared/form/items/InputNumberFormItem';
import SelectFormItem from 'src/view/shared/form/items/SelectFormItem';
import SwitchFormItem from 'src/view/shared/form/items/SwitchFormItem';
import TextAreaFormItem from 'src/view/shared/form/items/TextAreaFormItem';

// Define types locally since shared directory is not accessible
export interface TaskTemplateField {
  id: string;
  name: string;
  type: 'TEXT' | 'TEXTAREA' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN';
  required?: boolean;
  options?: string[];
  defaultValue?: any;
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
    const fieldName = `templateData.${field.id}`;
    const fieldLabel = field.name.charAt(0).toUpperCase() + field.name.slice(1);

    return (
      <div key={fieldName} className="col-lg-7 col-md-8 col-12">
        <Controller
          name={fieldName}
          control={control}
          defaultValue={field.defaultValue || ''}
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
