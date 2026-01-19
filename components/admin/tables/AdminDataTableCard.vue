// /components/admin/tables/AdminDataTableCard.vue
<template>
  <v-card class="sb-admin-card sb-table-card" rounded="xl" variant="flat">
    <div class="sb-table-card__head">
      <div class="sb-table-card__head-left">
        <div class="sb-table-card__title">{{ title }}</div>
        <div v-if="subtitle" class="sb-table-card__subtitle sb-muted">
          {{ subtitle }}
        </div>
      </div>

      <div class="sb-table-card__head-right">
        <slot name="toolbar" />
      </div>
    </div>

    <v-divider class="sb-divider" />

    <div class="sb-table-card__body">
      <v-data-table
        :headers="headers"
        :items="items"
        :items-per-page="itemsPerPage"
        density="comfortable"
        class="sb-table"
      >
        <template #item.status="{ item }">
          <slot name="item.status" :item="item">
            <v-chip size="small" variant="tonal">{{
              (item as any).status
            }}</v-chip>
          </slot>
        </template>

        <template #item.actions="{ item }">
          <slot name="item.actions" :item="item" />
        </template>

        <template #no-data>
          <div class="sb-table-card__empty sb-muted">No rows to display.</div>
        </template>
      </v-data-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import type { DataTableHeader } from "vuetify";

defineProps<{
  title: string;
  subtitle?: string;
  headers: DataTableHeader[];
  items: any[];
  itemsPerPage?: number;
}>();
</script>

<style lang="scss" scoped>
// ===============================
// Table Card
// ===============================
.sb-admin-card {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface));
}

.sb-table-card__head {
  padding: 16px 16px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.sb-table-card__title {
  font-weight: 900;
  letter-spacing: 0.2px;
}

.sb-table-card__subtitle {
  margin-top: 4px;
  font-size: 13px;
  max-width: 680px;
}

.sb-table-card__head-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.sb-table-card__body {
  padding: 4px 8px 8px;
}

.sb-table :deep(.v-data-table__td),
.sb-table :deep(.v-data-table__th) {
  white-space: nowrap;
}

.sb-table :deep(.v-data-table-header__content) {
  font-weight: 800;
}

.sb-table-card__empty {
  padding: 16px;
}

.sb-divider {
  opacity: 0.5;
}

// ===============================
// Utilities
// ===============================
.sb-muted {
  opacity: 0.7;
}
</style>
