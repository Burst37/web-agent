---
name: yahoo-finance-quote-and-press
description: Fetch stock price, P/E ratio (TTM), and latest press release for one or more tickers from Yahoo Finance.
category: Generated
---

# Yahoo Finance Quote And Press

## Parameters

- **{TICKERS}**: List of stock ticker symbols (e.g. `NVDA,GOOGL,MSFT`)

## Procedure

1. **scrape** — Batch-scrape quote and press-release pages for each ticker in {TICKERS}
   ```
   urls: https://finance.yahoo.com/quote/{TICKER}/ and https://finance.yahoo.com/quote/{TICKER}/press-releases/
   ```
2. **bashExec** — Extract Previous Close, Bid price, and PE Ratio (TTM) from each quote page
   ```
   sed -n '40,75p' finance.yahoo.com/quote/{TICKER}.md
   ```
3. **bashExec** — Extract the top (latest) press-release title and URL from each press-releases page
   ```
   rg -n '\[\*\*' finance.yahoo.com/quote/{TICKER}/press-releases.md | head -1
   ```
4. **formatOutput** — Return JSON keyed by company name with ticker, price, pe_ratio_ttm, latest_press_release {title,url}, and sources.
   ```
   format: json
   ```

## Targets

| URL Pattern | Fallback Query |
|---|---|
| https://finance.yahoo.com/quote/{TICKER}/ | {TICKER} stock quote yahoo finance |
| https://finance.yahoo.com/quote/{TICKER}/press-releases/ | {TICKER} press releases yahoo finance |

## Data Fields

- ticker
- stock_price_usd
- previous_close_usd
- pe_ratio_ttm
- latest_press_release.title
- latest_press_release.url
- sources

## Example Prompts

- "Get the P/E ratio, stock price, and latest press release for NVIDIA, Google, and Microsoft"
- "Fetch current price, P/E, and latest PR headline for AAPL and TSLA"
