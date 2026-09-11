<template>
  <div class="score-bands">
    <section class="score-bands-hero">
      <div class="min-w-0">
        <span class="score-bands-eyebrow">Result scoring</span>
        <h2 class="score-bands-title">Score Bands</h2>
        <p class="score-bands-subtitle">
          Configure score band ranges as a matrix, per dimension or total.
        </p>
        <div class="score-bands-status-row">
          <span class="score-bands-status-pill">
            {{ currentScopeLabel }} scope
          </span>
          <span v-if="totalCount" class="score-bands-status-note">
            {{ totalCount }} {{ totalCount === 1 ? "cell" : "cells" }}
          </span>
          <span
            v-if="hasInvalidRange"
            class="score-bands-status-note score-bands-status-note--error"
          >
            <v-icon icon="lucide:triangle-alert" size="12" class="me-1" />
            Invalid ranges
          </span>
        </div>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <v-btn
          variant="outlined"
          rounded="lg"
          prepend-icon="lucide:tag"
          :disabled="loading"
          @click="openCreateLabelDialog"
        >
          Add Band Label
        </v-btn>

        <v-tooltip
          :disabled="!hasInvalidRange"
          text="Fix invalid Min/Max ranges before saving"
          location="bottom"
        >
          <template #activator="{ props: tooltipProps }">
            <div v-bind="tooltipProps">
              <v-btn
                color="primary"
                rounded="lg"
                prepend-icon="lucide:save"
                :loading="saving"
                :disabled="loading || !hasData || hasInvalidRange"
                @click="save"
              >
                Save Changes
              </v-btn>
            </div>
          </template>
        </v-tooltip>
      </div>
    </section>

    <v-card rounded="xl" variant="flat" class="sb-card">
      <v-card-text class="pa-4 pa-md-6">
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          rounded="lg"
          class="mb-4"
        >
          <div class="d-flex align-center justify-space-between ga-3">
            <span>{{ error }}</span>
            <div class="d-flex align-center ga-1">
              <v-btn size="small" variant="text" color="error" @click="reload">
                Retry
              </v-btn>
              <v-btn
                icon="lucide:x"
                size="small"
                variant="text"
                color="error"
                @click="error = ''"
              />
            </div>
          </div>
        </v-alert>

        <!-- <v-alert v-if="sourceMessage" type="info" variant="tonal" class="mb-4">
          {{ sourceMessage }}
        </v-alert> -->

        <v-alert
          v-if="isPercentageMode"
          type="info"
          variant="tonal"
          rounded="lg"
          density="comfortable"
          icon="lucide:percent"
          class="mb-4"
        >
          Percentage mode: enter each band's Min/Max as a percentage
          (0–100), not a raw point score.
        </v-alert>

        <div v-if="labelItems.length" class="score-bands-labels mb-5">
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center ga-2">
              <v-icon
                icon="lucide:tags"
                size="16"
                class="text-medium-emphasis"
              />
              <span class="text-subtitle-2 font-weight-bold">
                Band Labels
              </span>
            </div>
            <span class="text-caption text-medium-emphasis">
              {{ labelItems.length }}
              {{ labelItems.length === 1 ? "label" : "labels" }}
            </span>
          </div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="label in labelItems"
              :key="label.id"
              variant="tonal"
              color="primary"
              size="small"
              class="score-bands-label-chip"
            >
              <span class="font-weight-medium">{{ label.label }}</span>
              <span class="text-medium-emphasis ms-1"
                >({{ label.code }})</span
              >

              <template #append>
                <div class="d-flex align-center ms-2 ga-1">
                  <v-btn
                    icon="lucide:pencil"
                    size="x-small"
                    variant="text"
                    density="comfortable"
                    @click.stop="openEditLabelDialog(label)"
                  />
                  <v-btn
                    icon="lucide:trash-2"
                    size="x-small"
                    variant="text"
                    density="comfortable"
                    color="error"
                    @click.stop="openDeleteLabelDialog(label)"
                  />
                </div>
              </template>
            </v-chip>
          </div>
        </div>

        <div v-if="loading">
          <v-skeleton-loader
            type="table-heading, table-thead, table-row-divider@4"
          />
        </div>

        <div v-else-if="!hasData" class="score-bands-empty">
          <v-empty-state
            icon="lucide:table-properties"
            title="No score bands yet"
            text="Click reload to generate and load score bands."
          >
            <template #actions>
              <v-btn
                color="primary"
                rounded="lg"
                prepend-icon="lucide:sparkles"
                @click="reload"
              >
                Generate Score Bands
              </v-btn>
            </template>
          </v-empty-state>
        </div>

        <div v-else class="score-band-table-card">
          <div class="score-band-table-wrap">
            <v-table class="score-band-table" density="comfortable">
              <thead>
                <tr>
                  <th class="dimension-col">Dimension</th>
                  <th
                    v-for="column in columns"
                    :key="column.code"
                    class="band-col"
                  >
                    <div class="text-subtitle-2 font-weight-bold">
                      {{ column.label }}
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="row in rows" :key="row.key">
                  <td class="dimension-cell">
                    <div class="font-weight-bold">
                      {{ row.label }}
                    </div>
                    <v-chip variant="tonal" size="small">
                      # {{ row.key }}
                    </v-chip>
                  </td>

                  <td
                    v-for="column in columns"
                    :key="`${row.key}-${column.code}`"
                    class="band-cell"
                  >
                    <div
                      v-if="row.cells[column.code]"
                      class="band-editor"
                      :class="{
                        'band-editor--invalid': isCellInvalid(
                          row.cells[column.code],
                        ),
                      }"
                    >
                      <div class="d-flex align-center ga-2 mb-1">
                        <v-text-field
                          v-model.number="row.cells[column.code].minScore"
                          label="Min"
                          type="number"
                          variant="outlined"
                          rounded="lg"
                          density="compact"
                          hide-details
                          min="0"
                          :max="scoreMax"
                          :error="isCellInvalid(row.cells[column.code])"
                        />
                        <span class="text-medium-emphasis">–</span>
                        <v-text-field
                          v-model.number="row.cells[column.code].maxScore"
                          label="Max"
                          type="number"
                          variant="outlined"
                          rounded="lg"
                          density="compact"
                          hide-details
                          min="0"
                          :max="scoreMax"
                          :error="isCellInvalid(row.cells[column.code])"
                        />
                      </div>

                      <div
                        v-if="isCellInvalid(row.cells[column.code])"
                        class="text-caption text-error mb-2 d-flex align-center ga-1"
                      >
                        <v-icon icon="lucide:triangle-alert" size="12" />
                        Min cannot exceed Max.
                      </div>

                      <div
                        class="d-flex justify-space-between align-center ga-2"
                      >
                        <v-chip size="small" variant="tonal" color="primary">
                          <span class="score-band-range-text">{{
                            scoreBandsStore.getRangeText(
                              row.cells[column.code],
                            )
                          }}</span>
                        </v-chip>

                        <div class="text-caption text-medium-emphasis">
                          {{ row.cells[column.code].code }}
                        </div>
                      </div>
                    </div>

                    <div v-else class="band-editor-empty">—</div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog
      v-model="createLabelDialog"
      max-width="520"
      :persistent="labelSubmitting"
    >
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">Create Band Label</span>
          <v-spacer />
          <v-btn
            icon="lucide:x"
            variant="text"
            :disabled="labelSubmitting"
            @click="createLabelDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <v-alert
            type="info"
            variant="tonal"
            rounded="lg"
            density="comfortable"
            icon="lucide:info"
            class="mb-4"
          >
            A band label is a score tier applied across every column in
            the matrix — e.g.
            <strong>Low</strong>, <strong>Medium</strong>,
            <strong>High</strong>.
          </v-alert>

          <div class="d-flex flex-wrap align-center ga-2 mb-4">
            <span class="text-caption text-medium-emphasis">
              Quick fill:
            </span>
            <v-chip
              v-for="preset in labelPresets"
              :key="preset.code"
              size="small"
              variant="outlined"
              color="primary"
              @click="applyLabelPreset(preset)"
            >
              {{ preset.label }}
            </v-chip>
          </div>

          <v-form ref="createLabelFormRef">
            <v-text-field
              v-model.trim="labelForm.code"
              label="Code"
              placeholder="low"
              hint="Short identifier used internally, e.g. low, medium, high"
              persistent-hint
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
              class="mb-4"
            />
            <v-text-field
              v-model.trim="labelForm.label"
              label="Label"
              placeholder="Low"
              hint="Display name shown to respondents/admins, e.g. Low, Medium, High"
              persistent-hint
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
              class="mb-4"
            />
            <v-text-field
              v-model.number="labelForm.sortOrder"
              label="Sort Order"
              hint="Controls the column's left-to-right position"
              persistent-hint
              type="number"
              variant="outlined"
              rounded="lg"
              min="1"
              :rules="[rules.positiveInt]"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="text"
            rounded="lg"
            :disabled="labelSubmitting"
            @click="createLabelDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:plus"
            :loading="labelSubmitting"
            @click="handleCreateLabel"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="editLabelDialog"
      max-width="520"
      :persistent="labelSubmitting"
    >
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">Edit Band Label</span>
          <v-spacer />
          <v-btn
            icon="lucide:x"
            variant="text"
            :disabled="labelSubmitting"
            @click="editLabelDialog = false"
          />
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <v-form ref="editLabelFormRef">
            <v-text-field
              v-model.trim="labelForm.code"
              label="Code"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
              class="mb-3"
            />
            <v-text-field
              v-model.trim="labelForm.label"
              label="Label"
              variant="outlined"
              rounded="lg"
              :rules="[rules.required]"
              class="mb-3"
            />
            <v-text-field
              v-model.number="labelForm.sortOrder"
              label="Sort Order"
              type="number"
              variant="outlined"
              rounded="lg"
              min="1"
              :rules="[rules.positiveInt]"
            />
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="text"
            rounded="lg"
            :disabled="labelSubmitting"
            @click="editLabelDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:save"
            :loading="labelSubmitting"
            @click="handleEditLabel"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog
      v-model="deleteLabelDialog"
      max-width="460"
      :persistent="deletingLabel"
    >
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="d-flex align-start ga-3">
            <v-avatar size="40" rounded="lg" color="error" variant="tonal">
              <v-icon icon="lucide:trash-2" size="20" />
            </v-avatar>
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-bold">
                Delete "{{ selectedLabelName }}"?
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Score bands will be regenerated after deletion. This cannot
                be undone.
              </div>
            </div>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn
            variant="text"
            rounded="lg"
            :disabled="deletingLabel"
            @click="deleteLabelDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            rounded="lg"
            prepend-icon="lucide:trash-2"
            :loading="deletingLabel"
            @click="handleDeleteLabel"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
