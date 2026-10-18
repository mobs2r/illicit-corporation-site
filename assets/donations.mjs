const IDS = new Set(['btc', 'eth', 'sol', 'avax', 'pol', 'usdc', 'ape']);
const ASSETS = {
  btc: ['btc', 'btc', 'BTC'], eth: ['ethereum', 'evm', 'ETH'], sol: ['sol', 'sol', 'SOL'],
  avax: ['avalanche', 'evm', 'AVAX'], pol: ['polygon', 'evm', 'POL'],
  usdc: ['ethereum', 'erc20', 'USDC', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  ape: ['ethereum', 'erc20', 'APE', '0x4d224452801aced8b2f0aebe155379bb5d594381']
};
export function validateWallets(data) {
  if (data?.schema !== 1 || data.rewardsEnabled !== false || !Array.isArray(data.chains) || data.chains.length !== IDS.size) throw Error('Invalid donation wallet configuration');
  const seen = new Set();
  for (const c of data.chains) {
    if (!IDS.has(c.id) || seen.has(c.id) || typeof c.name !== 'string' || c.name.length > 80 || typeof c.network !== 'string' || c.network.length > 40) throw Error('Invalid donation network');
    const [network, kind, symbol, token] = ASSETS[c.id];
    if (c.network !== network || c.kind !== kind || c.symbol !== symbol || (c.token || '').toLowerCase() !== (token || '')) throw Error('Mismatched donation asset or network');
    const valid = c.id === 'btc' ? /^bc1[ac-hj-np-z02-9]{20,87}$/.test(c.address)
      : c.id === 'sol' ? /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(c.address) : /^0x[0-9a-fA-F]{40}$/.test(c.address);
    if (!valid || c.kind === 'erc20' && !/^0x[0-9a-fA-F]{40}$/.test(c.token)) throw Error('Invalid donation recipient');
    seen.add(c.id);
  }
  return data.chains;
}

export async function mountDonations(root, { fetcher = fetch, clipboard = navigator.clipboard } = {}) {
  if (!root) return;
  try {
    const response = await fetcher('./assets/donation-wallets.json');
    if (!response.ok) throw Error('Donation wallets unavailable');
    const chains = validateWallets(await response.json());
    root.replaceChildren();
    for (const c of chains) {
      const panel = document.createElement('details'); panel.id = `crypto-${c.id}`; panel.className = 'donation-wallet';
      const summary = document.createElement('summary'); summary.textContent = `${c.name} · ${c.symbol}`;
      const network = document.createElement('p'); network.className = 'wallet-network'; network.textContent = `Network: ${c.network === 'btc' ? 'Bitcoin' : c.network === 'sol' ? 'Solana' : c.network}${c.kind === 'erc20' ? ' · ERC-20 token' : ''}`;
      const address = document.createElement('code'); address.textContent = c.address;
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'wallet-copy'; copy.textContent = 'Copy address'; copy.setAttribute('aria-label', `Copy ${c.name} donation address`);
      const feedback = document.createElement('span'); feedback.className = 'wallet-feedback'; feedback.setAttribute('role', 'status');
      copy.onclick = async () => { try { await clipboard.writeText(c.address); feedback.textContent = 'Address copied. Check the network before sending.'; } catch { feedback.textContent = 'Copy unavailable. Select the address above to copy it.'; } };
      panel.append(summary, network, address, copy, feedback);
      if (c.token) { const token = document.createElement('p'); token.className = 'group-note'; token.textContent = `Token contract: ${c.token}`; panel.append(token); }
      root.append(panel);
    }
    const reveal = id => { const panel = document.getElementById(id); if (panel?.classList.contains('donation-wallet')) { panel.open = true; panel.scrollIntoView({ block: 'center', behavior: 'instant' }); } };
    document.querySelectorAll('[data-crypto-wallet]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); reveal(`crypto-${link.dataset.cryptoWallet}`); }));
    reveal(location.hash.slice(1));
  } catch {
    root.textContent = 'Wallets unavailable. Use the support links above; do not send to an unverified recipient.';
  }
}
