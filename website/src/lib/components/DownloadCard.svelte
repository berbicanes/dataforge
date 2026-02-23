<script lang="ts">
  import type { PlatformDownload } from '$lib/data/downloads';

  let { platform }: { platform: PlatformDownload } = $props();

  const icons: Record<string, string> = {
    apple: 'M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.81-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11',
    windows: 'M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801',
    linux: 'M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a7.97 7.97 0 00-.789-.045c-1.758 0-3.012.81-3.012 2.127 0 1.052.784 1.857 1.95 2.22.29.092.582.158.872.203-.074.334-.109.69-.109 1.054C3.713 24.1 6.265 26 10.143 26c3.877 0 6.429-1.9 6.429-4.091 0-.363-.035-.72-.109-1.054.29-.045.582-.111.872-.203 1.166-.363 1.95-1.168 1.95-2.22 0-1.317-1.254-2.127-3.012-2.127-.275 0-.54.015-.789.045a3.85 3.85 0 00-.287-2.489c-.59-1.771-1.831-3.47-2.716-4.521-.75-1.067-.974-1.928-1.05-3.02-.065-1.491 1.056-5.965-3.17-6.298A4.93 4.93 0 0012.504 0',
  };
</script>

<div class="download-card">
  <div class="card-header">
    <svg class="platform-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d={icons[platform.icon] || icons.linux} />
    </svg>
    <h3>{platform.platform}</h3>
  </div>

  <p class="card-desc">{platform.description}</p>

  <div class="options">
    {#each platform.options as opt}
      <a
        href={opt.url}
        class="download-btn"
        class:primary={opt.primary}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M4 7l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12v2h12v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span class="btn-label">{opt.label}</span>
        {#if opt.arch}
          <span class="arch-badge">{opt.arch}</span>
        {/if}
      </a>
    {/each}
  </div>

  <p class="requirements">{platform.requirements}</p>
</div>

<style>
  .download-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    padding: 32px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: border-color 300ms ease, box-shadow 300ms ease;
    position: relative;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .platform-icon {
    color: var(--text-secondary);
  }

  h3 {
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .card-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  .download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    text-decoration: none;
    transition: background 200ms ease, border-color 200ms ease, transform 200ms ease;
  }

  .download-btn:hover {
    background: var(--bg-hover);
    border-color: var(--accent);
    transform: translateY(-1px);
    color: var(--text-primary);
  }

  .download-btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
    font-weight: 600;
  }

  .download-btn.primary:hover {
    background: var(--accent-hover);
    border-color: var(--accent-hover);
    color: #fff;
  }

  .btn-label {
    flex: 1;
  }

  .arch-badge {
    font-size: 10px;
    font-weight: 600;
    font-family: var(--font-mono);
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.1);
  }

  .download-btn.primary .arch-badge {
    background: rgba(255, 255, 255, 0.2);
  }

  .requirements {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: auto;
  }

  @media (max-width: 768px) {
    .download-card {
      padding: 24px;
    }
  }
</style>
