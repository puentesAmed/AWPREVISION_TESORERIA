import Cashflow from '../models/Cashflow.js';
import Category from '../models/Category.js';
import Account from '../models/Account.js';
import Counterparty from '../models/Counterparty.js';
import dayjs from 'dayjs';
import mongoose from 'mongoose';
import xlsx from 'xlsx';
import { parse as parseCsv } from 'csv-parse/sync';

const isId = v => typeof v === 'string' && mongoose.isValidObjectId(v);

// category: ObjectId → ok; texto → busca por nombre; vacío → null
const asCategoryId = async (val) => {
  if (!val) return null;
  if (mongoose.isValidObjectId(val)) return val;
  const byName = await Category.findOne({ name: new RegExp('^' + val + '$', 'i') }, { _id: 1 }).lean();
  if (!byName) throw new Error('CATEGORY_NOT_FOUND');
  return byName._id;
};

// GET /api/cashflows
export const list = async (req, res) => {
  try {
    const { from, to, account, type, category, counterparty, status } = req.query;
    const q = {};
    if (from || to) {
      q.date = {};
      if (from) q.date.$gte = new Date(from);
      if (to) q.date.$lte = new Date(to);
    }
    if (account) {
      if (!isId(account)) return res.status(400).json({ error: 'INVALID_ACCOUNT_ID' });
      q.account = account;
    }
    if (type) q.type = type;

    if (category) {
      if (isId(category)) q.category = category;
      else {
        const found = await Category.findOne({ name: new RegExp('^' + category + '$', 'i') }, { _id: 1 }).lean();
        if (!found) return res.status(400).json({ error: 'CATEGORY_NOT_FOUND' });
        q.category = found._id;
      }
    }

    if (counterparty) {
      if (!isId(counterparty)) return res.status(400).json({ error: 'INVALID_COUNTERPARTY_ID' });
      q.counterparty = counterparty;
    }
    if (status) q.status = status;

    const docs = await Cashflow.find(q)
      .populate('account counterparty category')
      .sort({ date: 1 })
      .lean();

    res.json(docs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


export const monthly = async (req, res, next) => {
  try {
    const from = dayjs().subtract(11, 'month').startOf('month').toDate();

    const rows = await Cashflow.aggregate([
      { $match: { date: { $gte: from } } },
      {
        $group: {
          _id: { y: { $year: '$date' }, m: { $month: '$date' } },
          ingresos: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          gastos:   { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } }
    ]);

    const map = new Map(rows.map(r => [`${r._id.y}-${r._id.m}`, r]));
    const out = [];
    for (let i = 11; i >= 0; i--) {
      const d = dayjs().subtract(i, 'month');
      const k = `${d.year()}-${d.month()+1}`;
      const r = map.get(k);
      out.push({
        month: d.format('MMM'),
        ingresos: r?.ingresos ?? 0,
        gastos: r?.gastos ?? 0
      });
    }
    res.json(out);
  } catch (e) { next(e); }
};
// POST /api/cashflows
export const createCashflow = async (req, res) => {
  try {
    const { date, account, amount, type } = req.body;
    if (!date || !account || amount == null || !type) {
      return res.status(400).json({ error: 'date, account, amount, type required' });
    }

    const { category: catRaw, ...rest } = req.body;
    const categoryId = await asCategoryId(catRaw);

    const doc = await Cashflow.create({ ...rest, date, account, amount, type, category: categoryId });
    const populated = await doc.populate('account counterparty category');
    res.status(201).json(populated);
  } catch (e) {
    if (e.message === 'CATEGORY_NOT_FOUND') return res.status(400).json({ error: 'CATEGORY_NOT_FOUND' });
    res.status(500).json({ error: e.message });
  }
};

// PUT /api/cashflows/:id
export const updateCashflow = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ error: 'INVALID_ID' });

    const update = { ...req.body };
    if (Object.prototype.hasOwnProperty.call(req.body, 'category')) {
      update.category = await asCategoryId(req.body.category); // ''|null|undefined => null
    }

    const updated = await Cashflow.findByIdAndUpdate(id, update, { new: true })
      .populate('account counterparty category');

    if (!updated) return res.status(404).json({ error: 'not_found' });
    res.json(updated);
  } catch (e) {
    if (e.message === 'CATEGORY_NOT_FOUND') return res.status(400).json({ error: 'CATEGORY_NOT_FOUND' });
    res.status(500).json({ error: e.message });
  }
};

