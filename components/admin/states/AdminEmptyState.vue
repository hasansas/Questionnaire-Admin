// /components/admin/states/AdminEmptyState.vue
<template>
  <v-card class="sb-admin-card sb-state" rounded="xl" variant="flat">
    <div class="sb-state__inner">
      <div class="sb-state__icon">
        <v-icon :icon="icon" size="22" />
      </div>

      <div class="sb-state__content">
        <div class="sb-state__title">{{ title }}</div>
        <div class="sb-state__desc sb-muted">{{ description }}</div>

        <div v-if="actionText" class="sb-state__actions">
          <v-btn color="primary" rounded="lg" @click="$emit('action')">
            <v-icon v-if="actionIcon" :icon="actionIcon" class="mr-2" />
            {{ actionText }}
          </v-btn>
        </div>

        <div v-else class="sb-state__slot">
          <slot />
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
    actionText?: string;
    actionIcon?: string;
  }>(),
  {
    title: "Nothing here yet",
    description: "Once you add items, they’ll show up here.",
    icon: "iconsax:box-1",
  }
);

defineEmits<{
  (e: "action"): void;
}>();
</script>

<style lang="scss" scoped>
// ===============================
// State: Empty
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
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
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
}

.sb-state__slot {
  margin-top: 12px;
}

// ===============================
// Utilities
// ===============================
.sb-muted {
  opacity: 0.7;
}
</style>
