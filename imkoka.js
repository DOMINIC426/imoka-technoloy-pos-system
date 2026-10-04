const KEY = 'imoka_pos_v1';
const defaultData = {
    settings: {
        name: 'Imoka Co Ltd',
        phone: '0744 805 938',
        email: 'imokaprints@gmail.com',
        address: '',
        tin: '',
        vrn: '',
        currency: 'TZS',
        footer: 'Thank you for doing business with Imoka Co Ltd.'
    },
    products: [
        { id: 'P001', name: 'A4 Black & White Printing', price: 500, stock: 100, category: 'Printing' },
        { id: 'P002', name: 'A4 Colour Printing', price: 1000, stock: 100, category: 'Printing' },
        { id: 'P003', name: 'A3 Colour Printing', price: 2500, stock: 50, category: 'Printing' },
        { id: 'P004', name: 'Photocopy A4', price: 300, stock: 200, category: 'Copying' },
        { id: 'P005', name: 'Business Card Design', price: 15000, stock: 20, category: 'Design' },
        { id: 'P006', name: 'Lamination A4', price: 2000, stock: 60, category: 'Finishing' }
    ],
    customers: [{ id: 'C001', name: 'Walk-in Customer', phone: '', email: '' }],
    sales: [],
    expenses: []
};

let db = loadData();
let cart = [];

function loadData() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultData);
    } catch (e) {
        return structuredClone(defaultData);
    }
}

function saveDB() {
    localStorage.setItem(KEY, JSON.stringify(db));
}

function money(n) {
    return `${db.settings.currency} ${Number(n || 0).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    })}`;
}

function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

function nowISO() {
    return new Date().toISOString();
}

function dateOnly(iso) {
    return new Date(iso).toISOString().slice(0, 10);
}

function toast(msg) {
    const toastElement = document.getElementById('toast');
    toastElement.textContent = msg;
    toastElement.classList.add('show');
    setTimeout(() => toastElement.classList.remove('show'), 2200);
}

function nextId(prefix, list) {
    const max = list.reduce((currentMax, item) => {
        const number = parseInt(String(item.id || '').replace(/\D/g, '')) || 0;
        return Math.max(currentMax, number);
    }, 0);
    return prefix + String(max + 1).padStart(3, '0');
}

function showPage(id) {
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav button').forEach(button => {
        button.classList.toggle('active', button.dataset.page === id);
    });
    document.getElementById('pageTitle').textContent = {
        dashboard: 'Dashboard',
        sales: 'Sales / POS',
        products: 'Products',
        customers: 'Customers',
        expenses: 'Expenses',
        reports: 'Reports',
        settings: 'Settings'
    }[id];

    if (id === 'dashboard') renderDashboard();
    if (id === 'sales') renderPOS();
    if (id === 'products') renderInventory();
    if (id === 'customers') renderCustomers();
    if (id === 'expenses') renderExpenses();
    if (id === 'reports') renderReports();
    if (id === 'settings') renderSettings();
}

document.querySelectorAll('.nav button').forEach(button => {
    button.onclick = () => showPage(button.dataset.page);
});

function updateClock() {
    document.getElementById('clock').textContent = new Date().toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });
}

setInterval(updateClock, 1000);
updateClock();

function renderDashboard() {
    const today = dateOnly(nowISO());
    const month = today.slice(0, 7);
    const todaySales = db.sales.filter(sale => dateOnly(sale.date) === today);
    const monthSales = db.sales.filter(sale => dateOnly(sale.date).slice(0, 7) === month);

    document.getElementById('mToday').textContent = money(todaySales.reduce((total, sale) => total + sale.total, 0));
    document.getElementById('mTodayCount').textContent = `${todaySales.length} transaction${todaySales.length === 1 ? '' : 's'}`;
    document.getElementById('mMonth').textContent = money(monthSales.reduce((total, sale) => total + sale.total, 0));
    document.getElementById('mProducts').textContent = db.products.length;
    document.getElementById('mLow').textContent = `${db.products.filter(product => product.stock <= 5).length} low-stock`;
    document.getElementById('mCustomers').textContent = db.customers.length;

    const rows = db.sales.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    document.getElementById('recentTable').innerHTML = rows.length
        ? `<thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Payment</th><th class="right">Total</th></tr></thead><tbody>${rows.map(sale => `<tr><td>${esc(sale.receiptNo)}</td><td>${new Date(sale.date).toLocaleString()}</td><td>${esc(sale.customerName)}</td><td>${esc(sale.payment)}</td><td class="right">${money(sale.total)}</td></tr>`).join('')}</tbody>`
        : '<tbody><tr><td class="empty">No sales yet.</td></tr></tbody>';
}

