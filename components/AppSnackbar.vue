<template>
  <v-snackbar
    v-model="show"
    :color="color"
    location="bottom right"
    :timeout="timeout"
    rounded="lg"
    transition="slide-x-reverse-transition"
    class="sb-app-snackbar"
  >
    <div class="d-flex align-center ga-3">
      <v-icon :icon="iconName" size="18" />
      <span class="text-body-2 font-weight-medium">{{ text }}</span>
    </div>

    <template #actions>
      <v-btn variant="text" class="text-white" @click="close"> Close </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
const { show, text, color, timeout, close } = useAppSnackbar();

const iconName = computed(() => {
  if (color.value === "success") return "lucide:check-circle";
  if (color.value === "warning") return "lucide:triangle-alert";
  if (color.value === "error") return "lucide:x-circle";
  return "lucide:info";
});
</script>

<style scoped lang="scss">
/* Optional: a bit of spacing from edges + nicer width */
.sb-app-snackbar :deep(.v-overlay__content) {
  margin: 16px;
}

.sb-app-snackbar :deep(.v-snackbar__wrapper) {
  min-width: 320px;
  max-width: 420px;
}
</style>
