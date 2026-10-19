const IDS = new Set(['btc', 'eth', 'sol', 'avax', 'pol', 'usdc', 'ape', 'usdt']);
const ASSETS = {
  btc: ['btc', 'btc', 'BTC'], eth: ['ethereum', 'evm', 'ETH'], sol: ['sol', 'sol', 'SOL'],
  avax: ['avalanche', 'evm', 'AVAX'], pol: ['polygon', 'evm', 'POL'],
  usdc: ['ethereum', 'erc20', 'USDC', '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  ape: ['ethereum', 'erc20', 'APE', '0x4d224452801aced8b2f0aebe155379bb5d594381'],
  usdt: ['ethereum', 'erc20', 'USDT', '0xdac17f958d2ee523a2206206994597c13d831ec7']
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

export async function copyAddress(address, clipboard, doc) {
  try {
    if (!clipboard?.writeText) throw Error('Clipboard API unavailable');
    await clipboard.writeText(address);
    return;
  } catch {
    // User-activated fallback for embeds where async clipboard writing is not
    // delegated. It writes only; it never reads the visitor's clipboard.
    const previous = doc.activeElement;
    const field = doc.createElement('textarea');
    field.value = address;
    field.readOnly = true;
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
    doc.body.append(field);
    try {
      field.select();
      if (!doc.execCommand('copy')) throw Error('Clipboard copy unavailable');
    } finally {
      field.remove();
      previous?.focus({ preventScroll: true });
    }
  }
}

export async function mountDonations(root, { fetcher = fetch, clipboard = globalThis.navigator?.clipboard, schedule = setTimeout, cancel = clearTimeout } = {}) {
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-crypto-wallet]')];
  const status = root.querySelector('#crypto-copy-status');
  const doc = root.ownerDocument;
  buttons.forEach(button => { button.disabled = true; });
  try {
    const response = await fetcher('./assets/donation-wallets.json', { cache: 'no-store' });
    if (!response.ok) throw Error('Donation wallets unavailable');
    const chains = new Map(validateWallets(await response.json()).map(c => [c.id, c]));
    for (const button of buttons) {
      const chain = chains.get(button.dataset.cryptoWallet);
      if (!chain) continue;
      const label = button.querySelector('[data-crypto-label]');
      let timer;
      button.setAttribute('aria-label', `Copy ${label.textContent} address`);
      button.disabled = false;
      button.onclick = async () => {
        cancel(timer);
        try {
          await copyAddress(chain.address, clipboard, doc);
          button.dataset.copyState = 'copied';
          if (status) status.textContent = `${label.textContent} address copied.`;
        } catch {
          button.dataset.copyState = 'error';
          if (status) status.textContent = 'Could not copy the address. Please try again.';
        }
        timer = schedule(() => { delete button.dataset.copyState; }, 2000);
      };
    }
  } catch {
    if (status) status.textContent = 'Donation addresses are unavailable.';
  }
}
