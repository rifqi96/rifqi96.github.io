<template>
  <div id="app">
    <MarginCalc />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MarginCalc from "./components/MarginCalc.vue";

export default defineComponent({
  name: "App",
  components: {
    MarginCalc,
  },
});
</script>

<style>
/* You can include global styles here */
</style>
