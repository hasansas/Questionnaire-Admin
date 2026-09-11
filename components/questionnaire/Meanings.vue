<template>
  <div class="d-flex flex-column ga-4">
    <section class="meanings-hero">
      <div class="min-w-0">
        <span class="meanings-eyebrow">Result meanings</span>
        <h2 class="meanings-title">Meanings</h2>
        <p class="meanings-subtitle">
          Manage result mappings for questionnaire scoring output.
        </p>
        <div class="meanings-status-row">
          <span class="meanings-status-pill">
            {{
              scoringType === "multi_dimension"
                ? "Multi-dimension"
                : "Total score"
            }}
          </span>
          <span class="meanings-status-note">
            {{ store.totalMeanings }}
            {{ store.totalMeanings === 1 ? "meaning" : "meanings" }}
          </span>
        </div>
      </div>

      <div class="d-flex align-center flex-wrap ga-2">
        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          :loading="initAddDialogLoading"
          @click="openAddDialog"
        >
          Add Meanings
        </v-btn>
      </div>
    </section>

    <!-- @vue-generic {import('~/models/questionnaire-meaning.model').QuestionnaireMeaningModel} -->
    <SbResourceTableCard
      ref="tableRef"
      :show-header="false"
      page-title="Meanings"
      :store="store"
      :columns="columns"
      search-placeholder="Search rule key, result code/label"
      :show-filter="false"
      empty-icon="lucide:list-checks"
      empty-title="No meanings found"
      empty-subtitle="Add meanings to interpret questionnaire results."
      empty-primary-text="Add Meanings"
      :build-query="buildQuery"
      :delete-action="handleDelete"
      delete-title="Delete meaning?"
      delete-label="resultLabel"
      delete-label-key="ruleKey"
      @edit="openEditDialog"
      @empty:primary="openAddDialog"
    >
      <template #item.ruleType="{ item }">
        <v-chip
          size="small"
          variant="tonal"
          :color="ruleTypeColor(item.ruleType)"
        >
          {{ formatRuleTypeLabel(item.ruleType) }}
        </v-chip>
      </template>

      <template #item.ruleKey="{ item }">
        <code class="meanings-rule-key">{{ item.ruleKey }}</code>
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

      <template #item.priority="{ item }">
        <v-chip size="small" variant="tonal" class="meanings-priority-chip">
          {{ item.priority }}
        </v-chip>
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
        <v-chip
          size="small"
          variant="tonal"
          :color="item.recommendations?.length ? undefined : 'grey'"
        >
          <v-icon icon="lucide:list-checks" size="12" class="me-1" />
          {{ item.recommendations?.length || 0 }}
        </v-chip>
      </template>

      <template #actions="{ item }">
        <div class="d-flex ga-1 justify-end">
          <v-tooltip text="Edit" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                size="small"
                variant="text"
                icon="lucide:pencil"
                :loading="editActionLoadingId === item.id"
                @click.stop="openEditDialog(item)"
              />
            </template>
          </v-tooltip>
          <v-tooltip text="Delete" location="bottom">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                size="small"
                variant="text"
                color="error"
                icon="lucide:trash-2"
                @click.stop="tableRef?.openDeleteDialog(item)"
              />
            </template>
          </v-tooltip>
        </div>
      </template>
    </SbResourceTableCard>

    <!-- Add meanings dialog -->
    <v-dialog v-model="addDialog" max-width="1100">
      <v-card rounded="xl" class="meanings-add-dialog-card">
        <v-toolbar color="transparent" density="comfortable" class="px-2">
          <v-toolbar-title class="text-h6 font-weight-bold">
            Add Meanings
          </v-toolbar-title>
          <v-spacer />
          <v-btn icon="lucide:x" variant="text" @click="addDialog = false" />
        </v-toolbar>

        <v-divider />

        <v-card-text class="meanings-add-dialog-body d-flex flex-column ga-4">
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

          <div class="meanings-mode-toggle">
            <v-btn
              v-for="mode in addModeOptions"
              :key="mode.value"
              :color="addMode === mode.value ? 'primary' : undefined"
              :variant="addMode === mode.value ? 'flat' : 'text'"
              density="comfortable"
              class="meanings-mode-toggle__btn"
              :prepend-icon="mode.icon"
              @click="addMode = mode.value"
            >
              {{ mode.label }}
            </v-btn>
          </div>

          <div class="meanings-toolbar d-flex flex-wrap align-center ga-3">
            <v-select
              v-model="selectedRuleType"
              :items="ruleTypeItems"
              item-title="title"
              item-value="value"
              label="Rule Type"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details
              style="max-width: 280px"
              @update:model-value="handleRuleTypeChange"
            >
              <template #item="{ item, props: itemProps }">
                <v-list-item v-bind="itemProps">
                  <template #append>
                    <v-icon
                      v-if="!ruleTypeCompletionLoading"
                      :icon="
                        isRuleTypeComplete(item.value)
                          ? 'lucide:check-circle-2'
                          : 'lucide:circle-dashed'
                      "
                      :color="isRuleTypeComplete(item.value) ? 'success' : undefined"
                      size="16"
                    />
                  </template>
                </v-list-item>
              </template>

              <template #selection="{ item }">
                <div class="d-flex align-center ga-2">
                  <span>{{ item.title }}</span>
                  <v-icon
                    v-if="!ruleTypeCompletionLoading && isRuleTypeComplete(item.value)"
                    icon="lucide:check-circle-2"
                    color="success"
                    size="14"
                  />
                </div>
              </template>
            </v-select>

            <v-switch
              v-if="addMode === 'manual'"
              v-model="onlyUnused"
              label="Only unused"
              color="primary"
              hide-details
              inset
              @update:model-value="reloadPossibleMaps"
            />

            <v-spacer />

            <v-btn
              v-if="addMode === 'manual'"
              variant="outlined"
              rounded="lg"
              prepend-icon="lucide:refresh-cw"
              :loading="possibleLoading"
              @click="reloadPossibleMaps"
            >
              Refresh Options
            </v-btn>

            <v-btn
              v-else
              color="primary"
              rounded="lg"
              prepend-icon="lucide:sparkles"
              :loading="generatingPrompt"
              :disabled="!possibleItems.length"
              @click="handleGeneratePrompt"
            >
              Generate Prompt
            </v-btn>
          </div>

          <!-- Manual mode -->
          <template v-if="addMode === 'manual'">
            <div
              class="d-flex align-center ga-2 text-body-2 text-medium-emphasis"
            >
              <v-icon icon="lucide:info" size="16" />
              Existing meanings are disabled and cannot be selected again.
            </div>

            <v-table density="comfortable" class="meanings-picker-table">
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
                <tr
                  v-for="item in possibleItems"
                  :key="item.ruleKey"
                  :class="{ 'meanings-row--disabled': item.isUsed }"
                >
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
                    <div class="font-weight-medium">
                      {{ item.displayLabel }}
                    </div>
                    <code class="meanings-rule-key">{{ item.ruleKey }}</code>
                  </td>
                  <td>{{ item.resultCode || "-" }}</td>
                  <td>{{ item.resultLabel || "-" }}</td>
                  <td>
                    <v-chip size="small" variant="tonal">
                      {{ item.priority }}
                    </v-chip>
                  </td>
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
                  <td colspan="6" class="text-center py-10">
                    <v-icon
                      icon="lucide:search-x"
                      size="28"
                      class="text-medium-emphasis mb-2"
                    />
                    <div class="text-body-2 text-medium-emphasis">
                      No possible meanings found.
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </template>

          <!-- Generate with AI mode -->
          <template v-else>
            <div v-if="generatedPrompt" class="d-flex flex-column ga-2">
              <div class="d-flex align-center justify-space-between">
                <span class="text-subtitle-2 font-weight-medium">
                  1. Copy this prompt and run it in your AI tool of choice
                </span>
                <v-btn
                  size="small"
                  variant="text"
                  prepend-icon="lucide:copy"
                  @click="copyGeneratedPrompt"
                >
                  Copy
                </v-btn>
              </div>
              <v-textarea
                v-model="generatedPrompt"
                readonly
                variant="outlined"
                rounded="lg"
                density="comfortable"
                rows="8"
                auto-grow
                class="meanings-prompt-textarea"
              />
            </div>

            <v-empty-state
              v-else
              icon="lucide:sparkles"
              title="Generate a prompt"
              text="Pick a rule type above, then click Generate Prompt to build a ready-to-copy AI prompt for the missing meanings."
            />

            <template v-if="generatedPrompt">
              <v-divider />

              <div class="d-flex flex-column ga-2">
                <span class="text-subtitle-2 font-weight-medium">
                  2. Paste the AI's JSON response
                </span>
                <v-textarea
                  v-model="aiJsonInput"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  rows="6"
                  auto-grow
                  class="meanings-json-textarea"
                  placeholder='[{"ruleKey": "...", "resultCode": "...", "resultLabel": "...", "description": "...", "recommendations": ["..."]}]'
                  :disabled="aiJsonLocked"
                  :error="!!aiParseError"
                  :error-messages="aiParseError"
                />
                <div>
                  <v-btn
                    :variant="aiJsonLocked ? 'flat' : 'outlined'"
                    :color="aiJsonLocked ? 'primary' : undefined"
                    rounded="lg"
                    :prepend-icon="aiJsonLocked ? 'lucide:pencil' : 'lucide:eye'"
                    :loading="previewLoading"
                    :disabled="!aiJsonLocked && !aiJsonInput.trim()"
                    @click="handlePreviewAiJson"
                  >
                    {{ aiJsonLocked ? "Update JSON Response" : "Preview" }}
                  </v-btn>
                </div>
              </div>
            </template>

            <template v-if="aiPreviewRows.length && !previewLoading">
              <v-divider />

              <div class="d-flex align-center justify-space-between">
                <span class="text-subtitle-2 font-weight-medium">
                  3. Review and edit before importing
                </span>
                <div class="d-flex align-center ga-2">
                  <v-chip size="small" variant="tonal" color="success">
                    {{ validAiRowsCount }} valid
                  </v-chip>
                  <v-chip
                    v-if="aiPreviewRows.length > validAiRowsCount"
                    size="small"
                    variant="tonal"
                    color="error"
                  >
                    {{ aiPreviewRows.length - validAiRowsCount }} invalid
                  </v-chip>
                </div>
              </div>

              <div class="d-flex flex-column ga-3">
                <v-card
                  v-for="(row, index) in aiPreviewRows"
                  :key="`${row.ruleKey}-${index}`"
                  rounded="lg"
                  variant="outlined"
                  class="pa-3"
                  :class="{
                    'meanings-ai-row--invalid': getRowErrors(row).length,
                  }"
                >
                  <div class="d-flex align-start justify-space-between ga-2">
                    <div class="min-w-0">
                      <div class="d-flex align-center ga-2">
                        <v-icon
                          :icon="
                            getRowErrors(row).length
                              ? 'lucide:alert-circle'
                              : 'lucide:check-circle-2'
                          "
                          :color="
                            getRowErrors(row).length ? 'error' : 'success'
                          "
                          size="16"
                        />
                        <span class="font-weight-medium">
                          {{ row.displayLabel || row.ruleKey || "—" }}
                        </span>
                      </div>
                      <code class="meanings-rule-key">
                        {{ row.ruleKey || "(missing ruleKey)" }}
                      </code>
                      <div
                        v-if="getRowErrors(row).length"
                        class="text-caption text-error mt-1"
                      >
                        {{ getRowErrors(row).join(" · ") }}
                      </div>
                    </div>
                    <v-btn
                      icon="lucide:trash-2"
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeAiPreviewRow(index)"
                    />
                  </div>

                  <v-row dense class="mt-2">
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.trim="row.resultCode"
                        label="Result Code"
                        variant="outlined"
                        rounded="lg"
                        density="compact"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12" md="8">
                      <v-text-field
                        v-model.trim="row.resultLabel"
                        label="Result Label"
                        variant="outlined"
                        rounded="lg"
                        density="compact"
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="row.description"
                        label="Description"
                        variant="outlined"
                        rounded="lg"
                        density="compact"
                        rows="2"
                        auto-grow
                        hide-details
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="row.recommendationsText"
                        label="Recommendations (one per line)"
                        variant="outlined"
                        rounded="lg"
                        density="compact"
                        rows="2"
                        auto-grow
                        hide-details
                      />
                    </v-col>
                  </v-row>
                </v-card>
              </div>
            </template>
          </template>
        </v-card-text>

        <v-divider />

        <v-card-actions v-if="addMode === 'manual'" class="px-6 py-4">
          <v-chip
            size="small"
            variant="tonal"
            :color="selectedCreatableItems.length ? 'primary' : undefined"
          >
            {{ selectedCreatableItems.length }} selected
          </v-chip>

          <v-spacer />

          <v-btn variant="text" rounded="lg" @click="addDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:plus"
            :disabled="!selectedCreatableItems.length"
            :loading="bulkCreateLoading"
            @click="handleBulkCreate"
          >
            Create Selected
          </v-btn>
        </v-card-actions>

        <v-card-actions v-else class="px-6 py-4">
          <v-spacer />

          <v-btn variant="text" rounded="lg" @click="addDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:download"
            :disabled="!validAiRowsCount"
            :loading="aiImporting"
            @click="handleImportAiRows"
          >
            Import {{ validAiRowsCount || "" }} Meaning{{
              validAiRowsCount === 1 ? "" : "s"
            }}
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
                <div class="d-flex align-center ga-2">
                  <v-icon
                    icon="lucide:hash"
                    size="16"
                    class="text-medium-emphasis"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Result Code
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ editForm.resultCode || "-" }}
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-icon
                    icon="lucide:tag"
                    size="16"
                    class="text-medium-emphasis"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Result Label
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ editForm.resultLabel || "-" }}
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-icon
                    icon="lucide:list-ordered"
                    size="16"
                    class="text-medium-emphasis"
                  />
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Priority
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ editForm.priority }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <v-textarea
            v-model="editForm.description"
            label="Description"
            variant="outlined"
            rounded="lg"
            rows="5"
          />

          <div class="d-flex flex-column ga-3">
            <div class="d-flex align-center justify-space-between">
              <span class="text-subtitle-2 font-weight-medium">
                Recommendations
              </span>
              <span class="text-caption text-medium-emphasis">
                {{ editForm.recommendations.length }}
                {{
                  editForm.recommendations.length === 1 ? "item" : "items"
                }}
              </span>
            </div>

            <div
              v-if="!editForm.recommendations.length"
              class="meanings-recommendations-empty"
            >
              No recommendations yet — add one below.
            </div>

            <div
              v-for="(item, index) in editForm.recommendations"
              :key="`rec-${index}`"
              class="d-flex align-center ga-2"
            >
              <v-avatar size="24" color="primary" variant="tonal">
                <span class="text-caption font-weight-bold">{{
                  index + 1
                }}</span>
              </v-avatar>
              <v-text-field
                v-model="editForm.recommendations[index]"
                :label="`Recommendation ${index + 1}`"
                variant="outlined"
                rounded="lg"
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
                rounded="lg"
                prepend-icon="lucide:plus"
                @click="addRecommendation"
              >
                Add Recommendation
              </v-btn>
            </div>
          </div>

          <v-card rounded="lg" variant="outlined">
            <v-card-text class="d-flex flex-wrap align-center ga-5">
              <v-text-field
                v-model.number="editForm.priority"
                type="number"
                label="Priority"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                hide-details
                style="max-width: 160px"
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
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn variant="text" rounded="lg" @click="editDialog = false">
            Cancel
          </v-btn>
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
import { computed, onMounted, reactive, ref, watch } from "vue";
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
const tableRef = ref<any>(null);

