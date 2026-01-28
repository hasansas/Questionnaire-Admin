<template>
  <div class="sb-questionnaire">
    <!-- @vue-generic {import('~/models/questionnaire').QuestionnaireModel} -->
    <SbResourceTableCard
      :key="tableKey"
      ref="tableRef"
      page-title="Questionnaires"
      page-subtitle="Manage questionnaires, scoring, meanings, and user info configuration."
      primary-text="Add questionnaire"
      primary-icon="lucide:plus"
      :store="qestionnaireStore"
      :columns="columns"
      search-placeholder="Search code, name"
      empty-icon="lucide:ticket-percent"
      empty-title="No questionnaire found"
      empty-subtitle="Create your first questionnaire."
      empty-primary-text="Add questionnaire"
      :build-query="buildQuery"
      :delete-action="handleDelete"
      delete-title="Delete questionnaire?"
      delete-label-key="code"
      enable-panel
      :panel-title="editorTitle"
      @primary="openCreate"
      @edit="openEdit"
      @empty:primary="openCreate"
    >
      <!-- Columns -->
      <template #item.questionnaire="{ item }">
        <div class="d-flex align-center ga-3">
          <v-avatar size="36" variant="tonal" rounded="lg" color="primary">
            <v-icon icon="lucide:clipboard-list" size="18" />
          </v-avatar>

          <div class="min-w-0">
            <div class="text-body-2 font-weight-bold text-truncate">
              {{ item.title }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ item.code }}
            </div>
          </div>
        </div>
      </template>

      <template #item.description="{ item }">
        <div class="text-body-2 text-truncate">
          {{ item.description || "-" }}
        </div>
      </template>

      <template #item.language="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          variant="tonal"
          class="text-uppercase"
        >
          {{ item.language || "-" }}
        </v-chip>
      </template>

      <template #item.status="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          variant="tonal"
          :color="
            item.status === 'published'
              ? 'success'
              : item.status === 'draft'
                ? 'warning'
                : 'secondary'
          "
        >
          {{ item.status || "-" }}
        </v-chip>
      </template>

      <template #item.version="{ item }">
        <div class="text-body-2">v{{ item.version ?? "-" }}</div>
      </template>

      <template #item.scoringType="{ item }">
        <div class="d-flex align-center ga-2">
          <v-icon
            :icon="
              item.scoringType === 'multi_dimension'
                ? 'lucide:layers'
                : 'lucide:sigma'
            "
            size="16"
            class="text-medium-emphasis"
          />
          <span class="text-body-2">
            {{
              item.scoringType === "multi_dimension"
                ? "Multi-dimension"
                : "Total score"
            }}
          </span>
        </div>
      </template>

      <template #item.showResultToUser="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          :variant="item.showResultToUser ? 'tonal' : 'outlined'"
          :color="item.showResultToUser ? 'success' : 'secondary'"
        >
          <v-icon
            :icon="item.showResultToUser ? 'lucide:eye' : 'lucide:eye-off'"
            size="14"
            class="mr-1"
          />
          {{ item.showResultToUser ? "Visible" : "Hidden" }}
        </v-chip>
      </template>

      <template #item.updatedAt="{ item }">
        <div class="text-caption text-medium-emphasis">
          {{ formatDateLabel(item.updatedAt) }}
        </div>
      </template>

      <template #actions="{ item }">
        <div class="d-flex justify-end ga-1">
          <v-btn
            icon
            variant="text"
            @click.stop.prevent="openDetail(item)"
            aria-label="View"
          >
            <v-icon icon="lucide:arrow-right" />
          </v-btn>

          <v-btn icon variant="text" aria-label="More actions">
            <v-icon icon="lucide:more-horizontal" />
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item
                  title="View details"
                  @click.stop.prevent="openDetail(item)"
                />
                <v-list-item title="Edit" />
                <v-list-item title="Delete" />
              </v-list>
            </v-menu>
          </v-btn>
        </div>
      </template>

      <!-- Filters -->
      <template #filters="{ draft, set }">
        <v-form @submit.prevent> Coming soon </v-form>
      </template>

      <!-- Panel content (Create/Edit form) -->
      <template #panel>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Configure questionnaire setup, scoring rules, and visibility.
        </div>

        <v-form ref="DataForm" @submit.prevent="onFormSubmit">
          <v-row dense>
            <!-- Basic -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2">Basic</div>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.title"
                label="Questionnaire Title"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.required, rules.min3]"
                prepend-inner-icon="lucide:clipboard-list"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
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
                class="mb-2"
              />
            </v-col>

            <!-- Meta -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2 mt-2">Meta</div>
            </v-col>

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
                class="mb-2"
              />
            </v-col>

            <v-col cols="12" md="6">
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
                class="mb-2"
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
                class="mb-2"
              />
            </v-col>

            <v-col cols="12" md="6">
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
                class="mb-2"
              />
            </v-col>

            <!-- Visibility -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2 mt-2">
                Visibility
              </div>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-3 h-100">
                <div class="text-body-2 font-weight-bold mb-2">
                  User Experience
                </div>

                <v-switch
                  v-model="form.showResultToUser"
                  inset
                  color="primary"
                  label="Show Result to User"
                  hide-details
                />
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </template>

      <template #panel-actions="{ close }">
        <v-tooltip text="Close" location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              variant="outlined"
              color="grey"
              size="small"
              v-bind="props"
              @click="close"
            >
              <v-icon size="20" icon="lucide:x" />
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Save" location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              variant="flat"
              color="primary"
              size="small"
              v-bind="props"
              :loading="saving"
              @click="handleSave(close)"
            >
              <v-icon size="20" icon="lucide:check" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </SbResourceTableCard>
  </div>
