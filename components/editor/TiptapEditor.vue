<!-- src/components/editor/TiptapEditor.vue -->

<!--
Usage (Nuxt 3 / SSR-safe)

<ClientOnly>
  <TiptapEditor
    v-model="form.description"
    hint="Tip: use Code mode to add custom classes manually."
    toolbar-preset="common"              // 'minimal' | 'common' | 'full' (default: 'common')
    :show-toolbar-preset-switch="false"  // set true to let admin switch presets from toolbar
    :toolbar-icon-only="false"           // render toolbar actions as icon-only buttons
    :show-history-buttons="true"         // show undo / redo buttons
    toolbar-size="small"                 // 'x-small' | 'small' | 'default' | 'large' | 'x-large'
    :min-height="260"                    // number (px) or string (e.g. '320px')
    :max-height="420"                    // number (px) or string (e.g. '60vh') — default 420px if not provided

    // Image options (URL OR Select file -> compress to WEBP base64 -> insert)
    :max-image-width="1200"              // recommend 1000–1200 for web
    :image-quality="0.82"                // 0..1 (lower = smaller)
    :max-image-mb="1.2"                  // guard before processing
    :disabled="loading"
  />
</ClientOnly>
-->
<template>
  <div class="tiptap-editor">
    <v-card variant="outlined" rounded="xl">
      <!-- Toolbar -->
      <v-card-text class="py-3">
        <div class="d-flex flex-wrap align-center ga-2">
          <v-btn
            :size="toolbarSize"
            rounded="lg"
            variant="tonal"
            :class="toolbarButtonClass"
            :prepend-icon="toolbarIconOnly ? undefined : showCode ? 'lucide:eye' : 'lucide:code-2'"
            :aria-label="showCode ? 'Preview' : 'Code'"
            :title="showCode ? 'Preview' : 'Code'"
            @click="toggleMode"
          >
            <v-icon
              v-if="toolbarIconOnly"
              :icon="showCode ? 'lucide:eye' : 'lucide:code-2'"
              size="18"
            />
            <template v-if="!toolbarIconOnly">
              {{ showCode ? "Preview" : "Code" }}
            </template>
          </v-btn>

          <!-- <v-divider vertical class="mx-1" /> -->

          <v-menu v-if="showToolbarPresetSwitch" location="bottom start">
            <template #activator="{ props: menuProps }">
              <v-btn
                v-bind="menuProps"
                :size="toolbarSize"
                rounded="lg"
                variant="tonal"
                :class="toolbarButtonClass"
                :prepend-icon="toolbarIconOnly ? undefined : 'lucide:sliders-horizontal'"
                :disabled="showCode"
                aria-label="Toolbar preset"
                :title="toolbarLabel"
              >
                <v-icon
                  v-if="toolbarIconOnly"
                  icon="lucide:sliders-horizontal"
                  size="18"
                />
                <template v-if="!toolbarIconOnly">
                  {{ toolbarLabel }}
                </template>
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                title="Minimal"
                @click="toolbarPresetLocal = 'minimal'"
              />
              <v-list-item
                title="Common"
                @click="toolbarPresetLocal = 'common'"
              />
              <v-list-item title="Full" @click="toolbarPresetLocal = 'full'" />
            </v-list>
          </v-menu>

          <v-divider vertical class="mx-1" />

          <template v-for="btn in visibleButtons" :key="btn.key">
            <v-btn
              :size="toolbarSize"
              rounded="lg"
              :variant="btn.variant ?? 'tonal'"
              :class="toolbarButtonClass"
              :prepend-icon="toolbarIconOnly ? undefined : btn.icon"
              :disabled="showCode || disabled || btn.disabled?.()"
              :color="btn.active?.() ? 'primary' : undefined"
              :aria-label="btn.label"
              :title="btn.label"
              @click="btn.onClick"
            >
              <v-icon v-if="toolbarIconOnly" :icon="btn.icon" size="18" />
              <template v-if="!toolbarIconOnly">
                {{ btn.label }}
              </template>
            </v-btn>
          </template>

          <v-menu location="bottom start">
            <template #activator="{ props: colorMenuProps }">
              <v-btn
                v-bind="colorMenuProps"
                :size="toolbarSize"
                rounded="lg"
                variant="tonal"
                :class="toolbarButtonClass"
                :prepend-icon="toolbarIconOnly ? undefined : 'lucide:palette'"
                :disabled="showCode || disabled"
                aria-label="Text color"
                title="Text color"
              >
                <v-icon
                  v-if="toolbarIconOnly"
                  icon="lucide:palette"
                  size="18"
                />
                <template v-if="!toolbarIconOnly">Color</template>
              </v-btn>
            </template>

            <v-card rounded="lg" class="pa-2">
              <div class="d-flex ga-1">
                <button
                  v-for="color in TEXT_COLOR_PRESETS"
                  :key="color.value"
                  type="button"
                  class="sb-text-color-swatch"
                  :style="{ background: color.value }"
                  :title="color.label"
                  @click="applyTextColor(color.value)"
                />
                <button
                  type="button"
                  class="sb-text-color-swatch sb-text-color-swatch--clear"
                  title="Clear color"
                  @click="clearTextColor"
                >
                  <v-icon icon="lucide:x" size="14" />
                </button>
              </div>
            </v-card>
          </v-menu>

          <v-spacer />

          <v-btn
            v-if="showHistoryButtons"
            :size="toolbarSize"
            rounded="lg"
            variant="tonal"
            :class="toolbarButtonClass"
            :prepend-icon="toolbarIconOnly ? undefined : 'lucide:undo-2'"
            :disabled="showCode || disabled || !editor?.can().undo()"
            aria-label="Undo"
            title="Undo"
            @click="cmd((e) => e.chain().focus().undo().run())"
          >
            <v-icon v-if="toolbarIconOnly" icon="lucide:undo-2" size="18" />
            <template v-if="!toolbarIconOnly">Undo</template>
          </v-btn>

          <v-btn
            v-if="showHistoryButtons"
            :size="toolbarSize"
            rounded="lg"
            variant="tonal"
            :class="toolbarButtonClass"
            :prepend-icon="toolbarIconOnly ? undefined : 'lucide:redo-2'"
            :disabled="showCode || disabled || !editor?.can().redo()"
            aria-label="Redo"
            title="Redo"
            @click="cmd((e) => e.chain().focus().redo().run())"
          >
            <v-icon v-if="toolbarIconOnly" icon="lucide:redo-2" size="18" />
            <template v-if="!toolbarIconOnly">Redo</template>
          </v-btn>
        </div>
      </v-card-text>

      <v-divider />

      <!-- Content -->
      <v-card-text class="pa-0">
        <div v-if="!showCode" class="editor-surface" :style="surfaceStyle">
          <EditorContent :editor="editor" />
        </div>

        <div v-else class="pa-4" :style="codeWrapStyle">
          <v-textarea
            v-model="htmlDraft"
            label="HTML"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            auto-grow
            rows="10"
            hide-details="auto"
            hint="Edit HTML directly (e.g., add classes). Click Preview to apply."
            persistent-hint
            prepend-inner-icon="lucide:code-2"
          />
          <div class="d-flex justify-end ga-2 mt-3">
            <v-btn
              rounded="lg"
              variant="tonal"
              class="sb-toolbar-btn"
              @click="resetHtmlDraft"
            >
              Reset
            </v-btn>
            <v-btn
              rounded="lg"
              color="primary"
              variant="flat"
              @click="applyHtmlDraft"
            >
              Apply HTML
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <div v-if="hint" class="text-caption text-medium-emphasis mt-2">
      {{ hint }}
    </div>

    <!-- Link dialog -->
    <v-dialog v-model="dialogs.link" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-bold">Insert link</div>
          <v-btn icon variant="text" @click="dialogs.link = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-6">
          <v-text-field
            v-model="linkForm.href"
            label="URL"
            placeholder="https://example.com"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details="auto"
            prepend-inner-icon="lucide:link"
          />
          <v-text-field
            v-model="linkForm.text"
            label="Text (optional)"
            placeholder="e.g. Read more"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details="auto"
            class="mt-3"
            prepend-inner-icon="lucide:text"
          />
          <div class="d-flex justify-end ga-2 mt-5">
            <v-btn
              variant="tonal"
              class="sb-toolbar-btn"
              rounded="lg"
              @click="removeLink"
            >
              Remove link
            </v-btn>
            <v-btn
              color="primary"
              variant="flat"
              rounded="lg"
              @click="applyLink"
            >
              Apply
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Table dialog -->
    <v-dialog v-model="dialogs.table" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-bold">
            {{ tableForm.editMode ? "Edit table" : "Insert table" }}
          </div>
          <v-btn icon variant="text" @click="dialogs.table = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <!-- INSERT: size picker -->
          <template v-if="!tableForm.editMode">
            <div class="d-flex ga-3 mb-4">
              <v-text-field
                v-model.number="tableForm.rows"
                label="Rows"
                type="number"
                min="1"
                max="20"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details
              />
              <v-text-field
                v-model.number="tableForm.cols"
                label="Columns"
                type="number"
                min="1"
                max="10"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details
              />
            </div>
            <v-switch
              v-model="tableForm.withHeaderRow"
              label="Header row"
              density="compact"
              color="primary"
              hide-details
              class="mb-5"
            />
          </template>

          <!-- EDIT: row / column / cell operations -->
          <template v-else>
            <div class="text-overline text-medium-emphasis mb-2">Rows</div>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:arrow-up"
                @click="tableCmd((e) => e.chain().focus().addRowBefore().run())"
              >Before</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:arrow-down"
                @click="tableCmd((e) => e.chain().focus().addRowAfter().run())"
              >After</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                color="error"
                rounded="lg"
                prepend-icon="lucide:trash-2"
                @click="tableCmd((e) => e.chain().focus().deleteRow().run())"
              >Delete row</v-btn>
            </div>

            <div class="text-overline text-medium-emphasis mb-2">Columns</div>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:arrow-left"
                @click="tableCmd((e) => e.chain().focus().addColumnBefore().run())"
              >Before</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:arrow-right"
                @click="tableCmd((e) => e.chain().focus().addColumnAfter().run())"
              >After</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                color="error"
                rounded="lg"
                prepend-icon="lucide:trash-2"
                @click="tableCmd((e) => e.chain().focus().deleteColumn().run())"
              >Delete col</v-btn>
            </div>

            <div class="text-overline text-medium-emphasis mb-2">Cells</div>
            <div class="d-flex flex-wrap ga-2 mb-4">
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:table-2"
                @click="tableCmd((e) => e.chain().focus().mergeCells().run())"
              >Merge</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:layout-panel-left"
                @click="tableCmd((e) => e.chain().focus().splitCell().run())"
              >Split</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:rows"
                @click="tableCmd((e) => e.chain().focus().toggleHeaderRow().run())"
              >Header row</v-btn>
              <v-btn
                size="small"
                variant="tonal"
                rounded="lg"
                prepend-icon="lucide:columns"
                @click="tableCmd((e) => e.chain().focus().toggleHeaderColumn().run())"
              >Header col</v-btn>
            </div>

            <v-divider class="mb-5" />
          </template>

          <!-- STYLE: border color -->
          <div class="text-overline text-medium-emphasis mb-2">Border color</div>
          <div class="d-flex align-center ga-2 flex-wrap mb-4">
            <button
              v-for="c in TABLE_BORDER_PRESETS"
              :key="c.value"
              class="sb-color-swatch"
              :class="{ 'sb-color-swatch--on': tableForm.borderColor === c.value }"
              :style="{
                background: c.value || 'transparent',
                outline: !c.value ? '1px dashed #bbb' : 'none',
              }"
              :title="c.label"
              @click="tableForm.borderColor = c.value"
            />
            <div
              class="sb-color-picker-wrap"
              :style="{ background: tableForm.borderColor || '#e0e0e0' }"
              title="Custom color"
            >
              <input
                type="color"
                class="sb-color-native"
                :value="tableForm.borderColor || '#000000'"
                @input="tableForm.borderColor = ($event.target as HTMLInputElement).value"
              />
            </div>
            <v-text-field
              v-model="tableForm.borderColor"
              density="compact"
              variant="outlined"
              rounded="lg"
              hide-details
              placeholder="e.g. #1a1a1a"
              style="max-width: 130px; flex-shrink: 0"
            />
          </div>

          <!-- STYLE: width -->
          <div class="text-overline text-medium-emphasis mb-2">Table width</div>
          <div class="d-flex ga-2 align-center flex-wrap mb-2">
            <v-btn
              v-for="opt in TABLE_WIDTH_PRESETS"
              :key="opt.value"
              size="small"
              :variant="tableForm.tableWidth === opt.value ? 'flat' : 'tonal'"
              :color="tableForm.tableWidth === opt.value ? 'primary' : undefined"
              rounded="lg"
              @click="tableForm.tableWidth = opt.value"
            >{{ opt.label }}</v-btn>
            <v-text-field
              v-if="!tableWidthIsPreset"
              v-model="tableForm.tableWidth"
              density="compact"
              variant="outlined"
              rounded="lg"
              hide-details
              placeholder="e.g. 600px"
              style="max-width: 120px; flex-shrink: 0"
            />
            <v-btn
              size="small"
              variant="tonal"
              rounded="lg"
              @click="tableForm.tableWidth = 'custom'"
            >Custom</v-btn>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-space-between align-center mt-6">
            <v-btn
              v-if="tableForm.editMode"
              variant="tonal"
              color="error"
              rounded="lg"
              prepend-icon="lucide:trash-2"
              @click="deleteTable"
            >Delete table</v-btn>
            <v-spacer />
            <div class="d-flex ga-2">
              <v-btn variant="tonal" rounded="lg" @click="dialogs.table = false">
                {{ tableForm.editMode ? "Close" : "Cancel" }}
              </v-btn>
              <v-btn
                v-if="!tableForm.editMode"
                color="primary"
                variant="flat"
                rounded="lg"
                @click="applyTable"
              >Insert</v-btn>
              <v-btn
                v-else
                color="primary"
                variant="flat"
                rounded="lg"
                @click="applyTableStyle"
              >Apply style</v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Image dialog: URL OR Select+Compress -->
    <v-dialog v-model="dialogs.image" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="text-subtitle-1 font-weight-bold">Insert image</div>
          <v-btn icon variant="text" @click="dialogs.image = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-6">
          <v-tabs v-model="imageTab" density="compact" class="mb-4">
            <v-tab value="url">From URL</v-tab>
            <v-tab value="file">Upload</v-tab>
          </v-tabs>

          <v-window v-model="imageTab">
            <!-- URL tab -->
            <v-window-item value="url">
              <v-text-field
                v-model="imageForm.url"
                label="Image URL"
                placeholder="https://..."
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                prepend-inner-icon="lucide:image"
                :disabled="disabled"
                @update:model-value="onUrlChange"
              />

              <v-text-field
                v-model="imageForm.alt"
                label="Alt text (optional)"
                placeholder="Short description"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                class="mt-3"
                prepend-inner-icon="lucide:accessibility"
                :disabled="disabled"
              />

              <v-alert
                v-if="imageForm.error"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mt-4"
                :text="imageForm.error"
              />

              <div v-if="imageForm.preview" class="mt-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  Preview
                </div>
                <v-img
                  :src="imageForm.preview"
                  height="180"
                  rounded="lg"
                  cover
                />
              </div>
            </v-window-item>

            <!-- File tab -->
            <v-window-item value="file">
              <v-file-input
                v-model="imageForm.file"
                label="Select image"
                accept="image/*"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                prepend-inner-icon="lucide:image-plus"
                :disabled="disabled"
                @update:model-value="onPickImageFile"
              />

              <div class="d-flex flex-wrap align-center ga-2 mt-3">
                <v-chip size="small" variant="tonal" rounded="lg">
                  Max width: {{ maxImageWidth }}px
                </v-chip>
                <v-chip size="small" variant="tonal" rounded="lg">
                  Quality: {{ Math.round(imageQuality * 100) }}%
                </v-chip>
                <v-chip size="small" variant="tonal" rounded="lg">
                  Max size: {{ maxImageMb }}MB
                </v-chip>
              </div>

              <v-text-field
                v-model="imageForm.alt"
                label="Alt text (optional)"
                placeholder="Short description"
                density="comfortable"
                variant="outlined"
                rounded="lg"
                hide-details="auto"
                class="mt-4"
                prepend-inner-icon="lucide:accessibility"
                :disabled="disabled"
              />

              <v-alert
                v-if="imageForm.error"
                type="error"
                variant="tonal"
                rounded="lg"
                class="mt-4"
                :text="imageForm.error"
              />

              <v-alert
                v-else-if="imageForm.preview && imageForm.meta"
                type="info"
                variant="tonal"
                rounded="lg"
                class="mt-4"
              >
                <div class="d-flex flex-column ga-1">
                  <div class="text-body-2 font-weight-semibold">
                    Compressed preview ready
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ imageForm.meta.width }}×{{ imageForm.meta.height }} ·
                    {{ imageForm.meta.mime }} ·
                    {{ formatBytes(imageForm.meta.bytes) }}
                  </div>
                </div>
              </v-alert>

              <div v-if="imageForm.preview" class="mt-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  Preview
                </div>
                <v-img
                  :src="imageForm.preview"
                  height="180"
                  rounded="lg"
                  cover
                />
              </div>
            </v-window-item>
          </v-window>

          <div class="d-flex justify-end ga-2 mt-6">
            <v-btn
              rounded="lg"
              variant="tonal"
              class="sb-toolbar-btn"
              :disabled="disabled"
              @click="resetImageForm"
            >
              Reset
            </v-btn>

            <v-btn
              rounded="lg"
              color="primary"
              variant="flat"
              :disabled="disabled || !finalImageSrc"
              @click="applyImage"
            >
              Insert
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import { Editor, EditorContent, VueNodeViewRenderer } from "@tiptap/vue-3";
import { Mark, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import TiptapEditorImageNodeView from "./TiptapEditorImageNodeView.vue";

// Table with optional border-color + width attributes
const StyledTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      borderColor: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-border-color") || null,
        renderHTML: (attrs) => {
          if (!attrs.borderColor) return {};
          return {
            "data-border-color": attrs.borderColor,
            style: `--sb-tbl-border: ${attrs.borderColor}`,
          };
        },
      },
      tableWidth: {
        default: "100%",
        parseHTML: (el) => el.style.width || "100%",
        renderHTML: (attrs) => ({ style: `width: ${attrs.tableWidth || "100%"}` }),
      },
    };
  },
});