const addDialog = ref<boolean>(false);
const initAddDialogLoading = ref<boolean>(false);
const possibleLoading = ref<boolean>(false);
const bulkCreateLoading = ref<boolean>(false);
const addDialogError = ref<string | null>(null);

const editDialog = ref<boolean>(false);
const saveEditLoading = ref<boolean>(false);
const editActionLoadingId = ref<string | null>(null);
const editDialogError = ref<string | null>(null);

const onlyUnused = ref<boolean>(true);
const selectedRuleType = ref<MeaningRuleType>("fallback");
const selectedRuleKeys = ref<string[]>([]);

/* ------------------------------
 * add meanings — generate with AI
 * ------------------------------ */
type AddMode = "manual" | "ai";
interface AiPreviewRow {
  ruleKey: string;
  ruleType: MeaningRuleType;
  ruleJson: Record<string, any>;
  displayLabel: string;
  resultCode: string;
  resultLabel: string;
  description: string;
  recommendationsText: string;
}

const addMode = ref<AddMode>("manual");
const addModeOptions: { value: AddMode; label: string; icon: string }[] = [
  { value: "manual", label: "Manual", icon: "lucide:list-checks" },
  { value: "ai", label: "Generate with AI", icon: "lucide:sparkles" },
];

watch(addMode, (mode) => {
  onlyUnused.value = mode === "manual";
  reloadPossibleMaps();
});

