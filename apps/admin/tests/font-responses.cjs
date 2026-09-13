// Offline build validation only. Production uses the existing Google Fonts config.
module.exports = new Proxy({}, {
  get(_target, url) {
    const family = String(url).includes('family=Outfit') ? 'Outfit' : 'Inter';
    return `@font-face { font-family: '${family}'; src: local('Arial'); font-style: normal; font-weight: 100 900; font-display: swap; }`;
  },
});
