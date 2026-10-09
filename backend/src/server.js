import { createServer } from 'node:http';
import { createHash, randomBytes, randomInt, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { Prisma, PrismaClient } from '@prisma/client';
import { sendPasswordResetEmail, sendShiftEmail } from './shiftEmail.js';

const prisma = new PrismaClient();
const port = Number(process.env.PORT || 3000);
const sessionLifetimeMs = 1000 * 60 * 60 * 24 * 14;
const passwordResetCodeLifetimeMs = 10 * 60 * 1000;
const passwordResetRequestLimit = 3;
const passwordResetAttemptLimit = 5;
const genericResetRequestMessage = 'If an account with that email exists, a verification code has been sent.';
const genericResetError = 'The email or verification code is invalid or expired. Request a new code.';
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map(origin => origin.trim()).filter(Boolean);
const seededAdmin = {
  email: 'imoka@technology.com',
  password: process.env.ADMIN_INITIAL_PASSWORD,
  firstName: 'Imoka',
  lastName: 'Administrator'
};

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return { salt, hash: scryptSync(password, salt, 64).toString('hex') };
}

function passwordMatches(password, user) {
  if (!user?.passwordSalt || !user?.passwordHash) return false;
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

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

function send(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function setCors(request, response) {
  const origin = request.headers.origin;
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    return true;
  }
  return false;
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 10_000_000) throw new Error('Request body is too large.');
  }
  return body ? JSON.parse(body) : {};
}

function validEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateProduct(body) {
  const categories = ['Printing', 'Branding', 'Stationary', 'Internet', 'Graphics'];
  const name = String(body.name || '').trim();
  const category = String(body.category || '');
  const price = Number(body.price);
  const stockTracked = body.stockTracked !== false;
  const stock = stockTracked ? Number(body.stock) : 0;
  if (!name || name.length > 160 || !categories.includes(category) || !Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) return null;
  return { name, category, price: new Prisma.Decimal(price), stockTracked, stock };
}

async function getSession(request) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true, shift: true }
  });
  if (!session) return null;
  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return { ...session, token };
}

async function addAudit(session, action, entity, entityId = null, details = {}) {
  await prisma.auditEvent.create({
    data: {
      actorId: session?.user?.id || null,
      actorName: session?.user ? `${session.user.firstName} ${session.user.lastName}` : 'System',
      action,
      entity,
      entityId,
      details
    }
  });
}

function darEsSalaamDayBounds(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Dar_es_Salaam',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const dateParts = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const localMidnightUtc = Date.UTC(Number(dateParts.year), Number(dateParts.month) - 1, Number(dateParts.day)) - 3 * 60 * 60 * 1000;
  return { start: new Date(localMidnightUtc), end: new Date(localMidnightUtc + 24 * 60 * 60 * 1000) };
}

async function getStockAvailability() {
  const where = { active: true, stockTracked: true };
  const [trackedProducts, inStockProducts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.count({ where: { ...where, stock: { gt: 0 } } })
  ]);
  return {
    trackedProducts,
    inStockProducts,
    stockAvailabilityPercent: trackedProducts ? Math.round(inStockProducts / trackedProducts * 100) : 0
  };
}

async function notifyShiftEmail(details) {
  try {
    const sent = await sendShiftEmail(details);
    if (!sent) console.warn('Shift notification email was skipped because SMTP credentials are not configured.');
  } catch (error) {
    console.error('Shift notification email failed:', error.message);
  }
}

function requireAdmin(session, response) {
  if (!session || session.user.role !== 'admin') {
    send(response, session ? 403 : 401, { error: session ? 'Administrator access required.' : 'Please sign in.' });
    return false;
  }
  return true;
}

async function ensureInitialData() {
  if (!seededAdmin.password) {
    console.warn('ADMIN_INITIAL_PASSWORD is not configured; seeded admin login is disabled.');
  } else {
    const credentials = hashPassword(seededAdmin.password);
    await prisma.user.upsert({
      where: { email: seededAdmin.email },
      update: {},
      create: {
        firstName: seededAdmin.firstName,
        lastName: seededAdmin.lastName,
        email: seededAdmin.email,
        role: 'admin',
        passwordSalt: credentials.salt,
        passwordHash: credentials.hash,
        mustChangePassword: false
      }
    });
  }

}

