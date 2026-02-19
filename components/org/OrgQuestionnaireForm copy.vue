<!-- /components/OrgQuestionnaireForm.vue -->
<template>
  <v-card rounded="xl" class="border">
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-card-text class="pa-6">
        <v-row dense>
          <!-- Questionnaire Select (search + infinite scroll) -->
          <v-col cols="12">
            <v-autocomplete
              v-model="form.questionnaireId"
              :items="qnrItems"
              :item-title="itemTitle"
              item-value="id"
              label="Questionnaire"
              placeholder="Search questionnaire..."
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              clearable
              :loading="qnrLoading"
              :disabled="isEdit"
              :rules="isEdit ? [] : [rules.required]"
              :menu-props="{ maxHeight: 360 }"
              @update:search="onSearch"
              @update:menu="onMenuChange"
            >
              <!-- item row -->
              <template #item="{ props, item }">
                <v-list-item
                  v-bind="props"
                  :title="item.raw.title"
                  :subtitle="itemSubtitle(item.raw)"
                >
                  <template #append>
                    <v-chip size="x-small" variant="tonal" class="text-caption">
                      {{ item.raw.code }}
                    </v-chip>
                  </template>
                </v-list-item>
              </template>

              <!-- selected -->
              <template #selection="{ item }">
                <div class="d-flex align-center ga-2">
                  <div class="font-weight-medium">{{ item.raw.title }}</div>
                  <v-chip size="x-small" variant="tonal" class="text-caption">{{
                    item.raw.code
                  }}</v-chip>
                </div>
              </template>

              <!-- bottom sentinel inside menu for infinite scroll -->
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

          <!-- Assignment description -->
          <v-col cols="12">
            <v-textarea
              v-model="form.description"
              label="Description (internal)"
              placeholder="e.g., Internal leadership assessment for Q1 onboarding"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              rows="2"
            />
          </v-col>

          <!-- Switches -->
          <v-col cols="12" md="4">
            <v-checkbox
              v-model="form.isActive"
              label="Active"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-checkbox
              v-model="form.isPublic"
              label="Public"
              density="comfortable"
              hide-details="auto"
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model.number="form.sortOrder"
              type="number"
              min="0"
              label="Sort order"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
            />
          </v-col>

          <!-- Meta editor -->
          <v-col cols="12">
            <div class="text-subtitle-2 font-weight-bold mb-2">Meta</div>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.metaJson.customTitle"
                  label="Custom title"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details="auto"
                  placeholder="e.g., Leadership Assessment 2026"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-checkbox
                  v-model="form.metaJson.requireManagerApproval"
                  label="Require manager approval"
                  density="comfortable"
                  hide-details="auto"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="form.metaJson.introText"
                  label="Intro text"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  hide-details="auto"
                  rows="3"
                  placeholder="Short instruction text shown to users."
                />
              </v-col>
            </v-row>
          </v-col>

          <!-- Preview links (edit only) -->
          <v-col cols="12" v-if="isEdit">
            <v-divider class="my-2" />
            <div class="d-flex flex-column ga-2">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">Share URL</div>
                  <div class="text-body-2">{{ form.shareUrl || "-" }}</div>
                </div>
                <div class="d-flex ga-1">
                  <v-btn
                    size="small"
                    variant="text"
                    :disabled="!form.shareUrl"
                    @click="form.shareUrl && copy(form.shareUrl)"
                  >
                    <v-icon start icon="lucide:copy" />
                    Copy
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    :disabled="!form.shareUrl"
                    :href="form.shareUrl || undefined"
                    target="_blank"
                    rel="noopener"
                  >
                    <v-icon start icon="lucide:external-link" />
                    Open
                  </v-btn>
                </div>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Public URL
                  </div>
                  <div class="text-body-2">{{ form.publicUrl || "-" }}</div>
                </div>
                <div class="d-flex ga-1">
                  <v-btn
                    size="small"
                    variant="text"
                    :disabled="!form.publicUrl"
                    @click="form.publicUrl && copy(form.publicUrl)"
                  >
                    <v-icon start icon="lucide:copy" />
                    Copy
                  </v-btn>
                  <v-btn
                    size="small"
                    variant="text"
                    :disabled="!form.publicUrl"
                    :href="form.publicUrl || undefined"
                    target="_blank"
                    rel="noopener"
                  >
                    <v-icon start icon="lucide:external-link" />
                    Open
                  </v-btn>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useNuxtApp } from "#app";

type QnrSelectRow = {
  id: string;
  code: string;
  title: string;
  description?: string | null;
};

