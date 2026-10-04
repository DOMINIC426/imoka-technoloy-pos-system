import { useEffect } from 'react';
import { initializeLegacyApp } from '../imkoka.js';

export default function App() {
  useEffect(() => {
    return initializeLegacyApp();
  }, []);

  return (
    <div className="app flex min-h-screen">
      <aside className="sidebar fixed inset-y-0 left-0 z-[5]">
        <div className="brand flex items-center">
          <div className="logo grid place-items-center">IC</div>
          <div>
            <h1>Imoka Co Ltd</h1>
            <small>Business POS</small>
          </div>
        </div>
        <div className="nav">
          <button className="active" data-page="dashboard">▦ <span>Dashboard</span></button>
          <button data-page="sales">▣ <span>Sales / POS</span></button>
          <button data-page="products">◫ <span>Products</span></button>
          <button data-page="customers">♙ <span>Customers</span></button>
          <button data-page="expenses">▤ <span>Expenses</span></button>
          <button data-page="reports">◒ <span>Reports</span></button>
          <button data-page="settings">⚙ <span>Settings</span></button>
        </div>
      </aside>

      <main className="main min-w-0 flex-1">
        <header className="topbar sticky top-0 z-[4] flex items-center justify-between">
          <strong id="pageTitle">Dashboard</strong>
          <div className="flex items-center gap-4">
            <a className="btn sm" href="#home">Website</a>
            <div id="clock"></div>
          </div>
        </header>
        <div className="content mx-auto w-full">
          <section id="dashboard" className="page">
            <div className="grid cards">
              <div className="card"><div className="label">Today's sales</div><div className="metric" id="mToday">TZS 0</div><div className="sub" id="mTodayCount">0 transactions</div></div>
              <div className="card"><div className="label">This month's sales</div><div className="metric" id="mMonth">TZS 0</div><div className="sub">Gross sales</div></div>
              <div className="card"><div className="label">Products</div><div className="metric" id="mProducts">0</div><div className="sub" id="mLow">0 low-stock</div></div>
              <div className="card"><div className="label">Customers</div><div className="metric" id="mCustomers">0</div><div className="sub">Saved customer records</div></div>
            </div>
            <div className="panel">
              <div className="section-title"><h2>Recent sales</h2><button className="btn sm" onClick={() => window.showPage('sales')}>Open POS</button></div>
              <div className="table-wrap"><table className="table" id="recentTable"></table></div>
            </div>
          </section>

          <section id="sales" className="page hidden">
            <div className="pos">
              <div><div className="panel" style={{ marginTop: 0 }}>
                <div className="section-title"><h2>New sale</h2><button className="btn sm" onClick={() => window.clearCart()}>Clear cart</button></div>
                <div className="toolbar"><input id="productSearch" placeholder="Search products..." onInput={() => window.renderProducts()} /><select id="customerSelect"></select></div>
                <div className="products" id="productGrid" style={{ marginTop: 15 }}></div>
              </div></div>
              <div><div className="panel" style={{ marginTop: 0 }}>
                <div className="section-title"><h2>Cart</h2><span className="badge" id="cartCount">0 items</span></div>
                <div id="cart"></div>
                <div className="totals">
                  <div className="total-line"><span>Subtotal</span><strong id="subtotal">TZS 0</strong></div>
                  <div className="total-line"><span>Discount</span><input id="discount" type="number" min="0" defaultValue="0" style={{ width: 110, textAlign: 'right' }} onInput={() => window.renderCart()} /></div>
                  <div className="total-line"><span>Tax (%)</span><input id="taxRate" type="number" min="0" defaultValue="0" style={{ width: 110, textAlign: 'right' }} onInput={() => window.renderCart()} /></div>
                  <div className="total-line"><span>Tax</span><strong id="tax">TZS 0</strong></div>
                  <div className="total-line grand"><span>Total</span><strong id="grandTotal">TZS 0</strong></div>
                </div>
                <div className="grid gap-[9px]" style={{ marginTop: 16 }}>
                  <select id="paymentMethod"><option>Cash</option><option>Mobile Money</option><option>Card</option><option>Bank Transfer</option></select>
                  <input id="amountPaid" type="number" min="0" placeholder="Amount paid" />
                  <button className="btn primary" onClick={() => window.completeSale()}>Complete sale &amp; print receipt</button>
                  <button className="btn" onClick={() => window.saveSale(false)}>Save sale without printing</button>
                </div>
              </div></div>
            </div>
          </section>

          <section id="products" className="page hidden"><div className="panel" style={{ marginTop: 0 }}>
            <div className="section-title"><h2>Product catalogue &amp; inventory</h2><button className="btn primary" onClick={() => window.openProductModal()}>+ Add product</button></div>
            <div className="toolbar"><input id="inventorySearch" placeholder="Search products..." onInput={() => window.renderInventory()} /><button className="btn" onClick={() => window.exportProducts()}>Export CSV</button></div>
            <div className="table-wrap"><table className="table" id="inventoryTable"></table></div>
          </div></section>

          <section id="customers" className="page hidden"><div className="panel" style={{ marginTop: 0 }}>
            <div className="section-title"><h2>Customers</h2><button className="btn primary" onClick={() => window.openCustomerModal()}>+ Add customer</button></div>
            <div className="toolbar"><input id="customerSearch" placeholder="Search customers..." onInput={() => window.renderCustomers()} /><button className="btn" onClick={() => window.exportCustomers()}>Export CSV</button></div>
            <div className="table-wrap"><table className="table" id="customersTable"></table></div>
          </div></section>

          <section id="expenses" className="page hidden"><div className="panel" style={{ marginTop: 0 }}>
            <div className="section-title"><h2>Business expenses</h2><button className="btn primary" onClick={() => window.openExpenseModal()}>+ Add expense</button></div>
            <div className="table-wrap"><table className="table" id="expensesTable"></table></div>
          </div></section>

          <section id="reports" className="page hidden"><div className="panel" style={{ marginTop: 0 }}>
            <div className="section-title"><h2>Sales report</h2><div className="toolbar">
              <input id="reportFrom" type="date" /><input id="reportTo" type="date" />
              <button className="btn primary" onClick={() => window.renderReports()}>Run report</button>
              <button className="btn" onClick={() => window.exportSales()}>Export CSV</button>
            </div></div>
            <div className="grid cards" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
              <div className="card"><div className="label">Sales</div><div className="metric" id="rSales">TZS 0</div></div>
              <div className="card"><div className="label">Transactions</div><div className="metric" id="rTransactions">0</div></div>
              <div className="card"><div className="label">Expenses</div><div className="metric" id="rExpenses">TZS 0</div></div>
            </div>
            <div className="table-wrap" style={{ marginTop: 18 }}><table className="table" id="reportTable"></table></div>
          </div></section>

          <section id="settings" className="page hidden">
            <div className="panel" style={{ marginTop: 0 }}>
              <h2>Business settings</h2>
              <div className="form-grid">
                <div className="field"><label>Business name</label><input id="sName" /></div>
                <div className="field"><label>Phone</label><input id="sPhone" /></div>
                <div className="field"><label>Email</label><input id="sEmail" /></div>
                <div className="field full"><label>Business address</label><input id="sAddress" placeholder="Street, town" /></div>
                <div className="field"><label>TIN (optional)</label><input id="sTin" inputMode="numeric" /></div>
                <div className="field"><label>VRN (optional)</label><input id="sVrn" /></div>
                <div className="field"><label>Currency</label><input id="sCurrency" /></div>
                <div className="field full"><label>Receipt footer</label><textarea id="sFooter" rows="3"></textarea></div>
              </div>
              <div className="modal-actions"><button className="btn primary" onClick={() => window.saveSettings()}>Save settings</button><button className="btn danger" onClick={() => window.resetDemo()}>Reset demo data</button></div>
            </div>
            <div className="panel">
              <h2>Data &amp; backup</h2>
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>All data is stored locally in this browser. Export sales, products and customers as CSV for backup.</p>
            </div>
          </section>
        </div>
      </main>

      <div className="modal" id="modal"><div className="modal-box" id="modalBox"></div></div>
      <div className="toast" id="toast"></div>
      <div id="printArea" className="print-area"></div>
    </div>
  );
}
