---
title: Using Saoi from your AI
description: The Saoi MCP server, its entry tool and comparison tools, two resources and one prompt, and how to add it to Claude.
---

The Saoi MCP server compares Irish savings, deposit, mortgage, loan, credit card and current account
products against a customer's own figures, inside the AI they already use. The AI talks; Saoi supplies
the facts and the arithmetic: interest after DIRT, repayments, total cost, the month a goal is reached.
It is at `https://mcp.saoi.ie/mcp`.

:::note
Information, not advice. Every result is ranked by a stated objective the customer can change, and
says what it is ranked by. The only thing stored is a plan: each one is held for 24 hours behind a
single-use link so the customer can open it in the Saoi app, then deleted unless opened.
:::

It is a thin adapter over the Saoi API's public comparison routes. The arithmetic, the ranking and the
market data live in the API. Each tool's input schema and description are generated from the API's
OpenAPI document.

## Connect it and just talk

Add the connector and talk about your money. As soon as the conversation turns to your own money in
Ireland (savings in a current account, a house deposit, a loan or card, a mortgage, Help to Buy,
"where should I put my savings", "am I paying too much"), the host calls `saoi_money_check` with
whatever you have said. One call returns what Saoi finds, a plan when there is money to place, the
two or three questions that would sharpen it, and a link to save the plan to the Saoi app. Every
result starts with a short "Present to the customer" block: the money found a year, one net figure
per option (savings less what is still owed), and the link. The other tools answer follow-ups.

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
| `saoi_first_home`         | Help to Buy, the Central Bank lending limits with it, green rates; every rule with its source  |
| `saoi_build_plan`         | The fastest combination for chosen goals, with a link that holds it for 24 hours               |
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
- `saoi://about/earnings`: how Saoi earns. Referral fees, disclosed, never used in ranking.
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
