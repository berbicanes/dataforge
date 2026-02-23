<script lang="ts">
  let { type = 'laptop' }: { type: 'laptop' | 'tablet' | 'phone' } = $props();
</script>

{#if type === 'laptop'}
  <div class="device laptop">
    <div class="laptop-screen">
      <div class="app-chrome">
        <div class="traffic-lights">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <span class="app-title">QueryArk</span>
      </div>
      <div class="app-body">
        <div class="sidebar">
          <div class="sidebar-header">
            <span class="conn-badge">PG</span>
            <span class="conn-name">Production PG</span>
            <span class="conn-status"></span>
          </div>
          <div class="tree">
            <div class="tree-item schema">
              <span class="arrow">&#9662;</span> public
            </div>
            <div class="tree-item table active">
              <span class="icon">&#9638;</span> users
            </div>
            <div class="tree-item table">
              <span class="icon">&#9638;</span> orders
            </div>
            <div class="tree-item table">
              <span class="icon">&#9638;</span> products
            </div>
            <div class="tree-item table">
              <span class="icon">&#9638;</span> payments
            </div>
          </div>
        </div>
        <div class="main-area">
          <div class="tab-bar">
            <span class="tab active">
              <span class="tab-badge">PG</span>
              Query 1
            </span>
            <span class="tab">users</span>
          </div>
          <div class="editor">
            <div class="editor-line">
              <span class="ln">1</span>
              <span class="kw">SELECT</span> u.id, u.name, u.email, u.role
            </div>
            <div class="editor-line">
              <span class="ln">2</span>
              <span class="kw">FROM</span> users u
            </div>
            <div class="editor-line">
              <span class="ln">3</span>
              <span class="kw">JOIN</span> orders o <span class="kw">ON</span> o.user_id = u.id
            </div>
            <div class="editor-line">
              <span class="ln">4</span>
              <span class="kw">WHERE</span> u.active = <span class="bool">true</span>
            </div>
            <div class="editor-line">
              <span class="ln">5</span>
              <span class="kw">ORDER BY</span> u.name <span class="kw">ASC</span>;
            </div>
          </div>
          <div class="grid">
            <div class="grid-header">
              <span class="gh">id</span>
              <span class="gh">name</span>
              <span class="gh">email</span>
              <span class="gh">role</span>
            </div>
            <div class="grid-row">
              <span class="gc num">1</span>
              <span class="gc">Alice Chen</span>
              <span class="gc str">alice@example.com</span>
              <span class="gc">admin</span>
            </div>
            <div class="grid-row">
              <span class="gc num">2</span>
              <span class="gc">Bob Smith</span>
              <span class="gc str">bob@example.com</span>
              <span class="gc">editor</span>
            </div>
            <div class="grid-row">
              <span class="gc num">3</span>
              <span class="gc">Carol Diaz</span>
              <span class="gc str">carol@example.com</span>
              <span class="gc">viewer</span>
            </div>
            <div class="grid-row">
              <span class="gc num">4</span>
              <span class="gc">Dave Kim</span>
              <span class="gc str">dave@example.com</span>
              <span class="gc">editor</span>
            </div>
          </div>
          <div class="status-bar">
            <span class="status-connected">&#9679; Connected</span>
            <span>localhost:5432</span>
            <span class="status-right">4 rows &middot; 12ms</span>
          </div>
        </div>
      </div>
    </div>
    <div class="laptop-base">
      <div class="laptop-notch"></div>
    </div>
  </div>
{:else if type === 'tablet'}
  <div class="device tablet">
    <div class="tablet-screen">
      <div class="app-chrome tablet-chrome">
        <div class="traffic-lights">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
        </div>
        <span class="app-title">QueryArk</span>
      </div>
      <div class="tablet-grid">
        <div class="grid-header">
          <span class="gh">id</span>
          <span class="gh">product</span>
          <span class="gh">price</span>
          <span class="gh">stock</span>
          <span class="gh">category</span>
          <span class="gh">rating</span>
        </div>
        <div class="grid-row">
          <span class="gc num">101</span>
          <span class="gc">Wireless Mouse</span>
          <span class="gc num">29.99</span>
          <span class="gc num">142</span>
          <span class="gc">Electronics</span>
          <span class="gc num">4.5</span>
        </div>
        <div class="grid-row">
          <span class="gc num">102</span>
          <span class="gc">USB-C Hub</span>
          <span class="gc num">49.99</span>
          <span class="gc num">87</span>
          <span class="gc">Electronics</span>
          <span class="gc num">4.2</span>
        </div>
        <div class="grid-row">
          <span class="gc num">103</span>
          <span class="gc">Desk Lamp</span>
          <span class="gc num">34.50</span>
          <span class="gc num">56</span>
          <span class="gc">Furniture</span>
          <span class="gc num">4.8</span>
        </div>
        <div class="grid-row">
          <span class="gc num">104</span>
          <span class="gc">Notebook Set</span>
          <span class="gc num">12.99</span>
          <span class="gc num">230</span>
          <span class="gc">Stationery</span>
          <span class="gc num">4.1</span>
        </div>
        <div class="grid-row">
          <span class="gc num">105</span>
          <span class="gc">Monitor Stand</span>
          <span class="gc num">79.00</span>
          <span class="gc num">34</span>
          <span class="gc">Furniture</span>
          <span class="gc num">4.6</span>
        </div>
        <div class="grid-row last">
          <span class="gc num">106</span>
          <span class="gc">Webcam HD</span>
          <span class="gc num">59.99</span>
          <span class="gc num">71</span>
          <span class="gc">Electronics</span>
          <span class="gc num">4.3</span>
        </div>
        <div class="tablet-pagination">
          <span>Page 1 of 12</span>
          <span class="page-btns">
            <span class="page-btn disabled">&lsaquo;</span>
            <span class="page-btn active">1</span>
            <span class="page-btn">2</span>
            <span class="page-btn">3</span>
            <span class="page-btn">&rsaquo;</span>
          </span>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="device phone">
    <div class="phone-screen">
      <div class="phone-status-bar">
        <span>9:41</span>
        <span class="phone-icons">
          <span>&#9679;&#9679;&#9679;</span>
        </span>
      </div>
      <div class="phone-header">
        <span class="phone-title">Connections</span>
      </div>
      <div class="phone-connections">
        <div class="phone-card" style="--card-color: #7aa2f7">
          <span class="phone-badge" style="background: rgba(122,162,247,0.2); color: #7aa2f7">PG</span>
          <div class="phone-card-info">
            <span class="phone-card-name">Production PG</span>
            <span class="phone-card-host">db.example.com:5432</span>
          </div>
          <span class="phone-status connected"></span>
        </div>
        <div class="phone-card" style="--card-color: #f9e2af">
          <span class="phone-badge" style="background: rgba(249,226,175,0.2); color: #f9e2af">MY</span>
          <div class="phone-card-info">
            <span class="phone-card-name">Staging MySQL</span>
            <span class="phone-card-host">staging.internal:3306</span>
          </div>
          <span class="phone-status"></span>
        </div>
        <div class="phone-card" style="--card-color: #f38ba8">
          <span class="phone-badge" style="background: rgba(243,139,168,0.2); color: #f38ba8">RD</span>
          <div class="phone-card-info">
            <span class="phone-card-name">Cache Redis</span>
            <span class="phone-card-host">redis.internal:6379</span>
          </div>
          <span class="phone-status connected"></span>
        </div>
        <div class="phone-card" style="--card-color: #74c7ec">
          <span class="phone-badge" style="background: rgba(116,199,236,0.2); color: #74c7ec">BQ</span>
          <div class="phone-card-info">
            <span class="phone-card-name">Analytics BQ</span>
            <span class="phone-card-host">my-project.analytics</span>
          </div>
          <span class="phone-status"></span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* === Shared === */
  .device {
    font-family: var(--font-sans);
    user-select: none;
  }

  /* === Laptop === */
  .laptop {
    width: 100%;
    max-width: 720px;
  }

  .laptop-screen {
    background: #1a1b2e;
    border: 2px solid #3a3b54;
    border-radius: 12px 12px 0 0;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .laptop-base {
    background: linear-gradient(180deg, #3a3b54 0%, #2d2e48 100%);
    height: 14px;
    border-radius: 0 0 6px 6px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .laptop-notch {
    width: 80px;
    height: 5px;
    background: #22233a;
    border-radius: 0 0 4px 4px;
  }

  .app-chrome {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #22233a;
    border-bottom: 1px solid #3a3b54;
  }

  .traffic-lights {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.red { background: #f38ba8; }
  .dot.yellow { background: #f9e2af; }
  .dot.green { background: #a6e3a1; }

  .app-title {
    font-size: 11px;
    font-weight: 600;
    color: #6c7086;
  }

  .app-body {
    display: flex;
    height: 280px;
  }

  /* Sidebar */
  .sidebar {
    width: 160px;
    background: #22233a;
    border-right: 1px solid #3a3b54;
    flex-shrink: 0;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 10px;
    border-bottom: 1px solid #3a3b54;
  }

  .conn-badge {
    font-size: 8px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 3px;
    background: rgba(122, 162, 247, 0.2);
    color: #7aa2f7;
  }

  .conn-name {
    font-size: 10px;
    font-weight: 600;
    color: #d0d8f4;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conn-status {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #a6e3a1;
    box-shadow: 0 0 4px rgba(166, 227, 161, 0.5);
    flex-shrink: 0;
  }

  .tree {
    padding: 6px 0;
  }

  .tree-item {
    padding: 3px 10px 3px 12px;
    font-size: 10px;
    color: #a6adc8;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .tree-item.schema {
    color: #d0d8f4;
    font-weight: 600;
  }

  .tree-item.table {
    padding-left: 24px;
  }

  .tree-item.active {
    background: rgba(122, 162, 247, 0.1);
    color: #7aa2f7;
  }

  .arrow {
    font-size: 7px;
    color: #6c7086;
  }

  .icon {
    font-size: 6px;
    color: #6c7086;
  }

  /* Main area */
  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .tab-bar {
    display: flex;
    gap: 0;
    background: #22233a;
    border-bottom: 1px solid #3a3b54;
    padding: 0 4px;
  }

  .tab {
    padding: 5px 12px;
    font-size: 9px;
    color: #6c7086;
    border-bottom: 2px solid transparent;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .tab.active {
    color: #d0d8f4;
    border-bottom-color: #7aa2f7;
  }

  .tab-badge {
    font-size: 7px;
    font-weight: 700;
    padding: 1px 4px;
    border-radius: 2px;
    background: rgba(122, 162, 247, 0.2);
    color: #7aa2f7;
  }

  /* Editor */
  .editor {
    padding: 8px 0;
    background: #1a1b2e;
    flex-shrink: 0;
    border-bottom: 1px solid #3a3b54;
  }

  .editor-line {
    padding: 1px 10px;
    font-family: var(--font-mono);
    font-size: 9.5px;
    line-height: 1.6;
    color: #d0d8f4;
    white-space: nowrap;
    overflow: hidden;
  }

  .ln {
    display: inline-block;
    width: 16px;
    text-align: right;
    color: #3a3b54;
    margin-right: 10px;
    font-size: 8px;
  }

  .kw { color: #7aa2f7; }
  .str { color: #a6e3a1; }
  .num { color: #f9e2af; }
  .bool { color: #f9e2af; }

  /* Grid */
  .grid {
    flex: 1;
    overflow: hidden;
    font-size: 9px;
  }

  .grid-header {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 80px;
    padding: 4px 10px;
    background: #22233a;
    border-bottom: 1px solid #3a3b54;
    font-weight: 600;
    color: #a6adc8;
  }

  .gh {
    padding: 2px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .grid-row {
    display: grid;
    grid-template-columns: 40px 1fr 1fr 80px;
    padding: 3px 10px;
    border-bottom: 1px solid rgba(58, 59, 84, 0.5);
    color: #d0d8f4;
  }

  .grid-row:hover {
    background: rgba(122, 162, 247, 0.05);
  }

  .gc {
    padding: 2px 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .gc.num { color: #f9e2af; }
  .gc.str { color: #a6e3a1; }

  /* Status bar */
  .status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 10px;
    background: #22233a;
    border-top: 1px solid #3a3b54;
    font-size: 8px;
    color: #6c7086;
  }

  .status-connected {
    color: #a6e3a1;
  }

  .status-right {
    margin-left: auto;
  }

  /* === Tablet === */
  .tablet {
    width: 100%;
    max-width: 540px;
  }

  .tablet-screen {
    background: #1a1b2e;
    border: 2px solid #3a3b54;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    padding: 0;
  }

  .tablet-chrome {
    border-radius: 0;
  }

  .tablet-grid {
    font-size: 9px;
  }

  .tablet-grid .grid-header {
    grid-template-columns: 50px 1fr 70px 60px 90px 60px;
  }

  .tablet-grid .grid-row {
    grid-template-columns: 50px 1fr 70px 60px 90px 60px;
  }

  .tablet-grid .grid-row.last {
    border-bottom: none;
  }

  .tablet-pagination {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 10px;
    background: #22233a;
    border-top: 1px solid #3a3b54;
    font-size: 8px;
    color: #6c7086;
  }

  .page-btns {
    display: flex;
    gap: 3px;
  }

  .page-btn {
    padding: 2px 6px;
    background: #2d2e48;
    border-radius: 3px;
    color: #a6adc8;
    font-size: 8px;
  }

  .page-btn.active {
    background: #7aa2f7;
    color: #fff;
  }

  .page-btn.disabled {
    opacity: 0.3;
  }

  /* === Phone === */
  .phone {
    width: 100%;
    max-width: 280px;
  }

  .phone-screen {
    background: #1a1b2e;
    border: 2px solid #3a3b54;
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    padding: 0;
  }

  .phone-status-bar {
    display: flex;
    justify-content: space-between;
    padding: 8px 16px 4px;
    font-size: 10px;
    font-weight: 600;
    color: #d0d8f4;
  }

  .phone-icons {
    font-size: 8px;
    color: #6c7086;
    letter-spacing: -1px;
  }

  .phone-header {
    padding: 8px 16px 12px;
  }

  .phone-title {
    font-size: 18px;
    font-weight: 700;
    color: #d0d8f4;
  }

  .phone-connections {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 12px 16px;
  }

  .phone-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #22233a;
    border: 1px solid #3a3b54;
    border-radius: 10px;
    border-left: 3px solid var(--card-color, #7aa2f7);
  }

  .phone-badge {
    font-size: 9px;
    font-weight: 700;
    padding: 3px 6px;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .phone-card-info {
    flex: 1;
    min-width: 0;
  }

  .phone-card-name {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #d0d8f4;
  }

  .phone-card-host {
    display: block;
    font-size: 9px;
    font-family: var(--font-mono);
    color: #6c7086;
    margin-top: 2px;
  }

  .phone-status {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #3a3b54;
    flex-shrink: 0;
  }

  .phone-status.connected {
    background: #a6e3a1;
    box-shadow: 0 0 6px rgba(166, 227, 161, 0.5);
  }

  /* === Responsive === */
  @media (max-width: 768px) {
    .app-body {
      height: 220px;
    }

    .sidebar {
      width: 120px;
    }

    .editor-line {
      font-size: 8px;
    }

    .laptop {
      max-width: 100%;
    }

    .tablet {
      max-width: 100%;
    }

    .phone {
      max-width: 240px;
    }
  }
</style>
