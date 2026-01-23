<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Dashboard"
      subtitle="A clean operational overview of organizations, questionnaires, and report flow."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-select
            v-model="range"
            :items="rangeItems"
            item-title="title"
            item-value="value"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details
            class="sb-range"
          />

          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:download">
            Export
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item title="Export CSV (UI only)" />
                <v-list-item title="Export Excel (UI only)" />
              </v-list>
            </v-menu>
          </v-btn>

          <v-btn rounded="lg" color="primary" prepend-icon="lucide:plus">
            Quick Action
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item
                  to="/organizations"
                  title="New Organization (UI)"
                />
                <v-list-item
                  to="/questionnaires/create"
                  title="New Questionnaire (UI)"
                />
                <v-list-item to="/reports" title="View Reports" />
              </v-list>
            </v-menu>
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <!-- 4 states -->
    <template v-if="ui.loading">
      <div class="d-flex flex-column ga-4">
        <v-row>
          <v-col v-for="n in 4" :key="n" cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="sb-card pa-4">
              <v-skeleton-loader type="heading, text, text" />
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="sb-card">
              <div class="pa-4 pb-2">
                <v-skeleton-loader type="heading, text" />
              </div>
              <div class="px-2 pb-4">
                <v-skeleton-loader type="image" height="320" />
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card fill-height">
              <div class="pa-4 pb-2">
                <v-skeleton-loader type="heading, text" />
              </div>
              <div class="px-2 pb-4">
                <v-skeleton-loader type="image" height="320" />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card rounded="xl" class="sb-card">
          <div class="pa-4 pb-2">
            <v-skeleton-loader type="heading, text" />
          </div>
          <v-divider />
          <div class="pa-4">
            <v-skeleton-loader type="table" />
          </div>
        </v-card>
      </div>
    </template>

    <template v-else-if="ui.error">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          {{ ui.error }}
        </v-alert>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
          <v-btn rounded="lg" variant="outlined" to="/reports"
            >Go to Reports</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else>
      <div class="d-flex flex-column ga-4">
        <!-- KPI -->
        <v-row>
          <v-col v-for="k in kpis" :key="k.key" cols="12" sm="6" lg="3">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="text-caption text-medium-emphasis">
                    {{ k.label }}
                  </div>
                  <div class="text-h5 font-weight-black mt-1">
                    {{ k.value }}
                  </div>

                  <div class="d-flex align-center ga-2 mt-2">
                    <v-chip
                      size="small"
                      :color="k.delta >= 0 ? 'success' : 'error'"
                      variant="tonal"
                      class="sb-chip"
                    >
                      <v-icon
                        :icon="
                          k.delta >= 0
                            ? 'lucide:trending-up'
                            : 'lucide:trending-down'
                        "
                        size="14"
                        class="me-1"
                      />
                      {{ formatPercent(k.delta) }}
                    </v-chip>

                    <div class="text-caption text-medium-emphasis">
                      vs previous {{ rangeLabel.toLowerCase() }}
                    </div>
                  </div>
                </div>

                <v-avatar
                  size="44"
                  rounded="xl"
                  :color="k.iconColor"
                  variant="tonal"
                >
                  <v-icon :icon="k.icon" size="20" />
                </v-avatar>
              </div>

              <div class="mt-4">
                <v-progress-linear
                  :model-value="k.progress"
                  height="6"
                  rounded
                  color="primary"
                  class="opacity-90"
                />
                <div
                  class="d-flex justify-space-between mt-2 text-caption text-medium-emphasis"
                >
                  <span>{{ k.noteLeft }}</span>
                  <span>{{ k.noteRight }}</span>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Main charts -->
        <v-row>
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="sb-card">
              <div
                class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
              >
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">
                    Submissions trend
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Daily submitted attempts for {{ rangeLabel.toLowerCase() }}
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-chip size="small" variant="tonal" color="primary">
                    Submitted: {{ formatCompact(summary.submitted) }}
                  </v-chip>
                  <v-chip size="small" variant="tonal">
                    In progress: {{ formatCompact(summary.inProgress) }}
                  </v-chip>
                </div>
              </div>

              <div class="px-2 pb-4">
                <ClientOnly>
                  <ApexChart
                    type="area"
                    height="320"
                    :options="submissionsOptions"
                    :series="submissionsSeries"
                  />
                </ClientOnly>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card fill-height">
              <div class="pa-4 pb-2">
                <div class="text-subtitle-1 font-weight-black">
                  Result labels
                </div>
                <div class="text-caption text-medium-emphasis">
                  Distribution across latest reports
                </div>
              </div>

              <div class="px-2 pb-4">
                <ClientOnly>
                  <ApexChart
                    type="donut"
                    height="320"
                    :options="labelsOptions"
                    :series="labelsSeries"
                  />
                </ClientOnly>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Secondary widgets -->
        <v-row>
          <v-col cols="12" lg="5">
            <v-card rounded="xl" class="sb-card">
              <div class="pa-4 pb-2">
                <div class="text-subtitle-1 font-weight-black">
                  Organizations
                </div>
                <div class="text-caption text-medium-emphasis">
                  New and active organizations
                </div>
              </div>

              <div class="px-2 pb-4">
                <ClientOnly>
                  <ApexChart
                    type="bar"
                    height="260"
                    :options="orgsOptions"
                    :series="orgsSeries"
                  />
                </ClientOnly>
              </div>
            </v-card>
          </v-col>

          <!-- Reports Pipeline -->
          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">
                    Reports Pipeline
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Attempt stages for {{ rangeLabel.toLowerCase() }}
                  </div>
                </div>

                <v-chip size="small" variant="tonal" color="primary">
                  Total: {{ pipelineTotal }}
                </v-chip>
              </div>

              <v-divider class="my-4" />

              <div class="d-flex flex-column ga-4">
                <div v-for="s in pipelineStages" :key="s.key">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center ga-2">
                      <v-avatar
                        size="34"
                        rounded="lg"
                        :color="s.color"
                        variant="tonal"
                      >
                        <v-icon :icon="s.icon" size="16" />
                      </v-avatar>
                      <div class="min-w-0">
                        <div class="text-body-2 font-weight-bold">
                          {{ s.label }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ s.hint }}
                        </div>
                      </div>
                    </div>

                    <div class="text-body-2 font-weight-bold">
                      {{ s.count }}
                    </div>
                  </div>

                  <v-progress-linear
                    :model-value="
                      pipelineTotal === 0 ? 0 : (s.count / pipelineTotal) * 100
                    "
                    height="6"
                    rounded
                    color="primary"
                    class="opacity-90"
                  />
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">
                  Tip: keep “In progress” low to reduce drop-off.
                </div>
                <v-btn
                  size="small"
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:arrow-right"
                  to="/reports"
                >
                  View reports
                </v-btn>
              </div>
            </v-card>
          </v-col>

          <!-- Today -->
          <v-col cols="12" lg="3">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-1 font-weight-black">Today</div>
                  <div class="text-caption text-medium-emphasis">
                    Focus & follow-ups
                  </div>
                </div>
                <v-btn icon rounded="lg" variant="text">
                  <v-icon icon="lucide:more-horizontal" />
                </v-btn>
              </div>

              <v-divider class="my-4" />

              <div class="d-flex flex-column ga-3">
                <v-card
                  v-for="t in tasks"
                  :key="t.title"
                  rounded="xl"
                  variant="tonal"
                  class="pa-3"
                >
                  <div class="d-flex align-start ga-3">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      :color="t.color"
                      variant="tonal"
                    >
                      <v-icon :icon="t.icon" size="16" />
                    </v-avatar>
                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">
                        {{ t.title }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ t.subtitle }}
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Recent submissions -->
        <v-card rounded="xl" class="sb-card">
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
          >
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">
                Recent submissions
              </div>
              <div class="text-caption text-medium-emphasis">
                Latest submitted attempts (last 10)
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-text-field
                v-model="recentSearch"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                prepend-inner-icon="lucide:search"
                placeholder="Search org / questionnaire / result..."
                hide-details
                class="sb-search"
              />
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
                        <div class="text-subtitle-1 font-weight-bold">
                          Filters
                        </div>
                        <v-btn
                          icon
                          variant="text"
                          @click="isActive.value = false"
                        >
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
                            <v-select
                              v-model="filters.status"
                              :items="['submitted', 'in_progress']"
                              label="Attempt status"
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
                variant="text"
                to="/reports"
                prepend-icon="lucide:arrow-right"
              >
                View all
              </v-btn>
            </div>
          </div>

          <v-divider />

          <template v-if="recentFiltered.length === 0">
            <div class="pa-10">
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
                  No submissions found
                </div>
                <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                  Try adjusting search or filters.
                </div>
                <v-btn
                  rounded="lg"
                  color="primary"
                  to="/reports"
                  prepend-icon="lucide:search"
                >
                  Go to Reports
                </v-btn>
              </div>
            </div>
          </template>

          <template v-else>
            <v-data-table
              :headers="recentHeaders"
              :items="recentFiltered"
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
                    v{{ item.questionnaire_version }}
                  </div>
                </div>
              </template>

              <template #item.status="{ item }">
                <v-chip
                  size="small"
                  :color="item.status === 'submitted' ? 'success' : 'warning'"
                  variant="tonal"
                >
                  {{ item.status }}
                </v-chip>
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
                <v-btn
                  icon
                  variant="text"
                  :to="`/reports/${item.result_id}`"
                  aria-label="View report"
                >
                  <v-icon icon="lucide:arrow-right" />
                </v-btn>
              </template>
            </v-data-table>
          </template>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, reactive, ref } from "vue";

