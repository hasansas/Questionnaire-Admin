<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Org Users"
      subtitle="View and manage organization viewer accounts across all organizations."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:sliders-horizontal"
          >
            Filters
            <v-dialog activator="parent" max-width="760">
              <template #default="{ isActive }">
                <v-card rounded="xl">
                  <v-card-title
                    class="d-flex align-center justify-space-between"
                  >
                    <div class="text-subtitle-1 font-weight-bold">Filters</div>
                    <v-btn icon variant="text" @click="isActive.value = false">
                      <v-icon icon="lucide:x" />
                    </v-btn>
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-6">
                    <v-row class="ga-4" no-gutters>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.organization_id"
                          :items="orgOptions"
                          item-title="title"
                          item-value="value"
                          label="Organization"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.status"
                          :items="statusItems"
                          label="Status"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.role"
                          :items="roleItems"
                          label="Role"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider />
                  <v-card-actions class="pa-4">
                    <v-btn rounded="lg" variant="text" @click="resetFilters"
                      >Reset</v-btn
                    >
                    <v-spacer />
                    <v-btn
                      rounded="lg"
                      variant="outlined"
                      @click="isActive.value = false"
                      >Close</v-btn
                    >
                    <v-btn
                      rounded="lg"
                      color="primary"
                      @click="isActive.value = false"
                      >Apply</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-btn>

          <v-btn
            rounded="lg"
            color="primary"
            prepend-icon="lucide:user-plus"
            @click="openCreate"
          >
            Add Org User
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <template v-if="ui.loading">
      <v-card rounded="xl" class="sb-card">
        <div class="pa-4 pb-2">
          <v-skeleton-loader type="heading, text" />
        </div>
        <v-divider />
        <div class="pa-4">
          <v-skeleton-loader type="table" />
        </div>
      </v-card>
    </template>

    <template v-else-if="ui.error">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          {{ ui.error }}
        </v-alert>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
          <v-btn rounded="lg" variant="outlined" to="/"
            >Back to Dashboard</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else>
      <v-card rounded="xl" class="sb-card">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
        >
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">All org users</div>
            <div class="text-caption text-medium-emphasis">
              {{ filtered.length }} shown · {{ users.length }} total
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="lucide:search"
              placeholder="Search name or email..."
              hide-details
              class="sb-search"
            />
          </div>
        </div>

        <v-divider />

        <template v-if="filtered.length === 0">
          <div class="pa-10">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
                <v-icon icon="lucide:user-round-cog" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">
                No org users found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                Try adjusting search or filters, or add a new org_viewer.
              </div>
              <div class="d-flex ga-2 flex-wrap justify-center">
                <v-btn rounded="lg" variant="outlined" @click="resetAll"
                  >Clear filters</v-btn
                >
                <v-btn
                  rounded="lg"
                  color="primary"
                  prepend-icon="lucide:user-plus"
                  @click="openCreate"
                >
                  Add Org User
                </v-btn>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <v-data-table
            :headers="headers"
            :items="filtered"
            item-key="id"
            density="comfortable"
          >
            <template #item.organization="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.organization_name }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.organization_code }}
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                :color="item.status === 'active' ? 'success' : 'warning'"
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
                  @click="openEdit(item)"
                >
                  <v-icon icon="lucide:pencil" />
                </v-btn>

                <v-btn icon variant="text" aria-label="More">
                  <v-icon icon="lucide:more-vertical" />
                  <v-menu activator="parent" location="bottom end">
                    <v-list density="compact">
                      <v-list-item
                        title="View organization"
                        :to="`/organizations/${item.organization_id}`"
                      />
                      <v-list-item title="Edit (UI)" @click="openEdit(item)" />
                      <v-list-item
                        :title="
                          item.status === 'active'
                            ? 'Disable (UI)'
                            : 'Enable (UI)'
                        "
                        @click="openToggle(item)"
                      />
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </template>
      </v-card>

      <!-- Form dialog -->
      <v-dialog v-model="dialogs.form" max-width="760">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{ formMode === "create" ? "Add org user" : "Edit org user" }}
            </div>
            <v-btn icon variant="text" @click="dialogs.form = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.organization_id"
                  :items="orgOptions"
                  item-title="title"
                  item-value="value"
                  label="Organization"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.role"
                  :items="roleItems"
                  label="Role"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Email"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.status"
                  :items="statusItems"
                  label="Status"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — persistence is not implemented.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.form = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.form = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Confirm dialog -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type OrgStatus = "active" | "inactive";
