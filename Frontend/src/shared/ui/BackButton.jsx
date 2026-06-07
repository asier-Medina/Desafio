import { FaArrowLeft } from "./icons";

export default function BackButton({ onClick, label = "Volver", variant = "default", className = "" }) {
  const classes = ["back-btn", variant !== "default" && `back-btn--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button className={classes} onClick={onClick} aria-label={label}>
      <FaArrowLeft />
    </button>
  );
}
