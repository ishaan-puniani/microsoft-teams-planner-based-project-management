import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import FormErrors from 'src/view/shared/form/formErrors';
import ImagesUploader from 'src/view/shared/uploaders/ImagesUploader';

function ImagesFormItem(props) {
  const {
    label,
    name,
    hint,
    storage,
    max,
    required,
    externalErrorMessage,
  } = props;

  const {
    formState: { touchedFields, errors, isSubmitted },
    setValue,
    watch,
    register,
  } = useFormContext();

  useEffect(() => {
    register(name);
  }, [register, name]);

  const errorMessage = FormErrors.errorMessage(
    name,
    errors,
    touchedFields,
    isSubmitted,
    externalErrorMessage,
  );

  return (
    <div className="form-group">
      {Boolean(label) && (
        <label
          className={`col-form-label ${
            required ? 'required' : null
          }`}
          htmlFor={name}
        >
          {label}
        </label>
      )}

      <br />

      <ImagesUploader
        storage={storage}
        value={watch(name)}
        onChange={(value) => {
          setValue(name, value, {
            shouldValidate: true,
            shouldDirty: true,
          });
          props.onChange && props.onChange(value);
        }}
        max={max}
      />

      <div className="invalid-feedback">{errorMessage}</div>
      {Boolean(hint) && (
        <small className="form-text text-muted">
          {hint}
        </small>
      )}
    </div>
  );
}

ImagesFormItem.defaultProps = {
  max: undefined,
  required: false,
};

ImagesFormItem.propTypes = {
  storage: PropTypes.object.isRequired,
  max: PropTypes.number,

  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  hint: PropTypes.string,
  formItemProps: PropTypes.object,
};

export default ImagesFormItem;
