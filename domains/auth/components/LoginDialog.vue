<script setup lang="ts">
import { useAuth } from "../composables/useAuth";

const props = defineProps<{
  show: boolean;
}>();

const _show = ref(props.show);

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "login"): void;
}>();

const { loading, error, signInWithGoogle } = useAuth();

const rememberMe = ref(true);

const closeDialog = () => {
  emit("update:show", false);
};

const loginWithGoogle = async () => {
  await signInWithGoogle({ rememberMe: rememberMe.value });
  emit("login");
};
</script>

<template>
  <v-dialog v-model="_show" max-width="500px" persistent>
    <v-card class="auth-dialog">
      <v-toolbar color="primary" dark>
        <v-toolbar-title>Sign In Required</v-toolbar-title>
        <template v-slot:append>
          <v-btn icon @click="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-toolbar>

      <v-card-text class="pt-6">
        <div class="text-center mb-6">
          <v-img
            src="/logo.svg"
            alt="Rifqi Ruhyattamam"
            width="180"
            class="mx-auto mb-4"
          />
          <p class="text-body-1">Please sign in to access this feature</p>
        </div>

        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-checkbox
          :model-value="rememberMe ?? false"
          @update:model-value="(val) => (rememberMe = val ?? false)"
          label="Keep me signed in"
          color="primary"
          hide-details
          class="mb-4"
        ></v-checkbox>
      </v-card-text>

      <v-card-actions class="pb-6 px-6">
        <v-btn
          block
          color="primary"
          size="large"
          prepend-icon="mdi-google"
          :loading="loading"
          @click="loginWithGoogle"
        >
          Sign in with Google
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.auth-dialog {
  border-radius: 8px;
  overflow: hidden;
}
</style>
