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
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt
  };
}

function audit(session, action, entity, entityId = null, details = {}) {
  store.audit.push({
    id: randomUUID(),
    actorId: session?.user?.id || null,
    actorName: session?.user ? `${session.user.firstName} ${session.user.lastName}` : 'System',
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString()
  });
  if (store.audit.length > 5000) store.audit.splice(0, store.audit.length - 5000);
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
    store = { users: [], sales: [], shifts: [], products: [], audit: [] };
  }
  if (!Array.isArray(store.audit)) store.audit = [];
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
      mustChangePassword: false,
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
    if (body.length > 10_000_000) throw new Error('Request body is too large.');
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

  if (session?.user?.mustChangePassword && ![
    '/api/auth/session',
    '/api/auth/change-password',
    '/api/auth/logout'
  ].includes(url.pathname)) {
    send(response, 428, { error: 'Change your temporary password before continuing.' });
    return;
  }

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
    audit(session, 'shift.closed', 'shift', shift.id, { collected: shift.collected });
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
      audit(session, 'product.created', 'product', created.id, { name: created.name });
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
      audit(session, 'product.updated', 'product', existing.id, { name: existing.name });
      await persist();
      send(response, 200, { product: existing });
      return;
    }

    if (productId && request.method === 'DELETE') {
      const productIndex = store.products.findIndex(item => item.id === productId);
      if (productIndex < 0) return send(response, 404, { error: 'Product not found.' });
      audit(session, 'product.deleted', 'product', productId, { name: store.products[productIndex].name });
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
    audit({ user }, 'auth.login', 'user', user.id);
    await persist();
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
        audit(session, 'shift.closed', 'shift', shift.id, { collected: shift.collected, reason: 'logout' });
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
    audit(session, 'shift.opened', 'shift', shift.id);
    await persist();
    send(response, 201, { shift });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/change-password') {
    if (!session?.user) return send(response, 401, { error: 'Please sign in.' });
    const body = await readBody(request);
    const password = body.newPassword;
    if (typeof body.currentPassword !== 'string' || !passwordMatches(body.currentPassword, session.user)) {
      return send(response, 400, { error: 'Your current password is incorrect.' });
    }
    if (typeof password !== 'string' || password.length < 10 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return send(response, 400, { error: 'Use 10-128 characters with uppercase, lowercase and a number.' });
    }
    const credentials = hashPassword(password);
    session.user.passwordSalt = credentials.salt;
    session.user.passwordHash = credentials.hash;
    session.user.mustChangePassword = false;
    audit(session, 'user.password_changed', 'user', session.user.id);
    await persist();
    send(response, 200, { user: publicUser(session.user) });
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
    audit(session, 'sale.completed', 'sale', saleId, { receiptNo: body.receiptNo.slice(0, 80), total });
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
        passwordSalt: credentials.salt, passwordHash: credentials.hash, mustChangePassword: true, createdAt: new Date().toISOString()
      };
      store.users.push(user);
      audit(session, 'user.created', 'user', user.id, { email: user.email, role: user.role });
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

    if (request.method === 'GET' && url.pathname === '/api/admin/audit') {
      const limit = Math.min(200, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '100', 10) || 100));
      send(response, 200, { events: store.audit.slice(-limit).reverse() });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/backup') {
      audit(session, 'backup.exported', 'database');
      await persist();
      send(response, 200, { format: 'imoka-backup-v1', exportedAt: new Date().toISOString(), data: store });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/backup/restore') {
      const body = await readBody(request);
      const backup = body?.data;
      if (body?.format !== 'imoka-backup-v1' || !backup || !Array.isArray(backup.users) || !Array.isArray(backup.sales) || !Array.isArray(backup.shifts) || !Array.isArray(backup.products)) {
        return send(response, 400, { error: 'This backup file is not a valid Imoka backup.' });
      }
      if (!backup.users.some(record => record.email === seededAdmin.email && record.role === 'admin')) {
        return send(response, 400, { error: 'Backup must contain the seeded administrator account.' });
      }
      store = {
        users: backup.users,
        sales: backup.sales,
        shifts: backup.shifts,
        products: backup.products,
        audit: Array.isArray(backup.audit) ? backup.audit : []
      };
      audit(session, 'backup.restored', 'database', null, { exportedAt: body.exportedAt || null });
      await persist();
      sessions.clear();
      send(response, 200, { ok: true, restoredAt: new Date().toISOString() });
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
