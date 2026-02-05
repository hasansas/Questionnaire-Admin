<template>
  <div class="d-flex flex-column ga-4">
    <!-- Intro -->
    <div class="text-body-2 text-medium-emphasis">
      Configure questionnaire setup, scoring rules, and visibility.
    </div>

    <v-form ref="formRef" @submit.prevent>
      <v-expansion-panels
        v-model="openPanel"
        variant="accordion"
        class="sb-accordion rounded-lg overflow-hidden"
        elevation="0"
      >
        <!-- Panel 1: Basic -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center justify-space-between w-100 ga-3">
              <div class="d-flex align-center ga-2 min-w-0">
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">
                    Basic information
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Create the questionnaire identity and behavior.
                  </div>
                </div>
              </div>
              <v-icon
                :icon="panelStatusIcon('basic')"
                :color="panelStatusColor('basic')"
                class="mr-4"
              />
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-card rounded="xl" class="sb-card" variant="flat">
              <div class="py-4">
                <v-select
                  v-model="form.status"
                  label="Status"
                  :items="statusOptions"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[rules.required]"
                  prepend-inner-icon="lucide:badge-check"
                  hide-details="auto"
                  class="mb-4"
                />

                <v-text-field
                  v-model.trim="form.title"
                  label="Questionnaire Title"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[rules.required, rules.min3]"
                  prepend-inner-icon="lucide:clipboard-list"
                  hide-details="auto"
                  class="mb-4"
                />
                <v-textarea
                  v-model.trim="form.description"
                  label="Description (optional)"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  auto-grow
                  rows="3"
                  prepend-inner-icon="lucide:align-left"
                  hide-details="auto"
                  class="mb-4"
                />
                <v-select
                  v-model="form.scoringType"
                  label="Scoring Type"
                  :items="scoringTypeOptions"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  :rules="[rules.required]"
                  prepend-inner-icon="lucide:layers"
                  hide-details="auto"
                  class="mb-4"
                />
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="form.language"
                      label="Language"
                      :items="languageOptions"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      :rules="[rules.required]"
                      prepend-inner-icon="lucide:languages"
                      hide-details="auto"
                      class="mb-4"
                    />
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model.number="form.version"
                      label="Version"
                      type="number"
                      min="1"
                      variant="outlined"
                      rounded="lg"
                      density="comfortable"
                      :rules="[rules.required]"
                      prepend-inner-icon="lucide:hash"
                      hide-details="auto"
                      class="mb-4"
                    />
                  </v-col>
                </v-row>

                <!-- Visibility -->
                <v-card variant="outlined" rounded="xl" class="pa-4">
                  <div class="d-flex align-center justify-space-between ga-4">
                    <div class="d-flex align-center ga-3 min-w-0">
                      <v-avatar
                        size="36"
                        rounded="lg"
                        color="primary"
                        variant="tonal"
                      >
                        <v-icon icon="lucide:eye" size="18" />
                      </v-avatar>

                      <div class="min-w-0">
                        <div class="text-body-2 font-weight-bold">
                          Show Result to User
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          Users can see their results after submitting.
                        </div>
                      </div>
                    </div>

                    <v-switch
                      v-model="form.showResultToUser"
                      inset
                      color="primary"
                      hide-details
                    />
                  </div>
                </v-card>

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
                  </div>
                </v-card>
              </div>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 2: Options -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center justify-space-between w-100 ga-3">
              <div class="d-flex align-center ga-2 min-w-0">
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">
                    Options setup
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Choose global fixed options or per-question options.
                  </div>
                </div>
              </div>
              <v-icon
                :icon="panelStatusIcon('options')"
                :color="panelStatusColor('options')"
                class="mr-4"
              />
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-card rounded="xl" class="sb-card" variant="flat">
              <div class="py-4">
                <v-row class="ga-4" no-gutters>
                  <v-col cols="12">
                    <v-card rounded="xl" variant="outlined" class="pa-4">
                      <div class="text-body-2 font-weight-bold mb-2">
                        Options mode
                      </div>

                      <v-radio-group v-model="form.optionsMode" class="mt-2">
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

                  <v-col cols="12">
                    <v-card rounded="xl" variant="outlined">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                      >
                        <div>
                          <div class="text-body-2 font-weight-bold mb-2">
                            {{
                              form.optionsMode === "fixed"
                                ? "Fixed options"
                                : "Example options"
                            }}
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{
                              form.optionsMode === "fixed"
                                ? "These options will be used by all questions."
                                : "Options will be created inside each question."
                            }}
                          </div>
                        </div>
                      </div>

                      <v-divider />

                      <div class="pa-4">
                        <template v-if="form.optionsMode === 'fixed'">
                          <div class="d-flex flex-column ga-3">
                            <Draggable
                              v-model="form.fixedOptions"
                              item-key="sortOrder"
                              handle=".drag-handle"
                              :animation="180"
                              class="d-flex flex-column ga-3"
                              @end="syncFixedOptionsSortOrder"
                            >
                              <template #item="{ element: item, index: idx }">
                                <v-card
                                  rounded="xl"
                                  variant="outlined"
                                  class="pa-4 drag-handle"
                                >
                                  <div
                                    class="d-flex align-start justify-space-between ga-3"
                                  >
                                    <!-- left: drag handle + title -->
                                    <div
                                      class="d-flex align-start ga-3 min-w-0"
                                    >
                                      <v-icon
                                        icon="lucide:grip-vertical"
                                        class="mt-2"
                                      />

                                      <div class="min-w-0">
                                        <div
                                          class="text-body-2 font-weight-bold"
                                        >
                                          Option {{ idx + 1 }}
                                        </div>
                                        <div
                                          class="text-caption text-medium-emphasis"
                                        >
                                          Configure label and score.
                                        </div>
                                      </div>
                                    </div>

                                    <!-- right: delete confirm via menu -->
                                    <v-menu
                                      location="bottom end"
                                      :close-on-content-click="true"
                                    >
                                      <template
                                        #activator="{ props: menuProps }"
                                      >
                                        <v-btn
                                          v-bind="menuProps"
                                          icon
                                          variant="text"
                                          :disabled="
                                            form.fixedOptions.length <= 2
                                          "
                                          aria-label="Option actions"
                                        >
                                          <v-icon
                                            icon="lucide:trash-2"
                                            size="20"
                                          />
                                        </v-btn>
                                      </template>

                                      <v-list density="compact" min-width="180">
                                        <v-list-item
                                          title="Delete option"
                                          class="text-error"
                                          :disabled="
                                            form.fixedOptions.length <= 2
                                          "
                                          @click="
                                            removeFixedOption(item.sortOrder)
                                          "
                                        >
                                          <template #prepend>
                                            <v-icon
                                              icon="lucide:trash-2"
                                              class="text-error"
                                            />
                                          </template>
                                        </v-list-item>
                                        <v-divider />
                                        <v-list-item title="Cancel" @click.stop>
                                          <template #prepend>
                                            <v-icon icon="lucide:x" />
                                          </template>
                                        </v-list-item>
                                      </v-list>
                                    </v-menu>
                                  </div>

                                  <v-divider class="my-3" />

                                  <v-row dense>
                                    <v-col cols="8">
                                      <v-text-field
                                        v-model.trim="item.label"
                                        label="Label"
                                        variant="outlined"
                                        rounded="lg"
                                        density="comfortable"
                                        hide-details="auto"
                                        placeholder="Example: Setuju"
                                        :error="
                                          validationAttempted &&
                                          !String(item.label || '').trim()
                                        "
                                        :error-messages="
                                          validationAttempted &&
                                          !String(item.label || '').trim()
                                            ? 'Label is required'
                                            : ''
                                        "
                                      />
                                    </v-col>

                                    <v-col cols="4">
                                      <v-text-field
                                        v-model.number="item.scoreValue"
                                        label="Score"
                                        type="number"
                                        variant="outlined"
                                        rounded="lg"
                                        density="comfortable"
                                        hide-details="auto"
                                        placeholder="0"
                                        :error="
                                          validationAttempted &&
                                          !isFiniteNumber(item.scoreValue)
                                        "
                                        :error-messages="
                                          validationAttempted &&
                                          !isFiniteNumber(item.scoreValue)
                                            ? 'Score must be a number'
                                            : ''
                                        "
                                      />
                                    </v-col>
                                  </v-row>
                                </v-card>
                              </template>
                            </Draggable>

                            <div class="pa-4">
                              <v-row>
                                <v-col cols="6">
                                  <v-btn
                                    rounded="lg"
                                    variant="outlined"
                                    prepend-icon="lucide:rotate-ccw"
                                    block
                                    :disabled="form.optionsMode !== 'fixed'"
                                    @click="resetFixedOptions"
                                  >
                                    Reset
                                  </v-btn>
                                </v-col>
                                <v-col cols="6">
                                  <v-btn
                                    variant="flat"
                                    rounded="lg"
                                    color="primary"
                                    prepend-icon="lucide:plus"
                                    block
                                    :disabled="form.optionsMode !== 'fixed'"
                                    @click="addFixedOption"
                                  >
                                    Add option
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </div>

                            <!-- helper footer -->
                            <v-alert
                              v-if="validationAttempted && fixedOptionsIssue"
                              type="warning"
                              variant="tonal"
                              rounded="lg"
                              class="mt-1"
                            >
                              {{ fixedOptionsIssue }}
                            </v-alert>
                          </div>
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
                                    >A/B/C</v-chip
                                  >
                                  <v-chip size="small" variant="tonal"
                                    >1–5 scale</v-chip
                                  >
                                  <v-chip size="small" variant="tonal"
                                    >Yes/No</v-chip
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
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>

        <!-- Panel 3: Review -->
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="d-flex align-center justify-space-between w-100 ga-3">
              <div class="d-flex align-center ga-2 min-w-0">
                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black">Review</div>
                  <div class="text-caption text-medium-emphasis">
                    Confirm your setup before creating (UI only).
                  </div>
                </div>
              </div>
              <v-icon
                :icon="panelStatusIcon('review')"
                :color="panelStatusColor('review')"
                class="mr-4"
              />
            </div>
          </v-expansion-panel-title>

          <v-expansion-panel-text>
            <v-card rounded="xl" variant="outlined" elevation="0">
              <div class="py-4">
                <v-row>
                  <v-col cols="12">
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div class="text-body-2 font-weight-bold mb-3">
                        Summary
                      </div>

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Version
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            v{{ form.version || 1 }}
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
                            {{
                              (form.language || "—").toString().toUpperCase()
                            }}
                          </div>
                        </v-col>

                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Scoring type
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              form.scoringType === "multi_dimension"
                                ? "Multi-dimension"
                                : form.scoringType === "total_score"
                                  ? "Total score"
                                  : "—"
                            }}
                          </div>
                        </v-col>

                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Show result
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ form.showResultToUser ? "Yes" : "No" }}
                          </div>
                        </v-col>

                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Options mode
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              form.optionsMode === "fixed"
                                ? "Fixed (global)"
                                : "Per question"
                            }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12">
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
                              form.optionsMode === "fixed"
                                ? "Applied to all questions"
                                : "Configured per question"
                            }}
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal" color="primary">
                          {{
                            form.optionsMode === "fixed"
                              ? `${fixedOptionsSorted.length} options`
                              : "—"
                          }}
                        </v-chip>
                      </div>

                      <v-divider class="my-4" />

                      <template v-if="form.optionsMode === 'fixed'">
                        <div class="d-flex flex-column ga-2">
                          <v-card
                            v-for="o in fixedOptionsSorted"
                            :key="o.sortOrder"
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
                              <v-chip size="small" variant="tonal">
                                Score: {{ o.scoreValue }}
                              </v-chip>
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
                  v-if="validationAttempted && !canSubmit"
                  type="warning"
                  variant="tonal"
                  rounded="lg"
                  class="mt-4"
                >
                  Please complete required fields before creating.
                </v-alert>
              </div>
            </v-card>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import type { VForm } from "vuetify/components";
