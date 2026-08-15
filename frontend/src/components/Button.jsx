export function Button({
  children,
  variant = "default",
  type = "button",
  className = "",
  ...props
}) {
  const extra = variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : variant === "tertiary" ? "btn-tertiary" : "";
  return (
    <button type={type} className={`btn ${extra} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}
