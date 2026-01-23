<!-- /pages/organizations/index.vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Organizations"
      subtitle="Manage organizations, access, and questionnaire assignments."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:download">
            Export (UI)
          </v-btn>
          <v-btn rounded="lg" color="primary" prepend-icon="lucide:plus">
            New organization (UI)
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <!-- 4 states -->
    <template v-if="ui.loading">
      <v-row>
        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text" />
          </v-card>
        </v-col>
        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text" />
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
          <v-btn rounded="lg" variant="outlined" to="/"
            >Back to dashboard</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else>
      <div class="d-flex flex-column ga-4">
        <!-- Overview -->
        <v-row>
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="sb-card pa-4">
              <div
                class="d-flex align-start justify-space-between ga-3 flex-wrap"
              >
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">
                    Operational overview
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Track organizations, active accounts, and assignment
                    readiness.
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap mt-4">
                    <v-chip size="small" variant="tonal">
                      Total orgs:
                      <span class="ms-1 font-weight-bold">{{
                        orgRows.length
                      }}</span>
                    </v-chip>
                    <v-chip size="small" variant="tonal" color="primary">
                      With assignments:
                      <span class="ms-1 font-weight-bold">{{
                        orgsWithAssignments
                      }}</span>
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="
                        orgsWithoutAssignments > 0 ? 'warning' : undefined
                      "
                    >
                      No assignments:
                      <span class="ms-1 font-weight-bold">{{
                        orgsWithoutAssignments
                      }}</span>
                    </v-chip>
                  </div>
                </div>

                <v-card rounded="xl" variant="tonal" class="pa-3">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:clipboard-list" size="16" />
                    </v-avatar>
                    <div>
                      <div class="text-caption text-medium-emphasis">Tip</div>
                      <div class="text-body-2 font-weight-bold">
                        Assign at least 1 questionnaire
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="text-subtitle-1 font-weight-black">Quick filters</div>
              <div class="text-caption text-medium-emphasis">
                Find orgs faster
              </div>

              <v-divider class="my-4" />

              <div class="d-flex flex-column ga-3">
                <v-text-field
                  v-model="search"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  prepend-inner-icon="lucide:search"
                  placeholder="Search name or code..."
                  hide-details
                />

                <v-select
                  v-model="assignmentFilter"
                  :items="assignmentFilterItems"
                  item-title="title"
                  item-value="value"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details
                  prepend-inner-icon="lucide:filter"
                  label="Assignment status"
                />

                <v-btn
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:x"
                  @click="resetFilters"
                >
                  Reset filters
                </v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Table -->
        <v-card rounded="xl" class="sb-card">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
          >
            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip size="small" variant="tonal"
                >Showing: {{ filteredRows.length }}</v-chip
              >
              <v-chip size="small" variant="tonal" color="primary"
                >Total: {{ orgRows.length }}</v-chip
              >
            </div>

            <div class="d-flex align-center ga-2 flex-wrap justify-end">
              <v-btn
                rounded="lg"
                variant="text"
                prepend-icon="lucide:refresh-cw"
                @click="reload"
              >
                Refresh (UI)
              </v-btn>

              <v-btn
                rounded="lg"
                variant="outlined"
                prepend-icon="lucide:sliders-horizontal"
              >
                Filters
                <v-menu activator="parent" location="bottom end" width="360">
                  <v-card rounded="xl" class="pa-4">
                    <div class="text-subtitle-2 font-weight-bold">Filters</div>
                    <div class="text-caption text-medium-emphasis mb-3">
                      UI-only filtering
                    </div>

                    <v-select
                      v-model="assignmentFilter"
                      :items="assignmentFilterItems"
                      item-title="title"
                      item-value="value"
                      density="comfortable"
                      variant="outlined"
                      rounded="lg"
                      label="Assignment status"
                      class="mb-3"
                    />

                    <v-select
                      v-model="statusFilter"
                      :items="statusItems"
                      density="comfortable"
                      variant="outlined"
                      rounded="lg"
                      label="Status"
                      class="mb-3"
                    />

                    <div class="d-flex justify-end ga-2">
                      <v-btn rounded="lg" variant="text" @click="resetFilters"
                        >Reset</v-btn
                      >
                      <v-btn rounded="lg" color="primary" @click="noop"
                        >Apply</v-btn
                      >
                    </div>
                  </v-card>
                </v-menu>
              </v-btn>
            </div>
          </div>

          <v-divider />

          <template v-if="filteredRows.length === 0">
            <div class="pa-10">
              <v-card rounded="xl" variant="tonal" class="pa-8">
                <div class="d-flex flex-column align-center text-center">
                  <v-avatar
                    size="56"
                    color="primary"
                    variant="tonal"
                    class="mb-3"
                  >
                    <v-icon icon="lucide:building-2" />
                  </v-avatar>
                  <div class="text-subtitle-1 font-weight-bold">
                    No organizations found
                  </div>
                  <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                    Try adjusting your search or filters.
                  </div>
                  <div class="d-flex ga-2 flex-wrap justify-center">
                    <v-btn rounded="lg" variant="outlined" @click="resetFilters"
                      >Reset</v-btn
                    >
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      >New organization (UI)</v-btn
                    >
                  </div>
                </div>
              </v-card>
            </div>
          </template>

          <template v-else>
            <v-data-table
              :headers="headers"
              :items="filteredRows"
              item-key="id"
              density="comfortable"
            >
              <template #item.name="{ item }">
                <div class="d-flex align-center ga-3">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:building-2" size="16" />
                  </v-avatar>
                  <div class="min-w-0">
                    <div class="text-body-2 font-weight-bold text-truncate">
                      {{ item.name }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ item.code }}
                    </div>
                  </div>
                </div>
              </template>

              <template #item.assignment_status="{ item }">
                <div class="d-flex align-center ga-2">
                  <v-chip
                    size="small"
                    variant="tonal"
                    :color="item.assignment_count > 0 ? 'success' : 'warning'"
                  >
                    {{ item.assignment_count > 0 ? "Assigned" : "Unassigned" }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    ({{ item.assignment_count }})
                  </span>
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
                <span class="text-body-2">{{
                  formatDate(item.created_at)
                }}</span>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex justify-end ga-1">
                  <v-btn
                    icon
                    variant="text"
                    :to="`/organizations/${item.id}`"
                    aria-label="View"
                  >
                    <v-icon icon="lucide:arrow-right" />
                  </v-btn>

                  <v-btn icon variant="text" aria-label="More actions">
                    <v-icon icon="lucide:more-horizontal" />
                    <v-menu activator="parent" location="bottom end">
                      <v-list density="compact">
                        <v-list-item
                          :to="`/organizations/${item.id}`"
                          title="View details"
                        />
                        <v-list-item title="Edit (UI)" />
                        <v-list-item title="Disable (UI)" />
                      </v-list>
                    </v-menu>
                  </v-btn>
                </div>
              </template>
            </v-data-table>
          </template>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

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
// Mock assignments (same concept as org detail page)
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

// -----------------------
// Rows
// -----------------------
type OrgRow = Organization & {
  status: "active" | "disabled";
  created_at: string;
  updated_at: string;
  assignment_count: number;
  active_assignment_count: number;
  last_assigned_at: string | null;
};

const orgRows = computed<OrgRow[]>(() => {
  const byOrg = new Map<string, OrgQuestionnaireAssignment[]>();
  for (const a of assignments.value) {
    const list = byOrg.get(a.organization_id) || [];
    list.push(a);
    byOrg.set(a.organization_id, list);
  }

  return organizations.map((o, idx) => {
    const list = byOrg.get(o.id) || [];
    const activeCount = list.filter((x) => x.is_active).length;
    const last =
      list.slice().sort((a, b) => (a.assigned_at < b.assigned_at ? 1 : -1))[0]
        ?.assigned_at || null;

    // deterministic mock timestamps
    const created = new Date(Date.UTC(2026, 0, 1 + idx, 0, 0, 0)).toISOString();
    const updated = new Date(Date.UTC(2026, 0, 8 + idx, 0, 0, 0)).toISOString();

    return {
      ...o,
      status: idx % 11 === 0 ? "disabled" : "active",
      created_at: created,
      updated_at: updated,
      assignment_count: list.length,
      active_assignment_count: activeCount,
      last_assigned_at: last,
    };
  });
});

const orgsWithAssignments = computed(
  () => orgRows.value.filter((o) => o.assignment_count > 0).length,
);
const orgsWithoutAssignments = computed(
  () => orgRows.value.filter((o) => o.assignment_count === 0).length,
);

// -----------------------
// Filters
// -----------------------
const search = ref("");
type AssignmentFilter = "all" | "assigned" | "unassigned";
const assignmentFilter = ref<AssignmentFilter>("all");

const assignmentFilterItems = [
  { title: "All", value: "all" },
  { title: "Assigned", value: "assigned" },
  { title: "Unassigned", value: "unassigned" },
];

type StatusFilter = "all" | "active" | "disabled";
const statusFilter = ref<StatusFilter>("all");
const statusItems: StatusFilter[] = ["all", "active", "disabled"];

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();

  return orgRows.value.filter((o) => {
    if (q) {
      const hay = `${o.name} ${o.code}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (assignmentFilter.value === "assigned" && o.assignment_count === 0)
      return false;
    if (assignmentFilter.value === "unassigned" && o.assignment_count > 0)
      return false;

    if (statusFilter.value !== "all" && o.status !== statusFilter.value)
      return false;

    return true;
  });
});

function resetFilters() {
  search.value = "";
  assignmentFilter.value = "all";
  statusFilter.value = "all";
}

function noop() {
  // UI only
}

// -----------------------
// Table headers
// -----------------------
const headers = [
  { title: "Organization", key: "name", sortable: false },
  {
    title: "Assignment",
    key: "assignment_status",
    sortable: false,
    width: 220,
  },
  { title: "Status", key: "status", sortable: false, width: 140 },
  { title: "Created", key: "created_at", sortable: false, width: 160 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];

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
</style>
