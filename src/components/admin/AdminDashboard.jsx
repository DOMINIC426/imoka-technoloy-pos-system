import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowDownRight, ArrowLeft, ArrowRight, BadgeDollarSign, ChevronLeft, ChevronRight, Clock3, Download, FileClock, Home, LayoutDashboard, Package, Pencil, Plus, Search, Trash2, Upload, Users, X } from 'lucide-react';
import { apiUrl } from '../../api.js';
import { confirmAction } from '../ui/FeedbackProvider.jsx';
import UserMenu from '../ui/UserMenu.jsx';

const money = value => `TZS ${Number(value || 0).toLocaleString('en-TZ', { maximumFractionDigits: 2 })}`;
const dateTime = value => value ? new Date(value).toLocaleString() : 'In progress';

async function request(path, token, options = {}) {
  const response = await fetch(apiUrl(`/api${path}`), {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Request failed.');
  return result;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'shifts', label: 'Shifts', icon: Clock3 },
  { id: 'audit', label: 'Audit log', icon: FileClock },
  { id: 'backup', label: 'Backup', icon: Download }
];

const categories = ['Printing', 'Branding', 'Stationary', 'Internet', 'Graphics'];
const navGroups = [
  { title: 'Workspace', ids: ['dashboard', 'users', 'products'] },
  { title: 'Operations', ids: ['shifts', 'audit', 'backup'] }
];

export default function AdminDashboard({ token, user, onSignOut }) {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(() => localStorage.getItem('imoka_admin_sidebar_collapsed') !== 'true');
  const [navSearch, setNavSearch] = useState('');
  const [summary, setSummary] = useState(null);
  const [users, setUsers] = useState({ users: [], page: 1, pageCount: 1, total: 0 });
  const [shifts, setShifts] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserForm, setShowUserForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [formError, setFormError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productSaving, setProductSaving] = useState(false);
  const [auditEvents, setAuditEvents] = useState([]);
  const [restoring, setRestoring] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const syncSidebar = event => setSidebarExpanded(!event.matches && localStorage.getItem('imoka_admin_sidebar_collapsed') !== 'true');
    syncSidebar(media);
    media.addEventListener('change', syncSidebar);
    return () => media.removeEventListener('change', syncSidebar);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const load = async () => {
      try {
        if (activePage === 'dashboard') {
          const data = await request('/admin/dashboard', token);
          if (!cancelled) setSummary(data);
        } else if (activePage === 'users') {
          const params = new URLSearchParams({ page: String(page), search });
          const data = await request(`/admin/users?${params}`, token);
          if (!cancelled) setUsers(data);
        } else if (activePage === 'shifts') {
          const data = await request('/admin/shifts', token);
          if (!cancelled) setShifts(data.shifts);
        } else if (activePage === 'audit') {
          const data = await request('/admin/audit?limit=100', token);
          if (!cancelled) setAuditEvents(data.events);
        } else {
          const data = await request('/admin/products', token);
          if (!cancelled) setProducts(data.products);
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activePage, page, search, token]);

  function openUserForm() {
    setCreatedUser(null);
    setFormError('');
    setShowUserForm(true);
  }

  async function createUser(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get('firstName') || '').trim();
    const lastName = String(data.get('lastName') || '').trim();
    const email = String(data.get('email') || '').trim();
    if (!firstName || !lastName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Enter a first name, last name, and valid email address.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const result = await request('/admin/users', token, {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email })
      });
      setCreatedUser(result);
      setPage(1);
      setSearch('');
      setUsers(current => ({ ...current, users: [result.user, ...current.users], total: current.total + 1 }));
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  function openProductForm(product = null) {
    setEditingProduct(product);
    setFormError('');
    setShowProductForm(true);
  }

  async function saveProduct(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const stockTracked = data.get('stockTracked') === 'true';
    const product = {
      name: String(data.get('name') || '').trim(),
      category: String(data.get('category') || ''),
      price: Number(data.get('price')),
      stockTracked,
      stock: stockTracked ? Number(data.get('stock')) : 0
    };
    if (!product.name || !Number.isFinite(product.price) || product.price < 0 || (stockTracked && (!Number.isFinite(product.stock) || product.stock < 0))) {
      setFormError('Enter a product name, valid price and valid stock quantity.');
      return;
    }
    setProductSaving(true);
    setFormError('');
    try {
      const path = editingProduct ? `/admin/products/${encodeURIComponent(editingProduct.id)}` : '/admin/products';
      const result = await request(path, token, { method: editingProduct ? 'PUT' : 'POST', body: JSON.stringify(product) });
      setProducts(current => editingProduct ? current.map(item => item.id === result.product.id ? result.product : item) : [...current, result.product]);
      setShowProductForm(false);
      setEditingProduct(null);
    } catch (saveError) {
      setFormError(saveError.message);
    } finally {
      setProductSaving(false);
    }
  }

  async function deleteProduct(product) {
    if (!await confirmAction({ title: 'Archive this product?', message: `Cashiers will no longer be able to sell ${product.name}. Existing sales will remain in reports.`, confirmLabel: 'Archive product', destructive: true })) return;
    try {
      await request(`/admin/products/${encodeURIComponent(product.id)}`, token, { method: 'DELETE' });
      setProducts(current => current.filter(item => item.id !== product.id));
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  async function downloadBackup() {
    setBackupMessage('');
    try {
      const backup = await request('/admin/backup', token);
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `imoka-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      setBackupMessage('Backup downloaded. Keep it in a secure location.');
    } catch (backupError) {
      setBackupMessage(backupError.message);
    }
  }

  async function restoreBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!await confirmAction({ title: 'Restore this backup?', message: 'This replaces current users, sales, shifts and products. This cannot be undone.', confirmLabel: 'Restore data', destructive: true })) return;
    setRestoring(true);
    setBackupMessage('');
    try {
      const backup = JSON.parse(await file.text());
      await request('/admin/backup/restore', token, { method: 'POST', body: JSON.stringify(backup) });
      sessionStorage.removeItem('imoka_pos_token');
      sessionStorage.removeItem('imoka_pos_user');
      setBackupMessage('Backup restored. Returning to sign in...');
      window.location.hash = '#login';
    } catch (restoreError) {
      setBackupMessage(restoreError instanceof SyntaxError ? 'The selected file is not valid JSON.' : restoreError.message);
    } finally {
      setRestoring(false);
    }
  }

  const navById = new Map(navItems.map(item => [item.id, item]));
  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.ids.map(id => navById.get(id)).filter(item => item.label.toLowerCase().includes(navSearch.toLowerCase()))
  })).filter(group => group.items.length);

  function toggleSidebar() {
    setSidebarExpanded(value => {
      localStorage.setItem('imoka_admin_sidebar_collapsed', String(!value));
      return !value;
    });
  }

  return (
    <div className="min-h-screen bg-[#f4f5f8] text-gray-900">
      <motion.aside animate={{ width: sidebarExpanded ? 260 : 76 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="fixed inset-y-0 left-0 z-20 flex flex-col overflow-visible border-r border-gray-200 bg-white px-3 py-4 text-gray-800">
        <div className={`flex h-12 items-center ${sidebarExpanded ? 'justify-between px-1' : 'justify-center'}`}>
          <a href="#home" className="flex min-w-0 items-center gap-3 text-gray-900 no-underline" title="Imoka administration"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#6538e8] text-lg font-bold text-white">I</span>{sidebarExpanded && <span className="min-w-0"><strong className="block truncate text-sm tracking-wide">IMOKA POS</strong><small className="block text-[9px] tracking-[.14em] text-gray-500">ADMIN WORKSPACE</small></span>}</a>
          {sidebarExpanded && <button className="grid size-8 shrink-0 place-items-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900" type="button" onClick={toggleSidebar} aria-label="Collapse menu" title="Collapse menu"><ChevronLeft size={18} /></button>}
          {!sidebarExpanded && <button className="absolute -right-3 top-5 grid size-7 place-items-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm" type="button" onClick={toggleSidebar} aria-label="Expand menu" title="Expand menu"><ChevronRight size={16} /></button>}
        </div>
        <div className="my-4 h-px bg-gray-200" />
        {sidebarExpanded && <label className="mb-5 flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-gray-500 focus-within:border-violet-400"><Search size={15} /><input className="min-w-0 flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-400" value={navSearch} onChange={event => setNavSearch(event.target.value)} placeholder="Search menu" aria-label="Search menu" /></label>}
        <nav className="grid content-start gap-5 overflow-y-auto" aria-label="Admin navigation">
          {filteredGroups.map(group => <div key={group.title}>{sidebarExpanded && <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.18em] text-gray-400">{group.title}</p>}<div className="grid gap-1.5">{group.items.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setActivePage(id)} className={`flex w-full items-center gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition-colors ${sidebarExpanded ? '' : 'justify-center px-0'} ${activePage === id ? 'border-violet-100 bg-violet-50 text-violet-700' : 'border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`} aria-current={activePage === id ? 'page' : undefined} title={sidebarExpanded ? undefined : label}><Icon size={18} aria-hidden="true" /><span className={sidebarExpanded ? 'truncate' : 'sr-only'}>{label}</span></button>)}</div></div>)}
        </nav>
        <div className="mt-auto border-t border-gray-200 pt-3"><div className={`mb-2 flex items-center gap-2.5 rounded-lg bg-gray-50 p-2 ${sidebarExpanded ? '' : 'justify-center'}`}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{user.firstName?.[0]}{user.lastName?.[0]}</span>{sidebarExpanded && <span className="min-w-0 flex-1"><strong className="block truncate text-xs">{user.firstName} {user.lastName}</strong><small className="text-[10px] text-gray-500">Administrator</small></span>}</div></div>
      </motion.aside>

      {sidebarExpanded && <button className="fixed inset-0 z-10 hidden bg-gray-950/25 max-[700px]:block" type="button" aria-label="Close navigation menu" onClick={toggleSidebar} />}
      <main className={`min-h-screen transition-[margin] duration-300 ${sidebarExpanded ? 'ml-[276px] max-[700px]:ml-[92px]' : 'ml-[92px]'}`}>
        <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between border-b border-gray-200 bg-white px-8 max-[700px]:px-4">
          <div><p className="m-0 text-[10px] font-bold uppercase tracking-[.15em] text-violet-600">Imoka Technology</p><h1 className="mt-1 text-xl font-semibold">{navItems.find(item => item.id === activePage)?.label}</h1></div>
          <UserMenu user={user} onSignOut={onSignOut} />
        </header>

        <section className="mx-auto max-w-[1400px] p-8 max-[700px]:p-4">
          {error && <div className="mb-5 border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">{error}</div>}
          {loading && <p className="mb-4 text-sm text-gray-500" aria-live="polite">Loading...</p>}

          {activePage === 'dashboard' && (
            <>
              <div className="mb-7 flex items-end justify-between gap-4 max-[500px]:items-start max-[500px]:flex-col"><div><p className="text-sm text-gray-500">A live view of today’s activity.</p><h2 className="mt-1 text-2xl font-semibold">Business overview</h2></div><span className="text-xs text-gray-500">{new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</span></div>
              <div className="grid grid-cols-3 gap-4 max-[1000px]:grid-cols-2 max-[500px]:grid-cols-1">
                <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-md bg-violet-50 text-violet-700"><Users size={19} /></span><p className="mt-5 text-sm text-gray-500">Total users</p><strong className="mt-1 block text-3xl font-semibold">{summary?.totalUsers ?? '—'}</strong><span className="mt-2 block text-xs text-gray-500">Admin and cashier accounts</span></article>
                <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-md bg-violet-50 text-violet-700"><BadgeDollarSign size={19} /></span><p className="mt-5 text-sm text-gray-500">Sales today</p><strong className="mt-1 block text-3xl font-semibold">{summary ? money(summary.salesToday) : '—'}</strong><span className="mt-2 block text-xs text-gray-500">{summary?.transactionsToday ?? 0} completed transactions</span></article>
                <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><span className="grid size-10 place-items-center rounded-md bg-violet-50 text-violet-700"><Activity size={19} /></span><p className="mt-5 text-sm text-gray-500">Open shifts</p><strong className="mt-1 block text-3xl font-semibold">{summary?.openShifts ?? '—'}</strong><span className="mt-2 block text-xs text-gray-500">Cashier sessions in progress</span></article>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 py-4 text-sm text-gray-600"><span>Review staff and shift activity</span><button type="button" className="inline-flex items-center gap-2 font-semibold text-violet-700 hover:text-violet-900" onClick={() => setActivePage('shifts')}>View shifts <ArrowDownRight size={16} /></button></div>
            </>
          )}

          {activePage === 'users' && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 max-[600px]:items-stretch max-[600px]:flex-col"><div><p className="text-sm text-gray-500">Manage team access.</p><h2 className="mt-1 text-2xl font-semibold">Users <span className="ml-1 text-base font-normal text-gray-500">({users.total})</span></h2></div><button type="button" onClick={openUserForm} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"><Plus size={17} /> Add user</button></div>
              <label className="mb-4 flex h-11 max-w-[440px] items-center gap-3 rounded-md border border-gray-200 bg-white px-3.5 focus-within:border-violet-400"><Search size={17} className="text-gray-500" /><input className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, email or role" aria-label="Search users" /></label>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[620px] border-collapse text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3 font-semibold">Name</th><th className="px-4 py-3 font-semibold">Email</th><th className="px-4 py-3 font-semibold">Role</th><th className="px-4 py-3 font-semibold">Added</th></tr></thead><tbody>{users.users.map(record => <tr className="border-t border-gray-100" key={record.id}><td className="px-4 py-3.5 font-medium">{record.firstName} {record.lastName}</td><td className="px-4 py-3.5 text-gray-600">{record.email}</td><td className="px-4 py-3.5"><span className="inline-flex rounded bg-violet-50 px-2.5 py-1 text-xs font-semibold capitalize text-violet-700">{record.role}</span></td><td className="px-4 py-3.5 text-gray-500">{new Date(record.createdAt).toLocaleDateString()}</td></tr>)}{!users.users.length && !loading && <tr><td className="px-4 py-10 text-center text-gray-500" colSpan="4">No users found.</td></tr>}</tbody></table></div>
              <div className="mt-4 flex items-center justify-between gap-3 text-sm text-gray-600"><span>Page {users.page} of {users.pageCount}</span><div className="flex gap-2"><button className="inline-flex h-9 items-center gap-1.5 border border-gray-300 bg-white px-3 disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={users.page <= 1 || loading} onClick={() => setPage(current => Math.max(1, current - 1))}><ArrowLeft size={15} /> Previous</button><button className="inline-flex h-9 items-center gap-1.5 border border-gray-300 bg-white px-3 disabled:cursor-not-allowed disabled:opacity-45" type="button" disabled={users.page >= users.pageCount || loading} onClick={() => setPage(current => current + 1)}>Next <ArrowRight size={15} /></button></div></div>
            </>
          )}

          {activePage === 'shifts' && (
            <>
              <div className="mb-6"><p className="text-sm text-gray-500">Opening, closing and collected totals.</p><h2 className="mt-1 text-2xl font-semibold">Stationery shifts</h2></div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[720px] border-collapse text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3 font-semibold">Cashier</th><th className="px-4 py-3 font-semibold">Opened</th><th className="px-4 py-3 font-semibold">Closed</th><th className="px-4 py-3 font-semibold">Collected</th><th className="px-4 py-3 font-semibold">Status</th></tr></thead><tbody>{shifts.map(shift => <tr className="border-t border-gray-100" key={shift.id}><td className="px-4 py-3.5 font-medium">{shift.userName}</td><td className="px-4 py-3.5 text-gray-600">{dateTime(shift.openedAt)}</td><td className="px-4 py-3.5 text-gray-600">{dateTime(shift.closedAt)}</td><td className="px-4 py-3.5 font-semibold">{money(shift.collected)}</td><td className="px-4 py-3.5"><span className={`inline-flex rounded px-2.5 py-1 text-xs font-semibold ${shift.closedAt ? 'bg-gray-100 text-gray-600' : 'bg-violet-50 text-violet-700'}`}>{shift.closedAt ? 'Closed' : 'Open'}</span></td></tr>)}{!shifts.length && !loading && <tr><td className="px-4 py-10 text-center text-gray-500" colSpan="5">No shifts recorded yet.</td></tr>}</tbody></table></div>
            </>
          )}

          {activePage === 'products' && (
            <>
              <div className="mb-6 flex items-end justify-between gap-4 max-[600px]:items-stretch max-[600px]:flex-col"><div><p className="text-sm text-gray-500">Shared catalog used by the cashier POS.</p><h2 className="mt-1 text-2xl font-semibold">Products <span className="ml-1 text-base font-normal text-gray-500">({products.length})</span></h2></div><button type="button" onClick={() => openProductForm()} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700"><Plus size={17} /> Add product</button></div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Category</th><th className="px-4 py-3 font-semibold">Price</th><th className="px-4 py-3 font-semibold">Stock</th><th className="px-4 py-3 font-semibold">Actions</th></tr></thead><tbody>{products.map(product => <tr className="border-t border-gray-100 hover:bg-gray-50" key={product.id}><td className="px-4 py-3.5 font-medium">{product.name}<small className="mt-0.5 block text-xs text-gray-500">{product.id}</small></td><td className="px-4 py-3.5 text-gray-600">{product.category}</td><td className="px-4 py-3.5">{money(product.price)}</td><td className="px-4 py-3.5">{product.stockTracked === false ? <span className="text-gray-500">Not tracked</span> : <span className={product.stock <= 5 ? 'font-semibold text-amber-700' : 'text-gray-700'}>{product.stock}</span>}</td><td className="px-4 py-3.5"><div className="flex gap-2"><button type="button" title={`Edit ${product.name}`} aria-label={`Edit ${product.name}`} onClick={() => openProductForm(product)} className="grid size-9 place-items-center rounded-md border border-violet-200 bg-violet-50 text-violet-700 transition-colors hover:bg-violet-100"><Pencil size={16} /></button><button type="button" title={`Delete ${product.name}`} aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)} className="grid size-9 place-items-center rounded-md border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800"><Trash2 size={16} /></button></div></td></tr>)}{!products.length && !loading && <tr><td className="px-4 py-10 text-center text-gray-500" colSpan="5">No products in the catalog.</td></tr>}</tbody></table></div>
            </>
          )}

          {activePage === 'audit' && (
            <>
              <div className="mb-6"><p className="text-sm text-gray-500">Read-only history of important account and business actions.</p><h2 className="mt-1 text-2xl font-semibold">Audit log</h2></div>
              <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-4 py-3 font-semibold">When</th><th className="px-4 py-3 font-semibold">Actor</th><th className="px-4 py-3 font-semibold">Action</th><th className="px-4 py-3 font-semibold">Record</th><th className="px-4 py-3 font-semibold">Details</th></tr></thead><tbody>{auditEvents.map(event => <tr className="border-t border-gray-100" key={event.id}><td className="whitespace-nowrap px-4 py-3.5 text-gray-600">{dateTime(event.createdAt)}</td><td className="px-4 py-3.5 font-medium">{event.actorName}</td><td className="px-4 py-3.5">{event.action}</td><td className="px-4 py-3.5 text-gray-600">{event.entity}{event.entityId ? ` · ${event.entityId}` : ''}</td><td className="px-4 py-3.5 text-gray-600">{Object.values(event.details || {}).join(' · ') || '—'}</td></tr>)}{!auditEvents.length && !loading && <tr><td className="px-4 py-10 text-center text-gray-500" colSpan="5">No audit events recorded.</td></tr>}</tbody></table></div>
            </>
          )}

          {activePage === 'backup' && (
            <>
              <div className="mb-6"><p className="text-sm text-gray-500">Export or restore the application’s persistent business data.</p><h2 className="mt-1 text-2xl font-semibold">Data backup</h2></div>
              <div className="max-w-2xl border border-gray-200 bg-white p-5">
                <h3 className="text-base font-semibold">Download backup</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">Exports users, products, sales, shifts and audit history as a JSON file. Passwords are included only as salted hashes.</p>
                <button className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700" type="button" onClick={downloadBackup}><Download size={17} /> Download JSON backup</button>
              </div>
              <div className="mt-5 max-w-2xl border border-red-200 bg-white p-5">
                <h3 className="text-base font-semibold text-red-800">Restore backup</h3>
                <p className="mt-1 text-sm leading-6 text-gray-600">Restoring replaces current users, products, sales and shifts. Download a current backup first and only restore a trusted file.</p>
                <label className="mt-4 inline-flex h-10 cursor-pointer items-center gap-2 border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"><Upload size={17} />{restoring ? 'Restoring...' : 'Choose backup file'}<input className="sr-only" type="file" accept="application/json,.json" disabled={restoring} onChange={restoreBackup} /></label>
              </div>
              {backupMessage && <p className="mt-4 text-sm text-gray-700" role="status">{backupMessage}</p>}
            </>
          )}
        </section>
      </main>

      <AnimatePresence>
      {showUserForm && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-gray-950/45 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowUserForm(false); }}>
        <motion.section initial={{ opacity: 0, y: 15, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} className="w-full max-w-[480px] border border-gray-200 bg-white p-6 shadow-[0_25px_80px_rgba(9,32,26,0.25)]" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Team access</p><h2 id="create-user-title" className="mt-1 text-2xl font-semibold">Add a cashier</h2></div><button type="button" className="grid size-9 place-items-center text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close" onClick={() => setShowUserForm(false)}><X size={19} /></button></div>
          {createdUser ? <div className="rounded-md border border-violet-200 bg-violet-50 p-4"><p className="font-semibold text-violet-800">Cashier account created</p><p className="mt-2 text-sm text-gray-700">{createdUser.user.firstName} {createdUser.user.lastName} can sign in with:</p><p className="mt-3 text-sm"><strong>Email:</strong> {createdUser.user.email}</p><p className="mt-1 text-sm"><strong>Temporary password:</strong> <code className="select-all bg-white px-1.5 py-1">{createdUser.initialPassword}</code></p><p className="mt-3 text-xs leading-5 text-gray-600">Share this password securely. The cashier will be required to change it at first sign-in.</p><button className="mt-5 h-10 w-full rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700" type="button" onClick={() => setShowUserForm(false)}>Done</button></div> : <form className="grid gap-4" onSubmit={createUser} noValidate>
            <label className="grid gap-1.5 text-sm font-medium">First name<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="firstName" type="text" maxLength={80} autoComplete="given-name" required /></label>
            <label className="grid gap-1.5 text-sm font-medium">Last name<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="lastName" type="text" maxLength={80} autoComplete="family-name" required /></label>
            <label className="grid gap-1.5 text-sm font-medium">Email address<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="email" type="email" maxLength={254} autoComplete="email" required /></label>
            <div className="rounded-r border-l-2 border-violet-500 bg-violet-50 px-3 py-2.5 text-xs leading-5 text-gray-600">Role: <strong className="text-gray-800">Cashier</strong>. Temporary password: last name in uppercase.</div>
            {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
            <div className="mt-1 flex justify-end gap-2"><button className="h-10 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" onClick={() => setShowUserForm(false)}>Cancel</button><button className="inline-flex h-10 items-center gap-2 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60" type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create cashier'}</button></div>
          </form>}
        </motion.section>
      </motion.div>}

      {showProductForm && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-gray-950/45 p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowProductForm(false); }}>
        <motion.section initial={{ opacity: 0, y: 15, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }} className="w-full max-w-[480px] border border-gray-200 bg-white p-6 shadow-[0_25px_80px_rgba(9,32,26,0.25)]" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-violet-600">Shared catalog</p><h2 id="product-form-title" className="mt-1 text-2xl font-semibold">{editingProduct ? 'Edit product' : 'Add product'}</h2></div><button type="button" className="grid size-9 place-items-center text-gray-500 hover:bg-gray-100 hover:text-gray-900" aria-label="Close" onClick={() => setShowProductForm(false)}><X size={19} /></button></div>
          <form className="grid gap-4" onSubmit={saveProduct} noValidate>
            <label className="grid gap-1.5 text-sm font-medium">Product name<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="name" type="text" maxLength={160} defaultValue={editingProduct?.name || ''} required /></label>
            <label className="grid gap-1.5 text-sm font-medium">Category<select className="h-11 rounded-md border border-gray-200 bg-white px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="category" defaultValue={categories.includes(editingProduct?.category) ? editingProduct.category : 'Printing'}>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
            <label className="grid gap-1.5 text-sm font-medium">Selling price<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="price" type="number" min="0" step="0.01" defaultValue={editingProduct?.price ?? ''} required /></label>
            <label className="grid gap-1.5 text-sm font-medium">Stock type<select className="h-11 rounded-md border border-gray-200 bg-white px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="stockTracked" defaultValue={editingProduct?.stockTracked === false ? 'false' : 'true'} onChange={event => { const quantity = event.currentTarget.form.elements.stock; quantity.closest('label').classList.toggle('hidden', event.target.value !== 'true'); }}><option value="true">Stock item</option><option value="false">Non-stock item</option></select></label>
            <label className={`grid gap-1.5 text-sm font-medium ${editingProduct?.stockTracked === false ? 'hidden' : ''}`}>Stock quantity<input className="h-11 rounded-md border border-gray-200 px-3 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100" name="stock" type="number" min="0" step="1" defaultValue={editingProduct?.stockTracked === false ? '' : editingProduct?.stock ?? ''} /></label>
            {formError && <p className="text-sm text-rose-700" role="alert">{formError}</p>}
            <div className="mt-1 flex justify-end gap-2"><button className="h-10 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50" type="button" onClick={() => setShowProductForm(false)}>Cancel</button><button className="h-10 rounded-md bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-60" type="submit" disabled={productSaving}>{productSaving ? 'Saving...' : editingProduct ? 'Save changes' : 'Create product'}</button></div>
          </form>
        </motion.section>
      </motion.div>}
      </AnimatePresence>
    </div>
  );
}
