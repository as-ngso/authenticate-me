import { ErrorMessage, Field, useField } from 'formik';

const FormInput = ({ label, ...props }: any) => {
  const [field, meta] = useField(props);

  return (
    <div>
      <label htmlFor={props.id}>{label}</label>
      <input id={props.id} {...field} {...props} />
      {meta.touched && meta.error ? <div>{meta.error}</div> : null}
    </div>
  );
};

export default FormInput;
