<!-- /components/OrgUserFieldsDialog.vue -->
<template>
  <v-dialog v-model="openLocal" max-width="980" persistent scrollable>
    <v-card rounded="xl" class="dialog-card border">
      <!-- Fixed Header -->
      <div class="dialog-header px-6 py-4">
        <div class="d-flex align-center justify-space-between ga-4">
          <div class="d-flex align-center ga-3 min-w-0">
            <v-avatar size="40" rounded="lg" color="primary" variant="tonal">
              <v-icon icon="lucide:form-input" size="18" />
            </v-avatar>

            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-bold truncate">
                User Fields Settings
              </div>
              <div class="text-caption text-medium-emphasis truncate">
                User information required before questionnaire access.
              </div>
            </div>
          </div>
        </div>
      </div>

      <v-divider />

      <!-- Scrollable Content (only this area scrolls) -->
      <div class="dialog-body">
        <div class="pa-6">
          <!-- Status / Info -->
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            rounded="lg"
            class="mb-4"
          >
            {{ error }}
          </v-alert>

          <v-skeleton-loader
            v-if="loading && !setting"
            type="card, list-item@6"
          />

          <template v-else>
            <!-- Fields -->
            <div class="d-flex align-center justify-space-between ga-3 mb-3">
              <!-- <div class="text-subtitle-2 font-weight-bold">Fields</div> -->
              <v-spacer />
              <div class="d-flex align-center ga-2">
                <v-btn variant="tonal" rounded="lg" @click="addField">
                  <v-icon start icon="lucide:plus" />
                  Add Field
                </v-btn>
              </div>
            </div>

            <v-card variant="outlined" rounded="xl" class="pa-2">
              <v-list density="comfortable" class="py-0 px-1">
                <template
                  v-if="(canDrag ? draft.fields : filteredFields).length"
                >
                  <v-list-item
                    v-for="f in canDrag ? draft.fields : filteredFields"
                    :key="f._tmpId"
                    class="rounded-lg my-1 field-row"
                    :class="{
                      'is-dragging': isDragging && drag.fromTmpId === f._tmpId,
                      'is-over':
                        isDragging &&
                        drag.overTmpId === f._tmpId &&
                        drag.fromTmpId !== f._tmpId,
                    }"
                    :draggable="canDrag"
                    @dragstart="(e: DragEvent) => onDragStartField(f._tmpId, e)"
                    @dragover="(e: DragEvent) => onDragOverField(f._tmpId, e)"
                    @drop="(e: DragEvent) => onDropField(f._tmpId, e)"
                    @dragend="resetDrag"
                  >
                    <!-- Drag handle -->
                    <template #prepend>
                      <div class="d-flex align-center ga-2 mr-4">
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          class="drag-handle"
                          :disabled="!canDrag"
                          @mousedown.stop
                          @click.stop
                        >
                          <v-icon icon="lucide:grip-vertical" />
                        </v-btn>

                        <v-avatar
                          size="34"
                          rounded="lg"
                          color="primary"
                          variant="tonal"
                        >
                          <v-icon
                            :icon="fieldTypeIcon(f.fieldType)"
                            size="16"
                          />
                        </v-avatar>
                      </div>
                    </template>

                    <!-- rest of your item content unchanged -->
                    <v-list-item-title class="d-flex align-center ga-2">
                      <span class="font-weight-bold">
                        {{ f.label || "(No label)" }}
                      </span>

                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-caption"
                      >
                        {{ f.key || "key" }}
                      </v-chip>

                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-caption"
                        :color="f.isActive ? 'success' : 'grey'"
                      >
                        {{ f.isActive ? "Active" : "Inactive" }}
                      </v-chip>

                      <v-chip
                        size="x-small"
                        variant="tonal"
                        class="text-caption"
                        :color="f.validationJson?.required ? 'warning' : 'grey'"
                      >
                        {{
                          f.validationJson?.required ? "Required" : "Optional"
                        }}
                      </v-chip>
                    </v-list-item-title>

                    <v-list-item-subtitle
                      class="text-caption text-medium-emphasis"
                    >
                      Type: {{ f.fieldType }}
                      <span
                        v-if="
                          Array.isArray(f.optionsJson) && f.optionsJson.length
                        "
                      >
                        • Options: {{ f.optionsJson.length }}
                      </span>
                    </v-list-item-subtitle>

                    <template #append>
                      <div class="d-flex align-center ga-1">
                        <v-tooltip text="Toggle active" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon
                              variant="text"
                              @click="f.isActive = !f.isActive"
                            >
                              <v-icon
                                :icon="
                                  f.isActive
                                    ? 'lucide:toggle-right'
                                    : 'lucide:toggle-left'
                                "
                                :color="f.isActive ? 'primary' : 'grey'"
                              />
                            </v-btn>
                          </template>
                        </v-tooltip>

                        <v-tooltip text="Edit" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon
                              size="small"
                              variant="text"
                              @click="openEditor(f)"
                            >
                              <v-icon icon="lucide:pencil" />
                            </v-btn>
                          </template>
                        </v-tooltip>

                        <v-tooltip text="Remove" location="top">
                          <template #activator="{ props }">
                            <v-btn
                              v-bind="props"
                              icon
                              size="small"
                              variant="text"
                              @click="removeField(f._tmpId)"
                            >
                              <v-icon icon="lucide:trash-2" />
                            </v-btn>
                          </template>
                        </v-tooltip>
                      </div>
                    </template>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </template>
        </div>
      </div>

      <!-- Fixed Footer -->
      <v-divider />
      <div class="dialog-footer px-6 py-4">
        <div class="d-flex align-center justify-space-between ga-4">
          <div class="text-caption text-medium-emphasis">
            Version: <b>{{ draft.version }}</b>
            <span class="mx-2">•</span>
            Fields: <b>{{ draft.fields.length }}</b>
          </div>

          <div class="d-flex align-center ga-2">
            <v-btn variant="text" rounded="lg" @click="close"> Cancel </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              :loading="saving"
              @click="save"
            >
              <v-icon start icon="lucide:save" />
              Save
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Field Editor Dialog (polished) -->
      <v-dialog v-model="editor.open" max-width="820" persistent>
        <v-card rounded="xl" class="border overflow-hidden">
          <!-- Header -->
          <div class="px-6 py-4">
            <div class="d-flex align-center justify-space-between ga-4">
              <div class="d-flex align-center ga-3 min-w-0">
                <v-avatar
                  size="40"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon
                    :icon="editor.isEdit ? 'lucide:pencil' : 'lucide:plus'"
                    size="18"
                  />
                </v-avatar>

                <div class="min-w-0">
                  <div class="text-subtitle-1 font-weight-black truncate">
                    {{ editor.isEdit ? "Edit Field" : "Add Field" }}
                  </div>
                  <div class="text-caption text-medium-emphasis truncate">
                    Configure label, key, type, and optional validation rules.
                  </div>
                </div>
              </div>

              <v-btn icon variant="text" @click="closeEditor">
                <v-icon icon="lucide:x" />
              </v-btn>
            </div>
          </div>

          <v-divider />

          <v-form ref="editorFormRef" @submit.prevent="applyEditor">
            <!-- Body -->
            <v-card-text class="pa-6">
              <v-row dense>
                <!-- Core -->
                <v-col cols="12">
                  <div class="text-subtitle-2 font-weight-bold mb-2">Field</div>
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editor.form.label"
                    label="Label"
                    density="comfortable"
                    variant="outlined"
                    rounded="lg"
                    hide-details="auto"
                    :rules="[rules.required]"
                    prepend-inner-icon="lucide:type"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="editor.form.key"
                    label="Key"
                    density="comfortable"
                    variant="outlined"
                    rounded="lg"
                    hide-details="auto"
                    :rules="[rules.required, rules.key]"
                    prepend-inner-icon="lucide:key-round"
                    placeholder="e.g., student_id"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="editor.form.fieldType"
                    :items="fieldTypeItems"
                    label="Field Type"
                    density="comfortable"
                    variant="outlined"
                    rounded="lg"
                    hide-details="auto"
                    :rules="[rules.required]"
                    prepend-inner-icon="lucide:list"
                  />
                </v-col>

                <!-- Switch cards -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4">
                    <div class="d-flex align-center justify-space-between ga-4">
                      <div class="d-flex align-center ga-3 min-w-0">
                        <v-avatar
                          size="36"
                          rounded="lg"
                          color="success"
                          variant="tonal"
                        >
                          <v-icon icon="lucide:check-circle" size="18" />
                        </v-avatar>

                        <div class="min-w-0">
                          <div class="text-body-2 font-weight-bold">
                            Required
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            User must fill this field.
                          </div>
                        </div>
                      </div>

                      <v-switch
                        v-model="editor.form.validationJson.required"
                        inset
                        color="success"
                        hide-details
                      />
                    </div>
                  </v-card>
                </v-col>

                <v-col cols="12" md="6">
                  <v-card variant="outlined" rounded="xl" class="pa-4">
                    <div class="d-flex align-center justify-space-between ga-4">
                      <div class="d-flex align-center ga-3 min-w-0">
                        <v-avatar
                          size="36"
                          rounded="lg"
                          color="primary"
                          variant="tonal"
                        >
                          <v-icon icon="lucide:toggle-right" size="18" />
                        </v-avatar>

                        <div class="min-w-0">
                          <div class="text-body-2 font-weight-bold">Active</div>
                          <div class="text-caption text-medium-emphasis">
                            Field is shown in the form.
                          </div>
                        </div>
                      </div>

                      <v-switch
                        v-model="editor.form.isActive"
                        inset
                        color="primary"
                        hide-details
                      />
                    </div>
                  </v-card>
                </v-col>

                <!-- Options -->
                <v-col cols="12" v-if="needsOptions(editor.form.fieldType)">
                  <div
                    class="d-flex align-center justify-space-between mt-2 mb-2"
                  >
                    <div>
                      <div class="text-subtitle-2 font-weight-bold">
                        Options
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Provide choices for users to select.
                      </div>
                    </div>

                    <v-btn variant="tonal" rounded="lg" @click="addOption">
                      <v-icon start icon="lucide:plus" />
                      Add option
                    </v-btn>
                  </div>

                  <v-card variant="outlined" rounded="xl" class="pa-3">
                    <v-row
                      v-for="(opt, i) in editor.form.optionsJson"
                      :key="i"
                      dense
                      class="mb-2"
                    >
                      <v-col cols="12" md="5">
                        <v-text-field
                          v-model="opt.label"
                          label="Label"
                          density="comfortable"
                          variant="outlined"
                          rounded="lg"
                          hide-details="auto"
                        />
                      </v-col>
                      <v-col cols="12" md="5">
                        <v-text-field
                          v-model="opt.value"
                          label="Value"
                          density="comfortable"
                          variant="outlined"
                          rounded="lg"
                          hide-details="auto"
                        />
                      </v-col>
                      <v-col
                        cols="12"
                        md="2"
                        class="d-flex justify-end align-center"
                      >
                        <v-btn icon variant="text" @click="removeOption(i)">
                          <v-icon icon="lucide:trash-2" />
                        </v-btn>
                      </v-col>
                    </v-row>

                    <div
                      v-if="!editor.form.optionsJson?.length"
                      class="text-caption text-medium-emphasis"
                    >
                      Add at least 1 option.
                    </div>
                  </v-card>
                </v-col>

                <!-- Advanced validation -->
                <v-col cols="12" class="mt-2">
                  <v-card variant="outlined" rounded="xl" class="pa-0">
                    <v-expansion-panels variant="accordion">
                      <v-expansion-panel>
                        <v-expansion-panel-title>
                          <div class="d-flex align-center ga-2">
                            <v-icon icon="lucide:shield-check" size="16" />
                            <span class="font-weight-bold"
                              >Advanced validation</span
                            >
                            <span
                              class="text-caption text-medium-emphasis ms-2"
                            >
                              Optional
                            </span>
                          </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                          <v-row dense>
                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="editor.form.validationJson.message"
                                label="Validation message"
                                density="comfortable"
                                variant="outlined"
                                rounded="lg"
                                hide-details="auto"
                                prepend-inner-icon="lucide:message-square"
                              />
                            </v-col>

                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model="editor.form.validationJson.pattern"
                                label="Regex pattern"
                                density="comfortable"
                                variant="outlined"
                                rounded="lg"
                                hide-details="auto"
                                prepend-inner-icon="lucide:regex"
                              />
                            </v-col>

                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model.number="
                                  editor.form.validationJson.minLen
                                "
                                label="Min length"
                                type="number"
                                density="comfortable"
                                variant="outlined"
                                rounded="lg"
                                hide-details="auto"
                                prepend-inner-icon="lucide:arrow-down-0-1"
                              />
                            </v-col>

                            <v-col cols="12" md="6">
                              <v-text-field
                                v-model.number="
                                  editor.form.validationJson.maxLen
                                "
                                label="Max length"
                                type="number"
                                density="comfortable"
                                variant="outlined"
                                rounded="lg"
                                hide-details="auto"
                                prepend-inner-icon="lucide:arrow-up-0-1"
                              />
                            </v-col>
                          </v-row>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>

            <v-divider />

            <!-- Footer -->
            <v-card-actions class="px-6 py-4">
              <div class="text-caption text-medium-emphasis">
                Tip: keep keys stable (used for mapping user answers).
              </div>
              <v-spacer />
              <v-btn variant="text" rounded="lg" @click="closeEditor"
                >Cancel</v-btn
              >
              <v-btn
                color="primary"
                variant="flat"
                rounded="lg"
                type="submit"
                class="px-4"
              >
                <v-icon start icon="lucide:check" />
                Apply
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type {
  OrganizationUserFieldValidation,
  OrganizationUserFieldModel,
  OrganizationUserFieldOption,
} from "~/models/organization-user-fields";

