---
title: Using Saoi from your AI
description: The Saoi MCP server, its eight comparison tools, two resources and one prompt, and how to add it to Claude.
---

The Saoi MCP server compares Irish savings, deposit, mortgage, loan, credit card and current account
products against a customer's own figures, inside the AI they already use. The AI talks; Saoi supplies
the facts and the arithmetic: interest after DIRT, repayments, total cost, the month a goal is reached.
It is at `https://mcp.saoi.ie/mcp`.

:::note
Information, not advice. Every result is ranked by a stated objective the customer can change, and
says what it is ranked by. Nothing about the customer is stored until they choose to save a plan.
:::

It is a thin adapter over the Saoi API's public comparison routes. The arithmetic, the ranking and the
market data live in the API. Each tool's input schema and description are generated from the API's
OpenAPI document.

## Tools

| Tool                      | Use it to                                                                                      |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `saoi_review_situation`   | Findings with euro figures: idle money, no emergency fund, debt costing more than savings earn |
| `saoi_search_products`    | Rank one category for the customer's amounts; the top five by default                          |
| `saoi_product`            | One product in full: rate history, what the source does not say, its own words                 |
| `saoi_savings_projection` | Month by month, net of DIRT, within monthly caps and tiers; when a target is reached           |
| `saoi_mortgage`           | Affordability under the Central Bank limits, or a switch: saving, cashback, break-even         |
| `saoi_debt`               | What debts cost, the payoff order, overpaying against saving, refinance rates                  |
| `saoi_build_plan`         | The fastest combination of products for the customer's chosen goals                            |
| `saoi_save_plan`          | Keep the plan behind a one-time link into the Saoi app (the only tool that writes)             |

Every product carries its source (the provider's own site, or the Competition and Consumer Protection
Commission's comparison tables, with its attribution), when it was checked and last changed, every
field the source does not give (never treated as zero), and eligibility to check with the provider.
Products from other EU banks offered through the Raisin platform are included and flagged, with the
home country's deposit guarantee.

Each result comes back as structured data and as a short text rendering, so hosts that do not read
structured output still show the figures, flags, unknowns and attribution.

## Resources and prompt

- `saoi://about/ranking`: how Saoi ranks, and how every figure is worked out.
- `saoi://about/earnings`: how Saoi earns. Referral fees, disclosed, never used in ranking.
- `money-check-up`: a guided check-up. The customer's situation, a review, their goals, a plan, then
  an offer to save it.

## Add it to Claude

In claude.ai (web, desktop or mobile): Settings, Connectors, Add custom connector. Name `Saoi`, URL
`https://mcp.saoi.ie/mcp`, no authentication. Then enable it in a chat from the tools menu, where the
`money-check-up` prompt also appears.

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
