// pages/api/stock/[ticker].js
// Fetches live stock price from NSE India
// Falls back to cached data if NSE is unavailable

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: "Ticker required" });
  }

  try {
    // Step 1: Get session cookie from NSE homepage
    const sessionResp = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html",
      },
    });
    const cookies = sessionResp.headers.get("set-cookie") || "";

    // Step 2: Fetch stock data using session
    const dataResp = await fetch(
      `https://www.nseindia.com/api/quote-equity?symbol=${encodeURIComponent(ticker)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Cookie": cookies,
          "Referer": "https://www.nseindia.com",
        },
      }
    );

    if (!dataResp.ok) {
      throw new Error(`NSE returned ${dataResp.status}`);
    }

    const data = await dataResp.json();

    // Cache response for 10 seconds
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=30");

    return res.status(200).json({
      ticker: ticker,
      price: data.priceInfo?.lastPrice || null,
      change: data.priceInfo?.pChange || null,
      high52: data.priceInfo?.weekHighLow?.max || null,
      low52: data.priceInfo?.weekHighLow?.min || null,
      open: data.priceInfo?.open || null,
      close: data.priceInfo?.close || null,
      volume: data.preOpenMarket?.totalTradedVolume || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);

    // Return a graceful fallback
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({
      ticker: ticker,
      price: null,
      change: null,
      error: "Live data temporarily unavailable",
      timestamp: new Date().toISOString(),
    });
  }
}