</template>

<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import {
  createDefaultQuestionnaire as createDefaultDataForm,
  normalizeQuestionnaire as normalizeData,
  type QuestionnaireModel,
} from "~/models/questionnaire";

import { formatDateLabel } from "~/utils/dateUtils";

definePageMeta({
  middleware: ["auth"],
  title: "Questionnaires",
  breadcrumbs: [{ title: "questionnaires", disabled: true }],
});

const snack = useAppSnackbar();
const qestionnaireStore = useqQestionnaireStore();

const tableKey = ref<number>(0);
const tableRef = ref<any>(null);

/** Table */
// Questionnaire table columns (match Questionnaire payload)
const columns: SbTableColumn<QuestionnaireModel>[] = [
  { title: "Questionnaire", key: "questionnaire", sortable: true }, // title + code
  { title: "Description", key: "description", sortable: false }, // short preview
  { title: "Language", key: "language", sortable: true }, // id/en
  { title: "Status", key: "status", sortable: true }, // draft/published/archived
  { title: "Version", key: "version", sortable: true }, // numeric
  { title: "Scoring", key: "scoringType", sortable: true }, // multi_dimension/total_score
  { title: "Result Visible", key: "showResultToUser", sortable: true }, // boolean chip
  { title: "Updated", key: "updatedAt", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" },
];

function buildQuery({
  search,
  filters,
}: {
  search: string;
  filters: Record<string, any>;
}) {
  const params = new URLSearchParams();

  const limit = Number(qestionnaireStore.data.pagination?.perPage ?? 10);
  params.set("limit", String(limit));

  const s = String(search ?? "").trim();
  if (s) params.set("search", s);

  if (filters?.type) params.set("type", filters.type);
  if (filters?.validity) params.set("validity", filters.validity);
  if (filters?.onlyWithUses) params.set("onlyWithUses", "1");

  const qs = params.toString();
  return qs ? qs : null;
}

async function handleDelete(item: QuestionnaireModel) {
  const res = await qestionnaireStore.remove(item.id as string);
  if (!res.success)
    throw new Error(res.error || "Failed to delete questionnaire");
  snack.open("questionnaire deleted", { color: "success" });
}

/** Panel form logic */
const editorMode = ref<"create" | "edit">("create");
const saving = ref(false);

const selectedId = ref<string | null>(null);
const selectedItem = ref<QuestionnaireModel | null>(null);

const editorTitle = computed(() =>
  editorMode.value === "create" ? "Create questionnaire" : "Edit questionnaire",
);

function openCreate() {
  handleOpenDataForm("create", null);
}
function openEdit(item: QuestionnaireModel) {
  handleOpenDataForm("edit", item);
}

function openDetail(item: QuestionnaireModel) {
  void navigateTo(`/Questionnaires/${item.id}`);
}

/** Data form */
const DataForm = ref<any>(null);
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
};

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

const form = ref({
  id: "",
  code: "",

  title: "",
  description: "",

  language: "id",
  status: "draft",
  version: 1,

  scoringType: "multi_dimension",
  showResultToUser: true,
});

async function handleOpenDataForm(
  mode: "create" | "edit",
  item: QuestionnaireModel | null,
) {
  editorMode.value = mode;
  selectedId.value = item?.id ?? null;
  selectedItem.value = item;

  const base = item ?? createDefaultDataForm();
  form.value = normalizeData(base) as any;

  await nextTick();
  if (mode === "edit") DataForm.value?.resetValidation?.();

  tableRef.value?.openPanel?.();
}

function onFormSubmit(_e: SubmitEventPromise) {
  void handleSave(); // no close here
}

async function handleSave(close?: () => void) {
  const { valid } = await DataForm.value?.validate?.();
  if (!valid) return;

  saving.value = true;

  try {
    const payload: Partial<QuestionnaireModel> =
      form.value as Partial<QuestionnaireModel>;

    if (editorMode.value === "create") {
      const res = await qestionnaireStore.create(payload as any);
      if (!res.success)
        throw new Error(res.error || "Failed to create questionnaire");
      snack.open("questionnaire created", { color: "success" });
    } else if (editorMode.value === "edit" && selectedId.value) {
      if (!selectedItem.value)
        throw new Error("Selected questionnaire is missing for update.");

      const updatePayload = {
        ...selectedItem.value,
        ...payload,
      } as any;
      const res = await qestionnaireStore.update(
        selectedId.value,
        updatePayload,
      );
      if (!res.success)
        throw new Error(res.error || "Failed to update questionnaire");
      snack.open("questionnaire updated", { color: "success" });
    }

    selectedId.value = null;
    selectedItem.value = null;

    close?.();
    tableRef.value?.refresh?.({ reset: true });
  } catch (e: any) {
    snack.open(e?.message || "Failed to save questionnaire", {
      color: "error",
    });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  // Initialize form or fetch data if needed
});
</script>