import type { QuestionnaireModel } from "~/models/questionnaire";
import type {
  ScoreBandMatrixColumn,
  ScoreBandMatrixRow,
  ScoreBandScope,
} from "~/models/questionnaire-score-band";
import type { ScoreBandLabelItem } from "~/stores/questionnaire-score-bands";
import { useQuestionnaireScoreBandsStore } from "~/stores/questionnaire-score-bands";

const props = defineProps<{ model: QuestionnaireModel }>();

const scoreBandsStore = useQuestionnaireScoreBandsStore();
const snack = useAppSnackbar();

const loading = ref<boolean>(false);
const saving = ref<boolean>(false);
const labelSubmitting = ref<boolean>(false);
const deletingLabel = ref<boolean>(false);

const error = ref<string>("");
const sourceMessage = ref<string>("");
const totalCount = ref<number>(0);
const createdCount = ref<number>(0);

const scope = ref<ScoreBandScope>(
  scoreBandsStore.getDefaultScope(props.model?.scoringType),
);

const columns = ref<ScoreBandMatrixColumn[]>([]);
const rows = ref<ScoreBandMatrixRow[]>([]);

const createLabelDialog = ref<boolean>(false);
const editLabelDialog = ref<boolean>(false);
const deleteLabelDialog = ref<boolean>(false);

