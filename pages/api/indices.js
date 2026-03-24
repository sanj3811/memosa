// pages/api/indices.js
// Fetches all NIFTY index values from NSE India

export default async function handler(req, res) {
  try {
    const sessionResp = await fetch("https://www.nseindia.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html",
      },
    });
    const cookies = sessionResp.headers.get("set-cookie") || "";

    const dataResp = await fetch(
      "https://www.nseindia.com/api/allIndices",
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

    // Map to our format
    const indices = (data.data || []).map((idx) => ({
      name: idx.index,
      value: idx.last?.toLocaleString("en-IN") || "—",
      change: parseFloat((idx.percentChange || 0).toFixed(2)),
    }));

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res.status(200).json({ indices, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Error fetching indices:", error.message);
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({ indices: [], error: "Temporarily unavailable", timestamp: new Date().toISOString() });
  }
}
