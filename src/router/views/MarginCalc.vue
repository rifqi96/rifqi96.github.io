<script setup lang="ts">
import MarginCalc from "@/components/MarginCalc.vue";
</script>

<template>
  <v-layout row wrap>
    <v-container fluid>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <h1>Margin Calculator</h1>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" sm="12" md="12">
          <MarginCalc />
        </v-col>
      </v-row>
    </v-container>
  </v-layout>
</template>
