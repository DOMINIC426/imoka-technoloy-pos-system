import { buttonClass, deleteButtonClass, editButtonClass, emptyClass, fieldClass, formGridClass, inputClass, labelClass, modalActionsClass, smallButtonClass } from './src/uiClasses.js';
import { apiUrl } from './src/api.js';
import { confirmAction, showNotice } from './src/components/ui/FeedbackProvider.jsx';

export function initializeLegacyApp() {
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
let currentShift = null;

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
    showNotice(msg, 'success');
}

function nextId(prefix, list) {
    const max = list.reduce((currentMax, item) => {
        const number = parseInt(String(item.id || '').replace(/\D/g, '')) || 0;
        return Math.max(currentMax, number);
    }, 0);
    return prefix + String(max + 1).padStart(3, '0');
}

function showPage(id) {
    if (id === 'sales' && sessionStorage.getItem('imoka_shift_open') !== 'true') {
        id = 'shift';
        toast('Open your shift before starting sales');
    }
    if (id === 'products' || id === 'customers') id = 'dashboard';
    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    document.querySelectorAll('.nav button').forEach(button => {
        button.classList.toggle('active', button.dataset.page === id);
    });
    document.getElementById('pageTitle').textContent = {
        dashboard: 'Dashboard',
        shift: 'Shift',
        sales: 'Sales / POS',
        expenses: 'Expenses',
        reports: 'Reports',
    }[id];

    if (id === 'dashboard') renderDashboard();
    if (id === 'shift') renderShift();
    if (id === 'sales') renderPOS();
    if (id === 'expenses') renderExpenses();
    if (id === 'reports') renderReports();
}

