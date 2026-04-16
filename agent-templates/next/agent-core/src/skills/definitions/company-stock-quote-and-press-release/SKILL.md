---
name: company-stock-quote-and-press-release
description: For each ticker in {TICKERS}, retrieve stock price, P/E (TTM), and latest press release.
category: Generated
---

# Company Stock Quote And Press Release

## Parameters

- **{TICKERS}**: List of stock tickers or company names to look up (e.g. `NVDA, GOOGL, MSFT`)

## Procedure

1. **search** — For each ticker, search Yahoo Finance with a scrapeOptions query format to extract current price and trailing P/E in one step.
   ```
   query: '{TICKER} stock price PE ratio Yahoo Finance'; scrapeOptions.formats=[{type:'query', prompt:'What is the current stock price and trailing P/E ratio for {TICKER}?'}]
   ```
2. **search** — For each company, search for their official newsroom to find the latest press release URL.
   ```
   query: '{COMPANY} latest press release 2025' or 'site:{newsroom-domain} latest press release'
   ```
3. **scrape:query** — If press release headline not obvious from search snippet, scrape the newsroom page with a targeted query for the single most recent press release title and date.
   ```
   formats=[{type:'query', prompt:'What is the single most recent press release title and date on this page?'}]
   ```
4. **formatOutput** — Aggregate ticker, price, P/E, and latest press release (title, date, url) per company into a JSON object with a sources array.
   ```
   format: json
   ```

## Targets

| URL Pattern | Fallback Query |
|---|---|
| https://finance.yahoo.com/quote/{TICKER}/ | {TICKER} stock price Yahoo Finance |
| https://nvidianews.nvidia.com/news/latest | NVIDIA newsroom latest press release |
| https://abc.xyz/investor/news/ | Alphabet investor press release |
| https://news.microsoft.com/source/ | Microsoft news source latest |

## Data Fields

- ticker
- stock_price_usd
- pe_ratio_ttm
- latest_press_release.title
- latest_press_release.date
- latest_press_release.url
- sources

## Example Prompts

- "Get the P/E ratio, stock price, and latest press release for NVIDIA, Google, and Microsoft"
- "Get price, P/E, and latest press release for AAPL, META, TSLA"
