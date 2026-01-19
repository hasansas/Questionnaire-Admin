<template>
  <v-card class="sb-card sb-card--hover" rounded="xl" variant="flat">
    <div class="d-flex align-start justify-space-between pa-4 ga-3">
      <div class="min-w-0">
        <div
          class="text-caption text-medium-emphasis font-weight-bold text-uppercase"
        >
          {{ label }}
        </div>

        <div class="text-h4 font-weight-black mt-1">
          {{ value }}
        </div>

        <div v-if="delta" class="d-flex align-center ga-2 mt-3">
          <v-chip
            size="small"
            variant="tonal"
            class="sb-chip"
            :color="trend === 'down' ? 'error' : 'success'"
          >
            <v-icon
              :icon="
                trend === 'down' ? 'lucide:trending-down' : 'lucide:trending-up'
              "
              size="16"
              class="me-1"
            />
            {{ delta }}
          </v-chip>

          <span v-if="deltaNote" class="text-caption text-medium-emphasis">
            {{ deltaNote }}
          </span>
        </div>
      </div>

      <div class="sb-icon-surface">
        <v-icon :icon="icon" size="20" />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  icon: string;
  delta?: string;
  deltaNote?: string;
  trend?: "up" | "down";
}>();
</script>

<style lang="scss" scoped>
// ===============================
// Stat card (minimal)
// ===============================
</style>
