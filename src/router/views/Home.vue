<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const redirectToMarginCalc = () => {
  router.push("/margin-calc");
};
</script>

<template>
  <v-container fluid class="text-center">
    <v-row justify="center" align="center" class="my-12">
      <v-col cols="12">
        <h1 class="text-h2 font-weight-bold mb-6">Margin Calculator</h1>
        <p class="text-subtitle-1 mb-8">
          A powerful tool for cryptocurrency traders to calculate margin,
          stop-loss, and take-profit levels.
        </p>
        <v-btn size="large" color="primary" @click="redirectToMarginCalc">
          Go to Calculator
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
