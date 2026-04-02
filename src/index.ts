/**
 * Chess.com MCP — wraps the Chess.com public API (free, no auth)
 *
 * Tools:
 * - get_player: Get a player's public profile
 * - get_stats: Get a player's game statistics across all formats
 * - get_games: Get a player's games for a specific month
 * - get_leaderboards: Get top-ranked players across game formats
 */

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
}

const BASE_URL = 'https://api.chess.com/pub';

// --- Raw API types ---

type RawPlayer = {
  player_id: number;
  username: string;
  name?: string;
  title?: string;
  followers: number;
  country: string;
  location?: string;
  joined: number;
  last_online: number;
  is_streamer: boolean;
  verified: boolean;
  league?: string;
};

type RawRatingStats = {
  last?: { rating: number; date: number; rd: number };
  best?: { rating: number; date: number; game?: string };
  record?: { win: number; loss: number; draw: number };
};

type RawStats = {
  chess_daily?: RawRatingStats;
  chess_rapid?: RawRatingStats;
  chess_blitz?: RawRatingStats;
  chess_bullet?: RawRatingStats;
  chess_960_daily?: RawRatingStats;
  fide?: number;
};

type RawGame = {
  url: string;
  pgn?: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn?: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: string;
  rules: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
};

type RawGamesResponse = {
  games: RawGame[];
};

type RawLeaderEntry = {
  player_id: number;
  username: string;
  score: number;
  rank: number;
};

type RawLeaderboards = {
  daily?: RawLeaderEntry[];
  daily960?: RawLeaderEntry[];
  live_rapid?: RawLeaderEntry[];
  live_blitz?: RawLeaderEntry[];
  live_bullet?: RawLeaderEntry[];
  live_bughouse?: RawLeaderEntry[];
  live_blitz960?: RawLeaderEntry[];
  live_threecheck?: RawLeaderEntry[];
  live_crazyhouse?: RawLeaderEntry[];
  live_kingofthehill?: RawLeaderEntry[];
  lessons?: RawLeaderEntry[];
  tactics?: RawLeaderEntry[];
};

// --- Tool definitions ---

const tools: McpToolExport['tools'] = [
  {
    name: 'get_player',
    description:
      "Get a Chess.com player's public profile including name, title, followers, country, join date, and last online time.",
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Chess.com username (case-insensitive, e.g., "hikaru", "magnuscarlsen")',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'get_stats',
    description:
      "Get a player's game statistics including current rating, best rating, and win/loss/draw record for daily, rapid, blitz, and bullet formats.",
    inputSchema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          description: 'Chess.com username',
        },
      },
      required: ['username'],
    },
  },
  {
    name: 'get_games',
    description:
      "Get a player's completed games for a specific month. Returns game URLs, time controls, results, and player ratings.",
    inputSchema: {
      type: 'object',
      properties: {
        username: { type: 'string', description: 'Chess.com username' },
        year: { type: 'number', description: 'Year (e.g., 2024)' },
        month: { type: 'number', description: 'Month as a number (1-12)' },
      },
      required: ['username', 'year', 'month'],
    },
  },
  {
    name: 'get_leaderboards',
    description:
      'Get the top-ranked Chess.com players across game formats including daily, rapid, blitz, and bullet.',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

// --- callTool dispatcher ---

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_player':
      return getPlayer(args.username as string);
    case 'get_stats':
      return getStats(args.username as string);
    case 'get_games':
      return getGames(args.username as string, args.year as number, args.month as number);
    case 'get_leaderboards':
      return getLeaderboards();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// --- Tool implementations ---

async function getPlayer(username: string) {
  const res = await fetch(`${BASE_URL}/player/${encodeURIComponent(username.toLowerCase())}`);
  if (!res.ok) throw new Error(`Chess.com error: ${res.status}`);

  const p = (await res.json()) as RawPlayer;

  return {
    player_id: p.player_id,
    username: p.username,
    name: p.name ?? null,
    title: p.title ?? null,
    followers: p.followers,
    country_url: p.country,
    location: p.location ?? null,
    joined: new Date(p.joined * 1000).toISOString(),
    last_online: new Date(p.last_online * 1000).toISOString(),
    is_streamer: p.is_streamer,
    verified: p.verified,
    league: p.league ?? null,
  };
}

function formatRatingStats(stats: RawRatingStats | undefined) {
  if (!stats) return null;
  return {
    current_rating: stats.last?.rating ?? null,
    best_rating: stats.best?.rating ?? null,
    record: stats.record
      ? { win: stats.record.win, loss: stats.record.loss, draw: stats.record.draw }
      : null,
  };
}

async function getStats(username: string) {
  const res = await fetch(`${BASE_URL}/player/${encodeURIComponent(username.toLowerCase())}/stats`);
  if (!res.ok) throw new Error(`Chess.com error: ${res.status}`);

  const data = (await res.json()) as RawStats;

  return {
    username,
    fide: data.fide ?? null,
    daily: formatRatingStats(data.chess_daily),
    rapid: formatRatingStats(data.chess_rapid),
    blitz: formatRatingStats(data.chess_blitz),
    bullet: formatRatingStats(data.chess_bullet),
    daily_960: formatRatingStats(data.chess_960_daily),
  };
}

async function getGames(username: string, year: number, month: number) {
  const mm = String(month).padStart(2, '0');
  const res = await fetch(
    `${BASE_URL}/player/${encodeURIComponent(username.toLowerCase())}/games/${year}/${mm}`,
  );
  if (!res.ok) throw new Error(`Chess.com error: ${res.status}`);

  const data = (await res.json()) as RawGamesResponse;

  return {
    username,
    year,
    month,
    total_games: data.games.length,
    games: data.games.map((g) => ({
      url: g.url,
      uuid: g.uuid,
      time_class: g.time_class,
      time_control: g.time_control,
      rated: g.rated,
      end_time: new Date(g.end_time * 1000).toISOString(),
      white: { username: g.white.username, rating: g.white.rating, result: g.white.result },
      black: { username: g.black.username, rating: g.black.rating, result: g.black.result },
    })),
  };
}

async function getLeaderboards() {
  const res = await fetch(`${BASE_URL}/leaderboards`);
  if (!res.ok) throw new Error(`Chess.com error: ${res.status}`);

  const data = (await res.json()) as RawLeaderboards;

  const formatLeaders = (entries: RawLeaderEntry[] | undefined) =>
    (entries ?? []).slice(0, 10).map((e) => ({
      rank: e.rank,
      username: e.username,
      score: e.score,
    }));

  return {
    daily: formatLeaders(data.daily),
    live_rapid: formatLeaders(data.live_rapid),
    live_blitz: formatLeaders(data.live_blitz),
    live_bullet: formatLeaders(data.live_bullet),
    tactics: formatLeaders(data.tactics),
  };
}

export default { tools, callTool } satisfies McpToolExport;