function renderPOS() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = db.customers.map(customer => `<option value="${customer.id}">${esc(customer.name)}</option>`).join('');
    renderProducts();
    renderCart();
}

function renderProducts() {
    const query = (document.getElementById('productSearch')?.value || '').toLowerCase();
    const products = db.products.filter(product => (product.name + ' ' + product.category).toLowerCase().includes(query));

    document.getElementById('productGrid').innerHTML = products.map(product => `<div class="product"><h3>${esc(product.name)}</h3><div class="price">${money(product.price)}</div><div class="stock ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''}">${product.stock === 0 ? 'Out of stock' : product.stock + ' in stock'}</div><button class="btn sm primary" ${product.stock === 0 ? 'disabled' : ''} onclick="addToCart('${product.id}')">Add to cart</button></div>`).join('') || '<div class="empty">No matching products.</div>';
}

function addToCart(id) {
    const product = db.products.find(item => item.id === id);
    if (!product) return;

    const row = cart.find(item => item.id === id);
    if (row) {
        if (row.qty >= product.stock) return toast('Not enough stock');
        row.qty++;
    } else {
        cart.push({ id, qty: 1 });
    }
    renderCart();
}

function clearCart() {
    cart = [];
    document.getElementById('discount').value = 0;
    renderCart();
}

function renderCart() {
    const box = document.getElementById('cart');
    const subtotal = cart.reduce((total, row) => total + row.qty * (db.products.find(product => product.id === row.id)?.price || 0), 0);
    const discount = Math.min(Number(document.getElementById('discount').value || 0), subtotal);
    const rate = Number(document.getElementById('taxRate').value || 0);
    const tax = (subtotal - discount) * rate / 100;
    const total = subtotal - discount + tax;

    box.innerHTML = cart.length
        ? cart.map(row => {
            const product = db.products.find(item => item.id === row.id);
            return `<div class="cart-row"><div>${esc(product.name)}<br><small>${money(product.price)}</small></div><input class="qty" type="number" min="1" max="${product.stock}" value="${row.qty}" onchange="setQty('${row.id}',this.value)"><strong class="right">${money(product.price * row.qty)}</strong><button class="btn sm" onclick="removeCart('${row.id}')">×</button></div>`;
        }).join('')
        : '<div class="empty">Cart is empty.</div>';

    document.getElementById('cartCount').textContent = `${cart.reduce((count, row) => count + row.qty, 0)} items`;
    document.getElementById('subtotal').textContent = money(subtotal);
    document.getElementById('tax').textContent = money(tax);
    document.getElementById('grandTotal').textContent = money(total);
}

function setQty(id, value) {
    const product = db.products.find(item => item.id === id);
    const row = cart.find(item => item.id === id);
    row.qty = Math.max(1, Math.min(product.stock, parseInt(value) || 1));
    renderCart();
}

function removeCart(id) {
    cart = cart.filter(item => item.id !== id);
    renderCart();
}

function calculateTotal() {
    const subtotal = cart.reduce((total, row) => total + row.qty * (db.products.find(product => product.id === row.id)?.price || 0), 0);
    const discount = Math.min(Number(document.getElementById('discount').value || 0), subtotal);
    const tax = (subtotal - discount) * Number(document.getElementById('taxRate').value || 0) / 100;
    return { subtotal, discount, tax, total: subtotal - discount + tax };
}

function saveSale(printIt) {
    if (!cart.length) return toast('Add at least one item.');

    const totals = calculateTotal();
    const paid = Number(document.getElementById('amountPaid').value || 0);
    if (paid < totals.total) return toast('Amount paid is less than the total.');

    const customer = db.customers.find(item => item.id === document.getElementById('customerSelect').value) || db.customers[0];
    const sale = {
        id: nextId('S', db.sales),
        receiptNo: 'RCT-' + new Date().getFullYear() + '-' + String(db.sales.length + 1).padStart(5, '0'),
        date: nowISO(),
        customerId: customer.id,
        customerName: customer.name,
        items: cart.map(row => {
            const product = db.products.find(item => item.id === row.id);
            return { id: product.id, name: product.name, price: product.price, qty: row.qty };
        }),
        ...totals,
        paid,
        payment: document.getElementById('paymentMethod').value,
        change: paid - totals.total
    };

    sale.items.forEach(item => {
        const product = db.products.find(entry => entry.id === item.id);
        product.stock = Math.max(0, product.stock - item.qty);
    });
    db.sales.push(sale);
    saveDB();
    cart = [];
    renderCart();
    renderProducts();
    document.getElementById('amountPaid').value = '';
    toast('Sale saved successfully');
    if (printIt) printReceipt(sale);
    renderDashboard();
}