definePageMeta({
  middleware: ["auth"],
});

const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"));

// -----------------------
// 4 states (mock)
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
  }, 250);
}

onMounted(() => reload());

// -----------------------
// Range
// -----------------------
type RangeKey = "7d" | "30d" | "90d";

const range = ref<RangeKey>("30d");
const rangeItems = [
  { title: "Last 7 days", value: "7d" },
  { title: "Last 30 days", value: "30d" },
  { title: "Last 90 days", value: "90d" },
];

const rangeLabel = computed(() => {
  if (range.value === "7d") return "Last 7 days";
  if (range.value === "90d") return "Last 90 days";
  return "Last 30 days";
});

// -----------------------
// Phase-1 shapes (mock)
// -----------------------
type OrgStatus = "active" | "inactive";
type QuestionnaireStatus = "draft" | "published" | "archived";
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

interface Questionnaire {
  id: string;
  code: string;
  title: string;
  description: string;
  language: string;
  status: QuestionnaireStatus;
  version: number;
  scoring_type: "multi_dimension" | "total_score";
  show_result_to_user: boolean;
  created_at: string;
  updated_at: string;
}

interface AttemptRow {
  id: string;
  questionnaire_id: string;
  questionnaire_title: string;
  questionnaire_version: number;
  organization_id?: string;
  organization_code?: string;
  organization_name?: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  result_id: string;
  result_label?: string;
}

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
  {
    id: "f4a7a73e-7e8f-4bdb-8d95-2cbdfb5f7d8a",
    code: "Q-ONBOARD-01",
    title: "Onboarding Baseline",
    description: "Collect basic context + readiness baseline.",
    language: "en",
    status: "draft",
    version: 0,
    scoring_type: "total_score",
    show_result_to_user: false,
    created_at: "2026-01-14T08:00:00Z",
    updated_at: "2026-01-14T08:00:00Z",
  },
]);