const ruleTypeCompletion = ref<Partial<Record<MeaningRuleType, boolean>>>({});
const ruleTypeCompletionLoading = ref<boolean>(false);

function isRuleTypeComplete(ruleType: unknown): boolean {
  return Boolean(ruleTypeCompletion.value[ruleType as MeaningRuleType]);
}

const generatingPrompt = ref<boolean>(false);
const generatedPrompt = ref<string>("");
const aiJsonInput = ref<string>("");
const aiJsonLocked = ref<boolean>(false);
const previewLoading = ref<boolean>(false);
const aiParseError = ref<string>("");
const aiPreviewRows = ref<AiPreviewRow[]>([]);
const aiImporting = ref<boolean>(false);

/* ------------------------------
 * table
 * ------------------------------ */
const columns: SbTableColumn<QuestionnaireMeaningModel>[] = [
  { title: "Rule Type", key: "ruleType", sortable: false },
  { title: "Rule Key", key: "ruleKey", sortable: false },
  { title: "Result", key: "result", sortable: false },
  { title: "Priority", key: "priority", sortable: true },
  { title: "Recommendations", key: "recommendations", sortable: false },
  { title: "Flags", key: "flags", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" },
];

function buildQuery({ search }: { search: string; filters: Record<string, any> }) {
  const s = String(search ?? "").trim();
  return s || null;
}

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
    return [
      "score_band_combo",
      "dominant_dimension",
      "dimension_band",
      "fallback",
    ];
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
  if (ruleType === "dimension_band") return "Dimension Band";
  return "Fallback";
}