const TextColorMark = Mark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => element.style.color || null,
        renderHTML: (attributes) => {
          if (!attributes.color) return {};
          return { style: `color: ${attributes.color}` };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[style*=color]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes), 0];
  },
});

const TABLE_BORDER_PRESETS = [
  { label: "None", value: "" },
  { label: "Black", value: "#1a1a1a" },
  { label: "Dark gray", value: "#616161" },
  { label: "Light gray", value: "#bdbdbd" },
  { label: "Blue", value: "#1976d2" },
  { label: "Green", value: "#388e3c" },
  { label: "Indigo", value: "#6413F0" },
];

const TABLE_WIDTH_PRESETS = [
  { label: "100%", value: "100%" },
  { label: "75%", value: "75%" },
  { label: "50%", value: "50%" },
  { label: "Auto", value: "auto" },
];

const TEXT_COLOR_PRESETS = [
  { label: "Slate", value: "#1f2937" },
  { label: "Red", value: "#dc2626" },
  { label: "Amber", value: "#d97706" },
  { label: "Green", value: "#16a34a" },
  { label: "Blue", value: "#2563eb" },
  { label: "Purple", value: "#7c3aed" },
];

const ResizableImageExtension = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (el) => el.getAttribute("width") ?? el.style.width?.replace("px", "") ?? null,
        renderHTML: (attrs) => attrs.width ? { width: attrs.width, style: `width:${attrs.width}px;max-width:100%;height:auto;` } : {},
      },
      align: {
        default: "none",
        parseHTML: (el) => el.dataset.align ?? "none",
        renderHTML: (attrs) => ({ "data-align": attrs.align ?? "none" }),
      },
    };
  },
  addNodeView() {
    return VueNodeViewRenderer(TiptapEditorImageNodeView);
  },
});

