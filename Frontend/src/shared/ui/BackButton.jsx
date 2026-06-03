import { FaArrowLeft } from "./icons";

export default function BackButton({ onClick, label = "Volver", className = "" }) {
  return (
    <button
      className={`back-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={label}
    >
      <FaArrowLeft />
    </button>
  );
}
