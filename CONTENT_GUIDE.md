# MemoSA Content Editing Cheat Sheet

## Quick Reference: What to edit for common tasks

### "I want to update a stock's thesis"
→ Edit `data/memos/TICKER.json` → `thesis` field

### "I want to change the So What for a horizon"
→ Edit `data/memos/TICKER.json` → `horizons.short.soWhat` (or medium/long)

### "I want to add a new tailwind/headwind"
→ Edit `data/memos/TICKER.json` → `tailwinds` or `headwinds` array
→ Just add a new string to the list

### "I want to update financials after earnings"
→ Edit `data/memos/TICKER.json` → `horizons.short.financials`
→ Change `"actual": false` to `"actual": true` for the latest period
→ Add a new forward estimate row

### "I want to update the score/radar chart"
→ Edit `data/memos/TICKER.json` → `horizons.short.score` (or medium/long)
→ Values are 0-100 for: valuation, growth, quality, momentum, safety, dividends

### "I want to change a stock's status"
→ Edit BOTH:
  1. `data/stocks.json` → find the stock → change `status`
  2. `data/memos/TICKER.json` → change `status`
→ Valid values: "active", "monitor", "review"

### "I want to add a new peer"
→ Edit `data/peers.json` → find the sector → add to `peers` array
→ Copy an existing peer entry and change the numbers

### "I want to add a new sector"
→ Edit `data/sectors.json` → add a new entry with id, name, icon

### "I want to update the analyst target price"
→ Edit `data/memos/TICKER.json` → `analystTarget` field

### "I want to add a changelog entry"
→ Edit `data/memos/TICKER.json` → `changelog` array
→ Add: { "date": "Mar 24", "note": "Your update description" }

## Status Values
- `active` — you have a conviction thesis
- `monitor` — tracking but not conviction
- `review` — thesis under review / potentially broken

## Sector Names (must match between files)
Use these exact strings in stocks.json and memo files:
- "PSU Banks"
- "Water"
- "Defence"
- "Chem"

## After Any Edit
1. Save the file
2. Commit to GitHub (or click "Commit" on github.com)
3. Vercel auto-deploys in ~60 seconds
4. Refresh your site