const attempts = ref<AttemptRow[]>([
  {
    id: "att_001",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    questionnaire_title: "Health Readiness Check",
    questionnaire_version: 3,
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    organization_code: "ACME",
    organization_name: "Acme Wellness",
    status: "submitted",
    started_at: "2026-01-17T03:10:00Z",
    submitted_at: "2026-01-17T03:18:00Z",
    result_id: "res_001",
    result_label: "Balanced Builder",
  },
  {
    id: "att_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    questionnaire_title: "Stress Snapshot",
    questionnaire_version: 1,
    organization_id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    organization_code: "SBZ",
    organization_name: "SuperBazi Internal",
    status: "submitted",
    started_at: "2026-01-16T09:10:00Z",
    submitted_at: "2026-01-16T09:22:00Z",
    result_id: "res_002",
    result_label: "High Alert",
  },
  {
    id: "att_003",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    questionnaire_title: "Health Readiness Check",
    questionnaire_version: 3,
    status: "in_progress",
    started_at: "2026-01-18T02:10:00Z",
    result_id: "res_003",
  },
  {
    id: "att_004",
    questionnaire_id: "f4a7a73e-7e8f-4bdb-8d95-2cbdfb5f7d8a",
    questionnaire_title: "Onboarding Baseline",
    questionnaire_version: 0,
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    organization_code: "ACME",
    organization_name: "Acme Wellness",
    status: "in_progress",
    started_at: "2026-01-18T09:10:00Z",
    result_id: "res_004",
  },
]);

// -----------------------
// Summary (range-based mock)
// -----------------------
const summary = computed(() => {
  if (range.value === "7d") return { submitted: 412, inProgress: 68 };
  if (range.value === "90d") return { submitted: 10842, inProgress: 620 };
  return { submitted: 4320, inProgress: 240 };
});