const props = defineProps<{
  modelValue: boolean;
  organizationId: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "saved"): void;
}>();

const snack = useAppSnackbar();
const organizationUserFieldsStore = useOrganizationUserFieldsStore(
  props.organizationId,
);

const openLocal = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

const loading = computed(() => organizationUserFieldsStore.loading);
const saving = computed(() => organizationUserFieldsStore.saving);
const error = computed(() => organizationUserFieldsStore.error);
const setting = computed(() => organizationUserFieldsStore.setting);

const search = ref("");

// draft (local editable copy)
type DraftField = OrganizationUserFieldModel & { _tmpId: string };
type EditorField = Omit<DraftField, "validationJson" | "optionsJson"> & {
  validationJson: OrganizationUserFieldValidation;
  optionsJson: OrganizationUserFieldOption[] | null;
};
const draft = ref<{
  organizationId: string;
  isActive: boolean;
  version: number;
  fields: DraftField[];
}>({
  organizationId: props.organizationId,
  isActive: true,
  version: 1,
  fields: [],
});

function toDraft(s: any) {
  draft.value.organizationId = s?.organizationId || props.organizationId;
  draft.value.isActive = s?.isActive ?? true;
  draft.value.version = Number(s?.version ?? 1);

  draft.value.fields = (Array.isArray(s?.fields) ? s.fields : []).map(
    (f: any) => ({
      ...f,
      _tmpId: String(f?.id || crypto.randomUUID()),
    }),
  ) as DraftField[];
}

