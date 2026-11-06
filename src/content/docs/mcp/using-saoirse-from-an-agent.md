---
title: Using Saoirse from an agent
description: The Saoirse MCP server, its four tools, and how to add it to Claude.
---

The Saoirse MCP server exposes Saoirse, the conversational banking assistant inside Saoi, for a fictional Demo Bank, as four
tools. It is at `https://mcp.saoi.ie/mcp`.

:::caution
All data is synthetic. Nothing real is opened and no money moves.
:::

It is a thin adapter. Each tool calls the Saoirse services over HTTP. Rules, scoring and eligibility stay
in those services.

## Tools

| Tool             | Use it to                                                            |
| ---------------- | -------------------------------------------------------------------- |
| `saoirse_start`  | Begin a conversation; returns a handle and the opening question      |
| `saoirse_say`    | Say something as the customer; returns Saoirse's reply and any cards |
| `saoirse_act`    | Tap a card for the user once they have decided (read-write)          |
| `saoirse_status` | Read the state of the applications on the case (read-only)           |

## Add it to claude.ai

Settings, Connectors, Add custom connector. URL `https://mcp.saoi.ie/mcp`, no authentication.

## Add it to Claude Code

```sh
claude mcp add --transport http saoirse https://mcp.saoi.ie/mcp
```

## Protocol

Built on the official TypeScript SDK v2. Stateless Streamable HTTP, `POST /mcp` only. It serves both
the 2026-07-28 per-request path and the legacy `initialize` path. `GET /mcp` returns 405. `GET
/health` returns `{ ok, version }`. SSE keep-alive comments go out every 25 seconds.

## Authentication

There is none yet: the tools are public and authless. The conversation handle is a documented
prototype shortcut, an opaque string encoding a synthetic user created at `saoirse_start`. It is never
logged. OAuth comes later, before any tool can see consented bank data.

## Run your own

The server is in the `baz-mcp` repository, AGPL-3.0-only.

:::caution[To be written]
Configuration for running the server yourself, against your own Saoirse stack.
:::
