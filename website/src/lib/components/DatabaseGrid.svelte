<script lang="ts">
  import { databases, dbGroups } from '$lib/data/databases';
</script>

<section class="databases section" id="databases">
  <div class="container">
    <div class="section-header">
      <p class="section-label">Compatibility</p>
      <h2 class="section-title">One App. Every Engine.</h2>
      <p class="section-subtitle">
        Connect to 16 database engines with a single tool. SQL, NoSQL, analytics, and cloud databases — all with native drivers.
      </p>
    </div>

    <div class="groups">
      {#each dbGroups as group}
        <div class="group">
          <h3 class="group-label">{group}</h3>
          <div class="db-cards">
            {#each databases.filter(d => d.group === group) as db}
              <div class="db-card">
                <span class="db-badge" style="background: {db.bgColor}; color: {db.color}">{db.badge}</span>
                <span class="db-name">{db.name}</span>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .databases {
    border-top: 1px solid var(--border-color);
  }

  .section-header {
    text-align: center;
    margin-bottom: 64px;
  }

  .groups {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 32px;
  }

  .group-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--text-muted);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
  }

  .db-cards {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .db-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    transition: border-color 200ms ease, transform 200ms ease;
  }

  .db-card:hover {
    border-color: var(--accent);
    transform: translateX(4px);
  }

  .db-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 7px;
    border-radius: 4px;
    font-family: var(--font-mono);
    flex-shrink: 0;
  }

  .db-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-primary);
  }

  @media (max-width: 1024px) {
    .groups {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 600px) {
    .groups {
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .db-card {
      padding: 8px 10px;
    }

    .db-name {
      font-size: 13px;
    }
  }
</style>