import type { QuestionnaireFormModel } from "~/models/questionnaire";
import Draggable from "vuedraggable";

function syncFixedOptionsSortOrder() {
  // keep sortOrder consistent with visual order (1..n)
  form.value.fixedOptions = (form.value.fixedOptions || []).map((o, i) => ({
    ...o,
    sortOrder: i + 1,
  }));
}

type RuleFn = (v: any) => true | string;
export interface QuestionnaireFormRules {
  required: RuleFn;
  min3: RuleFn;
  min1: RuleFn;
  requiredTruthy: RuleFn;
}

const form = defineModel<QuestionnaireFormModel>({ required: true });
const formRef = ref<InstanceType<typeof VForm> | null>(null);

// options
const languageOptions = [
  { title: "Indonesian", value: "id" },
  { title: "English", value: "en" },
];

const statusOptions = [
  { title: "Draft", value: "draft" },
  { title: "Published", value: "published" },
  { title: "Archived", value: "archived" },
];

const scoringTypeOptions = [
  { title: "Multi-dimension", value: "multi_dimension" },
  { title: "Total score", value: "total_score" },
];

// accordion open first
const openPanel = ref<number | null>(0);

// only turns "error" after parent submits
const validationAttempted = ref(false);
const rules = {
  required: (v: any) => !!v || v === 0 || "This field is required",
  min3: (v: any) =>
    !v || String(v).trim().length >= 3 || "Minimum 3 characters",
  email: (v: any) =>
    !v ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ||
    "Invalid email address",
  int: (v: any) => Number.isInteger(Number(v)) || "Must be an integer",
  digitsOptional: (v: any) => !v || /^\d+$/.test(String(v)) || "Digits only",
  numberOptional: (v: any) =>
    v === null || v === "" || Number.isFinite(Number(v)) || "Must be a number",
  urlOptional: (v: any) => {
    if (!v) return true;
    try {
      // eslint-disable-next-line no-new
      new URL(String(v));
      return true;
    } catch {
      return "Invalid URL";
    }
  },
  requiredTruthy: (v: any) => (v === true || v === false ? true : "Required"),
};

