import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import styles from "../styles/Workspacedetails.module.css";

const ROLES = ["Admin", "Analyst", "Viewer"];

const ROLE_CLASS = {
  Admin: styles.roleAdmin,
  Analyst: styles.roleAnalyst,
  Viewer: styles.roleViewer,
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ── Icons ──────────────────────────────────────────────── */
const IconBold = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>
  </svg>
);
const IconItalic = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/>
  </svg>
);
const IconUnderline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>
  </svg>
);
const IconStrike = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4c-2.5 0-4 1.5-4 3 0 1.4.8 2.3 2 3"/><path d="M8 18c0 0 1.5 2 4 2 2.5 0 4-1.5 4-3 0-1.4-.8-2.3-2-3"/>
  </svg>
);
const IconH1 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-2v8"/>
  </svg>
);
const IconH2 = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-1-2.5-2-2.5S17 10 17 11"/>
  </svg>
);
const IconUL = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/>
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/>
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const IconOL = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
    <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
  </svg>
);
const IconQuote = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);
const IconCode = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconUndo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </svg>
);
const IconRedo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/>
  </svg>
);
const IconSidebarClose = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
    <polyline points="11 7 7 12 11 17"/>
  </svg>
);
const IconSidebarOpen = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
    <polyline points="9 7 13 12 9 17"/>
  </svg>
);
const IconSave = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ── Toast ──────────────────────────────────────────────── */
const Toast = ({ message, type }) => (
  <div className={`${styles.toast} ${type === "error" ? styles.toastError : styles.toastSuccess}`}>
    {type === "success" ? <IconCheck /> : (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    )}
    {message}
  </div>
);

