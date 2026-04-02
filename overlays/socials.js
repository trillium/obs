// Reusable social links loader
// Usage: add <div id="socials"></div> to your HTML, include socials.css, then call loadSocials()
async function loadSocials(containerId = 'socials') {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const resp = await fetch('file:///Users/trilliumsmith/code/obs/overlays/socials.json?_=' + Date.now());
    const socials = await resp.json();

    container.className = 'socials';
    container.innerHTML = socials.map(s =>
      '<div class="social">' +
        '<span class="icon">' + s.icon + '</span>' +
        '<div>' +
          '<div class="platform">' + s.platform + '</div>' +
          '<div class="handle">' + s.handle + '</div>' +
        '</div>' +
      '</div>'
    ).join('');
  } catch (e) {
    // socials.json not available
  }
}