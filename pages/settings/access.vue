<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Access Settings"
      subtitle="Optional placeholder for admin users, roles, and permission policies."
    />

    <v-row class="ga-4" no-gutters>
      <v-col cols="12" lg="6">
        <v-card rounded="xl" class="sb-card pa-6">
          <div class="d-flex align-start ga-3">
            <v-avatar size="44" rounded="xl" color="primary" variant="tonal">
              <v-icon icon="lucide:shield" size="20" />
            </v-avatar>
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">Admin access</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                In Phase 1, access is handled by middleware/guards. Add UI for
                admin users here later.
              </div>
            </div>
          </div>

          <v-divider class="my-4" />

          <v-alert variant="tonal" type="info" rounded="lg">
            UI only — placeholder.
          </v-alert>
        </v-card>
      </v-col>

      <v-col cols="12" lg="6">
        <v-card rounded="xl" class="sb-card pa-6">
          <div class="d-flex align-start ga-3">
            <v-avatar size="44" rounded="xl" color="secondary" variant="tonal">
              <v-icon icon="lucide:user-round-cog" size="20" />
            </v-avatar>
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">
                Roles & policies
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Define role templates and permission presets in a later phase.
              </div>
            </div>
          </div>

          <v-divider class="my-4" />

          <v-text-field
            label="Default org user role"
            variant="outlined"
            rounded="lg"
            placeholder="org_viewer"
          />
        </v-card>
      </v-col>
    </v-row>
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