function completeSale() {
    saveSale(true);
}

function printReceipt(s) {
    const set = db.settings;
    document.getElementById('printArea').innerHTML = `<article class="receipt">
        <header class="receipt-header">
            <h1>${esc(set.name)}</h1>
            <div class="receipt-title">SALES RECEIPT</div>
            <div class="receipt-contact">${set.phone ? `${esc(set.phone)}<br>` : ''}${set.email ? esc(set.email) : ''}</div>
            ${set.address ? `<div class="receipt-business-detail">${esc(set.address)}</div>` : ''}
            ${set.tin || set.vrn ? `<div class="receipt-business-detail">${set.tin ? `TIN: ${esc(set.tin)}` : ''}${set.tin && set.vrn ? ' &nbsp; ' : ''}${set.vrn ? `VRN: ${esc(set.vrn)}` : ''}</div>` : ''}
        </header>

        <div class="receipt-divider"></div>

        <section class="receipt-meta">
            <div class="receipt-meta-row"><span>Receipt No.</span><strong>${esc(s.receiptNo)}</strong></div>
            <div class="receipt-meta-row"><span>Date</span><strong>${new Date(s.date).toLocaleString()}</strong></div>
            <div class="receipt-meta-row"><span>Customer</span><strong>${esc(s.customerName)}</strong></div>
            <div class="receipt-meta-row"><span>Payment</span><strong>${esc(s.payment)}</strong></div>
        </section>

        <div class="receipt-divider"></div>

        <table class="receipt-items">
            <thead>
                <tr><th>Description</th><th>Qty</th><th>Amount</th></tr>
            </thead>
            <tbody>
                ${s.items.map(item => `<tr>
                    <td>${esc(item.name)}<small>${money(item.price)} each</small></td>
                    <td>${item.qty}</td>
                    <td>${money(item.qty * item.price)}</td>
                </tr>`).join('')}
            </tbody>
        </table>

        <div class="receipt-divider"></div>

        <table class="receipt-totals">
            <tbody>
                <tr><td>Subtotal</td><td>${money(s.subtotal)}</td></tr>
                <tr><td>Discount</td><td>${money(s.discount)}</td></tr>
                <tr><td>Tax</td><td>${money(s.tax)}</td></tr>
                <tr class="grand"><td>TOTAL</td><td>${money(s.total)}</td></tr>
                <tr><td>Amount paid</td><td>${money(s.paid)}</td></tr>
                <tr><td>Change</td><td>${money(s.change)}</td></tr>
            </tbody>
        </table>

        <footer class="receipt-footer">
            <strong>THANK YOU FOR YOUR BUSINESS</strong>
            <div>${esc(set.footer)}</div>
            <small>Please keep this receipt for your records.</small>
        </footer>
    </article>`;
    window.print();
}

function renderInventory() {
    const query = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
    const products = db.products.filter(product => (product.name + ' ' + product.category).toLowerCase().includes(query));

    document.getElementById('inventoryTable').innerHTML = `<thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${products.map(product => `<tr><td>${product.id}</td><td>${esc(product.name)}</td><td>${esc(product.category)}</td><td>${money(product.price)}</td><td class="${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : ''}">${product.stock}</td><td><button class="btn sm" onclick="editProduct('${product.id}')">Edit</button> <button class="btn sm" onclick="deleteProduct('${product.id}')">Delete</button></td></tr>`).join('')}</tbody>`;
}

function openProductModal(product = null) {
    document.getElementById('modalBox').innerHTML = `<h2>${product ? 'Edit' : 'Add'} product</h2><div class="form-grid">
 <div class="field"><label>Product name</label><input id="fName" value="${esc(product?.name || '')}"></div><div class="field"><label>Category</label><input id="fCategory" value="${esc(product?.category || '')}"></div>
 <div class="field"><label>Selling price</label><input id="fPrice" type="number" min="0" value="${product?.price || 0}"></div><div class="field"><label>Stock quantity</label><input id="fStock" type="number" min="0" value="${product?.stock || 0}"></div></div>
 <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveProduct('${product?.id || ''}')">Save product</button></div>`;
    document.getElementById('modal').classList.add('show');
}