type QnrSelectResponse = {
  status: string;
  message: string;
  data: {
    rows: QnrSelectRow[];
    pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage: number;
      nextPage: number | null;
      prevPage: number | null;
    };
  };
};

const props = defineProps<{
  // modelValue: boolean;
  organizationId: string;

  /**
   * When editing, pass assignmentId + initial payload.
   * When adding, assignmentId can be null and initial can be empty.
   */
  assignmentId?: string | null;

  initial?: Partial<{
    questionnaireId: string;
    description: string | null;
    isActive: boolean;
    isPublic: boolean;
    sortOrder: number;
    metaJson: {
      introText?: string;
      customTitle?: string;
      requireManagerApproval?: boolean;
      [k: string]: any;
    } | null;
    shareUrl: string | null;
    publicUrl: string | null;
  }>;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "saved"): void;
}>();

const api = useApiService();
const snack = useAppSnackbar();

const isEdit = computed(() => !!props.assignmentId);

const saving = ref(false);
const formRef = ref<any>(null);

// ---- form model
const form = ref({
  questionnaireId: props.initial?.questionnaireId ?? "",
  description: props.initial?.description ?? null,
  isActive: props.initial?.isActive ?? true,
  isPublic: props.initial?.isPublic ?? true,
  sortOrder: props.initial?.sortOrder ?? 1,
  metaJson: {
    introText: props.initial?.metaJson?.introText ?? "",
    customTitle: props.initial?.metaJson?.customTitle ?? "",
    requireManagerApproval:
      props.initial?.metaJson?.requireManagerApproval ?? false,
  } as any,
  // edit-only preview fields (optional)
  shareUrl: props.initial?.shareUrl ?? null,
  publicUrl: props.initial?.publicUrl ?? null,
});

watch(
  () => props.initial,
  (v) => {
    if (!v) return;
    form.value.questionnaireId = v.questionnaireId ?? "";
    form.value.description = v.description ?? null;
    form.value.isActive = v.isActive ?? true;
    form.value.isPublic = v.isPublic ?? true;
    form.value.sortOrder = v.sortOrder ?? 1;
    form.value.metaJson = {
      introText: v.metaJson?.introText ?? "",
      customTitle: v.metaJson?.customTitle ?? "",
      requireManagerApproval: v.metaJson?.requireManagerApproval ?? false,
    };
    form.value.shareUrl = v.shareUrl ?? null;
    form.value.publicUrl = v.publicUrl ?? null;
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
    const res = await api.get("questionnaires", {
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

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    snack.open("Copied to clipboard.", { color: "success" });
  } catch {
    snack.open("Copy failed.", { color: "error" });
  }
}

async function handleSubmit() {
  // const res = await formRef.value?.validate?.();
  // if (res?.valid === false) return;
  // saving.value = true;
  // try {
  //   const body = {
  //     // for create
  //     questionnaireId: form.value.questionnaireId,
  //     // shared fields
  //     description: form.value.description,
  //     isActive: form.value.isActive,
  //     isPublic: form.value.isPublic,
  //     sortOrder: form.value.sortOrder,
  //     metaJson: {
  //       introText: form.value.metaJson?.introText || undefined,
  //       customTitle: form.value.metaJson?.customTitle || undefined,
  //       requireManagerApproval: !!form.value.metaJson?.requireManagerApproval,
  //     },
  //   };
  //   if (isEdit.value) {
  //     // PATCH /v1/organizations/:id/questionnaires/:assignmentId
  //     await $fetch(
  //       `/v1/organizations/${props.organizationId}/questionnaires/${props.assignmentId}`,
  //       {
  //         method: "PATCH",
  //         body: {
  //           description: body.description,
  //           isActive: body.isActive,
  //           isPublic: body.isPublic,
  //           sortOrder: body.sortOrder,
  //           metaJson: body.metaJson,
  //         },
  //       },
  //     );
  //     snack.open("Saved changes.", { color: "success" });
  //   } else {
  //     // POST /v1/organizations/:id/questionnaires
  //     await $fetch(`/v1/organizations/${props.organizationId}/questionnaires`, {
  //       method: "POST",
  //       body,
  //     });
  //     snack.open("Questionnaire assigned.", { color: "success" });
  //   }
  //   emit("saved");
  //   handleClose();
  // } catch (e) {
  //   snack.open("Failed to save.", { color: "error" });
  // } finally {
  //   saving.value = false;
  // }
}
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.sentinel {
  height: 1px;
}
</style>