type ToolbarPreset = "minimal" | "common" | "full";
type ToolbarSize = "x-small" | "small" | "default" | "large" | "x-large";
type ImageTab = "url" | "file";

const props = withDefaults(
  defineProps<{
    modelValue?: string | null;
    placeholder?: string;
    hint?: string;
    minHeight?: number | string;
    maxHeight?: number | string | null;
    disabled?: boolean;
    toolbarPreset?: ToolbarPreset;
    showToolbarPresetSwitch?: boolean;
    toolbarIconOnly?: boolean;
    showHistoryButtons?: boolean;
    toolbarSize?: ToolbarSize;

    maxImageWidth?: number;
    imageQuality?: number;
    maxImageMb?: number;
  }>(),
  {
    modelValue: "",
    placeholder: "Write something…",
    hint: "",
    minHeight: 260,
    maxHeight: null,
    disabled: false,
    toolbarPreset: "common",
    showToolbarPresetSwitch: false,
    toolbarIconOnly: false,
    showHistoryButtons: true,
    toolbarSize: "default",

    maxImageWidth: 1200,
    imageQuality: 0.82,
    maxImageMb: 1.2,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", v: string): void;
  (e: "blur"): void;
  (e: "focus"): void;
}>();

const disabled = computed(() => !!props.disabled);
const toolbarIconOnly = computed(() => !!props.toolbarIconOnly);
const showHistoryButtons = computed(() => !!props.showHistoryButtons);
const toolbarSize = computed(() => props.toolbarSize);
const toolbarButtonClass = computed(() => [
  "sb-toolbar-btn",
  { "sb-toolbar-btn--icon-only": toolbarIconOnly.value },
  toolbarIconOnly.value ? `sb-toolbar-btn--${toolbarSize.value}` : "",
]);

/** Code mode */
const showCode = ref(false);
const htmlDraft = ref("");

/** Toolbar preset */
const toolbarPresetLocal = ref<ToolbarPreset>(props.toolbarPreset);
watch(
  () => props.toolbarPreset,
  (v) => (toolbarPresetLocal.value = v),
);
const toolbarLabel = computed(() => {
  const v = toolbarPresetLocal.value;
  if (v === "minimal") return "Minimal";
  if (v === "full") return "Full";
  return "Common";
});

/** Dialogs */
const dialogs = reactive({ link: false, image: false, table: false });

/** Link form */
const linkForm = reactive({ href: "", text: "" });

/** Image form (URL + File) */
const imageTab = ref<ImageTab>("url");
const imageForm = reactive({
  url: "",
  file: null as File | File[] | null,
  base64: "", // from compress
  preview: "", // url or base64
  alt: "",
  error: "",
  meta: null as null | {
    width: number;
    height: number;
    mime: string;
    bytes: number;
  },
});

/** Table form */
const tableForm = reactive({
  editMode: false,
  rows: 3,
  cols: 3,
  withHeaderRow: true,
  borderColor: "",
  tableWidth: "100%",
  customWidth: "",
});
const tableWidthIsPreset = computed(() =>
  TABLE_WIDTH_PRESETS.some((p) => p.value === tableForm.tableWidth),
);

const maxImageWidth = computed(() => props.maxImageWidth);
const imageQuality = computed(() => props.imageQuality);
const maxImageMb = computed(() => props.maxImageMb);

const finalImageSrc = computed(() => {
  if (imageTab.value === "url") return imageForm.url.trim();
  return imageForm.base64.trim();
});

/** Editor */
const editor = new Editor({
  content: props.modelValue || "",
  editable: !props.disabled,
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      HTMLAttributes: {
        rel: "noopener noreferrer nofollow",
        target: "_blank",
      },
    }),
    ResizableImageExtension.configure({
      allowBase64: true,
      HTMLAttributes: { class: "sb-editor-image" },
    }),
    TextColorMark,
    StyledTable.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  editorProps: {
    attributes: { class: "tiptap-content" },
  },
  onUpdate({ editor }) {
    if (showCode.value) return;
    emit("update:modelValue", editor.getHTML());
  },
  onBlur() {
    emit("blur");
  },
  onFocus() {
    emit("focus");
  },
});

