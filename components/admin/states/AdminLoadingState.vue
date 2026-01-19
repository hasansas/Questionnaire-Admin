// /components/admin/states/AdminLoadingState.vue
<template>
  <v-card class="sb-admin-card sb-loading" rounded="xl" variant="flat">
    <div class="sb-loading__inner">
      <v-skeleton-loader
        type="heading, paragraph"
        class="sb-loading__skeleton"
      />
      <v-skeleton-loader type="table" class="sb-loading__skeleton" />
    </div>
  </v-card>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
// ===============================
// State: Loading
// ===============================
.sb-admin-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
}

.sb-loading__inner {
  padding: 18px;
}

.sb-loading__skeleton {
  margin-top: 12px;
}
</style>
