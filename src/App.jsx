import { useEffect } from 'react';
import { initializeLegacyApp } from '../imkoka.js';
import { buttonClass, emptyClass, fieldClass, formGridClass, inputClass, labelClass, modalActionsClass, panelClass, smallButtonClass, tableClass } from './uiClasses.js';

export default function App() {
  useEffect(() => {
    return initializeLegacyApp();
  }, []);

  return (
    <>
    <div className="app flex min-h-screen bg-gray-50 text-gray-900 print:hidden">
      <aside className="sidebar fixed inset-y-0 left-0 z-[5] w-[250px] bg-gray-900 px-[14px] py-[22px] text-white max-[700px]:w-[72px] max-[700px]:px-2">
        <div className="brand flex items-center gap-3 border-b border-white/10 px-2.5 pb-6">
          <div className="logo grid size-[42px] shrink-0 place-items-center rounded-[11px] bg-blue-600 text-lg font-extrabold">IC</div>
          <div className="max-[700px]:hidden">
            <h1>Imoka Co Ltd</h1>
            <small className="text-gray-300">Business POS</small>
          </div>
        </div>
        <div className="nav mt-[18px] grid gap-1">
          <button className="active flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="dashboard">▦ <span className="max-[700px]:hidden">Dashboard</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="sales">▣ <span className="max-[700px]:hidden">Sales / POS</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="products">◫ <span className="max-[700px]:hidden">Products</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="customers">♙ <span className="max-[700px]:hidden">Customers</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="expenses">▤ <span className="max-[700px]:hidden">Expenses</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="reports">◒ <span className="max-[700px]:hidden">Reports</span></button>
          <button className="flex w-full items-center gap-3 rounded-lg border border-black bg-black px-3.5 py-3 text-left text-sm text-white [&.active]:ring-1 [&.active]:ring-blue-500" data-page="settings">⚙ <span className="max-[700px]:hidden">Settings</span></button>
        </div>
      </aside>

      <main className="main ml-[250px] min-w-0 w-[calc(100%-250px)] flex-1 max-[700px]:ml-[72px] max-[700px]:w-[calc(100%-72px)]">
        <header className="topbar sticky top-0 z-[4] flex h-[70px] items-center justify-between border-b border-gray-200 bg-white px-7 max-[700px]:gap-2 max-[700px]:px-[15px]">
          <strong className="text-lg max-[420px]:text-[15px]" id="pageTitle">Dashboard</strong>
          <div className="flex items-center gap-4">
            <a className={`${smallButtonClass} no-underline`} href="#home">Website</a>
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
                  <button className={buttonClass} onClick={() => window.completeSale()}>Complete sale &amp; print receipt</button>
                  <button className={buttonClass} onClick={() => window.saveSale(false)}>Save sale without printing</button>
                </div>
              </div></div>
            </div>
          </section>

          <section id="products" className="page hidden"><div className={`${panelClass} mt-0`}>
            <div className="mb-4 flex items-center justify-between gap-2 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">Product catalogue &amp; inventory</h2><button className={buttonClass} onClick={() => window.openProductModal()}>+ Add product</button></div>
            <div className="mb-3 flex flex-wrap gap-2.5 max-[700px]:w-full"><input className={`${inputClass} min-w-[180px] flex-1`} id="inventorySearch" placeholder="Search products..." onInput={() => window.renderInventory()} /><button className={buttonClass} onClick={() => window.exportProducts()}>Export CSV</button></div>
            <div className="overflow-x-auto"><table className={tableClass} id="inventoryTable"></table></div>
          </div></section>

          <section id="customers" className="page hidden"><div className={`${panelClass} mt-0`}>
            <div className="mb-4 flex items-center justify-between gap-2 max-[700px]:flex-wrap"><h2 className="mb-0 text-base font-semibold">Customers</h2><button className={buttonClass} onClick={() => window.openCustomerModal()}>+ Add customer</button></div>
            <div className="mb-3 flex flex-wrap gap-2.5 max-[700px]:w-full"><input className={`${inputClass} min-w-[180px] flex-1`} id="customerSearch" placeholder="Search customers..." onInput={() => window.renderCustomers()} /><button className={buttonClass} onClick={() => window.exportCustomers()}>Export CSV</button></div>
            <div className="overflow-x-auto"><table className={tableClass} id="customersTable"></table></div>
          </div></section>

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
      <div className="fixed bottom-[22px] right-[22px] z-50 hidden rounded-lg bg-gray-900 px-4 py-3 text-white" id="toast"></div>
    </div>
    <div className="hidden print:absolute print:left-0 print:top-0 print:block print:visible print:w-[80mm]" id="printArea"></div>
    </>
  );
}
