import { serverCatalog, serverDetails, billingUrl } from './server-catalog.mjs';

export function mountServerPortal(doc = document) {
  const trigger = doc.getElementById('account-toggle');
  if (!trigger || typeof doc.createElement('dialog').showModal !== 'function') return;
  const dialog = doc.createElement('dialog');
  dialog.id = 'server-portal';
  dialog.className = 'server-portal';
  dialog.setAttribute('aria-labelledby', 'server-portal-title');
  dialog.innerHTML = `<header class="portal-head"><div><h2 id="server-portal-title">Servers &amp; billing</h2><p>Your world. Connected.</p></div><form method="dialog"><button class="portal-close" aria-label="Close server setup" autofocus>×</button></form></header>
    <a class="action portal-account" href="${billingUrl}" target="_blank" rel="noopener noreferrer">Sign in / account &amp; billing <span aria-hidden="true">↗</span></a>
    <fieldset class="portal-choices"><legend>Choose a server</legend><div class="server-grid" id="server-primary"></div><details class="server-more"><summary>More runtimes</summary><div class="server-grid" id="server-more"></div></details></fieldset>
    <section class="server-selection" aria-labelledby="server-selection-title"><div role="status" aria-live="polite" aria-atomic="true"><h3 id="server-selection-title"></h3><p id="server-selection-detail"></p><span class="server-mode">Manual setup</span></div><a class="action" id="server-guide" target="_blank" rel="noopener noreferrer">Setup guide <span aria-hidden="true">↗</span></a></section>`;
  const primary = dialog.querySelector('#server-primary');
  const more = dialog.querySelector('#server-more');
  const title = dialog.querySelector('#server-selection-title');
  const detail = dialog.querySelector('#server-selection-detail');
  const guide = dialog.querySelector('#server-guide');
  const select = id => {
    const server = serverDetails(id);
    title.textContent = server.name;
    detail.textContent = `${server.readiness} · ${server.hostLabel}`;
    guide.hidden = !server.guideUrl;
    if (server.guideUrl) guide.href = server.guideUrl;
    else guide.removeAttribute('href');
  };
  serverCatalog.forEach((server, index) => {
    const label = doc.createElement('label');
    label.className = 'server-option';
    const radio = doc.createElement('input');
    radio.type = 'radio'; radio.name = 'server-template'; radio.value = server.id;
    radio.checked = index === 0;
    const image = doc.createElement('img');
    image.src = server.icon; image.alt = ''; image.width = 28; image.height = 28;
    const name = doc.createElement('span');
    name.textContent = server.name;
    const game = doc.createElement('span');
    game.className = 'sr-only'; game.textContent = ` · ${server.game}`;
    label.append(radio, image, name, game);
    (index < 9 ? primary : more).append(label);
    radio.addEventListener('change', () => { if (radio.checked) select(server.id); });
  });
  select(serverCatalog[0].id);
  doc.body.append(dialog);
  trigger.setAttribute('aria-expanded', 'false');
  trigger.addEventListener('click', event => {
    event.preventDefault();
    if (dialog.open) return;
    dialog.showModal(); doc.documentElement.classList.add('server-portal-open');
    trigger.setAttribute('aria-expanded', 'true');
  });
  dialog.addEventListener('close', () => {
    doc.documentElement.classList.remove('server-portal-open');
    trigger.setAttribute('aria-expanded', 'false'); trigger.focus();
  });
  return dialog;
}

if (typeof document !== 'undefined') mountServerPortal();
