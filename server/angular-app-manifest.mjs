
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/brisanet-landing/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/brisanet-landing"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 457, hash: '5b5c08cae80358091355c1b870acd3aa5680b082540f512ba37427d8e4e097ea', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 970, hash: 'c51ee60788c6f3a2b515f59d00b3049f23e84acdecc0d91b5759540c1a01e968', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'index.html': {size: 21596, hash: '3bbee9d4659facf122ca4c5afb454a4d541dc4ef090d1a5786efbcef7d2c7298', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
