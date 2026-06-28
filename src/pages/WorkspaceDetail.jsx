import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import styles from "../styles/Workspacedetails.module.css";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import socket from "../utils/socket";

/* ══════════════════════════════════════════════════════════
   CONSTANTS & DUMMY DATA
══════════════════════════════════════════════════════════ */
const ROLES = ["Admin", "Analyst", "Viewer"];
const ROLE_CLASS = {
  Admin: styles.roleAdmin,
  Analyst: styles.roleAnalyst,
  Viewer: styles.roleViewer,
};

const WIDGET_TYPES = {
  LINE_CHART: "line_chart",
  BAR_CHART: "bar_chart",
  KPI_CARD: "kpi_card",
  DATA_TABLE: "data_table",
};

const WIDGET_CATALOG = [
  { type: WIDGET_TYPES.LINE_CHART,  label: "Line Chart",  icon: "📈" },
  { type: WIDGET_TYPES.BAR_CHART,   label: "Bar Chart",   icon: "📊" },
  { type: WIDGET_TYPES.KPI_CARD,    label: "KPI Card",    icon: "🎯" },
  { type: WIDGET_TYPES.DATA_TABLE,  label: "Data Table",  icon: "📋" },
];

/* ── Default sizes (in grid columns / rows) ── */
const WIDGET_DEFAULT_SIZE = {
  [WIDGET_TYPES.LINE_CHART]: { w: 2, h: 2 },
  [WIDGET_TYPES.BAR_CHART]:  { w: 2, h: 2 },
  [WIDGET_TYPES.KPI_CARD]:   { w: 1, h: 1 },
  [WIDGET_TYPES.DATA_TABLE]: { w: 3, h: 2 },
};

/* ── Dummy data ── */
const LINE_DATA = [
  { month: "Jan", applications: 42, interviews: 18 },
  { month: "Feb", applications: 58, interviews: 24 },
  { month: "Mar", applications: 71, interviews: 30 },
  { month: "Apr", applications: 55, interviews: 22 },
  { month: "May", applications: 89, interviews: 41 },
  { month: "Jun", applications: 103, interviews: 53 },
];
const BAR_DATA = [
  { dept: "Eng",     hired: 12, rejected: 5 },
  { dept: "Design",  hired: 7,  rejected: 3 },
  { dept: "Sales",   hired: 9,  rejected: 6 },
  { dept: "Ops",     hired: 4,  rejected: 2 },
  { dept: "HR",      hired: 3,  rejected: 1 },
];
const KPI_DATA = [
  { label: "Active Jobs",     value: "34",    delta: "+4",  up: true  },
  { label: "Total Applicants",value: "1,284", delta: "+127",up: true  },
  { label: "Time to Hire",    value: "18 d",  delta: "-2d", up: true  },
  { label: "Offer Accept %",  value: "74%",   delta: "-3%", up: false },
];
const TABLE_DATA = [
  { name: "Aryan Mehta",    role: "Frontend Dev",    stage: "Technical",   status: "Active"   },
  { name: "Priya Sharma",   role: "Product Manager", stage: "HR Round",    status: "Active"   },
  { name: "Ravi Kumar",     role: "Data Analyst",    stage: "Offer Sent",  status: "Pending"  },
  { name: "Sneha Patel",    role: "DevOps Eng",      stage: "Rejected",    status: "Closed"   },
  { name: "Karan Singh",    role: "Backend Dev",     stage: "Screening",   status: "Active"   },
  { name: "Ananya Roy",     role: "UI/UX Designer",  stage: "Portfolio",   status: "Active"   },
];

/* ── Colour palette ── */
const CHART_COLORS = { primary: "#6366f1", secondary: "#06b6d4", accent: "#f59e0b", muted: "#94a3b8" };

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

let widgetCounter = 100;
const makeId = () => `w${++widgetCounter}`;
const canPlace = (widgets, row, col, w, h) => {
  return !widgets.some(widget => {
    return (
      col < widget.col + widget.w &&
      col + w > widget.col &&
      row < widget.row + widget.h &&
      row + h > widget.row
    );
  });
};

