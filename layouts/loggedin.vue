<template>
  <v-app>
    <v-card
      v-if="!hydrated || pageLoading"
      flat
      height="100vh"
      class="d-flex align-center justify-center"
    >
      <div class="superbazi-loader"></div>
    </v-card>

    <div v-show="hydrated && !pageLoading">
      <ClientOnly>
        <v-navigation-drawer
          v-model="drawer"
          :rail="rail && !isMobile"
          :temporary="isMobile"
          :permanent="!isMobile"
          class="sb-admin-drawer"
          width="276"
          rail-width="84"
        >
          <!-- <OrgSidebar
            :rail="rail && !isMobile"
            :active-path="route.path"
            @toggle-rail="rail = !rail"
          /> -->
          <AdminSidebar
            :rail="rail && !isMobile"
            :active-path="route.path"
            @toggle-rail="rail = !rail"
          />
        </v-navigation-drawer>

        <v-app-bar class="sb-admin-appbar" elevation="0">
          <AdminTopbar
            :is-mobile="isMobile"
            :rail="rail && !isMobile"
            @toggle-drawer="drawer = !drawer"
            @toggle-rail="rail = !rail"
          />
        </v-app-bar>
      </ClientOnly>
      <v-main>
        <v-container fluid class="px-8">
          <v-breadcrumbs :items="breadcrumbs" class="sb-breadcrumbs">
            <template #divider>
              <v-icon
                icon="lucide:chevron-right"
                size="16"
                class="text-medium-emphasis"
              />
            </template>
          </v-breadcrumbs>
        </v-container>

        <v-container fluid class="px-12">
          <slot />
        </v-container>
      </v-main>
    </div>

    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const { isMobile } = useIsMobile();
const route = useRoute();
const { pageLoading } = usePageLoading();

const hydrated = ref(false);
const authStore = useAuthStore();

useNotification(authStore.auth.id);

const drawer = ref(true);
const rail = ref(true);

const breadcrumbs = computed(() => {
  const metaCrumbs = (route.meta as any)?.breadcrumbs as
    | Array<{ title: string; disabled?: boolean; to?: string }>
    | undefined;

  if (metaCrumbs?.length) {
    return [
      ...[{ title: "Dashboard", disabled: false, to: "/" }],
      ...metaCrumbs,
    ];
  }

  const title = ((route.meta as any)?.title as string) || "Dashboard";
  return [{ title, disabled: true }];
});

onMounted(() => {
  hydrated.value = true;
});
</script>
