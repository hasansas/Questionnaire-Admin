<template>
  <div>
    <v-card rounded="xl" variant="outlined" class="sb-card">
      <!-- Error -->
      <div v-if="uiState.error" class="pa-10 text-center">
        <v-avatar
          size="56"
          rounded="xl"
          color="error"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="lucide:triangle-alert" size="26" />
        </v-avatar>

        <div class="text-h6 font-weight-black mb-1">
          {{ uiState.errorTitle }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-5">
          {{ uiState.errorMessage }}
        </div>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:refresh-cw"
          :loading="uiState.loading"
          @click="fetchFirstPage()"
        >
          Retry
        </v-btn>
      </div>

      <!-- Loading (first load) -->
      <SbSkeletonTable
        v-else-if="uiState.loading && !uiState.loaded"
        :show-header="false"
        :showTableHeader="false"
      />

      <!-- Empty -->
      <div v-else-if="items.length === 0" class="pa-10 text-center">
        <v-avatar
          size="56"
          rounded="xl"
          color="primary"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="lucide:inbox" size="26" />
        </v-avatar>

        <div class="text-h6 font-weight-black mb-1">No questions yet</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Start by adding your first question.
        </div>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          @click="openCreateDialog"
        >
          New question
        </v-btn>
      </div>

      <!-- Data -->
      <template v-else>
        <!-- Header -->
        <div class="pa-5 pb-3">
          <div class="d-flex align-start justify-space-between flex-wrap ga-4">
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">Questions</div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Drag to reorder. Load all questions to enable “Save order”.
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap">
              <!-- <v-chip size="small" variant="tonal">
                <v-icon icon="lucide:list-checks" size="16" class="me-1" />
                {{ items.length }} loaded
              </v-chip>

              <v-chip
                size="small"
                variant="tonal"
                :color="optionsMode === 'fixed' ? 'success' : 'warning'"
              >
                <v-icon
                  :icon="
                    optionsMode === 'fixed'
                      ? 'lucide:toggle-right'
                      : 'lucide:toggle-left'
                  "
                  size="16"
                  class="me-1"
                />
                Options:
                {{ optionsMode === "fixed" ? "Fixed" : "Per-question" }}
              </v-chip>

              <v-chip v-if="hasMore" size="small" variant="tonal" color="info">
                <v-icon icon="lucide:arrow-down" size="16" class="me-1" />
                More available
              </v-chip>

              <v-btn
                rounded="lg"
                variant="outlined"
                prepend-icon="lucide:rotate-ccw"
                :disabled="!hasChanges"
                @click="resetOrder"
              >
                Reset
              </v-btn>

              <v-btn
                rounded="lg"
                color="primary"
                prepend-icon="lucide:save"
                :disabled="!canSaveOrder"
                :loading="uiState.savingOrder"
                @click="saveOrder"
              >
                Save order
              </v-btn> -->

              <v-btn
                rounded="lg"
                color="primary"
                prepend-icon="lucide:plus"
                @click="openCreateDialog"
              >
                New question
              </v-btn>
            </div>
          </div>

          <v-alert
            v-if="hasChanges"
            type="info"
            variant="tonal"
            rounded="lg"
            class="mt-4"
          >
            Order changed. Click <b>Save order</b> to apply.
          </v-alert>

          <v-alert
            v-else-if="hasMore"
            type="info"
            variant="tonal"
            rounded="lg"
            class="mt-4"
          >
            Scroll down to load more questions automatically.
          </v-alert>
        </div>

        <v-divider />
        <!-- List -->
        <div class="pa-4">
          <div class="d-flex flex-column ga-3">
            <v-card
              v-for="(q, idx) in localRows"
              :key="q.id"
              rounded="xl"
              variant="outlined"
              class="pa-4 sb-draggable"
              :class="{
                'sb-dragging': draggingId === q.id,
                'sb-drop-target': dropTargetId === q.id && draggingId !== q.id,
              }"
              draggable="true"
              @dragstart="onDragStart($event, q)"
              @dragenter.prevent="onDragEnter(q)"
              @dragover.prevent
              @dragleave="onDragLeave(q)"
              @drop.prevent="onDrop(q)"
              @dragend="onDragEnd"
            >
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="d-flex align-start ga-3 min-w-0">
                  <div class="sb-handle mt-1" aria-hidden="true">
                    <v-icon icon="lucide:grip-vertical" size="18" />
                  </div>

                  <div class="min-w-0">
                    <div class="text-body-2 font-weight-black">
                      <span class="mr-2"># {{ idx + 1 }}.</span>
                      <span>{{ q.text }}</span>
                    </div>

                    <div class="d-flex ga-2 flex-wrap mt-3">
                      <v-chip
                        v-if="isMultiDimension"
                        size="small"
                        variant="tonal"
                        class="px-4"
                      >
                        <v-icon icon="lucide:layers" size="14" class="me-2" />
                        {{ q.dimension?.name }}
                      </v-chip>
                      <v-chip
                        v-for="o in (q.options || []).slice(0, 4)"
                        :key="o.key"
                        size="small"
                        variant="outlined"
                        class="px-4"
                      >
                        <span class="font-weight-bold me-1">{{ o.label }}</span>
                        <span class="text-medium-emphasis"
                          >({{ o.scoreValue }})</span
                        >
                      </v-chip>
                      <v-chip
                        v-if="(q.options || []).length > 4"
                        size="x-small"
                        variant="tonal"
                        class="px-2"
                      >
                        +{{ (q.options || []).length - 4 }} more
                      </v-chip>
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center ga-1">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    aria-label="Edit"
                    @click="openEditDialog(q)"
                  >
                    <v-icon icon="lucide:pencil" size="18" />
                  </v-btn>

                  <v-menu location="bottom end" :close-on-content-click="true">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        icon
                        variant="text"
                        aria-label="Option actions"
                      >
                        <v-icon icon="lucide:trash-2" size="18" />
                      </v-btn>
                    </template>

                    <v-list density="comfortable" rounded="xl" class="sb-list">
                      <v-list-item
                        title="Delete question"
                        class="text-error"
                        @click="deleteQuestion(q)"
                      >
                        <template #prepend>
                          <v-icon
                            icon="lucide:trash-2"
                            size="18"
                            class="text-error"
                          />
                        </template>
                      </v-list-item>
                      <v-divider />
                      <v-list-item title="Cancel" link>
                        <template #prepend>
                          <v-icon icon="lucide:x" size="18" />
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Load more -->
          <div class="mt-5">
            <div v-if="uiState.loadingMore" class="d-flex align-center ga-3">
              <v-progress-circular indeterminate size="18" />
              <div class="text-body-2 text-medium-emphasis">Loading more…</div>
            </div>

            <div
              v-else-if="hasMore"
              class="d-flex align-center justify-space-between flex-wrap ga-2"
            >
              <div class="text-caption text-medium-emphasis">
                Scroll to load more, or use the button.
              </div>
              <v-btn
                rounded="lg"
                variant="outlined"
                prepend-icon="lucide:arrow-down"
                :disabled="uiState.loadingMore"
                @click="loadMore"
              >
                Load more
              </v-btn>
            </div>

            <div v-else class="text-caption text-medium-emphasis">
              You’ve reached the end.
            </div>

            <div ref="sentinelRef" class="sb-sentinel" />
          </div>
        </div>
      </template>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialogOpen" persistent max-width="680">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center ga-3">
          <v-avatar
            size="40"
            rounded="lg"
            :color="dialogMode === 'create' ? 'primary' : 'info'"
            variant="tonal"
          >
            <v-icon
              :icon="dialogMode === 'create' ? 'lucide:plus' : 'lucide:pencil'"
              size="18"
            />
          </v-avatar>

          <div class="min-w-0">
            <div class="text-h6 font-weight-black">
              {{ dialogMode === "create" ? "New question" : "Edit question" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Configure question text, requirement, and scoring behavior.
            </div>
          </div>
        </v-card-title>
        <v-card variant="flat" class="overflow-y-auto">
          <v-card-text class="px-5 pt-2 pb-4">
            <v-form ref="dialogFormRef" @submit.prevent="handleSave">
              <v-row dense>
                <v-col cols="12">
                  <v-textarea
                    v-model.trim="editForm.text"
                    label="Question text"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    auto-grow
                    rows="2"
                    prepend-inner-icon="lucide:message-square"
                    :rules="[rules.required, rules.min3]"
                    hide-details="auto"
                    placeholder="Example: Saya lebih mudah belajar dari gambar."
                  />
                </v-col>

                <!-- Dimension selector -->
                <v-col v-if="isMultiDimension" cols="12">
                  <v-select
                    v-model="editForm.dimensionId"
                    label="Dimension"
                    :items="dimensionItems"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="lucide:layers"
                    :rules="[rules.required]"
                    hide-details="auto"
                  />
                  <div class="text-caption text-medium-emphasis mt-2">
                    This will map the question to the selected dimension (weight
                    = 1).
                  </div>
                </v-col>

                <!-- Options editor (per-question only) -->
                <v-col cols="12" class="mt-2">
                  <v-card rounded="xl" variant="outlined" class="pa-4">
                    <div
                      class="d-flex align-center justify-space-between flex-wrap ga-2"
                    >
                      <div>
                        <div class="text-body-2 font-weight-black">
                          Options
                          <span
                            v-if="optionsMode === 'fixed'"
                            class="text-medium-emphasis"
                          >
                            (Fixed / global)
                          </span>
                          <span v-else class="text-medium-emphasis">
                            (Per-question)
                          </span>
                        </div>
                        <div class="text-caption text-medium-emphasis mt-1">
                          {{
                            optionsMode === "fixed"
                              ? "Options are managed globally in questionnaire setup."
                              : "Define the options for this question."
                          }}
                        </div>
                      </div>

                      <div class="d-flex align-center ga-2">
                        <v-btn
                          v-if="optionsMode !== 'fixed'"
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:plus"
                          @click="addOption"
                        >
                          Add option
                        </v-btn>
                      </div>
                    </div>

                    <v-divider class="my-4" />

                    <!-- Fixed preview -->
                    <template v-if="optionsMode === 'fixed'">
                      <div class="d-flex flex-column ga-2">
                        <v-card
                          v-for="o in props.model.fixedOptionsJson || []"
                          :key="o.sortOrder"
                          dimensionItems
                          rounded="xl"
                          variant="tonal"
                          color="grey"
                          class="pa-3"
                        >
                          <div
                            class="d-flex align-center justify-space-between ga-3"
                          >
                            <div class="min-w-0">
                              <div class="d-flex align-center ga-2">
                                <v-avatar
                                  size="28"
                                  rounded="lg"
                                  color="primary"
                                  variant="tonal"
                                >
                                  <v-icon
                                    icon="lucide:check-circle-2"
                                    size="14"
                                  />
                                </v-avatar>

                                <div
                                  class="text-body-2 font-weight-bold text-truncate"
                                >
                                  {{ o.label || "—" }}
                                </div>
                              </div>
                            </div>

                            <v-chip size="small" variant="tonal" class="px-3">
                              <v-icon
                                icon="lucide:sigma"
                                size="14"
                                class="me-1"
                              />
                              <span class="font-weight-bold">{{
                                o.scoreValue
                              }}</span>
                            </v-chip>
                          </div>
                        </v-card>

                        <v-alert
                          v-if="
                            (props.model.fixedOptionsJson || []).length === 0
                          "
                          type="info"
                          variant="tonal"
                          rounded="lg"
                        >
                          No fixed options configured.
                        </v-alert>
                      </div>
                    </template>

                    <!-- Per-question editor -->
                    <template v-else>
                      <v-alert
                        v-if="
                          validationAttempted && editForm.options.length < 2
                        "
                        type="warning"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        Add at least <b>2</b> options.
                      </v-alert>

                      <div class="d-flex flex-column ga-3">
                        <v-card
                          v-for="(o, i) in editForm.options"
                          :key="o.__localId"
                          rounded="xl"
                          variant="outlined"
                          class="pa-3 sb-draggable sb-option-card"
                          draggable="true"
                          :class="{
                            'sb-dragging': draggingOptionId === o.__localId,
                            'sb-drop-target':
                              optionDropTargetId === o.__localId &&
                              draggingOptionId !== o.__localId,
                          }"
                          @dragstart="onOptionDragStart($event, o)"
                          @dragenter.prevent="onOptionDragEnter(o)"
                          @dragover.prevent
                          @dragleave="onOptionDragLeave(o)"
                          @drop.prevent="onOptionDrop(o)"
                          @dragend="onOptionDragEnd"
                        >
                          <div
                            class="d-flex align-start justify-space-between ga-2"
                          >
                            <div class="d-flex align-center ga-2 min-w-0">
                              <!-- drag handle -->
                              <div
                                class="sb-handle sb-option-handle"
                                aria-hidden="true"
                              >
                                <v-icon icon="lucide:grip-vertical" size="18" />
                              </div>

                              <v-chip size="x-small" variant="tonal"
                                >#{{ i + 1 }}</v-chip
                              >
                            </div>

                            <v-menu location="bottom end">
                              <template #activator="{ props: mp }">
                                <v-btn
                                  v-bind="mp"
                                  icon
                                  variant="text"
                                  aria-label="Option actions"
                                  :disabled="editForm.options.length <= 2"
                                >
                                  <v-icon icon="lucide:trash-2" size="18" />
                                </v-btn>
                              </template>

                              <v-list density="compact" min-width="180">
                                <v-list-item
                                  title="Delete option"
                                  class="text-error"
                                  :disabled="editForm.options.length <= 2"
                                  @click="removeOption(i)"
                                >
                                  <template #prepend>
                                    <v-icon
                                      size="20"
                                      icon="lucide:trash-2"
                                      class="text-error"
                                    />
                                  </template>
                                </v-list-item>
                                <v-divider />
                                <v-list-item link title="Cancel">
                                  <template #prepend>
                                    <v-icon size="20" icon="lucide:x" />
                                  </template>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                          </div>

                          <v-row dense class="mt-2">
                            <v-col cols="12" md="7">
                              <v-text-field
                                v-model.trim="o.label"
                                label="Label"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                :rules="[rules.required]"
                                hide-details="auto"
                              />
                            </v-col>
                            <v-col cols="12" md="5">
                              <v-text-field
                                v-model.number="o.scoreValue"
                                label="Score"
                                type="number"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                :rules="[rules.requiredNumber]"
                                hide-details="auto"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </div>
                    </template>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <v-divider class="sb-divider" />

        <div class="px-5 py-4 d-flex justify-end ga-2">
          <v-btn
            rounded="lg"
            variant="tonal"
            :disabled="saving"
            @click="closeDialog"
          >
            Cancel
          </v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            :loading="saving"
            prepend-icon="lucide:save"
            @click="handleSave"
          >
            {{ dialogMode === "create" ? "Create" : "Save changes" }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { QuestionnaireModel } from "~/models/questionnaire";
import type { QuestionnaireQuestionModel } from "~/models/questionnaire-questions";
import { normalizeQuestionnaireQuestions } from "~/models/questionnaire-questions";
import { formatDateLabel } from "~/utils/dateUtils";

const props = defineProps<{ model: QuestionnaireModel }>();

const emit = defineEmits<{
  (e: "delete", item: QuestionnaireQuestionModel): void;
  (e: "saveOrder", payload: { id: string; sortOrder: number }[]): void;
}>();

const snack = useAppSnackbar();
const api = useApiService();

const questionnaireId = computed(() => props.model?.id || "");
const optionsMode = computed(() => props.model?.optionsMode || "fixed");
const isMultiDimension = computed(
  () => props.model?.scoringType === "multi_dimension",
);

const questionsStore = useQuestionnaireQuestions(questionnaireId.value);
const dimensionStore = useQuestionnaireDimensionStore(questionnaireId.value);

const uiState = reactive({
  loading: false,
  loaded: false,
  loadingMore: false,
  savingOrder: false,
  error: false,
  errorTitle: `Couldn’t load data`,
  errorMessage: "",
});

const pageSize = 100;
const baseQuery = computed(() => `limit=${pageSize}&include=options`);

const hasMore = computed(() => Boolean(questionsStore?.hasMore));

// Flatten pages -> normalized items
const items = computed<QuestionnaireQuestionModel[]>(() => {
  const pages = questionsStore?.data?.rows ?? [];
  const flat = Array.isArray(pages) ? (pages as any[]).flat() : [];
  return normalizeQuestionnaireQuestions(flat);
});

/** Keep local order stable (draggable) */
const localRows = ref<QuestionnaireQuestionModel[]>([]);
const baselineOrder = ref<string[]>([]);

function syncLocalRowsFromStore(nextRows: QuestionnaireQuestionModel[]) {
  const sorted = [...nextRows].sort(
    (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
  );
  const map = new Map(sorted.map((x) => [x.id, x]));

  const kept = localRows.value
    .map((x) => map.get(x.id))
    .filter(Boolean) as QuestionnaireQuestionModel[];

  const keptIds = new Set(kept.map((x) => x.id));
  const appended = sorted.filter((x) => !keptIds.has(x.id));

  localRows.value = [...kept, ...appended];

  // baseline init/update without marking as changes when loading more
  if (!baselineOrder.value.length) {
    baselineOrder.value = sorted.map((x) => x.id);
  } else {
    const baseSet = new Set(baselineOrder.value);
    baselineOrder.value = [
      ...baselineOrder.value.filter((id) => map.has(id)),
      ...appended.map((x) => x.id).filter((id) => !baseSet.has(id)),
    ];
  }
}

watch(items, (rows) => syncLocalRowsFromStore(rows), { immediate: true });

const hasChanges = computed(() => {
  const current = localRows.value.map((x) => x.id);
  const base = baselineOrder.value;
  if (current.length !== base.length) return true;
  return current.some((id, i) => id !== base[i]);
});

const canSaveOrder = computed(() => !hasMore.value && hasChanges.value);

function resetOrder() {
  const map = new Map(localRows.value.map((x) => [x.id, x]));
  localRows.value = baselineOrder.value
    .map((id) => map.get(id))
    .filter(Boolean) as QuestionnaireQuestionModel[];
}

async function saveOrder() {
  if (!canSaveOrder.value) {
    snack.open("Load all questions before saving order.", { color: "warning" });
    return;
  }
  uiState.savingOrder = true;
  try {
    const payload = localRows.value.map((q, idx) => ({
      id: q.id,
      sortOrder: idx + 1,
    }));
    emit("saveOrder", payload);
    baselineOrder.value = localRows.value.map((x) => x.id);
    snack.open("Order saved (UI).", { color: "success" });
  } finally {
    uiState.savingOrder = false;
  }
}

/** Drag & Drop (native) */
const draggingId = ref<string | null>(null);
const dropTargetId = ref<string | null>(null);

function onDragStart(evt: DragEvent, q: QuestionnaireQuestionModel) {
  draggingId.value = q.id;
  dropTargetId.value = null;
  evt.dataTransfer?.setData("text/plain", q.id);
  if (evt.dataTransfer) evt.dataTransfer.effectAllowed = "move";
}
function onDragEnter(target: QuestionnaireQuestionModel) {
  if (!draggingId.value || draggingId.value === target.id) return;
  dropTargetId.value = target.id;
}
function onDragLeave(target: QuestionnaireQuestionModel) {
  if (dropTargetId.value === target.id) dropTargetId.value = null;
}
function onDrop(target: QuestionnaireQuestionModel) {
  const fromId = draggingId.value;
  if (!fromId || fromId === target.id) return;

  const fromIndex = localRows.value.findIndex((x) => x.id === fromId);
  const toIndex = localRows.value.findIndex((x) => x.id === target.id);
  if (fromIndex < 0 || toIndex < 0) return;

  const next = [...localRows.value];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  localRows.value = next;
  dropTargetId.value = null;
}
function onDragEnd() {
  draggingId.value = null;
  dropTargetId.value = null;
}

/** Fetch + infinite scroll */
async function fetchFirstPage() {
  uiState.loading = true;
  uiState.error = false;
  uiState.errorMessage = "";

  const res = await questionsStore.fetchAll({
    page: 1,
    query: baseQuery.value, // sets savedQuery -> loadMore works
    reset: true,
  });

  uiState.loading = false;
  uiState.loaded = true;

  if (!res?.success) {
    uiState.error = true;
    uiState.errorMessage = res?.error || "Failed to fetch questions";
  }
}

async function loadMore() {
  if (uiState.loadingMore || uiState.loading) return;
  if (!hasMore.value) return;
  uiState.loadingMore = true;
  try {
    await questionsStore.loadMore();
  } finally {
    uiState.loadingMore = false;
  }
}

const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await fetchFirstPage();

  // prefetch dimensions for dialog if needed
  if (isMultiDimension.value) {
    await dimensionStore.fetchAll({});
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      loadMore();
    },
    { root: null, rootMargin: "240px", threshold: 0.01 },
  );
  if (sentinelRef.value) observer.observe(sentinelRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

/**
 * Dialog add/edit
 */
type DialogMode = "create" | "edit";
const dialogOpen = ref(false);
const dialogMode = ref<DialogMode>("create");
const dialogFormRef = ref<any>(null);
const dialogError = ref("");
const saving = ref(false);
const deleting = ref(false);
const validationAttempted = ref(false);

const dimensionItems = computed(() => dimensionStore.items);

type LocalOption = {
  __localId: string;
  key?: string;
  label: string;
  scoreValue: number;
  sortOrder?: number;
};

const editForm = reactive<{
  id: string;
  text: string;
  description: string;
  isRequired: boolean;
  hint: string;
  dimensionId: string;
  options: LocalOption[];
}>({
  id: "",
  text: "",
  description: "",
  isRequired: true,
  hint: "...",
  dimensionId: "",
  options: [],
});

const rules = {
  required: (v: any) => (!!String(v ?? "").trim() ? true : "Required"),
  min3: (v: any) => (String(v ?? "").trim().length >= 3 ? true : "Min 3 chars"),
  requiredNumber: (v: any) =>
    Number.isFinite(Number(v)) ? true : "Must be a number",
};

function resetForm() {
  dialogError.value = "";
  saving.value = false;
  validationAttempted.value = false;
  editForm.id = "";
  editForm.text = "";
  editForm.description = "";
  editForm.isRequired = true;
  editForm.hint = "...";
  editForm.dimensionId = "";
  editForm.options = [
    { __localId: crypto.randomUUID(), label: "Setuju", scoreValue: 2 },
    { __localId: crypto.randomUUID(), label: "Ragu", scoreValue: 1 },
    { __localId: crypto.randomUUID(), label: "Tidak setuju", scoreValue: 0 },
  ];
  nextTick(() => dialogFormRef.value?.resetValidation?.());
}

function openCreateDialog() {
  dialogMode.value = "create";
  resetForm();
  dialogOpen.value = true;
}

function openEditDialog(item: QuestionnaireQuestionModel) {
  dialogMode.value = "edit";
  dialogError.value = "";
  saving.value = false;
  validationAttempted.value = false;

  editForm.id = item.id;
  editForm.text = item.text ?? "";
  editForm.description = (item as any).description ?? "";
  editForm.isRequired = Boolean(item.isRequired);
  editForm.hint = String((item as any)?.meta?.hint ?? "...");
  editForm.dimensionId = ""; // mapping not included in payload; keep empty unless you add it later

  // load options for per-question editing UI
  editForm.options =
    (item.options || []).map((o: any) => ({
      __localId: crypto.randomUUID(),
      key: o.key,
      label: o.label,
      scoreValue: Number(o.scoreValue ?? 0),
      sortOrder: Number(o.sortOrder ?? 1),
    })) || [];

  dialogOpen.value = true;
  nextTick(() => dialogFormRef.value?.resetValidation?.());
}

function closeDialog() {
  dialogOpen.value = false;
}

function addOption() {
  editForm.options.push({
    __localId: crypto.randomUUID(),
    label: "",
    scoreValue: 0,
  });
}

function removeOption(index: number) {
  editForm.options.splice(index, 1);
}

async function handleSave() {
  validationAttempted.value = true;
  dialogError.value = "";

  const res = await dialogFormRef.value?.validate?.();
  if (!res?.valid) return;

  if (optionsMode.value !== "fixed" && editForm.options.length < 2) {
    dialogError.value = "Add at least 2 options.";
    return;
  }

  saving.value = true;
  try {
    const payload: any = {
      text: editForm.text.trim(),
      description: editForm.description.trim(),
      questionType: "single_choice",

      isRequired: Boolean(editForm.isRequired),
      meta: { hint: editForm.hint.trim() },
      options: editForm.options.map((o: any) => ({
        label: o.label.trim(),
        scoreValue: Number(o.scoreValue),
      })),
    };

    if (isMultiDimension.value) {
      payload.dimensionId = editForm.dimensionId;
      payload.weight = 1;
    }

    if (optionsMode.value !== "fixed") {
      payload.options = editForm.options.map((o: any) => ({
        label: o.label.trim(),
        scoreValue: Number(o.scoreValue),
      }));
    }

    if (dialogMode.value === "create") {
      const res = await questionsStore.create(payload);

      if (typeof res?.success === "boolean") {
        if (!res.success) {
          const errorMsg =
            res.error?.message || res.error || "Failed to create question";
          snack?.open?.(errorMsg, { color: "error" });
          return;
        }
      }

      snack.open("Question created.", { color: "success" });
      closeDialog();

      return;
    } else if (dialogMode.value === "edit") {
      const id = editForm.id;
      if (!id) throw new Error("Missing question id.");

      const res = await questionsStore.update(id, payload);

      if (typeof res?.success === "boolean") {
        if (!res.success) {
          const errorMsg =
            res.error?.message || res.error || "Failed to save question";
          snack?.open?.(errorMsg, { color: "error" });
          return;
        }
      }

      snack.open("Changes saved.", { color: "success" });
      closeDialog();

      return;
    }
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save";
  } finally {
    saving.value = false;
  }
}

async function deleteQuestion(question: any) {
  try {
    deleting.value = true;
    const res = await questionsStore.remove(question.id);

    if (typeof res?.success === "boolean") {
      if (!res.success) {
        const errorMsg =
          res.error?.message || res.error || "Failed to delete question";
        snack?.open?.(errorMsg, { color: "error" });
        return;
      }
    }

    snack.open("Question deleted.", { color: "success" });
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to delete question";
  } finally {
    deleting.value = false;
  }
}

// Options drag state
const draggingOptionId = ref<string | null>(null);
const optionDropTargetId = ref<string | null>(null);

function onOptionDragStart(evt: DragEvent, o: any) {
  draggingOptionId.value = o.__localId;
  optionDropTargetId.value = null;
  evt.dataTransfer?.setData("text/plain", o.__localId);
  if (evt.dataTransfer) evt.dataTransfer.effectAllowed = "move";
}

function onOptionDragEnter(target: any) {
  if (!draggingOptionId.value || draggingOptionId.value === target.__localId)
    return;
  optionDropTargetId.value = target.__localId;
}

function onOptionDragLeave(target: any) {
  if (optionDropTargetId.value === target.__localId)
    optionDropTargetId.value = null;
}

function onOptionDrop(target: any) {
  const fromId = draggingOptionId.value;
  if (!fromId || fromId === target.__localId) return;

  const fromIndex = editForm.options.findIndex((x) => x.__localId === fromId);
  const toIndex = editForm.options.findIndex(
    (x) => x.__localId === target.__localId,
  );
  if (fromIndex < 0 || toIndex < 0) return;

  const next = [...editForm.options];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  editForm.options = next;

  optionDropTargetId.value = null;
}

function onOptionDragEnd() {
  draggingOptionId.value = null;
  optionDropTargetId.value = null;
}
</script>

<style scoped lang="scss">
.sb-handle {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.sb-draggable {
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.sb-dragging {
  opacity: 0.65;
}
.sb-drop-target {
  border-color: rgba(var(--v-theme-primary), 0.55) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
}
.sb-sentinel {
  height: 1px;
}
</style>
