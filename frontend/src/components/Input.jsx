export function Input({ label, id, className = "", ...props }) {
  return (
    <div className="field">
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} className={className} {...props} />
    </div>
  );
}
