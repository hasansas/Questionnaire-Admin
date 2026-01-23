<template>
  <v-container class="pa-6">
    <!-- Header -->
    <div class="d-flex align-start justify-space-between ga-4 flex-wrap mb-6">
      <div class="min-w-0">
        <div class="d-flex align-center ga-2 flex-wrap mb-1">
          <v-btn icon variant="text" to="/organizations" aria-label="Back">
            <v-icon icon="lucide:arrow-left" />
          </v-btn>
          <h1 class="text-h5 font-weight-black mb-0 text-truncate">
            {{ org?.name || "Organization" }}
          </h1>
          <v-chip v-if="org" size="small" variant="tonal" color="primary">
            {{ org.code }}
          </v-chip>
          <v-chip
            v-if="org"
            size="small"
            variant="tonal"
            :color="org.status === 'active' ? 'success' : 'warning'"
          >
            {{ org.status }}
          </v-chip>
        </div>
        <div class="text-body-2 text-medium-emphasis">
          Organization details, users, and reports.
        </div>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <v-btn
          rounded="lg"
          variant="outlined"
          prepend-icon="lucide:pencil"
          @click="openEditOrg"
          :disabled="!org"
        >
          Edit
        </v-btn>
        <v-btn
          rounded="lg"
          color="primary"
          prepend-icon="lucide:plus"
          @click="openCreateUser"
          :disabled="!org"
        >
          Add User
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="ui.loading">
      <v-card rounded="xl" class="pa-6">
        <v-skeleton-loader type="heading, text, text, actions" />
      </v-card>
      <v-card rounded="xl" class="mt-4">
        <v-card-text>
          <v-skeleton-loader type="table" />
        </v-card-text>
      </v-card>
    </template>

    <!-- Error -->
    <template v-else-if="ui.error">
      <v-card rounded="xl" class="pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          {{ ui.error }}
        </v-alert>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
          <v-btn rounded="lg" variant="outlined" to="/organizations"
            >Back</v-btn
          >
        </div>
      </v-card>
    </template>

    <!-- Empty -->
    <template v-else-if="!org">
      <v-card rounded="xl" class="pa-10">
        <div class="d-flex flex-column align-center text-center">
          <v-avatar size="56" color="warning" variant="tonal" class="mb-3">
            <v-icon icon="lucide:circle-off" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">
            Organization not found
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
            The ID may be invalid, or the organization is not available in mock
            data.
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

    <!-- Data -->
    <template v-else>
      <v-card rounded="xl">
        <v-card-title class="pb-0">
          <v-tabs v-model="tab" color="primary">
            <v-tab value="overview" prepend-icon="lucide:info">Overview</v-tab>
            <v-tab value="users" prepend-icon="lucide:users">Org Users</v-tab>
            <v-tab value="reports" prepend-icon="lucide:file-text"
              >Reports</v-tab
            >
          </v-tabs>
        </v-card-title>

        <v-divider class="mt-2" />

        <v-card-text class="pa-0">
          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-6">
                <v-row class="ga-4" no-gutters>
                  <v-col cols="12" md="8">
                    <v-card
                      rounded="xl"
                      variant="flat"
                      class="sb-inner-card pa-4"
                    >
                      <div
                        class="d-flex align-start justify-space-between ga-3 flex-wrap"
                      >
                        <div class="min-w-0">
                          <div class="text-subtitle-1 font-weight-bold">
                            Organization info
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Primary metadata for Phase 1.
                          </div>
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:pencil"
                          @click="openEditOrg"
                        >
                          Edit
                        </v-btn>
                      </div>

                      <v-divider class="my-4" />

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Code
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ org.code }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="8">
                          <div class="text-caption text-medium-emphasis">
                            Name
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ org.name }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Type
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ org.type }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Status
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ org.status }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Timezone
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ org.timezone }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Created
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ formatDateTime(org.created_at) }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Updated
                          </div>
                          <div class="text-body-1 font-weight-semibold">
                            {{ formatDateTime(org.updated_at) }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-card
                      rounded="xl"
                      variant="flat"
                      class="sb-inner-card pa-4"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        Quick actions
                      </div>
                      <div class="text-caption text-medium-emphasis mb-4">
                        Common operations (UI only).
                      </div>

                      <div class="d-flex flex-column ga-2">
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:user-plus"
                          @click="openCreateUser"
                        >
                          Add org user
                        </v-btn>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:file-text"
                          @click="tab = 'reports'"
                        >
                          View reports
                        </v-btn>
                        <v-btn
                          rounded="lg"
                          variant="text"
                          prepend-icon="lucide:download"
                        >
                          Export org data
                          <v-menu activator="parent" location="bottom start">
                            <v-list density="compact">
                              <v-list-item
                                title="Export Users CSV (UI)"
                              ></v-list-item>
                              <v-list-item
                                title="Export Reports Excel (UI)"
                              ></v-list-item>
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </div>

                      <v-alert
                        class="mt-4"
                        variant="tonal"
                        type="info"
                        rounded="lg"
                      >
                        Phase 1 pages use mock data only.
                      </v-alert>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Org Users -->
            <v-window-item value="users">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <v-card-title
                    class="d-flex align-center justify-space-between ga-3 flex-wrap"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-bold">
                        Org users
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        View-only accounts (role:
                        <span class="font-weight-semibold">org_viewer</span>)
                      </div>
                    </div>

                    <div class="d-flex align-center ga-2 flex-wrap">
                      <v-text-field
                        v-model="userSearch"
                        density="comfortable"
                        variant="outlined"
                        rounded="lg"
                        prepend-inner-icon="lucide:search"
                        placeholder="Search users..."
                        hide-details
                        class="sb-search"
                      />
                      <v-btn
                        rounded="lg"
                        color="primary"
                        prepend-icon="lucide:plus"
                        @click="openCreateUser"
                      >
                        Add user
                      </v-btn>
                    </div>
                  </v-card-title>
                  <v-divider />

                  <template v-if="filteredUsers.length === 0">
                    <v-card-text class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:user-round-cog" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No users yet
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Create the first org_viewer account for this
                          organization.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openCreateUser"
                        >
                          Add user
                        </v-btn>
                      </div>
                    </v-card-text>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="userHeaders"
                      :items="filteredUsers"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.status="{ item }">
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="
                            item.status === 'active' ? 'success' : 'warning'
                          "
                        >
                          {{ item.status }}
                        </v-chip>
                      </template>

                      <template #item.last_login_at="{ item }">
                        <span class="text-body-2">{{
                          formatDateTime(item.last_login_at)
                        }}</span>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditUser(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Disable"
                            @click="openDisableUser(item)"
                          >
                            <v-icon icon="lucide:ban" />
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>

            <!-- Reports -->
            <v-window-item value="reports">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <v-card-title
                    class="d-flex align-center justify-space-between ga-3 flex-wrap"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-bold">
                        Organization reports
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Reports filtered to this organization (submitted only).
                      </div>
                    </div>

                    <div class="d-flex align-center ga-2 flex-wrap">
                      <v-text-field
                        v-model="reportSearch"
                        density="comfortable"
                        variant="outlined"
                        rounded="lg"
                        prepend-inner-icon="lucide:search"
                        placeholder="Search reports..."
                        hide-details
                        class="sb-search"
                      />
                      <v-btn
                        rounded="lg"
                        variant="outlined"
                        prepend-icon="lucide:download"
                      >
                        Export
                        <v-menu activator="parent" location="bottom end">
                          <v-list density="compact">
                            <v-list-item
                              title="Export CSV (UI only)"
                            ></v-list-item>
                            <v-list-item
                              title="Export Excel (UI only)"
                            ></v-list-item>
                          </v-list>
                        </v-menu>
                      </v-btn>
                    </div>
                  </v-card-title>

                  <v-divider />

                  <template v-if="filteredReports.length === 0">
                    <v-card-text class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:file-text" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No reports found
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          When attempts are submitted, reports will appear here.
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          to="/reports"
                          prepend-icon="lucide:arrow-right"
                        >
                          View global reports
                        </v-btn>
                      </div>
                    </v-card-text>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="reportHeaders"
                      :items="filteredReports"
                      item-key="result_id"
                      density="comfortable"
                    >
                      <template #item.result_label="{ item }">
                        <v-chip
                          v-if="item.result_label"
                          size="small"
                          variant="tonal"
                          color="primary"
                        >
                          {{ item.result_label }}
                        </v-chip>
                        <span v-else class="text-medium-emphasis">—</span>
                      </template>

                      <template #item.submitted_at="{ item }">
                        <span class="text-body-2">{{
                          formatDateTime(item.submitted_at)
                        }}</span>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            rounded="lg"
                            variant="text"
                            :to="`/reports/${item.result_id}`"
                            prepend-icon="lucide:arrow-right"
                          >
                            View
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <!-- Org Edit Dialog (UI only) -->
      <v-dialog v-model="dialogs.orgForm" max-width="760">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              Edit organization
            </div>
            <v-btn icon variant="text" @click="dialogs.orgForm = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="orgForm.code"
                  label="Code"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="orgForm.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="orgForm.type"
                  :items="typeItems"
                  label="Type"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="orgForm.status"
                  :items="statusItems"
                  label="Status"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="orgForm.timezone"
                  :items="timezoneItems"
                  label="Timezone"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving is not implemented.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.orgForm = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.orgForm = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- User Dialog (Create/Edit) -->
      <v-dialog v-model="dialogs.userForm" max-width="760">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{ userFormMode === "create" ? "Add org user" : "Edit org user" }}
            </div>
            <v-btn icon variant="text" @click="dialogs.userForm = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userForm.email"
                  label="Email"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userForm.role"
                  :items="['org_viewer']"
                  label="Role"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userForm.status"
                  :items="['active', 'inactive']"
                  label="Status"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — creating/editing users is not implemented.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.userForm = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              @click="dialogs.userForm = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Confirmation Dialog (UI only) -->
      <v-dialog v-model="dialogs.confirm" max-width="560">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center ga-2">
            <v-avatar size="36" color="warning" variant="tonal">
              <v-icon icon="lucide:alert-triangle" />
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold">
              {{ confirm.title }}
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div class="text-body-2 text-medium-emphasis">
              {{ confirm.message }}
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.confirm = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.confirm = false"
              >Confirm (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type OrgStatus = "active" | "inactive";
type OrgUserRole = "org_viewer";
type OrgUserStatus = "active" | "inactive";
type AttemptStatus = "in_progress" | "submitted";

interface Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  status: OrgStatus;
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationUser {
  id: string;
  organization_id: string;
  email: string;
  name: string;
  role: OrgUserRole;
  status: OrgUserStatus;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrgReportRow {
  attempt_id: string;
  result_id: string;
  organization_id?: string;
  questionnaire_id: string;
  questionnaire_title: string;
  questionnaire_version: number;
  status: AttemptStatus;
  submitted_at?: string;
  result_label?: string;
}

const route = useRoute();

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

const tab = ref<"overview" | "users" | "reports">("overview");

const organizations = ref<Organization[]>([
  {
    id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    code: "SBZ",
    name: "SuperBazi Internal",
    type: "internal",
    status: "active",
    timezone: "Asia/Jakarta",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-10T10:30:00Z",
  },
  {
    id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    code: "ACME",
    name: "Acme Wellness",
    type: "client",
    status: "active",
    timezone: "Asia/Jakarta",
    created_at: "2025-12-20T02:10:00Z",
    updated_at: "2026-01-12T09:20:00Z",
  },
]);

const orgUsers = ref<OrganizationUser[]>([
  {
    id: "ou_001",
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    email: "viewer@acme.com",
    name: "Acme Viewer",
    role: "org_viewer",
    status: "active",
    last_login_at: "2026-01-18T02:30:00Z",
    created_at: "2026-01-02T08:00:00Z",
    updated_at: "2026-01-18T02:30:00Z",
  },
  {
    id: "ou_002",
    organization_id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    email: "ops@superbazi.com",
    name: "Ops Viewer",
    role: "org_viewer",
    status: "inactive",
    last_login_at: null,
    created_at: "2026-01-03T08:00:00Z",
    updated_at: "2026-01-03T08:00:00Z",
  },
]);

const orgReports = ref<OrgReportRow[]>([
  {
    attempt_id: "att_001",
    result_id: "res_001",
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    questionnaire_id: "q_1",
    questionnaire_title: "Health Readiness Check",
    questionnaire_version: 3,
    status: "submitted",
    submitted_at: "2026-01-17T03:18:00Z",
    result_label: "Balanced Builder",
  },
  {
    attempt_id: "att_002",
    result_id: "res_002",
    organization_id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    questionnaire_id: "q_2",
    questionnaire_title: "Stress Snapshot",
    questionnaire_version: 1,
    status: "submitted",
    submitted_at: "2026-01-16T09:22:00Z",
    result_label: "High Alert",
  },
]);

const orgId = computed(() => String(route.params.id || ""));
const org = computed(() =>
  organizations.value.find((o) => o.id === orgId.value),
);

const statusItems: OrgStatus[] = ["active", "inactive"];
const typeItems = ["internal", "client", "partner"];
const timezoneItems = ["Asia/Jakarta", "UTC", "Asia/Singapore"];

const userSearch = ref("");
const userHeaders = [
  { title: "Name", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Role", key: "role", sortable: false },
  { title: "Status", key: "status", sortable: true },
  { title: "Last login", key: "last_login_at", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const filteredUsers = computed(() => {
  const q = userSearch.value.trim().toLowerCase();
  return orgUsers.value
    .filter((u) => u.organization_id === orgId.value)
    .filter((u) => {
      if (!q) return true;
      return `${u.name} ${u.email}`.toLowerCase().includes(q);
    });
});

const reportSearch = ref("");
const reportHeaders = [
  { title: "Questionnaire", key: "questionnaire_title", sortable: true },
  { title: "Version", key: "questionnaire_version", sortable: true },
  { title: "Result", key: "result_label", sortable: false },
  { title: "Submitted", key: "submitted_at", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const filteredReports = computed(() => {
  const q = reportSearch.value.trim().toLowerCase();
  return orgReports.value
    .filter(
      (r) => r.organization_id === orgId.value && r.status === "submitted",
    )
    .filter((r) => {
      if (!q) return true;
      return `${r.questionnaire_title} ${r.result_label || ""}`
        .toLowerCase()
        .includes(q);
    });
});

const dialogs = reactive({
  orgForm: false,
  userForm: false,
  confirm: false,
});

const orgForm = reactive({
  code: "",
  name: "",
  type: "client",
  status: "active" as OrgStatus,
  timezone: "Asia/Jakarta",
});

function openEditOrg() {
  if (!org.value) return;
  orgForm.code = org.value.code;
  orgForm.name = org.value.name;
  orgForm.type = org.value.type;
  orgForm.status = org.value.status;
  orgForm.timezone = org.value.timezone;
  dialogs.orgForm = true;
}

type UserFormMode = "create" | "edit";
const userFormMode = ref<UserFormMode>("create");

const userForm = reactive({
  id: "",
  name: "",
  email: "",
  role: "org_viewer" as OrgUserRole,
  status: "active" as OrgUserStatus,
});

function openCreateUser() {
  userFormMode.value = "create";
  userForm.id = "";
  userForm.name = "";
  userForm.email = "";
  userForm.role = "org_viewer";
  userForm.status = "active";
  dialogs.userForm = true;
}

function openEditUser(u: OrganizationUser) {
  userFormMode.value = "edit";
  userForm.id = u.id;
  userForm.name = u.name;
  userForm.email = u.email;
  userForm.role = u.role;
  userForm.status = u.status;
  dialogs.userForm = true;
}

const confirm = reactive({
  title: "Confirm action",
  message: "UI only confirmation.",
});

function openDisableUser(u: OrganizationUser) {
  confirm.title = u.status === "active" ? "Disable user" : "Enable user";
  confirm.message = `UI only — would ${u.status === "active" ? "disable" : "enable"} ${u.name}.`;
  dialogs.confirm = true;
}

function formatDateTime(v?: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
    ui.error =
      route.query.error === "1"
        ? "Failed to load organization detail (mock error)."
        : "";
  }, 350);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-search {
  min-width: 320px;
}

.sb-inner-card {
  background: rgba(var(--v-theme-surface), 1);
}
</style>
