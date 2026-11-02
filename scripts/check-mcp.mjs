#!/usr/bin/env node
// check-mcp.mjs: check from your machine that the Wireflow MCP server is reachable and how it signs you in.
// No key, no sign-in, no credits: it reads the public server card and OAuth metadata, and sends one
// unauthenticated "initialize" that the server should answer with 401 and a pointer to its OAuth metadata.
//
//   node scripts/check-mcp.mjs
//
// If all four lines say ok, add the server to your agent with one of the files in this repo and sign in there.

const MCP = 'https://www.wireflow.ai/api/mcp';
const results = [];
const check = (name, pass, detail = '') => { results.push(pass); console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}${detail ? ': ' + detail : ''}`); };

async function getJson(url) {
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  return { status: r.status, json: r.ok ? await r.json() : null };
}

try {
  const card = await getJson('https://www.wireflow.ai/.well-known/mcp.json');
  const remote = card.json?.remotes?.find((x) => x.url === MCP);
  check('server card lists the endpoint', card.status === 200 && !!remote, remote ? `${remote.type}, protocol ${remote.supportedProtocolVersions?.[0]}` : `HTTP ${card.status}`);

  const init = await fetch(MCP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'check-mcp', version: '1.0.0' } } }),
  });
  const wwwAuth = init.headers.get('www-authenticate') || '';
  const prmUrl = (wwwAuth.match(/resource_metadata="([^"]+)"/) || [])[1];
  check('endpoint asks for OAuth sign-in', init.status === 401 && !!prmUrl, `HTTP ${init.status}${prmUrl ? ', metadata ' + prmUrl : ''}`);

  const prm = prmUrl ? await getJson(prmUrl) : { status: 0, json: null };
  const as = prm.json?.authorization_servers?.[0];
  check('protected resource metadata', prm.status === 200 && prm.json?.resource === MCP && !!as, prm.json ? `scopes: ${(prm.json.scopes_supported || []).join(' ')}` : `HTTP ${prm.status}`);

  const asm = as ? await getJson(`${as.replace(/\/$/, '')}/.well-known/oauth-authorization-server`) : { status: 0, json: null };
  const dcr = !!asm.json?.registration_endpoint;
  const pkce = (asm.json?.code_challenge_methods_supported || []).includes('S256');
  check('authorization server (client self-registration, PKCE S256)', asm.status === 200 && dcr && pkce, asm.json ? `registration ${dcr ? 'yes' : 'no'}, PKCE S256 ${pkce ? 'yes' : 'no'}` : `HTTP ${asm.status}`);
} catch (e) {
  check('network', false, e.message);
}
process.exitCode = results.every(Boolean) ? 0 : 1;