watch(
  () => props.disabled,
  (v) => editor.setEditable(!v),
  { immediate: true },
);

watch(
  () => props.modelValue,
  (v) => {
    if (showCode.value) return;
    const next = v ?? "";
    if (next !== editor.getHTML()) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  },
);

/** Sizing */
function toPx(v: number | string | null | undefined, fallback?: string) {
  if (v === null || v === undefined || v === "") return fallback;
  return typeof v === "number" ? `${v}px` : v;
}

const surfaceStyle = computed(() => {
  const minH = toPx(props.minHeight, "260px");
  const maxH = toPx(props.maxHeight, "420px");
  return {
    minHeight: minH,
    maxHeight: maxH,
    overflow: "auto",
    padding: "16px",
  } as Record<string, string>;
});

const codeWrapStyle = computed(() => {
  const maxH = toPx(props.maxHeight, "420px");
  return { maxHeight: maxH, overflow: "auto" } as Record<string, string>;
});

/** Toolbar types */
type ToolbarButton = {
  key: string;
  label: string;
  icon: string;
  variant?: "tonal" | "outlined" | "text" | "flat" | "plain";
  onClick: () => void;
  active?: () => boolean;
  disabled?: () => boolean;
};

function cmd(fn: (e: Editor) => any) {
  if (disabled.value) return;
  fn(editor);
}

function isActive(name: string, attrs?: any) {
  return editor?.isActive(name, attrs) ?? false;
}

function applyTextColor(color: string) {
  cmd((e) => e.chain().focus().setMark("textColor", { color }).run());
}

function clearTextColor() {
  cmd((e) => e.chain().focus().unsetMark("textColor").run());
}

/** Code mode */
function toggleMode() {
  showCode.value = !showCode.value;
  if (showCode.value) htmlDraft.value = editor.getHTML();
  else applyHtmlDraft();
}

function applyHtmlDraft() {
  const html = (htmlDraft.value ?? "").toString();
  editor.commands.setContent(html || "", { emitUpdate: false });
  emit("update:modelValue", editor.getHTML());
}

function resetHtmlDraft() {
  htmlDraft.value = editor.getHTML();
}

/** Link */
function openLinkDialog() {
  const current = editor.getAttributes("link")?.href ?? "";
  linkForm.href = current;
  linkForm.text = "";
  dialogs.link = true;
}

function applyLink() {
  const href = (linkForm.href ?? "").toString().trim();
  const text = (linkForm.text ?? "").toString();

  if (!href) return;

  if (text.trim()) {
    cmd((e) =>
      e
        .chain()
        .focus()
        .insertContent(`<a href="${href}">${escapeHtml(text)}</a>`)
        .run(),
    );
  } else {
    cmd((e) =>
      e.chain().focus().extendMarkRange("link").setLink({ href }).run(),
    );
  }

  dialogs.link = false;
}

function removeLink() {
  cmd((e) => e.chain().focus().unsetLink().run());
  dialogs.link = false;
}

/** Table */
function openTableDialog() {
  const inTable = editor.isActive("table");
  tableForm.editMode = inTable;
  if (inTable) {
    const attrs = editor.getAttributes("table");
    tableForm.borderColor = attrs.borderColor ?? "";
    tableForm.tableWidth = attrs.tableWidth ?? "100%";
  } else {
    tableForm.rows = 3;
    tableForm.cols = 3;
    tableForm.withHeaderRow = true;
    tableForm.borderColor = "";
    tableForm.tableWidth = "100%";
  }
  dialogs.table = true;
}

function applyTable() {
  const rows = Math.max(1, Math.min(20, tableForm.rows || 3));
  const cols = Math.max(1, Math.min(10, tableForm.cols || 3));
  editor
    .chain()
    .focus()
    .insertTable({ rows, cols, withHeaderRow: tableForm.withHeaderRow })
    .updateAttributes("table", {
      borderColor: tableForm.borderColor || null,
      tableWidth: tableForm.tableWidth || "100%",
    })
    .run();
  dialogs.table = false;
}

function applyTableStyle() {
  editor
    .chain()
    .focus()
    .updateAttributes("table", {
      borderColor: tableForm.borderColor || null,
      tableWidth: tableForm.tableWidth || "100%",
    })
    .run();
  dialogs.table = false;
}

function deleteTable() {
  cmd((e) => e.chain().focus().deleteTable().run());
  dialogs.table = false;
}

function tableCmd(fn: (e: Editor) => any) {
  fn(editor);
}

/** Image */
function openImageDialog() {
  resetImageForm();
  dialogs.image = true;
}

function resetImageForm() {
  imageTab.value = "url";
  imageForm.url = "";
  imageForm.file = null;
  imageForm.base64 = "";
  imageForm.preview = "";
  imageForm.alt = "";
  imageForm.error = "";
  imageForm.meta = null;
}

function onUrlChange(v: string) {
  imageForm.error = "";
  imageForm.base64 = "";
  imageForm.preview = (v ?? "").toString().trim();
  imageForm.meta = null;
}

function pickFirstFile(input: File | File[] | null | undefined) {
  if (!input) return null;
  return Array.isArray(input) ? input[0] : input;
}