// DELETE /api/cashflows/:id
export const removeCashflow = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return res.status(400).json({ error: 'INVALID_ID' });
    const deleted = await Cashflow.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'not_found' });
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const clearAll = async (_req, res) => {
  try {
    const result = await Cashflow.deleteMany({});
    res.json({ ok: true, deleted: result.deletedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};



// ==== Utilidades de fecha para el calendario (evita “día anterior”) ====
const toUTCStart = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};
const toUTCEnd = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
};

const toYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// GET /api/cashflows/calendar
export const calendar = async (req, res) => {
  try {
    const { start, end, account } = req.query;

    // Filtros seguros por fecha (FullCalendar manda YYYY-MM-DD)
    const q = {};
    if (start || end) {
      q.date = {};
      if (start) q.date.$gte = toUTCStart(start);
      if (end)   q.date.$lte = toUTCEnd(end);
    }
    if (account) q.account = account;

    const items = await Cashflow.find(
      q,
      { date: 1, amount: 1, type: 1, account: 1, counterparty: 1, category: 1, status: 1 }
    )
      .sort({ date: 1 })
      .limit(1000)
      .populate({ path: 'counterparty', select: 'name' })
      .populate({ path: 'account', select: 'alias color' })
      .populate({ path: 'category', select: 'name' })
      .lean();

    const events = items.map((i) => {
      const ymd = toYMD(new Date(i.date)); 
      const amountTxt = Number(i.amount).toLocaleString('es-ES', { minimumFractionDigits: 2 });
      const title = `${i.counterparty?.name ?? '—'} · ${amountTxt}€${i.category?.name ? ` · ${i.category.name}` : ''}`;

      // color por tipo/estado
     // const baseColor = i.type === 'out' ? '#ef4444' : '#10b981';
     // const color = i.status === 'cancelled' ? '#9ca3af' : baseColor; // gris si cancelado
     // const evColor = i.account?.color || '#3B82F6';

     // 1) gris si cancelado
    // 2) si no, usa color de la cuenta
    // 3) fallback por tipo si la cuenta no tiene color
    const fallback = i.type === 'out' ? '#ef4444' : '#10b981';
    const base = i.account?.color || fallback;
    //const color = i.status === 'cancelled' ? '#9ca3af' : base;
    const accColor = i.account?.color;
    

      return {
        id: String(i._id),
        title,
        start: ymd,
        allDay: true,
        color: accColor || fallback,
        extendedProps: {
          cashflowId: String(i._id),
          amount: i.amount,
          type: i.type,
          status: i.status,
          account: i.account,       // <-- trae alias y color
          category: i.category,
          counterparty: i.counterparty,
          dateYMD: ymd,
        },
      };
    });

    res.json(events);
  } catch (e) {
    console.error('calendar error:', e);
    res.status(500).json({ error: e.message });
  }
};

// GET /api/cashflows/upcoming
export const upcoming = async (req, res) => {
  try {
    const days = parseInt(req.query.days || '7', 10);
    const now = new Date();
    const to = new Date();
    to.setDate(now.getDate() + days);

    const q = { status: 'pending', date: { $gte: now, $lte: to } };
    if (req.query.account) q.account = req.query.account;

    const items = await Cashflow.find(q)
      .populate('account counterparty category')
      .sort({ date: 1 })
      .limit(50)
      .lean();

    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ===== Importación =====
const norm = s => (s ?? '').toString().trim();
const lc = s => norm(s).toLowerCase();

// Normalización para evitar desfase de día al guardar
// Convierte un Date (local) a 12:00 UTC del mismo Y/M/D local
const fromLocalDateToUTCNoon = (d) =>
  new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0));

//  YYYY-MM-DD desde un Date, tomando el Y/M/D LOCAL (el que ve el usuario)

const parseDate = (v) => {
  if (!v) return null;

  // Excel ya lo dio como Date
  if (v instanceof Date && !isNaN(v)) return fromLocalDateToUTCNoon(v);

  // Excel serial (días desde 1899-12-30)
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400000)); // crea Date en local
    return isNaN(d) ? null : fromLocalDateToUTCNoon(d);
  }

  let s = String(v).trim();
  s = s.split(/[ T]/)[0]; // nos quedamos con la parte de fecha

  // yyyy-mm-dd | yyyy/mm/dd
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (m) return fromLocalDateToUTCNoon(new Date(+m[1], +m[2] - 1, +m[3]));

  // dd/mm/yyyy | dd-mm-yyyy | dd.mm.yyyy
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
  if (m) return fromLocalDateToUTCNoon(new Date(+m[3], +m[2] - 1, +m[1]));

  // dd/mm/yy | dd-mm-yy
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2})$/);
  if (m) {
    const y2 = +m[3];
    const y = y2 >= 70 ? 1900 + y2 : 2000 + y2;
    return fromLocalDateToUTCNoon(new Date(y, +m[2] - 1, +m[1]));
  }

  return null;
};




