<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Reports"
      subtitle="Browse submitted attempts and export report data (UI only)."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:download">
            Export
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item title="Export CSV (UI only)" />
                <v-list-item title="Export Excel (UI only)" />
              </v-list>
            </v-menu>
          </v-btn>

          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:sliders-horizontal"
          >
            Filters
            <v-dialog activator="parent" max-width="920">
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
                        <v-text-field
                          v-model="filters.date_from"
                          label="Date from (YYYY-MM-DD)"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="filters.date_to"
                          label="Date to (YYYY-MM-DD)"
                          variant="outlined"
                          rounded="lg"
                        />
                      </v-col>
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
                          v-model="filters.questionnaire_id"
                          :items="questionnaireOptions"
                          item-title="title"
                          item-value="value"
                          label="Questionnaire"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.result_label"
                          :items="resultLabelOptions"
                          label="Result label"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="filters.band"
                          label="Band (contains)"
                          variant="outlined"
                          rounded="lg"
                          hint="UI-only filter over bands_json string."
                          persistent-hint
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
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">{{
          ui.error
        }}</v-alert>
        <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
      </v-card>
    </template>

    <template v-else>
      <v-card rounded="xl" class="sb-card">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
        >
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">All reports</div>
            <div class="text-caption text-medium-emphasis">
              {{ filtered.length }} shown · {{ reports.length }} total
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="lucide:search"
              placeholder="Search org / questionnaire / label..."
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
                <v-icon icon="lucide:file-text" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">
                No reports found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                Adjust filters or wait for attempts to be submitted.
              </div>
              <v-btn
                rounded="lg"
                variant="outlined"
                @click="resetAll"
                prepend-icon="lucide:rotate-ccw"
              >
                Clear filters
              </v-btn>
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
                  {{ item.organization_name || "—" }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.organization_code || "No org" }}
                </div>
              </div>
            </template>

            <template #item.questionnaire="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.questionnaire_title }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  v{{ item.questionnaire_version }} ·
                  {{ item.scoring_type_snapshot }}
                </div>
              </div>
            </template>

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
                  :to="`/reports/${item.id}`"
                  prepend-icon="lucide:arrow-right"
                >
                  View
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </template>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type AttemptStatus = "in_progress" | "submitted";
type ScoringType = "multi_dimension" | "total_score";

interface Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface Questionnaire {
  id: string;
  code: string;
  title: string;
  description: string;
  language: string;
  status: "draft" | "published" | "archived";
  version: number;
  scoring_type: ScoringType;
  show_result_to_user: boolean;
  created_at: string;
  updated_at: string;
}

interface Attempt {
  id: string;
  questionnaire_id: string;
  questionnaire_version: number;
  organization_id?: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  ip_address: string;
  user_agent: string;
}

interface Result {
  id: string;
  attempt_id: string;
  scoring_type_snapshot: ScoringType;
  scores_json: string;
  bands_json: string;
  result_label: string;
  meaning_snapshot: string;
  recommendations_snapshot: string;
  computed_at: string;
}

interface ReportRow {
  id: string; // results.id
  attempt_id: string;
  questionnaire_id: string;
  questionnaire_title: string;
  questionnaire_version: number;
  organization_id?: string;
  organization_code?: string;
  organization_name?: string;
  status: AttemptStatus;
  submitted_at?: string;
  scoring_type_snapshot: ScoringType;
  bands_json: string;
  result_label: string;
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
]);

const questionnaires = ref<Questionnaire[]>([
  {
    id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    code: "Q-HEALTH-01",
    title: "Health Readiness Check",
    description: "A quick screening for readiness and support needs.",
    language: "en",
    status: "published",
    version: 3,
    scoring_type: "multi_dimension",
    show_result_to_user: true,
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    code: "Q-STRESS-01",
    title: "Stress Snapshot",
    description: "Self-reported stress signals and patterns.",
    language: "en",
    status: "published",
    version: 1,
    scoring_type: "total_score",
    show_result_to_user: true,
    created_at: "2026-01-02T08:00:00Z",
    updated_at: "2026-01-02T08:00:00Z",
  },
]);

const attempts = ref<Attempt[]>([
  {
    id: "att_001",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    questionnaire_version: 3,
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    status: "submitted",
    started_at: "2026-01-17T03:10:00Z",
    submitted_at: "2026-01-17T03:18:00Z",
    ip_address: "103.10.10.10",
    user_agent: "Mozilla/5.0",
  },
  {
    id: "att_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    questionnaire_version: 1,
    organization_id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    status: "submitted",
    started_at: "2026-01-16T09:10:00Z",
    submitted_at: "2026-01-16T09:22:00Z",
    ip_address: "103.10.10.11",
    user_agent: "Mozilla/5.0",
  },
]);

