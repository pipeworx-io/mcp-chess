# mcp-chess

Chess.com MCP — wraps the Chess.com public API (free, no auth)

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `get_player` | Get a Chess.com player's profile by username (e.g., 'hikaru'). Returns title, country, followers, join date, and last online time. |
| `get_stats` | Get a CHESS.COM player's ratings and game records across daily, rapid, blitz, and bullet formats. PREFER for "<player>'s blitz/bullet/rapid rating on Chess.com", "what is <player> rated on Chess.com". Returns current/best ratings and win/loss/draw counts. |
| `get_games` | Retrieve a player's completed games for a specific month (format: YYYY/MM, e.g., '2024/01'). Returns game URLs, time controls, results, and ratings. |
| `get_leaderboards` | Check top-ranked Chess.com players by format (daily, rapid, blitz, bullet). Returns rankings with ratings and win percentages. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "chess": {
      "url": "https://gateway.pipeworx.io/chess/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Chess data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
