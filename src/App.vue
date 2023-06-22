<script setup lang="ts">
</script>

<template>
  <div class="max-w-screen min-h-screen overflow-hidden bg-fuchsia-50">
    <router-view />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: 'Be Vietnam Pro', Ubuntu, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: #0284c7;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #0369a1;
}

/* .ellips {
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-box-orient: vertical;
  display: block;
  display: -webkit-box;
} */
</style>