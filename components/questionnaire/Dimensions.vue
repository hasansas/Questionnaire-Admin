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
          @click="fetchData()"
        >
          Retry
        </v-btn>
      </div>

      <!-- Loading (first load) -->
      <SbSkeletonTable
        v-else-if="uiState.loading"
        :show-header="false"
        :showTableHeader="false"
      />

      <!-- Empty -->
      <div v-else-if="dataRows?.length === 0" class="pa-10 text-center">
        <slot name="empty">
          <v-avatar
            size="56"
            rounded="xl"
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon icon="lucide:inbox" size="26" />
          </v-avatar>

          <div class="text-h6 font-weight-black mb-1">No data found</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            No results yet. Start by adding first dimension
          </div>

          <v-btn color="primary" rounded="lg" prepend-icon="lucide:plus">
            New dimension
          </v-btn>
        </slot>
      </div>

      <!-- Data -->
      <template v-else>
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
                @click="openCreateDialog"
              >
                New dimension
              </v-btn>
            </div>
          </div>
        </div>

        <div class="d-flex flex-column ga-3 mt-4 px-4">
          <v-card
            v-for="d in dataRows"
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
                    <div class="text-body-2 font-weight-black text-capitalize">
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
                  aria-label="Edit dimension"
                  @click="openEditDialog(d)"
                >
                  <v-icon icon="lucide:pencil" size="18" />
                </v-btn>

                <!-- Simple confirm delete via menu -->
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  aria-label="Delete dimension"
                  @click="openDeleteDialog(d)"
                >
                  <v-icon icon="lucide:trash" size="18" />
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </template>
    </v-card>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialogOpen" max-width="560" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-start ga-3">
          <div class="min-w-0">
            <div class="text-h6 font-weight-black">
              {{ formMode === "create" ? "New dimension" : "Edit dimension" }}
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              {{
                formMode === "create"
                  ? "Add a scoring dimension."
                  : "Update dimension details."
              }}
            </div>
          </div>
        </v-card-title>

        <v-card-text class="px-5 pt-2 pb-4">
          <v-form ref="formRef" @submit.prevent="submitData">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model.trim="form.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  prepend-inner-icon="lucide:type"
                  :rules="[rules.required, rules.min2]"
                  hide-details="auto"
                  placeholder="Example: Visual"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model.trim="form.description"
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
                <v-card rounded="lg" variant="tonal" class="pa-3" color="grey">
                  <div class="d-flex align-center ga-4">
                    <v-icon icon="lucide:info" size="16" class="mt-1" />
                    <div class="min-w-0">
                      <div class="text-caption text-medium-emphasis mt-1">
                        Keep descriptions short and consistent.
                      </div>
                    </div>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

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
            @click="submitData"
          >
            {{ formMode === "create" ? "Create" : "Save changes" }}
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialogOpen" persistent max-width="520">
      <v-card rounded="xl">
        <v-card-title class="pa-5 pb-3">
          <div class="d-flex align-center ga-4">
            <v-avatar size="44" rounded="lg" color="error" variant="tonal">
              <v-icon icon="lucide:trash-2" size="18" />
            </v-avatar>

            <div class="min-w-0 flex-1">
              <div class="text-subtitle-1 font-weight-black">
                Delete dimension?
              </div>
              <div class="text-caption text-medium-emphasis">
                This action can’t be undone.
              </div>
            </div>
          </div>
        </v-card-title>

        <v-card-text class="px-5 pt-2 pb-4">
          <div class="text-body-2 text-medium-emphasis mb-2">
            You’re about to delete:
          </div>

          <v-card rounded="lg" variant="tonal" class="pa-3" color="grey">
            <div class="d-flex align-start ga-3">
              <v-icon icon="lucide:alert-triangle" size="16" class="mt-1" />

              <div class="min-w-0">
                <div
                  class="text-body-2 font-weight-bold text-truncate text-capitalize"
                >
                  <pre>{{ deleteTarget.name }}</pre>
                </div>

                <div class="text-caption text-medium-emphasis text-truncate">
                  <pre>{{ deleteTarget.id }}</pre>
                </div>
              </div>
            </div>
          </v-card>
        </v-card-text>

        <v-divider class="sb-divider" />

        <div class="px-5 py-4 d-flex justify-end ga-2">
          <v-btn
            variant="tonal"
            rounded="lg"
            :disabled="deleting"
            @click="deleteDialogOpen = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="error"
            rounded="lg"
            :loading="deleting"
            @click="confirmDelete"
          >
            <v-icon icon="lucide:trash-2" size="16" class="me-2" />
            Delete
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { QuestionnaireModel } from "~/models/questionnaire";
import type {
  QuestionnaireDimensionModel,
  QuestionnaireDimensionFormModel,
} from "~/models/questionnaire-dimension";
import { formatDateLabel } from "~/utils/dateUtils";

