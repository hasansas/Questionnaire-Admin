<!-- /pages/questionnaires/create.vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Create Questionnaire"
      subtitle="Set up meta, scoring, and option behavior before adding questions."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:arrow-left"
            to="/questionnaires"
          >
            Back
          </v-btn>
          <v-btn
            rounded="lg"
            :variant="canGoPrev ? 'outlined' : 'text'"
            prepend-icon="lucide:chevron-left"
            :disabled="!canGoPrev"
            @click="prevStep"
          >
            Previous
          </v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            :prepend-icon="isLastStep ? 'lucide:check' : 'lucide:chevron-right'"
            :disabled="!canGoNext"
            @click="nextStep"
          >
            {{ isLastStep ? "Create (UI)" : "Next" }}
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <!-- 4 states -->
    <template v-if="ui.loading">
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text, text" />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <v-skeleton-loader type="heading, text" />
            </div>
            <v-divider />
            <div class="pa-4">
              <v-skeleton-loader type="article" />
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
          <v-btn rounded="lg" variant="outlined" to="/questionnaires"
            >Back to list</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else>
      <div class="d-flex flex-column ga-4">
        <!-- Stepper header -->
        <v-card rounded="xl" class="sb-card pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3">
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">Setup wizard</div>
              <div class="text-caption text-medium-emphasis">
                Step {{ step + 1 }} of {{ steps.length }} ·
                {{ steps[step].title }}
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <v-chip
                v-for="(s, idx) in steps"
                :key="s.key"
                size="small"
                :color="idx === step ? 'primary' : idx < step ? 'success' : ''"
                :variant="idx === step ? 'flat' : 'tonal'"
                class="sb-step-chip"
                @click="goToStep(idx)"
              >
                <v-icon :icon="s.icon" size="14" class="me-1" />
                {{ s.title }}
              </v-chip>
            </div>
          </div>

          <v-progress-linear
            :model-value="((step + 1) / steps.length) * 100"
            height="6"
            rounded
            color="primary"
            class="mt-4 opacity-90"
          />
        </v-card>

        <!-- Body -->
        <v-card rounded="xl" class="sb-card">
          <v-window v-model="step">
            <!-- Step 1: Meta -->
            <v-window-item :value="0">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Basic information
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Create the questionnaire identity and behavior.
                    </div>
                  </div>
                  <v-chip size="small" variant="tonal"
                    >Status: published (Phase 1)</v-chip
                  >
                </div>

                <v-row class="ga-4" no-gutters>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="form.code"
                      label="Code"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      placeholder="Example: GB001"
                      prepend-inner-icon="lucide:hash"
                      :error="!!errors.code"
                      :error-messages="errors.code"
                    />
                  </v-col>

                  <v-col cols="12" md="8">
                    <v-text-field
                      v-model="form.title"
                      label="Title"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      placeholder="Example: SB - Kuesioner Gaya Belajar"
                      prepend-inner-icon="lucide:clipboard-list"
                      :error="!!errors.title"
                      :error-messages="errors.title"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-textarea
                      v-model="form.description"
                      label="Description"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      rows="3"
                      auto-grow
                      placeholder="Short description shown in admin and public landing."
                      prepend-inner-icon="lucide:align-left"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="form.language"
                      :items="languageItems"
                      label="Language"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      prepend-inner-icon="lucide:languages"
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-select
                      v-model="form.scoring_type"
                      :items="scoringTypeItems"
                      item-title="title"
                      item-value="value"
                      label="Scoring type"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      prepend-inner-icon="lucide:calculator"
                    />
                  </v-col>

                  <v-col cols="12" md="2">
                    <v-text-field
                      v-model.number="form.version"
                      type="number"
                      label="Version"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      prepend-inner-icon="lucide:git-commit"
                      min="1"
                    />
                  </v-col>

                  <v-col cols="12" md="2">
                    <v-select
                      v-model="form.show_result_to_user"
                      :items="showResultItems"
                      item-title="title"
                      item-value="value"
                      label="Show result"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      prepend-inner-icon="lucide:eye"
                    />
                  </v-col>
                </v-row>

                <v-divider class="my-6" />

                <v-card rounded="xl" variant="tonal" class="pa-4">
                  <div
                    class="d-flex align-start justify-space-between flex-wrap ga-3"
                  >
                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">
                        Quick guidance
                      </div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        Multi-dimension is recommended for learning styles
                        (Visual/Auditori/Kinestetik).
                      </div>
                    </div>
                    <div class="d-flex ga-2 flex-wrap">
                      <v-chip size="small" variant="tonal"
                        >Phase 1: published only</v-chip
                      >
                      <v-chip size="small" variant="tonal"
                        >Mock data only</v-chip
                      >
                    </div>
                  </div>
                </v-card>
              </div>
            </v-window-item>

            <!-- Step 2: Options mode -->
            <v-window-item :value="1">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Options setup
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Choose whether answer options are global (fixed) or per
                      question.
                    </div>
                  </div>
                  <v-chip size="small" variant="tonal" color="primary">
                    Options mode:
                    {{
                      form.options_mode === "fixed"
                        ? "Fixed (global)"
                        : "Per question"
                    }}
                  </v-chip>
                </div>

                <v-row class="ga-4" no-gutters>
                  <v-col cols="12" lg="5">
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div class="text-body-2 font-weight-bold mb-2">
                        Options mode
                      </div>

                      <v-radio-group v-model="form.options_mode" class="mt-2">
                        <v-radio value="fixed" label="Fixed options (global)" />
                        <div
                          class="text-caption text-medium-emphasis ms-7 mb-3"
                        >
                          One option set applies to all questions. Best for
                          large questionnaires with identical answers.
                        </div>

                        <v-radio
                          value="per_question"
                          label="Per-question options"
                        />
                        <div class="text-caption text-medium-emphasis ms-7">
                          Options are configured per question. Best when each
                          question has different answers.
                        </div>
                      </v-radio-group>

                      <v-divider class="my-4" />

                      <div class="text-caption text-medium-emphasis">
                        Recommendation:
                        <span class="font-weight-bold">Fixed</span> for
                        “Setuju/Ragu/Tidak Setuju”.
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="7">
                    <v-card rounded="xl" class="sb-card">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            {{
                              form.options_mode === "fixed"
                                ? "Fixed options"
                                : "Example options"
                            }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{
                              form.options_mode === "fixed"
                                ? "These options will be used by all questions."
                                : "Options will be created inside each question."
                            }}
                          </div>
                        </div>

                        <div class="d-flex align-center ga-2">
                          <v-btn
                            rounded="lg"
                            variant="outlined"
                            prepend-icon="lucide:rotate-ccw"
                            :disabled="form.options_mode !== 'fixed'"
                            @click="resetFixedOptions"
                          >
                            Reset
                          </v-btn>
                          <v-btn
                            rounded="lg"
                            color="primary"
                            prepend-icon="lucide:plus"
                            :disabled="form.options_mode !== 'fixed'"
                            @click="addFixedOption"
                          >
                            Add option
                          </v-btn>
                        </div>
                      </div>

                      <v-divider />

                      <div class="pa-4">
                        <template v-if="form.options_mode === 'fixed'">
                          <v-data-table
                            :headers="fixedOptionHeaders"
                            :items="form.fixed_options"
                            item-key="sort_order"
                            density="comfortable"
                          >
                            <template #item.label="{ item }">
                              <v-text-field
                                v-model="item.label"
                                variant="outlined"
                                rounded="lg"
                                density="comfortable"
                                hide-details
                                placeholder="Label"
                              />
                            </template>

                            <template #item.score_value="{ item }">
                              <v-text-field
                                v-model.number="item.score_value"
                                type="number"
                                variant="outlined"
                                rounded="lg"
                                density="comfortable"
                                hide-details
                                placeholder="Score"
                              />
                            </template>

                            <template #item.sort_order="{ item }">
                              <v-text-field
                                v-model.number="item.sort_order"
                                type="number"
                                variant="outlined"
                                rounded="lg"
                                density="comfortable"
                                hide-details
                                placeholder="Order"
                                min="1"
                              />
                            </template>

                            <template #item.actions="{ item }">
                              <div class="d-flex justify-end ga-1">
                                <v-btn
                                  icon
                                  variant="text"
                                  :disabled="form.fixed_options.length <= 2"
                                  @click="removeFixedOption(item.sort_order)"
                                  aria-label="Remove option"
                                >
                                  <v-icon icon="lucide:trash-2" />
                                </v-btn>
                              </div>
                            </template>
                          </v-data-table>

                          <v-alert
                            v-if="fixedOptionsIssue"
                            type="warning"
                            variant="tonal"
                            rounded="lg"
                            class="mt-4"
                          >
                            {{ fixedOptionsIssue }}
                          </v-alert>
                        </template>

                        <template v-else>
                          <v-card rounded="xl" variant="tonal" class="pa-4">
                            <div class="d-flex align-start ga-3">
                              <v-avatar
                                size="40"
                                rounded="lg"
                                color="primary"
                                variant="tonal"
                              >
                                <v-icon icon="lucide:info" size="18" />
                              </v-avatar>
                              <div class="min-w-0">
                                <div class="text-body-2 font-weight-bold">
                                  Per-question options enabled
                                </div>
                                <div
                                  class="text-caption text-medium-emphasis mt-1"
                                >
                                  When you add a question, you’ll define options
                                  and score there.
                                </div>
                                <div class="d-flex ga-2 flex-wrap mt-3">
                                  <v-chip size="small" variant="tonal"
                                    >Example: A/B/C</v-chip
                                  >
                                  <v-chip size="small" variant="tonal"
                                    >Example: 1–5 scale</v-chip
                                  >
                                  <v-chip size="small" variant="tonal"
                                    >Example: Yes/No</v-chip
                                  >
                                </div>
                              </div>
                            </div>
                          </v-card>
                        </template>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Step 3: Review -->
            <v-window-item :value="2">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">Review</div>
                    <div class="text-caption text-medium-emphasis">
                      Confirm your setup before creating (UI only).
                    </div>
                  </div>
                  <v-chip size="small" variant="tonal" color="success">
                    Ready
                  </v-chip>
                </div>

                <v-row>
                  <v-col cols="12" lg="7">
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div class="text-body-2 font-weight-bold mb-3">
                        Summary
                      </div>

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Code
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ form.code || "—" }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Version
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            v{{ form.version }}
                          </div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">
                            Title
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ form.title || "—" }}
                          </div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">
                            Description
                          </div>
                          <div class="text-body-2 text-medium-emphasis">
                            {{ form.description || "—" }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Language
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ form.language.toUpperCase() }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Scoring type
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              form.scoring_type === "multi_dimension"
                                ? "Multi-dimension"
                                : "Total score"
                            }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Show result
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ form.show_result_to_user ? "Yes" : "No" }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Options mode
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              form.options_mode === "fixed"
                                ? "Fixed (global)"
                                : "Per question"
                            }}
                          </div>
                        </v-col>
                      </v-row>

                      <v-divider class="my-4" />

                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div class="text-caption text-medium-emphasis">
                          Next: you can add questions after creation.
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:clipboard-list"
                          to="/questionnaires"
                        >
                          Go to list
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="5">
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div>
                          <div class="text-body-2 font-weight-bold">
                            Options preview
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{
                              form.options_mode === "fixed"
                                ? "Applied to all questions"
                                : "Configured per question"
                            }}
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal" color="primary">
                          {{
                            form.options_mode === "fixed"
                              ? `${form.fixed_options.length} options`
                              : "—"
                          }}
                        </v-chip>
                      </div>

                      <v-divider class="my-4" />

                      <template v-if="form.options_mode === 'fixed'">
                        <div class="d-flex flex-column ga-2">
                          <v-card
                            v-for="o in fixedOptionsSorted"
                            :key="o.sort_order"
                            rounded="xl"
                            variant="tonal"
                            class="pa-3"
                          >
                            <div
                              class="d-flex align-center justify-space-between"
                            >
                              <div class="text-body-2 font-weight-bold">
                                {{ o.label || "—" }}
                              </div>
                              <v-chip size="small" variant="tonal"
                                >Score: {{ o.score_value }}</v-chip
                              >
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              Order {{ o.sort_order }}
                            </div>
                          </v-card>
                        </div>
                      </template>

                      <template v-else>
                        <v-alert type="info" variant="tonal" rounded="lg">
                          Options will be created in the question editor.
                        </v-alert>
                      </template>
                    </v-card>
                  </v-col>
                </v-row>

                <v-alert
                  v-if="!canSubmit"
                  type="warning"
                  variant="tonal"
                  rounded="lg"
                  class="mt-4"
                >
                  Please complete required fields before creating.
                </v-alert>
              </div>
            </v-window-item>
          </v-window>
        </v-card>

        <!-- Empty state (not expected here, but kept consistent) -->
        <v-card v-if="steps.length === 0" rounded="xl" class="sb-card pa-10">
          <div class="d-flex flex-column align-center text-center">
            <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
              <v-icon icon="lucide:clipboard-list" />
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold">
              Nothing to configure
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
              Steps are not available.
            </div>
            <v-btn rounded="lg" color="primary" to="/questionnaires"
              >Back</v-btn
            >
          </div>
        </v-card>
      </div>

      <!-- Create confirmation dialog -->
      <v-dialog v-model="confirmDialog" max-width="620">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              Create questionnaire (UI only)
            </div>
            <v-btn icon variant="text" @click="confirmDialog = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <v-alert type="info" variant="tonal" rounded="lg" class="mb-4">
              This is mock UI. No data will be saved.
            </v-alert>

            <div class="d-flex flex-column ga-2">
              <div class="d-flex justify-space-between">
                <div class="text-caption text-medium-emphasis">Code</div>
                <div class="text-body-2 font-weight-bold">{{ form.code }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div class="text-caption text-medium-emphasis">Title</div>
                <div class="text-body-2 font-weight-bold">{{ form.title }}</div>
              </div>
              <div class="d-flex justify-space-between">
                <div class="text-caption text-medium-emphasis">Scoring</div>
                <div class="text-body-2 font-weight-bold">
                  {{
                    form.scoring_type === "multi_dimension"
                      ? "Multi-dimension"
                      : "Total score"
                  }}
                </div>
              </div>
              <div class="d-flex justify-space-between">
                <div class="text-caption text-medium-emphasis">
                  Options mode
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ form.options_mode === "fixed" ? "Fixed" : "Per-question" }}
                </div>
              </div>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="confirmDialog = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              prepend-icon="lucide:check"
              to="/questionnaires"
            >
              Done
            </v-btn>
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

