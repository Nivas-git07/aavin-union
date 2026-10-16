# Aavin Madurai Union — Analytics Dashboard

A local, frontend-only management dashboard for the GM and union admin. React + TypeScript, Vite, Tailwind CSS, Recharts, React Router and Lucide icons. All collection data and farmer identities are fictional.

## Run locally

Requires Node.js 20.19+ (Node.js 22 LTS recommended).

```powershell
cd "D:\aavin union"
npm.cmd install
npm.cmd run dev -- --port 5173
```

Open **http://127.0.0.1:5173/**. On shells without PowerShell's script restrictions, `npm` works in place of `npm.cmd`.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview -- --port 4173
```

The production files are in `dist/`. Preview them at **http://127.0.0.1:4173/**. Serve `dist/` over HTTP; opening `index.html` directly with a `file:` URL is not supported. A future static host must rewrite unknown paths to `/index.html` for client-side routing. Nothing has been deployed.

## Eight main pages

| Page        | Route              | Main features                                                                           |
| ----------- | ------------------ | --------------------------------------------------------------------------------------- |
| Overview    | `/overview` or `/` | Collection KPIs, trends, participation, BMC comparison and follow-up shortcuts          |
| Analytics   | `/analytics`       | Period totals, daily average, contribution, missed shifts and chart data tables         |
| BMCs        | `/bmcs`            | Searchable, sortable BMC directory                                                      |
| Societies   | `/societies`       | Society directory, parent BMC and farmer drilldown                                      |
| Farmers     | `/farmers`         | Farmer directory, registered cows and collection status                                 |
| Cow Details | `/cow-details`     | Owner Aadhaar lookup, linked owner/society profiles, cow records and medicine histories |
| No Supply   | `/no-supply`       | Farmer, society and BMC exception lists; zero, missing and pending filters              |
| Reports     | `/reports`         | Five complete CSV/print reports                                                         |

Each BMC, society and farmer also has its own detail route, for example `/bmcs/BMC-001`, `/societies/SOC-001` and `/farmers/FMR-0003`. BMC profiles expose both linked societies and linked farmers. BMC and society profiles include paginated daily collection histories; farmer profiles include morning/evening ledgers.

Dates, shift, BMC and society filters persist in the URL. Parent filters are pinned on a detail page. Navigating to a linked record preserves the period and shift. Directory searches and table sorting are local to the table; use its **Export CSV** button to export the complete searched/sorted result. The page-level **Export data** button exports the entire selected report scope. Reports and print layouts include the full scope, beyond pagination.

## Data and collection rules

- Exactly 6 BMCs, 30 societies and 600 farmers. Each farmer belongs to one society, and each society belongs to one BMC.
- Deterministic history from January 1 two calendar years before the current India date, through today. No database, sign-in, external API, record editing or persistence is included.
- Collection quantities are integer millilitres. Parent totals are derived only from farmer entries. The screen displays litres to one decimal; CSV exports preserve three decimal places.
- Date boundaries use **Asia/Kolkata (IST)**. Morning closes at **10:00 IST**, evening at **20:00 IST**. These are explicit demo defaults, not claims about actual Madurai operations.
- Expected schedules vary; some farmers supply only in the morning. Inactive or unscheduled farmers are **Not expected**, never missed.
- **Confirmed zero**: an expected, closed shift explicitly records zero milk. **Missing record**: an expected, closed shift has no confirmed entry. **Pending**: an expected shift has not finished and no supply is yet recorded.
- Whole-day zero requires all expected shifts to be closed and confirmed zero. Known supply plus a zero/missing shift is **Partial supply**. A parent with supplying farmers and collection gaps remains partially supplied.
- Multi-day lists distinguish occasional misses, confirmed zero throughout the period, incomplete records and awaiting completion. Affected farmer-days count days with at least one zero/missing shift, summed across farmers.
- Follow-up lists search back through available history for the last delivery on or before the report end date. Standard directory exports explicitly label last delivery as within the selected period.
- Registered counts include inactive farmers and their cows. Contributing counts include only positive recorded collection during the selected period. Cow counts are master-record counts, not historical herd snapshots.
- Previous-period comparison uses an equally long immediately preceding range. When the current period ends today, the previous period's last day uses equivalent elapsed collection windows. Comparison is unavailable if the prior range is outside history or its collection is zero.
- Daily averages divide by every selected calendar day, including zero days and a provisional current day. Detail cards labelled **Today's milk** and **Total recorded milk** intentionally show their explicit timeframes. Total recorded milk includes both shifts since the displayed history start date.
- `DEMO-####` contact identifiers are placeholders, not callable phone numbers. Names and records do not identify real suppliers. Madurai-area place names are for demonstration.

