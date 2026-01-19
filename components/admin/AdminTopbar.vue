<template>
  <div class="d-flex align-center w-100 px-3 py-2 ga-2">
    <div class="d-flex align-center ga-1 flex-1 min-w-0">
      <v-btn
        v-if="isMobile"
        variant="text"
        icon
        density="comfortable"
        aria-label="Toggle drawer"
        @click="$emit('toggle-drawer')"
      >
        <v-icon icon="lucide:menu" size="20" />
      </v-btn>

      <v-btn
        v-if="!isMobile"
        variant="text"
        icon
        density="comfortable"
        aria-label="Toggle rail"
        @click="$emit('toggle-rail')"
      >
        <v-icon
          :icon="rail ? 'lucide:panel-left-open' : 'lucide:panel-left-close'"
          size="20"
        />
      </v-btn>

      <div class="flex-1 min-w-0 ms-1" style="display: none"></div>

      <!-- <v-text-field
        density="compact"
        variant="outlined"
        rounded="lg"
        hide-details
        placeholder="Search users, reports, orders…"
        class="sb-input flex-1"
      >
        <template #prepend-inner>
          <v-icon icon="lucide:search" size="18" class="text-medium-emphasis" />
        </template>
      </v-text-field> -->
    </div>
    <v-spacer />
    <v-btn variant="text" icon density="comfortable" aria-label="Notifications">
      <v-badge dot color="primary" offset-x="6" offset-y="6">
        <v-icon icon="lucide:bell" size="20" />
      </v-badge>
    </v-btn>

    <v-menu location="bottom end" offset="10">
      <template #activator="{ props }">
        <v-btn v-bind="props" variant="text" rounded="lg" class="px-2">
          <v-avatar size="30" class="me-2" color="primary" variant="tonal">
            <v-icon icon="lucide:user" size="18" />
          </v-avatar>
          <div class="text-left d-none d-md-block me-2">
            <div class="text-body-2 font-weight-bold">Admin</div>
            <div class="text-caption text-medium-emphasis text-capitalize">
              {{ user?.name }}
            </div>
          </div>
          <v-icon
            icon="lucide:chevron-down"
            size="18"
            class="text-medium-emphasis"
          />
        </v-btn>
      </template>

      <v-list density="comfortable" min-width="220">
        <v-list-item>
          <template #prepend
            ><v-icon icon="lucide:user-pen" size="18"
          /></template>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>

        <v-list-item>
          <template #prepend
            ><v-icon icon="lucide:shield" size="18"
          /></template>
          <v-list-item-title>Security</v-list-item-title>
        </v-list-item>

        <v-divider class="sb-divider" />

        <v-list-item @click="handleLogout">
          <template #prepend
            ><v-icon icon="lucide:log-out" size="18"
          /></template>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isMobile: boolean;
  rail: boolean;
}>();

defineEmits<{
  (e: "toggle-drawer"): void;
  (e: "toggle-rail"): void;
}>();

const authStore = useAuthStore();
const userStore = useUsersStore();
const user = computed(() => userStore.user);

function handleLogout() {
  authStore.logout();
}
</script>

<style lang="scss" scoped>
// ===============================
// Topbar (minimal)
// ===============================
</style>
