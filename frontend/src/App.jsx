import { useEffect, useMemo, useState } from "react";
import {
  Wrench, Search, Plus, ClipboardList, Clock3, CheckCircle2, AlertCircle,
  MapPin, CalendarDays, X, ArrowUpRight, Trash2, RefreshCw, Building2
} from "lucide-react";

const API = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/issues`;
const categories = ["Electrical", "Furniture", "Cleanliness", "Internet", "Plumbing", "Other"];
const statuses = ["Open", "In Progress", "Resolved"];
const blankForm = { title: "", description: "", category: "Electrical", location: "", reporter: "" };

function dateLabel(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function statusClass(status) {
  return status.toLowerCase().replaceAll(" ", "-");
}

export default function App() {
  const [issues, setIssues] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadIssues() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (categoryFilter !== "All") params.set("category", categoryFilter);
      const response = await fetch(`${API}?${params.toString()}`);
      if (!response.ok) throw new Error("Could not load issues. Check that the backend and MongoDB are running.");
      setIssues(await response.json());
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
      setIssues([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { loadIssues(); }, [search, statusFilter, categoryFilter]);

  const counts = useMemo(() => ({
    total: issues.length,
    open: issues.filter((item) => item.status === "Open").length,
    progress: issues.filter((item) => item.status === "In Progress").length,
    resolved: issues.filter((item) => item.status === "Resolved").length
  }), [issues]);

  function openCreate() {
    setEditingId(null); setForm(blankForm); setShowForm(true); setNotice("");
  }
  function openEdit(issue) {
    setEditingId(issue._id);
    setForm({ title: issue.title, description: issue.description, category: issue.category, location: issue.location, reporter: issue.reporter || "" });
    setShowForm(true); setNotice("");
  }
  async function submitForm(event) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save the issue.");
      setShowForm(false); setForm(blankForm); setEditingId(null);
      setNotice(editingId ? "Issue details updated successfully." : "Your issue has been reported successfully.");
      await loadIssues();
    } catch (err) { setError(err.message || "Could not save the issue."); }
    finally { setSaving(false); }
  }
  async function changeStatus(issue, status) {
    setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/${issue._id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not update status.");
      setNotice(`Status changed to ${status}.`); await loadIssues();
    } catch (err) { setError(err.message); }
  }
  async function deleteIssue(issue) {
    if (!window.confirm(`Delete "${issue.title}"? This cannot be undone.`)) return;
    setError(""); setNotice("");
    try {
      const response = await fetch(`${API}/${issue._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete issue.");
      setNotice("Issue deleted."); await loadIssues();
    } catch (err) { setError(err.message); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Wrench size={21} /></span><span>Campus<span className="brand-accent">Fix</span></span></div>
        <div className="side-label">WORKSPACE</div>
        <button className="nav-item active"><ClipboardList size={18} /> Issue dashboard</button>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Building2 size={18}/></div><strong>Make campus better</strong><p>Every report helps keep your campus safe and comfortable.</p></div>
          <div className="profile-row"><div className="avatar">CF</div><div><strong>CampusFix</strong><small>Student portal</small></div><span className="online-dot"/></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Issue dashboard</strong></div><div className="topbar-right"><span className="live-dot"/> Campus service desk <div className="top-avatar">CF</div></div></header>
        <section className="page-heading">
          <div><div className="eyebrow">CAMPUS CARE, MADE SIMPLE</div><h1>Issue dashboard <span className="heading-spark">✳</span></h1><p>Report campus problems and follow every fix, from submitted to resolved.</p></div>
          <button className="primary-btn" onClick={openCreate}><Plus size={18}/> Report an issue</button>
        </section>

        {error && <div className="alert error-alert"><AlertCircle size={18}/><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss"><X size={16}/></button></div>}
        {notice && <div className="alert success-alert"><CheckCircle2 size={18}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={16}/></button></div>}

        <section className="stats-grid">
          <StatCard icon={<ClipboardList size={19}/>} label="Issues shown" value={counts.total} helper="Matching your filters" tone="blue"/>
          <StatCard icon={<AlertCircle size={19}/>} label="Open" value={counts.open} helper="Awaiting attention" tone="orange"/>
          <StatCard icon={<Clock3 size={19}/>} label="In progress" value={counts.progress} helper="Work underway" tone="purple"/>
          <StatCard icon={<CheckCircle2 size={19}/>} label="Resolved" value={counts.resolved} helper="Marked as complete" tone="green"/>
        </section>

        <section className="list-panel">
          <div className="panel-heading"><div><h2>Recent reports</h2><p>Keep track of issues across your campus.</p></div><button className="icon-button" onClick={loadIssues} title="Refresh issues"><RefreshCw size={17}/></button></div>
          <div className="toolbar">
            <div className="search-box"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports or locations..." /></div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status"><option>All</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Filter by category"><option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          </div>
          {loading ? <div className="empty-state"><div className="spinner"/><strong>Loading reports…</strong></div> :
            issues.length === 0 ? <div className="empty-state"><div className="empty-icon"><ClipboardList size={24}/></div><strong>No reports found</strong><p>{error ? "Start the backend server and connect MongoDB, then refresh." : "Try another filter or report the first campus issue."}</p>{!error && <button className="secondary-btn" onClick={openCreate}><Plus size={16}/> Report an issue</button>}</div> :
            <div className="issue-list">{issues.map((issue) => <article className="issue-row" key={issue._id}>
              <div className={`category-icon ${issue.category.toLowerCase()}`}><CategoryIcon category={issue.category}/></div>
              <div className="issue-main"><div className="issue-title-line"><h3>{issue.title}</h3><span className={`status-pill ${statusClass(issue.status)}`}><span/> {issue.status}</span></div><p className="issue-description">{issue.description}</p><div className="issue-meta"><span><MapPin size={14}/>{issue.location}</span><span><CalendarDays size={14}/>{dateLabel(issue.createdAt)}</span><span className="category-label">{issue.category}</span></div></div>
              <div className="row-actions"><select value={issue.status} onChange={(e) => changeStatus(issue, e.target.value)} aria-label={`Change status for ${issue.title}`} title="Change status">{statuses.map((s) => <option key={s}>{s}</option>)}</select><button className="text-action" onClick={() => openEdit(issue)}>Edit <ArrowUpRight size={14}/></button><button className="delete-action" onClick={() => deleteIssue(issue)} title="Delete issue" aria-label={`Delete ${issue.title}`}><Trash2 size={16}/></button></div>
            </article>)}</div>}
          <div className="panel-footer"><span>Showing <strong>{issues.length}</strong> report{issues.length === 1 ? "" : "s"}</span><span>CampusFix <span className="footer-dot">•</span> Issue tracking</span></div>
        </section>
        <footer className="page-footer"><span>© 2026 CampusFix</span><span>Built for a better campus experience</span></footer>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title">
        <div className="modal-header"><div><div className="eyebrow">{editingId ? "UPDATE REPORT" : "HELP IMPROVE YOUR CAMPUS"}</div><h2 id="form-title">{editingId ? "Edit issue" : "Report an issue"}</h2><p>Share the details so the right team can take a look.</p></div><button className="icon-button" onClick={() => setShowForm(false)} aria-label="Close form"><X size={19}/></button></div>
        <form onSubmit={submitForm} className="issue-form">
          <label>Issue title <span>*</span><input required maxLength="100" value={form.title} onChange={(e) => setForm({...form, title:e.target.value})} placeholder="e.g. Projector not working"/></label>
          <div className="form-two"><label>Category <span>*</span><select value={form.category} onChange={(e) => setForm({...form, category:e.target.value})}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label><label>Campus location <span>*</span><input required maxLength="120" value={form.location} onChange={(e) => setForm({...form, location:e.target.value})} placeholder="e.g. Block B, Room 204"/></label></div>
          <label>Description <span>*</span><textarea required maxLength="1000" rows="4" value={form.description} onChange={(e) => setForm({...form, description:e.target.value})} placeholder="Describe what happened and any useful details..."/></label>
          <label>Your name <small>(optional)</small><input maxLength="80" value={form.reporter} onChange={(e) => setForm({...form, reporter:e.target.value})} placeholder="Enter your name"/></label>
          <div className="form-note"><AlertCircle size={15}/> Please don't include passwords or other sensitive personal information.</div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn" disabled={saving}>{saving ? "Saving..." : <><Plus size={17}/>{editingId ? "Save changes" : "Submit report"}</>}</button></div>
        </form>
      </section></div>}
    </div>
  );
}

function StatCard({icon,label,value,helper,tone}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-helper">{helper}</div></div>;
}
function CategoryIcon({category}) {
  if (category === "Electrical") return <span>ϟ</span>;
  if (category === "Furniture") return <span>▤</span>;
  if (category === "Cleanliness") return <span>✧</span>;
  if (category === "Internet") return <span>⌁</span>;
  if (category === "Plumbing") return <span>≋</span>;
  return <Wrench size={19}/>;
}
