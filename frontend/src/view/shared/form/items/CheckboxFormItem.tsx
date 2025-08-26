import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import FormErrors from 'src/view/shared/form/formErrors';

export function CheckboxFormItem(props) {
  const {
    label,
    name,
    hint,
    required,
    externalErrorMessage,
  } = props;

  const {
    register,
    formState: { touchedFields, errors, isSubmitted },
    setValue,
    watch,
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

      <div>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={watch(name) || false}
          onChange={(e) => {
            setValue(name, Boolean(e.target.checked), {
              shouldValidate: true,
              shouldDirty: true,
            });
            props.onChange &&
              props.onChange(e.target.checked);
          }}
          onBlur={(event) =>
            props.onBlur && props.onBlur(event)
          }
        />
      </div>

      <div className="invalid-feedback">{errorMessage}</div>

      {Boolean(hint) && (
        <small className="form-text text-muted">
          {hint}
        </small>
      )}
    </div>
  );
}

CheckboxFormItem.defaultProps = {};

CheckboxFormItem.propTypes = {
  name: PropTypes.string.isRequired,
  required: PropTypes.bool,
  label: PropTypes.string,
  hint: PropTypes.string,
  externalErrorMessage: PropTypes.string,
};

export default CheckboxFormItem;
