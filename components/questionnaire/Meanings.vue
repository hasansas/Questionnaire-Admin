<template>
  <div class="d-flex flex-column ga-4">
    <v-card rounded="lg" variant="outlined">
      <v-card-text class="d-flex flex-wrap align-center ga-3">
        <div>
          <div class="text-h6 font-weight-bold">Meaning Management</div>
          <div class="text-medium-emphasis text-body-2">
            Manage result mappings for questionnaire scoring output.
          </div>
        </div>

        <v-spacer />

        <v-chip size="small" variant="tonal">
          Scoring: {{ props.model.scoringType || "-" }}
        </v-chip>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          :loading="initAddDialogLoading"
          @click="openAddDialog"
        >
          Add Meanings
        </v-btn>

        <v-btn
          rounded="lg"
          variant="outlined"
          prepend-icon="lucide:refresh-cw"
          :loading="tableLoading"
          @click="loadMeanings"
        >
          Refresh
        </v-btn>
      </v-card-text>
    </v-card>

    <v-alert
      v-if="pageError"
      type="error"
      variant="tonal"
      rounded="lg"
      closable
      @click:close="pageError = null"
    >
      {{ pageError }}
    </v-alert>

    <v-card rounded="lg" variant="outlined">
      <v-data-table
        :headers="headers"
        :items="store.meanings"
        :loading="tableLoading"
        item-value="id"
      >
        <template #item.ruleType="{ item }">
          <v-chip size="small" variant="tonal">
            {{ item.ruleType }}
          </v-chip>
        </template>

        <template #item.ruleKey="{ item }">
          <div class="text-body-2">{{ item.ruleKey }}</div>
        </template>

        <template #item.result="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{
              item.resultLabel || "-"
            }}</span>
            <span class="text-caption text-medium-emphasis">
              {{ item.resultCode || "-" }}
            </span>
          </div>
        </template>

        <template #item.flags="{ item }">
          <div class="d-flex flex-wrap ga-1">
            <v-chip
              v-if="item.isDefault"
              size="x-small"
              color="primary"
              variant="tonal"
            >
              Default
            </v-chip>
            <v-chip
              size="x-small"
              :color="item.isActive ? 'success' : 'grey'"
              variant="tonal"
            >
              {{ item.isActive ? "Active" : "Inactive" }}
            </v-chip>
          </div>
        </template>

        <template #item.recommendations="{ item }">
          <span>{{ item.recommendations?.length || 0 }}</span>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex ga-2 justify-end">
            <v-btn
              size="small"
              variant="text"
              icon="lucide:pencil"
              :loading="editActionLoadingId === item.id"
              @click="openEditDialog(item)"
            />
            <v-btn
              size="small"
              variant="text"
              color="error"
              icon="lucide:trash-2"
              :loading="deleteLoadingId === item.id"
              @click="handleDelete(item)"
            />
          </div>
        </template>

        <template #bottom>
          <div class="px-4 py-3 text-body-2 text-medium-emphasis">
            Total meanings: {{ store.totalMeanings }}
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add meanings dialog -->
    <v-dialog v-model="addDialog" max-width="1100">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">Add Meanings</span>
          <v-spacer />
          <v-btn icon="lucide:x" variant="text" @click="addDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="d-flex flex-column ga-4">
          <v-alert
            v-if="addDialogError"
            type="error"
            variant="tonal"
            rounded="lg"
            closable
            @click:close="addDialogError = null"
          >
            {{ addDialogError }}
          </v-alert>

          <div class="d-flex flex-wrap ga-3">
            <v-select
              v-model="selectedRuleType"
              :items="ruleTypeItems"
              item-title="title"
              item-value="value"
              label="Rule Type"
              density="comfortable"
              variant="outlined"
              hide-details
              style="max-width: 280px"
              @update:model-value="handleRuleTypeChange"
            />

            <v-switch
              v-model="onlyUnused"
              label="Only unused"
              color="primary"
              hide-details
              inset
              @update:model-value="reloadPossibleMaps"
            />

            <v-btn
              variant="outlined"
              prepend-icon="lucide:refresh-cw"
              :loading="possibleLoading"
              @click="reloadPossibleMaps"
            >
              Refresh Options
            </v-btn>

            <v-spacer />

            <v-btn variant="text" @click="toggleSelectAll">
              {{ allSelectableChecked ? "Unselect All" : "Select All" }}
            </v-btn>
          </div>

          <div class="text-body-2 text-medium-emphasis">
            Existing meanings are disabled and cannot be selected again.
          </div>

          <v-table density="comfortable">
            <thead>
              <tr>
                <th style="width: 56px">
                  <v-checkbox
                    :model-value="allSelectableChecked"
                    :indeterminate="
                      someSelectableChecked && !allSelectableChecked
                    "
                    hide-details
                    color="primary"
                    @update:model-value="toggleSelectAll"
                  />
                </th>
                <th>Rule</th>
                <th>Result Code</th>
                <th>Result Label</th>
                <th>Priority</th>
                <th>Used</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in possibleItems" :key="item.ruleKey">
                <td>
                  <v-checkbox
                    :model-value="selectedRuleKeys.includes(item.ruleKey)"
                    :disabled="item.isUsed"
                    hide-details
                    color="primary"
                    @update:model-value="toggleSelectedRuleKey(item.ruleKey)"
                  />
                </td>
                <td>
                  <div class="font-weight-medium">{{ item.displayLabel }}</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ item.ruleKey }}
                  </div>
                </td>
                <td>{{ item.resultCode || "-" }}</td>
                <td>{{ item.resultLabel || "-" }}</td>
                <td>{{ item.priority }}</td>
                <td>
                  <v-chip
                    size="x-small"
                    :color="item.isUsed ? 'grey' : 'success'"
                    variant="tonal"
                  >
                    {{ item.isUsed ? "Existing" : "New" }}
                  </v-chip>
                </td>
              </tr>

              <tr v-if="!possibleLoading && !possibleItems.length">
                <td colspan="6" class="text-center py-6 text-medium-emphasis">
                  No possible meanings found.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <div class="text-body-2 text-medium-emphasis">
            Selected: {{ selectedCreatableItems.length }}
          </div>

          <v-spacer />

          <v-btn variant="text" @click="addDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:save"
            :disabled="!selectedCreatableItems.length"
            :loading="bulkCreateLoading"
            @click="handleBulkCreate"
          >
            Create Selected
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit meaning dialog -->
    <v-dialog v-model="editDialog" max-width="900">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <span class="text-h6">Edit Meaning</span>
          <v-spacer />
          <v-btn icon="lucide:x" variant="text" @click="editDialog = false" />
        </v-card-title>

        <v-divider />

        <v-card-text class="d-flex flex-column ga-4">
          <v-alert
            v-if="editDialogError"
            type="error"
            variant="tonal"
            rounded="lg"
            closable
            @click:close="editDialogError = null"
          >
            {{ editDialogError }}
          </v-alert>

          <v-card rounded="lg" variant="outlined">
            <v-card-text class="d-flex flex-column ga-3">
              <div class="d-flex flex-wrap ga-2">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ formatRuleTypeLabel(editForm.ruleType) }}
                </v-chip>

                <v-chip
                  size="small"
                  :color="editForm.isActive ? 'success' : 'grey'"
                  variant="tonal"
                >
                  {{ editForm.isActive ? "Active" : "Inactive" }}
                </v-chip>

                <v-chip
                  v-if="editForm.isDefault"
                  size="small"
                  color="primary"
                  variant="tonal"
                >
                  Default
                </v-chip>
              </div>

              <v-divider />

              <div class="d-flex flex-wrap ga-6">
                <div>
                  <div class="text-caption text-medium-emphasis mb-1">
                    Result Code
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ editForm.resultCode || "-" }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis mb-1">
                    Result Label
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ editForm.resultLabel || "-" }}
                  </div>
                </div>

                <div>
                  <div class="text-caption text-medium-emphasis mb-1">
                    Priority
                  </div>
                  <div class="text-body-2 font-weight-medium">
                    {{ editForm.priority }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-textarea
            v-model="editForm.description"
            label="Description"
            variant="outlined"
            rows="5"
          />

          <div class="d-flex flex-column ga-2">
            <div class="text-subtitle-2 font-weight-medium">
              Recommendations
            </div>

            <div
              v-for="(item, index) in editForm.recommendations"
              :key="`rec-${index}`"
              class="d-flex ga-2"
            >
              <v-text-field
                v-model="editForm.recommendations[index]"
                :label="`Recommendation ${index + 1}`"
                variant="outlined"
                density="comfortable"
                hide-details
              />
              <v-btn
                icon="lucide:trash-2"
                color="error"
                variant="text"
                @click="removeRecommendation(index)"
              />
            </div>

            <div>
              <v-btn
                variant="outlined"
                prepend-icon="lucide:plus"
                @click="addRecommendation"
              >
                Add Recommendation
              </v-btn>
            </div>
          </div>

          <div class="d-flex flex-wrap ga-3">
            <v-text-field
              v-model.number="editForm.priority"
              type="number"
              label="Priority"
              variant="outlined"
              density="comfortable"
            />

            <v-switch
              v-model="editForm.isDefault"
              label="Default"
              color="primary"
              inset
              hide-details
            />

            <v-switch
              v-model="editForm.isActive"
              label="Active"
              color="primary"
              inset
              hide-details
            />
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:save"
            :loading="saveEditLoading"
            @click="handleSaveEdit"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import type { QuestionnaireModel } from "~/models/questionnaire";
import {
  createDefaultQuestionnaireMeaning,
  type MeaningRuleType,
  type QuestionnaireMeaningBulkCreateItemModel,
  type QuestionnaireMeaningModel,
  type QuestionnaireMeaningPayload,
} from "~/models/questionnaire-meaning.model";
import type { QuestionnaireMeaningMapOptionModel } from "~/models/questionnaire-meaning-map-option.model";
import { useQuestionnaireMeaningsStore } from "~/stores/questionnaire-meanings.store";

const props = defineProps<{ model: QuestionnaireModel }>();

const store = useQuestionnaireMeaningsStore(props.model.id);

/* ------------------------------
 * local state
 * ------------------------------ */
const tableLoading = ref<boolean>(false);
const pageError = ref<string | null>(null);

const addDialog = ref<boolean>(false);
const initAddDialogLoading = ref<boolean>(false);
const possibleLoading = ref<boolean>(false);
const bulkCreateLoading = ref<boolean>(false);
const addDialogError = ref<string | null>(null);

const editDialog = ref<boolean>(false);
const saveEditLoading = ref<boolean>(false);
const editActionLoadingId = ref<string | null>(null);
const deleteLoadingId = ref<string | null>(null);
const editDialogError = ref<string | null>(null);

const onlyUnused = ref<boolean>(true);
const selectedRuleType = ref<MeaningRuleType>("fallback");
const selectedRuleKeys = ref<string[]>([]);

/* ------------------------------
 * table
 * ------------------------------ */
const headers = [
  { title: "Rule Type", key: "ruleType", sortable: false },
  { title: "Rule Key", key: "ruleKey", sortable: false },
  { title: "Result", key: "result", sortable: false },
  { title: "Priority", key: "priority", sortable: true },
  { title: "Recommendations", key: "recommendations", sortable: false },
  { title: "Flags", key: "flags", sortable: false },
  { title: "Actions", key: "actions", sortable: false, align: "end" as const },
];

/* ------------------------------
 * edit form
 * ------------------------------ */
const editForm = reactive<{
  id: string;
  ruleType: MeaningRuleType;
  ruleKey: string;
  ruleJson: Record<string, any>;
  resultCode: string;
  resultLabel: string;
  description: string;
  recommendations: string[];
  priority: number;
  isDefault: boolean;
  isActive: boolean;
}>({
  id: "",
  ruleType: "fallback",
  ruleKey: "",
  ruleJson: {},
  resultCode: "",
  resultLabel: "",
  description: "",
  recommendations: [],
  priority: 999,
  isDefault: false,
  isActive: true,
});

/* ------------------------------
 * computed
 * ------------------------------ */
const scoringType = computed<string>(() =>
  String(props.model.scoringType || ""),
);

const allowedRuleTypes = computed<MeaningRuleType[]>(() => {
  if (scoringType.value === "multi_dimension") {
    return ["score_band_combo", "dominant_dimension", "fallback"];
  }

  if (scoringType.value === "total_score") {
    return ["score_band", "fallback"];
  }

  return ["fallback"];
});

const ruleTypeItems = computed<{ title: string; value: MeaningRuleType }[]>(
  () => {
    return allowedRuleTypes.value.map((item: MeaningRuleType) => ({
      title: formatRuleTypeLabel(item),
      value: item,
    }));
  },
);

const possibleItems = computed<QuestionnaireMeaningMapOptionModel[]>(() => {
  return store.possibleMaps?.items ?? [];
});

const selectableItems = computed<QuestionnaireMeaningMapOptionModel[]>(() => {
  return possibleItems.value.filter(
    (item: QuestionnaireMeaningMapOptionModel) => !item.isUsed,
  );
});

const allSelectableChecked = computed<boolean>(() => {
  if (!selectableItems.value.length) return false;
  return selectableItems.value.every(
    (item: QuestionnaireMeaningMapOptionModel) =>
      selectedRuleKeys.value.includes(item.ruleKey),
  );
});

const someSelectableChecked = computed<boolean>(() => {
  return selectableItems.value.some(
    (item: QuestionnaireMeaningMapOptionModel) =>
      selectedRuleKeys.value.includes(item.ruleKey),
  );
});

const selectedCreatableItems = computed<QuestionnaireMeaningMapOptionModel[]>(
  () => {
    return possibleItems.value.filter(
      (item: QuestionnaireMeaningMapOptionModel) =>
        !item.isUsed && selectedRuleKeys.value.includes(item.ruleKey),
    );
  },
);

const formattedRuleJson = computed<string>(() => {
  return JSON.stringify(editForm.ruleJson ?? {}, null, 2);
});

/* ------------------------------
 * helpers
 * ------------------------------ */
function formatRuleTypeLabel(ruleType: MeaningRuleType): string {
  if (ruleType === "score_band_combo") return "Score Band Combo";
  if (ruleType === "score_band") return "Score Band";
  if (ruleType === "dominant_dimension") return "Dominant Dimension";
  return "Fallback";
}

function getDefaultRuleType(): MeaningRuleType {
  if (scoringType.value === "total_score") return "score_band";
  if (scoringType.value === "multi_dimension") return "score_band_combo";
  return "fallback";
}

function resetEditForm(): void {
  const base = createDefaultQuestionnaireMeaning();

  editForm.id = base.id;
  editForm.ruleType = base.ruleType;
  editForm.ruleKey = base.ruleKey;
  editForm.ruleJson = {};
  editForm.resultCode = base.resultCode;
  editForm.resultLabel = base.resultLabel;
  editForm.description = base.description;
  editForm.recommendations = [];
  editForm.priority = base.priority;
  editForm.isDefault = base.isDefault;
  editForm.isActive = base.isActive;
}

function fillEditForm(item: QuestionnaireMeaningModel): void {
  editForm.id = item.id;
  editForm.ruleType = item.ruleType;
  editForm.ruleKey = item.ruleKey;
  editForm.ruleJson = item.ruleJson || {};
  editForm.resultCode = item.resultCode || "";
  editForm.resultLabel = item.resultLabel || "";
  editForm.description = item.description || "";
  editForm.recommendations = Array.isArray(item.recommendations)
    ? [...item.recommendations]
    : [];
  editForm.priority = Number(item.priority || 0);
  editForm.isDefault = Boolean(item.isDefault);
  editForm.isActive = Boolean(item.isActive);
}

function buildBulkCreateItems(): QuestionnaireMeaningBulkCreateItemModel[] {
  return selectedCreatableItems.value.map(
    (
      item: QuestionnaireMeaningMapOptionModel,
    ): QuestionnaireMeaningBulkCreateItemModel => ({
      ruleType: item.ruleType,
      ruleKey: item.ruleKey,
      ruleJson: item.ruleJson,
      resultCode: item.resultCode || "",
      resultLabel: item.resultLabel || "",
      priority: item.priority,
    }),
  );
}

function buildEditPayload(): QuestionnaireMeaningPayload {
  return {
    ruleType: editForm.ruleType,
    ruleJson: editForm.ruleJson || {},
    resultCode: String(editForm.resultCode || "").trim(),
    resultLabel: String(editForm.resultLabel || "").trim(),
    description: String(editForm.description || "").trim(),
    recommendations: editForm.recommendations
      .map((item: string) => String(item || "").trim())
      .filter((item: string) => !!item),
    priority: Number(editForm.priority || 0),
    isDefault: Boolean(editForm.isDefault),
    isActive: Boolean(editForm.isActive),
  };
}

/* ------------------------------
 * actions
 * ------------------------------ */
async function loadMeanings(): Promise<void> {
  tableLoading.value = true;
  pageError.value = null;

  try {
    await store.fetchMeanings();
  } catch (error: any) {
    pageError.value = error?.message || "Failed to load meanings.";
  } finally {
    tableLoading.value = false;
  }
}

async function reloadPossibleMaps(): Promise<void> {
  possibleLoading.value = true;
  addDialogError.value = null;
  selectedRuleKeys.value = [];

  try {
    await store.fetchPossibleMeaningMaps(
      selectedRuleType.value,
      onlyUnused.value,
    );
  } catch (error: any) {
    addDialogError.value =
      error?.message || "Failed to load possible meanings.";
  } finally {
    possibleLoading.value = false;
  }
}

async function openAddDialog(): Promise<void> {
  initAddDialogLoading.value = true;
  addDialogError.value = null;
  selectedRuleKeys.value = [];

  try {
    selectedRuleType.value = getDefaultRuleType();
    await reloadPossibleMaps();
    addDialog.value = true;
  } catch (error: any) {
    pageError.value = error?.message || "Failed to open add meanings dialog.";
  } finally {
    initAddDialogLoading.value = false;
  }
}

function handleRuleTypeChange(): void {
  reloadPossibleMaps();
}

function toggleSelectedRuleKey(ruleKey: string): void {
  if (selectedRuleKeys.value.includes(ruleKey)) {
    selectedRuleKeys.value = selectedRuleKeys.value.filter(
      (item: string) => item !== ruleKey,
    );
    return;
  }

  selectedRuleKeys.value = [...selectedRuleKeys.value, ruleKey];
}

function toggleSelectAll(): void {
  if (allSelectableChecked.value) {
    selectedRuleKeys.value = [];
    return;
  }

  selectedRuleKeys.value = selectableItems.value.map(
    (item: QuestionnaireMeaningMapOptionModel) => item.ruleKey,
  );
}

async function handleBulkCreate(): Promise<void> {
  bulkCreateLoading.value = true;
  addDialogError.value = null;

  try {
    const items = buildBulkCreateItems();

    if (!items.length) {
      throw new Error("Please select at least one meaning.");
    }

    await store.bulkCreateFromMaps(items);
    addDialog.value = false;
    await loadMeanings();
  } catch (error: any) {
    addDialogError.value = error?.message || "Failed to create meanings.";
  } finally {
    bulkCreateLoading.value = false;
  }
}

async function openEditDialog(item: QuestionnaireMeaningModel): Promise<void> {
  editActionLoadingId.value = item.id;
  editDialogError.value = null;

  try {
    resetEditForm();
    fillEditForm(item);
    editDialog.value = true;
  } finally {
    editActionLoadingId.value = null;
  }
}

function addRecommendation(): void {
  editForm.recommendations = [...editForm.recommendations, ""];
}

function removeRecommendation(index: number): void {
  editForm.recommendations = editForm.recommendations.filter(
    (_: string, idx: number) => idx !== index,
  );
}

async function handleSaveEdit(): Promise<void> {
  saveEditLoading.value = true;
  editDialogError.value = null;

  try {
    if (!editForm.id) {
      throw new Error("Meaning id is required.");
    }

    const payload = buildEditPayload();

    if (!payload.resultCode) {
      throw new Error("Result code is required.");
    }

    if (!payload.resultLabel) {
      throw new Error("Result label is required.");
    }

    await store.updateMeaning(editForm.id, payload);
    editDialog.value = false;
    await loadMeanings();
  } catch (error: any) {
    editDialogError.value = error?.message || "Failed to update meaning.";
  } finally {
    saveEditLoading.value = false;
  }
}

async function handleDelete(item: QuestionnaireMeaningModel): Promise<void> {
  const confirmed = window.confirm(
    `Delete meaning "${item.resultLabel || item.ruleKey}"?`,
  );

  if (!confirmed) return;

  deleteLoadingId.value = item.id;
  pageError.value = null;

  try {
    await store.deleteMeaning(item.id);
  } catch (error: any) {
    pageError.value = error?.message || "Failed to delete meaning.";
  } finally {
    deleteLoadingId.value = null;
  }
}

/* ------------------------------
 * init
 * ------------------------------ */
onMounted(async (): Promise<void> => {
  selectedRuleType.value = getDefaultRuleType();
  await loadMeanings();
});
</script>
