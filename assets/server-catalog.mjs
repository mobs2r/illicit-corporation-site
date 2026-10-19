const icons = Object.freeze({
  three: './assets/icons/threejs.png', gmod: './assets/icons/garrys-mod.jpg',
  gta: './assets/icons/gtav.jpg', sa: './assets/icons/san-andreas.jpg',
  mc: './assets/icons/minecraft.png', web: './assets/icons/illicit.svg',
  rdr: './assets/icons/rdr2.jpg', css: './assets/icons/css.jpg',
  cs2: './assets/icons/cs2.jpg', zomboid: './assets/icons/zomboid.jpg'
});

// Discovery only: presence here is not an offer, entitlement or deployment grant.
export const serverCatalog = Object.freeze([
  { id: 'cod-city', name: 'Cod City', game: 'ThreeJS', icon: icons.three, host: 'railway', status: 'testing', guide: '/support/integrations/generic_http' },
  { id: 'gknuckle', name: 'gKnuckle', game: "Garry’s Mod", icon: icons.gmod, host: 'external', status: 'existing', guide: '/support/distribution' },
  { id: 'darkrp', name: 'DarkRP', game: "Garry’s Mod", icon: icons.gmod, host: 'external', status: 'testing', guide: '/support/distribution' },
  { id: 'ttt', name: 'TTT', game: "Garry’s Mod", icon: icons.gmod, host: 'external', status: 'testing', guide: '/support/distribution' },
  { id: 'fivem', name: 'FiveM', game: 'GTA V', icon: icons.gta, host: 'external', status: 'testing', guide: '/support/integrations/fivem_redm_altv' },
  { id: 'altv', name: 'alt:V', game: 'GTA V', icon: icons.gta, host: 'external', status: 'testing', guide: '/support/integrations/fivem_redm_altv' },
  { id: 'mta', name: 'MTA', game: 'San Andreas', icon: icons.sa, host: 'external', status: 'planned', guide: null },
  { id: 'factions', name: 'Factions', game: 'Minecraft', icon: icons.mc, host: 'railway-tcp', status: 'developer', guide: '/support/integrations/minecraft' },
  { id: 'smp', name: 'SMP', game: 'Minecraft', icon: icons.mc, host: 'railway-tcp', status: 'developer', guide: '/support/integrations/minecraft' },
  { id: 'web', name: 'Web', game: 'Web', icon: icons.web, host: 'railway', status: 'existing', guide: '/support/distribution' },
  { id: 'redm', name: 'RedM', game: 'Red Dead Redemption 2', icon: icons.rdr, host: 'external', status: 'testing', guide: '/support/integrations/fivem_redm_altv' },
  { id: 'counter-strike', name: 'Counter-Strike: Source', game: 'SourceMod', icon: icons.css, host: 'external', status: 'developer', guide: '/support/integrations/counter_strike' },
  { id: 'cs2', name: 'Counter-Strike 2', game: 'CounterStrikeSharp', icon: icons.cs2, host: 'external', status: 'developer', guide: '/support/integrations/counter_strike' },
  { id: 'zomboid', name: 'Project Zomboid', game: 'Project Zomboid', icon: icons.zomboid, host: 'external', status: 'testing', guide: '/support/integrations/project_zomboid' },
  { id: 'fabric', name: 'Fabric', game: 'Minecraft', icon: icons.mc, host: 'railway-tcp', status: 'developer', guide: '/support/integrations/minecraft' },
  { id: 'forge', name: 'Forge / NeoForge', game: 'Minecraft', icon: icons.mc, host: 'railway-tcp', status: 'developer', guide: '/support/integrations/minecraft' },
  { id: 'bedrock', name: 'Bedrock', game: 'Minecraft', icon: icons.mc, host: 'external', status: 'developer', guide: '/support/integrations/minecraft' },
  { id: 'node', name: 'Node.js', game: 'Web', icon: icons.web, host: 'railway', status: 'developer', guide: '/support/integrations/generic_http' },
  { id: 'lua', name: 'Lua HTTP', game: 'Lua', icon: icons.web, host: 'external', status: 'developer', guide: '/support/integrations/generic_http' }
].map(Object.freeze));

export const billingUrl = 'https://illicit.up.railway.app/?billing';
export function serverDetails(id) {
  const server = serverCatalog.find(item => item.id === id);
  if (!server) throw new RangeError('Unknown server template');
  const readiness = { existing: 'Existing integration', testing: 'Integration testing', developer: 'Developer kit', planned: 'Adapter planned' }[server.status];
  const host = { railway: 'Railway web/API host', 'railway-tcp': 'Railway TCP candidate', external: 'Separate game host + Illicit API' }[server.host];
  return { ...server, readiness, hostLabel: host, guideUrl: server.guide ? `https://illicit.up.railway.app${server.guide}` : null };
}
