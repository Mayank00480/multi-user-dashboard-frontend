import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import styles from "../styles/Body.module.css";
import AddWorkspaceModal from "../component/Addworkspacemodal";

/* Derive 1–2 char monogram from workspace name */
const getMonogram = (name = "") => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

/* ── Skeleton ───────────────────────────────────────────── */
const LoadingSkeleton = () => (
  <div className={styles.inner}>
    <div className={styles.skeletonHeader}>
      <div className={styles.skeletonHeading} />
      <div className={styles.skeletonSearch} />
    </div>
    <div className={styles.skeletonGrid}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={styles.skeletonCard} />
      ))}
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const Body = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      const res = await api.get("/workspace");
      setWorkspaces(res.data.workspaces);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceCreated = (newWorkspace) => {
  fetchWorkspaces(); // or: setWorkspaces(prev => [...prev, newWorkspace])
};

  /* Client-side search filter */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return workspaces;
    return workspaces.filter(
      (ws) =>
        ws.name.toLowerCase().includes(q) ||
        (ws.description && ws.description.toLowerCase().includes(q))
    );
  }, [workspaces, query]);

  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.inner}>

        {/* Header row */}
        <div className={styles.pageHeader}>
          <div className={styles.headingGroup}>
            <h2 className={styles.heading}>My Workspaces</h2>
            <p className={styles.subheading}>
              {workspaces.length} workspace{workspaces.length !== 1 ? "s" : ""}
            </p>
          </div>

          {workspaces.length > 0 && (
            <div className={styles.searchWrapper}>
              {/* Search icon */}
              <svg
                className={styles.searchIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search workspaces…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search workspaces"
              />
            </div>
          )}


           <button className={styles.addWorkspaceBtn} onClick={() => setShowModal(true)}>
    + New workspace
  </button>
        </div>

        {/* Empty state — no workspaces at all */}
        {workspaces.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No workspaces yet</p>
            <p className={styles.emptyText}>Create one to get started.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.length === 0 ? (
              /* No search results */
              <div className={styles.noResults}>
                <p className={styles.noResultsTitle}>No matches for "{query}"</p>
                <p className={styles.noResultsText}>Try a different name or description.</p>
              </div>
            ) : (
              filtered.map((workspace) => (
                <div
                  key={workspace._id}
                  className={styles.card}
                  onClick={() => navigate(`/workspace/${workspace._id}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${workspace.name}`}
                  onKeyDown={(e) =>
                    e.key === "Enter" && navigate(`/workspace/${workspace._id}`)
                  }
                >
                  {/* Monogram + arrow */}
                  <div className={styles.cardTop}>
                    <div className={styles.monogram}>
                      {getMonogram(workspace.name)}
                    </div>
                    <svg
                      className={styles.arrow}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </div>

                  {/* Name + description */}
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{workspace.name}</h3>
                    {workspace.description && (
                      <p className={styles.cardDescription}>
                        {workspace.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className={styles.cardFooter}>
                    <div className={styles.memberDots}>
                      {Array.from({
                        length: Math.min(workspace.members.length, 4),
                      }).map((_, i) => (
                        <span key={i} className={styles.dot} />
                      ))}
                    </div>
                    <span className={styles.memberCount}>
                      {workspace.members.length} member
                      {workspace.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {showModal && (
  <AddWorkspaceModal
    onClose={() => setShowModal(false)}
    onCreated={handleWorkspaceCreated}
  />
)}
    </div>
  );
};

export default Body;