// -----------------------
// KPI model
// -----------------------
const kpis = computed(() => [
  {
    key: "orgs",
    label: "Organizations",
    value: formatCompact(organizations.value.length),
    delta: 0.062,
    icon: "lucide:building-2",
    iconColor: "primary",
    progress: 76,
    noteLeft: "Active",
    noteRight: `${Math.round(
      (organizations.value.filter((o) => o.status === "active").length /
        Math.max(1, organizations.value.length)) *
        100,
    )}%`,
  },
  {
    key: "questionnaires",
    label: "Questionnaires",
    value: formatCompact(questionnaires.value.length),
    delta: 0.041,
    icon: "lucide:clipboard-list",
    iconColor: "info",
    progress: 58,
    noteLeft: "Published",
    noteRight: `${Math.round(
      (questionnaires.value.filter((q) => q.status === "published").length /
        Math.max(1, questionnaires.value.length)) *
        100,
    )}%`,
  },
  {
    key: "reports",
    label: "Reports (submitted)",
    value: formatCompact(summary.value.submitted),
    delta: 0.128,
    icon: "lucide:file-text",
    iconColor: "success",
    progress: 72,
    noteLeft: "Completion",
    noteRight: "72%",
  },
  {
    key: "inProgress",
    label: "In progress",
    value: formatCompact(summary.value.inProgress),
    delta: -0.012,
    icon: "lucide:clock",
    iconColor: "warning",
    progress: 31,
    noteLeft: "Drop-off risk",
    noteRight: "31%",
  },
]);

// -----------------------
// Reports Pipeline (attempt stages)
// -----------------------
const pipelineStages = computed(() => {
  if (range.value === "7d") {
    return [
      {
        key: "in_progress",
        label: "In progress",
        hint: "Not submitted yet",
        count: 68,
        icon: "lucide:clock",
        color: "warning",
      },
      {
        key: "submitted",
        label: "Submitted",
        hint: "Completed attempts",
        count: 412,
        icon: "lucide:check-circle-2",
        color: "success",
      },
    ];
  }
  if (range.value === "90d") {
    return [
      {
        key: "in_progress",
        label: "In progress",
        hint: "Not submitted yet",
        count: 620,
        icon: "lucide:clock",
        color: "warning",
      },
      {
        key: "submitted",
        label: "Submitted",
        hint: "Completed attempts",
        count: 10842,
        icon: "lucide:check-circle-2",
        color: "success",
      },
    ];
  }
  return [
    {
      key: "in_progress",
      label: "In progress",
      hint: "Not submitted yet",
      count: 240,
      icon: "lucide:clock",
      color: "warning",
    },
    {
      key: "submitted",
      label: "Submitted",
      hint: "Completed attempts",
      count: 4320,
      icon: "lucide:check-circle-2",
      color: "success",
    },
  ];
});

const pipelineTotal = computed(() =>
  pipelineStages.value.reduce((sum, s) => sum + s.count, 0),
);

// -----------------------
// ApexCharts - Submissions area
// -----------------------
const submissionsSeries = computed(() => {
  const submitted =
    range.value === "7d"
      ? [42, 55, 48, 62, 70, 60, 75]
      : range.value === "90d"
        ? [280, 320, 300, 360, 410, 390, 420, 460, 440, 500, 540, 520]
        : [150, 165, 160, 185, 210, 205, 225, 245, 230, 260, 280, 270];

  const inProgress =
    range.value === "7d"
      ? [8, 10, 9, 12, 14, 11, 15]
      : range.value === "90d"
        ? [42, 48, 45, 54, 60, 58, 62, 68, 66, 72, 78, 74]
        : [18, 20, 19, 22, 24, 23, 26, 28, 27, 30, 32, 31];

  return [
    { name: "Submitted", data: submitted },
    { name: "In progress", data: inProgress },
  ];
});

const submissionsOptions = computed(() => ({
  chart: {
    type: "area",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 0.25, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  grid: { borderColor: "rgba(0,0,0,0.08)", strokeDashArray: 4 },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    markers: { radius: 10 },
  },
  xaxis: {
    categories:
      range.value === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [
            "W1",
            "W2",
            "W3",
            "W4",
            "W5",
            "W6",
            "W7",
            "W8",
            "W9",
            "W10",
            "W11",
            "W12",
          ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      style: { fontSize: "12px" },
      formatter: (v: number) => `${Math.round(v)}`,
    },
  },
  tooltip: { shared: true, intersect: false },
}));

