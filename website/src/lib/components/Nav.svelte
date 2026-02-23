<script lang="ts">
  let scrolled = $state(false);
  let mobileOpen = $state(false);

  $effect(() => {
    function onScroll() {
      scrolled = window.scrollY > 20;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  function closeMobile() {
    mobileOpen = false;
  }
</script>

<nav class="nav" class:scrolled>
  <div class="nav-inner container">
    <a href="/" class="nav-brand" onclick={closeMobile}>
      <svg class="brand-icon" width="28" height="28" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="10" rx="12" ry="5" stroke="var(--accent)" stroke-width="2" fill="rgba(122, 162, 247, 0.12)"/>
        <path d="M6 10v8c0 2.76 5.37 5 12 5s12-2.24 12-5v-8" stroke="var(--accent)" stroke-width="2" fill="none"/>
        <path d="M6 18v8c0 2.76 5.37 5 12 5s12-2.24 12-5v-8" stroke="var(--accent)" stroke-width="2" fill="none" opacity="0.6"/>
      </svg>
      <span class="brand-text">QueryArk</span>
    </a>

    <div class="nav-links" class:open={mobileOpen}>
      <a href="/#databases" class="nav-link" onclick={closeMobile}>Databases</a>
      <a href="/#features" class="nav-link" onclick={closeMobile}>Features</a>
      <a href="/download" class="nav-link" onclick={closeMobile}>Download</a>
      <a href="/docs" class="nav-link" onclick={closeMobile}>Docs</a>
      <a href="/changelog" class="nav-link" onclick={closeMobile}>Changelog</a>
      <a href="https://github.com/berbicanes/queryark" class="nav-link" target="_blank" rel="noopener">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        GitHub
      </a>
    </div>

    <button class="hamburger" onclick={() => mobileOpen = !mobileOpen} aria-label="Toggle menu">
      <span class="bar" class:open={mobileOpen}></span>
      <span class="bar" class:open={mobileOpen}></span>
      <span class="bar" class:open={mobileOpen}></span>
    </button>
  </div>
</nav>

<style>
  .nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 100;
    padding: 16px 0;
    transition: background 300ms ease, backdrop-filter 300ms ease, padding 300ms ease;
  }

  .nav.scrolled {
    background: rgba(26, 27, 46, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    padding: 12px 0;
    border-bottom: 1px solid var(--border-color);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text-primary);
  }

  .brand-icon {
    filter: drop-shadow(0 0 8px rgba(122, 162, 247, 0.3));
  }

  .brand-text {
    font-size: 20px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -0.5px;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .nav-link {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 200ms ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .nav-link:hover {
    color: var(--text-primary);
  }

  .hamburger {
    display: none;
    flex-direction: column;
    gap: 5px;
    padding: 4px;
    background: none;
    border: none;
    cursor: pointer;
  }

  .bar {
    width: 24px;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 2px;
    transition: transform 300ms ease, opacity 300ms ease;
  }

  .bar.open:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }

  .bar.open:nth-child(2) {
    opacity: 0;
  }

  .bar.open:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }

  @media (max-width: 768px) {
    .hamburger {
      display: flex;
    }

    .nav-links {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      gap: 0;
      background: rgba(26, 27, 46, 0.95);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-bottom: 1px solid var(--border-color);
      padding: 8px 0;
    }

    .nav-links.open {
      display: flex;
    }

    .nav-link {
      padding: 14px 24px;
      width: 100%;
      font-size: 15px;
    }

    .nav-link:hover {
      background: var(--bg-hover);
    }
  }
</style>
