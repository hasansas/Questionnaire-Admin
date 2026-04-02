<template>
  <div class="sb-email-templates">
    <!-- Header -->
    <AdminPageHeader
      title="Email Templates"
      subtitle="Manage reusable email content and sender settings"
    >
      <template #actions>
        <v-btn color="primary" rounded="lg" prepend-icon="lucide:plus" disabled>
          Add Template
        </v-btn>
      </template>
    </AdminPageHeader>

    <!-- Content states -->
    <v-card rounded="xl" variant="outlined" class="sb-card">
      <v-card-text class="pa-0">
        <!-- Loading -->
        <div v-if="isFetching && !isDataLoaded" class="pa-4">
          <v-skeleton-loader type="table" />
        </div>

        <!-- Error -->
        <div v-else-if="isFetchingError" class="pa-10 text-center">
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
            Couldn’t load templates
          </div>

          <div class="text-body-2 text-medium-emphasis mb-5">
            {{
              errorMsg ||
              "Something went wrong while fetching email templates. Please try again."
            }}
          </div>

          <div class="d-flex justify-center ga-2 flex-wrap">
            <v-btn
              color="primary"
              rounded="lg"
              prepend-icon="lucide:refresh-cw"
              :loading="isFetching"
              @click="fetchData"
            >
              Retry
            </v-btn>

            <v-btn
              variant="tonal"
              rounded="lg"
              prepend-icon="lucide:message-circle-warning"
            >
              Contact Support
            </v-btn>
          </div>

          <div class="text-caption text-medium-emphasis mt-6">
            If this keeps happening, check your connection or try again in a
            moment.
          </div>
        </div>

        <!-- Empty -->
        <div
          v-else-if="dataPagination.total === 0 && search === ''"
          class="pa-10 text-center"
        >
          <v-avatar
            size="56"
            rounded="xl"
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon icon="lucide:mail" size="26" />
          </v-avatar>
          <div class="text-h6 font-weight-black mb-1">No templates found</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            Create your first template to start sending polished transactional
            emails.
          </div>
          <v-btn color="primary" rounded="lg" prepend-icon="lucide:plus">
            Add Template
          </v-btn>
        </div>

        <!-- Data -->
        <v-card v-else variant="flat">
          <div class="sb-table-card__head">
            <v-spacer />
            <v-form
              ref="loginForm"
              @submit.prevent="fetchData({ reset: true })"
            >
              <v-text-field
                v-model="search"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                placeholder="Search name, subject"
                class="sb-search-form"
                clearable
                @click:clear="fetchData({ reset: true })"
              >
                <template #prepend-inner>
                  <v-icon
                    icon="lucide:search"
                    size="18"
                    class="text-medium-emphasis"
                  />
                </template>
              </v-text-field>
            </v-form>

            <v-btn rounded="lg" variant="outlined" color="primary" height="40">
              <v-icon icon="lucide:sliders-horizontal" size="18" class="me-2" />
              Filters
            </v-btn>
          </div>

          <v-divider class="sb-divider" />
          <v-data-table
            :headers="headers"
            :items="dataRows?.[dataPagination.currentPage - 1] ?? []"
            item-key="id"
            class="sb-table"
            :loading="isFetching"
            :page="dataPagination.currentPage"
            :items-per-page="dataPagination.perPage"
            :server-items-length="dataPagination.total"
            hide-default-footer
            @click:row="
              (_: any, row: { item: EmailTemplateModel }) =>
                handleOpenEdit(row.item)
            "
          >
            <!-- Template -->
            <template #item.name="{ item }">
              <div class="d-flex align-center ga-3 min-w-0">
                <v-avatar size="34" rounded="lg" color="info" variant="tonal">
                  <v-icon icon="lucide:mail" size="18" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="font-weight-bold text-truncate">
                    {{ item.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis text-truncate">
                    {{ item.description || "—" }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Subject -->
            <template #item.subject="{ item }">
              <div class="text-body-2 text-truncate" style="max-width: 420px">
                {{ item.subject || "—" }}
              </div>
            </template>

            <!-- Description (optional: if you still want a separate column, keep it minimal) -->
            <template #item.description="{ item }">
              <div
                class="text-body-2 text-medium-emphasis text-truncate"
                style="max-width: 360px"
              >
                {{ item.description || "—" }}
              </div>
            </template>

            <!-- From Name -->
            <template #item.fromName="{ item }">
              <v-chip
                size="small"
                rounded="lg"
                variant="tonal"
                color="primary"
                class="text-truncate"
                style="max-width: 220px"
              >
                <template #prepend>
                  <v-icon icon="lucide:user" size="16" class="me-1" />
                </template>
                {{ item.fromName || "—" }}
              </v-chip>
            </template>

            <!-- From Email -->
            <template #item.from="{ item }">
              <v-chip
                size="small"
                rounded="lg"
                variant="outlined"
                class="text-truncate"
                style="max-width: 240px"
              >
                <template #prepend>
                  <v-icon icon="lucide:at-sign" size="16" class="me-1" />
                </template>
                {{ item.from || "—" }}
              </v-chip>
            </template>

            <!-- Updated -->
            <template #item.updatedAt="{ item }">
              <div class="d-flex align-center ga-2">
                <v-icon
                  icon="lucide:calendar-fold"
                  size="16"
                  class="text-medium-emphasis"
                />
                <span class="text-body-2">{{
                  formatDateLabel(item.updatedAt)
                }}</span>
              </div>
            </template>
          </v-data-table>

          <!-- Table footer -->
          <v-divider />
          <div
            class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4"
          >
            <!-- Left: total -->
            <div class="text-body-2 text-medium-emphasis">
              Total:
              <span class="font-weight-bold">{{ dataPagination.total }}</span>
              <span class="ms-1">items</span>
            </div>

            <!-- Right: per page + pagination -->
            <div class="d-flex align-center ga-3 flex-wrap">
              <div class="d-flex align-center ga-2">
                <div class="text-body-2 text-medium-emphasis">
                  Items per page
                </div>

                <v-select
                  :items="[10, 25, 50, 100]"
                  density="compact"
                  variant="outlined"
                  rounded="lg"
                  hide-details
                  style="max-width: 140px"
                  :model-value="dataPagination.perPage"
                  @update:model-value="
                    (v) => {
                      const next = Number(v) || 10;
                      fetchData?.({ limit: next, reset: true });
                    }
                  "
                />
              </div>

              <v-pagination
                v-if="(dataPagination.lastPage ?? 1) > 1"
                :length="dataPagination.lastPage ?? 1"
                :total-visible="10"
                :model-value="dataPagination.currentPage"
                size="40"
                rounded="lg"
                @update:model-value="
                  (p) => {
                    fetchData?.({ page: p });
                  }
                "
              />
            </div>
          </div>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Add/Edit dialog -->
    <component
      :is="shellComponent"
      v-model="editorOpen"
      :max-width="isMobile ? undefined : 1600"
    >
      <EmailTemplateBuilder
        v-model="editorOpen"
        :mode="editorMode"
        :template="selectedTemplate"
        :saving="saving"
        :locale-items="['en', 'id']"
        :status-items="['draft', 'active']"
        @preview="openPreview"
        @save="handleBuilderSave"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
import {
  type EmailTemplateModel,
  type EmailTemplateCode,
} from "@/models/email-template";
import { formatDateLabel } from "@/utils/dateUtils";

definePageMeta({
  middleware: ["auth"],
  title: "Email Template",
  breadcrumbs: [
    { title: "Settings", disabled: false, to: "/settings" },
    { title: "Email Template", disabled: true },
  ],
});

const { isMobile } = useIsMobile();
const snack = useAppSnackbar();

// Store
const emailTemplatesStore = useEmailTemplatesStore();

// Internal state
const isFetching = ref(false);
const isFetchingError = ref(false);
const isDataLoaded = ref(false);
const errorMsg = ref("");
const search = ref("");
const storeKey = ref(0);

const headers = [
  { title: "Template", key: "name", sortable: true },
  { title: "Subject", key: "subject", sortable: false },
  { title: "Description", key: "description", sortable: true },
  { title: "From Name", key: "fromName", sortable: true },
  { title: "From Email", key: "from", sortable: true },
  { title: "Updated", key: "updatedAt", sortable: true },
] as const;

const editorOpen = ref(false);
const editorMode = ref<"create" | "edit">("create");
const saving = ref(false);
const selectedId = ref<string | null>(null);
const selectedTemplate = ref<EmailTemplateModel | null>(null);

const previewOpen = ref(false);
const previewHtml = ref("");

// Computed
const dataRows = computed(() => emailTemplatesStore.data.rows);
const dataPagination = computed(() => emailTemplatesStore.data.pagination);

const shellComponent = computed(() =>
  isMobile.value
    ? resolveComponent("VBottomSheet")
    : resolveComponent("VDialog"),
);

// Methods
async function fetchData({ page = 1, limit = 10, reset = false }) {
  isFetching.value = true;

  const searchQuery =
    search.value !== "" && search.value !== null
      ? `&search=${search.value}`
      : "";
  const fetchProfile = await emailTemplatesStore.fetchAll({
    query: `limit=${limit}${searchQuery}`,
    page,
    reset,
  });
  isFetching.value = false;
  isDataLoaded.value = true;

  if (!fetchProfile.success) {
    isFetchingError.value = true;
    errorMsg.value = "Failed to fetch email templates";

    return snack.open(errorMsg.value, { color: "error" });
  }
  storeKey.value += 1;
}

function handleOpenEdit(item: EmailTemplateModel) {
  editorMode.value = "edit";
  selectedId.value = item.id != null ? String(item.id) : null;
  selectedTemplate.value = item;
  editorOpen.value = true;
}

function openPreview(html: string) {
  previewHtml.value = html;
  previewOpen.value = true;
}

async function handleBuilderSave(payload: {
  meta: Pick<
    EmailTemplateModel,
    "name" | "description" | "subject" | "cc" | "bcc" | "from" | "fromName"
  >;
  contentHtml: string;
  contentCode: EmailTemplateCode;
}) {
  saving.value = true;

  const normalize = (v?: string | null) => {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
  };

  try {
    const patch: Partial<EmailTemplateModel> = {
      name: payload.meta.name.trim(),
      description: normalize(payload.meta.description ?? null),

      subject: normalize(payload.meta.subject ?? null),
      cc: normalize(payload.meta.cc ?? null),
      bcc: normalize(payload.meta.bcc ?? null),
      from: normalize(payload.meta.from ?? null),
      fromName: normalize(payload.meta.fromName ?? null),

      // builder outputs
      contentHtml: payload.contentHtml ?? null,
      contentCode: payload.contentCode ?? null,

      // optional: keep null unless you generate it
      contentText: null,
    };

    if (editorMode.value === "create") {
      // create
    } else if (editorMode.value === "edit" && selectedId.value) {
      // update
      if (!selectedTemplate.value) {
        throw new Error("Selected template is missing for update.");
      }

      // merging the existing selected template with the partial patch.
      const updatePayload = {
        ...selectedTemplate.value,
        ...patch,
      } as EmailTemplateModel;

      await emailTemplatesStore.update(selectedId.value, updatePayload);
    }

    storeKey.value += 1;

    // close + cleanup
    previewHtml.value = "";
    selectedId.value = null;
    previewOpen.value = false;
    editorOpen.value = false;
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchData({});
});
</script>

<style scoped lang="scss">
// ===============================
// Email Templates Page
// ===============================
.sb-email-templates {
  .sb-card {
    overflow: hidden;
  }

  .sb-editor-card {
    overflow: hidden;
  }

  .sb-builder {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
    min-height: 520px;
  }

  .sb-builder-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(var(--v-theme-surface), 0.78);
    backdrop-filter: blur(6px);
  }

  .sb-preview-card {
    overflow: hidden;
  }

  .sb-preview-iframe {
    width: 100%;
    height: 72vh;
    border: 0;
    display: block;
    background: #fff;
  }
}
</style>
