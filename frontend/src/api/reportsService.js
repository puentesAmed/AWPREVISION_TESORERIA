import { api } from "../lib/api";

export   const getTotals = async ({ from, to, account, groupBy='date', granularity='day'}) => {
    const res = await api.get("/reports/totals", { params: { from, to, account, groupBy, granularity } })
    return res.data
}