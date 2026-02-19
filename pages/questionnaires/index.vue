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
      delete-label="title"
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

      <template #item.optionsMode="{ item }">
        <div class="d-flex align-center ga-2">
          <v-icon
            :icon="
              item.optionsMode === 'fixed' ? 'lucide:lock' : 'lucide:split'
            "
            size="16"
            class="text-medium-emphasis"
          />
          <span class="text-body-2">
            {{ item.optionsMode === "fixed" ? "Fixed" : "Per-question" }}
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
          <v-btn icon variant="text" @click.stop.prevent="openDetail(item)">
            <v-icon icon="lucide:eye" size="18" />
          </v-btn>
          <v-btn icon variant="text" @click.stop.prevent="openEdit(item)">
            <v-icon icon="lucide:pencil" size="18" />
          </v-btn>

          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn icon variant="text" v-bind="props">
                <v-icon icon="lucide:more-horizontal" size="18" />
              </v-btn>
            </template>
            <v-list density="comfortable" rounded="xl" class="sb-list">
              <v-list-item @click="openDuplicate(item)">
                <template #prepend
                  ><v-icon icon="lucide:copy" size="18"
                /></template>
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>
              <v-list-item @click="openArchive(item)">
                <template #prepend
                  ><v-icon icon="lucide:archive" size="18"
                /></template>
                <v-list-item-title>Archive</v-list-item-title>
              </v-list-item>
              <v-divider />
              <v-list-item class="text-error" @click="openDeleteDialog(item)">
                <template #prepend
                  ><v-icon icon="lucide:trash-2" size="18"
                /></template>
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </template>

      <!-- Filters -->
      <template #filters="{ draft, set }">
        <v-form @submit.prevent> Coming soon </v-form>
      </template>

      <!-- Panel content (Create/Edit form) -->
      <template #panel>
        <QuestionnaireForm
          ref="DataForm"
          v-model="form"
          @submit.prevent="onFormSubmit"
        />
      </template>

      <template #panel-actions="{ close }">
        <!-- <v-btn color="primary" rounded="lg" @click="submit">
          Create questionnaire
        </v-btn> -->
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
import type { QuestionnaireFormModel } from "~/models/questionnaire";
import QuestionnaireForm from "@/components/questionnaire/QuestionnaireForm.vue";

definePageMeta({
  middleware: ["auth"],
  title: "Questionnaires",
  breadcrumbs: [{ title: "Questionnaires", disabled: true }],
});

const snack = useAppSnackbar();
const qestionnaireStore = useqQestionnaireStore();

const tableKey = ref<number>(0);
const tableRef = ref<any>(null);

/** Table */
// Questionnaire table columns (match Questionnaire payload)
const columns: SbTableColumn<QuestionnaireModel>[] = [
  { title: "Questionnaire", key: "questionnaire", sortable: true },
  { title: "Description", key: "description", sortable: false },
  { title: "Language", key: "language", sortable: true },
  { title: "Scoring", key: "scoringType", sortable: true },
  { title: "Options Mode", key: "optionsMode", sortable: true },
  { title: "Result Visible", key: "showResultToUser", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Version", key: "version", sortable: true },
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

function openDuplicate(item: QuestionnaireModel) {
  console.log("openDuplicate");
}
function openArchive(item: QuestionnaireModel) {
  console.log("openArchive");
}
function openDeleteDialog(item: QuestionnaireModel) {
  tableRef.value?.openDeleteDialog(item);
}

/** Data form */
const DataForm = ref<InstanceType<typeof QuestionnaireForm> | null>(null);
const form = ref<QuestionnaireFormModel>({
  id: "",

  title: "",
  description: "",

  language: "",
  status: "",
  version: 0,

  scoringType: "",
  showResultToUser: true,

  // options setup
  optionsMode: null,
  fixedOptionsJson: [],
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
  DataForm.value?.resetValidation?.();

  tableRef.value?.openPanel?.();
}

function onFormSubmit(_e: SubmitEventPromise) {
  void handleSave(); // no close here
}

async function handleSave(close?: () => void) {
  const validateForm = await DataForm.value?.validateAll?.();
  if (!validateForm?.valid) return;

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

      const res = await qestionnaireStore.update(
        selectedId.value,
        payload as any,
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