const filteredFields = computed<DraftField[]>(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return draft.value.fields;

  return draft.value.fields.filter((f) => {
    return (
      (f.key || "").toLowerCase().includes(q) ||
      (f.label || "").toLowerCase().includes(q) ||
      String(f.fieldType || "")
        .toLowerCase()
        .includes(q)
    );
  });
});

function close() {
  openLocal.value = false;
}

async function reload() {
  const res = await organizationUserFieldsStore.fetch();
  if (!res) return;
  toDraft(res);
}

async function save() {
  const payload = {
    isActive: draft.value.isActive,
    version: draft.value.version,
    fields: draft.value.fields.map(({ _tmpId, ...rest }) => rest),
  };

  const res = await organizationUserFieldsStore.update(payload);
  if (!res) {
    snack.open(
      organizationUserFieldsStore.error || "Failed to save user fields.",
      {
        color: "error",
      },
    );
    return;
  }

  toDraft(res);
  snack.open("User fields saved.", { color: "success" });
  emit("saved");
  close();
}

function addField() {
  openEditor({
    _tmpId: crypto.randomUUID(),
    id: "",
    key: "",
    label: "",
    fieldType: "text",
    validationJson: { required: false },
    optionsJson: null,
    isActive: true,
  } as any);
}

function removeField(tmpId: string) {
  draft.value.fields = draft.value.fields.filter((f) => f._tmpId !== tmpId);
}

