import { useState, useEffect, useRef, useCallback } from "react";
import api from "../services/api";
import styles from "../styles/Addworkspace.module.css";

/* ── Spinner (reused from WorkspaceDetails pattern) ─────── */
const Spinner = () => <span className={styles.spinner} />;

/* ══════════════════════════════════════════════════════════
   ADD WORKSPACE MODAL
   Props:
     onClose   () => void          — called when modal should close
     onCreated (workspace) => void — called after successful POST
══════════════════════════════════════════════════════════ */
const AddWorkspaceModal = ({ onClose, onCreated }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef(null);
  const overlayRef = useRef(null);

  /* Auto-focus the name field when modal opens */
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  /* Close on Escape key */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    },
    [onClose, submitting]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* Close when clicking the backdrop (not the dialog itself) */
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current && !submitting) onClose();
  };

  /* Submit */
  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Workspace name is required.");
      nameRef.current?.focus();
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const res = await api.post("/workspace", {
        name: trimmedName,
        description: description.trim(),
      });

      onCreated(res.data.workspace ?? res.data);
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create workspace. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !submitting;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.dialog}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className={styles.dialogHeader}>
          <p className={styles.dialogTitle} id="modal-title">
            New workspace
          </p>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className={styles.dialogBody}>

          {/* Name */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="ws-name">
              Name <span className={styles.required}>*</span>
            </label>
            <input
              ref={nameRef}
              id="ws-name"
              type="text"
              className={`${styles.input} ${error && !name.trim() ? styles.inputError : ""}`}
              placeholder="e.g. Marketing Q3"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              disabled={submitting}
              maxLength={80}
              autoComplete="off"
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="ws-desc">
              Description
              <span className={styles.optional}> — optional</span>
            </label>
            <textarea
              id="ws-desc"
              className={styles.textarea}
              placeholder="What is this workspace for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              maxLength={300}
              rows={3}
            />
            <p className={styles.charCount}>{description.length} / 300</p>
          </div>

          {/* Inline error */}
          {error && (
            <div className={styles.errorBanner}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className={styles.dialogFooter}>
          <button
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {submitting ? (
              <>
                <Spinner />
                Creating…
              </>
            ) : (
              "Create workspace"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddWorkspaceModal;