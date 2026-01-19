<template>
  <v-card :rounded="isMobile ? 't-xl b-0' : 'xl'" class="sb-editor-card">
    <!-- Sticky Toolbar -->
    <div class="sb-editor-toolbar">
      <div class="d-flex align-center justify-space-between ga-3">
        <div class="min-w-0">
          <div class="text-h6 font-weight-black">
            {{ headerTitle }}
          </div>
          <div class="text-caption text-medium-emphasis">
            Build email content with drag & drop. Save HTML + design JSON.
          </div>
        </div>

        <div class="d-flex align-center ga-2">
          <v-btn rounded="lg" variant="outlined" @click="close"> Close </v-btn>

          <v-btn
            color="primary"
            rounded="lg"
            prepend-icon="lucide:save"
            :loading="saving"
            :disabled="!editorMounted"
            @click="onSave"
          >
            Save
          </v-btn>
        </div>
      </div>
    </div>

    <v-divider />

    <!-- 2-column body -->
    <v-card-text class="sb-editor-body pa-0">
      <v-form ref="formRef" class="sb-form" @submit.prevent>
        <div class="sb-editor-grid">
          <!-- LEFT: Meta form -->
          <div class="sb-meta d-flex flex-column">
            <div class="sb-meta-inner pa-4 flex-grow-1">
              <div class="d-flex align-center ga-2 mb-4">
                <v-avatar
                  size="32"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:settings-2" size="18" />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-black">
                    Template settings
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Configure header, sender and recipients.
                  </div>
                </div>
              </div>
              <!-- <v-divider class="mb-4" /> -->
              <v-row dense>
                <v-col cols="12">
                  <v-card
                    variant="flat"
                    rounded="lg"
                    class="bg-primary py-3 px-4 mb-4 d-flex align-center"
                  >
                    <v-icon icon="lucide:hash" size="18" class="mx-2" />
                    {{ draft.name }}
                  </v-card>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="draft.subject"
                    label="Subject"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="saving"
                    persistent-hint
                  >
                    <template #prepend-inner>
                      <v-icon icon="lucide:type" size="18" class="mx-2" />
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-textarea
                    v-model="draft.description"
                    label="Description"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="saving"
                    rows="2"
                  >
                    <template #prepend-inner>
                      <v-icon icon="lucide:align-left" size="18" class="mx-2" />
                    </template>
                  </v-textarea>
                </v-col>

                <v-col cols="12">
                  <v-divider class="my-2" />
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="draft.fromName"
                    label="From name"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="saving"
                    placeholder="SuperBazi"
                  >
                    <template #prepend-inner>
                      <v-icon icon="lucide:id-card" size="18" class="mx-2" />
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="draft.from"
                    label="From email"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="saving"
                    placeholder="no-reply@superbazi.com"
                  >
                    <template #prepend-inner>
                      <v-icon icon="lucide:at-sign" size="18" class="mx-2" />
                    </template>
                  </v-text-field>
                </v-col>

                <v-col cols="12">
                  <v-text-field
                    v-model="draft.cc"
                    label="CC"
                    variant="outlined"
                    density="comfortable"
                    rounded="lg"
                    :disabled="saving"
                    hint="Comma-separated emails"
                    persistent-hint
                  >
                    <template #prepend-inner>
                      <v-icon icon="lucide:forward" size="18" class="mx-2" />
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>
            </div>

            <div class="pa-4">
              <v-alert
                density="comfortable"
                variant="tonal"
                rounded="lg"
                color="primary"
                class="mt-2"
                icon="lucide:info"
              >
                Tip: Keep <b>From</b> consistent to improve deliverability.
              </v-alert>
            </div>
          </div>

          <!-- RIGHT: Builder full height -->
          <div class="sb-canvas">
            <div class="sb-canvas-head px-4 py-3">
              <div class="d-flex align-center justify-space-between ga-2">
                <div class="d-flex align-center ga-2">
                  <v-avatar
                    size="32"
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:pen-tool" size="18" />
                  </v-avatar>
                  <div>
                    <div class="text-subtitle-1 font-weight-black">
                      Email builder
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Drag blocks, edit copy, export HTML.
                    </div>
                  </div>
                </div>

                <v-chip size="small" rounded="lg" variant="outlined">
                  Unlayer
                </v-chip>
              </div>
            </div>

            <v-divider />

            <div class="sb-builder sb-builder--fill">
              <client-only>
                <EmailEditor
                  ref="emailEditorRef"
                  :min-height="editorMinHeight"
                  :appearance="editorAppearance"
                  :options="editorOptions"
                  v-on:load="handleEditorLoaded"
                  v-on:ready="handleEditorReady"
                />
              </client-only>

              <div v-if="!editorMounted" class="sb-builder-overlay">
                <v-progress-circular indeterminate />
                <div class="text-body-2 text-medium-emphasis mt-3">
                  Loading builder…
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, toRaw } from "vue";
import {
  type EmailTemplateModel,
  type EmailTemplateCode,
} from "@/models/email-template";

type BuilderMode = "create" | "edit";

type DraftMeta = Pick<
  EmailTemplateModel,
  "name" | "description" | "subject" | "cc" | "bcc" | "from" | "fromName"
>;

const props = defineProps<{
  modelValue: boolean;
  mode: BuilderMode;
  template?: EmailTemplateModel | null;
  saving?: boolean;
  titleCreate?: string;
  titleEdit?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (
    e: "save",
    payload: {
      meta: DraftMeta;
      contentHtml: string;
      contentCode: EmailTemplateCode;
    }
  ): void;
  (e: "preview", html: string): void;
  (e: "close"): void;
}>();

const { isMobile } = useIsMobile();
const saving = computed(() => !!props.saving);

const headerTitle = computed(() => {
  if (props.mode === "create") return props.titleCreate ?? "Add Template";
  return props.titleEdit ?? "Edit Template";
});

const rules = {
  required: (v: any) => !!String(v ?? "").trim() || "Required",
};

const formRef = ref<any>(null);

// vue-email-editor ref
const emailEditorRef = ref<any>(null);
const editorMounted = ref(false);
const pendingDesign = ref<EmailTemplateCode | null>(null);

const editorMinHeight = computed(() => (isMobile.value ? "70vh" : "640px"));
const editorAppearance = computed(() => ({
  theme: "light",
  panels: { tools: { dock: "right" } },
}));
const editorOptions = computed(() => ({
  displayMode: "email",
}));

const draft = ref<DraftMeta>({
  name: "",
  description: null,
  subject: null,
  cc: null,
  bcc: null,
  from: null,
  fromName: null,
});

function setFromTemplate(t?: EmailTemplateModel | null) {
  if (!t) {
    draft.value = {
      name: "",
      description: null,
      subject: null,
      cc: null,
      bcc: null,
      from: null,
      fromName: null,
    };
    pendingDesign.value = null;
    editorMounted.value = false;
    return;
  }

  draft.value = {
    name: t.name,
    description: t.description ?? null,
    subject: t.subject ?? null,
    cc: t.cc ?? null,
    bcc: t.bcc ?? null,
    from: t.from ?? null,
    fromName: t.fromName ?? null,
  };

  // ✅ load saved design JSON directly
  pendingDesign.value = (t.contentCode as EmailTemplateCode) ?? null;
  editorMounted.value = false;
}

onMounted(() => {
  setFromTemplate(props.template ?? null);

  if (pendingDesign.value && emailEditorRef.value?.editor?.loadDesign) {
    emailEditorRef.value.editor.loadDesign(pendingDesign.value);
    pendingDesign.value = null;
  }
});

async function validateForm() {
  const form = formRef.value;
  if (!form?.validate) return true;
  const res = await form.validate();
  return !!res?.valid;
}

function exportHtml(): Promise<{ html: string; design: Record<string, any> }> {
  return new Promise((resolve, reject) => {
    const editor = emailEditorRef.value?.editor;
    if (!editor?.exportHtml) return reject(new Error("Builder not ready"));

    editor.exportHtml((data: any) => {
      if (!data?.html) return reject(new Error("Export failed"));
      resolve({ html: data.html, design: data.design ?? {} });
    });
  });
}

function handleEditorLoaded() {
  if (pendingDesign.value && emailEditorRef.value?.editor?.loadDesign) {
    const emailDesign = JSON.parse(JSON.stringify(toRaw(pendingDesign.value)));
    emailEditorRef.value.editor.loadDesign(emailDesign);
    pendingDesign.value = null;
  }
}

function handleEditorReady() {
  editorMounted.value = true;
  if (pendingDesign.value && emailEditorRef.value?.editor?.loadDesign) {
    const emailDesign = JSON.parse(JSON.stringify(toRaw(pendingDesign.value)));
    emailEditorRef.value.editor.loadDesign(emailDesign);
    pendingDesign.value = null;
  }
}

function close() {
  emit("update:modelValue", false);
  emit("close");
}

async function onPreview() {
  try {
    const { html } = await exportHtml();
    emit("preview", html);
  } catch (e: any) {
    emit(
      "preview",
      `<div style="padding:16px;font-family:Arial">Preview failed: ${
        e?.message ?? "Unknown error"
      }</div>`
    );
  }
}

async function onSave() {
  const valid = await validateForm();
  if (!valid) return;

  try {
    const { html, design } = await exportHtml();

    emit("save", {
      meta: {
        name: draft.value.name.trim(),
        description: (draft.value.description ?? null)?.toString() ?? null,
        subject: (draft.value.subject ?? null)?.toString() ?? null,
        cc: (draft.value.cc ?? null)?.toString() ?? null,
        bcc: (draft.value.bcc ?? null)?.toString() ?? null,
        from: (draft.value.from ?? null)?.toString() ?? null,
        fromName: (draft.value.fromName ?? null)?.toString() ?? null,
      },
      contentHtml: html,
      // ✅ Unlayer design JSON directly into contentCode
      contentCode: design ?? null,
    });
  } catch (e) {
    console.error(e);
  }
}

defineExpose({ exportHtml });

// expose methods used in template
// (if your template already references these names)
</script>

<style scoped lang="scss" scopped>
.sb-editor-card {
  overflow: hidden;

  /* Make the whole card a “viewport-like” container */
  display: flex;
  flex-direction: column;

  /* You can tune this value. Works great inside dialog/bottom-sheet */
  height: 92vh;
}

/* Sticky toolbar stays on top */
.sb-editor-toolbar {
  position: sticky;
  top: 0;
  z-index: 5;
  padding: 16px;
  background: rgb(var(--v-theme-surface));
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

/* Card body must take remaining height */
.sb-editor-body {
  flex: 1;
  min-height: 0; /* IMPORTANT for iframe/flex children */
}

/* Two columns fill all available height */
.sb-editor-grid {
  height: 100%;
  display: grid;
  grid-template-columns: 420px 1fr;
  min-height: 0; /* IMPORTANT */
}

/* Mobile stack */
@media (max-width: 960px) {
  .sb-editor-card {
    height: 92vh;
  }

  .sb-editor-grid {
    grid-template-columns: 1fr;
  }
}

/* LEFT: scroll area fills full height */
.sb-meta {
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgba(var(--v-theme-on-surface), 0.02);
  min-height: 0;
}

.sb-meta-inner {
  height: 100%;
  overflow: auto;
}

/* RIGHT: make the canvas a flex column that can shrink */
.sb-canvas {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0; /* IMPORTANT */
}

.sb-canvas-head {
  background: rgb(var(--v-theme-surface));
}

/* Builder wrapper takes remaining height */
.sb-builder--fill {
  margin: 16px;
  flex: 1;
  min-height: 0; /* IMPORTANT */
  position: relative;

  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  > div {
    height: 100% !important;
  }
}

/* ✅ Force vue-email-editor + iframe to 100% height */
.sb-builder--fill :deep(.email-editor) {
  height: 100% !important;
  min-height: 0 !important;
}

.sb-builder--fill :deep(iframe) {
  height: 100% !important;
  width: 100% !important;
  display: block;
}

/* Loading overlay */
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
</style>
