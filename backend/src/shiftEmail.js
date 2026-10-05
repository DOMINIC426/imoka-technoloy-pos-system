import nodemailer from 'nodemailer';

const timezone = 'Africa/Dar_es_Salaam';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function formatTime(value) {
  return new Intl.DateTimeFormat('en-TZ', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function formatMoney(value) {
  return `TZS ${Number(value || 0).toLocaleString('en-TZ', { maximumFractionDigits: 2 })}`;
}

function metric(label, value) {
  return `<tr><td style="padding:13px 0;border-bottom:1px solid #e5e7eb;color:#667085;font-size:13px">${escapeHtml(label)}</td><td style="padding:13px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;font-weight:700;text-align:right">${escapeHtml(value)}</td></tr>`;
}

export async function sendShiftEmail({ type, cashierName, shiftId, openedAt, closedAt, shiftSales, shiftTransactions, dailySales, dailyTransactions, inStockProducts, trackedProducts, stockAvailabilityPercent }) {
  const user = process.env.SMTP_USER;
  const appPassword = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, '');
  if (!user || !appPassword) return false;

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
    auth: { user, pass: appPassword },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000
  });

  const opened = formatTime(openedAt);
  const closed = closedAt ? formatTime(closedAt) : null;
  const opening = type === 'opened';
  const subject = opening
    ? `Shift opened: ${cashierName}`
    : `Shift closed: ${cashierName} - ${formatMoney(shiftSales)}`;
  const title = opening ? 'Cashier shift opened' : 'Cashier shift closed';
  const subtitle = opening
    ? 'A new cashier session is now active.'
    : 'The cashier session has been closed. Here is the shift and daily summary.';
  const rows = opening
    ? [
        ['Cashier', cashierName],
        ['Shift reference', shiftId],
        ['Opened at', opened],
        ['Products currently in stock', `${inStockProducts} of ${trackedProducts} tracked products (${stockAvailabilityPercent}%)`]
      ]
    : [
        ['Cashier', cashierName],
        ['Shift reference', shiftId],
        ['Shift opened', opened],
        ['Shift closed', closed],
        ['Sales during this shift', formatMoney(shiftSales)],
        ['Transactions during this shift', shiftTransactions],
        ['Total sales today', formatMoney(dailySales)],
        ['Transactions today', dailyTransactions],
        ['Products currently in stock', `${inStockProducts} of ${trackedProducts} tracked products (${stockAvailabilityPercent}%)`]
      ];
  const textRows = rows.map(([label, value]) => `${label}: ${value}`).join('\n');
  const htmlRows = rows.map(([label, value]) => metric(label, value)).join('');
  const stockNote = 'Stock availability is the percentage of active, stock-tracked products with quantity above zero. It is not a unit-level inventory estimate.';
  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827"><table role="presentation" style="width:100%;max-width:600px;margin:0 auto;border-collapse:collapse;background:#fff"><tr><td style="padding:24px 28px;background:#111827;color:#fff"><div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#93c5fd">IMOKA TECHNOLOGY</div><h1 style="margin:14px 0 6px;font-size:24px;line-height:1.2">${title}</h1><p style="margin:0;color:#d1d5db;font-size:14px">${subtitle}</p></td></tr><tr><td style="padding:20px 28px 10px"><p style="margin:0 0 10px;color:#475569;font-size:14px">Hello,</p><p style="margin:0;color:#475569;font-size:14px;line-height:1.6">${opening ? 'A cashier has opened a shift in the Imoka POS.' : 'The shift has been closed and the latest sales and stock summary is below.'}</p><table role="presentation" style="width:100%;margin-top:14px;border-collapse:collapse">${htmlRows}</table><p style="margin:18px 0 0;color:#6b7280;font-size:11px;line-height:1.5">${stockNote}</p></td></tr><tr><td style="padding:16px 28px;border-top:1px solid #e5e7eb;color:#6b7280;font-size:11px">Automated shift notification · Imoka Co Ltd</td></tr></table></body></html>`;
  const text = `${title}\n\n${subtitle}\n\n${textRows}\n\n${stockNote}\n\nAutomated shift notification - Imoka Co Ltd`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `Imoka Co Ltd <${user}>`,
    to: process.env.SHIFT_EMAIL_TO || user,
    subject,
    text,
    html
  });
  return true;
}