type OrgUserRole = "org_viewer";
type OrgUserStatus = "active" | "inactive";

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

interface OrgUserRow extends OrganizationUser {
  organization_code: string;
  organization_name: string;
}

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

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
  {
    id: "a5d0c2c1-902e-4c6f-9c75-4b29c3a2d5a1",
    code: "EDU",
    name: "EduLab Research",
    type: "partner",
    status: "inactive",
    timezone: "Asia/Jakarta",
    created_at: "2025-11-05T05:00:00Z",
    updated_at: "2026-01-09T03:40:00Z",
  },
]);

const users = ref<OrganizationUser[]>([
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
  {
    id: "ou_003",
    organization_id: "a5d0c2c1-902e-4c6f-9c75-4b29c3a2d5a1",
    email: "research@edulab.org",
    name: "EduLab Viewer",
    role: "org_viewer",
    status: "active",
    last_login_at: "2026-01-15T11:10:00Z",
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2026-01-15T11:10:00Z",
  },
]);

const orgOptions = computed(() =>
  organizations.value.map((o) => ({
    title: `${o.name} (${o.code})`,
    value: o.id,
  })),
);

const roleItems: OrgUserRole[] = ["org_viewer"];
const statusItems: OrgUserStatus[] = ["active", "inactive"];

const search = ref("");
const filters = reactive({
  organization_id: "" as string | "",
  status: "" as OrgUserStatus | "",
  role: "" as OrgUserRole | "",
});

const rows = computed<OrgUserRow[]>(() => {
  const byId = new Map(organizations.value.map((o) => [o.id, o]));
  return users.value.map((u) => {
    const org = byId.get(u.organization_id);
    return {
      ...u,
      organization_code: org?.code || "—",
      organization_name: org?.name || "—",
    };
  });
});

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return rows.value.filter((r) => {
    if (
      filters.organization_id &&
      r.organization_id !== filters.organization_id
    )
      return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.role && r.role !== filters.role) return false;

    if (!q) return true;
    return `${r.name} ${r.email} ${r.organization_name} ${r.organization_code}`
      .toLowerCase()
      .includes(q);
  });
});

const headers = [
  { title: "Organization", key: "organization", sortable: false },
  { title: "Name", key: "name", sortable: true },
  { title: "Email", key: "email", sortable: true },
  { title: "Role", key: "role", sortable: false },
  { title: "Status", key: "status", sortable: true },
  { title: "Last login", key: "last_login_at", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const dialogs = reactive({
  form: false,
  confirm: false,
});

type FormMode = "create" | "edit";
const formMode = ref<FormMode>("create");

const form = reactive({
  id: "",
  organization_id: organizations.value[0]?.id || "",
  name: "",
  email: "",
  role: "org_viewer" as OrgUserRole,
  status: "active" as OrgUserStatus,
});

const confirm = reactive({
  title: "Confirm action",
  message: "UI only.",
});

function openCreate() {
  formMode.value = "create";
  form.id = "";
  form.organization_id = organizations.value[0]?.id || "";
  form.name = "";
  form.email = "";
  form.role = "org_viewer";
  form.status = "active";
  dialogs.form = true;
}

function openEdit(item: OrgUserRow) {
  formMode.value = "edit";
  form.id = item.id;
  form.organization_id = item.organization_id;
  form.name = item.name;
  form.email = item.email;
  form.role = item.role;
  form.status = item.status;
  dialogs.form = true;
}

function openToggle(item: OrgUserRow) {
  confirm.title =
    item.status === "active" ? "Disable org user" : "Enable org user";
  confirm.message = `UI only — would ${item.status === "active" ? "disable" : "enable"} ${item.name}.`;
  dialogs.confirm = true;
}

function resetFilters() {
  filters.organization_id = "";
  filters.status = "";
  filters.role = "";
}

function resetAll() {
  search.value = "";
  resetFilters();
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
  }, 250);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-range {
  max-width: 190px;
}

.sb-search {
  min-width: 320px;
}
</style>