function fieldTypeIcon(type: string) {
  if (type === "email") return "lucide:mail";
  if (type === "phone") return "lucide:phone";
  if (type === "date") return "lucide:calendar";
  if (type === "textarea") return "lucide:notebook-text";
  if (type === "select") return "lucide:list-checks";
  if (type === "number") return "lucide:hash";
  return "lucide:type";
}

function needsOptions(type: string) {
  return ["select", "radio", "checkbox"].includes(type);
}

/** ---------------- Editor ---------------- */
const editorFormRef = ref<any>(null);

const editor = ref<{
  open: boolean;
  isEdit: boolean;
  targetTmpId: string | null;
  form: EditorField;
}>({
  open: false,
  isEdit: false,
  targetTmpId: null,
  form: {
    _tmpId: crypto.randomUUID(),
    id: "",
    key: "",
    label: "",
    fieldType: "text",
    validationJson: { required: false },
    optionsJson: null,
    isActive: true,
  },
});

const fieldTypeItems = [
  "text",
  "email",
  "phone",
  "number",
  "date",
  "textarea",
  "select",
  "radio",
  "checkbox",
];

const rules = {
  required: (v: any) => (!!v ? true : "Required"),
  key: (v: string) =>
    /^[a-z0-9_]+$/.test(String(v || "")) ||
    "Use lowercase letters, numbers, underscore",
};

