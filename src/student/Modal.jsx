import { useEffect, useRef } from "react";

/** Accessible modal: closes on Escape / backdrop click and locks page scroll. */
export default function Modal({ onClose, labelledBy, className = "", align = "center", children }) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") closeRef.current();
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      className={`modal-overlay modal-${align}`}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={`modal-panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
