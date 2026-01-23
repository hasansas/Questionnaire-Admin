<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Questionnaires"
      subtitle="Manage questionnaires, scoring configs, bands, meanings, and user info requirements."
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
                          v-model="filters.scoring_type"
                          :items="scoringItems"
                          label="Scoring type"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.language"
                          :items="languageItems"
                          label="Language"
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
            to="/questionnaires/create"
          >
            New Questionnaire
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
          <v-btn rounded="lg" variant="outlined" to="/">Back</v-btn>
        </div>
      </v-card>
    </template>

    <template v-else>
      <v-card rounded="xl" class="sb-card">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
        >
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">
              All questionnaires
            </div>
            <div class="text-caption text-medium-emphasis">
              {{ filtered.length }} shown · {{ questionnaires.length }} total
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="lucide:search"
              placeholder="Search title or code..."
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
                <v-icon icon="lucide:clipboard-list" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">
                No questionnaires found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                Create a questionnaire to start collecting attempts and reports.
              </div>
              <div class="d-flex ga-2 flex-wrap justify-center">
                <v-btn rounded="lg" variant="outlined" @click="resetAll"
                  >Clear filters</v-btn
                >
                <v-btn
                  rounded="lg"
                  color="primary"
                  prepend-icon="lucide:plus"
                  to="/questionnaires/create"
                >
                  New Questionnaire
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
            <template #item.title="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.title }}
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
                :color="
                  item.status === 'published'
                    ? 'success'
                    : item.status === 'draft'
                      ? 'warning'
                      : 'secondary'
                "
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.show_result_to_user="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                :color="item.show_result_to_user ? 'success' : 'warning'"
              >
                {{ item.show_result_to_user ? "Yes" : "No" }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  :to="`/questionnaires/${item.id}`"
                  aria-label="View"
                >
                  <v-icon icon="lucide:arrow-right" />
                </v-btn>

                <v-btn icon variant="text" aria-label="More">
                  <v-icon icon="lucide:more-vertical" />
                  <v-menu activator="parent" location="bottom end">
                    <v-list density="compact">
                      <v-list-item
                        :to="`/questionnaires/${item.id}`"
                        title="View"
                      />
                      <v-list-item
                        title="Edit (UI)"
                        :to="`/questionnaires/${item.id}?tab=overview`"
                      />
                      <v-divider />
                      <v-list-item
                        title="Archive (UI)"
                        @click="openArchive(item)"
                      />
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </template>
      </v-card>

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

type QuestionnaireStatus = "draft" | "published" | "archived";
type ScoringType = "multi_dimension" | "total_score";

interface Questionnaire {
  id: string;
  code: string;
  title: string;
  description: string;
  language: string;
  status: QuestionnaireStatus;
  version: number;
  scoring_type: ScoringType;
  show_result_to_user: boolean;
  created_at: string;
  updated_at: string;
}

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

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

const search = ref("");
const filters = reactive({
  status: "" as QuestionnaireStatus | "",
  scoring_type: "" as ScoringType | "",
  language: "" as string | "",
});

const statusItems: QuestionnaireStatus[] = ["draft", "published", "archived"];
const scoringItems: ScoringType[] = ["multi_dimension", "total_score"];
const languageItems = ["en", "id"];

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return questionnaires.value.filter((it) => {
    if (filters.status && it.status !== filters.status) return false;
    if (filters.scoring_type && it.scoring_type !== filters.scoring_type)
      return false;
    if (filters.language && it.language !== filters.language) return false;

    if (!q) return true;
    return `${it.title} ${it.code}`.toLowerCase().includes(q);
  });
});

const headers = [
  { title: "Questionnaire", key: "title", sortable: true },
  { title: "Language", key: "language", sortable: true },
  { title: "Scoring", key: "scoring_type", sortable: true },
  { title: "Version", key: "version", sortable: true },
  { title: "Show result", key: "show_result_to_user", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const dialogs = reactive({
  confirm: false,
});

const confirm = reactive({
  title: "Archive questionnaire",
  message: "UI only.",
});

function openArchive(item: Questionnaire) {
  confirm.title = "Archive questionnaire";
  confirm.message = `UI only — would archive ${item.title}.`;
  dialogs.confirm = true;
}

function resetFilters() {
  filters.status = "";
  filters.scoring_type = "";
  filters.language = "";
}

function resetAll() {
  search.value = "";
  resetFilters();
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

.sb-search {
  min-width: 320px;
}
</style>
