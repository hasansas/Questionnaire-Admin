<template>
  <v-app>
    <v-card
      v-if="!hydrated || pageLoading"
      flat
      height="100vh"
      class="d-flex align-center justify-center"
    >
      <div class="superbazi-loader"></div>
    </v-card>

    <v-main v-show="hydrated && !pageLoading">
      <slot />
    </v-main>

    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
const hydrated = ref(false);
const { pageLoading } = usePageLoading();

onMounted(() => {
  hydrated.value = true;
});
</script>