const headerMap = (h) => {
  const k = (h ?? '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\s._-]+/g, '');
  if (['date','fecha','fechavencimiento','fechavto','fvencimiento','fvto','vencimiento'].includes(k)) return 'date';
  if (['amount','importe','valor','importeoperacion','importevto'].includes(k)) return 'amount';
  if (['type','tipo'].includes(k)) return 'type';
  if (['account','cuenta','accountalias','cuentaalias', 'banco'].includes(k)) return 'account';
  if (['counterparty','proveedor','cliente','tercero','beneficiario','pagador'].includes(k)) return 'counterparty';
  if (['category','categoria'].includes(k)) return 'category';
  if (['concept','concepto','descripcion','detalle'].includes(k)) return 'concept';
  if (['status','estado'].includes(k)) return 'status';
  return null;
};

const typeMap = (v) => {
  const t = (v ?? '').toString().trim().toLowerCase();
  if (['in','cobro','entrada','abono'].includes(t)) return 'in';
  if (['out','pago','salida','cargo','gasto'].includes(t)) return 'out';
  return 'out';
};

const parseAmount = (v) => {
  if (v === null || v === undefined || v === '') return NaN;
  if (typeof v === 'number') return v;
  let s = (v + '').trim();
  s = s.replace(/[€$]/g, '').replace(/\s+/g, '');
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/-$/.test(s))        { neg = true; s = s.slice(0, -1); }
  const lastComma = s.lastIndexOf(',');
  const lastDot   = s.lastIndexOf('.');
  if (lastComma > lastDot) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(/,/g, '');
  let n = parseFloat(s);
  if (neg) n = -n;
  return isNaN(n) ? NaN : n;
};

// POST /api/cashflows/import
export const importCashflows = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'FILE_REQUIRED' });

    const name = req.file.originalname.toLowerCase();
    let rows = []; // <- única declaración

    if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
      const wb = xlsx.read(req.file.buffer, { type: 'buffer', cellDates: true });

      // primera hoja con datos
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(ws, { defval: '', raw: true });
        if (data.length) { rows = data; break; }
      }

      // fallback: cabecera en fila 2/3
      if (!rows.length) {
        for (const sheetName of wb.SheetNames) {
          const ws = wb.Sheets[sheetName];
          const matrix = xlsx.utils.sheet_to_json(ws, { header: 1, raw: true });
          for (let i = 0; i < Math.min(20, matrix.length); i++) {
            const hdrMapped = (matrix[i] || []).map(headerMap).filter(Boolean);
            if (hdrMapped.includes('date') && hdrMapped.includes('amount')) {
              rows = matrix.slice(i + 1).map(r => {
                const obj = {};
                hdrMapped.forEach((k, idx) => { obj[k] = r[idx]; });
                return obj;
              });
              if (rows.length) break;
            }
          }
          if (rows.length) break;
        }
      }
    } else if (name.endsWith('.csv')) {
      rows = parseCsv(req.file.buffer.toString('utf8'), {
        columns: true, skip_empty_lines: true, bom: true, trim: true
      });
    } else {
      return res.status(400).json({ error: 'UNSUPPORTED_FORMAT' });
    }

    if (!rows.length) return res.status(400).json({ error: 'EMPTY_FILE' });

    const map = {};
    Object.keys(rows[0]).forEach(h => { map[h] = headerMap(h) || h; });

    const errors = [];
    let created = 0;

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const rec = {};
      for (const [h, v] of Object.entries(raw)) {
        const k = map[h];
        if (k) rec[k] = v;
      }


      const date = parseDate(rec.date);
        if (!date) { errors.push({ row: i + 1, error: 'INVALID_DATE', value: rec.date }); continue; }

      
      let amount = parseAmount(rec.amount);
      if (Number.isNaN(amount)) {
        errors.push({ row: i + 2, error: 'INVALID_AMOUNT', value: rec.amount });
        continue;
      }

      const accountAlias = norm(rec.account);
      if (!accountAlias) { errors.push({ row: i + 2, error: 'ACCOUNT_REQUIRED' }); continue; }
      const acc = await Account.findOne({ alias: accountAlias }, { _id: 1 }).lean();
      if (!acc) { errors.push({ row: i + 2, error: 'ACCOUNT_NOT_FOUND', value: rec.account }); continue; }

      let counterpartyId = null;
      if (rec.counterparty) {
        const cpName = norm(rec.counterparty);
        let cp = await Counterparty.findOne({ name: cpName }, { _id: 1 }).lean();
        if (!cp) {
          const createdCp = await Counterparty.create({ name: cpName });
          counterpartyId = createdCp._id;
        } else {
          counterpartyId = cp._id;
        }
      }

      let categoryId = null;
      if (rec.category) {
        const cat = await Category.findOne(
          { name: new RegExp('^' + norm(rec.category) + '$', 'i') },
          { _id: 1 }
        ).lean();
        if (!cat) { errors.push({ row: i + 2, error: 'CATEGORY_NOT_FOUND', value: rec.category }); continue; }
        categoryId = cat._id;
      }

      let type = typeMap(rec.type);
      if (!rec.type || String(rec.type).trim() === '') type = amount < 0 ? 'in' : 'out';
      if (amount < 0 && type !== 'in') type = 'in'; // coherencia signo→tipo

      const concept = norm(rec.concept);
      const status = ['pending','paid','cancelled'].includes(lc(rec.status)) ? lc(rec.status) : 'pending';

      await Cashflow.create({
        date,
        account: acc._id,
        counterparty: counterpartyId,
        amount,              // puede ser negativo
        type,                // 'in' si negativo
        category: categoryId,
        concept,
        status,
      });
      created++;
    }

    res.json({ created, errorsCount: errors.length, errors });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