async function renderShift() {
    const token = sessionStorage.getItem('imoka_pos_token');
    const status = document.getElementById('shiftStatus');
    const openedAt = document.getElementById('shiftOpenedAt');
    const collected = document.getElementById('shiftCollected');
    const openButton = document.getElementById('openShiftButton');
    const closeButton = document.getElementById('closeShiftButton');
    if (!token || !status) return;

    status.textContent = 'Checking shift status...';
    try {
        const response = await fetch(apiUrl('/api/shifts/current'), { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to check shift status.');
        currentShift = result.shift;
        sessionStorage.setItem('imoka_shift_open', currentShift ? 'true' : 'false');
        if (currentShift) {
            status.textContent = 'Your shift is open. Sales are enabled.';
            openedAt.textContent = new Date(currentShift.openedAt).toLocaleString();
            collected.textContent = money(currentShift.collected);
            openButton.textContent = 'Shift is open';
            openButton.disabled = true;
            closeButton.disabled = false;
        } else {
            status.textContent = 'Open a shift before recording any sales.';
            openedAt.textContent = 'Not open';
            collected.textContent = money(0);
            openButton.textContent = 'Open shift';
            openButton.disabled = false;
            closeButton.disabled = true;
        }
    } catch (error) {
        currentShift = null;
        sessionStorage.setItem('imoka_shift_open', 'false');
        status.textContent = error.message;
        openButton.disabled = true;
        closeButton.disabled = true;
    }
}

async function openShift() {
    const token = sessionStorage.getItem('imoka_pos_token');
    const button = document.getElementById('openShiftButton');
    button.disabled = true;
    try {
        const response = await fetch(apiUrl('/api/shifts/open'), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to open shift.');
        currentShift = result.shift;
        sessionStorage.setItem('imoka_shift_open', 'true');
        toast('Shift opened. Sales are now available.');
        await renderShift();
    } catch (error) {
        button.disabled = false;
        toast(error.message);
    }
}

async function closeShift() {
    if (!currentShift) return toast('There is no open shift to close');
    if (!await confirmAction({ title: 'Close this shift?', message: 'Sales will stop until you open a new shift. Your collected total will be recorded.', confirmLabel: 'Close shift', destructive: true })) return;
    const token = sessionStorage.getItem('imoka_pos_token');
    const button = document.getElementById('closeShiftButton');
    button.disabled = true;
    try {
        const response = await fetch(apiUrl('/api/shifts/close'), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to close shift.');
        currentShift = null;
        sessionStorage.setItem('imoka_shift_open', 'false');
        toast('Shift closed successfully');
        await renderShift();
    } catch (error) {
        toast(error.message);
        button.disabled = false;
    }
}

async function loadProducts() {
    const token = sessionStorage.getItem('imoka_pos_token');
    if (!token) return;
    try {
        const response = await fetch(apiUrl('/api/products'), { headers: { Authorization: `Bearer ${token}` } });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to load products.');
        db.products = result.products;
        saveDB();
        renderProducts();
        renderDashboard();
    } catch (error) {
        toast(error.message);
    }
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

const clockTimer = setInterval(updateClock, 1000);
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
    document.getElementById('mLow').textContent = `${db.products.filter(product => product.stockTracked !== false && product.stock <= 5).length} low-stock`;
    document.getElementById('mCustomers').textContent = db.customers.length;

    const rows = db.sales.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    document.getElementById('recentTable').innerHTML = rows.length
        ? `<thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Payment</th><th class="text-right">Total</th></tr></thead><tbody>${rows.map(sale => `<tr><td>${esc(sale.receiptNo)}</td><td>${new Date(sale.date).toLocaleString()}</td><td>${esc(sale.customerName)}</td><td>${esc(sale.payment)}</td><td class="text-right">${money(sale.total)}</td></tr>`).join('')}</tbody>`
        : `<tbody><tr><td class="${emptyClass}">No sales yet.</td></tr></tbody>`;
}

function renderPOS() {
    const select = document.getElementById('customerSelect');
    select.innerHTML = db.customers.map(customer => `<option value="${customer.id}">${esc(customer.name)}</option>`).join('');
    renderProducts();
    renderCart();
    loadProducts();
}

function renderProducts() {
    const query = (document.getElementById('productSearch')?.value || '').toLowerCase();
    const products = db.products.filter(product => (product.name + ' ' + product.category).toLowerCase().includes(query));

    document.getElementById('productGrid').innerHTML = products.map(product => {
        const stockTracked = product.stockTracked !== false;
        const outOfStock = stockTracked && product.stock <= 0;
        const stockLabel = stockTracked ? (outOfStock ? 'Out of stock' : product.stock + ' in stock') : 'Non-stock item';
        return `<div class="min-w-0 rounded-[11px] border border-gray-200 bg-white p-3.5"><h3 class="mb-[7px] mt-0 break-words text-sm font-semibold">${esc(product.name)}</h3><div class="break-words font-bold">${money(product.price)}</div><div class="mb-3 mt-1.5 text-[11px] ${outOfStock ? 'text-red-600' : stockTracked && product.stock <= 5 ? 'text-amber-700' : 'text-gray-500'}">${stockLabel}</div><button class="${smallButtonClass} max-w-full whitespace-normal text-center" ${outOfStock ? 'disabled' : ''} onclick="addToCart('${product.id}')">Add to cart</button></div>`;
    }).join('') || `<div class="${emptyClass}">No matching products.</div>`;
}

function addToCart(id) {
    const product = db.products.find(item => item.id === id);
    if (!product) return;
    if (product.stockTracked !== false && product.stock <= 0) return toast('This item is out of stock');

    const row = cart.find(item => item.id === id);
    if (row) {
        if (product.stockTracked !== false && row.qty >= product.stock) return toast('Not enough stock');
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
            return `<div class="grid min-w-0 grid-cols-[minmax(0,1fr)_72px_90px_30px] items-center gap-2 border-b border-gray-200 py-2.5 text-[13px] max-[700px]:grid-cols-[minmax(0,1fr)_48px_minmax(0,auto)_30px] max-[700px]:gap-1 max-[700px]:text-[11px]"><div class="min-w-0 break-words">${esc(product.name)}<br><small class="text-gray-500">${money(product.price)}</small></div><input class="${inputClass} w-[72px] max-[700px]:w-12" type="number" min="1" ${product.stockTracked === false ? '' : `max="${product.stock}"`} value="${row.qty}" onchange="setQty('${row.id}',this.value)"><strong class="min-w-0 break-words text-right">${money(product.price * row.qty)}</strong><button class="${smallButtonClass} min-w-0 px-1" onclick="removeCart('${row.id}')" aria-label="Remove ${esc(product.name)}">×</button></div>`;
        }).join('')
        : `<div class="${emptyClass}">Cart is empty.</div>`;

    document.getElementById('cartCount').textContent = `${cart.reduce((count, row) => count + row.qty, 0)} items`;
    document.getElementById('subtotal').textContent = money(subtotal);
    document.getElementById('tax').textContent = money(tax);
    document.getElementById('grandTotal').textContent = money(total);
}

function setQty(id, value) {
    const product = db.products.find(item => item.id === id);
    const row = cart.find(item => item.id === id);
    row.qty = Math.max(1, product.stockTracked === false ? parseInt(value) || 1 : Math.min(product.stock, parseInt(value) || 1));
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
    if (sessionStorage.getItem('imoka_shift_open') !== 'true') {
        showPage('shift');
        return toast('Open your shift before recording any sales');
    }
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
        if (product.stockTracked !== false) product.stock = Math.max(0, product.stock - item.qty);
    });
    db.sales.push(sale);
    saveDB();
    const token = sessionStorage.getItem('imoka_pos_token');
    if (token) {
        fetch(apiUrl('/api/sales'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(sale)
        }).then(response => {
            if (!response.ok) throw new Error('Sale sync failed');
            return response.json();
        }).then(result => {
            if (result.duplicate) return;
            result.products?.forEach(updatedProduct => {
                const product = db.products.find(item => item.id === updatedProduct.id);
                if (product) product.stock = updatedProduct.stock;
            });
            saveDB();
        }).catch(() => toast('Sale saved locally, but could not sync to admin reports'));
    }
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
    document.getElementById('printArea').innerHTML = `<article class="mx-auto w-[72mm] break-words bg-white text-base leading-[1.45] text-black [font-family:Arial,sans-serif]">
        <header class="text-center">
            <h1 class="m-0 text-[22px] font-bold">${esc(set.name)}</h1>
            <div class="mt-1 text-[15px] font-bold">SALES RECEIPT</div>
            <div class="mt-[3px] text-[13px]">${set.phone ? `${esc(set.phone)}<br>` : ''}${esc(set.email)}</div>
            ${set.address ? `<div class="mt-[3px] text-[13px]">${esc(set.address)}</div>` : ''}
            ${set.tin || set.vrn ? `<div class="mt-[3px] text-[13px]">${set.tin ? `TIN: ${esc(set.tin)}` : ''}${set.tin && set.vrn ? ' &nbsp; ' : ''}${set.vrn ? `VRN: ${esc(set.vrn)}` : ''}</div>` : ''}
        </header>

        <div class="my-[9px] border-t border-dashed border-black"></div>

        <section class="grid gap-[5px] text-sm">
            <div class="flex justify-between gap-2"><span>Receipt No.</span><strong class="max-w-[65%] break-words text-right">${esc(s.receiptNo)}</strong></div>
            <div class="flex justify-between gap-2"><span>Date</span><strong class="max-w-[65%] break-words text-right">${new Date(s.date).toLocaleString()}</strong></div>
            <div class="flex justify-between gap-2"><span>Customer</span><strong class="max-w-[65%] break-words text-right">${esc(s.customerName)}</strong></div>
            <div class="flex justify-between gap-2"><span>Payment</span><strong class="max-w-[65%] break-words text-right">${esc(s.payment)}</strong></div>
        </section>

        <div class="my-[9px] border-t border-dashed border-black"></div>

        <table class="w-full table-fixed border-collapse text-sm [&_td]:break-words [&_td]:p-[5px_2px] [&_td]:align-top [&_th]:border-b [&_th]:border-black [&_th]:p-[5px_2px] [&_th]:text-left [&_th]:text-xs">
            <thead>
                <tr><th class="w-[54%]">Description</th><th class="w-[12%] text-center">Qty</th><th class="w-[34%] text-right">Amount</th></tr>
            </thead>
            <tbody>
                ${s.items.map(item => `<tr>
                    <td>${esc(item.name)}<small class="mt-0.5 block text-xs">${money(item.price)} each</small></td>
                    <td class="text-center">${item.qty}</td>
                    <td class="text-right">${money(item.qty * item.price)}</td>
                </tr>`).join('')}
            </tbody>
        </table>

        <div class="my-[9px] border-t border-dashed border-black"></div>

        <table class="w-full border-collapse text-sm [&_td]:p-[5px_2px] [&_td:last-child]:text-right">
            <tbody>
                <tr><td>Subtotal</td><td>${money(s.subtotal)}</td></tr>
                <tr><td>Discount</td><td>${money(s.discount)}</td></tr>
                <tr><td>Tax</td><td>${money(s.tax)}</td></tr>
                <tr><td class="border-t border-black pt-2 text-[17px] font-bold">TOTAL</td><td class="border-t border-black pt-2 text-[17px] font-bold">${money(s.total)}</td></tr>
                <tr><td>Amount paid</td><td>${money(s.paid)}</td></tr>
                <tr><td>Change</td><td>${money(s.change)}</td></tr>
            </tbody>
        </table>

        <footer class="mt-[10px] grid gap-[5px] border-t border-dashed border-black pt-2 text-center text-[13px]">
            <strong class="text-sm">THANK YOU FOR YOUR BUSINESS</strong>
            <div>${esc(set.footer)}</div>
            <small class="text-xs">Please keep this receipt for your records.</small>
        </footer>
    </article>`;
    window.print();
}

function renderInventory() {
    const query = (document.getElementById('inventorySearch')?.value || '').toLowerCase();
    const products = db.products.filter(product => (product.name + ' ' + product.category).toLowerCase().includes(query));

    document.getElementById('inventoryTable').innerHTML = `<thead><tr><th>SKU</th><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead><tbody>${products.map(product => {
        const stockTracked = product.stockTracked !== false;
        return `<tr><td>${product.id}</td><td>${esc(product.name)}</td><td>${esc(product.category)}</td><td>${money(product.price)}</td><td class="${stockTracked && product.stock === 0 ? 'text-red-600' : stockTracked && product.stock <= 5 ? 'text-amber-700' : ''}">${stockTracked ? product.stock : 'Not tracked'}</td><td><button class="${editButtonClass}" onclick="editProduct('${product.id}')">Edit</button> <button class="${deleteButtonClass}" onclick="deleteProduct('${product.id}')">Delete</button></td></tr>`;
    }).join('')}</tbody>`;
}

function openProductModal(product = null) {
     const categories = ['Printing', 'Branding', 'Stationary', 'Internet', 'Graphics'];
    const selectedCategory = categories.includes(product?.category) ? product.category : 'Printing';
    const categoryOptions = categories.map(category => `<option value="${esc(category)}" ${category === selectedCategory ? 'selected' : ''}>${esc(category)}</option>`).join('');
     const stockTracked = product?.stockTracked !== false;
     document.getElementById('modalBox').innerHTML = `<h2 class="mb-4 text-base font-semibold">${product ? 'Edit' : 'Add'} product</h2><div class="${formGridClass}">
 <div class="${fieldClass}"><label class="${labelClass}" for="fName">Product name</label><input class="${inputClass}" id="fName" value="${esc(product?.name || '')}" required></div><div class="${fieldClass}"><label class="${labelClass}" for="fCategory">Category</label><select class="${inputClass}" id="fCategory">${categoryOptions}</select></div>
 <div class="${fieldClass}"><label class="${labelClass}" for="fPrice">Selling price</label><input class="${inputClass}" id="fPrice" type="number" min="0" value="${product?.price || 0}"></div><div class="${fieldClass}"><label class="${labelClass}" for="fStockType">Stock type</label><select class="${inputClass}" id="fStockType" onchange="document.getElementById('stockQuantityField').classList.toggle('hidden', this.value === 'false')"><option value="true" ${stockTracked ? 'selected' : ''}>Stock item</option><option value="false" ${stockTracked ? '' : 'selected'}>Non-stock item</option></select></div>
 <div class="${fieldClass} ${stockTracked ? '' : 'hidden'}" id="stockQuantityField"><label class="${labelClass}" for="fStock">Stock quantity</label><input class="${inputClass}" id="fStock" type="number" min="0" value="${stockTracked ? product?.stock || 0 : 0}"></div></div>
 <div class="${modalActionsClass}"><button class="${buttonClass}" onclick="closeModal()">Cancel</button><button class="${buttonClass}" onclick="saveProduct('${product?.id || ''}')">Save product</button></div>`;
     document.getElementById('modal').classList.remove('hidden');
     document.getElementById('modal').classList.add('grid');
}

function saveProduct(id) {
    const name = document.getElementById('fName').value.trim();
    if (!name) return toast('Product name is required');

    const product = id ? db.products.find(item => item.id === id) : { id: nextId('P', db.products) };
    const stockTracked = document.getElementById('fStockType').value === 'true';
    product.name = name;
    product.category = document.getElementById('fCategory').value;
    product.price = Number(document.getElementById('fPrice').value || 0);
    product.stockTracked = stockTracked;
    product.stock = stockTracked ? Number(document.getElementById('fStock').value || 0) : 0;
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

async function deleteProduct(id) {
    if (await confirmAction({ title: 'Delete this product?', message: 'This product will be removed from your local inventory.', confirmLabel: 'Delete product', destructive: true })) {
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

    document.getElementById('customersTable').innerHTML = `<thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Actions</th></tr></thead><tbody>${customers.map(customer => `<tr><td>${customer.id}</td><td>${esc(customer.name)}</td><td>${esc(customer.phone)}</td><td>${esc(customer.email)}</td><td><button class="${smallButtonClass}" onclick="editCustomer('${customer.id}')">Edit</button> ${customer.id !== 'C001' ? `<button class="${smallButtonClass}" onclick="deleteCustomer('${customer.id}')">Delete</button>` : ''}</td></tr>`).join('')}</tbody>`;
}

function openCustomerModal(customer = null) {
     document.getElementById('modalBox').innerHTML = `<h2 class="mb-4 text-base font-semibold">${customer ? 'Edit' : 'Add'} customer</h2><div class="${formGridClass}">
 <div class="${fieldClass} col-span-2 max-[700px]:col-span-1"><label class="${labelClass}">Name</label><input class="${inputClass}" id="cName" value="${esc(customer?.name || '')}"></div><div class="${fieldClass}"><label class="${labelClass}">Phone</label><input class="${inputClass}" id="cPhone" value="${esc(customer?.phone || '')}"></div><div class="${fieldClass}"><label class="${labelClass}">Email</label><input class="${inputClass}" id="cEmail" value="${esc(customer?.email || '')}"></div></div>
 <div class="${modalActionsClass}"><button class="${buttonClass}" onclick="closeModal()">Cancel</button><button class="${buttonClass}" onclick="saveCustomer('${customer?.id || ''}')">Save customer</button></div>`;
     document.getElementById('modal').classList.remove('hidden');
     document.getElementById('modal').classList.add('grid');
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

async function deleteCustomer(id) {
    if (await confirmAction({ title: 'Delete this customer?', message: 'This customer will be removed from the local customer list.', confirmLabel: 'Delete customer', destructive: true })) {
        db.customers = db.customers.filter(customer => customer.id !== id);
        saveDB();
        renderCustomers();
        renderPOS();
        toast('Customer deleted');
    }
}

function renderExpenses() {
    document.getElementById('expensesTable').innerHTML = `<thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Actions</th></tr></thead><tbody>${db.expenses.slice().reverse().map(expense => `<tr><td>${dateOnly(expense.date)}</td><td>${esc(expense.description)}</td><td>${esc(expense.category)}</td><td>${money(expense.amount)}</td><td><button class="${smallButtonClass}" onclick="deleteExpense('${expense.id}')">Delete</button></td></tr>`).join('') || `<tr><td colspan="5" class="${emptyClass}">No expenses recorded.</td></tr>`}</tbody>`;
}

function openExpenseModal() {
    document.getElementById('modalBox').innerHTML = `<h2 class="mb-4 text-base font-semibold">Add expense</h2><div class="${formGridClass}"><div class="${fieldClass} col-span-2 max-[700px]:col-span-1"><label class="${labelClass}">Description</label><input class="${inputClass}" id="eDesc"></div><div class="${fieldClass}"><label class="${labelClass}">Category</label><input class="${inputClass}" id="eCat" placeholder="e.g. Supplies"></div><div class="${fieldClass}"><label class="${labelClass}">Amount</label><input class="${inputClass}" id="eAmt" type="number" min="0"></div></div><div class="${modalActionsClass}"><button class="${buttonClass}" onclick="closeModal()">Cancel</button><button class="${buttonClass}" onclick="saveExpense()">Save expense</button></div>`;
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('grid');
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

async function deleteExpense(id) {
    if (await confirmAction({ title: 'Delete this expense?', message: 'This expense will be removed from local reports.', confirmLabel: 'Delete expense', destructive: true })) {
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
    document.getElementById('reportTable').innerHTML = `<thead><tr><th>Receipt</th><th>Date</th><th>Customer</th><th>Payment</th><th class="text-right">Total</th><th>Action</th></tr></thead><tbody>${sales.slice().reverse().map(sale => `<tr><td>${sale.receiptNo}</td><td>${new Date(sale.date).toLocaleString()}</td><td>${esc(sale.customerName)}</td><td>${esc(sale.payment)}</td><td class="text-right">${money(sale.total)}</td><td><button class="${smallButtonClass}" onclick="printReceiptById('${sale.id}')">Print</button></td></tr>`).join('') || `<tr><td colspan="6" class="${emptyClass}">No sales for this period.</td></tr>`}</tbody>`;
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
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('grid');
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

async function resetDemo() {
    if (await confirmAction({ title: 'Reset local demo data?', message: 'This erases locally stored sales, products, customers, and expenses, then restores demo values.', confirmLabel: 'Reset demo data', destructive: true })) {
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
renderShift();

Object.assign(window, {
    addToCart, clearCart, closeModal, completeSale, deleteCustomer, deleteExpense,
    deleteProduct, editCustomer, editProduct, exportCustomers, exportProducts,
    exportSales, openCustomerModal, openExpenseModal, openProductModal,
    printReceiptById, removeCart, renderCart, renderCustomers, renderInventory,
    renderPOS, renderProducts, renderReports, resetDemo, saveCustomer, saveExpense,
    closeShift, openShift, saveProduct, saveSale, saveSettings, setQty, showPage
});

return () => clearInterval(clockTimer);
}