const createLabelFormRef = ref<any>(null);
const editLabelFormRef = ref<any>(null);

const selectedLabelId = ref<string>("");
const selectedLabelName = ref<string>("");

const labelForm = reactive<{
  code: string;
  label: string;
  sortOrder: number;
}>({
  code: "",
  label: "",
  sortOrder: 1,
});

const rules = {
  required: (v: any) => !!String(v ?? "").trim() || "This field is required",
  positiveInt: (v: any) =>
    (Number.isFinite(Number(v)) && Number(v) >= 1) ||
    "Must be at least 1",
};

const labelPresets: { code: string; label: string }[] = [
  { code: "low", label: "Low" },
  { code: "medium", label: "Medium" },
  { code: "high", label: "High" },
];

function applyLabelPreset(preset: { code: string; label: string }): void {
  labelForm.code = preset.code;
  labelForm.label = preset.label;
}

const hasData = computed<boolean>(
  () => rows.value.length > 0 && columns.value.length > 0,
);

const currentScope = computed<ScoreBandScope>(() =>
  scoreBandsStore.getDefaultScope(props.model?.scoringType),
);

const currentScopeLabel = computed<string>(() =>
  scope.value === "dimension" ? "Dimension" : "Total",
);

const labelItems = computed<ScoreBandLabelItem[]>(() =>
  scoreBandsStore.getLabelsFromColumns(columns.value),
);