// -----------------------
// ApexCharts - Result labels donut
// -----------------------
const labelsSeries = computed(() => {
  if (range.value === "7d") return [38, 26, 22, 14];
  if (range.value === "90d") return [34, 28, 20, 18];
  return [36, 27, 21, 16];
});

const labelsOptions = computed(() => ({
  chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
  labels: ["Balanced", "High Alert", "Recovering", "At Risk"],
  legend: { position: "bottom", fontSize: "12px" },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: "72%",
        labels: {
          show: true,
          total: { show: true, label: "Total", formatter: () => "100%" },
        },
      },
    },
  },
  dataLabels: { enabled: false },
}));

// -----------------------
// ApexCharts - Orgs bar
// -----------------------
const orgsSeries = computed(() => [
  {
    name: "New orgs",
    data:
      range.value === "7d"
        ? [0, 1, 0, 1, 0, 0, 1]
        : range.value === "90d"
          ? [2, 3, 2, 4, 3, 4, 5, 4, 3, 5, 4, 6]
          : [1, 1, 1, 2, 1, 2, 2, 1, 2, 2, 3, 2],
  },
  {
    name: "Active orgs",
    data:
      range.value === "7d"
        ? [12, 12, 13, 13, 13, 14, 14]
        : range.value === "90d"
          ? [40, 42, 41, 44, 46, 47, 49, 50, 51, 53, 54, 56]
          : [22, 23, 23, 24, 25, 26, 27, 27, 28, 29, 30, 31],
  },
]);

const orgsOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
  plotOptions: { bar: { borderRadius: 10, columnWidth: "52%" } },
  dataLabels: { enabled: false },
  grid: { borderColor: "rgba(0,0,0,0.08)", strokeDashArray: 4 },
  xaxis: {
    categories:
      range.value === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [
            "W1",
            "W2",
            "W3",
            "W4",
            "W5",
            "W6",
            "W7",
            "W8",
            "W9",
            "W10",
            "W11",
            "W12",
          ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: { labels: { style: { fontSize: "12px" } } },
  legend: { position: "top", horizontalAlign: "right", fontSize: "12px" },
  tooltip: { shared: true, intersect: false },
}));

// -----------------------
// Today tasks (Questionnaire app ops)
// -----------------------
const tasks = ref([
  {
    title: "Review draft questionnaires",
    subtitle: "2 drafts need publishing decisions",
    icon: "lucide:clipboard-check",
    color: "warning",
  },
  {
    title: "Check incomplete attempts",
    subtitle: "Follow up with org owners",
    icon: "lucide:clock",
    color: "primary",
  },
  {
    title: "Validate meaning rules",
    subtitle: "Ensure consistent result labels",
    icon: "lucide:sparkles",
    color: "success",
  },
]);

// -----------------------
// Recent submissions table
// -----------------------
const recentSearch = ref("");
const filters = reactive({
  organization_id: "" as string | "",
  questionnaire_id: "" as string | "",
  result_label: "" as string | "",
  status: "" as AttemptStatus | "",
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
  attempts.value.forEach((r) => r.result_label && set.add(r.result_label));
  return Array.from(set).sort();
});

const recentFiltered = computed(() => {
  const q = recentSearch.value.trim().toLowerCase();

  return attempts.value
    .filter((r) => {
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
      if (
        filters.result_label &&
        (r.result_label || "") !== filters.result_label
      )
        return false;
      if (filters.status && r.status !== filters.status) return false;

      if (!q) return true;
      const hay = [
        r.organization_name,
        r.organization_code,
        r.questionnaire_title,
        r.result_label,
        r.status,
        r.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    })
    .slice(0, 10);
});

const recentHeaders = [
  { title: "Organization", key: "organization", sortable: false },
  { title: "Questionnaire", key: "questionnaire", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "Result", key: "result_label", sortable: false },
  { title: "Submitted", key: "submitted_at", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

function resetFilters() {
  filters.organization_id = "";
  filters.questionnaire_id = "";
  filters.result_label = "";
  filters.status = "";
}

// -----------------------
// Helpers
// -----------------------
function formatCompact(v: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(v);
}

function formatPercent(v: number) {
  const pct = Math.round(v * 1000) / 10;
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}

function formatDateTime(v?: string) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}
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
