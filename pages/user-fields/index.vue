<template>
  <div class="sb-page">
    <AdminPageHeader
      title="User Fields"
      subtitle="Manage the reusable library of respondent fields (key, type, validation, options)."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:sliders-horizontal"
          >
            Filters
            <v-dialog activator="parent" max-width="760">
              <template #default="{ isActive }">
                <v-card rounded="xl">
                  <v-card-title
                    class="d-flex align-center justify-space-between"
                  >
                    <div class="text-subtitle-1 font-weight-bold">Filters</div>
                    <v-btn icon variant="text" @click="isActive.value = false">
                      <v-icon icon="lucide:x" />
                    </v-btn>
                  </v-card-title>
                  <v-divider />
                  <v-card-text class="pa-6">
                    <v-row class="ga-4" no-gutters>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.field_type"
                          :items="fieldTypeItems"
                          label="Field type"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="filters.is_active"
                          :items="activeItems"
                          label="Active"
                          variant="outlined"
                          rounded="lg"
                          density="comfortable"
                          clearable
                        />
                      </v-col>
                    </v-row>
                  </v-card-text>
                  <v-divider />
                  <v-card-actions class="pa-4">
                    <v-btn rounded="lg" variant="text" @click="resetFilters"
                      >Reset</v-btn
                    >
                    <v-spacer />
                    <v-btn
                      rounded="lg"
                      variant="outlined"
                      @click="isActive.value = false"
                      >Close</v-btn
                    >
                    <v-btn
                      rounded="lg"
                      color="primary"
                      @click="isActive.value = false"
                      >Apply</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </template>
            </v-dialog>
          </v-btn>

          <v-btn
            rounded="lg"
            color="primary"
            prepend-icon="lucide:plus"
            @click="openCreate"
          >
            New Field
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <template v-if="ui.loading">
      <v-card rounded="xl" class="sb-card">
        <div class="pa-4 pb-2">
          <v-skeleton-loader type="heading, text" />
        </div>
        <v-divider />
        <div class="pa-4">
          <v-skeleton-loader type="table" />
        </div>
      </v-card>
    </template>

    <template v-else-if="ui.error">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">{{
          ui.error
        }}</v-alert>
        <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
      </v-card>
    </template>

    <template v-else>
      <v-card rounded="xl" class="sb-card">
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
        >
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">Field library</div>
            <div class="text-caption text-medium-emphasis">
              {{ filtered.length }} shown · {{ fields.length }} total
            </div>
          </div>

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-text-field
              v-model="search"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              prepend-inner-icon="lucide:search"
              placeholder="Search label or key..."
              hide-details
              class="sb-search"
            />
          </div>
        </div>

        <v-divider />

        <template v-if="filtered.length === 0">
          <div class="pa-10">
            <div class="d-flex flex-column align-center text-center">
              <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
                <v-icon icon="lucide:form-input" />
              </v-avatar>
              <div class="text-subtitle-1 font-weight-bold">
                No fields found
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                Create reusable fields like email, age, department, and more.
              </div>
              <v-btn
                rounded="lg"
                color="primary"
                prepend-icon="lucide:plus"
                @click="openCreate"
              >
                New Field
              </v-btn>
            </div>
          </div>
        </template>

        <template v-else>
          <v-data-table
            :headers="headers"
            :items="filtered"
            item-key="id"
            density="comfortable"
          >
            <template #item.label="{ item }">
              <div class="min-w-0">
                <div class="font-weight-semibold text-truncate">
                  {{ item.label }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.key }}
                </div>
              </div>
            </template>

            <template #item.is_active="{ item }">
              <v-chip
                size="small"
                variant="tonal"
                :color="item.is_active ? 'success' : 'warning'"
              >
                {{ item.is_active ? "Active" : "Inactive" }}
              </v-chip>
            </template>

            <template #item.validation_json="{ item }">
              <v-chip size="small" variant="tonal">
                {{ hasJson(item.validation_json) ? "Rules" : "—" }}
              </v-chip>
            </template>

            <template #item.options_json="{ item }">
              <v-chip size="small" variant="tonal">
                {{ hasJson(item.options_json) ? "Options" : "—" }}
              </v-chip>
            </template>

            <template #item.actions="{ item }">
              <div class="d-flex justify-end">
                <v-btn
                  icon
                  variant="text"
                  aria-label="Edit"
                  @click="openEdit(item)"
                >
                  <v-icon icon="lucide:pencil" />
                </v-btn>
                <v-btn icon variant="text" aria-label="More">
                  <v-icon icon="lucide:more-vertical" />
                  <v-menu activator="parent" location="bottom end">
                    <v-list density="compact">
                      <v-list-item title="Edit (UI)" @click="openEdit(item)" />
                      <v-list-item
                        :title="item.is_active ? 'Disable (UI)' : 'Enable (UI)'"
                        @click="openConfirm(item)"
                      />
                    </v-list>
                  </v-menu>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </template>
      </v-card>

      <!-- Drawer -->
      <v-navigation-drawer
        v-model="drawer"
        location="right"
        temporary
        width="520"
        class="sb-drawer"
      >
        <div class="pa-4 d-flex align-center justify-space-between">
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black">
              {{ formMode === "create" ? "New user field" : "Edit user field" }}
            </div>
            <div class="text-caption text-medium-emphasis">
              Define field type, validation, and options.
            </div>
          </div>
          <v-btn icon variant="text" @click="drawer = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </div>

        <v-divider />

        <div class="pa-4">
          <v-row class="ga-4" no-gutters>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.key"
                label="Key"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="form.field_type"
                :items="fieldTypeItems"
                label="Field type"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="form.label"
                label="Label"
                variant="outlined"
                rounded="lg"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.validation_json"
                label="Validation JSON"
                variant="outlined"
                rounded="lg"
                rows="4"
                hint="Store validation_json as JSON string (UI only)."
                persistent-hint
              />
            </v-col>
            <v-col cols="12" v-if="form.field_type === 'select'">
              <v-textarea
                v-model="form.options_json"
                label="Options JSON"
                variant="outlined"
                rounded="lg"
                rows="4"
                hint='Example: {"items":[{"label":"A","value":"a"}]}'
                persistent-hint
              />
            </v-col>
            <v-col cols="12">
              <v-switch
                v-model="form.is_active"
                color="primary"
                inset
                label="Active"
              />
            </v-col>
          </v-row>

          <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
            UI only — saving does not persist.
          </v-alert>

          <div class="d-flex ga-2 flex-wrap mt-4">
            <v-btn rounded="lg" variant="outlined" @click="drawer = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="drawer = false"
              >Save (UI)</v-btn
            >
          </div>
        </div>
      </v-navigation-drawer>

      <!-- Confirm -->
      <v-dialog v-model="dialogs.confirm" max-width="560">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center ga-2">
            <v-avatar size="36" color="warning" variant="tonal">
              <v-icon icon="lucide:alert-triangle" />
            </v-avatar>
            <div class="text-subtitle-1 font-weight-bold">
              {{ confirm.title }}
            </div>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <div class="text-body-2 text-medium-emphasis">
              {{ confirm.message }}
            </div>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.confirm = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.confirm = false"
              >Confirm (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type UserFieldType = "text" | "email" | "select" | "number" | "date";

interface QuestionnaireUserField {
  id: string;
  key: string;
  label: string;
  field_type: UserFieldType;
  validation_json: string;
  options_json: string;
  is_active: boolean;
  created_at: string;
}

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

const fields = ref<QuestionnaireUserField[]>([
  {
    id: "uf_001",
    key: "full_name",
    label: "Full name",
    field_type: "text",
    validation_json: '{"min":2}',
    options_json: "{}",
    is_active: true,
    created_at: "2025-12-01T08:00:00Z",
  },
  {
    id: "uf_002",
    key: "email",
    label: "Email",
    field_type: "email",
    validation_json: '{"required":true}',
    options_json: "{}",
    is_active: true,
    created_at: "2025-12-01T08:00:00Z",
  },
  {
    id: "uf_003",
    key: "department",
    label: "Department",
    field_type: "select",
    validation_json: "{}",
    options_json:
      '{"items":[{"label":"Sales","value":"sales"},{"label":"Ops","value":"ops"}]}',
    is_active: true,
    created_at: "2025-12-05T08:00:00Z",
  },
  {
    id: "uf_004",
    key: "age",
    label: "Age",
    field_type: "number",
    validation_json: '{"min":0,"max":120}',
    options_json: "{}",
    is_active: false,
    created_at: "2025-12-06T08:00:00Z",
  },
]);

const fieldTypeItems: UserFieldType[] = [
  "text",
  "email",
  "select",
  "number",
  "date",
];
const activeItems = [
  { title: "Active", value: true },
  { title: "Inactive", value: false },
];

const search = ref("");
const filters = reactive({
  field_type: "" as UserFieldType | "",
  is_active: "" as "" | boolean,
});

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return fields.value.filter((f) => {
    if (filters.field_type && f.field_type !== filters.field_type) return false;
    if (filters.is_active !== "" && f.is_active !== filters.is_active)
      return false;

    if (!q) return true;
    return `${f.label} ${f.key}`.toLowerCase().includes(q);
  });
});

