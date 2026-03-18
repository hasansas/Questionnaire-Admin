<template>
  <div class="score-bands">
    <v-card rounded="xl" variant="outlined">
      <v-card-text class="pa-4 pa-md-6">
        <div
          class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4"
        >
          <div>
            <div class="text-h6 font-weight-bold">Manage Score Bands</div>
            <div class="text-medium-emphasis text-body-2">
              Atur rentang score band dalam bentuk matrix per dimensi / total.
            </div>
          </div>

          <div class="d-flex align-center flex-wrap ga-2">
            <v-chip size="small" variant="tonal" color="primary">
              Scope: {{ currentScopeLabel }}
            </v-chip>

            <v-chip v-if="totalCount" size="small" variant="outlined">
              {{ totalCount }} cells
            </v-chip>

            <v-btn
              color="secondary"
              variant="outlined"
              rounded="lg"
              :disabled="loading"
              @click="openCreateLabelDialog"
            >
              Add Band Label
            </v-btn>

            <v-btn
              variant="outlined"
              rounded="lg"
              :loading="loading"
              @click="reload"
            >
              Reload
            </v-btn>

            <v-btn
              color="primary"
              rounded="lg"
              :loading="saving"
              :disabled="loading || !hasData"
              @click="save"
            >
              Save Changes
            </v-btn>
          </div>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
          {{ error }}
        </v-alert>

        <v-alert
          v-if="successMessage"
          type="success"
          variant="tonal"
          class="mb-4"
        >
          {{ successMessage }}
        </v-alert>

        <v-alert v-if="sourceMessage" type="info" variant="tonal" class="mb-4">
          {{ sourceMessage }}
        </v-alert>

        <div v-if="labelItems.length" class="mb-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">Band Labels</div>

          <div class="d-flex flex-wrap ga-2">
            <v-chip
              v-for="label in labelItems"
              :key="label.id"
              variant="outlined"
              size="small"
            >
              {{ label.label }} ({{ label.code }})

              <template #append>
                <div class="d-flex align-center ms-2 ga-1">
                  <v-btn
                    icon="lucide:pencil"
                    size="x-small"
                    variant="text"
                    @click.stop="openEditLabelDialog(label)"
                  />
                  <v-btn
                    icon="lucide:trash-2"
                    size="x-small"
                    variant="text"
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

        <div v-else-if="!hasData">
          <v-empty-state
            icon="lucide:table-properties"
            title="Belum ada score band"
            text="Klik reload untuk generate dan memuat score band."
          >
            <template #actions>
              <v-btn color="primary" rounded="lg" @click="reload">
                Generate Score Bands
              </v-btn>
            </template>
          </v-empty-state>
        </div>

        <div v-else class="score-band-table-wrap">
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
                  <div class="text-caption text-medium-emphasis">
                    {{ row.key }}
                  </div>
                </td>

                <td
                  v-for="column in columns"
                  :key="`${row.key}-${column.code}`"
                  class="band-cell"
                >
                  <div v-if="row.cells[column.code]" class="band-editor">
                    <div class="d-flex align-center ga-2 mb-2">
                      <v-text-field
                        v-model.number="row.cells[column.code].minScore"
                        label="Min"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        min="0"
                      />
                      <span class="text-medium-emphasis">–</span>
                      <v-text-field
                        v-model.number="row.cells[column.code].maxScore"
                        label="Max"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        min="0"
                      />
                    </div>

                    <div class="d-flex justify-space-between align-center ga-2">
                      <v-chip size="small" variant="tonal" color="primary">
                        {{
                          scoreBandsStore.getRangeText(row.cells[column.code])
                        }}
                      </v-chip>

                      <div class="text-caption text-medium-emphasis">
                        {{ row.cells[column.code].code }}
                      </div>
                    </div>
                  </div>

                  <div v-else class="text-caption text-medium-emphasis">-</div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </v-card-text>
    </v-card>

    <v-dialog v-model="createLabelDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title>Create Band Label</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="labelForm.code"
            label="Code"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="labelForm.label"
            label="Label"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model.number="labelForm.sortOrder"
            label="Sort Order"
            type="number"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="createLabelDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            :loading="labelSubmitting"
            @click="handleCreateLabel"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editLabelDialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title>Edit Band Label</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="labelForm.code"
            label="Code"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model="labelForm.label"
            label="Label"
            variant="outlined"
            class="mb-3"
          />
          <v-text-field
            v-model.number="labelForm.sortOrder"
            label="Sort Order"
            type="number"
            variant="outlined"
          />
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="editLabelDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="labelSubmitting"
            @click="handleEditLabel"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteLabelDialog" max-width="460">
      <v-card rounded="xl">
        <v-card-title>Delete Band Label</v-card-title>
        <v-card-text>
          Are you sure you want to delete
          <strong>{{ selectedLabelName }}</strong
          >? Score bands will be regenerated after deletion.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="deleteLabelDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="error"
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
import { computed, onMounted, reactive, ref, watch } from "vue";
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