function openEditor(field: DraftField) {
  const exists = draft.value.fields.some((f) => f._tmpId === field._tmpId);

  editor.value.open = true;
  editor.value.isEdit = exists;
  editor.value.targetTmpId = field._tmpId;

  const cloned = JSON.parse(JSON.stringify(field)) as DraftField;

  editor.value.form = {
    ...(cloned as any),
    validationJson:
      cloned.validationJson && typeof cloned.validationJson === "object"
        ? cloned.validationJson
        : { required: false },
    optionsJson: Array.isArray(cloned.optionsJson) ? cloned.optionsJson : null,
  };

  if (
    needsOptions(editor.value.form.fieldType) &&
    !Array.isArray(editor.value.form.optionsJson)
  ) {
    editor.value.form.optionsJson = [];
  }
}

function closeEditor() {
  editor.value.open = false;
}

function addOption() {
  if (!Array.isArray(editor.value.form.optionsJson))
    editor.value.form.optionsJson = [];
  editor.value.form.optionsJson.push({
    label: "",
    value: "",
  } as OrganizationUserFieldOption);
}

function removeOption(i: number) {
  editor.value.form.optionsJson = (editor.value.form.optionsJson || []).filter(
    (_, idx) => idx !== i,
  );
}

async function applyEditor() {
  const res = await editorFormRef.value?.validate?.();
  if (res?.valid === false) return;

  const f = editor.value.form;

  // options handling
  const optionsJson = needsOptions(f.fieldType)
    ? (f.optionsJson || []).filter((o) => o?.label || o?.value)
    : null;

  const updated: DraftField = {
    ...(f as any),
    optionsJson,
    validationJson: f.validationJson, // keep object (or set to null if you want when empty)
  };

  const idx = draft.value.fields.findIndex(
    (x) => x._tmpId === editor.value.targetTmpId,
  );
  if (idx >= 0) draft.value.fields[idx] = updated;
  else draft.value.fields.push(updated);

  closeEditor();
}

// drag
const drag = ref({
  fromTmpId: "" as string,
  overTmpId: "" as string,
});

const isDragging = computed(() => !!drag.value.fromTmpId);
const canDrag = computed(() => !search.value?.trim()); // disable reorder during search

function moveFieldByTmpId(fromTmpId: string, toTmpId: string) {
  if (!fromTmpId || !toTmpId) return;
  if (fromTmpId === toTmpId) return;

  const fromIndex = draft.value.fields.findIndex((f) => f._tmpId === fromTmpId);
  const toIndex = draft.value.fields.findIndex((f) => f._tmpId === toTmpId);
  if (fromIndex < 0 || toIndex < 0) return;

  const next = [...draft.value.fields];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  draft.value.fields = next;
}

function onDragStartField(tmpId: string, e: DragEvent) {
  if (!canDrag.value) {
    e.preventDefault();
    return;
  }

  drag.value.fromTmpId = tmpId;
  drag.value.overTmpId = tmpId;

  // for Firefox compatibility
  e.dataTransfer?.setData("text/plain", tmpId);
  e.dataTransfer?.setDragImage?.(
    (e.target as HTMLElement) ?? new Image(),
    0,
    0,
  );
  if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
}

function onDragOverField(tmpId: string, e: DragEvent) {
  if (!drag.value.fromTmpId) return;
  e.preventDefault();
  drag.value.overTmpId = tmpId;
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
}

function onDropField(tmpId: string, e: DragEvent) {
  e.preventDefault();
  const from =
    drag.value.fromTmpId || e.dataTransfer?.getData("text/plain") || "";
  const to = tmpId;
  moveFieldByTmpId(from, to);
  resetDrag();
}

function resetDrag() {
  drag.value.fromTmpId = "";
  drag.value.overTmpId = "";
}

onMounted(async () => {
  if (!openLocal.value) return;
  await reload();
});

watch(openLocal, async (v) => {
  if (!v) return;
  if (organizationUserFieldsStore.setting)
    toDraft(organizationUserFieldsStore.setting);
  else await reload();
});
</script>

<style scoped>
.border {
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.dialog-card {
  overflow: hidden; /* important: prevent whole card scrolling */
}
.dialog-header,
.dialog-footer {
  background: rgb(var(--v-theme-surface));
}
.dialog-body {
  height: calc(80vh - 140px); /* header+footer space */
  max-height: calc(80vh - 140px);
  overflow: auto; /* only content scrolls */
}
.truncate {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.field-row {
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.field-row.is-over {
  outline: 1px solid rgba(var(--v-theme-primary), 0.35);
  background: rgba(var(--v-theme-primary), 0.06);
}

.field-row.is-dragging {
  opacity: 0.55;
}

.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}
</style>