function ruleTypeColor(ruleType: MeaningRuleType): string {
  if (ruleType === "score_band_combo") return "indigo";
  if (ruleType === "score_band") return "primary";
  if (ruleType === "dominant_dimension") return "purple";
  if (ruleType === "dimension_band") return "teal";
  return "grey";
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

function resetAiState(): void {
  addMode.value = "manual";
  onlyUnused.value = true;
  generatingPrompt.value = false;
  generatedPrompt.value = "";
  aiJsonInput.value = "";
  aiJsonLocked.value = false;
  previewLoading.value = false;
  aiParseError.value = "";
  aiPreviewRows.value = [];
  aiImporting.value = false;
}

async function loadRuleTypeCompletion(): Promise<void> {
  ruleTypeCompletionLoading.value = true;

  try {
    const results = await Promise.all(
      allowedRuleTypes.value.map((ruleType) =>
        store.fetchRuleTypeCompletion(ruleType),
      ),
    );

    const map: Partial<Record<MeaningRuleType, boolean>> = {};
    for (const result of results) {
      map[result.ruleType] = result.complete;
    }
    ruleTypeCompletion.value = map;
  } catch {
    // Best-effort indicator only — leave whatever was already known.
  } finally {
    ruleTypeCompletionLoading.value = false;
  }
}

async function openAddDialog(): Promise<void> {
  initAddDialogLoading.value = true;
  addDialogError.value = null;
  selectedRuleKeys.value = [];
  resetAiState();

  try {
    selectedRuleType.value = getDefaultRuleType();
    await reloadPossibleMaps();
    addDialog.value = true;
    loadRuleTypeCompletion();
  } catch (error: any) {
    addDialogError.value =
      error?.message || "Failed to open add meanings dialog.";
  } finally {
    initAddDialogLoading.value = false;
  }
}

function handleRuleTypeChange(): void {
  generatedPrompt.value = "";
  aiJsonInput.value = "";
  aiJsonLocked.value = false;
  aiParseError.value = "";
  aiPreviewRows.value = [];
  reloadPossibleMaps();
}

/* ------------------------------
 * actions — generate with AI
 * ------------------------------ */
async function handleGeneratePrompt(): Promise<void> {
  generatingPrompt.value = true;
  addDialogError.value = null;
  aiPreviewRows.value = [];

  try {
    await reloadPossibleMaps();
    const result = await store.generateMeaningsPrompt(
      selectedRuleType.value,
      onlyUnused.value,
    );
    generatedPrompt.value = result.prompt;
  } catch (error: any) {
    addDialogError.value = error?.message || "Failed to generate prompt.";
  } finally {
    generatingPrompt.value = false;
  }
}

async function copyGeneratedPrompt(): Promise<void> {
  try {
    await navigator.clipboard.writeText(generatedPrompt.value);
  } catch {
    addDialogError.value =
      "Failed to copy to clipboard. Select the text and copy it manually.";
  }
}

function stripJsonFences(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

async function handlePreviewAiJson(): Promise<void> {
  if (aiJsonLocked.value) {
    // "Update/Change JSON Response" — unlock the textarea for editing again.
    aiJsonLocked.value = false;
    return;
  }

  previewLoading.value = true;
  aiParseError.value = "";
  aiPreviewRows.value = [];

  try {
    const cleaned = stripJsonFences(aiJsonInput.value);
    if (!cleaned) {
      aiParseError.value = "Paste the AI's JSON response first.";
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch (error: any) {
      aiParseError.value = `Invalid JSON: ${error?.message || "could not parse"}`;
      return;
    }

    if (!Array.isArray(parsed)) {
      aiParseError.value = "Expected a JSON array of meaning objects.";
      return;
    }

    if (!parsed.length) {
      aiParseError.value = "The JSON array is empty.";
      return;
    }

    const byRuleKey = new Map(
      possibleItems.value.map((item) => [item.ruleKey, item]),
    );

    aiPreviewRows.value = parsed.map((raw: any) => {
      const ruleKey = String(raw?.ruleKey ?? "").trim();
      const match = byRuleKey.get(ruleKey);
      const recommendations = Array.isArray(raw?.recommendations)
        ? raw.recommendations.map((rec: any) => String(rec ?? "").trim())
        : [];

      return {
        ruleKey,
        ruleType: match?.ruleType ?? selectedRuleType.value,
        ruleJson: match?.ruleJson ?? {},
        displayLabel: match?.displayLabel ?? "",
        resultCode: String(raw?.resultCode ?? "").trim(),
        resultLabel: String(raw?.resultLabel ?? "").trim(),
        description: String(raw?.description ?? "").trim(),
        recommendationsText: recommendations.filter(Boolean).join("\n"),
      };
    });

    aiJsonLocked.value = true;
  } finally {
    previewLoading.value = false;
  }
}

function getRowErrors(row: AiPreviewRow): string[] {
  const errors: string[] = [];

  if (!row.ruleKey) {
    errors.push("Missing ruleKey");
  } else if (!possibleItems.value.some((item) => item.ruleKey === row.ruleKey)) {
    errors.push("Unknown ruleKey for this rule type");
  }

  if (!row.resultCode.trim()) errors.push("Missing resultCode");
  if (!row.resultLabel.trim()) errors.push("Missing resultLabel");

  return errors;
}

const validAiRowsCount = computed<number>(
  () => aiPreviewRows.value.filter((row) => !getRowErrors(row).length).length,
);

function removeAiPreviewRow(index: number): void {
  aiPreviewRows.value = aiPreviewRows.value.filter((_, idx) => idx !== index);
}

async function handleImportAiRows(): Promise<void> {
  const rows = aiPreviewRows.value.filter((row) => !getRowErrors(row).length);
  if (!rows.length) return;

  aiImporting.value = true;
  addDialogError.value = null;

  try {
    const items: QuestionnaireMeaningBulkCreateItemModel[] = rows.map(
      (row) => ({
        ruleType: row.ruleType,
        ruleKey: row.ruleKey,
        ruleJson: row.ruleJson,
        resultCode: row.resultCode.trim(),
        resultLabel: row.resultLabel.trim(),
        description: row.description.trim(),
        recommendations: row.recommendationsText
          .split("\n")
          .map((rec) => rec.trim())
          .filter(Boolean),
        priority: 100,
      }),
    );

    await store.bulkCreateFromMaps(items);
    addDialog.value = false;
    resetAiState();
  } catch (error: any) {
    addDialogError.value = error?.message || "Failed to import meanings.";
  } finally {
    aiImporting.value = false;
  }
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
  } catch (error: any) {
    editDialogError.value = error?.message || "Failed to update meaning.";
  } finally {
    saveEditLoading.value = false;
  }
}

async function handleDelete(item: QuestionnaireMeaningModel): Promise<void> {
  await store.deleteMeaning(item.id);
}

/* ------------------------------
 * init
 * ------------------------------ */
onMounted(async (): Promise<void> => {
  selectedRuleType.value = getDefaultRuleType();
});
</script>

<style scoped lang="scss">
.meanings-add-dialog-card {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.meanings-add-dialog-body {
  flex: 1 1 auto;
  overflow-y: auto;
}

.meanings-mode-toggle {
  display: inline-flex;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border: 1px solid var(--sb-border-soft);
  align-self: flex-start;
}

.meanings-mode-toggle__btn {
  border-radius: 999px !important;
  text-transform: none;
  letter-spacing: normal;
  box-shadow: none !important;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.meanings-prompt-textarea :deep(textarea) {
  font-family: "Roboto Mono", ui-monospace, monospace;
  font-size: 0.8125rem;
}

.meanings-prompt-textarea :deep(.v-field__field) {
  max-height: 320px;
  overflow-y: auto;
}

.meanings-json-textarea :deep(.v-field__field) {
  max-height: 320px;
  overflow-y: auto;
}

.meanings-ai-row--invalid {
  border-color: rgba(var(--v-theme-error), 0.4) !important;
  background: rgba(var(--v-theme-error), 0.03);
}

.meanings-hero {
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

.meanings-eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.meanings-title {
  margin: 10px 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.meanings-subtitle {
  max-width: 640px;
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.meanings-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.meanings-status-pill,
.meanings-status-note {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.meanings-status-pill {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.meanings-status-note {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

@media (max-width: 960px) {
  .meanings-hero {
    padding: 24px;
    align-items: flex-start;
  }
}

.meanings-rule-key {
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(var(--v-theme-on-surface), 0.06);
  font-family: "Roboto Mono", ui-monospace, monospace;
  font-size: 0.75rem;
}

.meanings-priority-chip {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

.meanings-toolbar {
  padding: 12px 16px;
  border: 1px solid var(--sb-border-soft);
  border-radius: 12px;
  background: rgba(var(--v-theme-on-surface), 0.015);
}

.meanings-picker-table :deep(tbody tr) {
  transition: background-color 0.15s ease;
}

.meanings-picker-table :deep(tbody tr:hover) {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.meanings-row--disabled {
  opacity: 0.55;
}

.meanings-recommendations-empty {
  padding: 16px;
  border: 1px dashed var(--sb-border-soft);
  border-radius: 12px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 0.875rem;
}
</style>
