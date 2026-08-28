<template>
  <div>
    <!-- Loading (first load) -->
    <SbSkeletonTable v-if="ui.loading" :show-header="true" />

    <!-- Error -->
    <v-card v-else-if="!questionnaire" rounded="xl" class="sb-card pa-16">
      <div class="d-flex flex-column align-center text-center py-16">
        <v-avatar size="56" color="warning" variant="tonal" class="mb-3">
          <v-icon icon="lucide:circle-off" />
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold">
          Questionnaire not found
        </div>
        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
          The ID may be invalid.
        </div>
        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:refresh-cw"
          :loading="ui.loading"
          @click="fetchDatahDetail"
        >
          Retry
        </v-btn>
      </div>
    </v-card>

    <!-- Data -->
    <template v-else>
      <AdminPageHeader
        :title="pageTitle"
        :subtitle="' Configure overview, questions, scoring, bands, meanings.'"
        show-back
        back-to="/questionnaires"
      >
      </AdminPageHeader>

      <!-- Tabs -->
      <v-card rounded="xl" variant="outlined" class="sb-card">
        <v-tabs v-model="tab" class="px-2">
          <v-tab value="overview">
            <v-icon icon="lucide:layout-dashboard" size="18" class="me-2" />
            Overview
          </v-tab>

          <v-tab value="questions">
            <v-icon icon="lucide:list-checks" size="18" class="me-2" />
            Questions
          </v-tab>

          <v-tab
            v-if="questionnaire.scoringType === 'multi_dimension'"
            value="dimensions"
          >
            <v-icon icon="lucide:layers" size="18" class="me-2" />
            Dimensions
          </v-tab>

          <v-tab value="bands">
            <v-icon icon="lucide:sliders-horizontal" size="18" class="me-2" />
            Bands
          </v-tab>

          <v-tab value="meanings">
            <v-icon icon="lucide:sparkles" size="18" class="me-2" />
            Meanings
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-card-text class="pa-0">
          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-4">
                <QuestionnaireOverview :model="questionnaire" />
              </div>
            </v-window-item>

            <!-- Questions -->
            <v-window-item value="questions">
              <div class="pa-4">
                <QuestionnaireQuestions :model="questionnaire" />
              </div>
            </v-window-item>

            <!-- Dimensions (for multi-dimension scoring)-->
            <v-window-item
              v-if="questionnaire.scoringType === 'multi_dimension'"
              value="dimensions"
            >
              <div class="pa-4">
                <QuestionnaireDimensions :model="questionnaire" />
              </div>
            </v-window-item>

            <!-- Bands -->
            <v-window-item value="bands">
              <div class="pa-4">
                <v-card rounded="xl" variant="outlined" class="sb-card pa-4">
                  <div class="pa-4">
                    <QuestionnaireScoreBands :model="questionnaire" />
                  </div>
                </v-card>
              </div>
            </v-window-item>

            <!-- Meanings -->
            <v-window-item value="meanings">
              <div class="pa-4">
                <QuestionnaireMeanings :model="questionnaire" />
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-divider />
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { type QuestionnaireModel } from "~/models/questionnaire";

definePageMeta({
  middleware: ["auth"],
  title: "Questionnaires",
  breadcrumbs: [
    { title: "Questionnaires", disabled: false, to: "/questionnaires" },
    { title: "Manage", disabled: true },
  ],
});

const route = useRoute();
const questionnairenId = computed(() => (route.params.id ?? "").toString());
const questionnaireStore = useqQestionnaireStore();
const questionnaire = ref<QuestionnaireModel | null>(null);

// -----------------------
// UI state (4 states)
// -----------------------
const ui = reactive({
  loading: true,
  error: "" as string | "",
});

// -----------------------
// Summary stats (Questions / Dimensions / Bands / Meanings)
// -----------------------
const stats = reactive({
  questions: 0,
  dimensions: 0,
  bands: 0,
  meanings: 0,
});

async function fetchStats(): Promise<void> {
  const qId = questionnairenId.value;
  if (!qId || !questionnaire.value) return;

  const isMultiDimension = questionnaire.value.scoringType === "multi_dimension";

  // Deliberately bypass useQuestionnaireQuestions/useQuestionnaireDimensionStore
  // here — those are singletons keyed by questionnaireId, shared with the
  // Questions/Dimensions tab components. Calling their fetchAll() with a
  // cheap `limit=1` (just to read pagination.total) would cache that small
  // page size into the SAME shared store, and the tab's own later
  // `limit=100` fetchAll() would then wrongly serve back this stale 1-row
  // cache instead of making its real request (useResourceStore treats
  // "already have >= perPage rows cached" as "no need to refetch"). A
  // direct, uncached API call here avoids poisoning that shared state.
  const api = useApiService();
  const scoreBandsStore = useQuestionnaireScoreBandsStore();
  const meaningsStore = useQuestionnaireMeaningsStore(qId);

  const tasks: Promise<void>[] = [
    api
      .get(`/v1/questionnaires/${qId}/questions?limit=1`)
      .then((res: any) => {
        if (res.success) stats.questions = res.data?.pagination?.total ?? 0;
      })
      .catch(() => {}),

    scoreBandsStore.fetchScoreBandsList(qId).then((res) => {
      if (res.success) stats.bands = res.data.length;
    }),

    meaningsStore
      .fetchMeanings()
      .then(() => {
        stats.meanings = meaningsStore.totalMeanings;
      })
      .catch(() => {}),
  ];

  if (isMultiDimension) {
    tasks.push(
      api
        .get(`/v1/questionnaires/${qId}/dimensions?limit=1`)
        .then((res: any) => {
          if (res.success) stats.dimensions = res.data?.pagination?.total ?? 0;
        })
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
}

// -----------------------
// Page header text
// -----------------------
const pageTitle = computed(() => questionnaire.value?.title || "Questionnaire");
const pageSubtitle = computed(() =>
  questionnaire.value
    ? `${questionnaire.value.code} · v${questionnaire.value.version}`
    : "Questionnaire detail",
);

const statusLabel = computed(() => {
  const s = (questionnaire.value?.status ?? "draft").toLowerCase();
  if (s === "published") return "Published";
  if (s === "archived") return "Archived";
  return "Draft";
});

const statusColor = computed(() => {
  const s = (questionnaire.value?.status ?? "draft").toLowerCase();
  if (s === "published") return "success";
  if (s === "archived") return "grey";
  return "warning";
});

const statusIcon = computed(() => {
  const s = (questionnaire.value?.status ?? "draft").toLowerCase();
  if (s === "published") return "lucide:badge-check";
  if (s === "archived") return "lucide:archive";
  return "lucide:file-edit";
});

async function fetchDatahDetail() {
  const getData = await questionnaireStore.getById({
    id: questionnairenId.value,
  });

  if (!getData.success) {
    ui.error = "Unable to fetch qisMultiDimensionuestionnaire detail.";
    ui.loading = false;
    return;
  }

  questionnaire.value = getData.data as QuestionnaireModel;
  await fetchStats();
  ui.loading = false;
}

onMounted(() => fetchDatahDetail());

// -----------------------
// Tabs
// -----------------------
type TabKey = "overview" | "questions" | "dimensions" | "bands" | "meanings";
const tab = ref<TabKey>("overview");
</script>
