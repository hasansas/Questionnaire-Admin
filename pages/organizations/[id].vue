<!-- /pages/organizations/[id].vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader
      :title="org ? org.name : 'Organization'"
      :subtitle="
        org
          ? `Code: ${org.code} · Manage users, reports, and questionnaire assignments.`
          : 'Organization detail'
      "
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:arrow-left"
            to="/organizations"
          >
            Back
          </v-btn>

          <v-btn
            v-if="org"
            rounded="lg"
            color="primary"
            prepend-icon="lucide:plus"
            @click="openAssignDialog"
          >
            Assign questionnaire
          </v-btn>
        </div>
      </template>
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
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
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
        <!-- Top summary -->
        <v-row>
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="d-flex align-center ga-2 flex-wrap">
                    <div class="text-subtitle-1 font-weight-black">
                      {{ org.name }}
                    </div>
                    <v-chip size="small" variant="tonal">
                      {{ org.code }}
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="primary">
                      Active
                    </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis mt-2">
                    Manage organization access and assign questionnaires for
                    reporting.
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap mt-4">
                    <v-chip size="small" variant="tonal">
                      Users:
                      <span class="ms-1 font-weight-bold">{{
                        orgUsers.length
                      }}</span>
                    </v-chip>
                    <v-chip size="small" variant="tonal">
                      Reports:
                      <span class="ms-1 font-weight-bold">{{
                        orgReports.length
                      }}</span>
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="primary">
                      Assigned:
                      <span class="ms-1 font-weight-bold">{{
                        assignedRows.length
                      }}</span>
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:file-text"
                    to="/reports"
                  >
                    View reports
                  </v-btn>
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:users"
                    to="/org-users"
                  >
                    Org users
                  </v-btn>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="text-subtitle-1 font-weight-black">Quick actions</div>
              <div class="text-caption text-medium-emphasis">
                Common tasks for this org
              </div>

              <v-divider class="my-4" />

              <div class="d-flex flex-column ga-2">
                <v-btn
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:clipboard-list"
                  @click="tab = 'questionnaires'"
                >
                  Manage assignments
                </v-btn>
                <v-btn
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:download"
                >
                  Export reports (UI)
                </v-btn>
                <v-btn
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:settings"
                >
                  Org settings (UI)
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs -->
        <v-card rounded="xl" class="sb-card">
          <v-tabs v-model="tab" class="px-2">
            <v-tab value="overview">Overview</v-tab>
            <v-tab value="users">Org Users</v-tab>
            <v-tab value="reports">Reports</v-tab>
            <v-tab value="questionnaires">Questionnaires</v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-6">
                <v-row>
                  <v-col cols="12" lg="7">
                    <v-card rounded="xl" variant="tonal" class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Organization info
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Basic details
                          </div>
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:pencil"
                        >
                          Edit (UI)
                        </v-btn>
                      </div>

                      <v-divider class="my-4" />

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Name
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ org.name }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Code
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ org.code }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Timezone
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            Asia/Jakarta
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Status
                          </div>
                          <div class="text-body-2 font-weight-bold">active</div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="5">
                    <v-card rounded="xl" class="pa-4">
                      <div class="d-flex align-center justify-space-between">
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Assigned questionnaires
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Active access for this org
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal" color="primary">
                          {{ assignedRows.length }}
                        </v-chip>
                      </div>

                      <v-divider class="my-4" />

                      <div
                        v-if="assignedRows.length === 0"
                        class="text-caption text-medium-emphasis"
                      >
                        No questionnaires assigned yet.
                      </div>

                      <div v-else class="d-flex flex-column ga-2">
                        <v-card
                          v-for="r in assignedRows.slice(0, 4)"
                          :key="r.id"
                          rounded="xl"
                          variant="tonal"
                          class="pa-3"
                        >
                          <div
                            class="d-flex align-start justify-space-between ga-3"
                          >
                            <div class="min-w-0">
                              <div
                                class="text-body-2 font-weight-bold text-truncate"
                              >
                                {{ r.questionnaire.title }}
                              </div>
                              <div class="text-caption text-medium-emphasis">
                                {{ r.questionnaire.code }} · v{{
                                  r.questionnaire.version
                                }}
                              </div>
                            </div>
                            <v-chip
                              size="small"
                              variant="tonal"
                              :color="r.is_active ? 'success' : 'warning'"
                            >
                              {{ r.is_active ? "Active" : "Inactive" }}
                            </v-chip>
                          </div>
                        </v-card>

                        <v-btn
                          v-if="assignedRows.length > 4"
                          rounded="lg"
                          variant="text"
                          prepend-icon="lucide:arrow-right"
                          @click="tab = 'questionnaires'"
                        >
                          View all
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Users -->
            <v-window-item value="users">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Organization users
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      View-only accounts (Phase 1)
                    </div>
                  </div>

                  <v-btn
                    rounded="lg"
                    color="primary"
                    prepend-icon="lucide:plus"
                  >
                    Add user (UI)
                  </v-btn>
                </div>

                <v-card rounded="xl" class="sb-card">
                  <v-data-table
                    :headers="orgUserHeaders"
                    :items="orgUsers"
                    item-key="id"
                    density="comfortable"
                  >
                    <template #item.status="{ item }">
                      <v-chip
                        size="small"
                        :color="
                          item.status === 'active' ? 'success' : 'warning'
                        "
                        variant="tonal"
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>

                    <template #item.actions>
                      <div class="d-flex justify-end ga-1">
                        <v-btn icon variant="text" aria-label="Edit user">
                          <v-icon icon="lucide:pencil" />
                        </v-btn>
                        <v-btn icon variant="text" aria-label="More actions">
                          <v-icon icon="lucide:more-horizontal" />
                          <v-menu activator="parent" location="bottom end">
                            <v-list density="compact">
                              <v-list-item title="Disable (UI)" />
                              <v-list-item title="Reset password (UI)" />
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-card>
              </div>
            </v-window-item>

            <!-- Reports -->
            <v-window-item value="reports">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">Reports</div>
                    <div class="text-caption text-medium-emphasis">
                      Submissions for this organization (mock)
                    </div>
                  </div>

                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:download"
                  >
                    Export (UI)
                  </v-btn>
                </div>

                <v-card rounded="xl" class="sb-card">
                  <v-data-table
                    :headers="reportHeaders"
                    :items="orgReports"
                    item-key="id"
                    density="comfortable"
                  >
                    <template #item.status="{ item }">
                      <v-chip
                        size="small"
                        :color="
                          item.status === 'submitted' ? 'success' : 'warning'
                        "
                        variant="tonal"
                      >
                        {{ item.status }}
                      </v-chip>
                    </template>

                    <template #item.actions="{ item }">
                      <div class="d-flex justify-end ga-1">
                        <v-btn
                          icon
                          variant="text"
                          :to="`/reports/${item.id}`"
                          aria-label="View report"
                        >
                          <v-icon icon="lucide:arrow-right" />
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-card>
              </div>
            </v-window-item>

            <!-- Questionnaires assignments -->
            <v-window-item value="questionnaires">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Questionnaire assignments
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Control which questionnaires are available for this
                      organization.
                    </div>
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-text-field
                      v-model="assignmentSearch"
                      density="comfortable"
                      variant="outlined"
                      rounded="lg"
                      prepend-inner-icon="lucide:search"
                      placeholder="Search code or title..."
                      hide-details
                      class="sb-search"
                    />

                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openAssignDialog"
                    >
                      Assign questionnaire
                    </v-btn>
                  </div>
                </div>

                <template v-if="filteredAssignedRows.length === 0">
                  <v-card rounded="xl" class="sb-card pa-10">
                    <div class="d-flex flex-column align-center text-center">
                      <v-avatar
                        size="56"
                        color="primary"
                        variant="tonal"
                        class="mb-3"
                      >
                        <v-icon icon="lucide:clipboard-list" />
                      </v-avatar>
                      <div class="text-subtitle-1 font-weight-bold">
                        No assignments
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                        Assign a questionnaire so this organization can collect
                        submissions.
                      </div>
                      <div class="d-flex ga-2 flex-wrap justify-center">
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          @click="assignmentSearch = ''"
                        >
                          Clear search
                        </v-btn>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openAssignDialog"
                        >
                          Assign questionnaire
                        </v-btn>
                      </div>
                    </div>
                  </v-card>
                </template>

                <template v-else>
                  <v-card rounded="xl" class="sb-card">
                    <div
                      class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                    >
                      <div class="d-flex align-center ga-2 flex-wrap">
                        <v-chip size="small" variant="tonal"
                          >Assigned: {{ assignedRows.length }}</v-chip
                        >
                        <v-chip size="small" variant="tonal" color="primary">
                          Showing: {{ filteredAssignedRows.length }}
                        </v-chip>
                      </div>

                      <v-btn
                        rounded="lg"
                        variant="text"
                        prepend-icon="lucide:refresh-cw"
                        @click="assignmentSearch = ''"
                      >
                        Reset
                      </v-btn>
                    </div>

                    <v-divider />

                    <v-data-table
                      :headers="assignmentHeaders"
                      :items="filteredAssignedRows"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.questionnaire="{ item }">
                        <div class="min-w-0">
                          <div class="font-weight-semibold text-truncate">
                            {{ item.questionnaire.title }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{ item.questionnaire.code }} · v{{
                              item.questionnaire.version
                            }}
                          </div>
                        </div>
                      </template>

                      <template #item.scoring="{ item }">
                        <v-chip size="small" variant="tonal" color="primary">
                          {{
                            item.questionnaire.scoring_type ===
                            "multi_dimension"
                              ? "Multi-dimension"
                              : "Total score"
                          }}
                        </v-chip>
                      </template>

                      <template #item.status="{ item }">
                        <v-chip
                          size="small"
                          :color="item.is_active ? 'success' : 'warning'"
                          variant="tonal"
                        >
                          {{ item.is_active ? "Active" : "Inactive" }}
                        </v-chip>
                      </template>

                      <template #item.assigned_at="{ item }">
                        <div class="text-body-2">
                          {{ formatDate(item.assigned_at) }}
                        </div>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end ga-1">
                          <v-btn
                            icon
                            variant="text"
                            :to="`/questionnaires/${item.questionnaire_id}`"
                            aria-label="View questionnaire"
                          >
                            <v-icon icon="lucide:arrow-right" />
                          </v-btn>

                          <v-btn icon variant="text" aria-label="More actions">
                            <v-icon icon="lucide:more-horizontal" />
                            <v-menu activator="parent" location="bottom end">
                              <v-list density="compact">
                                <v-list-item
                                  title="Toggle active (UI)"
                                  @click="toggleActive(item.id)"
                                />
                                <v-list-item
                                  title="Unassign (UI)"
                                  @click="askUnassign(item.id)"
                                />
                              </v-list>
                            </v-menu>
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </v-card>
                </template>

                <!-- Assign dialog -->
                <v-dialog v-model="assignDialog" max-width="820">
                  <v-card rounded="xl">
                    <v-card-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        Assign questionnaire
                      </div>
                      <v-btn icon variant="text" @click="assignDialog = false">
                        <v-icon icon="lucide:x" />
                      </v-btn>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-6">
                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12">
                          <v-autocomplete
                            v-model="assignForm.questionnaire_id"
                            :items="availableQuestionnaireItems"
                            item-title="title"
                            item-value="value"
                            label="Select questionnaire"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            prepend-inner-icon="lucide:clipboard-list"
                            hint="Only unassigned questionnaires are shown."
                            persistent-hint
                            :disabled="availableQuestionnaireItems.length === 0"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-select
                            v-model="assignForm.is_active"
                            :items="activeItems"
                            item-title="title"
                            item-value="value"
                            label="Active"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                          />
                        </v-col>

                        <v-col cols="12" md="6">
                          <v-card rounded="xl" variant="tonal" class="pa-4">
                            <div class="text-body-2 font-weight-bold">
                              Notes
                            </div>
                            <div class="text-caption text-medium-emphasis mt-1">
                              You can assign multiple questionnaires to one
                              organization. Reports will track submissions by
                              org + questionnaire.
                            </div>
                          </v-card>
                        </v-col>

                        <v-col
                          cols="12"
                          v-if="availableQuestionnaireItems.length === 0"
                        >
                          <v-alert type="info" variant="tonal" rounded="lg">
                            All questionnaires are already assigned to this
                            organization.
                          </v-alert>
                        </v-col>
                      </v-row>
                    </v-card-text>

                    <v-divider />

                    <v-card-actions class="pa-4">
                      <v-btn
                        rounded="lg"
                        variant="text"
                        @click="assignDialog = false"
                        >Cancel</v-btn
                      >
                      <v-spacer />
                      <v-btn
                        rounded="lg"
                        color="primary"
                        prepend-icon="lucide:plus"
                        :disabled="!assignForm.questionnaire_id"
                        @click="confirmAssign"
                      >
                        Assign
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <!-- Unassign confirm -->
                <v-dialog v-model="unassignDialog" max-width="560">
                  <v-card rounded="xl">
                    <v-card-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        Unassign questionnaire
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        @click="unassignDialog = false"
                      >
                        <v-icon icon="lucide:x" />
                      </v-btn>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-6">
                      <v-alert
                        type="warning"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        This is UI-only. In real behavior, you should decide
                        whether to keep historical reports.
                      </v-alert>

                      <div class="text-body-2">
                        Remove access for:
                        <span class="font-weight-bold">{{
                          unassignTarget?.questionnaire.title || "—"
                        }}</span>
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        Org: {{ org.name }} ({{ org.code }})
                      </div>
                    </v-card-text>

                    <v-divider />

                    <v-card-actions class="pa-4">
                      <v-btn
                        rounded="lg"
                        variant="text"
                        @click="unassignDialog = false"
                        >Cancel</v-btn
                      >
                      <v-spacer />
                      <v-btn
                        rounded="lg"
                        color="error"
                        prepend-icon="lucide:trash-2"
                        @click="confirmUnassign"
                      >
                        Unassign
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
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