function isFiniteNumber(v: any) {
  return typeof v === "number" && Number.isFinite(v);
}

const fixedOptionsSorted = computed(() => {
  const arr = Array.isArray(form.value.fixedOptions)
    ? form.value.fixedOptions
    : [];
  return [...arr].sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
});

const fixedOptionsIssue = computed(() => {
  if (form.value.optionsMode !== "fixed") return "";

  const opts = fixedOptionsSorted.value;
  if (opts.length < 2) return "Fixed options must have at least 2 items.";

  const orders = opts.map((o) => Number(o.sortOrder));
  const hasDupOrder = new Set(orders).size !== orders.length;
  if (hasDupOrder) return "Sort order must be unique.";

  const missingLabel = opts.some((o) => !String(o.label ?? "").trim());
  if (missingLabel) return "Each option must have a label.";

  const missingScore = opts.some((o) => !isFiniteNumber(o.scoreValue));
  if (missingScore) return "Each option must have a numeric score.";

  const badOrder = opts.some((o) => !(Number(o.sortOrder) >= 1));
  if (badOrder) return "Each option order must be at least 1.";

  return "";
});

// --- panel completeness ---
const isBasicComplete = computed(() => {
  const f = form.value;
  return (
    String(f.title ?? "").trim().length >= 3 &&
    !!String(f.language ?? "").trim() &&
    !!String(f.scoringType ?? "").trim() &&
    Number(f.version) >= 1 &&
    (f.showResultToUser === true || f.showResultToUser === false)
  );
});

