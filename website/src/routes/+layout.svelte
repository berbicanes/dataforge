<script lang="ts">
  import '../app.css';
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let { children } = $props();
</script>

<svelte:head>
  <title>QueryArk — One IDE for Every Database</title>
</svelte:head>

<Nav />
<main>
  {@render children()}
</main>
<Footer />

<style>
  main {
    min-height: 100vh;
  }
</style>
