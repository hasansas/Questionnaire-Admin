<!-- /pages/questionnaires/index.vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Questionnaires"
      subtitle="Manage questionnaires, scoring, meanings, and user info configuration."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-text-field
            v-model="search"
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
            variant="outlined"
            prepend-icon="lucide:sliders-horizontal"
          >
            Filters
            <v-dialog v-model="filterDialog" max-width="760">
              <v-card rounded="xl">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="text-subtitle-1 font-weight-bold">Filters</div>
                  <v-btn icon variant="text" @click="filterDialog = false">
                    <v-icon icon="lucide:x" />
                  </v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-6">
                  <v-row class="ga-4" no-gutters>
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
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="filters.scoring_type"
                        :items="scoringTypeItems"
                        label="Scoring type"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        clearable
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="filters.show_result_to_user"
                        :items="showResultItems"
                        item-title="title"
                        item-value="value"
                        label="Show result to user"
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
                    @click="filterDialog = false"
                  >
                    Close
                  </v-btn>
                  <v-btn
                    rounded="lg"
                    color="primary"
                    @click="filterDialog = false"
                  >
                    Apply
                  </v-btn>
                </v-card-actions>
              </v-card>
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

    <!-- 4 states -->
    <template v-if="ui.loading">
      <v-row>
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
            <div class="text-subtitle-1 font-weight-black">
              All questionnaires
            </div>
            <div class="text-caption text-medium-emphasis">
              Published questionnaires available for organizations
            </div>
          </div>

          <div class="d-flex align-center ga-2">
            <v-chip size="small" variant="tonal">
              Total: {{ rows.length }}
            </v-chip>
            <v-chip size="small" variant="tonal" color="primary">
              Showing: {{ filtered.length }}
            </v-chip>
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
                Try adjusting search or filters.
              </div>
              <div class="d-flex ga-2 flex-wrap justify-center">
                <v-btn rounded="lg" variant="outlined" @click="resetFilters">
                  Reset filters
                </v-btn>
                <v-btn rounded="lg" color="primary" to="/questionnaires/create">
                  Create questionnaire
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
            <template #item.code="{ item }">
              <div class="d-flex flex-column">
                <div class="font-weight-semibold">{{ item.code }}</div>
                <div class="text-caption text-medium-emphasis">
                  v{{ item.version }}
                </div>
              </div>
            </template>

            <template #item.title="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.title }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.description }}
                </div>
              </div>
            </template>

            <template #item.language="{ item }">
              <v-chip size="small" variant="tonal">
                {{ item.language.toUpperCase() }}
              </v-chip>
            </template>

            <template #item.scoring_type="{ item }">
              <v-chip size="small" variant="tonal" color="primary">
                {{
                  item.scoring_type === "multi_dimension"
                    ? "Multi-dimension"
                    : "Total score"
                }}
              </v-chip>
            </template>

            <template #item.show_result_to_user="{ item }">
              <v-chip
                size="small"
                :color="item.show_result_to_user ? 'success' : 'warning'"
                variant="tonal"
              >
                {{ item.show_result_to_user ? "Shown" : "Hidden" }}
              </v-chip>
            </template>

            <template #item.status="{ item }">
              <v-chip size="small" variant="tonal" color="success">
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end ga-1">
                <v-btn
                  icon
                  variant="text"
                  :to="`/questionnaires/${item.id}`"
                  aria-label="View questionnaire"
                >
                  <v-icon icon="lucide:arrow-right" />
                </v-btn>

                <v-btn icon variant="text" aria-label="More actions">
                  <v-icon icon="lucide:more-horizontal" />
                  <v-menu activator="parent" location="bottom end">
                    <v-list density="compact">
                      <v-list-item
                        :to="`/questionnaires/${item.id}`"
                        title="View"
                      />
                      <v-list-item title="Duplicate (UI)" />
                      <v-list-item title="Archive (UI)" />
                    </v-list>
                  </v-menu>
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
import type {
  Questionnaire,
  QuestionnaireLanguage,
  ScoringType,
} from "~/utils/mockPublicData";
import { questionnaires as rows } from "~/utils/mockPublicData";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

const search = ref("");
const filterDialog = ref(false);

const filters = reactive<{
  language: QuestionnaireLanguage | "";
  scoring_type: ScoringType | "";
  show_result_to_user: boolean | "";
}>({
  language: "",
  scoring_type: "",
  show_result_to_user: "",
});

const languageItems: QuestionnaireLanguage[] = ["id", "en"];
const scoringTypeItems: ScoringType[] = ["multi_dimension", "total_score"];
const showResultItems = [
  { title: "Shown", value: true },
  { title: "Hidden", value: false },
];

const headers = [
  { title: "Code", key: "code", sortable: false },
  { title: "Title", key: "title", sortable: false },
  { title: "Language", key: "language", sortable: false },
  { title: "Scoring", key: "scoring_type", sortable: false },
  { title: "Result", key: "show_result_to_user", sortable: false },
  { title: "Status", key: "status", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();

  return (rows as Questionnaire[]).filter((it) => {
    if (filters.language && it.language !== filters.language) return false;
    if (filters.scoring_type && it.scoring_type !== filters.scoring_type)
      return false;
    if (
      filters.show_result_to_user !== "" &&
      it.show_result_to_user !== filters.show_result_to_user
    )
      return false;

    if (!q) return true;
    const hay = `${it.code} ${it.title} ${it.description}`.toLowerCase();
    return hay.includes(q);
  });
});

function resetFilters() {
  filters.language = "";
  filters.scoring_type = "";
  filters.show_result_to_user = "";
  search.value = "";
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
  }, 220);
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