const findEmptyPosition = (widgets, w, h) => {
  for (let row = 1; row <= 100; row++) {
    for (let col = 1; col <= GRID_COLS - w + 1; col++) {
      if (canPlace(widgets, row, col, w, h)) {
        return { row, col };
      }
    }
  }

  return { row: 1, col: 1 };
};


/* ══════════════════════════════════════════════════════════
   ICONS
══════════════════════════════════════════════════════════ */
const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconDrag = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9"  cy="5"  r="1" fill="currentColor"/><circle cx="15" cy="5"  r="1" fill="currentColor"/>
    <circle cx="9"  cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
    <circle cx="9"  cy="19" r="1" fill="currentColor"/><circle cx="15" cy="19" r="1" fill="currentColor"/>
  </svg>
);
const IconAdd = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
const IconResize = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
  </svg>
);

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
const Toast = ({ message, type }) => (
  <div className={`${styles.toast} ${type === "error" ? styles.toastError : styles.toastSuccess}`}>
    {message}
  </div>
);

/* ══════════════════════════════════════════════════════════
   LOADING SKELETON
══════════════════════════════════════════════════════════ */
const LoadingSkeleton = () => (
  <div className={styles.shell}>
    <div className={styles.topbar}>
      <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 160, height: 18 }} />
      <div className={styles.topbarRight}>
        <div className={`${styles.skeletonChip} ${styles.shimmer}`} style={{ width: 80, height: 28 }} />
      </div>
    </div>
    <div className={styles.body}>
      <div className={styles.widgetCanvas}>
        {[0,1,2,3].map(i => (
          <div key={i} className={`${styles.skeletonWidget} ${styles.shimmer}`} style={{ animationDelay: `${i*0.1}s` }} />
        ))}
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   WIDGET CONTENTS
══════════════════════════════════════════════════════════ */
const KpiCardContent = ({ kpiIndex = 0 }) => {
  const d = KPI_DATA[kpiIndex] ?? KPI_DATA[0];
  return (
    <div className={styles.kpiContent}>
      <p className={styles.kpiLabel}>{d.label}</p>
      <p className={styles.kpiValue}>{d.value}</p>
      <span className={`${styles.kpiDelta} ${d.up ? styles.kpiDeltaUp : styles.kpiDeltaDown}`}>
        {d.up ? "▲" : "▼"} {d.delta}
        <span className={styles.kpiDeltaLabel}> vs last month</span>
      </span>
    </div>
  );
};

const LineChartContent = () => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={LINE_DATA} margin={{ top: 6, right: 16, left: -16, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
      <Line type="monotone" dataKey="applications" stroke={CHART_COLORS.primary} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
      <Line type="monotone" dataKey="interviews" stroke={CHART_COLORS.secondary} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
    </LineChart>
  </ResponsiveContainer>
);

const BarChartContent = () => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={BAR_DATA} margin={{ top: 6, right: 16, left: -16, bottom: 0 }} barSize={14}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
      <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }} />
      <Legend wrapperStyle={{ fontSize: 12, paddingTop: 6 }} />
      <Bar dataKey="hired" fill={CHART_COLORS.primary} radius={[4,4,0,0]} />
      <Bar dataKey="rejected" fill={CHART_COLORS.muted} radius={[4,4,0,0]} />
    </BarChart>
  </ResponsiveContainer>
);