function saveProduct(id) {
    const name = document.getElementById('fName').value.trim();
    if (!name) return toast('Product name is required');

    const product = id ? db.products.find(item => item.id === id) : { id: nextId('P', db.products) };
    product.name = name;
    product.category = document.getElementById('fCategory').value.trim() || 'General';
    product.price = Number(document.getElementById('fPrice').value || 0);
    product.stock = Number(document.getElementById('fStock').value || 0);
    if (!id) db.products.push(product);
    saveDB();
    closeModal();
    renderInventory();
    renderProducts();
    renderDashboard();
    toast('Product saved');
}

function editProduct(id) {
    openProductModal(db.products.find(product => product.id === id));
}

function deleteProduct(id) {
    if (confirm('Delete this product?')) {
        db.products = db.products.filter(product => product.id !== id);
        saveDB();
        renderInventory();
        renderProducts();
        renderDashboard();
        toast('Product deleted');
    }
}

function renderCustomers() {
    const query = (document.getElementById('customerSearch')?.value || '').toLowerCase();
    const customers = db.customers.filter(customer => (customer.name + ' ' + customer.phone + ' ' + customer.email).toLowerCase().includes(query));

    document.getElementById('customersTable').innerHTML = `<thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead><tbody>${customers.map(customer => `<tr><td>${customer.id}</td><td>${esc(customer.name)}</td><td>${esc(customer.phone)}</td><td>${esc(customer.email)}</td><td><button class="btn sm" onclick="editCustomer('${customer.id}')">Edit</button> ${customer.id !== 'C001' ? `<button class="btn sm" onclick="deleteCustomer('${customer.id}')">Delete</button>` : ''}</td></tr>`).join('')}</tbody>`;
}

function openCustomerModal(customer = null) {
    document.getElementById('modalBox').innerHTML = `<h2>${customer ? 'Edit' : 'Add'} customer</h2><div class="form-grid">
 <div class="field full"><label>Name</label><input id="cName" value="${esc(customer?.name || '')}"></div><div class="field"><label>Phone</label><input id="cPhone" value="${esc(customer?.phone || '')}"></div><div class="field"><label>Email</label><input id="cEmail" value="${esc(customer?.email || '')}"></div></div>
 <div class="modal-actions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveCustomer('${customer?.id || ''}')">Save customer</button></div>`;
    document.getElementById('modal').classList.add('show');
}

function saveCustomer(id) {
    const name = document.getElementById('cName').value.trim();
    if (!name) return toast('Customer name is required');

    const customer = id ? db.customers.find(item => item.id === id) : { id: nextId('C', db.customers) };
    customer.name = name;
    customer.phone = document.getElementById('cPhone').value.trim();
    customer.email = document.getElementById('cEmail').value.trim();
    if (!id) db.customers.push(customer);
    saveDB();
    closeModal();
    renderCustomers();
    renderPOS();
    renderDashboard();
    toast('Customer saved');
}

function editCustomer(id) {
    openCustomerModal(db.customers.find(customer => customer.id === id));
}

function deleteCustomer(id) {
    if (confirm('Delete this customer?')) {
        db.customers = db.customers.filter(customer => customer.id !== id);
        saveDB();
        renderCustomers();
        renderPOS();
        toast('Customer deleted');
    }
}

function renderExpenses() {
    document.getElementById('expensesTable').innerHTML = `<thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead><tbody>${db.expenses.slice().reverse().map(expense => `<tr><td>${dateOnly(expense.date)}</td><td>${esc(expense.description)}</td><td>${esc(expense.category)}</td><td>${money(expense.amount)}</td><td><button class="btn sm" onclick="deleteExpense('${expense.id}')">Delete</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">No expenses recorded.</td></tr>'}</tbody>`;
}

function openExpenseModal() {
    document.getElementById('modalBox').innerHTML = `<h2>Add expense</h2><div class="form-grid"><div class="field full"><label>Description</label><input id="eDesc"></div><div class="field"><label>Category</label><input id="eCat" placeholder="e.g. Supplies"></div><div class="field"><label>Amount</label><input id="eAmt" type="number" min="0"></div></div><div class="modal-actions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn primary" onclick="saveExpense()">Save expense</button></div>`;
    document.getElementById('modal').classList.add('show');
}

