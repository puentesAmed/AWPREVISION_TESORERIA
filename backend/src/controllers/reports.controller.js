import Cashflow from '../models/Cashflow.js'
import mongoose from 'mongoose'
import dayjs from 'dayjs';

const toUTCStart = (ymdStr) => {
  if (!ymdStr) return null;
  const [y, m, d] = ymdStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
};
const toUTCEnd = (ymdStr) => {
  if (!ymdStr) return null;
  const [y, m, d] = ymdStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
};


// GET /api/reports/totals
export const totals = async (req, res) => {
  try {
    const {
      from,
      to,
      groupBy = 'date',     
      granularity = 'day',  
      account,
      category,
      counterparty,
      status,               
      type,                 
    } = req.query;

    const match = {};

    // Fecha inclusiva
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = toUTCStart(from);
      if (to)   match.date.$lte = toUTCEnd(to);
    }

    // Cuenta
    if (account && mongoose.isValidObjectId(account)) {
      match.account = new mongoose.Types.ObjectId(account);
    }

    if (counterparty && mongoose.isValidObjectId(counterparty)) {
      match.counterparty = new mongoose.Types.ObjectId(counterparty);
    }

    if (category && mongoose.isValidObjectId(category)) {
      match.category = new mongoose.Types.ObjectId(category);
    }

    // Estado
    if (status && ['pending','paid','cancelled'].includes(status)) {
      match.status = status;
    }

    // Tipo (muy útil para "pendientes" = pagos)
    if (type && ['in','out'].includes(type)) {
      match.type = type;
    }

    // Eje temporal
    const dateExpr = (granularity === 'month')
      ? { $dateToString: { format: '%Y-%m', date: '$date' } }
      : { $dateToString: { format: '%Y-%m-%d', date: '$date' } };

    const _id = {};
    if (groupBy === 'date')       _id.date = dateExpr;
    else if (groupBy === 'account'){ _id.account = '$account'; _id.date = dateExpr; }
    else if (groupBy === 'category'){ _id.category = '$category'; _id.date = dateExpr; }

    const data = await Cashflow.aggregate([
      { $match: match },
      { $group: { _id, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.date': 1 } }
    ]);

    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// VENCIDOS: status 'pending' y fecha <= fin de día seleccionado
export const overdue = async (req, res) => {
  try {
    const toParam = req.query.to || new Date().toISOString().slice(0,10);
    const toEnd = toUTCEnd(toParam);

    const match = { status: 'pending', date: { $lte: toEnd } };
    if (req.query.account && mongoose.isValidObjectId(req.query.account)) {
      match.account = new mongoose.Types.ObjectId(req.query.account);
    }
    if (req.query.counterparty && mongoose.isValidObjectId(req.query.counterparty)) {
      match.counterparty = new mongoose.Types.ObjectId(req.query.counterparty);
    }
    if (req.query.category && mongoose.isValidObjectId(req.query.category)) {
      match.category = new mongoose.Types.ObjectId(req.query.category);
    }

    const rows = await Cashflow.find(
      match,
      { date:1, amount:1, status:1, concept:1, account:1, counterparty:1, category:1, type:1 }
    )
    .sort({ date:1 })
    .populate({ path:'account', select:'alias' })
    .populate({ path:'counterparty', select:'name' })
    .populate({ path:'category', select:'name' })
    .lean();

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};


export const pendingPerAccountMonth = async (req, res) => {
  try {
    // Rango solicitado por el usuario
    const fromParam = req.query.from ? new Date(req.query.from) : dayjs().startOf('year').toDate();
    const toParam   = req.query.to   ? new Date(req.query.to)   : dayjs().endOf('year').toDate();

    // Normalizamos a 00:00:00 para comparaciones seguras
    const norm = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const from = norm(fromParam);
    const to   = norm(toParam);

    // Hoy (00:00:00). Queremos excluir vencidos, así que empezamos en max(from, today)
    const today = norm(new Date());
    const start = new Date(Math.max(from.getTime(), today.getTime())); // ← evita incluir vencidos
    const end   = to;

    const rows = await Cashflow.aggregate([
      {
        $match: {
          status: 'pending',
          ...(req.query.account && mongoose.isValidObjectId(req.query.account)
            ? { account: new mongoose.Types.ObjectId(req.query.account) }
            : {}),
          ...(req.query.counterparty && mongoose.isValidObjectId(req.query.counterparty)
            ? { counterparty: new mongoose.Types.ObjectId(req.query.counterparty) }
            : {}),
          ...(req.query.category && mongoose.isValidObjectId(req.query.category)
            ? { category: new mongoose.Types.ObjectId(req.query.category) }
            : {}),
          ...(req.query.type && ['in', 'out'].includes(req.query.type)
            ? { type: req.query.type }
            : {}),
          date: { $gte: start, $lte: end }, // ← solo pendientes futuros (no vencidos)
        }
      },
      {
        $addFields: {
          y: { $year: '$date' },
          m: { $month: '$date' },
        }
      },
      {
        $group: {
          _id: { account: '$account', y: '$y', m: '$m' },
          // si prefieres sumar siempre como valor positivo (por si hay signos mixtos), usa:
          // total: { $sum: { $abs: '$amount' } }
          total: { $sum: '$amount' },
        }
      },
      {
        $lookup: {
          from: 'accounts',
          localField: '_id.account',
          foreignField: '_id',
          as: 'acc',
        }
      },
      { $unwind: { path: '$acc', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          accountId: '$_id.account',
          accountAlias: '$acc.alias',
          y: '$_id.y',
          m: '$_id.m',
          total: 1,
          _id: 0,
        }
      },
      { $sort: { accountAlias: 1, y: 1, m: 1 } }
    ]);

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export const pendingOverdueByCounterparty = async (req, res) => {
  try {
    const {
      from,
      to,
      account,
      category,
      counterparty,
      type,
      scope = 'all',
    } = req.query;

    const match = { status: 'pending' };
    if (from || to) {
      match.date = {};
      if (from) match.date.$gte = toUTCStart(from);
      if (to) match.date.$lte = toUTCEnd(to);
    }
    if (account && mongoose.isValidObjectId(account)) {
      match.account = new mongoose.Types.ObjectId(account);
    }
    if (counterparty && mongoose.isValidObjectId(counterparty)) {
      match.counterparty = new mongoose.Types.ObjectId(counterparty);
    }
    if (category && mongoose.isValidObjectId(category)) {
      match.category = new mongoose.Types.ObjectId(category);
    }
    if (type && ['in', 'out'].includes(type)) {
      match.type = type;
    }

    const todayStart = toUTCStart(new Date().toISOString().slice(0, 10));
    const rows = await Cashflow.find(
      match,
      { date: 1, amount: 1, status: 1, concept: 1, account: 1, counterparty: 1, category: 1, type: 1 }
    )
      .sort({ counterparty: 1, date: 1 })
      .populate({ path: 'account', select: 'alias' })
      .populate({ path: 'counterparty', select: 'name' })
      .populate({ path: 'category', select: 'name' })
      .lean();

    const includePending = scope === 'all' || scope === 'pending';
    const includeOverdue = scope === 'all' || scope === 'overdue';

    const filteredRows = rows.filter((row) => {
      const rowDate = row.date instanceof Date ? row.date : new Date(row.date);
      const bucket = rowDate < todayStart ? 'overdue' : 'pending';
      if (bucket === 'pending') return includePending;
      if (bucket === 'overdue') return includeOverdue;
      return false;
    });

    const groupsMap = new Map();
    for (const row of filteredRows) {
      const rowDate = row.date instanceof Date ? row.date : new Date(row.date);
      const bucket = rowDate < todayStart ? 'overdue' : 'pending';
      const cpId = String(row.counterparty?._id ?? row.counterparty ?? 'none');
      const cpName = row.counterparty?.name || 'Sin proveedor';
      const amountAbs = Math.abs(Number(row.amount) || 0);

      if (!groupsMap.has(cpId)) {
        groupsMap.set(cpId, {
          counterpartyId: cpId === 'none' ? null : cpId,
          counterpartyName: cpName,
          total: 0,
          pendingTotal: 0,
          overdueTotal: 0,
          items: [],
        });
      }

      const group = groupsMap.get(cpId);
      group.total += amountAbs;
      if (bucket === 'pending') group.pendingTotal += amountAbs;
      if (bucket === 'overdue') group.overdueTotal += amountAbs;
      group.items.push({
        ...row,
        bucket,
        amountAbs,
      });
    }

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      a.counterpartyName.localeCompare(b.counterpartyName, 'es', { sensitivity: 'base' })
    );

    const summary = groups.reduce((acc, group) => {
      acc.total += group.total;
      acc.pendingTotal += group.pendingTotal;
      acc.overdueTotal += group.overdueTotal;
      acc.count += group.items.length;
      return acc;
    }, { total: 0, pendingTotal: 0, overdueTotal: 0, count: 0 });

    res.json({
      scope,
      generatedAt: new Date().toISOString(),
      groups,
      ...summary,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