type OptionsMode = "fixed" | "per_question";
type QuestionnaireLanguage = "id" | "en";
type ScoringType = "multi_dimension" | "total_score";

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
  }, 200);
}

onMounted(() => reload());

// -----------------------
// Wizard steps
// -----------------------
const steps = [
  { key: "meta", title: "Meta", icon: "lucide:clipboard-list" },
  { key: "options", title: "Options", icon: "lucide:list-checks" },
  { key: "review", title: "Review", icon: "lucide:check-circle-2" },
] as const;

const step = ref(0);

function goToStep(idx: number) {
  if (idx < 0 || idx >= steps.length) return;
  if (idx > step.value && !canGoNext.value) return;
  step.value = idx;
}

const isLastStep = computed(() => step.value === steps.length - 1);
const canGoPrev = computed(() => step.value > 0);

function prevStep() {
  if (!canGoPrev.value) return;
  step.value -= 1;
}

const confirmDialog = ref(false);
function nextStep() {
  if (isLastStep.value) {
    if (!canSubmit.value) return;
    confirmDialog.value = true;
    return;
  }
  if (!canGoNext.value) return;
  step.value += 1;
}

// -----------------------
// Form state
// -----------------------
type FixedOptionRow = {
  label: string;
  score_value: number;
  sort_order: number;
};

