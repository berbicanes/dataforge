<script lang="ts">
  import { page } from '$app/state';
</script>

<svelte:head>
  <title>Page Not Found — QueryArk</title>
</svelte:head>

<section class="error-page">
  <div class="container">
    <span class="error-code">{page.status}</span>
    <h1>Page not found</h1>
    <p>The page you're looking for doesn't exist or has been moved.</p>
    <div class="error-actions">
      <a href="/" class="btn btn-primary">Back to Home</a>
      <a href="/download" class="btn btn-secondary">Download</a>
    </div>
  </div>
</section>

<style>
  .error-page {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
  }

  .error-code {
    font-size: 120px;
    font-weight: 900;
    color: var(--bg-tertiary);
    line-height: 1;
    letter-spacing: -4px;
  }

  h1 {
    font-size: 32px;
    font-weight: 800;
    color: var(--text-primary);
    margin: 8px 0 12px;
  }

  p {
    font-size: 16px;
    color: var(--text-secondary);
    margin-bottom: 32px;
  }

  .error-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
</style>