const isPercentageMode = computed<boolean>(
  () => props.model?.scoringMode === "percentage",
);

const scoreMax = computed<number | undefined>(() =>
  isPercentageMode.value ? 100 : undefined,
);

function isCellInvalid(cell?: { minScore: number; maxScore: number } | null): boolean {
  if (!cell) return false;
  return Number(cell.minScore) > Number(cell.maxScore);
}

const hasInvalidRange = computed<boolean>(() =>
  rows.value.some((row) =>
    columns.value.some((column) => isCellInvalid(row.cells[column.code])),
  ),
);

function resetLabelForm(): void {
  labelForm.code = "";
  labelForm.label = "";
  labelForm.sortOrder = labelItems.value.length + 1;
}

function openCreateLabelDialog(): void {
  resetLabelForm();
  createLabelDialog.value = true;
  nextTick(() => createLabelFormRef.value?.resetValidation?.());
}

function openEditLabelDialog(label: ScoreBandLabelItem): void {
  selectedLabelId.value = label.id;
  labelForm.code = label.code;
  labelForm.label = label.label;
  labelForm.sortOrder = label.sortOrder;
  editLabelDialog.value = true;
  nextTick(() => editLabelFormRef.value?.resetValidation?.());
}

function openDeleteLabelDialog(label: ScoreBandLabelItem): void {
  selectedLabelId.value = label.id;
  selectedLabelName.value = label.label;
  deleteLabelDialog.value = true;
}

async function loadData(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  loading.value = true;
  error.value = "";
  sourceMessage.value = "";
  scope.value = currentScope.value;

  const result = await scoreBandsStore.fetchScoreBands({
    questionnaireId,
    scope: scope.value,
  });

  loading.value = false;

  if (!result.success) {
    error.value = result.error;
    return;
  }

  columns.value = result.data.columns;
  rows.value = result.data.rows;
  totalCount.value = result.data.totalCount;
  createdCount.value = result.data.createdCount;
  sourceMessage.value = result.data.sourceMessage;

  if (createdCount.value > 0) {
    snack.open(`${createdCount.value} score band(s) generated.`, {
      color: "success",
    });
  }
}

async function reload(): Promise<void> {
  await loadData();
}

async function save(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  if (hasInvalidRange.value) {
    snack.open("Fix invalid Min/Max ranges before saving.", {
      color: "error",
    });
    return;
  }

  saving.value = true;

  const result = await scoreBandsStore.saveScoreBands({
    questionnaireId,
    scope: scope.value,
    rows: rows.value,
    columns: columns.value,
  });

  saving.value = false;

  if (!result.success) {
    snack.open(result.error, { color: "error" });
    return;
  }

  snack.open("Score bands saved.", { color: "success" });
}

async function handleCreateLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  const validation = await createLabelFormRef.value?.validate?.();
  if (validation && !validation.valid) return;

  labelSubmitting.value = true;

  const result = await scoreBandsStore.createScoreBandLabel({
    questionnaireId,
    payload: {
      code: labelForm.code,
      label: labelForm.label,
      sortOrder: Number(labelForm.sortOrder || 1),
    },
  });

  if (!result.success) {
    labelSubmitting.value = false;
    snack.open(result.error, { color: "error" });
    return;
  }

  createLabelDialog.value = false;
  await loadData();
  labelSubmitting.value = false;
  snack.open("Band label created and score bands synced.", {
    color: "success",
  });
}