const loading = ref<boolean>(false);
const saving = ref<boolean>(false);
const labelSubmitting = ref<boolean>(false);
const deletingLabel = ref<boolean>(false);

const error = ref<string>("");
const successMessage = ref<string>("");
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

function resetMessages(): void {
  error.value = "";
  successMessage.value = "";
}

function resetLabelForm(): void {
  labelForm.code = "";
  labelForm.label = "";
  labelForm.sortOrder = labelItems.value.length + 1;
}

function openCreateLabelDialog(): void {
  resetMessages();
  resetLabelForm();
  createLabelDialog.value = true;
}

function openEditLabelDialog(label: ScoreBandLabelItem): void {
  resetMessages();
  selectedLabelId.value = label.id;
  labelForm.code = label.code;
  labelForm.label = label.label;
  labelForm.sortOrder = label.sortOrder;
  editLabelDialog.value = true;
}

function openDeleteLabelDialog(label: ScoreBandLabelItem): void {
  resetMessages();
  selectedLabelId.value = label.id;
  selectedLabelName.value = label.label;
  deleteLabelDialog.value = true;
}

async function loadData(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  loading.value = true;
  error.value = "";
  successMessage.value = "";
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
    successMessage.value = `${createdCount.value} score band berhasil digenerate.`;
  }
}

async function reload(): Promise<void> {
  await loadData();
}

async function save(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  error.value = "";
  successMessage.value = "";
  saving.value = true;

  const result = await scoreBandsStore.saveScoreBands({
    questionnaireId,
    scope: scope.value,
    rows: rows.value,
    columns: columns.value,
  });

  saving.value = false;

  if (!result.success) {
    error.value = result.error;
    return;
  }

  successMessage.value = "Score band berhasil disimpan.";
}

async function handleCreateLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId) return;

  resetMessages();
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
    error.value = result.error;
    return;
  }

  createLabelDialog.value = false;
  await loadData();
  labelSubmitting.value = false;
  successMessage.value =
    "Band label berhasil dibuat dan score band disinkronkan.";
}

async function handleEditLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId || !selectedLabelId.value) return;

  resetMessages();
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
    error.value = result.error;
    return;
  }

  editLabelDialog.value = false;
  await loadData();
  labelSubmitting.value = false;
  successMessage.value = "Band label berhasil diupdate.";
}

async function handleDeleteLabel(): Promise<void> {
  const questionnaireId = props.model?.id;
  if (!questionnaireId || !selectedLabelId.value) return;

  resetMessages();
  deletingLabel.value = true;

  const result = await scoreBandsStore.deleteScoreBandLabel({
    questionnaireId,
    labelId: selectedLabelId.value,
  });

  if (!result.success) {
    deletingLabel.value = false;
    error.value = result.error;
    return;
  }

  deleteLabelDialog.value = false;
  await loadData();
  deletingLabel.value = false;
  successMessage.value =
    "Band label berhasil dihapus dan score band disinkronkan.";
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
}

.score-band-table-wrap {
  overflow-x: auto;
}

.score-band-table {
  min-width: 880px;
}

.dimension-col {
  min-width: 180px;
  white-space: nowrap;
}

.band-col {
  min-width: 220px;
  text-align: left;
}

.dimension-cell {
  vertical-align: top;
  padding-top: 16px !important;
}

.band-cell {
  vertical-align: top;
}

.band-editor {
  min-width: 200px;
}

:deep(.v-table > .v-table__wrapper > table > tbody > tr > td),
:deep(.v-table > .v-table__wrapper > table > thead > tr > th) {
  padding: 12px;
}
</style>
