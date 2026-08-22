<template>
  <div class="invoice-templates-page">
    <AdminPageHeader
      title="Invoice Templates"
      subtitle="Manage GrapesJS invoice templates and published versions"
    >
      <template #actions>
        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          @click="openCreate"
        >
          Add Template
        </v-btn>
      </template>
    </AdminPageHeader>

    <v-card rounded="xl" variant="outlined" class="invoice-templates-card">
      <v-card-text class="pa-0">
        <div class="invoice-table-head">
          <v-spacer />

          <v-form @submit.prevent="fetchTemplates({ reset: true })">
            <v-text-field
              v-model="search"
              density="compact"
              variant="outlined"
              rounded="lg"
              hide-details
              clearable
              placeholder="Search template"
              style="min-width: 280px"
              @click:clear="fetchTemplates({ reset: true })"
            >
              <template #prepend-inner>
                <v-icon icon="lucide:search" size="18" />
              </template>
            </v-text-field>
          </v-form>

          <v-select
            v-model="statusFilter"
            :items="statusFilterItems"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            style="max-width: 180px"
            @update:model-value="fetchTemplates({ reset: true })"
          />
        </div>

        <v-divider />

        <div v-if="isFetching && !isLoaded" class="pa-4">
          <v-skeleton-loader type="table" />
        </div>

        <div v-else-if="fetchError" class="pa-10 text-center">
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
            Could not load invoice templates
          </div>
          <div class="text-body-2 text-medium-emphasis mb-5">
            {{ fetchError }}
          </div>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:refresh-cw"
            :loading="isFetching"
            @click="fetchTemplates({ reset: true })"
          >
            Retry
          </v-btn>
        </div>

        <div v-else-if="templates.length === 0" class="pa-10 text-center">
          <v-avatar
            size="56"
            rounded="xl"
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon icon="lucide:file-text" size="26" />
          </v-avatar>

          <div class="text-h6 font-weight-black mb-1">
            No invoice templates found
          </div>
          <div class="text-body-2 text-medium-emphasis mb-5">
            Create a template or run the invoice template seeder first.
          </div>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:plus"
            @click="openCreate"
          >
            Add Template
          </v-btn>
        </div>

        <template v-else>
          <v-data-table
            :headers="headers"
            :items="templates"
            :loading="isFetching"
            item-key="id"
            class="invoice-template-table"
            hide-default-footer
            @click:row="(_: any, row: { item: InvoiceTemplate }) => openEdit(row.item)"
          >
            <template #item.name="{ item }">
              <div class="d-flex align-center ga-3 min-w-0">
                <v-avatar size="34" rounded="lg" color="primary" variant="tonal">
                  <v-icon icon="lucide:file-text" size="18" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="font-weight-bold text-truncate">
                    {{ item.name }}
                  </div>
                  <div class="text-caption text-medium-emphasis text-truncate">
                    {{ item.templateKey }}
                  </div>
                </div>
              </div>
            </template>

            <template #item.version="{ item }">
              <v-chip size="small" rounded="lg" variant="tonal">
                v{{ item.version }}
              </v-chip>
            </template>

            <template #item.status="{ item }">
              <v-chip
                size="small"
                rounded="lg"
                variant="tonal"
                :color="statusColor(item.status)"
              >
                {{ item.status }}
              </v-chip>
            </template>

            <template #item.isActive="{ item }">
              <v-chip
                size="small"
                rounded="lg"
                variant="tonal"
                :color="item.isActive ? 'success' : 'default'"
              >
                {{ item.isActive ? "Active" : "Inactive" }}
              </v-chip>
            </template>

            <template #item.updatedAt="{ item }">
              <div class="d-flex align-center ga-2">
                <v-icon icon="lucide:calendar" size="16" />
                <span>{{ formatDate(item.updatedAt) }}</span>
              </div>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end ga-2" @click.stop>
                <v-btn
                  icon="lucide:pencil"
                  size="small"
                  variant="text"
                  @click="openEdit(item)"
                />
                <v-btn
                  icon="lucide:trash-2"
                  size="small"
                  variant="text"
                  color="error"
                  @click="deleteTemplate(item)"
                />
              </div>
            </template>
          </v-data-table>

          <v-divider />

          <div class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
            <div class="text-body-2 text-medium-emphasis">
              Total:
              <span class="font-weight-bold">{{ pagination.total }}</span>
              templates
            </div>

            <div class="d-flex align-center ga-3 flex-wrap">
              <v-select
                v-model="pagination.limit"
                :items="[10, 25, 50, 100]"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                style="max-width: 120px"
                @update:model-value="fetchTemplates({ page: 1 })"
              />

              <v-pagination
                v-if="pagination.lastPage > 1"
                v-model="pagination.page"
                :length="pagination.lastPage"
                rounded="lg"
                :total-visible="7"
                @update:model-value="(page) => fetchTemplates({ page })"
              />
            </div>
          </div>
        </template>
      </v-card-text>
    </v-card>

    <component
      :is="shellComponent"
      v-model="editorOpen"
      :fullscreen="!isMobile"
      :max-width="isMobile ? undefined : 1800"
      persistent
    >
      <v-card class="invoice-editor-card">
        <v-toolbar density="comfortable" color="surface" border>
          <v-toolbar-title class="font-weight-bold">
            {{ editorMode === "create" ? "Create Invoice Template" : "Edit Invoice Template" }}
          </v-toolbar-title>

          <v-spacer />

          <v-switch
            v-if="editorMode === 'edit'"
            v-model="form.forceUpdate"
            color="primary"
            density="compact"
            hide-details
            inset
            class="me-4"
            label="Force update"
          />

          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:x"
            class="me-2"
            @click="closeEditor"
          >
            Close
          </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:save"
            :loading="saving"
            @click="saveTemplate"
          >
            Save
          </v-btn>
        </v-toolbar>

        <div class="invoice-editor-layout">
          <aside class="invoice-editor-sidebar">
            <v-text-field
              v-model="form.name"
              label="Name"
              variant="outlined"
              density="compact"
              rounded="lg"
            />

            <v-text-field
              v-model="form.templateKey"
              label="Template Key"
              variant="outlined"
              density="compact"
              rounded="lg"
            />

            <div class="d-grid">
              <v-select
                v-model="form.locale"
                :items="['id', 'en']"
                label="Locale"
                variant="outlined"
                density="compact"
                rounded="lg"
              />

              <v-text-field
                v-model.number="form.version"
                label="Version"
                type="number"
                min="1"
                variant="outlined"
                density="compact"
                rounded="lg"
                :disabled="editorMode === 'edit' && !form.forceUpdate"
              />
            </div>

            <v-select
              v-model="form.status"
              :items="statusItems"
              label="Status"
              variant="outlined"
              density="compact"
              rounded="lg"
            />

            <v-switch
              v-model="form.isActive"
              color="primary"
              density="compact"
              hide-details
              inset
              label="Active template"
            />

            <v-divider class="my-4" />

            <v-alert
              type="info"
              variant="tonal"
              density="compact"
              class="text-body-2"
            >
              When force update is off, saving creates a new version from this template.
            </v-alert>
          </aside>

          <main class="invoice-builder-panel">
            <ClientOnly>
              <GrapesWebBuilder
                v-if="editorOpen"
                :key="builderKey"
                ref="builderRef"
                theme="light"
                :project-data="form.builderJson"
                :html="form.htmlTemplate"
                :css="form.cssTemplate"
              />
            </ClientOnly>
          </main>
        </div>
      </v-card>
    </component>
  </div>
