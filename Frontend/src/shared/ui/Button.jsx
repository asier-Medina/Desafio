import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className = "",
  onClick,
  ...rest
}) {
  const classes = [
    "btn",
    `btn--${variant}`,
    btn--${size},
    fullWidth ? "btn--full" : "",
    loading ? "btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btnspinner" aria-hidden="true" />}
      {Icon && !loading && <Icon className="btnicon" aria-hidden="true" />}
      {children && <span className="btn__text">{children}</span>}
    </button>
  );
}