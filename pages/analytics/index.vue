<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Analytics"
      subtitle="Optional analytics overview placeholder for Phase 1."
    />

    <v-card rounded="xl" class="sb-card pa-6">
      <div class="d-flex align-start ga-3">
        <v-avatar size="44" rounded="xl" color="primary" variant="tonal">
          <v-icon icon="lucide:line-chart" size="20" />
        </v-avatar>
        <div class="min-w-0">
          <div class="text-subtitle-1 font-weight-black">
            Analytics overview
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Add charts for submissions over time, completion rates, and result
            label distribution.
          </div>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-alert variant="tonal" type="info" rounded="lg">
        UI only — placeholder page.
      </v-alert>
    </v-card>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