const isOptionsComplete = computed(() => {
  const f = form.value;
  if (!f.optionsMode) return false;
  if (f.optionsMode === "per_question") return true;
  // fixed mode => must pass issue checks
  return fixedOptionsIssue.value === "";
});

const canSubmit = computed(
  () => isBasicComplete.value && isOptionsComplete.value,
);

// --- panel status icon logic ---
type PanelKey = "basic" | "options" | "review";
type PanelStatus = "default" | "complete" | "error";

function getPanelStatus(key: PanelKey): PanelStatus {
  const complete =
    key === "basic"
      ? isBasicComplete.value
      : key === "options"
        ? isOptionsComplete.value
        : canSubmit.value;

  if (!validationAttempted.value) return complete ? "complete" : "default";
  return complete ? "complete" : "error";
}

function panelStatusIcon(key: PanelKey) {
  const st = getPanelStatus(key);
  if (st === "complete") return "lucide:check-circle-2";
  if (st === "error") return "lucide:alert-circle";
  return "lucide:circle";
}

function panelStatusColor(key: PanelKey) {
  const st = getPanelStatus(key);
  if (st === "complete") return "success";
  if (st === "error") return "error";
  return "medium-emphasis";
}

function focusFirstInvalidPanel() {
  if (!isBasicComplete.value) openPanel.value = 0;
  else if (!isOptionsComplete.value) openPanel.value = 1;
  else if (!canSubmit.value) openPanel.value = 2;
}

