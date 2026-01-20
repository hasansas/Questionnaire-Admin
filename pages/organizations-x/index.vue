<template>
  <v-container class="pa-6">
    <!-- Header -->
    <div class="d-flex align-start justify-space-between ga-4 flex-wrap mb-6">
      <div class="min-w-0">
        <h1 class="text-h5 font-weight-black mb-1">Organizations</h1>
        <div class="text-body-2 text-medium-emphasis">
          Manage organizations, their users, and organization-scoped reports.
        </div>
      </div>

      <div class="d-flex align-center ga-2 flex-wrap">
        <v-btn
          rounded="lg"
          variant="outlined"
          prepend-icon="lucide:sliders-horizontal"
        >
          Filters
          <v-dialog activator="parent" max-width="760">
            <template #default="{ isActive }">
              <v-card rounded="xl">
                <v-card-title class="d-flex align-center justify-space-between">
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
                        v-model="filters.type"
                        :items="typeItems"
                        label="Type"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        clearable
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="filters.timezone"
                        :items="timezoneItems"
                        label="Timezone"
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
          prepend-icon="lucide:plus"
          @click="openCreate"
        >
          New Organization
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="ui.loading">
      <v-card rounded="xl">
        <v-card-title>
          <v-skeleton-loader type="heading, text" />
        </v-card-title>
        <v-divider />
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
          <v-btn rounded="lg" variant="outlined" to="/"
            >Back to Dashboard</v-btn
          >
        </div>
      </v-card>
    </template>

    <!-- Data / Empty -->
    <template v-else>
      <v-card rounded="xl">
        <v-card-title
          class="d-flex align-center justify-space-between ga-3 flex-wrap"
        >
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-bold">
              All organizations
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ filtered.length }} shown · {{ organizations.length }} total
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="lucide:search"
              placeholder="Search by name or code..."
              hide-details
              class="sb-search"
            />
          </div>
        </v-card-title>

        <v-divider />

        <template v-if="filtered.length === 0">
          <v-card-text class="pa-10">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
                <v-icon icon="lucide:building-2" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">
                No organizations found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                Try clearing filters or create your first organization.
              </div>
              <div class="d-flex ga-2 flex-wrap justify-center">
                <v-btn rounded="lg" variant="outlined" @click="resetAll"
                  >Clear filters</v-btn
                >
                <v-btn
                  rounded="lg"
                  color="primary"
                  prepend-icon="lucide:plus"
                  @click="openCreate"
                >
                  New Organization
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </template>

        <template v-else>
          <v-data-table
            :headers="headers"
            :items="filtered"
            item-key="id"
            density="comfortable"
          >
            <template #item.name="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.name }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.code }}
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

            <template #item.created_at="{ item }">
              <span class="text-body-2">{{ formatDate(item.created_at) }}</span>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  :to="`/organizations-x/${item.id}`"
                  aria-label="View"
                >
                  <v-icon icon="lucide:arrow-right" />
                </v-btn>

                <v-btn icon variant="text" aria-label="More">
                  <v-icon icon="lucide:more-vertical" />
                  <v-menu activator="parent" location="bottom end">
                    <v-list density="compact">
                      <v-list-item
                        :to="`/organizations-x/${item.id}`"
                        title="View"
                      ></v-list-item>
                      <v-list-item
                        title="Edit (UI)"
                        @click="openEdit(item)"
                      ></v-list-item>
                      <v-list-item
                        :title="
                          item.status === 'active'
                            ? 'Disable (UI)'
                            : 'Enable (UI)'
                        "
                        @click="openToggle(item)"
                      />
                      <v-divider />
                      <v-list-item
                        title="Archive (UI)"
                        @click="openArchive(item)"
                      ></v-list-item>
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </template>
      </v-card>

      <!-- Create / Edit Dialog (UI only) -->
      <v-dialog v-model="dialogs.form" max-width="760">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                formMode === "create" ? "New organization" : "Edit organization"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.form = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.code"
                  label="Code"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.type"
                  :items="typeItems"
                  label="Type"
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
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="form.timezone"
                  :items="timezoneItems"
                  label="Timezone"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving is not implemented in Phase 1 pages prompt.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.form = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" variant="outlined" @click="dialogs.form = false"
              >Save (UI)</v-btn
            >
            <v-btn rounded="lg" color="primary" @click="dialogs.form = false"
              >Save & View (UI)</v-btn
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
  middleware: ["auth"],
});

type OrgStatus = "active" | "inactive";

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

const route = useRoute();

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

const headers = [
  { title: "Organization", key: "name", sortable: true },
  { title: "Type", key: "type", sortable: true },
  { title: "Timezone", key: "timezone", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Created", key: "created_at", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const search = ref("");
const filters = reactive({
  status: "" as OrgStatus | "",
  type: "" as string | "",
  timezone: "" as string | "",
});

const statusItems: OrgStatus[] = ["active", "inactive"];
const typeItems = ["internal", "client", "partner"];
const timezoneItems = ["Asia/Jakarta", "UTC", "Asia/Singapore"];

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return organizations.value.filter((o) => {
    if (filters.status && o.status !== filters.status) return false;
    if (filters.type && o.type !== filters.type) return false;
    if (filters.timezone && o.timezone !== filters.timezone) return false;

    if (!q) return true;
    return `${o.name} ${o.code}`.toLowerCase().includes(q);
  });
});

function formatDate(v: string) {
  return new Date(v).toLocaleDateString();
}

function resetFilters() {
  filters.status = "";
  filters.type = "";
  filters.timezone = "";
}

function resetAll() {
  search.value = "";
  resetFilters();
}

const dialogs = reactive({
  form: false,
  confirm: false,
});

type FormMode = "create" | "edit";
const formMode = ref<FormMode>("create");

const form = reactive({
  id: "",
  code: "",
  name: "",
  type: "client",
  status: "active" as OrgStatus,
  timezone: "Asia/Jakarta",
});

const confirm = reactive({
  title: "Confirm action",
  message: "This is a UI-only confirmation dialog.",
});

function openCreate() {
  formMode.value = "create";
  form.id = "";
  form.code = "";
  form.name = "";
  form.type = "client";
  form.status = "active";
  form.timezone = "Asia/Jakarta";
  dialogs.form = true;
}

function openEdit(item: Organization) {
  formMode.value = "edit";
  form.id = item.id;
  form.code = item.code;
  form.name = item.name;
  form.type = item.type;
  form.status = item.status;
  form.timezone = item.timezone;
  dialogs.form = true;
}

function openToggle(item: Organization) {
  confirm.title =
    item.status === "active" ? "Disable organization" : "Enable organization";
  confirm.message = `UI only — would ${item.status === "active" ? "disable" : "enable"} ${item.name}.`;
  dialogs.confirm = true;
}

function openArchive(item: Organization) {
  confirm.title = "Archive organization";
  confirm.message = `UI only — would archive ${item.name}.`;
  dialogs.confirm = true;
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
    ui.error =
      route.query.error === "1"
        ? "Failed to load organizations (mock error)."
        : "";
  }, 350);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-search {
  min-width: 320px;
}
</style>
