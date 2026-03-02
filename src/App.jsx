import { useState, useEffect, useCallback, useMemo } from "react";

// ============================================================
// CONFIG — UPDATE THIS after deploying backend
// ============================================================
const API_BASE = "https://hrms-lite-xax7.onrender.com";

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || data.message || "Something went wrong");
  }
  return data;
}

// ============================================================
// ICONS (inline SVG components)
// ============================================================
const Icons = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
      <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
    </svg>
  ),
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  Inbox: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
    </svg>
  ),
};

// ============================================================
// STYLES
// ============================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #f8f7f4;
  --bg-card: #ffffff;
  --bg-sidebar: #1a1a2e;
  --bg-sidebar-hover: #25254a;
  --bg-sidebar-active: #2d2d5e;
  --text: #1a1a2e;
  --text-secondary: #6b7280;
  --text-sidebar: #a8a8c8;
  --text-sidebar-active: #ffffff;
  --border: #e5e5e0;
  --accent: #4f46e5;
  --accent-light: #eef2ff;
  --accent-hover: #4338ca;
  --danger: #dc2626;
  --danger-light: #fef2f2;
  --success: #059669;
  --success-light: #ecfdf5;
  --warning: #d97706;
  --warning-light: #fffbeb;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
  --radius: 10px;
  --radius-sm: 6px;
  --radius-lg: 14px;
  --font: 'DM Sans', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

.app { display: flex; min-height: 100vh; }

/* Sidebar */
.sidebar {
  width: 240px;
  background: var(--bg-sidebar);
  padding: 0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 40;
}

