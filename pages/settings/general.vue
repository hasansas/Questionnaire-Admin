<template>
  <div class="sb-page">
    <AdminPageHeader
      title="General Settings"
      subtitle="Placeholder settings page for Phase 1 admin."
    />

    <v-card rounded="xl" class="sb-card pa-6">
      <div class="d-flex align-start ga-3">
        <v-avatar size="44" rounded="xl" color="primary" variant="tonal">
          <v-icon icon="lucide:settings" size="20" />
        </v-avatar>
        <div class="min-w-0">
          <div class="text-subtitle-1 font-weight-black">General</div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Add system-wide settings here (branding, timezone defaults, export
            preferences, retention policies).
          </div>
        </div>
      </div>

      <v-divider class="my-4" />

      <v-row class="ga-4" no-gutters>
        <v-col cols="12" md="6">
          <v-text-field
            label="Default timezone"
            variant="outlined"
            rounded="lg"
            placeholder="Asia/Jakarta"
          />
        </v-col>
        <v-col cols="12" md="6">
          <v-select
            :items="['en', 'id']"
            label="Default language"
            variant="outlined"
            rounded="lg"
            placeholder="en"
          />
        </v-col>
        <v-col cols="12">
          <v-alert variant="tonal" type="info" rounded="lg">
            UI only — this page is a placeholder in Phase 1.
          </v-alert>
        </v-col>
      </v-row>
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