const defaultFixedOptions: FixedOptionRow[] = [
  { label: "Setuju", score_value: 2, sort_order: 1 },
  { label: "Ragu", score_value: 1, sort_order: 2 },
  { label: "Tidak Setuju", score_value: 0, sort_order: 3 },
];

const form = reactive({
  code: "",
  title: "",
  description: "",
  language: "id" as QuestionnaireLanguage,
  scoring_type: "multi_dimension" as ScoringType,
  show_result_to_user: true,
  version: 1,
  options_mode: "fixed" as OptionsMode,
  fixed_options: defaultFixedOptions.map((x) => ({ ...x })) as FixedOptionRow[],
});

const errors = reactive<{ code: string; title: string }>({
  code: "",
  title: "",
});

const languageItems: QuestionnaireLanguage[] = ["id", "en"];
const scoringTypeItems = [
  { title: "Multi-dimension", value: "multi_dimension" as const },
  { title: "Total score", value: "total_score" as const },
];

const showResultItems = [
  { title: "Yes", value: true },
  { title: "No", value: false },
];

const fixedOptionHeaders = [
  { title: "Label", key: "label", sortable: false },
  { title: "Score", key: "score_value", sortable: false, width: 160 },
  { title: "Order", key: "sort_order", sortable: false, width: 160 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 80,
  },
];

