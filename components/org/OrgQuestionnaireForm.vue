<!-- /components/OrgQuestionnaireForm.vue -->
<!-- 
Usage example (parent):
<OrgQuestionnaireForm
  v-model="dialogs.form"
  :organization-id="organizationId"
  :assignment-id="editing?.assignmentId || null"
  :initial="editing?.initial"
  @saved="store.fetch()"
/>
Add mode: assignment-id = null, initial can be empty
Edit mode: pass assignment-id + initial payload (questionnaireId optional if you don't allow changing)
-->

<template>
  <v-dialog v-model="openLocal" max-width="720" persistent>
    <v-card rounded="xl" class="border">
      <!-- Header -->
      <v-card-title class="d-flex align-center ga-3">
        <v-avatar
          size="40"
          rounded="lg"
          :color="!isEdit ? 'primary' : 'info'"
          variant="tonal"
        >
          <v-icon :icon="!isEdit ? 'lucide:plus' : 'lucide:pencil'" size="18" />
        </v-avatar>

        <div class="min-w-0">
          <div class="text-h6 font-weight-black">
            {{ isEdit ? "Edit Questionnaire" : "Add Questionnaire" }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Configure question text, requirement, and scoring behavior.
          </div>
        </div>
      </v-card-title>

      <v-divider />

      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-card-text class="pa-6">
          <v-row dense>
            <!-- Questionnaire Select (search + infinite scroll) -->
            <v-col cols="12" class="mb-2">
              <v-autocomplete
                v-model="form.questionnaireId"
                :items="qnrItems"
                :item-title="itemTitle"
                item-value="id"
                label="Select questionnaire"
                placeholder="Search by title or code..."
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                clearable
                :loading="qnrLoading"
                :disabled="isEdit"
                :rules="isEdit ? [] : [rules.required]"
                :menu-props="{ maxHeight: 360 }"
                prepend-inner-icon="lucide:search"
                @update:search="onSearch"
                @update:menu="onMenuChange"
              >
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.title"
                    :subtitle="itemSubtitle(item.raw)"
                  >
                    <template #prepend>
                      <v-avatar
                        size="28"
                        rounded="lg"
                        color="primary"
                        variant="tonal"
                      >
                        <v-icon icon="lucide:clipboard-check" size="14" />
                      </v-avatar>
                    </template>

                    <template #append>
                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-caption"
                      >
                        {{ item.raw.code }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>

                <template #selection="{ item }">
                  <div class="d-flex align-center ga-2 min-w-0">
                    <v-avatar
                      size="24"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:clipboard-check" size="12" />
                    </v-avatar>

                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold truncate">
                        {{ item.raw.title }}
                      </div>
                      <div class="text-caption text-medium-emphasis truncate">
                        {{ item.raw.code }}
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Infinite scroll sentinel -->
                <template #append-item>
                  <div class="px-3 pb-3">
                    <div ref="sentinelEl" class="sentinel" />
                    <div
                      v-if="qnrLoadingMore"
                      class="d-flex align-center ga-2 text-caption text-medium-emphasis"
                    >
                      <v-progress-circular indeterminate size="16" />
                      Loading more...
                    </div>
                    <div
                      v-else-if="!qnrHasMore"
                      class="text-caption text-medium-emphasis"
                    >
                      No more results.
                    </div>
                  </div>
                </template>
              </v-autocomplete>
            </v-col>

            <!-- Description -->
            <v-col cols="12" class="mb-2">
              <v-textarea
                v-model="form.description"
                label="Description"
                placeholder="e.g., Internal leadership assessment for Q1 onboarding"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                rows="2"
                prepend-inner-icon="lucide:align-left"
              />
            </v-col>

            <!-- Settings cards (switch-based, like your pattern) -->
            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="d-flex align-center justify-space-between ga-4">
                  <div class="d-flex align-center ga-3 min-w-0">
                    <v-avatar
                      size="36"
                      rounded="lg"
                      color="success"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:activity" size="18" />
                    </v-avatar>

                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">Active</div>
                      <div class="text-caption text-medium-emphasis">
                        Show this assignment in the organization list.
                      </div>
                    </div>
                  </div>

                  <v-switch
                    v-model="form.isActive"
                    inset
                    color="success"
                    hide-details
                  />
                </div>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-4">
                <div class="d-flex align-center justify-space-between ga-4">
                  <div class="d-flex align-center ga-3 min-w-0">
                    <v-avatar
                      size="36"
                      rounded="lg"
                      color="info"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:globe" size="18" />
                    </v-avatar>

                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">Public</div>
                      <div class="text-caption text-medium-emphasis">
                        Allow anyone with the public link to access.
                      </div>
                    </div>
                  </div>

                  <v-switch
                    v-model="form.isPublic"
                    inset
                    color="info"
                    hide-details
                  />
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <!-- Actions -->
        <v-card-actions class="px-6 py-4 d-flex justify-end ga-2">
          <v-btn
            variant="text"
            rounded="lg"
            :disabled="saving"
            @click="handleClose"
            class="px-4"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="saving"
            @click="handleSave"
            class="px-4"
          >
            <v-icon start :icon="isEdit ? 'lucide:save' : 'lucide:plus'" />
            {{ isEdit ? "Save changes" : "Add" }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import {
  normalizeOrganizationQuestionnaire,
  type OrganizationQuestionnaireModel,
} from "~/models/organization-questionnaire";

type QnrSelectRow = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
};

const props = defineProps<{
  modelValue: boolean;
  organizationId: string;
  selectedItem?: OrganizationQuestionnaireModel | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "saved"): void;
}>();

const api = useApiService();
const snack = useAppSnackbar();
const orgQuestionnairesStore = useOrganizationQuestionnairesStore(
  props.organizationId,
);

const openLocal = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const isEdit = computed(() => !!props.selectedItem);

const saving = ref(false);
const formRef = ref<any>(null);

// ---- form model
const form = ref({
  questionnaireId: props.selectedItem?.questionnaire.id ?? "",
  description: props.selectedItem?.description ?? null,
  isActive: props.selectedItem?.isActive ?? false,
  isPublic: props.selectedItem?.isPublic ?? false,
  sortOrder: props.selectedItem?.sortOrder ?? 1,
  metaJson: {
    introText: props.selectedItem?.metaJson?.introText ?? "",
    customTitle: props.selectedItem?.metaJson?.customTitle ?? "",
    requireManagerApproval:
      props.selectedItem?.metaJson?.requireManagerApproval ?? false,
  } as any,
  // edit-only preview fields (optional)
  shareUrl: props.selectedItem?.shareUrl ?? null,
  publicUrl: props.selectedItem?.publicUrl ?? null,
});

watch(
  () => props.selectedItem,
  (v) => {
    form.value.questionnaireId = v?.questionnaire.id ?? "";
    form.value.description = v?.description ?? null;
    form.value.isActive = v?.isActive ?? false;
    form.value.isPublic = v?.isPublic ?? false;
    form.value.sortOrder = v?.sortOrder ?? 1;
    form.value.metaJson = {
      introText: v?.metaJson?.introText ?? "",
      customTitle: v?.metaJson?.customTitle ?? "",
      requireManagerApproval: v?.metaJson?.requireManagerApproval ?? false,
    };
    form.value.shareUrl = v?.shareUrl ?? null;
    form.value.publicUrl = v?.publicUrl ?? null;
  },
  { deep: true },
);

// ---- rules
const rules = {
  required: (v: any) => (!!v ? true : "Required"),
};

// ---- questionnaire select (search + infinite scroll)
const qnrItems = ref<QnrSelectRow[]>([]);
const qnrLoading = ref(false);
const qnrLoadingMore = ref(false);

const qnrPage = ref(1);
const qnrHasMore = ref(true);
const qnrSearch = ref("");
let qnrSearchTimer: any = null;

const sentinelEl = ref<HTMLElement | null>(null);
let io: IntersectionObserver | null = null;
const menuOpen = ref(false);

function itemTitle(item: QnrSelectRow) {
  return item?.title ?? "-";
}

function itemSubtitle(item: QnrSelectRow) {
  return item?.description ? item.description : "No description";
}

async function fetchQnrSelect(opts?: { reset?: boolean }) {
  const reset = !!opts?.reset;
  if (qnrLoading.value || qnrLoadingMore.value) return;

  if (reset) {
    qnrPage.value = 1;
    qnrHasMore.value = true;
    qnrItems.value = [];
  }
  if (!qnrHasMore.value) return;

  const isFirst = qnrPage.value === 1;
  if (isFirst) qnrLoading.value = true;
  else qnrLoadingMore.value = true;

  try {
    const res = await api.get("/v1/questionnaires", {
      query: {
        scope: "select",
        page: 1,
        limit: 100,
        search: qnrSearch.value || undefined,
      },
    });

    if (!res.success) {
      const message = res.error || "Failed to load questionnaires";
      snack.open(message, { color: "error" });
      return;
    }

    const rows = res?.data?.rows ?? [];
    const nextPage = res?.data?.pagination?.nextPage ?? null;

    qnrItems.value = reset ? rows : [...qnrItems.value, ...rows];
    qnrHasMore.value = nextPage !== null && rows.length > 0;
    if (nextPage !== null) qnrPage.value = nextPage;
  } catch (e) {
    snack.open("Failed to load questionnaires.", { color: "error" });
    qnrHasMore.value = false;
  } finally {
    qnrLoading.value = false;
    qnrLoadingMore.value = false;
  }
}

function onSearch(v: string) {
  qnrSearch.value = v;
  clearTimeout(qnrSearchTimer);
  qnrSearchTimer = setTimeout(() => {
    fetchQnrSelect({ reset: true });
  }, 300);
}

async function onMenuChange(v: boolean) {
  menuOpen.value = v;
  if (!v) return;

  // first open -> fetch initial data
  if (!qnrItems.value.length) await fetchQnrSelect({ reset: true });

  await nextTick();
  setupObserver();
}

function setupObserver() {
  cleanupObserver();
  if (!sentinelEl.value) return;
  if (!menuOpen.value) return;

  io = new IntersectionObserver(
    async (entries) => {
      const hit = entries.some((e) => e.isIntersecting);
      if (!hit) return;
      if (!qnrHasMore.value) return;
      await fetchQnrSelect();
    },
    { root: null, threshold: 0.1 },
  );

  io.observe(sentinelEl.value);
}

function cleanupObserver() {
  if (io) {
    io.disconnect();
    io = null;
  }
}

onBeforeUnmount(() => {
  cleanupObserver();
  clearTimeout(qnrSearchTimer);
});

// ---- actions
function handleClose() {
  openLocal.value = false;
}

async function handleSave() {
  const res = await formRef.value?.validate?.();
  if (res?.valid === false) return;

  saving.value = true;
  try {
    const body = {
      // for create
      questionnaireId: form.value.questionnaireId,
      // shared fields
      description: form.value.description,
      isActive: form.value.isActive,
      isPublic: form.value.isPublic,
      sortOrder: form.value.sortOrder,
      metaJson: {
        introText: form.value.metaJson?.introText || undefined,
        customTitle: form.value.metaJson?.customTitle || undefined,
        requireManagerApproval: !!form.value.metaJson?.requireManagerApproval,
      },
    };

    if (isEdit.value) {
      if (!props.selectedItem?.id) {
        snack.open("Missing assignment ID for edit.", { color: "error" });
        return;
      }

      const res = await api.patch(
        `/v1/organizations/${props.organizationId}/questionnaires/${props.selectedItem.id}`,
        {
          description: body.description,
          isActive: body.isActive,
          isPublic: body.isPublic,
        },
      );

      if (!res.success) {
        const message = res.error || "Failed to save changes";
        snack.open(message, { color: "error" });
        return;
      }

      const item: OrganizationQuestionnaireModel =
        normalizeOrganizationQuestionnaire(res.data);
      orgQuestionnairesStore.editItem(item);

      snack.open("Saved changes.", { color: "success" });
    } else {
      const res = await api.post(
        `/v1/organizations/${props.organizationId}/questionnaires`,
        {
          questionnaireId: body.questionnaireId,
          description: body.description,
          isActive: body.isActive,
          isPublic: body.isPublic,
        },
      );

      if (!res.success) {
        const message = res.error || "Failed to add questionnaire";
        snack.open(message, { color: "error" });
        return;
      }

      const item: OrganizationQuestionnaireModel =
        normalizeOrganizationQuestionnaire(res.data);
      orgQuestionnairesStore.addItem(item);

      snack.open("Questionnaire added.", { color: "success" });
    }

    handleClose();
  } catch (e) {
    snack.open("Failed to save.", { color: "error" });
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchQnrSelect();
});
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.sentinel {
  height: 1px;
}
</style>