async function onPickImageFile(input: File | File[] | null) {
  imageForm.error = "";
  imageForm.base64 = "";
  imageForm.preview = "";
  imageForm.meta = null;

  const file = pickFirstFile(input);
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageForm.error = "Selected file is not an image.";
    return;
  }

  const sizeMb = file.size / (1024 * 1024);
  if (sizeMb > props.maxImageMb) {
    imageForm.error = `Image too large (${sizeMb.toFixed(2)}MB). Max allowed is ${props.maxImageMb}MB.`;
    imageForm.file = null;
    return;
  }

  try {
    const result = await compressImageToWebpBase64(file, {
      maxWidth: props.maxImageWidth,
      quality: props.imageQuality,
    });

    imageForm.base64 = result.dataUrl;
    imageForm.preview = result.dataUrl;
    imageForm.meta = {
      width: result.width,
      height: result.height,
      mime: "image/webp",
      bytes: result.bytes,
    };
  } catch (e: any) {
    imageForm.error = e?.message || "Failed to process image.";
  }
}

function applyImage() {
  const src = finalImageSrc.value;
  const alt = (imageForm.alt ?? "").toString().trim();
  if (!src) return;

  cmd((e) => e.chain().focus().setImage({ src, alt }).run());
  dialogs.image = false;
  resetImageForm();
}

/** Compression */
async function compressImageToWebpBase64(
  file: File,
  opts: { maxWidth: number; quality: number },
): Promise<{ dataUrl: string; width: number; height: number; bytes: number }> {
  const img = await loadImageFromFile(file);
  const { targetW, targetH } = fitWithin(img.width, img.height, opts.maxWidth);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported.");

  ctx.drawImage(img, 0, 0, targetW, targetH);

  const dataUrl = canvas.toDataURL("image/webp", clamp01(opts.quality));
  const bytes = estimateDataUrlBytes(dataUrl);

  return { dataUrl, width: targetW, height: targetH, bytes };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image."));
    };
    img.src = url;
  });
}

function fitWithin(w: number, h: number, maxW: number) {
  if (!w || !h) return { targetW: maxW, targetH: maxW };
  if (w <= maxW) return { targetW: w, targetH: h };
  const ratio = maxW / w;
  return { targetW: Math.round(w * ratio), targetH: Math.round(h * ratio) };
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0.82;
  return Math.max(0, Math.min(1, n));
}

