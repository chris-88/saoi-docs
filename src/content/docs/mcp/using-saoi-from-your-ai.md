---
title: Using Saoi from your AI
description: The Saoi MCP server, its entry tool, the home calculator and comparison tools, two resources and one prompt, and how to add it to Claude.
---

The Saoi MCP server compares Irish savings, deposit, mortgage, loan, credit card and current account
products against a customer's own figures, inside the AI they already use. The AI talks; Saoi supplies
the facts and the arithmetic: interest after DIRT, repayments, total cost, the month a goal is reached.
It is at `https://mcp.saoi.ie/mcp`.

:::note
Saoi compares products and does the arithmetic on the figures you give. It is information, not advice
or a recommendation, and it does not say which product is right for you. Saoi is not regulated by the
Central Bank of Ireland, so Central Bank consumer protection rules and compensation schemes do not cover
it. Saoi earns nothing from any provider. Rates change; the provider's own terms are what count.
:::

Saoi shows every option that fits the customer's own filters, sorted by a metric the customer picks,
and never picks one for them. A preference the customer gives, such as staying with their own bank, is
a filter they chose, and the result says so. The only thing stored is a comparison the customer saves:
it is held for 24 hours behind a single-use link so they can open it in the Saoi app, then deleted
unless opened.

Each run of the home calculator also keeps one anonymous record: the day, an income band, the months
to the keys (banded) and whether the date is met. If the customer gave them, it adds the county, a rent
band, the kind of home and whether they are a first-time buyer. It holds no figures and no names, and
nothing that identifies the customer.

It is a thin adapter over the Saoi API's public comparison routes. The arithmetic, the ranking and the
market data live in the API. Each tool's input schema and description are generated from the API's
OpenAPI document.

## Connect it and just talk

Add the connector and talk about your money. As soon as the conversation turns to your own money in
Ireland (savings in a current account, a house deposit, a loan or card, a mortgage, Help to Buy,
"where should I put my savings", "am I paying too much"), the host calls `saoi_money_check` with
whatever you have said. One call returns what Saoi finds, a plan when there is money to place, the
two or three questions that would sharpen it, and a link to save the comparison to the Saoi app.
Every result starts with a short "Present to the customer" block: the money found a year, one net
figure per option (savings less what is still owed), and the link. The other tools answer follow-ups.

## Buying a home

When the customer raises buying a home, the host calls `saoi_home_calculator` with whatever they have
said. In hosts that show MCP Apps cards (claude.ai, Claude Desktop and mobile), it opens a calculator:
sliders, each with a typed box, for the deposit saved, monthly saving, gross income (and a second
income for a joint mortgage), the price in mind, existing repayments and the date; and the customer's
filters: their bank and whether to see only its options, fixed or variable, first-time buyer, new
build or second-hand (Help to Buy), a green home, and whether they are open to switching current
account. The figures move as the sliders do: what the Central Bank limits allow, the deposit and the
cash needed at the keys, and the month that is saved. "Show my options" lists every eligible lender
option that fits, sortable by cost over the first five years, keys date or monthly repayment, with a
button to save the comparison. Hosts without cards get the same figures and the missing inputs as plain
questions.

Two inputs are optional. `county` is one of the 26 counties, or Dublin City, Dún Laoghaire-Rathdown,
Fingal or South Dublin; it sets the price ceilings of the First Home Scheme. `monthlyRentEur` changes
no product figure. It is shown against the monthly repayment of each option: "Rent €X a month against a
€Y repayment".

### Routes to a home

The home calculator and `saoi_first_home` return `routes`: every route to a home, each as a fact with
a date or a reason. They come in this order: the customer's own kind of property first, then the routes
that could apply, then those that need one more detail, then those that do not apply, with the reason.

- Second-hand.
- A new build with Help to Buy.
- The First Home Scheme: shared equity on a new build, up to 30% of the price, or 20% with Help to
  Buy. The price ceilings depend on the local authority.
- The Local Authority Home Loan: an alternative mortgage from the council. The income ceiling is
  €80,000 for one applicant and €85,000 for two. It needs insufficient offers from two lenders.