.sidebar-brand { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.sidebar-brand h1 { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.3px; }
.sidebar-brand p { font-size: 11px; color: var(--text-sidebar); margin-top: 2px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 500; }

.sidebar-nav { padding: 12px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 8px;
  color: var(--text-sidebar); cursor: pointer; font-size: 14px; font-weight: 500;
  transition: all 0.15s ease; border: none; background: none; width: 100%; text-align: left;
}
.nav-item:hover { background: var(--bg-sidebar-hover); color: #d0d0e8; }
.nav-item.active { background: var(--bg-sidebar-active); color: var(--text-sidebar-active); }

.sidebar-footer { padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.06); font-size: 11px; color: rgba(168,168,200,0.5); }

/* Main Content */
.main { margin-left: 240px; flex: 1; min-height: 100vh; }

.page-header { padding: 28px 36px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.page-header h2 { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; color: var(--text); }
.page-header p { font-size: 14px; color: var(--text-secondary); margin-top: 2px; }

.page-content { padding: 0 36px 36px; }

/* Cards */
.card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); animation: fadeIn 0.3s ease; }
.card-header { padding: 18px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.card-header h3 { font-size: 15px; font-weight: 600; }
.card-body { padding: 22px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; font-family: var(--font); cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent; white-space: nowrap; }
.btn-primary { background: var(--accent); color: #fff; }
.btn-primary:hover { background: var(--accent-hover); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-outline { background: transparent; color: var(--text); border-color: var(--border); }
.btn-outline:hover { background: #f3f3f0; }
.btn-danger { background: transparent; color: var(--danger); border-color: var(--border); }
.btn-danger:hover { background: var(--danger-light); border-color: var(--danger); }
.btn-ghost { background: transparent; color: var(--text-secondary); border: none; padding: 6px 8px; }
.btn-ghost:hover { color: var(--text); background: rgba(0,0,0,0.04); }
.btn-sm { padding: 6px 10px; font-size: 12px; }
.btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; padding: 0; border-radius: var(--radius-sm); border: 1px solid var(--border); background: transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.15s ease; }
.btn-icon:hover { color: var(--danger); border-color: var(--danger); background: var(--danger-light); }

/* Form */
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 6px; }
.form-group input, .form-group select { width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; font-family: var(--font); color: var(--text); background: #fff; transition: border-color 0.15s ease, box-shadow 0.15s ease; outline: none; }
.form-group input:focus, .form-group select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.form-group input.error { border-color: var(--danger); }
.form-group .error-text { font-size: 12px; color: var(--danger); margin-top: 4px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
thead th { text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-secondary); border-bottom: 1px solid var(--border); background: #fafaf8; }
tbody td { padding: 14px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr { transition: background 0.1s ease; }
tbody tr:hover { background: #fafaf8; }

.emp-name { font-weight: 600; color: var(--text); }
.emp-id { font-family: var(--font-mono); font-size: 12px; color: var(--text-secondary); }
.emp-email { color: var(--text-secondary); font-size: 13px; }
.emp-dept { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; background: var(--accent-light); color: var(--accent); }

/* Badge */
.badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
.badge-present { background: var(--success-light); color: var(--success); }
.badge-absent { background: var(--danger-light); color: var(--danger); }

/* Stats Grid */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; box-shadow: var(--shadow-sm); animation: fadeIn 0.3s ease; }
.stat-card .stat-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: var(--text-secondary); margin-bottom: 8px; }
.stat-card .stat-value { font-size: 28px; font-weight: 700; letter-spacing: -1px; color: var(--text); }
.stat-card .stat-sub { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; animation: overlayIn 0.2s ease; }
.modal { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: modalIn 0.25s ease; }
.modal-header { padding: 20px 22px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
.modal-header h3 { font-size: 16px; font-weight: 700; }
.modal-body { padding: 22px; }
.modal-footer { padding: 16px 22px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; }

/* Toast */
.toast-container { position: fixed; top: 20px; right: 20px; z-index: 200; display: flex; flex-direction: column; gap: 8px; }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 500; box-shadow: var(--shadow-lg); animation: slideIn 0.3s ease; min-width: 280px; }
.toast-success { background: var(--success); color: #fff; }
.toast-error { background: var(--danger); color: #fff; }

/* Empty State */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; color: var(--text-secondary); text-align: center; }
.empty-state svg { opacity: 0.25; margin-bottom: 16px; }
.empty-state h4 { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
.empty-state p { font-size: 13px; }

/* Skeleton Loading */
.skeleton { background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%); background-size: 200% 100%; animation: pulse 1.5s ease infinite; border-radius: 4px; height: 16px; }
.skeleton-row { display: flex; gap: 16px; padding: 14px 16px; border-bottom: 1px solid var(--border); }

/* Search Input */
.search-input-wrap { position: relative; display: flex; align-items: center; }
.search-input-wrap svg { position: absolute; left: 10px; color: var(--text-secondary); pointer-events: none; }
.search-input { padding: 8px 12px 8px 32px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font); outline: none; width: 220px; transition: border-color 0.15s ease; }
.search-input:focus { border-color: var(--accent); }

.confirm-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }

/* Dept colors */
.dept-engineering { background: #eef2ff; color: #4f46e5; }
.dept-design { background: #fdf2f8; color: #db2777; }
.dept-marketing { background: #ecfdf5; color: #059669; }
.dept-sales { background: #fffbeb; color: #d97706; }
.dept-hr { background: #f0f9ff; color: #0284c7; }
.dept-finance { background: #faf5ff; color: #9333ea; }
.dept-default { background: #f3f4f6; color: #6b7280; }

/* Attendance filters */
.filters-bar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.filters-bar select, .filters-bar input[type="date"] { padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 13px; font-family: var(--font); outline: none; background: #fff; color: var(--text); min-width: 140px; }
.filters-bar select:focus, .filters-bar input[type="date"]:focus { border-color: var(--accent); }
.filters-bar input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; opacity: 0.6; }
.filters-bar input[type="date"]::-webkit-calendar-picker-indicator:hover { opacity: 1; }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main { margin-left: 0; }
  .page-header { padding: 20px; }
  .page-content { padding: 0 20px 20px; }
  .form-row { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
`;

const DEPARTMENTS = [
  "Engineering", "Design", "Marketing", "Sales",
  "Human Resources", "Finance", "Operations", "Product", "Legal", "Support",
];

function getDeptClass(dept) {
  const d = dept?.toLowerCase() || "";
  if (d.includes("engineer") || d.includes("tech")) return "dept-engineering";
  if (d.includes("design")) return "dept-design";
  if (d.includes("market")) return "dept-marketing";
  if (d.includes("sales")) return "dept-sales";
  if (d.includes("hr") || d.includes("human")) return "dept-hr";
  if (d.includes("finance") || d.includes("account")) return "dept-finance";
  return "dept-default";
}

// ============================================================
// REUSABLE COMPONENTS
// ============================================================
let toastId = 0;

function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => onRemove(t.id)}>
          {t.type === "success" ? <Icons.Check /> : <Icons.AlertCircle />}
          {t.message}
        </div>
      ))}
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="btn-ghost" onClick={onClose} style={{ padding: 4 }}><Icons.X /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel, loading }) {
  return (
    <Modal title="Confirm Action" onClose={onCancel}>
      <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{message}</p>
      <div className="confirm-actions">
        <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
        <button className="btn btn-primary" onClick={onConfirm} disabled={loading} style={{ background: "var(--danger)" }}>
          {loading ? <Icons.Loader /> : null} Delete
        </button>
      </div>
    </Modal>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="skeleton" style={{ flex: 1, height: 14 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <Icons.Inbox />
      <h4>{title}</h4>
      <p>{message}</p>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// ============================================================
// DASHBOARD PAGE
// ============================================================
function DashboardPage({ employees: emps, dashboard, loading }) {
  if (loading) {
    return (
      <div className="stats-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card">
            <div className="skeleton" style={{ width: 80, height: 12, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: 60, height: 28 }} />
          </div>
        ))}
      </div>
    );
  }

  const totalEmp = dashboard?.total_employees || 0;
  const todayPresent = dashboard?.today?.present || 0;
  const todayAbsent = dashboard?.today?.absent || 0;
  const depts = dashboard?.departments || [];

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Employees</div>
          <div className="stat-value">{totalEmp}</div>
          <div className="stat-sub">{depts.length} department{depts.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Present Today</div>
          <div className="stat-value" style={{ color: "var(--success)" }}>{todayPresent}</div>
          <div className="stat-sub">{dashboard?.today?.date || "\u2014"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Absent Today</div>
          <div className="stat-value" style={{ color: "var(--danger)" }}>{todayAbsent}</div>
          <div className="stat-sub">{dashboard?.today?.date || "\u2014"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Attendance Rate</div>
          <div className="stat-value">
            {todayPresent + todayAbsent > 0
              ? Math.round((todayPresent / (todayPresent + todayAbsent)) * 100) + "%"
              : "\u2014"}
          </div>
          <div className="stat-sub">Today's rate</div>
        </div>
      </div>

      {depts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Department Breakdown</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Department</th><th>Employees</th></tr></thead>
              <tbody>
                {depts.map((d) => (
                  <tr key={d.name}>
                    <td><span className={`emp-dept ${getDeptClass(d.name)}`}>{d.name}</span></td>
                    <td style={{ fontWeight: 600 }}>{d.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {emps.length > 0 && dashboard?.present_days_per_employee && (
        <div className="card">
          <div className="card-header"><h3>Total Present Days per Employee</h3></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee</th><th>ID</th><th>Present Days</th></tr></thead>
              <tbody>
                {emps.map((e) => (
                  <tr key={e.employee_id}>
                    <td className="emp-name">{e.full_name}</td>
                    <td className="emp-id">{e.employee_id}</td>
                    <td><span className="badge badge-present">{dashboard.present_days_per_employee[e.employee_id] || 0} days</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalEmp === 0 && (
        <EmptyState title="No data yet" message="Add employees and mark attendance to see dashboard stats." />
      )}
    </div>
  );
}

// ============================================================
// EMPLOYEES PAGE
// ============================================================
function EmployeesPage({ employees: emps, loading, onAdd, onDelete, addToast }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ employee_id: "", full_name: "", email: "", department: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return emps;
    const q = search.toLowerCase();
    return emps.filter((e) =>
      e.full_name.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }, [emps, search]);

  function validate() {
    const errs = {};
    if (!form.employee_id.trim()) errs.employee_id = "Employee ID is required";
    if (!form.full_name.trim()) errs.full_name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.department.trim()) errs.department = "Department is required";
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      await onAdd(form);
      setForm({ employee_id: "", full_name: "", email: "", department: "" });
      setShowModal(false);
      addToast("Employee added successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
      addToast("Employee deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="search-input-wrap">
            <Icons.Search />
            <input className="search-input" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Icons.Plus /> Add Employee</button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? "No matches found" : "No employees yet"}
            message={search ? "Try a different search term." : "Add your first employee to get started."}
            action={!search && (<button className="btn btn-primary" onClick={() => setShowModal(true)}><Icons.Plus /> Add Employee</button>)}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Department</th><th style={{ width: 50 }}></th></tr></thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.employee_id}>
                    <td className="emp-id">{e.employee_id}</td>
                    <td className="emp-name">{e.full_name}</td>
                    <td className="emp-email">{e.email}</td>
                    <td><span className={`emp-dept ${getDeptClass(e.department)}`}>{e.department}</span></td>
                    <td><button className="btn-icon" title="Delete" onClick={() => setDeleteTarget(e.employee_id)}><Icons.Trash /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Add New Employee" onClose={() => { setShowModal(false); setErrors({}); }}
          footer={<>
            <button className="btn btn-outline" onClick={() => { setShowModal(false); setErrors({}); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Icons.Loader /> : <Icons.Plus />} Add Employee
            </button>
          </>}
        >
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input className={errors.employee_id ? "error" : ""} placeholder="e.g. EMP001" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
              {errors.employee_id && <div className="error-text">{errors.employee_id}</div>}
            </div>
            <div className="form-group">
              <label>Full Name</label>
              <input className={errors.full_name ? "error" : ""} placeholder="John Doe" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              {errors.full_name && <div className="error-text">{errors.full_name}</div>}
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className={errors.email ? "error" : ""} type="email" placeholder="john@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label>Department</label>
            <select className={errors.department ? "error" : ""} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
            </select>
            {errors.department && <div className="error-text">{errors.department}</div>}
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Are you sure you want to delete employee "${deleteTarget}"? This will also remove all their attendance records. This action cannot be undone.`}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting}
        />
      )}
    </div>
  );
}

// ============================================================
// ATTENDANCE PAGE
// ============================================================
function AttendancePage({ employees: emps, loading: empsLoading, addToast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee_id: "", date: new Date().toISOString().split("T")[0], status: "Present" });
  const [submitting, setSubmitting] = useState(false);
  const [filterEmp, setFilterEmp] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterEmp) params.append("employee_id", filterEmp);
      if (filterFrom) params.append("date_from", filterFrom);
      if (filterTo) params.append("date_to", filterTo);
      const data = await api(`/api/attendance?${params.toString()}`);
      setRecords(data);
    } catch (err) {
      addToast("Failed to load attendance records", "error");
    } finally {
      setLoading(false);
    }
  }, [filterEmp, filterFrom, filterTo, addToast]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  async function handleSubmit() {
    if (!form.employee_id || !form.date) { addToast("Please select an employee and date", "error"); return; }
    setSubmitting(true);
    try {
      await api("/api/attendance", { method: "POST", body: JSON.stringify(form) });
      setShowModal(false);
      fetchAttendance();
      addToast("Attendance marked successfully", "success");
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  const empMap = useMemo(() => { const m = {}; emps.forEach((e) => (m[e.employee_id] = e)); return m; }, [emps]);
  const hasFilters = filterEmp || filterFrom || filterTo;

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ flexWrap: "wrap", gap: 12 }}>
          <div className="filters-bar">
            <Icons.Filter />
            <select value={filterEmp} onChange={(e) => setFilterEmp(e.target.value)}>
              <option value="">All Employees</option>
              {emps.map((e) => (<option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>))}
            </select>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>to</span>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            {hasFilters && (<button className="btn btn-ghost btn-sm" onClick={() => { setFilterEmp(""); setFilterFrom(""); setFilterTo(""); }}>Clear</button>)}
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)} disabled={emps.length === 0}>
            <Icons.Plus /> Mark Attendance
          </button>
        </div>

        {loading || empsLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : records.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No records match filters" : "No attendance records"}
            message={hasFilters ? "Try adjusting your filters." : emps.length === 0 ? "Add employees first, then mark attendance." : "Start marking attendance for your employees."}
            action={!hasFilters && emps.length > 0 && (<button className="btn btn-primary" onClick={() => setShowModal(true)}><Icons.Plus /> Mark Attendance</button>)}
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Employee ID</th><th>Name</th><th>Department</th><th>Status</th></tr></thead>
              <tbody>
                {records.map((r) => {
                  const emp = empMap[r.employee_id];
                  return (
                    <tr key={r.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{r.date}</td>
                      <td className="emp-id">{r.employee_id}</td>
                      <td className="emp-name">{emp?.full_name || "\u2014"}</td>
                      <td>{emp ? <span className={`emp-dept ${getDeptClass(emp.department)}`}>{emp.department}</span> : "\u2014"}</td>
                      <td><span className={`badge ${r.status === "Present" ? "badge-present" : "badge-absent"}`}>{r.status === "Present" && <Icons.Check />}{r.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <Modal title="Mark Attendance" onClose={() => setShowModal(false)}
          footer={<>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Icons.Loader /> : <Icons.Check />} Save
            </button>
          </>}
        >
          <div className="form-group">
            <label>Employee</label>
            <select value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
              <option value="">Select employee</option>
              {emps.map((e) => (<option key={e.employee_id} value={e.employee_id}>{e.full_name} ({e.employee_id})</option>))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            If attendance already exists for this employee on this date, it will be updated.
          </p>
        </Modal>
      )}
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
const PAGES = {
  dashboard: { label: "Dashboard", icon: Icons.Dashboard, desc: "Overview & statistics" },
  employees: { label: "Employees", icon: Icons.Users, desc: "Manage employee records" },
  attendance: { label: "Attendance", icon: Icons.Calendar, desc: "Track daily attendance" },
};

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [employees, setEmployees] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  const removeToast = useCallback((id) => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, []);

  const fetchEmployees = useCallback(async () => {
    try { const data = await api("/api/employees"); setEmployees(data); } catch (err) { addToast("Failed to load employees", "error"); }
  }, [addToast]);

  const fetchDashboard = useCallback(async () => {
    try { const data = await api("/api/dashboard"); setDashboard(data); } catch {}
  }, []);

  useEffect(() => {
    async function init() { setLoading(true); await Promise.all([fetchEmployees(), fetchDashboard()]); setLoading(false); }
    init();
  }, [fetchEmployees, fetchDashboard]);

  useEffect(() => { fetchEmployees(); fetchDashboard(); }, [page, fetchEmployees, fetchDashboard]);

  async function handleAddEmployee(form) {
    await api("/api/employees", { method: "POST", body: JSON.stringify(form) });
    await fetchEmployees();
    await fetchDashboard();
  }

  async function handleDeleteEmployee(empId) {
    await api(`/api/employees/${empId}`, { method: "DELETE" });
    await fetchEmployees();
    await fetchDashboard();
  }

  const currentPage = PAGES[page];
  const Icon = currentPage.icon;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h1>HRMS Lite</h1>
            <p>Admin Panel</p>
          </div>
          <nav className="sidebar-nav">
            {Object.entries(PAGES).map(([key, { label, icon: NavIcon }]) => (
              <button key={key} className={`nav-item ${page === key ? "active" : ""}`} onClick={() => setPage(key)}>
                <NavIcon /> {label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">HRMS Lite v1.0 &middot; {new Date().getFullYear()}</div>
        </aside>
        <main className="main">
          <div className="page-header">
            <div>
              <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}><Icon /> {currentPage.label}</h2>
              <p>{currentPage.desc}</p>
            </div>
          </div>
          <div className="page-content">
            {page === "dashboard" && <DashboardPage employees={employees} dashboard={dashboard} loading={loading} />}
            {page === "employees" && <EmployeesPage employees={employees} loading={loading} onAdd={handleAddEmployee} onDelete={handleDeleteEmployee} addToast={addToast} />}
            {page === "attendance" && <AttendancePage employees={employees} loading={loading} addToast={addToast} />}
          </div>
        </main>
      </div>
    </>
  );
}
