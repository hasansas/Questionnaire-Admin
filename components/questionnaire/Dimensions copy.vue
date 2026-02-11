<template>
  <div>
    <v-card rounded="xl" variant="outlined" class="sb-card">
      <!-- Header -->
      <div class="pa-5 pb-3">
        <div class="d-flex align-start justify-space-between flex-wrap ga-4">
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">Dimensions</div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              Define scoring dimensions (e.g., Visual, Auditory, Kinesthetic)
              and keep them ordered for reporting.
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-btn
              rounded="lg"
              color="primary"
              prepend-icon="lucide:plus"
              :disabled="!canManage"
              @click="openCreateDialog"
            >
              New dimension
            </v-btn>
          </div>
        </div>

        <v-alert
          v-if="!isMultiDimension"
          type="info"
          variant="tonal"
          rounded="lg"
          class="mt-4"
        >
          Dimensions are mainly used for <b>multi-dimension</b> scoring. This
          questionnaire is currently using <b>total score</b>.
        </v-alert>
      </div>

      <v-divider />

      <!-- Body -->
      <div class="pa-4">
        <!-- Loading -->
        <template v-if="loading">
          <div class="d-flex flex-column ga-3">
            <v-card
              v-for="i in 5"
              :key="i"
              rounded="xl"
              variant="outlined"
              class="pa-4"
            >
              <div class="d-flex align-center justify-space-between ga-3">
                <div class="d-flex align-center ga-3 min-w-0">
                  <v-skeleton-loader type="avatar" />
                  <div class="min-w-0">
                    <v-skeleton-loader type="text" width="220" class="mb-1" />
                    <v-skeleton-loader type="text" width="320" />
                  </div>
                </div>
                <v-skeleton-loader type="chip" width="64" />
              </div>
            </v-card>
          </div>
        </template>

        <!-- Error -->
        <template v-else-if="errorMessage">
          <v-alert type="error" variant="tonal" rounded="lg">
            <div class="text-body-2 font-weight-bold">
              Failed to load dimensions
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{ errorMessage }}
            </div>

            <div class="d-flex ga-2 mt-3">
              <v-btn rounded="lg" variant="outlined" @click="refresh">
                Try again
              </v-btn>
            </div>
          </v-alert>
        </template>

        <!-- Empty -->
        <template v-else-if="items.length === 0">
          <v-card rounded="xl" variant="flat" class="pa-8">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar size="56" rounded="xl" color="warning" variant="tonal">
                <v-icon icon="lucide:layers" size="22" />
              </v-avatar>

              <div class="text-subtitle-1 font-weight-black mt-3">
                No dimensions found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Create your first dimension to organize scoring and reporting.
              </div>

              <div class="d-flex ga-2 mt-5">
                <v-btn
                  rounded="lg"
                  color="primary"
                  prepend-icon="lucide:plus"
                  :disabled="!canManage"
                  @click="openCreateDialog"
                >
                  New dimension
                </v-btn>
              </div>
            </div>
          </v-card>
        </template>

        <!-- List -->
        <template v-else>
          <div class="d-flex flex-column ga-3">
            <v-card
              v-for="d in items"
              :key="d.id"
              rounded="xl"
              variant="outlined"
              class="pa-4"
            >
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="d-flex align-start ga-3 min-w-0">
                  <v-avatar size="38" rounded="lg" color="info" variant="tonal">
                    <v-icon icon="lucide:layers" size="18" />
                  </v-avatar>

                  <div class="min-w-0">
                    <div class="d-flex align-center ga-2 flex-wrap">
                      <div
                        class="text-body-2 font-weight-black text-capitalize"
                      >
                        {{ d.name || "—" }}
                      </div>

                      <v-chip size="x-small" variant="tonal" class="px-2">
                        <v-icon icon="lucide:key" size="14" class="me-1" />
                        {{ d.key || "—" }}
                      </v-chip>

                      <v-chip size="x-small" variant="tonal" class="px-2">
                        <v-icon
                          icon="lucide:arrow-up-down"
                          size="14"
                          class="me-1"
                        />
                        #{{ d.sortOrder }}
                      </v-chip>
                    </div>

                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ d.description || "No description provided." }}
                    </div>

                    <div class="text-caption text-medium-emphasis mt-2">
                      Updated {{ formatDateLabel(d.updatedAt) }}
                    </div>
                  </div>
                </div>

                <div class="d-flex align-center ga-1">
                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    :disabled="!canManage"
                    aria-label="Edit dimension"
                    @click="openEditDialog(d)"
                  >
                    <v-icon icon="lucide:pencil" size="18" />
                  </v-btn>

                  <!-- Simple confirm delete via menu -->
                  <v-menu location="bottom end">
                    <template #activator="{ props: menuProps }">
                      <v-btn
                        v-bind="menuProps"
                        icon
                        variant="text"
                        size="small"
                        :disabled="!canManage"
                        aria-label="Delete dimension"
                      >
                        <v-icon icon="lucide:trash" size="18" />
                      </v-btn>
                    </template>

                    <v-list density="compact" min-width="220">
                      <v-list-item
                        class="text-error"
                        :disabled="deletingId === d.id"
                        @click="onDelete(d)"
                      >
                        <template #prepend>
                          <v-icon icon="lucide:trash-2" class="text-error" />
                        </template>

                        <v-list-item-title class="font-weight-bold">
                          Delete
                        </v-list-item-title>

                        <v-list-item-subtitle>
                          This action can’t be undone
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </div>
            </v-card>
          </div>
        </template>
      </div>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="560">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-start ga-3">
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
              {{ dialogMode === "create" ? "New dimension" : "Edit dimension" }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{
                dialogMode === "create"
                  ? "Add a scoring dimension. Key and sort order are generated automatically."
                  : "Update dimension details. Key and ordering remain managed by the system."
              }}
            </div>
          </div>
        </v-card-title>

        <v-card-text class="px-5 pt-2 pb-4">
          <v-alert
            v-if="dialogError"
            type="error"
            variant="tonal"
            rounded="lg"
            class="mb-4"
          >
            {{ dialogError }}
          </v-alert>

          <v-form ref="formRef" @submit.prevent="submitDialog">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="editForm.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="lucide:type"
                  :rules="[rules.required, rules.min2]"
                  hide-details="auto"
                  placeholder="Example: Visual"
                  autofocus
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model.trim="editForm.description"
                  label="Description"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="lucide:align-left"
                  :rules="[rules.required]"
                  hide-details="auto"
                  auto-grow
                  rows="2"
                  placeholder="Example: Prefers images & diagrams"
                />
              </v-col>

              <v-col cols="12">
                <v-card rounded="lg" variant="tonal" class="pa-3">
                  <div class="d-flex align-start ga-2">
                    <v-icon icon="lucide:info" size="16" class="mt-1" />
                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">Tip</div>
                      <div class="text-caption text-medium-emphasis mt-1">
                        Keep descriptions short and consistent—this will be
                        shown in admin lists and can be surfaced in reports.
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider class="sb-divider" />

        <v-card-actions class="px-5 py-4 d-flex justify-end ga-2">
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
            @click="submitDialog"
          >
            {{ dialogMode === "create" ? "Create" : "Save changes" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { QuestionnaireModel } from "~/models/questionnaire";
import type { QuestionnaireDimensionModel } from "~/models/questionnaire-dimension";
import { formatDateLabel } from "~/utils/dateUtils";

const props = defineProps<{
  model: QuestionnaireModel;
}>();

const questionnaireId = computed(() => props.model?.id || "");

const dimensionStore = useQuestionnaireDimensionStore();

const items = computed(() => dimensionStore.list(questionnaireId.value));
const loading = computed(() => dimensionStore.isPending(questionnaireId.value));
const errorMessage = computed(() =>
  dimensionStore.error(questionnaireId.value),
);

const isMultiDimension = computed(
  () => props.model?.scoringType === "multi_dimension",
);
const canManage = computed(() => true);

// initial fetch
async function fetchDimensions() {
  if (!questionnaireId.value) return;
  await dimensionStore.fetchDimensions(questionnaireId.value);
}
async function refresh() {
  await fetchDimensions();
}
onMounted(() => fetchDimensions());

/**
 * Dialog state
 */
type DialogMode = "create" | "edit";

const dialogOpen = ref(false);
const dialogMode = ref<DialogMode>("create");
const saving = ref(false);
const deletingId = ref<string | null>(null);
const dialogError = ref("");

const formRef = ref<any>(null);

const editForm = ref({
  id: "",
  key: "",
  name: "",
  description: "" as string,
  sortOrder: 1,
});

const rules = {
  required: (v: any) => (!!String(v ?? "").trim() ? true : "Required"),
  min2: (v: any) => (String(v ?? "").trim().length >= 2 ? true : "Min 2 chars"),
  min1: (v: any) => (Number(v) >= 1 ? true : "Min 1"),
  key: (v: any) => {
    const s = String(v ?? "").trim();
    if (!s) return "Required";
    return /^[a-z0-9_]+$/i.test(s)
      ? true
      : "Use letters/numbers/underscore only";
  },
};

function resetDialogState() {
  dialogError.value = "";
  editForm.value = {
    id: "",
    key: "",
    name: "",
    description: "",
    sortOrder: 1,
  };
  nextTick(() => formRef.value?.resetValidation?.());
}

function openCreateDialog() {
  dialogMode.value = "create";
  resetDialogState();
  dialogOpen.value = true;
}

function openEditDialog(item: QuestionnaireDimensionModel) {
  dialogMode.value = "edit";
  dialogError.value = "";
  editForm.value = {
    id: item.id,
    key: item.key ?? "",
    name: item.name ?? "",
    description: (item.description ?? "") as string,
    sortOrder: Number(item.sortOrder ?? 1),
  };
  dialogOpen.value = true;
  nextTick(() => formRef.value?.resetValidation?.());
}

function closeDialog() {
  dialogOpen.value = false;
  resetDialogState();
}

async function submitDialog() {
  dialogError.value = "";

  const res = await formRef.value?.validate?.();
  if (!res?.valid) return;

  const qid = questionnaireId.value;
  if (!qid) {
    dialogError.value = "Missing questionnaire id.";
    return;
  }

  saving.value = true;
  try {
    const payloadItem = {
      ...(dialogMode.value === "edit" ? { id: editForm.value.id } : {}),
      name: String(editForm.value.name).trim(),
      description: String(editForm.value.description).trim(),
    };

    if (dialogMode.value === "create") {
      // POST with array payload
      await dimensionStore.createDimensions(qid, [payloadItem]);
    } else {
      // PUT with array payload (includes id)
      await dimensionStore.upsertDimensions(qid, [payloadItem]);
    }

    closeDialog();
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save dimension";
  } finally {
    saving.value = false;
  }
}

async function onDelete(item: QuestionnaireDimensionModel) {
  if (!questionnaireId.value) return;
  deletingId.value = item.id;
  try {
    await dimensionStore.deleteDimension(questionnaireId.value, item.id);
  } finally {
    deletingId.value = null;
  }
}
</script>

<style scoped lang="scss">
/* keep minimal; relies on sb-card system */
</style>