</template>

<script setup lang="ts">
import GrapesWebBuilder from "~/components/GrapesWebBuilder.client.vue";

definePageMeta({
  middleware: ["auth"],
  title: "Invoice Templates",
  breadcrumbs: [
    { title: "Settings", disabled: false, to: "/settings" },
    { title: "Invoice Templates", disabled: true },
  ],
});

type InvoiceStatus = "draft" | "published" | "archived";

interface InvoiceTemplate {
  id: string;
  templateKey: string;
  name: string;
  builderType: string;
  builderJson: Record<string, any> | null;
  htmlTemplate: string;
  cssTemplate: string | null;
  dataSchema: Record<string, any> | null;
  settingJson: Record<string, any> | null;
  locale: string;
  version: number;
  status: InvoiceStatus;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceTemplateForm {
  forceUpdate: boolean;
  templateKey: string;
  name: string;
  builderType: string;
  builderJson: Record<string, any> | null;
  htmlTemplate: string;
  cssTemplate: string;
  dataSchema: Record<string, any> | null;
  settingJson: Record<string, any>;
  locale: string;
  version: number;
  status: InvoiceStatus;
  isActive: boolean;
  publishedAt: string | null;
}

const api = useApiService();
const snack = useAppSnackbar();
const { isMobile } = useIsMobile();

const endpoint = "/v1/admin/invoice-templates";
const statusItems: InvoiceStatus[] = ["draft", "published", "archived"];
const statusFilterItems = ["all", ...statusItems];

const headers = [
  { title: "Template", key: "name", sortable: true },
  { title: "Locale", key: "locale", sortable: true },
  { title: "Version", key: "version", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Active", key: "isActive", sortable: true },
  { title: "Updated", key: "updatedAt", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" },
] as const;

const templates = ref<InvoiceTemplate[]>([]);
const search = ref("");
const statusFilter = ref("all");
const isFetching = ref(false);
const isLoaded = ref(false);
const fetchError = ref("");

const pagination = reactive({
  page: 1,
  limit: 10,
  total: 0,
  lastPage: 1,
});

const editorOpen = ref(false);
const editorMode = ref<"create" | "edit">("create");
const selectedTemplate = ref<InvoiceTemplate | null>(null);
const builderRef = ref<InstanceType<typeof GrapesWebBuilder> | null>(null);
const builderKey = ref(0);
const saving = ref(false);

const form = reactive<InvoiceTemplateForm>(getEmptyForm());

const shellComponent = computed(() =>
  isMobile.value ? resolveComponent("VBottomSheet") : resolveComponent("VDialog"),
);

function getEmptyForm(): InvoiceTemplateForm {
  return {
    forceUpdate: false,
    templateKey: "order.invoice",
    name: "",
    builderType: "grapesjs",
    builderJson: null,
    htmlTemplate: "",
    cssTemplate: "",
    dataSchema: null,
    settingJson: {
      paper: "A4",
      orientation: "portrait",
      renderer: "handlebars",
    },
    locale: "id",
    version: 1,
    status: "draft",
    isActive: false,
    publishedAt: null,
  };
}

function assignForm(next: InvoiceTemplateForm) {
  Object.assign(form, next);
}

function mapTemplateToForm(template: InvoiceTemplate): InvoiceTemplateForm {
  return {
    forceUpdate: false,
    templateKey: template.templateKey,
    name: template.name,
    builderType: template.builderType || "grapesjs",
    builderJson: template.builderJson || null,
    htmlTemplate: template.htmlTemplate || "",
    cssTemplate: template.cssTemplate || "",
    dataSchema: template.dataSchema || null,
    settingJson: template.settingJson || {},
    locale: template.locale || "id",
    version: template.version || 1,
    status: template.status || "draft",
    isActive: Boolean(template.isActive),
    publishedAt: template.publishedAt,
  };
}

async function fetchTemplates({
  page = pagination.page,
  reset = false,
}: { page?: number; reset?: boolean } = {}) {
  if (reset) page = 1;

  isFetching.value = true;
  fetchError.value = "";

  const params: Record<string, any> = {
    page,
    limit: pagination.limit,
  };

  if (search.value.trim()) params.search = search.value.trim();
  if (statusFilter.value !== "all") params.status = statusFilter.value;

  const res = await api.get<any>(endpoint, params);
  isFetching.value = false;
  isLoaded.value = true;

  if (!res.success) {
    fetchError.value = String(res.error || "Failed to fetch invoice templates");
    snack.open(fetchError.value, { color: "error" });
    return;
  }

  const payload = res.data;
  templates.value = payload?.rows || [];
  pagination.page = payload?.pagination?.currentPage || page;
  pagination.limit = payload?.pagination?.perPage || pagination.limit;
  pagination.total = payload?.pagination?.total || templates.value.length;
  pagination.lastPage = payload?.pagination?.lastPage || 1;
}

function openCreate() {
  editorMode.value = "create";
  selectedTemplate.value = null;
  assignForm(getEmptyForm());
  builderKey.value += 1;
  editorOpen.value = true;
}

async function openEdit(template: InvoiceTemplate) {
  editorMode.value = "edit";
  selectedTemplate.value = template;
  assignForm(mapTemplateToForm(template));
  builderKey.value += 1;
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
  selectedTemplate.value = null;
}

function buildSavePayload() {
  const projectData = builderRef.value?.getProjectData() || form.builderJson;
  const html = builderRef.value?.getHtml() || form.htmlTemplate;
  const css = builderRef.value?.getCss() || form.cssTemplate;

  return {
    forceUpdate: form.forceUpdate,
    templateKey: form.templateKey.trim(),
    name: form.name.trim(),
    builderType: form.builderType || "grapesjs",
    builderJson: projectData,
    htmlTemplate: html,
    cssTemplate: css,
    dataSchema: form.dataSchema,
    settingJson: form.settingJson || {},
    locale: form.locale || "id",
    version: Number(form.version) || 1,
    status: form.status,
    isActive: Boolean(form.isActive),
    publishedAt:
      form.status === "published"
        ? form.publishedAt || new Date().toISOString()
        : form.publishedAt,
  };
}

async function saveTemplate() {
  if (!form.name.trim() || !form.templateKey.trim()) {
    snack.open("Name and template key are required.", { color: "error" });
    return;
  }

  saving.value = true;
  const payload = buildSavePayload();

  const res =
    editorMode.value === "create"
      ? await api.post<InvoiceTemplate>(endpoint, payload)
      : selectedTemplate.value?.id
        ? await api.patch<InvoiceTemplate>(
            `${endpoint}/${selectedTemplate.value.id}`,
            payload,
          )
        : { success: false, error: "Selected template is missing" };

  saving.value = false;

  if (!res.success) {
    snack.open(String(res.error || "Failed to save invoice template"), {
      color: "error",
    });
    return;
  }

  snack.open("Invoice template saved.", { color: "success" });
  editorOpen.value = false;
  await fetchTemplates({ reset: true });
}

async function deleteTemplate(template: InvoiceTemplate) {
  if (!window.confirm(`Delete "${template.name}"?`)) return;

  const res = await api.delete(`${endpoint}/${template.id}`);
  if (!res.success) {
    snack.open(String(res.error || "Failed to delete invoice template"), {
      color: "error",
    });
    return;
  }

  snack.open("Invoice template deleted.", { color: "success" });
  await fetchTemplates({ reset: true });
}

function statusColor(status: InvoiceStatus) {
  if (status === "published") return "success";
  if (status === "archived") return "warning";
  return "default";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

onMounted(() => {
  fetchTemplates();
});
</script>

<style scoped>
.invoice-templates-card {
  overflow: hidden;
}

.invoice-table-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.invoice-template-table {
  cursor: pointer;
}

.invoice-editor-card {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.invoice-editor-layout {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
}

.invoice-editor-sidebar {
  overflow-y: auto;
  padding: 16px;
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  background: rgb(var(--v-theme-surface));
}

.invoice-builder-panel {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.d-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 960px) {
  .invoice-table-head {
    align-items: stretch;
    flex-direction: column;
  }

  .invoice-editor-card {
    height: 92vh;
  }

  .invoice-editor-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(520px, 1fr);
  }

  .invoice-editor-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  }
}
</style>