const results = ref<Result[]>([
  {
    id: "res_001",
    attempt_id: "att_001",
    scoring_type_snapshot: "multi_dimension",
    scores_json: '{"dimensions":{"energy":2,"sleep":3},"total":5}',
    bands_json:
      '{"dimensions":{"energy":"Balanced Energy","sleep":"High Sleep"},"total":"—"}',
    result_label: "Balanced Builder",
    meaning_snapshot: "Stable baseline with strong sleep signals.",
    recommendations_snapshot: "Maintain routine; improve daytime breaks.",
    computed_at: "2026-01-17T03:18:05Z",
  },
  {
    id: "res_002",
    attempt_id: "att_002",
    scoring_type_snapshot: "total_score",
    scores_json: '{"total":3}',
    bands_json: '{"total":"High Alert"}',
    result_label: "High Alert",
    meaning_snapshot: "Elevated stress indicators today.",
    recommendations_snapshot: "Reduce load; improve sleep; seek support.",
    computed_at: "2026-01-16T09:22:05Z",
  },
]);

const orgById = computed(
  () => new Map(organizations.value.map((o) => [o.id, o])),
);
const qById = computed(
  () => new Map(questionnaires.value.map((q) => [q.id, q])),
);

const reports = computed<ReportRow[]>(() => {
  const attById = new Map(attempts.value.map((a) => [a.id, a]));
  return results.value.map((r) => {
    const att = attById.get(r.attempt_id);
    const q = att ? qById.value.get(att.questionnaire_id) : undefined;
    const org = att?.organization_id
      ? orgById.value.get(att.organization_id)
      : undefined;
    return {
      id: r.id,
      attempt_id: r.attempt_id,
      questionnaire_id: att?.questionnaire_id || "",
      questionnaire_title: q?.title || "—",
      questionnaire_version: att?.questionnaire_version || 0,
      organization_id: att?.organization_id,
      organization_code: org?.code,
      organization_name: org?.name,
      status: att?.status || "submitted",
      submitted_at: att?.submitted_at,
      scoring_type_snapshot: r.scoring_type_snapshot,
      bands_json: r.bands_json,
      result_label: r.result_label,
    };
  });
});

const search = ref("");
const filters = reactive({
  date_from: "",
  date_to: "",
  organization_id: "" as string | "",
  questionnaire_id: "" as string | "",
  result_label: "" as string | "",
  band: "",
});

const orgOptions = computed(() =>
  organizations.value.map((o) => ({
    title: `${o.name} (${o.code})`,
    value: o.id,
  })),
);

const questionnaireOptions = computed(() =>
  questionnaires.value.map((q) => ({
    title: `${q.title} (${q.code})`,
    value: q.id,
  })),
);

const resultLabelOptions = computed(() => {
  const set = new Set<string>();
  reports.value.forEach((r) => r.result_label && set.add(r.result_label));
  return Array.from(set).sort();
});

function withinDate(v?: string) {
  if (!v) return false;
  const d = new Date(v).getTime();
  const from = filters.date_from
    ? new Date(`${filters.date_from}T00:00:00Z`).getTime()
    : null;
  const to = filters.date_to
    ? new Date(`${filters.date_to}T23:59:59Z`).getTime()
    : null;
  if (from !== null && d < from) return false;
  if (to !== null && d > to) return false;
  return true;
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return reports.value.filter((r) => {
    if (
      filters.organization_id &&
      r.organization_id !== filters.organization_id
    )
      return false;
    if (
      filters.questionnaire_id &&
      r.questionnaire_id !== filters.questionnaire_id
    )
      return false;
    if (filters.result_label && r.result_label !== filters.result_label)
      return false;
    if (
      filters.band &&
      !r.bands_json.toLowerCase().includes(filters.band.trim().toLowerCase())
    )
      return false;

    if (filters.date_from || filters.date_to) {
      if (!withinDate(r.submitted_at)) return false;
    }

    if (!q) return true;
    return `${r.organization_name || ""} ${r.organization_code || ""} ${r.questionnaire_title} ${r.result_label}`
      .toLowerCase()
      .includes(q);
  });
});

const headers = [
  { title: "Organization", key: "organization", sortable: false },
  { title: "Questionnaire", key: "questionnaire", sortable: false },
  { title: "Result label", key: "result_label", sortable: true },
  { title: "Submitted", key: "submitted_at", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

function resetFilters() {
  filters.date_from = "";
  filters.date_to = "";
  filters.organization_id = "";
  filters.questionnaire_id = "";
  filters.result_label = "";
  filters.band = "";
}

function resetAll() {
  search.value = "";
  resetFilters();
}

function formatDateTime(v?: string) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => (ui.loading = false), 250);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-search {
  min-width: 320px;
}
</style>
