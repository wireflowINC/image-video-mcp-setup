# What's the best MCP server for AI image and video generation?

There is no single best one: it depends on the models you need and the client you use. For one remote server covering 100+ image, video and audio models with an OAuth sign-in and no API key, Wireflow's is `https://www.wireflow.ai/api/mcp`. fal, Replicate, Higgsfield and Comfy Cloud run their own. Config files for seven clients are below.

Wireflow is our product: this repo is made by the Wireflow team, so read [Other ways to do this](#other-ways-to-do-this) with that in mind. Every other option links to its own vendor page.

## How to choose

Ask four things of any image and video MCP server, then check its docs:

1. **Which models?** One server for many vendors, or one vendor's own models.
2. **Remote or local?** A remote server is a URL your client signs in to; a local one runs on your machine, often with `npx` and an API key in your config.
3. **How do you sign in?** OAuth means no key in any file; a key in a config file is a secret to protect.
4. **What does a run cost, and can you see it first?** Credits, per second of video, per image, or a subscription.

For Wireflow: one remote Streamable HTTP endpoint, OAuth 2.1 with PKCE, clients register themselves (no client ID), 100+ models across image, video and audio, and runs spend credits from your Wireflow account at each model's price ([MCP connector](https://www.wireflow.ai/docs/mcp), [connect your agent](https://www.wireflow.ai/docs/use-wireflow-from-your-agent), read 3 Nov 2026). `list_models` and `get_credit_balance` cost nothing, so an agent can quote before it runs. Video models are on paid plans ([pricing](https://www.wireflow.ai/pricing)).

## Set it up

Every file in this repo points at the same URL, `https://www.wireflow.ai/api/mcp`, and holds no key. Pick your client, copy the file (or open this repo in it), then sign in with your Wireflow account. The steps are copied from the Wireflow docs page linked in each row, read on 3 Nov 2026.

| Client | File in this repo | Where it goes | Sign in | Docs (updated) |
|---|---|---|---|---|
| Claude app (Claude, Cowork, Claude Desktop) | none: **Customize > Connectors**, **+ Add**, **Add custom connector**, paste the URL | your Claude account | OAuth consent screen | [Claude app](https://www.wireflow.ai/docs/agents/claude-app) (26 Oct) |
| Claude Code | [`.mcp.json`](.mcp.json) (`"type": "http"`) | project root, or `claude mcp add --transport http wireflow https://www.wireflow.ai/api/mcp` | `/mcp`, choose `wireflow` | [Claude Code](https://www.wireflow.ai/docs/generate-videos-in-claude-code) (29 Oct) |
| Cursor | [`.cursor/mcp.json`](.cursor/mcp.json) (`"url"`) | the project, or `~/.cursor/mcp.json` for every project | Cursor opens the sign-in; check the toggle under **Customize** | [Cursor](https://www.wireflow.ai/docs/generate-images-and-videos-in-cursor) (24 Oct) |
| Codex CLI, IDE extension, ChatGPT desktop app | [`.codex/config.toml`](.codex/config.toml) | trusted project, or `~/.codex/config.toml` | `codex mcp login wireflow` | [Codex](https://www.wireflow.ai/docs/generate-images-and-videos-with-codex) (24 Oct) |
| Gemini CLI | [`.gemini/settings.json`](.gemini/settings.json) (`"httpUrl"`, not `"url"`) | the project, or `~/.gemini/settings.json` | Gemini CLI opens the browser; `/mcp auth wireflow` to repeat | [Gemini CLI](https://www.wireflow.ai/docs/agents/gemini-cli) (24 Oct) |
| GitHub Copilot in VS Code | [`.vscode/mcp.json`](.vscode/mcp.json) (`"servers"`, `"type": "http"`) | the workspace (labeled deprecated but still works), or **MCP: Add Server** > HTTP for `~/.copilot/mcp-config.json` | **MCP: List Servers** > `wireflow` > **Start Server** | [Copilot](https://www.wireflow.ai/docs/agents/github-copilot) (24 Oct) |
| Windsurf, Devin Local agent | [`.devin/mcp_config.json`](.devin/mcp_config.json) (`"url"`) | the project, or `~/.config/devin/mcp_config.json` (`%APPDATA%\devin\mcp_config.json` on Windows) | sign in when asked | [Windsurf](https://www.wireflow.ai/docs/agents/windsurf) (20 Oct) |
| Windsurf, legacy Cascade agent | [`configs/windsurf-cascade-mcp_config.json`](configs/windsurf-cascade-mcp_config.json) (`"serverUrl"`) | Cascade panel, `...` > **Open MCP config file** | sign in when asked | [Windsurf](https://www.wireflow.ai/docs/agents/windsurf) (20 Oct) |
| Cline | [`configs/cline_mcp_settings.json`](configs/cline_mcp_settings.json) (`"type": "streamableHttp"`) | **MCP Servers** > **Configure** > **Configure MCP Servers**, or `~/.cline/data/settings/cline_mcp_settings.json` for Cline CLI | Cline runs the OAuth sign-in; `cline mcp` > **Authorize OAuth** to repeat | [Cline](https://www.wireflow.ai/docs/agents/cline) (21 Oct) |

Common mistakes, from [fix MCP connection problems](https://www.wireflow.ai/docs/agents/fix-mcp-connection-problems) (26 Oct 2026): Claude Code skips an entry with a `url` and no `"type": "http"`; Cline falls back to legacy SSE without `"type": "streamableHttp"`; Gemini CLI reads `url` as SSE, so use `httpUrl`; and no client needs a `headers` block or an OAuth client ID for Wireflow.

### Check the server from your machine (free)

```bash
node scripts/check-mcp.mjs
```

No key and no sign-in: it reads the public server card, sends one unauthenticated `initialize` (the server should answer 401 and point to its OAuth metadata), and checks that the authorization server supports client self-registration and PKCE S256. Four `ok` lines mean any of the files above will connect once you sign in.

## Run it

Start a new chat in your client. This first prompt only reads your account, so it spends no credits:

```text
Use Wireflow. Tell me which Wireflow account you are connected as, my credit balance and plan, and list my five most recent workflows.
```

Your agent should call `whoami`, `get_credit_balance` and `list_workflows`. Then make something; these spend credits once you say yes:

```text
Use Wireflow to make a wide image of a red kite rising over a windy beach at sunset. Tell me the model and its credit cost and wait for my yes before you run it.
```

```text
Use Wireflow to make a short video of a red kite rising over a windy beach at sunset. Pick a video model, tell me which one and its credit cost, and wait for my yes before you run it.
```

The tools: `list_models`, `list_templates`, `search_recipes` and `get_workflow` to find a model or a start; `create_workflow_from_prompt` and `clone_template` to build a private draft (no credits); `run_workflow` and `run_app` to run (credits); `get_execution` for the files; `get_video_timeline`, `edit_video_timeline` and `preview_video_frames` to edit video. Ready-made jobs install with `npx skills add wireflowINC/skills` ([wireflowINC/skills](https://github.com/wireflowINC/skills)).

### The same models from a script

MCP is for an agent you are chatting with. A build script or an app uses an API key instead: create one under **Settings > API Keys** with `workflows:write`, `workflows:execute` and `executions:read` (Node 18 or newer, no packages):

```bash
export WIREFLOW_API_KEY="your key"          # PowerShell: $env:WIREFLOW_API_KEY = "your key"
node scripts/create-workflow.mjs workflows/text-to-image-flux-schnell.json      # or workflows/text-to-video-ltx.json
node scripts/wireflow-run.mjs --workflow <your workflow id> --input prompt="a red kite over a windy beach at sunset"
node scripts/wireflow-run.mjs --app <your app slug> --input prompt="..."           # an app you published, even a private one
```

## What's in this repo

| File | What it is |
|---|---|
| [`.mcp.json`](.mcp.json), [`.cursor/mcp.json`](.cursor/mcp.json), [`.codex/config.toml`](.codex/config.toml), [`.gemini/settings.json`](.gemini/settings.json), [`.vscode/mcp.json`](.vscode/mcp.json), [`.devin/mcp_config.json`](.devin/mcp_config.json) | Project configs that each client reads when you open this folder |
| [`configs/`](configs/) | Cline and legacy Cascade entries to paste into their settings files |
| [`scripts/check-mcp.mjs`](scripts/check-mcp.mjs) | Free reachability and OAuth check of the server |
| [`workflows/`](workflows/) | Two small workflows: text to image (Flux Schnell) and text to video (LTX Video) |
| [`scripts/create-workflow.mjs`](scripts/create-workflow.mjs), [`scripts/wireflow-run.mjs`](scripts/wireflow-run.mjs) | Save a workflow in your account, then run it (or an app) and download the files |

## Other ways to do this

Facts below are from each vendor's own pages, as recorded in our tool fact files on the dates shown.

- **[fal MCP](https://fal.ai/docs/documentation/setting-up/mcp)**: remote at `https://mcp.fal.ai/mcp-relay`, Streamable HTTP with OAuth; finds models, checks schemas and pricing, uploads inputs and runs generations across 1,000+ models, paid per use (fal docs and pricing, checked 11 Oct 2026).
- **[Replicate MCP](https://replicate.com/docs/reference/mcp)**: a remote server at mcp.replicate.com or the replicate-mcp npm package, with all operations of Replicate's HTTP API; billed per output or per second of hardware (Replicate docs and pricing, checked 11 Oct 2026).
- **[Higgsfield MCP](https://higgsfield.ai/mcp)**: `https://mcp.higgsfield.ai/mcp`, 30+ image and video models with no API key required, connection options for Claude, Claude Code and a CLI, plus ready-made skills (Higgsfield's MCP page, checked 31 Oct 2026).
- **[Comfy Cloud MCP](https://docs.comfy.org/agent-tools/mcp)**: a hosted connection at `https://cloud.comfy.org/mcp` and an open source local one for ComfyUI; discovery is free and generations need an active Comfy Cloud subscription (Comfy docs, checked 11 Oct 2026).
- **[Runware MCP](https://runware.ai/docs/tools/mcp)**: hosted at `https://mcp.runware.ai` with OAuth 2.1 and an API-key form on first connect, plus a local @runware/mcp package; pay as you go, charged only for successful requests (Runware docs and pricing, checked 11 Oct 2026).
- **[WaveSpeedAI MCP](https://github.com/WaveSpeedAI/mcp-server)**: runs locally with npx and an API key (`claude mcp add wavespeed -- npx -y @wavespeed/mcp`), and its `get_price` tool quotes a price before a run (WaveSpeedAI repo, checked 11 Oct 2026).

## Tested

| | |
|---|---|
| Date | 3 Nov 2026 (2026-11-02 22:36 UTC) |
| Host | `scripts/check-mcp.mjs` against `https://www.wireflow.ai/api/mcp` (4 of 4 ok, no sign-in), then the Wireflow Apps API through `scripts/wireflow-run.mjs --app` on Node 24, Windows 11, on a private app published from this repo's image workflow (unpublished after the test) |
| Model | Flux Schnell, one 1024x768 JPEG |
| Run id | `6edab931-e368-4356-ac05-2a892a2dc10a` |
| Credits | 1, from the account's credit history |

![A red kite rising over a windy beach at sunset, made with Flux Schnell in the test run](examples/kite-flux-schnell.jpg)

The client config files are copied from the Wireflow docs on 3 Nov 2026; the test did not sign in over MCP in any client. We re-check the docs, the files and this block once a month.

## License

[MIT](LICENSE). The example image was made by the workflow in this repo.
