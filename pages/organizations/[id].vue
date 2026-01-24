<!-- /pages/organizations/[id].vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader
      :title="org ? org.name : 'Organization'"
      :subtitle="
        org
          ? `Manage users, reports, and questionnaire assignments.`
          : 'Organization detail'
      "
      show-back
      back-to="/organizations"
    >
    </AdminPageHeader>

    <!-- 4 states -->
    <template v-if="ui.loading">
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text, text" />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <v-skeleton-loader type="heading, text" />
            </div>
            <v-divider />
            <div class="pa-4">
              <v-skeleton-loader type="table" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
    <template v-else-if="ui.error">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          {{ ui.error }}
        </v-alert>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="fetchDatahDetail"
            >Retry</v-btn
          >
          <v-btn rounded="lg" variant="outlined" to="/organizations"
            >Back to list</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else-if="!org">
      <v-card rounded="xl" class="sb-card pa-10">
        <div class="d-flex flex-column align-center text-center">
          <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
            <v-icon icon="lucide:building-2" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">
            Organization not found
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
            The requested organization does not exist in mock data.
          </div>
          <v-btn
            rounded="lg"
            color="primary"
            to="/organizations"
            prepend-icon="lucide:arrow-left"
          >
            Back to Organizations
          </v-btn>
        </div>
      </v-card>
    </template>

    <template v-else>
      <div class="d-flex flex-column ga-4">
        <!-- Tabs -->
        <v-card rounded="xl" class="sb-card">
          <v-tabs v-model="tab" class="px-2">
            <v-tab value="overview">
              <v-icon icon="lucide:layout-dashboard" size="18" class="me-2" />
              Overview
            </v-tab>

            <v-tab value="questionnaires">
              <v-icon icon="lucide:clipboard-list" size="18" class="me-2" />
              Questionnaires
            </v-tab>

            <v-tab value="reports">
              <v-icon icon="lucide:file-text" size="18" class="me-2" />
              Reports
            </v-tab>

            <v-tab value="users">
              <v-icon icon="lucide:users" size="18" class="me-2" />
              Org Users
            </v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-6">
                <OrgDetail :org="org" />
              </div>
            </v-window-item>

            <!-- Reports -->
            <v-window-item value="reports"> Reports </v-window-item>

            <!-- Questionnaires assignments -->
            <v-window-item value="questionnaires">
              Questionnaires
            </v-window-item>

            <!-- Users -->
            <v-window-item value="users">
              <div class="pa-6">
                <OrgUsers :organizationId="organizationId" />
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { type OrganizationModel } from "~/models/organization";

definePageMeta({
  middleware: ["auth"],
  title: "Organizations",
  breadcrumbs: [
    { title: "Organizations", disabled: false, to: "/organizations" },
    { title: "Manage", disabled: true },
  ],
});

const organizationId = computed(() => (route.params.id ?? "").toString());
const organizationsStore = useOrganizationsStore();

const org = ref<OrganizationModel | null>(null);

// -----------------------
// UI state (4 states)
// -----------------------
const ui = reactive({
  loading: true,
  error: "" as string | "",
});

async function fetchDatahDetail() {
  const getData = await organizationsStore.getById({
    id: organizationId.value,
  });
  ui.loading = false;

  if (!getData.success) {
    ui.error = "Unable to fetch organization detail.";
  }
  org.value = getData.data as OrganizationModel;
}

onMounted(() => fetchDatahDetail());

// -----------------------
// Route + org
// -----------------------
const route = useRoute();
// -----------------------
// Tabs
// -----------------------
type TabKey = "overview" | "users" | "reports" | "questionnaires";
const tab = ref<TabKey>("users");
</script>
