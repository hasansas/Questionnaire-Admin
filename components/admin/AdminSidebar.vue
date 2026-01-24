<template>
  <div class="d-flex flex-column h-100 pa-3">
    <div class="d-flex align-center ga-3 px-2 py-2">
      <div :class="rail ? 'mx-2' : ''">
        <v-avatar :size="rail ? 26 : 34" color="#0cad43">
          <v-avatar :size="rail ? 24 : 32">
            <img
              src="/images/superbazi-icon.png"
              alt="superbazi icon"
              height="100%"
            />
          </v-avatar>
        </v-avatar>
      </div>

      <div v-if="!rail" class="min-w-0">
        <div class="font-weight-black text-body-1">SuperBazi</div>
        <div class="text-caption text-medium-emphasis">Admin Console</div>
      </div>
    </div>

    <v-divider class="sb-divider my-2" />

    <div class="px-1">
      <v-list nav density="comfortable" class="py-1 px-0">
        <!-- Main Menu -->
        <v-list-subheader v-if="!rail" class="text-overline">
          Main Menu
        </v-list-subheader>

        <v-tooltip
          v-for="item in navItems"
          :key="item.title"
          :text="item.title"
          location="end"
          :disabled="!rail"
          open-delay="150"
        >
          <template #activator="{ props: tipProps }">
            <v-list-item
              v-bind="tipProps"
              :to="item.to"
              :active="route.path === item.to"
              active-class="nav-link--active"
            >
              <template #prepend>
                <v-avatar size="20" class="rounded-0 mx-2">
                  <v-icon
                    :icon="item.icon"
                    size="20"
                    :color="route.path === item.to ? 'primary' : ''"
                  />
                </v-avatar>
              </template>

              <v-list-item-title v-if="!rail">{{
                item.title
              }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-tooltip>

        <!-- Settings -->
        <v-divider v-if="rail" class="sb-divider my-2" />
        <v-list-subheader v-if="!rail" class="text-overline">
          Settings
        </v-list-subheader>

        <v-tooltip
          v-for="item in settingNavItems"
          :key="item.title"
          :text="item.title"
          location="end"
          :disabled="!rail"
          open-delay="150"
        >
          <template #activator="{ props: tipProps }">
            <v-list-item
              v-bind="tipProps"
              :to="item.to"
              :active="route.path === item.to"
              active-class="nav-link--active"
            >
              <template #prepend>
                <v-avatar size="20" class="rounded-0 mx-2">
                  <v-icon
                    :icon="item.icon"
                    size="20"
                    :color="route.path === item.to ? 'primary' : ''"
                  />
                </v-avatar>
              </template>

              <v-list-item-title v-if="!rail">{{
                item.title
              }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-tooltip>
      </v-list>
    </div>

    <v-spacer />

    <v-divider class="sb-divider my-2" />
    <v-list nav density="comfortable" class="py-1">
      <v-list-item>
        <template #prepend>
          <v-avatar size="20" class="rounded-0 mx-2">
            <v-icon icon="lucide:info" size="20" />
          </v-avatar>
        </template>
        <v-list-item-title>About</v-list-item-title>
      </v-list-item>
    </v-list>

    <!-- <v-list nav density="comfortable" class="py-0 px-1">
      <v-menu v-model="menuVisible" location="bottom end" offset="8">
        <template #activator="{ props }">
          <v-list-item
            v-bind="props"
            :active="activePath === '/settings'"
            rounded="lg"
          >
            <template #prepend>
              <v-avatar size="20" class="rounded-0 mx-2">
                <v-icon icon="lucide:settings" size="20" />
              </v-avatar>
            </template>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
        </template>
        <v-card variant="outlined" rounded="lg" class="pa-0">
          <v-list nav density="comfortable" class="pa-0 ma-0">
            <v-list-item
              v-for="item in settingNavItems"
              :key="item.name"
              :to="item.to"
            >
              <template #prepend>
                <v-avatar size="20" class="rounded-0 mx-2">
                  <v-icon icon="lucide:settings" size="20" />
                </v-avatar>
              </template>
              <v-list-item-title>{{ item.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-list> -->
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router";

interface NavItem {
  title: string;
  to: string;
  icon: string;
}

defineProps<{
  rail: boolean;
  activePath: string;
}>();

defineEmits<{
  (e: "toggle-rail"): void;
}>();

const route = useRoute();

const navItems: NavItem[] = [
  { title: "Dashboard", to: "/", icon: "lucide:home" },
  { title: "Organizations", to: "/organizations", icon: "lucide:building-2" },
  {
    title: "Questionnaires",
    to: "/questionnaires",
    icon: "lucide:clipboard-list",
  },
  { title: "User Fields", to: "/user-fields", icon: "lucide:form-input" },
  { title: "Reports", to: "/reports", icon: "lucide:file-text" },
  { title: "Analytics", to: "/analytics", icon: "lucide:line-chart" },
];

const settingNavItems: NavItem[] = [
  { title: "General", to: "/settings/general", icon: "lucide:settings" },
  { title: "Access", to: "/settings/access", icon: "lucide:shield" },
];
</script>

<style lang="scss" scoped>
.nav-link:hover,
.nav-link--active {
  background: var(--color-primary-soften) !important;
  color: var(--color-primary) !important;
  position: relative;

  .v-icon {
    color: var(--color-primary) !important;
  }
}

:deep(.v-overlay__content) {
  > .v-card {
    box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px !important; /* Softer shadow */
  }
}
</style>
