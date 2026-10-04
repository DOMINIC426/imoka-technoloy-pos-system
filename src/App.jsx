import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, BriefcaseBusiness, ChevronLeft, ChevronRight, CircleDollarSign, Home, LogOut, Search, Settings2 } from 'lucide-react';
import { initializeLegacyApp } from '../imkoka.js';
import { apiUrl } from './api.js';
import { FeedbackProvider } from './components/ui/FeedbackProvider.jsx';
import { buttonClass, emptyClass, fieldClass, formGridClass, inputClass, labelClass, modalActionsClass, panelClass, smallButtonClass, tableClass } from './uiClasses.js';

const navButtonClass = 'flex w-full items-center gap-3 rounded-lg border border-teal-800 bg-teal-800 px-3.5 py-3 text-left text-sm text-white transition-colors hover:border-teal-700 hover:bg-teal-700 [&.active]:border-teal-500 [&.active]:bg-teal-600 [&.active]:ring-1 [&.active]:ring-teal-300';
const cashierNavigation = [
  { title: 'Workspace', items: [{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'shift', label: 'Shift', icon: BriefcaseBusiness }, { id: 'sales', label: 'Sales / POS', icon: CircleDollarSign }] },
  { title: 'Operations', items: [{ id: 'expenses', label: 'Expenses', icon: Settings2 }, { id: 'reports', label: 'Reports', icon: BarChart3 }] }
];

export default function App() {
  return <FeedbackProvider><CashierApp /></FeedbackProvider>;
}