## Source structure

The project has separate modules for all eight main pages, shared layouts and UI components, collection rules, demo data, reporting and tests. See [the full folder architecture](docs/architecture.md) for the tree, data flow and dependency rules.

- `src/app/App.tsx`: small application composition entry point.
- `src/pages/`: eight main pages plus BMC/society/farmer detail views.
- `src/components/`: reusable layouts, filters, charts, tables and UI primitives.
- `src/hooks/useDashboard.ts`: shared URL state, loading and reporting actions.
- `src/services/demoRepository.ts`: typed data adapter used by the UI.
- `src/domain/` and `src/data/mock/`: collection rules and deterministic sample data.
- `src/reports/`: complete CSV exports and printable reports.
- `src/styles/globals.css`: theme, responsive layouts and print styles.
- `src/styles/typography.css`: locally bundled Inter Variable, shared text sizes and numeric typography.
- `src/tests/unit/` and `src/tests/integration/`: calculation and user-flow tests.

Use the `@/` alias for imports from `src/`, for example `@/components/ui/Panel`.

## Branding

Inter Variable is self-hosted through `@fontsource-variable/inter` (SIL Open Font License). The Latin font is bundled into the production build, with no Google Fonts request at runtime. Body copy is 14px, table content 13?14px, and operational captions at least 12px. Compact brand lettering and printed reports use their own sizes.

The source logo asset is downloaded from the official Aavin site:

- Page: https://aavin.co.in/
- Asset: https://aavin.co.in/ASSETS/IMAGES/logo_en.jpg

`public/aavin-logo.jpg` is the original official banner image. CSS displays just its Aavin logo region at its original proportions. It is bundled locally; running the dashboard does not require the external website. The dashboard is a demonstration, not an official Aavin deployment.

## Verification

Tests cover hierarchy reconciliation, integer quantities, date boundaries, leap years, yearly aggregation, shift closure, inactive farmers, pending/zero/missing statuses, partial supply, prior-period comparisons, complete CSV exports, eight-page navigation, filter retention, drilldown, search, pagination, sorting, date selection, print reports and error states.

Chart geometry and physical print pagination still need visual review; DOM interaction tests use a chart-container stub. Cow Details was reviewed in local Chrome at desktop (1440 px) and mobile (390 px) widths: owner search, cow cards, and medicine histories render without page-wide horizontal overflow or browser runtime errors. Medicine tables scroll within their cards on mobile. Other pages and physical print pagination have not been screenshot-verified.

## Cow Details lookup

Open **Cow Details** and search using the fictional owner Aadhaar **0000 0000 0001** (A. Murugan, two cows) or **0000 0000 0002** (A. Lakshmi, three cows). Spaces and hyphens are accepted; lookup requires exactly 12 digits. These leading-zero identifiers are demo placeholders, not verified Aadhaar identities.

Results include the owner, farmer ID, demo contact, society, BMC and village, followed by every registered cow with tag ID, breed, birth date, age and lactation status. Medicine histories show recorded treatments newest first, including dose, duration, veterinarian and notes; all medicines and doses are fictional demonstration entries.

The lookup searches the entire union independently of collection filters. It keeps Aadhaar input only in component state, clears results when input changes and does not save the value in URLs or browser storage. Existing collection filters remain available when returning to report pages. This page is read-only and has no collection export/print controls or real identity verification.
