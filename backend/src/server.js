import { createServer } from 'node:http';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const port = Number(process.env.PORT || 3000);
const dataFile = process.env.DATA_FILE || '/app/data/database.json';
const seededAdmin = {
  email: 'imoka@technology.com',
  password: 'Sautimoja2627',
  firstName: 'Imoka',
  lastName: 'Administrator'
};
const sessions = new Map();
let store;
let writes = Promise.resolve();

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function passwordMatches(password, user) {
  const actual = Buffer.from(hashPassword(password, user.passwordSalt).hash, 'hex');
  const expected = Buffer.from(user.passwordHash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

async function persist() {
  writes = writes.then(async () => {
    await mkdir(dirname(dataFile), { recursive: true });
    const temporaryFile = `${dataFile}.tmp`;
    await writeFile(temporaryFile, JSON.stringify(store, null, 2), { mode: 0o600 });
    await rename(temporaryFile, dataFile);
  });
  return writes;
}

async function loadStore() {
  try {
    store = JSON.parse(await readFile(dataFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    store = { users: [], sales: [], shifts: [], products: [] };
  }
  if (!Array.isArray(store.products)) {
    store.products = [
      { id: 'P001', name: 'A4 Black & White Printing', price: 500, stock: 100, stockTracked: true, category: 'Printing' },
      { id: 'P002', name: 'A4 Colour Printing', price: 1000, stock: 100, stockTracked: true, category: 'Printing' },
      { id: 'P003', name: 'A3 Colour Printing', price: 2500, stock: 50, stockTracked: true, category: 'Printing' },
      { id: 'P004', name: 'Photocopy A4', price: 300, stock: 200, stockTracked: true, category: 'Printing' },
      { id: 'P005', name: 'Business Card Design', price: 15000, stock: 20, stockTracked: true, category: 'Graphics' },
      { id: 'P006', name: 'Lamination A4', price: 2000, stock: 60, stockTracked: true, category: 'Printing' }
    ];
    await persist();
  }

  if (!store.users.some(user => user.email === seededAdmin.email)) {
    const credentials = hashPassword(seededAdmin.password);
    store.users.push({
      id: randomUUID(),
      firstName: seededAdmin.firstName,
      lastName: seededAdmin.lastName,
      email: seededAdmin.email,
      role: 'admin',
      passwordSalt: credentials.salt,
      passwordHash: credentials.hash,
      createdAt: new Date().toISOString()
    });
    await persist();
  }
}

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 1_000_000) throw new Error('Request body is too large.');
  }
  return body ? JSON.parse(body) : {};
}

function getSession(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  const session = token && sessions.get(token);
  return session ? { ...session, token, user: store.users.find(user => user.id === session.userId) } : null;
}

function requireAdmin(session, response) {
  if (!session || session.user?.role !== 'admin') {
    send(response, session ? 403 : 401, { error: session ? 'Administrator access required.' : 'Please sign in.' });
    return false;
  }
  return true;
}

function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

async function handle(request, response) {
  const url = new URL(request.url, 'http://localhost');
  const session = getSession(request);

  if (request.method === 'GET' && url.pathname === '/api/health') {
    send(response, 200, { status: 'ok', service: 'imoka-pos-api' });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/shifts/close') {
    if (!session?.user || session.user.role !== 'cashier') return send(response, 403, { error: 'Cashier access required.' });
    const shift = session.shiftId && store.shifts.find(record => record.id === session.shiftId && !record.closedAt);
    if (!shift) return send(response, 409, { error: 'There is no open shift to close.' });
    shift.closedAt = new Date().toISOString();
    shift.collected = store.sales.filter(sale => sale.shiftId === shift.id).reduce((total, sale) => total + sale.total, 0);
    sessions.set(session.token, { userId: session.user.id, shiftId: null });
    await persist();
    send(response, 200, { shift });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/products') {
    if (!session?.user) return send(response, 401, { error: 'Please sign in.' });
    send(response, 200, { products: store.products });
    return;
  }

  if (url.pathname.startsWith('/api/admin/products')) {
    if (!requireAdmin(session, response)) return;

    if (request.method === 'GET' && url.pathname === '/api/admin/products') {
      send(response, 200, { products: store.products });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/products') {
      const body = await readBody(request);
      const product = validateProduct(body);
      if (!product) return send(response, 400, { error: 'Enter a product name, supported category, valid price and valid stock amount.' });
      const id = `P${String(Math.max(0, ...store.products.map(item => Number(String(item.id).replace(/\D/g, '')) || 0)) + 1).padStart(3, '0')}`;
      const created = { id, ...product };
      store.products.push(created);
      await persist();
      send(response, 201, { product: created });
      return;
    }

    const productId = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/)?.[1];
    if (productId && request.method === 'PUT') {
      const existing = store.products.find(item => item.id === productId);
      if (!existing) return send(response, 404, { error: 'Product not found.' });
      const product = validateProduct(await readBody(request));
      if (!product) return send(response, 400, { error: 'Enter a product name, supported category, valid price and valid stock amount.' });
      Object.assign(existing, product);
      await persist();
      send(response, 200, { product: existing });
      return;
    }

    if (productId && request.method === 'DELETE') {
      const productIndex = store.products.findIndex(item => item.id === productId);
      if (productIndex < 0) return send(response, 404, { error: 'Product not found.' });
      store.products.splice(productIndex, 1);
      await persist();
      send(response, 200, { ok: true });
      return;
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(request);
    const email = String(body.email ?? body.username ?? '').trim().toLowerCase();
    const user = store.users.find(record => record.email === email);
    if (!user || typeof body.password !== 'string' || !passwordMatches(body.password, user)) {
      send(response, 401, { error: 'The email or password is incorrect.' });
      return;
    }

    const token = randomBytes(32).toString('hex');
    const shift = user.role === 'cashier' ? store.shifts.find(record => record.userId === user.id && !record.closedAt) : null;
    sessions.set(token, { userId: user.id, shiftId: shift?.id || null });
    send(response, 200, { token, user: publicUser(user) });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    if (!session?.user) return send(response, 401, { error: 'Please sign in.' });
    send(response, 200, { user: publicUser(session.user) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    if (session?.shiftId) {
      const shift = store.shifts.find(record => record.id === session.shiftId && !record.closedAt);
      if (shift) {
        shift.closedAt = new Date().toISOString();
        shift.collected = store.sales.filter(sale => sale.shiftId === shift.id).reduce((total, sale) => total + sale.total, 0);
        await persist();
      }
    }
    if (session) sessions.delete(session.token);
    send(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/shifts/current') {
    if (!session?.user || session.user.role !== 'cashier') return send(response, 403, { error: 'Cashier access required.' });
    const shift = session.shiftId && store.shifts.find(record => record.id === session.shiftId && !record.closedAt);
    send(response, 200, { shift: shift ? {
      ...shift,
      collected: store.sales.filter(sale => sale.shiftId === shift.id).reduce((total, sale) => total + sale.total, 0)
    } : null });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/shifts/open') {
    if (!session?.user || session.user.role !== 'cashier') return send(response, 403, { error: 'Cashier access required.' });
    const existing = store.shifts.find(record => record.userId === session.user.id && !record.closedAt);
    if (existing) {
      sessions.set(session.token, { userId: session.user.id, shiftId: existing.id });
      return send(response, 200, { shift: existing });
    }
    const shift = {
      id: randomUUID(),
      userId: session.user.id,
      userName: `${session.user.firstName} ${session.user.lastName}`,
      openedAt: new Date().toISOString(),
      closedAt: null,
      collected: 0
    };
    store.shifts.push(shift);
    sessions.set(session.token, { userId: session.user.id, shiftId: shift.id });
    await persist();
    send(response, 201, { shift });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/sales') {
    if (!session?.user || !['cashier', 'admin'].includes(session.user.role)) return send(response, 401, { error: 'Please sign in.' });
    if (session.user.role === 'cashier' && (!session.shiftId || !store.shifts.some(shift => shift.id === session.shiftId && !shift.closedAt))) {
      return send(response, 409, { error: 'Open a shift before recording sales.' });
    }
    const body = await readBody(request);
    const total = Number(body.total);
    if (!Number.isFinite(total) || total < 0 || typeof body.date !== 'string' || typeof body.receiptNo !== 'string') {
      return send(response, 400, { error: 'Sale data is invalid.' });
    }
    const saleId = `${session.user.id}:${String(body.id || randomUUID())}`;
    if (store.sales.some(sale => sale.id === saleId)) return send(response, 200, { ok: true, duplicate: true });
    if (!Array.isArray(body.items) || body.items.length === 0) return send(response, 400, { error: 'A sale must contain at least one item.' });
    const soldItems = [];
    for (const item of body.items) {
      const product = store.products.find(record => record.id === String(item.id));
      const quantity = Number(item.qty);
      if (!product || !Number.isInteger(quantity) || quantity < 1) return send(response, 400, { error: 'A sale contains an invalid product or quantity.' });
      if (product.stockTracked !== false && quantity > product.stock) return send(response, 409, { error: `${product.name} does not have enough stock.` });
      soldItems.push({ product, quantity });
    }
    for (const { product, quantity } of soldItems) {
      if (product.stockTracked !== false) product.stock = Math.max(0, product.stock - quantity);
    }
    store.sales.push({
      id: saleId,
      receiptNo: body.receiptNo.slice(0, 80),
      date: body.date,
      customerName: String(body.customerName || '').slice(0, 160),
      payment: String(body.payment || '').slice(0, 40),
      total,
      shiftId: session.shiftId
    });
    await persist();
    send(response, 201, { ok: true });
    return;
  }

  if (url.pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(session, response)) return;

    if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') {
      const today = new Date().toISOString().slice(0, 10);
      const todaySales = store.sales.filter(sale => sale.date.slice(0, 10) === today);
      send(response, 200, {
        totalUsers: store.users.length,
        salesToday: todaySales.reduce((total, sale) => total + sale.total, 0),
        transactionsToday: todaySales.length,
        openShifts: store.shifts.filter(shift => !shift.closedAt).length
      });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/users') {
      const search = (url.searchParams.get('search') || '').trim().toLowerCase();
      const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const filtered = store.users
        .filter(user => `${user.firstName} ${user.lastName} ${user.email} ${user.role}`.toLowerCase().includes(search))
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
      const perPage = 15;
      const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
      const safePage = Math.min(page, pageCount);
      send(response, 200, { users: filtered.slice((safePage - 1) * perPage, safePage * perPage).map(publicUser), page: safePage, pageCount, total: filtered.length });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/users') {
      const body = await readBody(request);
      const firstName = String(body.firstName || '').trim();
      const lastName = String(body.lastName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      if (firstName.length < 1 || firstName.length > 80 || lastName.length < 1 || lastName.length > 80 || !validEmail(email)) {
        return send(response, 400, { error: 'Enter a valid first name, last name and email address.' });
      }
      if (store.users.some(user => user.email === email)) return send(response, 409, { error: 'A user with this email already exists.' });
      const password = lastName.toLocaleUpperCase();
      const credentials = hashPassword(password);
      const user = {
        id: randomUUID(), firstName, lastName, email, role: 'cashier',
        passwordSalt: credentials.salt, passwordHash: credentials.hash, createdAt: new Date().toISOString()
      };
      store.users.push(user);
      await persist();
      send(response, 201, { user: publicUser(user), initialPassword: password });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/shifts') {
      const shifts = store.shifts.map(shift => ({
        ...shift,
        collected: store.sales.filter(sale => sale.shiftId === shift.id).reduce((total, sale) => total + sale.total, 0)
      })).sort((left, right) => right.openedAt.localeCompare(left.openedAt));
      send(response, 200, { shifts });
      return;
    }
  }

  send(response, 404, { error: 'Route not found.' });
}

function validateProduct(body) {
  const categories = ['Printing', 'Branding', 'Stationary', 'Internet', 'Graphics'];
  const name = String(body.name || '').trim();
  const category = String(body.category || '');
  const price = Number(body.price);
  const stockTracked = body.stockTracked !== false;
  const stock = stockTracked ? Number(body.stock) : 0;
  if (!name || name.length > 160 || !categories.includes(category) || !Number.isFinite(price) || price < 0 || !Number.isFinite(stock) || stock < 0) return null;
  return { name, category, price, stockTracked, stock };
}

const server = createServer(async (request, response) => {
  try {
    await handle(request, response);
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : error.message === 'Request body is too large.' ? 413 : 500;
    send(response, status, { error: status === 500 ? 'An internal server error occurred.' : error.message });
    if (status === 500) console.error(error);
  }
});

loadStore().then(() => {
  server.listen(port, '0.0.0.0', () => {
    console.log(`Imoka POS API listening on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to initialize API data store.', error);
  process.exitCode = 1;
});