const headers = [
  { title: "Field", key: "label", sortable: true },
  { title: "Type", key: "field_type", sortable: true },
  { title: "Validation", key: "validation_json", sortable: false },
  { title: "Options", key: "options_json", sortable: false },
  { title: "Active", key: "is_active", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

function hasJson(v: string) {
  const s = (v || "").trim();
  return s && s !== "{}";
}

function resetFilters() {
  filters.field_type = "";
  filters.is_active = "";
}

const drawer = ref(false);

type FormMode = "create" | "edit";
const formMode = ref<FormMode>("create");

const form = reactive({
  id: "",
  key: "",
  label: "",
  field_type: "text" as UserFieldType,
  validation_json: "{}",
  options_json: "{}",
  is_active: true,
});

function openCreate() {
  formMode.value = "create";
  form.id = "";
  form.key = "";
  form.label = "";
  form.field_type = "text";
  form.validation_json = "{}";
  form.options_json = "{}";
  form.is_active = true;
  drawer.value = true;
}

function openEdit(item: QuestionnaireUserField) {
  formMode.value = "edit";
  form.id = item.id;
  form.key = item.key;
  form.label = item.label;
  form.field_type = item.field_type;
  form.validation_json = item.validation_json || "{}";
  form.options_json = item.options_json || "{}";
  form.is_active = item.is_active;
  drawer.value = true;
}

const dialogs = reactive({
  confirm: false,
});

const confirm = reactive({
  title: "Confirm action",
  message: "UI only.",
});

function openConfirm(item: QuestionnaireUserField) {
  confirm.title = item.is_active ? "Disable field" : "Enable field";
  confirm.message = `UI only — would ${item.is_active ? "disable" : "enable"} ${item.label}.`;
  dialogs.confirm = true;
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => (ui.loading = false), 250);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-search {
  min-width: 320px;
}

.sb-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
}
</style>
