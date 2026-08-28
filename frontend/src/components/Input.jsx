export function Input({ label, id, className = "", spellCheck = false, ...props }) {
  return (
    <div className="field">
      {label ? <label htmlFor={id}>{label}</label> : null}
      <input id={id} className={className} spellCheck={spellCheck} {...props} />
    </div>
  );
}