function estimateDataUrlBytes(dataUrl: string) {
  const i = dataUrl.indexOf("base64,");
  if (i === -1) return 0;
  const b64 = dataUrl.slice(i + 7);
  return Math.floor((b64.length * 3) / 4);
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let idx = 0;
  while (v >= 1024 && idx < units.length - 1) {
    v /= 1024;
    idx++;
  }
  return `${v.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reset(value = "") {
  // reset editor content without triggering update loops
  editor.commands.setContent(value || "", { emitUpdate: false });
  htmlDraft.value = value || "";
  showCode.value = false;
}

// expose methods to parent
defineExpose({ reset });

/** Buttons */
const minimalButtons = computed<ToolbarButton[]>(() => [
  {
    key: "bold",
    label: "Bold",
    icon: "lucide:bold",
    onClick: () => cmd((e) => e.chain().focus().toggleBold().run()),
    active: () => isActive("bold"),
  },
  {
    key: "italic",
    label: "Italic",
    icon: "lucide:italic",
    onClick: () => cmd((e) => e.chain().focus().toggleItalic().run()),
    active: () => isActive("italic"),
  },
  {
    key: "underline",
    label: "Underline",
    icon: "lucide:underline",
    onClick: () => cmd((e) => e.chain().focus().toggleUnderline().run()),
    active: () => isActive("underline"),
  },
  {
    key: "bullets",
    label: "Bullets",
    icon: "lucide:list",
    onClick: () => cmd((e) => e.chain().focus().toggleBulletList().run()),
    active: () => isActive("bulletList"),
  },
  {
    key: "link",
    label: "Link",
    icon: "lucide:link",
    onClick: () => openLinkDialog(),
    active: () => isActive("link"),
  },
]);

const commonButtons = computed<ToolbarButton[]>(() => [
  ...minimalButtons.value,
  {
    key: "h2",
    label: "H2",
    icon: "lucide:heading-2",
    onClick: () =>
      cmd((e) => e.chain().focus().toggleHeading({ level: 2 }).run()),
    active: () => isActive("heading", { level: 2 }),
  },
  {
    key: "h3",
    label: "H3",
    icon: "lucide:heading-3",
    onClick: () =>
      cmd((e) => e.chain().focus().toggleHeading({ level: 3 }).run()),
    active: () => isActive("heading", { level: 3 }),
  },
  {
    key: "ordered",
    label: "Numbered",
    icon: "lucide:list-ordered",
    onClick: () => cmd((e) => e.chain().focus().toggleOrderedList().run()),
    active: () => isActive("orderedList"),
  },
  {
    key: "quote",
    label: "Quote",
    icon: "lucide:quote",
    onClick: () => cmd((e) => e.chain().focus().toggleBlockquote().run()),
    active: () => isActive("blockquote"),
  },
  {
    key: "image",
    label: "Image",
    icon: "lucide:image",
    onClick: () => openImageDialog(),
  },
  {
    key: "table",
    label: "Table",
    icon: "lucide:table",
    onClick: () => openTableDialog(),
    active: () => isActive("table"),
  },
]);

const fullButtons = computed<ToolbarButton[]>(() => [
  ...commonButtons.value,
  {
    key: "h1",
    label: "H1",
    icon: "lucide:heading-1",
    onClick: () =>
      cmd((e) => e.chain().focus().toggleHeading({ level: 1 }).run()),
    active: () => isActive("heading", { level: 1 }),
  },
  {
    key: "strike",
    label: "Strike",
    icon: "lucide:strikethrough",
    onClick: () => cmd((e) => e.chain().focus().toggleStrike().run()),
    active: () => isActive("strike"),
  },
  {
    key: "codeBlock",
    label: "Code",
    icon: "lucide:code",
    onClick: () => cmd((e) => e.chain().focus().toggleCodeBlock().run()),
    active: () => isActive("codeBlock"),
  },
  {
    key: "hr",
    label: "Divider",
    icon: "lucide:minus",
    onClick: () => cmd((e) => e.chain().focus().setHorizontalRule().run()),
  },
  {
    key: "clear",
    label: "Clear",
    icon: "lucide:eraser",
    onClick: () =>
      cmd((e) => e.chain().focus().clearNodes().unsetAllMarks().run()),
  },
]);

const visibleButtons = computed(() => {
  if (toolbarPresetLocal.value === "minimal") return minimalButtons.value;
  if (toolbarPresetLocal.value === "full") return fullButtons.value;
  return commonButtons.value;
});

onBeforeUnmount(() => {
  editor?.destroy();
});
</script>

<style scoped>
.sb-toolbar-btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.sb-toolbar-btn--icon-only {
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
}

.sb-toolbar-btn--x-small {
  width: 28px;
  height: 28px;
  min-width: 28px;
}

.sb-toolbar-btn--small {
  width: 34px;
  height: 34px;
  min-width: 34px;
}

.sb-toolbar-btn--large {
  width: 44px;
  height: 44px;
  min-width: 44px;
}

.sb-toolbar-btn--x-large {
  width: 52px;
  height: 52px;
  min-width: 52px;
}

:deep(.tiptap-content) {
  outline: none;
  line-height: 1.7;
  font-size: 0.95rem;
}

:deep(.tiptap-content p) {
  margin: 0 0 12px;
}

:deep(.tiptap-content h1),
:deep(.tiptap-content h2),
:deep(.tiptap-content h3) {
  margin: 18px 0 10px;
  line-height: 1.2;
}

:deep(.tiptap-content ul),
:deep(.tiptap-content ol) {
  padding-left: 22px;
  margin: 0 0 12px;
}

:deep(.tiptap-content blockquote) {
  margin: 0 0 12px;
  padding-left: 14px;
  border-left: 3px solid rgba(0, 0, 0, 0.12);
}

:deep(.tiptap-content pre) {
  margin: 0 0 12px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.04);
  overflow: auto;
}

:deep(.sb-editor-image) {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
}

/* Paragraphs that hold inline/block images should not add extra margin */
:deep(.tiptap-content p:has(.sb-img-wrap)) {
  margin-bottom: 4px;
}

/* ── Table ─────────────────────────────────────────── */
:deep(.tiptap-content .tableWrapper) {
  overflow-x: auto;
  margin: 0 0 16px;
}

:deep(.tiptap-content table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 0;
}

:deep(.tiptap-content table) th,
:deep(.tiptap-content table) td {
  border: 1px solid rgba(0, 0, 0, 0.14);
  padding: 8px 12px;
  min-width: 60px;
  position: relative;
  vertical-align: top;
  text-align: left;
  line-height: 1.5;
}

:deep(.tiptap-content table th) {
  background: rgba(0, 0, 0, 0.04);
  font-weight: 600;
}

/* Custom border color via CSS variable */
:deep(.tiptap-content table[data-border-color]) th,
:deep(.tiptap-content table[data-border-color]) td {
  border-color: var(--sb-tbl-border);
}

/* ProseMirror selected cell highlight */
:deep(.tiptap-content .selectedCell::after) {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(100, 19, 240, 0.09);
  pointer-events: none;
}

/* Column resize handle */
:deep(.tiptap-content .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(100, 19, 240, 0.45);
  cursor: col-resize;
  pointer-events: none;
}

/* ── Color swatch & native picker ───────────────────── */
.sb-color-swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform 0.15s, box-shadow 0.15s;
}
.sb-color-swatch:hover {
  transform: scale(1.15);
}
.sb-color-swatch--on {
  box-shadow: 0 0 0 2px #6413F0;
}
.sb-color-picker-wrap {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(0, 0, 0, 0.14);
  flex-shrink: 0;
  cursor: pointer;
}
.sb-color-native {
  position: absolute;
  inset: -6px;
  width: calc(100% + 12px);
  height: calc(100% + 12px);
  border: none;
  padding: 0;
  cursor: pointer;
  opacity: 0;
}
</style>
