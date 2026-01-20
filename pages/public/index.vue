<template>
  <v-container class="pa-6 pa-sm-10">
    <!-- Page Header -->
    <div class="d-flex align-start justify-space-between flex-wrap ga-3 mb-6">
      <div class="min-w-0">
        <h1 class="text-h5 text-sm-h4 font-weight-black mb-1">
          Questionnaires
        </h1>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Browse published questionnaires. No login required.
        </p>
      </div>

      <div class="d-flex ga-2 flex-wrap">
        <v-btn
          rounded="lg"
          variant="outlined"
          to="/"
          prepend-icon="lucide:arrow-left"
        >
          Back
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <template v-if="uiState === 'loading'">
      <v-row class="ga-4" align="stretch">
        <v-col cols="12">
          <v-skeleton-loader type="heading, text, actions" />
        </v-col>

        <v-col cols="12" md="8">
          <v-skeleton-loader type="actions" />
        </v-col>

        <v-col cols="12" sm="6" md="4" v-for="n in 6" :key="`sk-${n}`">
          <v-skeleton-loader type="article" />
        </v-col>
      </v-row>
    </template>

    <!-- Error -->
    <template v-else-if="uiState === 'error'">
      <v-row justify="center">
        <v-col cols="12" md="8" lg="6">
          <v-card rounded="xl" variant="outlined" class="pa-6">
            <div class="d-flex align-start ga-4">
              <v-icon icon="lucide:alert-triangle" size="24" class="mt-1" />
              <div class="min-w-0">
                <div class="text-h6 font-weight-black mb-1">
                  Couldn’t load questionnaires
                </div>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  This is a mocked error state for Phase 1 UI testing.
                </p>

                <div class="d-flex ga-2 flex-wrap">
                  <v-btn
                    rounded="lg"
                    color="primary"
                    @click="retryLoad"
                    prepend-icon="lucide:refresh-cw"
                  >
                    Retry
                  </v-btn>
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    to="/"
                    prepend-icon="lucide:home"
                  >
                    Go home
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Empty -->
    <template v-else-if="uiState === 'empty'">
      <v-row justify="center">
        <v-col cols="12" md="9" lg="7">
          <v-card rounded="xl" variant="outlined" class="pa-6">
            <div class="d-flex align-start ga-4">
              <v-icon icon="lucide:inbox" size="24" class="mt-1" />
              <div class="min-w-0">
                <div class="text-h6 font-weight-black mb-1">
                  No published questionnaires
                </div>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  When questionnaires are published, they will appear here.
                </p>

                <div class="d-flex ga-2 flex-wrap">
                  <v-btn
                    rounded="lg"
                    color="primary"
                    to="/"
                    prepend-icon="lucide:home"
                  >
                    Back to landing
                  </v-btn>
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    @click="retryLoad"
                    prepend-icon="lucide:refresh-cw"
                  >
                    Reload
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Data -->
    <template v-else>
      <!-- Controls -->
      <v-card rounded="xl" variant="outlined" class="pa-4 pa-sm-5 mb-6">
        <v-row class="ga-4" align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Search questionnaires"
              placeholder="Search by title, description, code..."
              prepend-inner-icon="lucide:search"
              variant="outlined"
              rounded="lg"
              hide-details
              clearable
            />
          </v-col>

          <v-col cols="12" md="6">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3"
            >
              <div class="d-flex align-center ga-2 flex-wrap">
                <div class="text-body-2 text-medium-emphasis">Language:</div>

                <v-chip
                  label
                  :color="languageFilter === 'all' ? 'primary' : undefined"
                  :variant="languageFilter === 'all' ? 'tonal' : 'outlined'"
                  class="cursor-pointer"
                  @click="languageFilter = 'all'"
                >
                  All
                </v-chip>

                <v-chip
                  label
                  :color="languageFilter === 'id' ? 'primary' : undefined"
                  :variant="languageFilter === 'id' ? 'tonal' : 'outlined'"
                  class="cursor-pointer"
                  @click="languageFilter = 'id'"
                >
                  ID
                </v-chip>

                <v-chip
                  label
                  :color="languageFilter === 'en' ? 'primary' : undefined"
                  :variant="languageFilter === 'en' ? 'tonal' : 'outlined'"
                  class="cursor-pointer"
                  @click="languageFilter = 'en'"
                >
                  EN
                </v-chip>
              </div>

              <div class="d-flex align-center ga-2 flex-wrap">
                <v-chip label color="success" variant="tonal">
                  Published only
                </v-chip>
                <v-btn
                  rounded="lg"
                  variant="text"
                  prepend-icon="lucide:x"
                  :disabled="!hasActiveFilters"
                  @click="resetFilters"
                >
                  Clear
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card>

      <!-- Results meta -->
      <div
        class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
      >
        <div class="text-body-2 text-medium-emphasis">
          Showing
          <span class="font-weight-bold text-high-emphasis">{{
            filteredQuestionnaires.length
          }}</span>
          questionnaire<span v-if="filteredQuestionnaires.length !== 1">s</span>
        </div>

        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip size="small" variant="tonal" color="info" label>
            Mock data • GB001 included
          </v-chip>
        </div>
      </div>

      <!-- Empty results (after filtering) -->
      <v-card
        v-if="filteredQuestionnaires.length === 0"
        rounded="xl"
        variant="outlined"
        class="pa-6"
      >
        <div class="d-flex align-start ga-4">
          <v-icon icon="lucide:search-x" size="24" class="mt-1" />
          <div class="min-w-0">
            <div class="text-h6 font-weight-black mb-1">No matches found</div>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Try adjusting your search or language filter.
            </p>

            <div class="d-flex ga-2 flex-wrap">
              <v-btn
                rounded="lg"
                color="primary"
                @click="resetFilters"
                prepend-icon="lucide:x"
              >
                Clear filters
              </v-btn>
              <v-btn
                rounded="lg"
                variant="outlined"
                to="/"
                prepend-icon="lucide:home"
              >
                Back to landing
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <!-- Cards -->
      <v-row v-else class="ga-4" align="stretch">
        <v-col
          cols="12"
          sm="6"
          md="4"
          v-for="q in filteredQuestionnaires"
          :key="q.id"
        >
          <v-card
            rounded="xl"
            variant="outlined"
            class="pa-5 h-100 d-flex flex-column"
          >
            <div class="d-flex align-start justify-space-between ga-3">
              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-bold">
                  {{ q.title }}
                </div>
                <div class="text-body-2 text-medium-emphasis line-clamp-3 mt-1">
                  {{ q.description }}
                </div>
              </div>

              <v-chip size="small" variant="tonal" color="primary" label>
                {{ q.language.toUpperCase() }}
              </v-chip>
            </div>

            <div class="d-flex ga-2 flex-wrap mt-4">
              <v-chip size="small" variant="tonal" color="secondary" label
                >v{{ q.version }}</v-chip
              >
              <v-chip size="small" variant="tonal" color="info" label>
                {{
                  q.scoring_type === "multi_dimension"
                    ? "Multi-dimension"
                    : "Total score"
                }}
              </v-chip>
              <v-chip
                size="small"
                variant="tonal"
                :color="q.show_result_to_user ? 'success' : 'warning'"
                label
              >
                {{ q.show_result_to_user ? "Shows result" : "Thank-you only" }}
              </v-chip>
              <v-chip size="small" variant="outlined" label>
                Code: {{ q.code }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex align-center justify-space-between">
              <div
                class="text-body-2 text-medium-emphasis d-flex align-center ga-2"
              >
                <v-icon icon="lucide:clock" size="18" />
                {{ estimateMinutes(q.code) }} min
              </div>

              <v-btn
                rounded="lg"
                color="primary"
                :to="`/q/${q.code}`"
                prepend-icon="lucide:play"
              >
                Start
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Footer help -->
      <div class="mt-8">
        <v-alert variant="tonal" type="info" rounded="xl" class="pa-4">
          <div class="d-flex align-start ga-3">
            <v-icon icon="lucide:info" size="20" class="mt-1" />
            <div class="min-w-0">
              <div class="font-weight-bold mb-1">Share links are supported</div>
              <div class="text-body-2">
                You can open a questionnaire directly via
                <span class="font-weight-bold">/q/&lt;code&gt;</span>. Example:
                <span class="font-weight-bold">/q/GB001</span>
              </div>
            </div>
          </div>
        </v-alert>
      </div>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import {
  questionnaires as mockQuestionnaires,
  questionnaire_questions,
  type Questionnaire,
} from "~/utils/mockPublicData";

type UiState = "loading" | "error" | "empty" | "data";
type LanguageFilter = "all" | "id" | "en";

const route = useRoute();

const uiState = ref<UiState>("loading");
const questionnaires = ref<Questionnaire[]>([]);

const search = ref("");
const languageFilter = ref<LanguageFilter>("all");

const hasActiveFilters = computed(() => {
  return Boolean(search.value?.trim()) || languageFilter.value !== "all";
});

function resetFilters() {
  search.value = "";
  languageFilter.value = "all";
}

function loadMockData() {
  // Published only (per requirement)
  questionnaires.value = mockQuestionnaires.filter(
    (q) => q.status === "published",
  );
}

function retryLoad() {
  uiState.value = "loading";
  window.setTimeout(() => {
    loadMockData();
    uiState.value = questionnaires.value.length ? "data" : "empty";
  }, 450);
}

const filteredQuestionnaires = computed(() => {
  const q = questionnaires.value;

  const byLang =
    languageFilter.value === "all"
      ? q
      : q.filter((x) => x.language === languageFilter.value);

  const s = search.value.trim().toLowerCase();
  if (!s) return byLang;

  return byLang.filter((x) => {
    const hay = `${x.title} ${x.description} ${x.code}`.toLowerCase();
    return hay.includes(s);
  });
});

function estimateMinutes(code: string) {
  const questionnaire = questionnaires.value.find((q) => q.code === code);
  if (!questionnaire) return 5;

  const qCount = questionnaire_questions.filter(
    (qq) => qq.questionnaire_id === questionnaire.id,
  ).length;
  // heuristic: ~6 questions per minute, min 3 minutes
  return Math.max(3, Math.ceil(qCount / 6));
}

onMounted(() => {
  const forced =
    (route.query.state?.toString() as UiState | undefined) ?? undefined;

  if (forced && ["loading", "error", "empty", "data"].includes(forced)) {
    uiState.value = forced;
    if (forced === "data") loadMockData();
    return;
  }

  uiState.value = "loading";
  window.setTimeout(() => {
    loadMockData();
    uiState.value = questionnaires.value.length ? "data" : "empty";
  }, 350);
});

useHead(() => {
  const title = "Questionnaires — Public catalog";
  const description =
    "Browse published questionnaires. Start anonymously via share link or catalog. Mobile-friendly, fast, and clear.";

  return {
    title,
    meta: [
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://example.com/questionnaires" },
    ],
  };
});
</script>

<style lang="scss" scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  -webkit-line-clamp: 3;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
