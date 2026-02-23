<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import DatabaseGrid from '$lib/components/DatabaseGrid.svelte';
  import FeatureSection from '$lib/components/FeatureSection.svelte';
  import { features } from '$lib/data/features';
</script>

<svelte:head>
  <title>QueryArk — One IDE for Every Database</title>
  <meta name="description" content="A fast, lightweight database IDE supporting 16 engines. Free, open source, cross-platform." />
  <link rel="canonical" href="https://queryark.com" />
  <meta property="og:title" content="QueryArk — One IDE for Every Database" />
  <meta property="og:description" content="A fast, lightweight database IDE supporting 16 engines. Free, open source, cross-platform." />
  <meta property="og:url" content="https://queryark.com" />
  <meta name="twitter:title" content="QueryArk — One IDE for Every Database" />
  <meta name="twitter:description" content="A fast, lightweight database IDE supporting 16 engines. Free, open source, cross-platform." />
  {@html `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "QueryArk",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "macOS, Windows, Linux",
    "description": "A fast, lightweight database IDE supporting 16 engines. Free, open source, cross-platform.",
    "url": "https://queryark.com",
    "downloadUrl": "https://queryark.com/download",
    "softwareVersion": "0.2.0",
    "license": "https://opensource.org/licenses/MIT",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
  })}</script>`}
</svelte:head>

<Hero />

<DatabaseGrid />

<section class="features section" id="features">
  <div class="container">
    <div class="features-header">
      <p class="section-label">Features</p>
      <h2 class="section-title">Everything You Need</h2>
      <p class="section-subtitle">
        A complete database toolkit — from writing queries to visualizing schemas.
      </p>
    </div>

    {#each features as feature, i}
      <FeatureSection {feature} reversed={i % 2 === 1} />
    {/each}
  </div>
</section>

<section class="cta section">
  <div class="container cta-content">
    <h2 class="cta-title">
      Free. Open Source.<br />No Catch.
    </h2>
    <p class="cta-desc">
      QueryArk is MIT-licensed and free forever. Download it now and start managing your databases faster.
    </p>
    <div class="cta-actions">
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
  </div>
</section>

<style>
  .features-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .cta {
    text-align: center;
    border-top: 1px solid var(--border-color);
    background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(122, 162, 247, 0.06) 0%, transparent 70%);
  }

  .cta-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .cta-title {
    font-size: clamp(32px, 5vw, 48px);
    font-weight: 900;
    letter-spacing: -1px;
    line-height: 1.15;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .cta-desc {
    font-size: 18px;
    color: var(--text-secondary);
    max-width: 520px;
    line-height: 1.6;
    margin-bottom: 36px;
  }

  .cta-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content: center;
  }

  @media (max-width: 768px) {
    .cta-actions {
      flex-direction: column;
      align-items: center;
    }
  }
</style>