const STATUS_CLASS = { Active: styles.statusActive, Pending: styles.statusPending, Closed: styles.statusClosed };
const DataTableContent = () => (
  <div className={styles.tableWrapper}>
    <table className={styles.dataTable}>
      <thead>
        <tr>
          <th>Candidate</th><th>Role</th><th>Stage</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        {TABLE_DATA.map((row, i) => (
          <tr key={i}>
            <td><div className={styles.candidateName}>{row.name}</div></td>
            <td><span className={styles.roleText}>{row.role}</span></td>
            <td><span className={styles.stageText}>{row.stage}</span></td>
            <td><span className={`${styles.statusBadge} ${STATUS_CLASS[row.status]}`}>{row.status}</span></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const WidgetContent = ({ widget }) => {
  switch (widget.type) {
    case WIDGET_TYPES.KPI_CARD:   return <KpiCardContent kpiIndex={widget.kpiIndex} />;
    case WIDGET_TYPES.LINE_CHART: return <LineChartContent />;
    case WIDGET_TYPES.BAR_CHART:  return <BarChartContent />;
    case WIDGET_TYPES.DATA_TABLE: return <DataTableContent />;
    default: return null;
  }
};

/* ══════════════════════════════════════════════════════════
   WIDGET CARD (drag, resize, remove)
══════════════════════════════════════════════════════════ */
const GRID_COLS = 4;
const COL_UNIT_PX = 260; // approximate, layout is CSS grid
const ROW_UNIT_PX = 220;

const WidgetCard = ({ widget, onRemove, onDragStart, onResize, isAdmin,isAnalyst }) => {
  const isKpi = widget.type === WIDGET_TYPES.KPI_CARD;

  /* ── resize handle ── */
  const resizeRef = useRef(null);
  const handleResizeMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = widget.w;
    const startH = widget.h;

    const onMove = (ev) => {
      const dw = Math.round((ev.clientX - startX) / COL_UNIT_PX);
      const dh = Math.round((ev.clientY - startY) / ROW_UNIT_PX);
      const newW = Math.max(1, Math.min(GRID_COLS - widget.col + 1, startW + dw));
      const newH = Math.max(1, startH + dh);
      onResize(widget.id, newW, newH);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [widget, onResize]);

  const handleDragStart = (e,id) => {
    if (!isAdmin) {
        e.preventDefault();
        return;
    }
    onDragStart(e,id);
  }

  return (
    <div
      className={`${styles.widgetCard} ${isKpi ? styles.widgetCardKpi : ""}`}
      style={{
        gridColumn: `${widget.col} / span ${widget.w}`,
        gridRow:    `${widget.row} / span ${widget.h}`,
      }}
      draggable = {isAdmin}
      onDragStart={(e) => handleDragStart(e, widget.id)}
    >
      {/* Header */}
      <div className={styles.widgetHeader}>
        <span className={styles.widgetDragHandle} title="Drag to reposition">
          <IconDrag />
        </span>
        <span className={styles.widgetTitle}>{widget.title}</span>
        {isAdmin && (
          <button
            className={styles.widgetRemoveBtn}
            onClick={() => onRemove(widget.id)}
            title="Remove widget"
          >
            <IconClose />
        </button>)}
      </div>

      {/* Content */}
      <div className={styles.widgetBody}>
        <WidgetContent widget={widget} />
      </div>

      {/* Resize handle (bottom-right) */}
      {(isAdmin || isAnalyst) && !isKpi && (
        <div
          ref={resizeRef}
          className={styles.resizeHandle}
          onMouseDown={handleResizeMouseDown}
          title="Drag to resize"
        >
          <IconResize />
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ADD WIDGET PANEL
══════════════════════════════════════════════════════════ */
const AddWidgetPanel = ({ onAdd, open, onClose }) => {
  if (!open) return null;
  return (
    <div className={styles.addWidgetOverlay} onClick={onClose}>
      <div className={styles.addWidgetPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.addWidgetHeader}>
          <span className={styles.addWidgetTitle}>Add Widget</span>
          <button className={styles.addWidgetClose} onClick={onClose}><IconClose /></button>
        </div>
        <div className={styles.addWidgetGrid}>
          {WIDGET_CATALOG.map((cat) => (
            <button
              key={cat.type}
              className={styles.addWidgetItem}
              onClick={() => { onAdd(cat.type); onClose(); }}
            >
              <span className={styles.addWidgetIcon}>{cat.icon}</span>
              <span className={styles.addWidgetLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

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
  const [widgets, setWidgets] = useState([]);
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [dragId, setDragId] = useState(null);

  /* ── Drag-over state for drop target highlighting ── */
  const [dropTarget, setDropTarget] = useState(null); // { col, row }
  const [currentUser, setCurrentUser] = useState(null);

  const fetchCurrentUser = async () => {
    const res = await api.get("/user/profile");
    setCurrentUser(res.data.user);
  };

  useEffect(() => {
    fetchCurrentUser();
  },[])

  const currentUserRole = workspace?.members.find(
    member => member.user._id === currentUser?._id
)?.role;

  const isAdmin = currentUserRole === "Admin";
  const isAnalyst = currentUserRole === "Analyst";

  console.log("Current user role:", currentUserRole);

  useEffect(() => {

    if (!currentUserRole) return;

    socket.emit("join-workspace", {
        workspaceId,
        role: currentUserRole
    });

    const handleDashboardState = (widgets) => {
        setWidgets(widgets);
    };

    socket.on("dashboard-state", handleDashboardState);

    return () => {
        socket.emit("leave-workspace", workspaceId);
        socket.off("dashboard-state", handleDashboardState);
    };

}, [workspaceId, currentUserRole]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchWorkspace = useCallback(async () => {
    try {
      const res = await api.get(`/workspace/${workspaceId}`);
      setWorkspace(res.data.workspace);
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

  const handleRemoveWidget = useCallback((id) => {
    socket.emit("dashboard-action", {
        workspaceId,
        action: "DELETE_WIDGET",
        data: {
            widgetId: id
        }
    });
}, [workspaceId]);

  const handleAddWidget = useCallback((type) => {

    const size = WIDGET_DEFAULT_SIZE[type];

    const { row, col } = findEmptyPosition(
        widgets,
        size.w,
        size.h
    );

    const kpiCount = widgets.filter(
        w => w.type === WIDGET_TYPES.KPI_CARD
    ).length;

    const newWidget = {
        id: makeId(),
        type,
        title:
            WIDGET_CATALOG.find(c => c.type === type)?.label ||
            "Widget",

        row,
        col,

        w: size.w,
        h: size.h,

        ...(type === WIDGET_TYPES.KPI_CARD && {
            kpiIndex: kpiCount % KPI_DATA.length
        })
    };

    socket.emit("dashboard-action", {
        workspaceId,
        action: "ADD_WIDGET",
        data: newWidget
    });

}, [widgets, workspaceId]);

  const handleResize = useCallback((id, newW, newH) => {
    socket.emit("dashboard-action", {
        workspaceId,
        action: "RESIZE_WIDGET",
        data: {
            widgetId: id,
            w: newW,
            h: newH
        }
    });
}, [workspaceId]);

  /* ── Drag & Drop ── */
  const handleDragStart = useCallback((e, id) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  /* Drop zone cells */
  const handleCellDragOver = useCallback((e, col, row) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget({ col, row });
  }, []);

  const handleCellDrop = useCallback((e, col, row) => {
    e.preventDefault();

    if (!dragId) return;

    socket.emit("dashboard-action", {
        workspaceId,
        action: "MOVE_WIDGET",
        data: {
            widgetId: dragId,
            col,
            row
        }
    });

    setDragId(null);
    setDropTarget(null);

}, [dragId, workspaceId]);

  const handleDragEnd = useCallback(() => {
    setDragId(null);
    setDropTarget(null);
  }, []);

  /* ── Add member ── */
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

  /* ── Compute grid rows needed ── */
  const maxRow = widgets.reduce((m, w) => Math.max(m, w.row + w.h - 1), 4);

  /* ── Drop grid: generate cell targets ── */
  const dropCells = [];
  for (let r = 1; r <= maxRow + 1; r++) {
    for (let c = 1; c <= GRID_COLS; c++) {
      dropCells.push({ col: c, row: r });
    }
  }

  if (!workspace) return <LoadingSkeleton />;

  const canSubmit = selectedUser && selectedRole && !submitting;

  return (
    <div className={styles.shell}>

      {/* ══ Topbar ══════════════════════════════════════ */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <span className={styles.workspaceName}>{workspace.name}</span>
          <span className={styles.workspaceTag}>Dashboard</span>
        </div>

        <div className={styles.topbarRight}>
          {/* Member avatar strip */}
          <div className={styles.memberAvatarRow}>
            {workspace.members.slice(0, 4).map((m) => (
              <div key={m._id} className={styles.miniAvatar} title={`${m.user.name} · ${m.role}`}>
                {getInitials(m.user.name)}
              </div>
            ))}
            {workspace.members.length > 4 && (
              <div className={`${styles.miniAvatar} ${styles.miniAvatarOverflow}`}>
                +{workspace.members.length - 4}
              </div>
            )}
          </div>

          {isAdmin && (
            <button className={styles.addWidgetBtn} onClick={() => setAddPanelOpen(true)}>
              <IconAdd /> Add Widget
            </button>
          )}

          {/* Sidebar toggle */}
          <button
            className={styles.sidebarToggle}
            onClick={() => setSidebarOpen((v) => !v)}
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <IconSidebarClose /> : <IconSidebarOpen />}
          </button>
        </div>
      </header>

      {/* ══ Body ════════════════════════════════════════ */}
      <div className={`${styles.body} ${!sidebarOpen ? styles.bodyExpanded : ""}`}>

        {/* ── Widget Canvas ─────────────────────────── */}
        <div className={styles.canvasScroll}>
          <div
            className={styles.widgetCanvas}
            style={{ gridTemplateRows: `repeat(${maxRow + 1}, ${ROW_UNIT_PX}px)` }}
            onDragEnd={handleDragEnd}
          >
            {/* Invisible drop-target cells behind widgets */}
            {dropCells.map(({ col, row }) => (
              <div
                key={`cell-${col}-${row}`}
                className={`${styles.dropCell} ${
                  dropTarget?.col === col && dropTarget?.row === row ? styles.dropCellActive : ""
                }`}
                style={{ gridColumn: col, gridRow: row }}
                onDragOver={(e) => handleCellDragOver(e, col, row)}
                onDrop={(e) => handleCellDrop(e, col, row)}
              />
            ))}

            {/* Actual widgets */}
            {widgets.map((widget) => (
              <WidgetCard
                key={widget.id}
                widget={widget}
                onRemove={handleRemoveWidget}
                onDragStart={handleDragStart}
                onResize={handleResize}
                isAdmin={isAdmin}
                isAnalyst={isAnalyst}
              />
            ))}
          </div>

          {/* Empty state */}
          {widgets.length === 0 && (
            <div className={styles.emptyCanvas}>
              <div className={styles.emptyCanvasIcon}>📊</div>
              <p className={styles.emptyCanvasTitle}>No widgets yet</p>
              <p className={styles.emptyCanvasText}>Click <strong>Add Widget</strong> to build your dashboard.</p>
            </div>
          )}
        </div>

        {/* ── Right Sidebar ─────────────────────────── */}
        {sidebarOpen && (
          <aside className={styles.sidebar}>
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

            <div className={styles.sidebarDivider} />

            <div className={styles.sidebarSection}>
              <p className={styles.sidebarLabel}>Add member</p>
              <div className={styles.addMemberForm}>
                <div>
                  <label className={styles.fieldLabel} htmlFor="user-select">Person</label>
                  <select id="user-select" className={styles.select} value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)} disabled={submitting}>
                    <option value="">Select…</option>
                    {availableUsers.map((u) => (
                      <option key={u._id} value={u._id}>{u.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={styles.fieldLabel} htmlFor="role-select">Role</label>
                  <select id="role-select" className={styles.select} value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)} disabled={submitting}>
                    <option value="">Select…</option>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <button className={styles.addButton} disabled={!canSubmit} onClick={handleAddMember}>
                  {submitting ? <><span className={styles.spinner} />Adding…</> : "Add member"}
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ══ Add Widget Panel ═══════════════════════════ */}
      <AddWidgetPanel
        open={addPanelOpen}
        onClose={() => setAddPanelOpen(false)}
        onAdd={handleAddWidget}
      />

      {/* ══ Toast ══════════════════════════════════════ */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
};

export default WorkspaceDetails;