async function handle(request, response) {
  const url = new URL(request.url, 'http://localhost');
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    setCors(request, response);
    response.writeHead(204);
    response.end();
    return;
  }
  
  // Set CORS headers for all requests
  setCors(request, response);
  
  const session = await getSession(request);

  if (session?.user.mustChangePassword && ![
    '/api/auth/session',
    '/api/auth/change-password',
    '/api/auth/logout',
    '/api/auth/password-reset/request',
    '/api/auth/password-reset/complete'
  ].includes(url.pathname)) {
    send(response, 428, { error: 'Change your temporary password before continuing.' });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/health') {
    send(response, 200, { status: 'ok', service: 'imoka-pos-api', database: 'connected' });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/password-reset/request') {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    if (validEmail(email) && email.length <= 254) {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        const now = new Date();
        const recentRequests = await prisma.passwordResetCode.count({
          where: { userId: user.id, createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) } }
        });
        if (recentRequests < passwordResetRequestLimit) {
          await prisma.passwordResetCode.updateMany({
            where: { userId: user.id, consumedAt: null },
            data: { consumedAt: now }
          });
          const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
          const credentials = hashPassword(code);
          const resetCode = await prisma.passwordResetCode.create({
            data: {
              userId: user.id,
              codeSalt: credentials.salt,
              codeHash: credentials.hash,
              expiresAt: new Date(now.getTime() + passwordResetCodeLifetimeMs)
            }
          });
          try {
            const sent = await sendPasswordResetEmail({ email: user.email, code });
            if (!sent) {
              await prisma.passwordResetCode.delete({ where: { id: resetCode.id } });
              console.warn('Password reset email was skipped because SMTP credentials are not configured.');
            }
          } catch (mailError) {
            await prisma.passwordResetCode.delete({ where: { id: resetCode.id } });
            console.error('Password reset email failed:', mailError.message);
          }
        }
      }
    }
    send(response, 200, { message: genericResetRequestMessage });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/password-reset/complete') {
    const body = await readBody(request);
    const email = String(body.email || '').trim().toLowerCase();
    const code = String(body.code || '').trim();
    const password = body.newPassword;
    if (typeof password !== 'string' || password.length < 10 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return send(response, 400, { error: 'Use 10-128 characters with uppercase, lowercase and a number.' });
    }
    if (!validEmail(email) || email.length > 254 || !/^\d{6}$/.test(code)) {
      return send(response, 400, { error: genericResetError });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return send(response, 400, { error: genericResetError });
    const now = new Date();
    const resetCode = await prisma.passwordResetCode.findFirst({
      where: {
        userId: user.id,
        consumedAt: null,
        expiresAt: { gt: now },
        attempts: { lt: passwordResetAttemptLimit }
      },
      orderBy: { createdAt: 'desc' }
    });
    if (!resetCode) return send(response, 400, { error: genericResetError });

    const suppliedHash = Buffer.from(hashPassword(code, resetCode.codeSalt).hash, 'hex');
    const expectedHash = Buffer.from(resetCode.codeHash, 'hex');
    if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
      await prisma.passwordResetCode.updateMany({
        where: { id: resetCode.id, consumedAt: null, attempts: { lt: passwordResetAttemptLimit } },
        data: { attempts: { increment: 1 } }
      });
      return send(response, 400, { error: genericResetError });
    }

    const credentials = hashPassword(password);
    const completed = await prisma.$transaction(async transaction => {
      const consumed = await transaction.passwordResetCode.updateMany({
        where: {
          id: resetCode.id,
          consumedAt: null,
          expiresAt: { gt: now },
          attempts: { lt: passwordResetAttemptLimit }
        },
        data: { consumedAt: now }
      });
      if (consumed.count !== 1) return false;

      await transaction.user.update({
        where: { id: user.id },
        data: { passwordSalt: credentials.salt, passwordHash: credentials.hash, mustChangePassword: false }
      });
      await transaction.passwordResetCode.updateMany({
        where: { userId: user.id, id: { not: resetCode.id }, consumedAt: null },
        data: { consumedAt: now }
      });
      await transaction.session.deleteMany({ where: { userId: user.id } });
      return true;
    });
    if (!completed) return send(response, 400, { error: genericResetError });

    try {
      await addAudit(null, 'auth.password_reset', 'user', user.id);
    } catch (auditError) {
      console.error('Password reset audit event failed:', auditError.message);
    }
    send(response, 200, { ok: true, message: 'Password reset successfully. Sign in with your new password.' });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const body = await readBody(request);
    const email = String(body.email ?? body.username ?? '').trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || typeof body.password !== 'string' || !passwordMatches(body.password, user)) {
      send(response, 401, { error: 'The email or password is incorrect.' });
      return;
    }

    const activeShift = user.role === 'cashier' ? await prisma.shift.findFirst({ where: { userId: user.id, closedAt: null }, orderBy: { openedAt: 'desc' } }) : null;
    const token = randomBytes(32).toString('hex');
    await prisma.session.create({
      data: {
        tokenHash: hashToken(token),
        userId: user.id,
        shiftId: activeShift?.id || null,
        expiresAt: new Date(Date.now() + sessionLifetimeMs)
      }
    });
    await addAudit({ user }, 'auth.login', 'user', user.id);
    send(response, 200, { token, user: publicUser(user) });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/auth/session') {
    if (!session?.user) return send(response, 401, { error: 'Please sign in.' });
    if (session.user.role === 'cashier' && session.shiftId) {
      const openShift = await prisma.shift.findFirst({ where: { id: session.shiftId, userId: session.userId, closedAt: null } });
      if (!openShift) await prisma.session.update({ where: { id: session.id }, data: { shiftId: null } });
    }
    send(response, 200, { user: publicUser(session.user) });
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
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordSalt: credentials.salt, passwordHash: credentials.hash, mustChangePassword: false }
    });
    await addAudit(session, 'user.password_changed', 'user', updated.id);
    send(response, 200, { user: publicUser(updated) });
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
    if (session) {
      await addAudit(session, 'auth.logout', 'user', session.userId);
      await prisma.session.delete({ where: { id: session.id } });
    }
    send(response, 200, { ok: true });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/products') {
    if (!session?.user) return send(response, 401, { error: 'Please sign in.' });
    const products = await prisma.product.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    send(response, 200, { products: products.map(product => ({ ...product, price: Number(product.price) })) });
    return;
  }

  if (url.pathname.startsWith('/api/shifts/')) {
    if (!session?.user || session.user.role !== 'cashier') return send(response, 403, { error: 'Cashier access required.' });

    if (request.method === 'GET' && url.pathname === '/api/shifts/current') {
      const shift = await prisma.shift.findFirst({
        where: { userId: session.userId, closedAt: null },
        include: { sales: { select: { total: true } } },
        orderBy: { openedAt: 'desc' }
      });
      if (shift && session.shiftId !== shift.id) await prisma.session.update({ where: { id: session.id }, data: { shiftId: shift.id } });
      if (!shift && session.shiftId) await prisma.session.update({ where: { id: session.id }, data: { shiftId: null } });
      const collected = shift?.sales.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
      send(response, 200, { shift: shift ? { id: shift.id, userId: shift.userId, userName: `${session.user.firstName} ${session.user.lastName}`, openedAt: shift.openedAt, closedAt: shift.closedAt, collected } : null });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/shifts/open') {
      let existing = await prisma.shift.findFirst({ where: { userId: session.userId, closedAt: null }, orderBy: { openedAt: 'desc' } });
      let shift = existing;
      if (!shift) {
        try {
          shift = await prisma.shift.create({ data: { userId: session.userId } });
        } catch (error) {
          if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
          existing = await prisma.shift.findFirst({ where: { userId: session.userId, closedAt: null }, orderBy: { openedAt: 'desc' } });
          if (!existing) throw error;
          shift = existing;
        }
      }
      await prisma.session.update({ where: { id: session.id }, data: { shiftId: shift.id } });
      if (!existing) {
        await addAudit(session, 'shift.opened', 'shift', shift.id);
        try {
          const stock = await getStockAvailability();
          await notifyShiftEmail({
            type: 'opened',
            cashierName: `${session.user.firstName} ${session.user.lastName}`,
            shiftId: shift.id,
            openedAt: shift.openedAt,
            ...stock
          });
        } catch (error) {
          console.error('Could not prepare shift-open email:', error.message);
        }
      }
      send(response, existing ? 200 : 201, { shift: { id: shift.id, userId: shift.userId, userName: `${session.user.firstName} ${session.user.lastName}`, openedAt: shift.openedAt, closedAt: shift.closedAt, collected: 0 } });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/shifts/close') {
      if (!session.shiftId) return send(response, 409, { error: 'There is no open shift to close.' });
      const closed = await prisma.$transaction(async transaction => {
        const shift = await transaction.shift.findFirst({ where: { id: session.shiftId, userId: session.userId, closedAt: null } });
        if (!shift) return null;
        const sales = await transaction.sale.findMany({ where: { shiftId: shift.id }, select: { total: true } });
        const collected = sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const updatedShift = await transaction.shift.update({ where: { id: shift.id }, data: { closedAt: new Date() } });
        await transaction.session.updateMany({ where: { shiftId: shift.id }, data: { shiftId: null } });
        return { shift: updatedShift, collected, transactionCount: sales.length };
      });
      if (!closed) return send(response, 409, { error: 'There is no open shift to close.' });
      await addAudit(session, 'shift.closed', 'shift', closed.shift.id, { collected: closed.collected });
      try {
        const { start, end } = darEsSalaamDayBounds(closed.shift.closedAt);
        const [dailySales, dailyTransactions, stock] = await Promise.all([
          prisma.sale.aggregate({ where: { createdAt: { gte: start, lt: end } }, _sum: { total: true } }),
          prisma.sale.count({ where: { createdAt: { gte: start, lt: end } } }),
          getStockAvailability()
        ]);
        await notifyShiftEmail({
          type: 'closed',
          cashierName: `${session.user.firstName} ${session.user.lastName}`,
          shiftId: closed.shift.id,
          openedAt: closed.shift.openedAt,
          closedAt: closed.shift.closedAt,
          shiftSales: closed.collected,
          shiftTransactions: closed.transactionCount,
          dailySales: Number(dailySales._sum.total || 0),
          dailyTransactions,
          ...stock
        });
      } catch (error) {
        console.error('Could not prepare shift-close email:', error.message);
      }
      send(response, 200, { shift: { ...closed.shift, collected: closed.collected } });
      return;
    }
  }

  if (request.method === 'POST' && url.pathname === '/api/sales') {
    if (!session?.user || !['cashier', 'admin'].includes(session.user.role)) return send(response, 401, { error: 'Please sign in.' });
    if (session.user.role === 'cashier') {
      const activeShift = session.shiftId ? await prisma.shift.findFirst({ where: { id: session.shiftId, userId: session.userId, closedAt: null } }) : null;
      if (!activeShift) {
        await prisma.session.update({ where: { id: session.id }, data: { shiftId: null } });
        return send(response, 409, { error: 'Open a shift before recording sales.' });
      }
    }
    const body = await readBody(request);
    const total = Number(body.total);
    if (!Number.isFinite(total) || total < 0 || typeof body.date !== 'string' || typeof body.receiptNo !== 'string' || !Array.isArray(body.items) || !body.items.length) {
      return send(response, 400, { error: 'Sale data is invalid.' });
    }
    const clientSaleId = String(body.id || randomUUID());
    const existing = await prisma.sale.findUnique({ where: { cashierId_clientSaleId: { cashierId: session.userId, clientSaleId } } });
    if (existing) return send(response, 200, { ok: true, duplicate: true });

    try {
      const sale = await prisma.$transaction(async transaction => {
        const saleItems = [];
        for (const item of body.items) {
          const quantity = Number(item.qty);
          if (!Number.isInteger(quantity) || quantity < 1) throw new Error('A sale contains an invalid quantity.');
          const product = await transaction.product.findUnique({ where: { id: String(item.id) } });
          if (!product || !product.active) throw new Error('A sale contains an invalid product.');
          if (product.stockTracked) {
            const update = await transaction.product.updateMany({ where: { id: product.id, stock: { gte: quantity } }, data: { stock: { decrement: quantity } } });
            if (update.count !== 1) throw new Error(`${product.name} does not have enough stock.`);
          }
          saleItems.push({ productId: product.id, name: product.name, price: product.price, quantity });
        }
        const createdSale = await transaction.sale.create({
          data: {
            clientSaleId,
            receiptNo: body.receiptNo.slice(0, 80),
            cashierId: session.userId,
            shiftId: session.shiftId,
            customerName: String(body.customerName || '').slice(0, 160),
            payment: String(body.payment || '').slice(0, 40),
            subtotal: new Prisma.Decimal(Number(body.subtotal || 0)),
            discount: new Prisma.Decimal(Number(body.discount || 0)),
            tax: new Prisma.Decimal(Number(body.tax || 0)),
            total: new Prisma.Decimal(total),
            paid: new Prisma.Decimal(Number(body.paid || 0)),
            change: new Prisma.Decimal(Number(body.change || 0)),
            createdAt: new Date(body.date),
            items: { create: saleItems }
          }
        });
        const updatedProducts = await transaction.product.findMany({ where: { id: { in: saleItems.map(item => item.productId) } }, select: { id: true, stock: true, stockTracked: true } });
        return { createdSale, updatedProducts };
      });
      await addAudit(session, 'sale.completed', 'sale', sale.createdSale.id, { receiptNo: sale.createdSale.receiptNo, total: Number(sale.createdSale.total) });
      send(response, 201, { ok: true, products: sale.updatedProducts });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return send(response, 200, { ok: true, duplicate: true });
      if (error.message.includes('stock') || error.message.includes('product') || error.message.includes('quantity')) return send(response, 409, { error: error.message });
      throw error;
    }
    return;
  }

  if (url.pathname.startsWith('/api/admin/')) {
    if (!requireAdmin(session, response)) return;

    if (request.method === 'GET' && url.pathname === '/api/admin/dashboard') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const [totalUsers, sales, transactionsToday, openShifts] = await Promise.all([
        prisma.user.count(),
        prisma.sale.aggregate({ where: { createdAt: { gte: start } }, _sum: { total: true } }),
        prisma.sale.count({ where: { createdAt: { gte: start } } }),
        prisma.shift.count({ where: { closedAt: null } })
      ]);
      send(response, 200, { totalUsers, salesToday: Number(sales._sum.total || 0), transactionsToday, openShifts });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/users') {
      const search = (url.searchParams.get('search') || '').trim();
      const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const searchableFields = ['firstName', 'lastName', 'email'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } }));
      if (search.toLowerCase() === 'admin' || search.toLowerCase() === 'cashier') searchableFields.push({ role: search.toLowerCase() });
      const where = search ? { OR: searchableFields } : {};
      const perPage = 15;
      const [total, records] = await Promise.all([
        prisma.user.count({ where }),
        prisma.user.findMany({ where, orderBy: { createdAt: 'asc' }, skip: (page - 1) * perPage, take: perPage })
      ]);
      send(response, 200, { users: records.map(publicUser), page, pageCount: Math.max(1, Math.ceil(total / perPage)), total });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/users') {
      const body = await readBody(request);
      const firstName = String(body.firstName || '').trim();
      const lastName = String(body.lastName || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      if (!firstName || firstName.length > 80 || !lastName || lastName.length > 80 || !validEmail(email)) return send(response, 400, { error: 'Enter a valid first name, last name and email address.' });
      const password = lastName.toLocaleUpperCase();
      const credentials = hashPassword(password);
      try {
        const user = await prisma.user.create({ data: { firstName, lastName, email, role: 'cashier', passwordSalt: credentials.salt, passwordHash: credentials.hash, mustChangePassword: true } });
        await addAudit(session, 'user.created', 'user', user.id, { email, role: user.role });
        send(response, 201, { user: publicUser(user), initialPassword: password });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return send(response, 409, { error: 'A user with this email already exists.' });
        throw error;
      }
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/products') {
      const search = (url.searchParams.get('search') || '').trim();
      const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '10', 10) || 10));
      const searchableFields = ['name', 'category'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } }));
      const where = { active: true, ...(search ? { OR: searchableFields } : {}) };
      const [total, records] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({ where, orderBy: { name: 'asc' }, skip: (page - 1) * limit, take: limit })
      ]);
      send(response, 200, { products: records.map(product => ({ ...product, price: Number(product.price) })), page, pageCount: Math.max(1, Math.ceil(total / limit)), total });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/products') {
      const input = validateProduct(await readBody(request));
      if (!input) return send(response, 400, { error: 'Enter a product name, supported category, valid price and valid stock amount.' });
      const sku = `P-${randomUUID().slice(0, 8).toUpperCase()}`;
      const product = await prisma.product.create({ data: { ...input, sku } });
      await addAudit(session, 'product.created', 'product', product.id, { name: product.name });
      send(response, 201, { product: { ...product, price: Number(product.price) } });
      return;
    }

    const productId = url.pathname.match(/^\/api\/admin\/products\/([^/]+)$/)?.[1];
    if (productId && request.method === 'PUT') {
      const input = validateProduct(await readBody(request));
      if (!input) return send(response, 400, { error: 'Enter a product name, supported category, valid price and valid stock amount.' });
      const product = await prisma.product.update({ where: { id: productId }, data: input });
      await addAudit(session, 'product.updated', 'product', product.id, { name: product.name });
      send(response, 200, { product: { ...product, price: Number(product.price) } });
      return;
    }

    if (productId && request.method === 'DELETE') {
      const product = await prisma.product.update({ where: { id: productId }, data: { active: false } });
      await addAudit(session, 'product.archived', 'product', product.id, { name: product.name });
      send(response, 200, { ok: true });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/shifts') {
      const search = (url.searchParams.get('search') || '').trim();
      const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '10', 10) || 10));
      const where = search ? { user: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } } : {};
      const [total, records] = await Promise.all([
        prisma.shift.count({ where }),
        prisma.shift.findMany({ where, include: { user: true, sales: { select: { total: true } } }, orderBy: { openedAt: 'desc' }, skip: (page - 1) * limit, take: limit })
      ]);
      send(response, 200, { shifts: records.map(shift => ({ id: shift.id, userId: shift.userId, userName: `${shift.user.firstName} ${shift.user.lastName}`, openedAt: shift.openedAt, closedAt: shift.closedAt, collected: shift.sales.reduce((sum, sale) => sum + Number(sale.total), 0) })), page, pageCount: Math.max(1, Math.ceil(total / limit)), total });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/audit') {
      const search = (url.searchParams.get('search') || '').trim();
      const page = Math.max(1, Number.parseInt(url.searchParams.get('page') || '1', 10) || 1);
      const limit = Math.min(100, Math.max(1, Number.parseInt(url.searchParams.get('limit') || '10', 10) || 10));
      const searchableFields = ['actorName', 'action', 'entity'].map(field => ({ [field]: { contains: search, mode: 'insensitive' } }));
      const where = search ? { OR: searchableFields } : {};
      const [total, records] = await Promise.all([
        prisma.auditEvent.count({ where }),
        prisma.auditEvent.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit })
      ]);
      send(response, 200, { events: records, page, pageCount: Math.max(1, Math.ceil(total / limit)), total });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/backup') {
      await addAudit(session, 'backup.exported', 'database');
      const [users, products, shifts, sales, audit] = await Promise.all([
        prisma.user.findMany(), prisma.product.findMany(), prisma.shift.findMany(),
        prisma.sale.findMany({ include: { items: true } }), prisma.auditEvent.findMany({ orderBy: { createdAt: 'asc' } })
      ]);
      const backupData = {
        users: users.map(user => ({ ...publicUser(user), passwordSalt: user.passwordSalt, passwordHash: user.passwordHash })),
        products: products.map(product => ({ ...product, price: Number(product.price) })),
        shifts,
        sales: sales.map(sale => ({ ...sale, subtotal: Number(sale.subtotal), discount: Number(sale.discount), tax: Number(sale.tax), total: Number(sale.total), paid: Number(sale.paid), change: Number(sale.change), items: sale.items.map(item => ({ ...item, price: Number(item.price) })) })),
        audit
      };
      send(response, 200, { format: 'imoka-backup-v1', exportedAt: new Date().toISOString(), data: backupData });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/backup/restore') {
      const body = await readBody(request);
      const backup = body?.data;
      if (body?.format !== 'imoka-backup-v1' || !backup || !Array.isArray(backup.users) || !Array.isArray(backup.sales) || !Array.isArray(backup.shifts) || !Array.isArray(backup.products) || !Array.isArray(backup.audit)) {
        return send(response, 400, { error: 'This backup file is not a valid Imoka backup.' });
      }
      if (!backup.users.some(user => user.email === seededAdmin.email && user.role === 'admin')) {
        return send(response, 400, { error: 'Backup must contain the seeded administrator account.' });
      }
      try {
        await prisma.$transaction(async transaction => {
          await transaction.auditEvent.deleteMany();
          await transaction.session.deleteMany();
          await transaction.saleItem.deleteMany();
          await transaction.sale.deleteMany();
          await transaction.shift.deleteMany();
          await transaction.product.deleteMany();
          await transaction.user.deleteMany();

          if (backup.users.length) await transaction.user.createMany({ data: backup.users.map(user => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            passwordSalt: user.passwordSalt,
            passwordHash: user.passwordHash,
            mustChangePassword: Boolean(user.mustChangePassword),
            createdAt: new Date(user.createdAt)
          })) });
          if (backup.products.length) await transaction.product.createMany({ data: backup.products.map(product => ({
            id: product.id,
            sku: product.sku,
            name: product.name,
            category: product.category,
            price: new Prisma.Decimal(product.price),
            stockTracked: product.stockTracked !== false,
            stock: Number(product.stock || 0),
            active: product.active !== false,
            createdAt: new Date(product.createdAt),
            updatedAt: new Date(product.updatedAt || product.createdAt)
          })) });
          if (backup.shifts.length) await transaction.shift.createMany({ data: backup.shifts.map(shift => ({
            id: shift.id,
            userId: shift.userId,
            openedAt: new Date(shift.openedAt),
            closedAt: shift.closedAt ? new Date(shift.closedAt) : null
          })) });
          if (backup.sales.length) await transaction.sale.createMany({ data: backup.sales.map(sale => ({
            id: sale.id,
            clientSaleId: sale.clientSaleId || sale.id,
            receiptNo: sale.receiptNo,
            cashierId: sale.cashierId,
            shiftId: sale.shiftId || null,
            customerName: sale.customerName || '',
            payment: sale.payment,
            subtotal: new Prisma.Decimal(sale.subtotal || sale.total),
            discount: new Prisma.Decimal(sale.discount || 0),
            tax: new Prisma.Decimal(sale.tax || 0),
            total: new Prisma.Decimal(sale.total),
            paid: new Prisma.Decimal(sale.paid || 0),
            change: new Prisma.Decimal(sale.change || 0),
            createdAt: new Date(sale.createdAt || sale.date)
          })) });
          const saleItems = backup.sales.flatMap(sale => (sale.items || []).map(item => ({
            id: item.id || randomUUID(),
            saleId: sale.id,
            productId: item.productId || null,
            name: item.name,
            price: new Prisma.Decimal(item.price),
            quantity: Number(item.quantity)
          })));
          if (saleItems.length) await transaction.saleItem.createMany({ data: saleItems });
          if (backup.audit.length) await transaction.auditEvent.createMany({ data: backup.audit.map(event => ({
            id: event.id,
            actorId: event.actorId || null,
            actorName: event.actorName,
            action: event.action,
            entity: event.entity,
            entityId: event.entityId || null,
            details: event.details || {},
            createdAt: new Date(event.createdAt)
          })) });
        });
      } catch (restoreError) {
        if (restoreError instanceof Prisma.PrismaClientKnownRequestError && restoreError.code === 'P2002') {
          return send(response, 400, { error: 'Backup contains duplicate unique values.' });
        }
        throw restoreError;
      }
      await prisma.auditEvent.create({ data: {
        actorId: null,
        actorName: `${session.user.firstName} ${session.user.lastName}`,
        action: 'backup.restored',
        entity: 'database',
        details: { exportedAt: body.exportedAt || null }
      } });
      await prisma.session.deleteMany();
      send(response, 200, { ok: true, restoredAt: new Date().toISOString() });
      return;
    }
  }

  send(response, 404, { error: 'Route not found.' });
}

async function ensureSeedData() {
  await ensureInitialData();
}

let initialDataPromise;

export default async function handler(request, response) {
  initialDataPromise ||= ensureSeedData();
  await initialDataPromise;
  if (!setCors(request, response)) return send(response, 403, { error: 'Origin is not allowed.' });
  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }
  try {
    await handle(request, response);
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : error.message === 'Request body is too large.' ? 413 : error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025' ? 404 : 500;
    send(response, status, { error: status === 500 ? 'An internal server error occurred.' : error.message });
    if (status === 500) console.error(error);
  }
}

if (!process.env.VERCEL) {
  const server = createServer(handler);
  ensureSeedData().then(() => {
    server.listen(port, '0.0.0.0', () => console.log(`Imoka POS API listening on port ${port}`));
  }).catch(error => {
    console.error('Failed to initialize API.', error);
    process.exitCode = 1;
  });

  async function shutdown() {
    server.close();
    await prisma.$disconnect();
  }

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
