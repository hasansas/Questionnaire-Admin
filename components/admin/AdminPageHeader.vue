<template>
  <div class="d-flex align-center justify-space-between ga-3 flex-wrap mb-4">
    <div class="min-w-0">
      <slot name="heading">
        <div class="d-flex align-center ga-2 flex-wrap">
          <h1 class="text-h5 font-weight-black ma-0">{{ title }}</h1>

          <v-chip
            v-if="badge"
            size="small"
            variant="tonal"
            color="primary"
            class="sb-chip"
          >
            {{ badge }}
          </v-chip>
        </div>

        <p v-if="subtitle" class="text-body-2 text-medium-emphasis mt-1 mb-0">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <div class="d-flex align-center ga-2 flex-wrap justify-end">
      <!-- If slot actions is provided, use it and replace default buttons -->
      <slot name="actions">
        <!-- Default actions (fallback) -->
        <v-btn
          v-if="secondaryText"
          variant="outlined"
          rounded="lg"
          @click="$emit('secondary')"
        >
          <v-icon
            v-if="secondaryIcon"
            :icon="secondaryIcon"
            size="18"
            class="me-2"
          />
          {{ secondaryText }}
        </v-btn>

        <v-btn
          v-if="primaryText"
          color="primary"
          rounded="lg"
          @click="$emit('primary')"
        >
          <v-icon
            v-if="primaryIcon"
            :icon="primaryIcon"
            size="18"
            class="me-2"
          />
          {{ primaryText }}
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  badge?: string;
  primaryText?: string;
  primaryIcon?: string;
  secondaryText?: string;
  secondaryIcon?: string;
}>();

defineEmits<{
  (e: "primary"): void;
  (e: "secondary"): void;
}>();
</script>

<style lang="scss" scoped>
// ===============================
// Page header (minimal)
// ===============================
</style>