const fixedOptionsSorted = computed(() =>
  form.fixed_options.slice().sort((a, b) => a.sort_order - b.sort_order),
);

// -----------------------
// Validation
// -----------------------
function validateMeta() {
  errors.code = form.code.trim() ? "" : "Code is required";
  errors.title = form.title.trim() ? "" : "Title is required";
  return !errors.code && !errors.title;
}

const fixedOptionsIssue = computed(() => {
  if (form.options_mode !== "fixed") return "";
  if (form.fixed_options.length < 2)
    return "Fixed options should have at least 2 choices.";
  const hasEmpty = form.fixed_options.some((o) => !o.label.trim());
  if (hasEmpty) return "Option labels cannot be empty.";
  const dupOrder = hasDuplicate(form.fixed_options.map((o) => o.sort_order));
  if (dupOrder) return "Sort order must be unique.";
  return "";
});

function hasDuplicate(nums: number[]) {
  const s = new Set<number>();
  for (const n of nums) {
    if (s.has(n)) return true;
    s.add(n);
  }
  return false;
}

const canGoNext = computed(() => {
  if (step.value === 0) return validateMeta();
  if (step.value === 1)
    return form.options_mode === "fixed" ? !fixedOptionsIssue.value : true;
  return true;
});

const canSubmit = computed(
  () =>
    validateMeta() &&
    (form.options_mode !== "fixed" || !fixedOptionsIssue.value),
);

// -----------------------
// Fixed options actions
// -----------------------
function resetFixedOptions() {
  form.fixed_options = defaultFixedOptions.map((x) => ({ ...x }));
}

function addFixedOption() {
  const maxOrder = Math.max(0, ...form.fixed_options.map((x) => x.sort_order));
  form.fixed_options.push({
    label: "",
    score_value: 0,
    sort_order: maxOrder + 1,
  });
}

function removeFixedOption(order: number) {
  form.fixed_options = form.fixed_options.filter((x) => x.sort_order !== order);
}
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-step-chip {
  cursor: pointer;
}
</style>