/* ── Skeleton ───────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className={styles.shell}>
    {/* Topbar skeleton */}
    <div className={styles.topbar}>
      <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 160, height: 18 }} />
      <div className={styles.topbarRight}>
        <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 80, height: 28 }} />
        <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 28, height: 28 }} />
      </div>
    </div>

    {/* Body skeleton */}
    <div className={styles.body}>
      {/* Editor zone */}
      <div className={styles.editorZone}>
        <div className={styles.toolbarSkeleton}>
          {[80, 60, 60, 60, 40, 60, 60].map((w, i) => (
            <div key={i} className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: w, height: 22, animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
        <div className={styles.paperSkeleton}>
          <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: "55%", height: 32, marginBottom: 20 }} />
          {[100, 88, 95, 72, 80].map((w, i) => (
            <div key={i} className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: `${w}%`, height: 14, marginBottom: 10, animationDelay: `${i * 0.08}s` }} />
          ))}
          <div style={{ height: 24 }} />
          {[90, 78, 85].map((w, i) => (
            <div key={i} className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: `${w}%`, height: 14, marginBottom: 10, animationDelay: `${i * 0.08}s` }} />
          ))}
        </div>
      </div>

      {/* Sidebar skeleton */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 80, height: 14 }} />
        </div>
        <div className={styles.sidebarBody}>
          {[0, 0.1, 0.2].map((delay, i) => (
            <div key={i} className={styles.skeletonMemberRow}>
              <div className={`${styles.skeletonAvatar} ${styles.shimmer}`} style={{ animationDelay: `${delay}s` }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: "65%", height: 12, animationDelay: `${delay}s` }} />
                <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: "80%", height: 11, animationDelay: `${delay}s` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ── Toolbar button ─────────────────────────────────────── */
const ToolBtn = ({ onClick, title, children, active }) => (
  <button
    className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ""}`}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    title={title}
    type="button"
  >
    {children}
  </button>
);

/* ── Toolbar divider ────────────────────────────────────── */
const ToolDivider = () => <span className={styles.toolDivider} />;

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const WorkspaceDetails = () => {
  const { workspaceId } = useParams();

  const [workspace, setWorkspace] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [docTitle, setDocTitle] = useState("");
  const [activeFormats, setActiveFormats] = useState({});

  const editorRef = useRef(null);
  const saveTimerRef = useRef(null);

  /* ── Helpers ─────────────────────────────────────────── */
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await api.get(`/workspace/${workspaceId}`);
      setWorkspace(res.data.workspace);
      setDocTitle(res.data.workspace.name);
    } catch {
      showToast("Failed to load workspace.", "error");
    }
  }, [workspaceId, showToast]);

  const fetchAvailableUsers = useCallback(async () => {
    try {
      const res = await api.get(`/workspace/${workspaceId}/available-users`);
      setAvailableUsers(res.data.users);
    } catch { /* silent */ }
  }, [workspaceId]);

  useEffect(() => {
    fetchWorkspace();
    fetchAvailableUsers();
  }, [fetchWorkspace, fetchAvailableUsers]);

  /* ── Editor: track active formats ──────────────────────── */
  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strikeThrough: document.queryCommandState("strikeThrough"),
      insertOrderedList: document.queryCommandState("insertOrderedList"),
      insertUnorderedList: document.queryCommandState("insertUnorderedList"),
    });
  }, []);

  /* ── Editor: exec command helper ────────────────────────── */
  const exec = useCallback((cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
    updateActiveFormats();
  }, [updateActiveFormats]);

  /* ── Auto-save simulation ────────────────────────────────
     In a real app, POST/PUT the editor HTML to your API.
     Here we debounce and fake it so the UX is correct.
  ──────────────────────────────────────────────────────── */
  const handleEditorInput = useCallback(() => {
    updateActiveFormats();
    setSaveState("saving");
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        // await api.put(`/workspace/${workspaceId}/document`, {
        //   content: editorRef.current?.innerHTML,
        // });
        await new Promise((r) => setTimeout(r, 600)); // simulate network
        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 2500);
      } catch {
        setSaveState("idle");
      }
    }, 1200);
  }, [updateActiveFormats]);

  /* ── Heading via formatBlock ─────────────────────────── */
  const execHeading = useCallback((tag) => {
    exec("formatBlock", tag);
  }, [exec]);

  /* ── Add member ─────────────────────────────────────── */
  const handleAddMember = async () => {
    const user = availableUsers.find((u) => u._id === selectedUser);
    if (!user) return;

    setSubmitting(true);
    try {
      await api.post(`/workspace/${workspaceId}`, {
        email: user.email,
        role: selectedRole,
      });
      showToast(`${user.name} added as ${selectedRole}.`);
      setSelectedUser("");
      setSelectedRole("");
      fetchWorkspace();
      fetchAvailableUsers();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Render ─────────────────────────────────────────── */
  if (!workspace) return <LoadingSkeleton />;

  const canSubmit = selectedUser && selectedRole && !submitting;

  return (
    <div className={styles.shell}>

      {/* ── Topbar ─────────────────────────────────────── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          {/* Editable doc title */}
          <input
            className={styles.docTitleInput}
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            spellCheck={false}
            aria-label="Document title"
          />
          {/* Save state indicator */}
          <span className={`${styles.saveIndicator} ${
            saveState === "saving" ? styles.saveIndicatorSaving :
            saveState === "saved"  ? styles.saveIndicatorSaved  : styles.saveIndicatorIdle
          }`}>
            {saveState === "saving" && (
              <><span className={styles.savingDot} />Saving…</>
            )}
            {saveState === "saved" && (
              <><IconCheck />Saved</>
            )}
          </span>
        </div>

        <div className={styles.topbarRight}>
          {/* Member avatars — quick visual of who's here */}
          <div className={styles.memberAvatarRow}>
            {workspace.members.slice(0, 4).map((m) => (
              <div
                key={m._id}
                className={styles.miniAvatar}
                title={`${m.user.name} · ${m.role}`}
              >
                {getInitials(m.user.name)}
              </div>
            ))}
            {workspace.members.length > 4 && (
              <div className={`${styles.miniAvatar} ${styles.miniAvatarOverflow}`}>
                +{workspace.members.length - 4}
              </div>
            )}
          </div>

          {/* Manual save button */}
          <button
            className={styles.saveBtn}
            onClick={handleEditorInput}
            title="Save document"
          >
            <IconSave /> Save
          </button>

          {/* Toggle sidebar */}
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <IconSidebarClose /> : <IconSidebarOpen />}
          </button>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────── */}
      <div className={`${styles.body} ${!sidebarOpen ? styles.bodyExpanded : ""}`}>

        {/* ── Editor zone ──────────────────────────────── */}
        <div className={styles.editorZone}>

          {/* Formatting toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.toolbarInner}>
              <ToolBtn onClick={() => exec("undo")} title="Undo (Ctrl+Z)"><IconUndo /></ToolBtn>
              <ToolBtn onClick={() => exec("redo")} title="Redo (Ctrl+Y)"><IconRedo /></ToolBtn>

              <ToolDivider />

              {/* Heading dropdownless buttons */}
              <ToolBtn onClick={() => execHeading("h1")} title="Heading 1"><IconH1 /></ToolBtn>
              <ToolBtn onClick={() => execHeading("h2")} title="Heading 2"><IconH2 /></ToolBtn>

              <ToolDivider />

              <ToolBtn onClick={() => exec("bold")} title="Bold (Ctrl+B)" active={activeFormats.bold}><IconBold /></ToolBtn>
              <ToolBtn onClick={() => exec("italic")} title="Italic (Ctrl+I)" active={activeFormats.italic}><IconItalic /></ToolBtn>
              <ToolBtn onClick={() => exec("underline")} title="Underline (Ctrl+U)" active={activeFormats.underline}><IconUnderline /></ToolBtn>
              <ToolBtn onClick={() => exec("strikeThrough")} title="Strikethrough" active={activeFormats.strikeThrough}><IconStrike /></ToolBtn>

              <ToolDivider />

              <ToolBtn onClick={() => exec("insertUnorderedList")} title="Bullet list" active={activeFormats.insertUnorderedList}><IconUL /></ToolBtn>
              <ToolBtn onClick={() => exec("insertOrderedList")} title="Numbered list" active={activeFormats.insertOrderedList}><IconOL /></ToolBtn>
              <ToolBtn onClick={() => exec("formatBlock", "blockquote")} title="Blockquote"><IconQuote /></ToolBtn>
              <ToolBtn onClick={() => exec("formatBlock", "pre")} title="Code block"><IconCode /></ToolBtn>

              <ToolDivider />

              <ToolBtn
                onClick={() => {
                  const url = prompt("Enter URL:");
                  if (url) exec("createLink", url);
                }}
                title="Insert link"
              >
                <IconLink />
              </ToolBtn>
            </div>
          </div>

          {/* Paper scroll area */}
          <div className={styles.paperScroll}>
            <div className={styles.paper}>
              <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                suppressContentEditableWarning
                spellCheck
                onInput={handleEditorInput}
                onKeyUp={updateActiveFormats}
                onMouseUp={updateActiveFormats}
                onSelect={updateActiveFormats}
                data-placeholder="Start writing…"
              />
            </div>
          </div>
        </div>

        {/* ── Right sidebar ─────────────────────────────── */}
        {sidebarOpen && (
          <aside className={styles.sidebar}>

            {/* Member roster */}
            <div className={styles.sidebarSection}>
              <p className={styles.sidebarLabel}>
                Members
                <span className={styles.memberCountBadge}>{workspace.members.length}</span>
              </p>

              {workspace.members.length === 0 ? (
                <div className={styles.emptyMembers}>
                  <p className={styles.emptyTitle}>No members yet</p>
                  <p className={styles.emptyText}>Add someone below.</p>
                </div>
              ) : (
                <div className={styles.memberList}>
                  {workspace.members.map((member) => (
                    <div key={member._id} className={styles.memberRow}>
                      <div className={styles.avatar}>{getInitials(member.user.name)}</div>
                      <div className={styles.memberInfo}>
                        <p className={styles.memberName}>{member.user.name}</p>
                        <p className={styles.memberEmail}>{member.user.email}</p>
                      </div>
                      <span className={`${styles.roleBadge} ${ROLE_CLASS[member.role] ?? ""}`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className={styles.sidebarDivider} />

            {/* Add member panel */}
            <div className={styles.sidebarSection}>
              <p className={styles.sidebarLabel}>Add member</p>

              <div className={styles.addMemberForm}>
                <div>
                  <label className={styles.fieldLabel} htmlFor="user-select">Person</label>
                  <select
                    id="user-select"
                    className={styles.select}
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select…</option>
                    {availableUsers.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={styles.fieldLabel} htmlFor="role-select">Role</label>
                  <select
                    id="role-select"
                    className={styles.select}
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="">Select…</option>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <button
                  className={styles.addButton}
                  disabled={!canSubmit}
                  onClick={handleAddMember}
                >
                  {submitting ? (
                    <><span className={styles.spinner} />Adding…</>
                  ) : "Add member"}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default WorkspaceDetails;