// --- fixed options helpers ---
function resetFixedOptions() {
  form.value.fixedOptions = [
    { label: "Setuju", scoreValue: 2, sortOrder: 1 },
    { label: "Ragu", scoreValue: 1, sortOrder: 2 },
    { label: "Tidak setuju", scoreValue: 0, sortOrder: 3 },
  ];
}

function addFixedOption() {
  const arr = Array.isArray(form.value.fixedOptions)
    ? form.value.fixedOptions
    : [];
  const nextOrder =
    (arr.reduce((m, o) => Math.max(m, Number(o.sortOrder || 0)), 0) || 0) + 1;
  arr.push({ label: "", scoreValue: 0, sortOrder: nextOrder });
  form.value.fixedOptions = arr;
}

function removeFixedOption(sortOrder: number) {
  form.value.fixedOptions = (form.value.fixedOptions || []).filter(
    (o) => Number(o.sortOrder) !== Number(sortOrder),
  );
}

// ---- exposed API for parent submit button ----
async function validateAll() {
  validationAttempted.value = true;

  const res = await formRef.value?.validate();
  const vFormValid = !!res?.valid;

  const valid = vFormValid && canSubmit.value;
  if (!valid) focusFirstInvalidPanel();

  return { valid, vFormValid, canSubmit: canSubmit.value };
}
async function validate() {
  return await formRef.value?.validate();
}
function reset() {
  formRef.value?.reset();
}
function resetValidation() {
  // reset panel status icons (error -> default)
  validationAttempted.value = false;

  // reset Vuetify form validation messages
  formRef.value?.resetValidation();

  // optional: open first panel again
  openPanel.value = 0;
}

defineExpose({
  validateAll,
  validate,
  reset,
  resetValidation,
  focusFirstInvalidPanel,
});
</script>

<style scoped lang="scss">
// .sb-accordion :deep(.v-expansion-panel-title) {
//   padding: 14px 16px;
//   background-color: var(--color-card-bg) !important;
//   box-shadow: none !important;
//   border-width: 1px !important;
// }
.sb-accordion {
  box-shadow: none !important;
  border-width: 1px !important;
  border-color: var(--color-border) !important;
  border-style: solid;
}
</style>
