# @pipeworx/mcp-chess

MCP server for the [Chess.com API](https://www.chess.com/news/view/published-data-api) — player profiles, game statistics, monthly game archives, and leaderboards. Free, no auth required.

## Tools

| Tool | Description |
|------|-------------|
| `get_player` | Get a player's public profile |
| `get_stats` | Get ratings and win/loss/draw records across all formats |
| `get_games` | Get a player's games for a specific month |
| `get_leaderboards` | Get top-ranked players across game formats |

## Quick Start

Add to your MCP client config:

```json
{
  "mcpServers": {
    "chess": {
      "type": "url",
      "url": "https://gateway.pipeworx.io/chess"
    }
  }
}
```

## CLI Usage

```bash
npx @anthropic-ai/mcp-client https://gateway.pipeworx.io/chess
```

## License

MIT
