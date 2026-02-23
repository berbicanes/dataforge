<script lang="ts">
  import DeviceMockup from './DeviceMockup.svelte';
</script>

<section class="hero">
  <div class="hero-content container">
    <div class="hero-text">
      <h1 class="hero-title">
        <span class="hero-line">One IDE for</span>
        <span class="hero-line accent">Every Database</span>
      </h1>
      <p class="hero-subtitle">
        A fast, lightweight database management tool for developers. Connect to PostgreSQL, MySQL, MongoDB, Redis, and 12 more engines &mdash; all in one app.
      </p>
      <div class="hero-actions">
        <a href="/download" class="btn btn-primary btn-large">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path d="M8 2v8M4 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12v2h12v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          Download
        </a>
        <a href="https://github.com/berbicanes/queryark" class="btn btn-secondary btn-large" target="_blank" rel="noopener">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          View on GitHub
        </a>
      </div>
      <p class="hero-meta">Free &amp; open source &middot; macOS, Windows, Linux</p>
    </div>

    <div class="hero-mockup">
      <DeviceMockup type="laptop" />
    </div>
  </div>

  <div class="hero-glow"></div>
</section>

<style>
  .hero {
    position: relative;
    padding: 160px 0 100px;
    overflow: hidden;
  }

  .hero-glow {
    position: absolute;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 1000px;
    height: 600px;
    background: radial-gradient(ellipse, rgba(122, 162, 247, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 60px;
  }

  .hero-text {
    max-width: 700px;
  }

  .hero-title {
    font-size: clamp(40px, 8vw, 72px);
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -2px;
    margin-bottom: 24px;
  }

  .hero-line {
    display: block;
    color: var(--text-primary);
  }

  .hero-line.accent {
    color: var(--accent);
  }

  .hero-subtitle {
    font-size: clamp(16px, 2.5vw, 20px);
    color: var(--text-secondary);
    line-height: 1.6;
    margin-bottom: 36px;
  }

  .hero-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .hero-meta {
    margin-top: 16px;
    font-size: 13px;
    color: var(--text-muted);
  }

  .hero-mockup {
    width: 100%;
    max-width: 760px;
    display: flex;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .hero {
      padding: 120px 0 60px;
    }

    .hero-content {
      gap: 40px;
    }

    .hero-title {
      letter-spacing: -1px;
    }

    .hero-actions {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