- Local authority affordable purchase: a below-market price, with the council keeping a share. Saoi
  reads it from newstarterhomes.ie, where it is called "Starter Home Purchase".
- The Vacant Property Refurbishment Grant: up to €50,000, and €20,000 more if the property is
  derelict. The property must have been vacant for two years or more. It is paid against receipts
  after the works, so it never counts towards the deposit. Its figures are marked unconfirmed: they
  were read from council pages, not gov.ie.

Each route carries its conditions, the page it was read from and the day it was read (2026-11-10). The
AI relays three lines, then "More routes: N". The customer chooses. Saoi never calls one route the
best.

Help to Buy is conditional in the headline. When the kind of home is a new build and tax paid was not
given, the headline keys date is without Help to Buy, and the new-build route line says "if your tax
paid covers €35,000". When tax paid is given, Help to Buy counts as before.

Every mortgage result carries the three warnings:

- Warning: if you do not keep up your repayments you may lose your home.
- Warning: the cost of your monthly repayments may increase.
- Warning: if you do not meet the repayments on your loan, your account will go into arrears.

## Tools

| Tool                      | Use it to                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `saoi_money_check`        | Start here: the review, a plan or the questions that unlock one, and the save link             |
| `saoi_review_situation`   | Findings with euro figures: idle money, no emergency fund, debt costing more than savings earn |
| `saoi_search_products`    | Rank one category for the customer's amounts; the top five by default                          |
| `saoi_product`            | One product in full: rate history, what the source does not say, its own words                 |
| `saoi_savings_projection` | Month by month, net of DIRT, within monthly caps and tiers; when a target is reached           |
| `saoi_mortgage`           | Affordability under the Central Bank limits, or a switch: saving, cashback, break-even         |
| `saoi_debt`               | What debts cost, the payoff order, overpaying against saving, refinance rates                  |
| `saoi_first_home`         | Every route to a home with its date or reason, the Central Bank limits, green rates, sources   |
| `saoi_home_calculator`    | The home calculator card: limits, deposit, date and routes; optional county and monthly rent   |
| `saoi_build_plan`         | Compare the options for chosen goals: a worked combination with runners-up, every home option  |
| `saoi_save_plan`          | A fresh 24-hour link, for a plan that came back without one                                    |

Every product carries its source (the provider's own site, or the Competition and Consumer Protection
Commission's comparison tables, with its attribution), when it was checked and last changed, every
field the source does not give (never treated as zero), and eligibility to check with the provider.
Only providers that operate in Ireland are compared: Irish banks and credit unions, Ireland State
Savings, and EU banks with an Irish branch or service, such as bunq, Revolut, Avant Money and MoCo,
each with the deposit guarantee scheme that covers it. Banks reached only through a deposit
platform, such as Raisin, are not compared.

Each result comes back as structured data and as a short text rendering, so hosts that do not read
structured output still show the figures, flags, unknowns and attribution.

## Resources and prompt

- `saoi://about/ranking`: how Saoi ranks, and how every figure is worked out.
- `saoi://about/earnings`: how Saoi earns. It is free and earns nothing from any provider: no
  commission, referral fee or payment for leads.
- `money-check-up`: a guided check-up. Optional: the entry tool does the same work without it.

## Add it to Claude

In claude.ai (web, desktop or mobile): Settings, Connectors, Add custom connector. Name `Saoi`, URL
`https://mcp.saoi.ie/mcp`, no authentication. Then enable it in a chat from the tools menu and talk about your
money; no prompt is needed.

In Claude Code:

```sh
claude mcp add --transport http saoi https://mcp.saoi.ie/mcp
```

## Protocol

Built on the official TypeScript SDK v2. Stateless Streamable HTTP, `POST /mcp` only. It serves both
the 2026-07-28 per-request path and the legacy `initialize` path. `GET /mcp` returns 405. `GET
/health` returns `{ ok, version }`. SSE keep-alive comments go out every 25 seconds.

## Authentication and limits

There is none yet: the tools are public. The API limits requests per address, and the server passes
the caller's address on so the limit is per person.

## Run your own

The server is in the `saoi-mcp` repository, AGPL-3.0-only. It needs one setting, `SAOI_API_URL`, the
Saoi API to call.