const snack = useAppSnackbar();

const props = defineProps<{
  model: QuestionnaireModel;
}>();
const questionnaireId = props.model?.id;

const dimensionStore = useQuestionnaireDimensionStore(questionnaireId);

const uiState = reactive({
  loading: false,
  loaded: false,
  error: false,
  errorTitle: `Couldn’t load data`,
  errorMessage: "",
  search: "",
});

const dataRows = computed(() => {
  const currentPage = dimensionStore?.data?.pagination.currentPage;
  const rows =
    dimensionStore?.data?.rows && dimensionStore?.data?.rows.length > 0
      ? dimensionStore?.data?.rows[currentPage - 1]
      : null;
  return rows;
});

// Form
type FormMode = "create" | "edit";

const dialogOpen = ref(false);
const formMode = ref<FormMode>("create");
const saving = ref(false);
const dialogError = ref("");

const formRef = ref<any>(null);

const form = ref({
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

// Methods
async function fetchData() {
  uiState.loading = true;

  const res = await dimensionStore.fetchAll({ query: "limit=100" });

  uiState.loading = false;
  uiState.loaded = true;

  if (!res.success) {
    uiState.error = true;
    uiState.errorMessage = "Failed to fetch dimensions";
    return;
  }
}

function resetDialogState() {
  dialogError.value = "";
  form.value = {
    id: "",
    key: "",
    name: "",
    description: "",
    sortOrder: 1,
  };
  nextTick(() => formRef.value?.resetValidation?.());
}

function openCreateDialog() {
  formMode.value = "create";
  resetDialogState();
  dialogOpen.value = true;
}

function openEditDialog(item: QuestionnaireDimensionModel) {
  formMode.value = "edit";
  dialogError.value = "";
  form.value = {
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

async function submitData() {
  dialogError.value = "";

  const res = await formRef.value?.validate?.();
  if (!res?.valid) return;

  saving.value = true;
  try {
    const payloadItem: QuestionnaireDimensionFormModel = {
      ...(formMode.value === "edit" ? { id: form.value.id } : { id: "" }),
      name: String(form.value.name).trim(),
      description: String(form.value.description).trim(),
    };

    if (formMode.value === "create") {
      const res = await dimensionStore.create(payloadItem);

      if (!res.success) {
        return snack.open("Failed to save dimension", { color: "error" });
      }
      snack.open("Dimension created", { color: "success" });
    } else {
      const res = await dimensionStore.update(form.value.id, payloadItem);

      if (!res.success) {
        return snack.open("Failed to updated dimension", { color: "error" });
      }
      snack.open("Dimension updated", { color: "success" });
    }
    closeDialog();
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save dimension";

    return snack.open(errorMsg, { color: "error" });
  } finally {
    saving.value = false;
  }
}

// Delete
const deleteDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const deleting = ref(false);

function openDeleteDialog(item: any) {
  deleteTarget.value = item;
  deleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;
  deleting.value = true;
  try {
    const target = deleteTarget.value;
    //   console.log("target", target);
    const res = await dimensionStore.remove(target.id);
    //   // const res = await dimensionStore.deleteItem()
    // if (!res.success) snack.open("Dimension created", { color: "success" });

    if (!res.success) {
      return snack.open("Failed to delete dimension", { color: "error" });
    }
    snack.open("Dimension deleted", { color: "success" });
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to delete dimension";

    return snack.open(errorMsg, { color: "error" });
  } finally {
    deleting.value = false;
    deleteDialogOpen.value = false;
  }
}

onMounted(() => fetchData());
</script>
