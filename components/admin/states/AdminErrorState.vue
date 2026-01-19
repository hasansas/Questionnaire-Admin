// /components/admin/states/AdminErrorState.vue
<template>
  <v-card
    class="sb-admin-card sb-state sb-state--error"
    rounded="xl"
    variant="flat"
  >
    <div class="sb-state__inner">
      <div class="sb-state__icon sb-state__icon--error">
        <v-icon :icon="icon" size="22" />
      </div>

      <div class="sb-state__content">
        <div class="sb-state__title">{{ title }}</div>
        <div class="sb-state__desc sb-muted">{{ description }}</div>

        <div class="sb-state__actions">
          <v-btn
            variant="tonal"
            color="error"
            rounded="lg"
            @click="$emit('retry')"
          >
            <v-icon icon="iconsax:refresh-2" class="mr-2" />
            Retry
          </v-btn>
          <v-btn variant="text" rounded="lg" class="sb-muted">
            View logs (mock)
          </v-btn>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    icon?: string;
  }>(),
  {
    title: "Something went wrong",
    description:
      "We couldn’t load this data. Try again, or check your connection.",
    icon: "iconsax:danger",
  }
);

defineEmits<{
  (e: "retry"): void;
}>();
</script>

<style lang="scss" scoped>
// ===============================
// State: Error
// ===============================
.sb-admin-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
}

.sb-state__inner {
  padding: 18px;
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.sb-state__icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
}

.sb-state__icon--error {
  background: rgba(var(--v-theme-error), 0.12);
  color: rgb(var(--v-theme-error));
}

.sb-state__title {
  font-weight: 900;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.sb-state__desc {
  margin-top: 6px;
  max-width: 560px;
}

.sb-state__actions {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

// ===============================
// Utilities
// ===============================
.sb-muted {
  opacity: 0.7;
}
</style>