function saveExpense() {
    const description = document.getElementById('eDesc').value.trim();
    const amount = Number(document.getElementById('eAmt').value || 0);
    if (!description || amount <= 0) return toast('Enter a description and valid amount');

    db.expenses.push({
        id: nextId('E', db.expenses),
        date: nowISO(),
        description,
        category: document.getElementById('eCat').value.trim() || 'General',
        amount
    });
    saveDB();
    closeModal();
    renderExpenses();
    renderReports();
    toast('Expense saved');
}

function deleteExpense(id) {
    if (confirm('Delete this expense?')) {
        db.expenses = db.expenses.filter(expense => expense.id !== id);
        saveDB();
        renderExpenses();
        renderReports();
        toast('Expense deleted');
    }
}

function renderReports() {
    const from = document.getElementById('reportFrom').value;
    const to = document.getElementById('reportTo').value;
    const sales = db.sales.filter(sale => (!from || dateOnly(sale.date) >= from) && (!to || dateOnly(sale.date) <= to));
    const expenses = db.expenses.filter(expense => (!from || dateOnly(expense.date) >= from) && (!to || dateOnly(expense.date) <= to));

    document.getElementById('rSales').textContent = money(sales.reduce((total, sale) => total + sale.total, 0));
    document.getElementById('rTransactions').textContent = sales.length;
    document.getElementById('rExpenses').textContent = money(expenses.reduce((total, expense) => total + expense.amount, 0));
    document.getElementById('reportTable').innerHTML = `<thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Payment</th><th class="right">Total</th><th>Action</th></tr></thead><tbody>${sales.slice().reverse().map(sale => `<tr><td>${sale.receiptNo}</td><td>${new Date(sale.date).toLocaleString()}</td><td>${esc(sale.customerName)}</td><td>${esc(sale.payment)}</td><td class="right">${money(sale.total)}</td><td><button class="btn sm" onclick="printReceiptById('${sale.id}')">Print</button></td></tr>`).join('') || '<tr><td colspan="6" class="empty">No sales for this period.</td></tr>'}</tbody>`;
}

function printReceiptById(id) {
    const sale = db.sales.find(item => item.id === id);
    if (sale) printReceipt(sale);
}

function renderSettings() {
    const settings = db.settings;
    document.getElementById('sName').value = settings.name;
    document.getElementById('sPhone').value = settings.phone;
    document.getElementById('sEmail').value = settings.email;
    document.getElementById('sAddress').value = settings.address || '';
    document.getElementById('sTin').value = settings.tin || '';
    document.getElementById('sVrn').value = settings.vrn || '';
    document.getElementById('sCurrency').value = settings.currency;
    document.getElementById('sFooter').value = settings.footer;
}

function saveSettings() {
    db.settings = {
        name: document.getElementById('sName').value.trim() || 'Imoka Co Ltd',
        phone: document.getElementById('sPhone').value.trim(),
        email: document.getElementById('sEmail').value.trim(),
        address: document.getElementById('sAddress').value.trim(),
        tin: document.getElementById('sTin').value.trim(),
        vrn: document.getElementById('sVrn').value.trim(),
        currency: document.getElementById('sCurrency').value.trim() || 'TZS',
        footer: document.getElementById('sFooter').value.trim()
    };
    saveDB();
    renderDashboard();
    toast('Settings saved');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

document.getElementById('modal').addEventListener('click', event => {
    if (event.target.id === 'modal') closeModal();
});

function csv(rows) {
    if (!rows.length) return '';
    const keys = Object.keys(rows[0]);
    return [keys.join(','), ...rows.map(row => keys.map(key => `"${String(row[key] ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
}

function downloadCSV(name, rows) {
    const blob = new Blob([csv(rows)], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
}

function exportProducts() {
    downloadCSV('imoka-products.csv', db.products);
}

function exportCustomers() {
    downloadCSV('imoka-customers.csv', db.customers);
}

function exportSales() {
    downloadCSV('imoka-sales.csv', db.sales.map(sale => ({
        receipt: sale.receiptNo,
        date: sale.date,
        customer: sale.customerName,
        payment: sale.payment,
        subtotal: sale.subtotal,
        discount: sale.discount,
        tax: sale.tax,
        total: sale.total,
        paid: sale.paid,
        change: sale.change
    })));
}

function resetDemo() {
    if (confirm('This will erase all locally stored sales, products, customers and expenses and restore demo data. Continue?')) {
        db = structuredClone(defaultData);
        cart = [];
        saveDB();
        showPage('dashboard');
        toast('Demo data restored');
    }
}

document.getElementById('reportFrom').value = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
document.getElementById('reportTo').value = dateOnly(nowISO());
renderDashboard();