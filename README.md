# MemoSA

One-page deep dives into Indian equities.  
Opinionated memos on NSE/BSE micro, small & midcap stocks.

---

## Quick Start (Deploy in 30 minutes)

### 1. Prerequisites

- Create a free account at [github.com](https://github.com)
- Create a free account at [vercel.com](https://vercel.com) (sign up with GitHub)

### 2. Upload to GitHub

Option A — **GitHub Web UI (no terminal needed):**
1. Go to github.com → New Repository → Name it `memosa`
2. Click "uploading an existing file"
3. Drag the entire `memosa` folder contents
4. Click "Commit changes"

Option B — **Terminal:**
```bash
cd memosa
git init
git add .
git commit -m "Launch MemoSA"
git remote add origin https://github.com/YOUR_USERNAME/memosa.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your `memosa` repo
4. Framework: **Next.js** (auto-detected)
5. Click **Deploy**
6. Wait ~90 seconds
7. Your site is live! 🎉

### 4. Custom Domain (optional)

1. Buy `memosa.in` from GoDaddy/Namecheap (~₹700/year)
2. Vercel → Project Settings → Domains → Add domain
3. Update DNS as instructed
4. Done — SSL auto-provisions

---

## Editing Content

### Add a New Memo

1. Copy `data/memos/CANBK.json`
2. Rename to `data/memos/NEWTICKER.json`
3. Edit all fields
4. Add the stock to `data/stocks.json`
5. Commit & push → site auto-rebuilds in 60 seconds

### Update an Existing Memo

1. Edit the file in `data/memos/TICKER.json`
2. Update the `updatedAt` date
3. Add a changelog entry
4. Commit & push

### Edit via GitHub (easiest)

Navigate to any file on github.com → Click pencil icon → Edit → Commit.
No terminal needed. Works from your phone.

---

## File Structure

```
memosa/
├── data/                    ← YOUR CONTENT (edit this!)
│   ├── memos/
│   │   ├── CANBK.json      ← one file per company
│   │   └── WABAG.json
│   ├── stocks.json          ← master stock list
│   ├── sectors.json         ← sector definitions
│   └── peers.json           ← peer comparison groups
├── pages/
│   ├── index.js             ← main app
│   ├── _app.js              ← global styles
│   └── api/
│       ├── stock/[ticker].js ← live price API
│       └── indices.js        ← live index API
├── package.json
└── next.config.js
```

---

## Live Data

The site fetches live stock prices every 60 seconds from the NSE API.  
If NSE is unavailable, it falls back to the data in your JSON files.

To use Google Finance instead (more reliable, 15min delay):
1. Create a Google Sheet with `=GOOGLEFINANCE("NSE:CANBK","price")`
2. Publish as CSV
3. Update the fetch URL in `pages/index.js`

---

## Tech Stack

- **Next.js** — React framework
- **Recharts** — charts and visualizations
- **Vercel** — hosting (free tier)
- **NSE API** — live stock prices

---

Not SEBI registered. Not investment advice. DYOR.