async function handleEditLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId || !selectedLabelId.value) return;

  const validation = await editLabelFormRef.value?.validate?.();
  if (validation && !validation.valid) return;

  labelSubmitting.value = true;

  const result = await scoreBandsStore.updateScoreBandLabel({
    questionnaireId,
    labelId: selectedLabelId.value,
    payload: {
      code: labelForm.code,
      label: labelForm.label,
      sortOrder: Number(labelForm.sortOrder || 1),
    },
  });

  if (!result.success) {
    labelSubmitting.value = false;
    snack.open(result.error, { color: "error" });
    return;
  }

  editLabelDialog.value = false;
  await loadData();
  labelSubmitting.value = false;
  snack.open("Band label updated.", { color: "success" });
}

async function handleDeleteLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId || !selectedLabelId.value) return;

  deletingLabel.value = true;

  const result = await scoreBandsStore.deleteScoreBandLabel({
    questionnaireId,
    labelId: selectedLabelId.value,
  });

  if (!result.success) {
    deletingLabel.value = false;
    snack.open(result.error, { color: "error" });
    return;
  }

  deleteLabelDialog.value = false;
  await loadData();
  deletingLabel.value = false;
  snack.open("Band label deleted and score bands synced.", {
    color: "success",
  });
}

onMounted(async (): Promise<void> => {
  await loadData();
});

watch(
  () => [props.model?.id, props.model?.scoringType],
  async ([newId], [oldId]): Promise<void> => {
    if (!newId) return;

    if (newId !== oldId || scope.value !== currentScope.value) {
      await loadData();
    }
  },
);
</script>

<style scoped lang="scss">
.score-bands {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ---- Hero header (matches Questions.vue tab styling) ---- */
.score-bands-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background:
    radial-gradient(
      circle at top left,
      rgba(var(--v-theme-primary), 0.14),
      transparent 34%
    ),
    linear-gradient(135deg, #ffffff, #f8fbff 52%, #f4f7fb);
}

.score-bands-eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.score-bands-title {
  margin: 10px 0 0;
  font-size: 1.75rem;
  font-weight: 800;
  color: #0f172a;
}

.score-bands-subtitle {
  max-width: 640px;
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.score-bands-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.score-bands-status-pill,
.score-bands-status-note {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.score-bands-status-pill {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  letter-spacing: 0.04em;
  text-transform: capitalize;
}

.score-bands-status-note {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

.score-bands-status-note--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.08);
}

/* ---- Band labels ---- */
.score-bands-labels {
  padding: 16px;
  border: 1px solid var(--sb-border-soft);
  border-radius: 16px;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.score-bands-label-chip :deep(.v-chip__append) {
  margin-inline-start: 4px;
}

/* ---- Empty state ---- */
.score-bands-empty {
  padding: 24px 0;
}

/* ---- Matrix table ---- */
.score-band-table-card {
  border: 1px solid var(--sb-border-soft);
  border-radius: 16px;
  overflow: hidden;
}

.score-band-table-wrap {
  overflow-x: auto;
}

.score-band-table {
  min-width: 880px;
}

.dimension-col {
  position: sticky;
  left: 0;
  z-index: 2;
  min-width: 180px;
  white-space: nowrap;
  background: rgba(var(--v-theme-primary), 0.04);
  box-shadow: 1px 0 0 var(--sb-border-soft);
}

.band-col {
  min-width: 220px;
  text-align: left;
}

.dimension-cell {
  position: sticky;
  left: 0;
  z-index: 1;
  vertical-align: top;
  padding-top: 16px !important;
  background: var(--sb-surface);
  box-shadow: 1px 0 0 var(--sb-border-soft);
}

.band-cell {
  vertical-align: top;
}

.band-editor {
  min-width: 200px;
  padding: 12px;
  border: 1px solid var(--sb-border-soft);
  border-radius: 12px;
  background: var(--sb-surface);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.band-editor:focus-within {
  border-color: rgba(var(--v-theme-primary), 0.4);
  box-shadow: 0 0 0 3px rgba(var(--v-theme-primary), 0.08);
}

.band-editor--invalid {
  border-color: rgba(var(--v-theme-error), 0.4);
  background: rgba(var(--v-theme-error), 0.03);
}

.band-editor-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.score-band-range-text {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  padding: 12px;
}

:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  background: rgba(var(--v-theme-primary), 0.04);
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

@media (max-width: 960px) {
  .score-bands-hero {
    padding: 24px;
    align-items: flex-start;
  }
}
</style>