function CashierApp() {
  const [expanded, setExpanded] = useState(() => localStorage.getItem('imoka_cashier_sidebar_collapsed') !== 'true');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)');
    const syncSidebar = event => setExpanded(!event.matches && localStorage.getItem('imoka_cashier_sidebar_collapsed') !== 'true');
    syncSidebar(media);
    media.addEventListener('change', syncSidebar);
    return () => media.removeEventListener('change', syncSidebar);
  }, []);

  useEffect(() => {
    return initializeLegacyApp();
  }, []);

  async function signOut() {
    const token = sessionStorage.getItem('imoka_pos_token');
    try {
      await fetch(apiUrl('/api/auth/logout'), { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    } finally {
      sessionStorage.removeItem('imoka_pos_token');
      sessionStorage.removeItem('imoka_pos_user');
      sessionStorage.removeItem('imoka_shift_open');
      window.location.hash = '#login';
    }
  }

  const navigation = cashierNavigation.map(group => ({
    ...group,
    items: group.items.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
  })).filter(group => group.items.length);

  function toggleSidebar() {
    setExpanded(value => {
      localStorage.setItem('imoka_cashier_sidebar_collapsed', String(!value));
      return !value;
    });
  }

  return (
    <>
    <div className="app flex min-h-screen bg-gray-50 text-gray-900 print:hidden">
      {expanded && <button className="fixed inset-0 z-[9] hidden bg-gray-950/25 max-[700px]:block" type="button" aria-label="Close navigation menu" onClick={toggleSidebar} />}
      <motion.aside animate={{ width: expanded ? 268 : 82 }} transition={{ type: 'spring', stiffness: 320, damping: 32 }} className="fixed inset-y-3 left-3 z-10 flex flex-col overflow-visible rounded-2xl border border-white/80 bg-[#174e46] px-3 py-4 text-white shadow-[0_22px_70px_rgba(12,49,40,0.3)]">
        <div className={`flex h-12 items-center ${expanded ? 'justify-between px-1' : 'justify-center'}`}>
          <a href="#home" className="flex min-w-0 items-center gap-3 text-white no-underline" title="Imoka POS">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#d2e7db] text-lg font-extrabold text-[#174e46]">I</span>
            {expanded && <span className="min-w-0"><strong className="block truncate text-sm tracking-wide">IMOKA POS</strong><small className="block text-[9px] tracking-[.14em] text-white/65">CASHIER WORKSPACE</small></span>}
          </a>
          {expanded && <button className="grid size-8 shrink-0 place-items-center rounded-lg text-white/75 transition-colors hover:bg-white/10 hover:text-white" type="button" onClick={toggleSidebar} aria-label="Collapse menu" title="Collapse menu"><ChevronLeft size={18} /></button>}
          {!expanded && <button className="absolute -right-3 top-5 grid size-7 place-items-center rounded-full border border-white/80 bg-white text-[#174e46] shadow-lg" type="button" onClick={toggleSidebar} aria-label="Expand menu" title="Expand menu"><ChevronRight size={16} /></button>}
        </div>
        <div className="my-4 h-px bg-white/15" />
        {expanded && <label className="mb-5 flex h-10 items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3 text-white/60 focus-within:border-white/35"><Search size={15} /><input className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/45" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search menu" aria-label="Search menu" /></label>}
        <nav className="grid content-start gap-5 overflow-y-auto" aria-label="Cashier navigation">
          {navigation.map(group => <div key={group.title}>
            {expanded && <p className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.18em] text-white/55">{group.title}</p>}
            <div className="grid gap-1.5">{group.items.map(({ id, label, icon: Icon }) => <button key={id} type="button" data-page={id} title={expanded ? undefined : label} className={`${navButtonClass} ${expanded ? '' : 'justify-center px-0'} [&.active]:shadow-[0_8px_24px_rgba(6,30,24,0.24)]`}><Icon size={18} /><span className={expanded ? 'truncate' : 'sr-only'}>{label}</span></button>)}</div>
          </div>)}
        </nav>
        <div className="mt-auto border-t border-white/15 pt-3">
          <div className={`mb-2 flex items-center gap-2.5 rounded-xl bg-white/10 p-2 ${expanded ? '' : 'justify-center'}`}><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#d2e7db] text-xs font-bold text-[#174e46]">IC</span>{expanded && <span className="min-w-0 flex-1"><strong className="block truncate text-xs">Cashier account</strong><small className="text-[10px] text-white/60">Active session</small></span>}</div>
          <button type="button" onClick={signOut} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white ${expanded ? '' : 'justify-center px-0'}`} title="Sign out"><LogOut size={17} /><span className={expanded ? '' : 'sr-only'}>Sign out</span></button>
        </div>
      </aside>

      <main className={`main min-w-0 flex-1 transition-[margin] duration-300 ${expanded ? 'ml-[292px] w-[calc(100%-292px)] max-[700px]:ml-[106px] max-[700px]:w-[calc(100%-106px)]' : 'ml-[106px] w-[calc(100%-106px)]'}`}>
        <header className="topbar sticky top-0 z-[4] flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-7 max-[700px]:gap-2 max-[700px]:px-[15px]">
          <strong className="text-lg max-[420px]:text-[15px]" id="pageTitle">Dashboard</strong>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <a className={`${smallButtonClass} no-underline`} href="#home">Website</a>
              <button className={smallButtonClass} onClick={signOut}>Sign out</button>
            </div>
            <div className="whitespace-nowrap text-sm max-[700px]:text-[11px]" id="clock"></div>
          </div>
        </header>
        <div className="content mx-auto w-full max-w-[1500px] p-[26px] max-[700px]:p-[15px] max-[420px]:p-3">
          <section id="dashboard" className="page">
            <div className="grid grid-cols-4 gap-[18px] max-[1000px]:grid-cols-2 max-[420px]:grid-cols-1">
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.07)] max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Today's sales</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="mToday">TZS 0</div><div className="mt-1 text-xs text-gray-500" id="mTodayCount">0 transactions</div></div>
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.07)] max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">This month's sales</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="mMonth">TZS 0</div><div className="mt-1 text-xs text-gray-500">Gross sales</div></div>
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.07)] max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Products</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="mProducts">0</div><div className="mt-1 text-xs text-gray-500" id="mLow">0 low-stock</div></div>
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 shadow-[0_8px_28px_rgba(16,24,40,0.07)] max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Customers</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="mCustomers">0</div><div className="mt-1 text-xs text-gray-500">Saved customer records</div></div>
            </div>
            <div className={`${panelClass} mt-5`}>
              <div className="mb-4 flex items-center justify-between gap-2 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">Recent sales</h2><button className={smallButtonClass} onClick={() => window.showPage('sales')}>Open POS</button></div>
              <div className="overflow-x-auto"><table className={tableClass} id="recentTable"></table></div>
            </div>
          </section>

          <section id="shift" className="page hidden">
            <div className={`${panelClass} mt-0 max-w-[680px]`}>
              <p className="mb-1 text-xs font-bold uppercase tracking-[.14em] text-teal-700">Cashier session</p>
              <h2 className="mb-2 text-xl font-semibold">Current shift</h2>
              <p className="mb-5 text-sm text-gray-500" id="shiftStatus">Checking shift status...</p>
              <div className="mb-5 grid grid-cols-2 gap-4 border-y border-gray-200 py-4 max-[500px]:grid-cols-1">
                <div><span className="block text-xs text-gray-500">Opened at</span><strong className="mt-1 block text-sm" id="shiftOpenedAt">Not open</strong></div>
                <div><span className="block text-xs text-gray-500">Collected this shift</span><strong className="mt-1 block text-sm" id="shiftCollected">TZS 0</strong></div>
              </div>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" id="openShiftButton" onClick={() => window.openShift()}>Open shift</button>
              <button className="ml-2 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-600 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50" id="closeShiftButton" onClick={() => window.closeShift()}>Close shift</button>
            </div>
          </section>

          <section id="sales" className="page hidden">
            <div className="grid grid-cols-[1.4fr_.6fr] gap-[18px] max-[1000px]:grid-cols-1">
              <div><div className={`${panelClass} mt-0`}>
                <div className="mb-4 flex items-center justify-between gap-2 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">New sale</h2><button className={smallButtonClass} onClick={() => window.clearCart()}>Clear cart</button></div>
                <div className="flex flex-wrap gap-2.5 max-[700px]:w-full"><input className={`${inputClass} min-w-[180px] flex-1`} id="productSearch" placeholder="Search products..." onInput={() => window.renderProducts()} /><select className={`${inputClass} min-w-[180px] flex-1`} id="customerSelect"></select></div>
                <div className="mt-[15px] grid grid-cols-3 gap-3 max-[1000px]:grid-cols-2 max-[700px]:grid-cols-1" id="productGrid"></div>
              </div></div>
              <div><div className={`${panelClass} mt-0`}>
                <div className="mb-4 flex items-center justify-between gap-2"><h2 className="mb-0 text-base font-semibold">Cart</h2><span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] text-blue-800" id="cartCount">0 items</span></div>
                <div id="cart"></div>
                <div className="mt-4">
                  <div className="flex justify-between py-1.5 text-gray-500"><span>Subtotal</span><strong className="text-gray-900" id="subtotal">TZS 0</strong></div>
                  <div className="flex items-center justify-between gap-2 py-1.5 text-gray-500"><span>Discount</span><input className={`${inputClass} w-[110px] text-right`} id="discount" type="number" min="0" defaultValue="0" onInput={() => window.renderCart()} /></div>
                  <div className="flex items-center justify-between gap-2 py-1.5 text-gray-500"><span>Tax (%)</span><input className={`${inputClass} w-[110px] text-right`} id="taxRate" type="number" min="0" defaultValue="0" onInput={() => window.renderCart()} /></div>
                  <div className="flex justify-between py-1.5 text-gray-500"><span>Tax</span><strong className="text-gray-900" id="tax">TZS 0</strong></div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-[19px] font-extrabold text-gray-900"><span>Total</span><strong id="grandTotal">TZS 0</strong></div>
                </div>
                <div className="mt-4 grid gap-2">
                  <select className={inputClass} id="paymentMethod"><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></select>
                  <input className={inputClass} id="amountPaid" type="number" min="0" placeholder="Amount paid" />
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-700 bg-emerald-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => window.completeSale()}>Complete sale &amp; print receipt</button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-teal-700 bg-teal-700 px-3.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50" onClick={() => window.saveSale(false)}>Save sale without printing</button>
                </div>
              </div></div>
            </div>
          </section>

          <section id="expenses" className="page hidden"><div className={`${panelClass} mt-0`}>
            <div className="mb-4 flex items-center justify-between gap-2 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">Business expenses</h2><button className={buttonClass} onClick={() => window.openExpenseModal()}>+ Add expense</button></div>
            <div className="overflow-x-auto"><table className={tableClass} id="expensesTable"></table></div>
          </div></section>

          <section id="reports" className="page hidden"><div className={`${panelClass} mt-0`}>
            <div className="mb-4 flex items-center justify-between gap-3 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">Sales report</h2><div className="flex flex-wrap gap-2.5 max-[700px]:w-full">
              <input className={`${inputClass} w-auto min-w-[150px] flex-1`} id="reportFrom" type="date" /><input className={`${inputClass} w-auto min-w-[150px] flex-1`} id="reportTo" type="date" />
              <button className={buttonClass} onClick={() => window.renderReports()}>Run report</button>
              <button className={buttonClass} onClick={() => window.exportSales()}>Export CSV</button>
            </div></div>
            <div className="grid grid-cols-3 gap-[18px] max-[700px]:grid-cols-1">
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Sales</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="rSales">TZS 0</div></div>
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Transactions</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="rTransactions">0</div></div>
              <div className="rounded-[14px] border border-gray-200 bg-white p-5 max-[420px]:p-[14px]"><div className="text-[13px] text-gray-500">Expenses</div><div className="mt-2 text-[26px] font-bold max-[420px]:text-[22px]" id="rExpenses">TZS 0</div></div>
            </div>
            <div className="mt-[18px] overflow-x-auto"><table className={tableClass} id="reportTable"></table></div>
          </div></section>

          <section id="settings" className="page hidden">
            <div className={`${panelClass} mt-0`}>
              <h2 className="mb-4 text-base font-semibold">Business settings</h2>
              <div className={formGridClass}>
                <div className={fieldClass}><label className={labelClass}>Business name</label><input className={inputClass} id="sName" /></div>
                <div className={fieldClass}><label className={labelClass}>Phone</label><input className={inputClass} id="sPhone" /></div>
                <div className={fieldClass}><label className={labelClass}>Email</label><input className={inputClass} id="sEmail" /></div>
                <div className={`${fieldClass} col-span-2 max-[700px]:col-span-1`}><label className={labelClass}>Business address</label><input className={inputClass} id="sAddress" placeholder="Street, town" /></div>
                <div className={fieldClass}><label className={labelClass}>TIN (optional)</label><input className={inputClass} id="sTin" inputMode="numeric" /></div>
                <div className={fieldClass}><label className={labelClass}>VRN (optional)</label><input className={inputClass} id="sVrn" /></div>
                <div className={fieldClass}><label className={labelClass}>Currency</label><input className={inputClass} id="sCurrency" /></div>
                <div className={`${fieldClass} col-span-2 max-[700px]:col-span-1`}><label className={labelClass}>Receipt footer</label><textarea className={inputClass} id="sFooter" rows="3"></textarea></div>
              </div>
              <div className="mt-5 flex justify-end gap-2 max-[420px]:flex-col"><button className={buttonClass} onClick={() => window.saveSettings()}>Save settings</button><button className={buttonClass} onClick={() => window.resetDemo()}>Reset demo data</button></div>
            </div>
            <div className={panelClass}>
              <h2 className="mb-4 text-base font-semibold">Data &amp; backup</h2>
              <p className="text-[13px] text-gray-500">All data is stored locally in this browser. Export sales, products and customers as CSV for backup.</p>
            </div>
          </section>
        </div>
      </main>

      <div className="fixed inset-0 z-20 hidden place-items-center bg-slate-900/50 p-5" id="modal"><div className="max-h-[90vh] w-full max-w-[650px] overflow-auto rounded-xl bg-white p-[22px]" id="modalBox"></div></div>
    </div>
    <div className="hidden print:absolute print:left-0 print:top-0 print:block print:visible print:w-[80mm]" id="printArea"></div>
    </>
  );
}
