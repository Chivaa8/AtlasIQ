const endpoint = "https://api.frankfurter.dev/v1/latest";
const supported = new Set(["EUR", "USD", "GBP", "JPY", "MXN", "ISK", "IDR", "NZD"]);
const cache = new Map();

export async function latestRate(from, to, fetchImpl = fetch) {
  if (from === to) return { rate: 1, date: new Date().toISOString().slice(0, 10) };
  if (!supported.has(from) || !supported.has(to)) throw new Error("unsupported currency");
  const key = `${from}:${to}`;
  if (cache.has(key)) return cache.get(key);
  const response = await fetchImpl(`${endpoint}?base=${from}&symbols=${to}`);
  if (!response.ok) throw new Error("exchange service unavailable");
  const payload = await response.json();
  const rate = Number(payload.rates?.[to]);
  if (!Number.isFinite(rate) || rate <= 0) throw new Error("invalid exchange rate");
  const result = { rate, date: payload.date };
  cache.set(key, result);
  return result;
}
