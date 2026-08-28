export function Button({
  children,
  variant = "default",
  type = "button",
  className = "",
  disabled,
  ...props
}) {
  const extra = variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : variant === "tertiary" ? "btn-tertiary" : "";
  return (
    <button type={type} className={`btn ${extra} ${className}`.trim()} disabled={disabled} aria-disabled={disabled || undefined} {...props}>
      {children}
    </button>
  );
}
