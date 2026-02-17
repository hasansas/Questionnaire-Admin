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
      >
        <template #actions>
          <div class="d-flex align-center ga-2 flex-wrap justify-end">
            <v-btn
              rounded="lg"
              variant="outlined"
              prepend-icon="lucide:arrow-left"
              to="/questionnaires"
            >
              Back
            </v-btn>
          </div>
        </template>
      </AdminPageHeader>

      <!-- Questionnaire Header + Stats -->
      <v-card rounded="xl" class="sb-card pa-5 mb-6" variant="outlined">
        <div class="d-flex align-start flex-wrap ga-4">
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black text-capitalize">
              Questionnaire summary
            </div>
            <div class="text-body-2 text-medium-emphasis mt-2">
              {{ questionnaire.code }}
            </div>
          </div>
          <v-chip variant="tonal" class="px-3" :color="statusColor">
            <v-icon :icon="statusIcon" size="16" class="me-1" />
            {{ statusLabel }}
          </v-chip>

          <v-spacer />

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-chip variant="tonal" class="px-3">
              <v-icon
                :icon="
                  questionnaire.scoringType === 'multi_dimension'
                    ? 'lucide:layers'
                    : 'lucide:sigma'
                "
                size="16"
                class="me-1"
              />
              {{
                questionnaire.scoringType === "multi_dimension"
                  ? "Multi dimension"
                  : "Total score"
              }}
            </v-chip>
            <v-chip variant="tonal" class="px-3">
              <v-icon
                :icon="
                  questionnaire.optionsMode === 'fixed'
                    ? 'lucide:toggle-left'
                    : 'lucide:list-tree'
                "
                size="16"
                class="me-1"
              />
              {{
                questionnaire.optionsMode === "fixed"
                  ? "Fixed options"
                  : "Per-question options"
              }}
            </v-chip>
          </div>
        </div>

        <v-divider class="my-4" />

        <!-- Stats -->
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">Questions</div>
                  <div class="text-h6 font-weight-black">20</div>
                </div>
                <v-avatar
                  size="40"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:list-checks" size="18" />
                </v-avatar>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Dimensions
                  </div>
                  <div class="text-h6 font-weight-black">6</div>
                </div>
                <v-avatar size="40" rounded="lg" color="info" variant="tonal">
                  <v-icon icon="lucide:layers" size="18" />
                </v-avatar>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">Bands</div>
                  <div class="text-h6 font-weight-black">5</div>
                </div>
                <v-avatar
                  size="40"
                  rounded="lg"
                  color="success"
                  variant="tonal"
                >
                  <v-icon icon="lucide:sliders-horizontal" size="18" />
                </v-avatar>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">Meanings</div>
                  <div class="text-h6 font-weight-black">9</div>
                </div>
                <v-avatar
                  size="40"
                  rounded="lg"
                  color="warning"
                  variant="tonal"
                >
                  <v-icon icon="lucide:sparkles" size="18" />
                </v-avatar>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

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
                  <div class="text-subtitle-1 font-weight-black">Bands</div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Configure score bands and ranges for outcomes.
                  </div>
                </v-card>
              </div>
            </v-window-item>

            <!-- Meanings -->
            <v-window-item value="meanings">
              <div class="pa-4">
                <v-card rounded="xl" variant="outlined" class="sb-card pa-4">
                  <div class="text-subtitle-1 font-weight-black">Meanings</div>
                  <div class="text-body-2 text-medium-emphasis mt-1">
                    Write interpretation content shown in results.
                  </div>
                </v-card>
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
  title: "questionnaires",
  breadcrumbs: [
    { title: "questionnaires", disabled: false, to: "/questionnaires" },
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
  ui.loading = false;

  if (!getData.success) {
    ui.error = "Unable to fetch qisMultiDimensionuestionnaire detail.";
  }
  questionnaire.value = getData.data as QuestionnaireModel;
}

onMounted(() => fetchDatahDetail());

// -----------------------
// Tabs
// -----------------------
type TabKey = "overview" | "questions" | "dimensions" | "bands" | "meanings";
const tab = ref<TabKey>("overview");
</script>