import type { Organization, Questionnaire } from "~/utils/mockPublicData";
import { organizations, questionnaires } from "~/utils/mockPublicData";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

// -----------------------
// UI state (4 states)
// -----------------------
const ui = reactive({
  loading: true,
  error: "" as string | "",
});

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
  }, 220);
}

onMounted(() => reload());

// -----------------------
// Route + org
// -----------------------
const route = useRoute();
const id = computed(() => (route.params.id ?? "").toString());

const org = computed<Organization | undefined>(() =>
  organizations.find((o) => o.id === id.value),
);

// -----------------------
// Tabs
// -----------------------
type TabKey = "overview" | "users" | "reports" | "questionnaires";
const tab = ref<TabKey>("overview");

// -----------------------
// Mock org users + reports (local, UI only)
// -----------------------
type OrgUser = {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: "org_viewer";
  status: "active" | "disabled";
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

type OrgReportRow = {
  id: string;
  organization_id: string;
  questionnaire_id: string;
  questionnaire_version: number;
  status: "submitted" | "started";
  submitted_at: string | null;
  result_label: string;
};

const orgUsersAll = ref<OrgUser[]>([
  {
    id: "ou-001",
    organization_id: "org-001",
    email: "wali.kelas@sma1jkt.sch.id",
    name: "Ibu Rani",
    role: "org_viewer",
    status: "active",
    last_login_at: "2026-01-18T09:12:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "ou-002",
    organization_id: "org-001",
    email: "bk@sma1jkt.sch.id",
    name: "Pak Dimas",
    role: "org_viewer",
    status: "active",
    last_login_at: "2026-01-16T05:22:00Z",
    created_at: "2026-01-03T00:00:00Z",
    updated_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "ou-003",
    organization_id: "org-002",
    email: "guru@smp5bdg.sch.id",
    name: "Bu Sinta",
    role: "org_viewer",
    status: "disabled",
    last_login_at: null,
    created_at: "2026-01-06T00:00:00Z",
    updated_at: "2026-01-12T00:00:00Z",
  },
]);

const orgReportsAll = ref<OrgReportRow[]>([
  {
    id: "rep-001",
    organization_id: "org-001",
    questionnaire_id: "q-gb-001",
    questionnaire_version: 1,
    status: "submitted",
    submitted_at: "2026-01-19T10:02:00Z",
    result_label: "VISUAL",
  },
  {
    id: "rep-002",
    organization_id: "org-001",
    questionnaire_id: "q-gb-001",
    questionnaire_version: 1,
    status: "submitted",
    submitted_at: "2026-01-18T11:44:00Z",
    result_label: "AUDITORI",
  },
  {
    id: "rep-003",
    organization_id: "org-002",
    questionnaire_id: "q-gb-001",
    questionnaire_version: 1,
    status: "started",
    submitted_at: null,
    result_label: "—",
  },
]);

const orgUsers = computed(() =>
  orgUsersAll.value.filter((u) => u.organization_id === id.value),
);
const orgReports = computed(() =>
  orgReportsAll.value.filter((r) => r.organization_id === id.value),
);

const orgUserHeaders = [
  { title: "Name", key: "name", sortable: false },
  { title: "Email", key: "email", sortable: false },
  { title: "Role", key: "role", sortable: false, width: 140 },
  { title: "Status", key: "status", sortable: false, width: 140 },
  { title: "Last login", key: "last_login_at", sortable: false, width: 170 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];

const reportHeaders = [
  { title: "Report ID", key: "id", sortable: false },
  {
    title: "Questionnaire",
    key: "questionnaire_id",
    sortable: false,
    width: 180,
  },
  { title: "Status", key: "status", sortable: false, width: 140 },
  { title: "Submitted", key: "submitted_at", sortable: false, width: 180 },
  { title: "Result", key: "result_label", sortable: false, width: 180 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 90,
  },
];

// -----------------------
// Assignments: org_questionnaires (local mock)
// -----------------------
type OrgQuestionnaireAssignment = {
  id: string;
  organization_id: string;
  questionnaire_id: string;
  is_active: boolean;
  assigned_at: string;
};

const assignments = ref<OrgQuestionnaireAssignment[]>([
  {
    id: "oq-001",
    organization_id: "org-001",
    questionnaire_id: "q-gb-001",
    is_active: true,
    assigned_at: "2026-01-10T00:00:00Z",
  },
  {
    id: "oq-002",
    organization_id: "org-002",
    questionnaire_id: "q-gb-001",
    is_active: true,
    assigned_at: "2026-01-12T00:00:00Z",
  },
  {
    id: "oq-003",
    organization_id: "org-003",
    questionnaire_id: "q-gb-001",
    is_active: false,
    assigned_at: "2026-01-14T00:00:00Z",
  },
]);

const assignedRows = computed(() => {
  const rows = assignments.value
    .filter((a) => a.organization_id === id.value)
    .map((a) => ({
      ...a,
      questionnaire: questionnaires.find(
        (q) => q.id === a.questionnaire_id,
      ) as Questionnaire,
    }))
    .filter((a) => !!a.questionnaire);

  return rows.sort((x, y) => (x.assigned_at < y.assigned_at ? 1 : -1));
});

const assignmentSearch = ref("");

const filteredAssignedRows = computed(() => {
  const q = assignmentSearch.value.trim().toLowerCase();
  if (!q) return assignedRows.value;
  return assignedRows.value.filter((r) => {
    const hay =
      `${r.questionnaire.code} ${r.questionnaire.title}`.toLowerCase();
    return hay.includes(q);
  });
});

const assignmentHeaders = [
  { title: "Questionnaire", key: "questionnaire", sortable: false },
  { title: "Scoring", key: "scoring", sortable: false, width: 180 },
  { title: "Status", key: "status", sortable: false, width: 140 },
  { title: "Assigned", key: "assigned_at", sortable: false, width: 160 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];

// -----------------------
// Assign dialog
// -----------------------
const assignDialog = ref(false);
const activeItems = [
  { title: "Active", value: true },
  { title: "Inactive", value: false },
];

const assignForm = reactive<{ questionnaire_id: string; is_active: boolean }>({
  questionnaire_id: "",
  is_active: true,
});

const availableQuestionnaireItems = computed(() => {
  const assignedIds = new Set(
    assignments.value
      .filter((a) => a.organization_id === id.value)
      .map((a) => a.questionnaire_id),
  );
  return questionnaires
    .filter((q) => !assignedIds.has(q.id))
    .map((q) => ({
      title: `${q.title} (${q.code}) · v${q.version}`,
      value: q.id,
    }));
});

function openAssignDialog() {
  assignForm.questionnaire_id =
    availableQuestionnaireItems.value[0]?.value || "";
  assignForm.is_active = true;
  assignDialog.value = true;
}

function confirmAssign() {
  if (!assignForm.questionnaire_id) return;

  assignments.value.unshift({
    id: `oq-${Math.random().toString(16).slice(2, 10)}`,
    organization_id: id.value,
    questionnaire_id: assignForm.questionnaire_id,
    is_active: assignForm.is_active,
    assigned_at: new Date().toISOString(),
  });

  assignDialog.value = false;
}

// -----------------------
// Unassign confirm
// -----------------------
const unassignDialog = ref(false);
const unassignId = ref<string>("");

const unassignTarget = computed(() =>
  assignedRows.value.find((r) => r.id === unassignId.value),
);

function askUnassign(assignmentId: string) {
  unassignId.value = assignmentId;
  unassignDialog.value = true;
}

function confirmUnassign() {
  assignments.value = assignments.value.filter(
    (a) => a.id !== unassignId.value,
  );
  unassignDialog.value = false;
  unassignId.value = "";
}

// -----------------------
// Toggle active (UI)
// -----------------------
function toggleActive(assignmentId: string) {
  const idx = assignments.value.findIndex((a) => a.id === assignmentId);
  if (idx < 0) return;
  assignments.value[idx] = {
    ...assignments.value[idx],
    is_active: !assignments.value[idx].is_active,
  };
}

// -----------------------
// Helpers
// -----------------------
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-search {
  min-width: 320px;
}
</style>
