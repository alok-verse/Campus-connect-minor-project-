import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { UIContext } from "./ui-context";
import "./ui.css";

/* Replaces the browser's alert() / confirm() with proper toasts and dialogs. */

export default function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(0);
  const focusRef = useRef(null);

  const toast = useCallback((message, type = "success") => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  const confirm = useCallback(
    (options) => new Promise((resolve) => setDialog({ ...options, resolve })),
    []
  );

  const closeDialog = useCallback(
    (result) => {
      dialog?.resolve(result);
      setDialog(null);
    },
    [dialog]
  );

  useEffect(() => {
    if (!dialog) return undefined;
    focusRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") closeDialog(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dialog, closeDialog]);

  const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <UIContext.Provider value={value}>
      {children}

      <div className="ui-toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`ui-toast ui-toast-${t.type}`} role="status">
            <span className="ui-toast-icon" aria-hidden="true">
              {t.type === "error" ? "!" : t.type === "info" ? "i" : "✓"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {dialog && (
        <div
          className="ui-overlay"
          onMouseDown={(event) => event.target === event.currentTarget && closeDialog(false)}
        >
          <div
            className="ui-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="ui-dialog-title"
            aria-describedby="ui-dialog-message"
          >
            <h3 id="ui-dialog-title">{dialog.title || "Are you sure?"}</h3>
            <p id="ui-dialog-message">{dialog.message}</p>
            <div className="ui-dialog-actions">
              <button
                type="button"
                className="ui-btn ui-btn-ghost"
                ref={dialog.danger ? focusRef : null}
                onClick={() => closeDialog(false)}
              >
                {dialog.cancelText || "Cancel"}
              </button>
              <button
                type="button"
                className={`ui-btn ${dialog.danger ? "ui-btn-danger" : "ui-btn-primary"}`}
                ref={dialog.danger ? null : focusRef}
                onClick={() => closeDialog(true)}
              >
                {dialog.confirmText || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </UIContext.Provider>
  );
}
