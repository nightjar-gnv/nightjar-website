<script setup>
import HelloWorld from './components/Landing.vue'
</script>

<template>
  <div>
    <a href="#" >
      <img src="./assets/nightjar_logo_black.png" class="logo nightjar" alt="Nightjar logo" />
    </a>
  </div>
  <HelloWorld msg="Nightjar" />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
