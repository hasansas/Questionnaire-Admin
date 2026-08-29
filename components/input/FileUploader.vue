<template>
  <div class="file-uploader">
    <audio
      v-if="type === 'audio' && previewUrl"
      class="file-uploader__audio"
      controls
      :src="previewUrl"
    />

    <div
      class="file-uploader__surface"
      :class="{
        'file-uploader__surface--disabled': disabled,
        'file-uploader__surface--dragging': isDragging,
        'file-uploader__surface--error': !!displayError,
      }"
      role="button"
      tabindex="0"
      @click="openFileDialog"
      @keydown.enter.prevent="openFileDialog"
      @keydown.space.prevent="openFileDialog"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        class="file-uploader__input"
        type="file"
        :name="name"
        :accept="accept"
        :disabled="disabled || loading"
        @change="onInputChange"
      />

      <v-avatar
        size="36"
        rounded="lg"
        class="file-uploader__icon"
        :color="displayError ? 'error' : 'primary'"
        variant="tonal"
      >
        <v-icon :icon="fileIcon" size="20" />
      </v-avatar>

      <div class="file-uploader__copy">
        <div class="file-uploader__label">{{ label }}</div>
        <div class="file-uploader__name">
          {{ fileLabel }}
        </div>
      </div>

      <v-chip
        v-if="removePending"
        size="x-small"
        color="warning"
        variant="tonal"
      >
        Remove
      </v-chip>

      <v-progress-circular v-if="loading" indeterminate size="22" />

      <div class="file-uploader__actions" @click.stop>
        <v-tooltip text="Upload file">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="lucide:upload"
              size="small"
              variant="text"
              :disabled="disabled || loading"
              @click="openFileDialog"
            />
          </template>
        </v-tooltip>

        <v-tooltip v-if="hasFile && clearable" text="Remove file">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :icon="removePending ? 'lucide:rotate-ccw' : 'lucide:trash-2'"
              size="small"
              variant="text"
              :color="removePending ? 'warning' : 'error'"
              :disabled="disabled || loading"
              @click="toggleRemove"
            />
          </template>
        </v-tooltip>
      </div>
    </div>

    <div v-if="displayError" class="file-uploader__error">
      {{ displayError }}
    </div>
    <div v-else-if="hint" class="file-uploader__hint">
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

type FileUploaderType = "file" | "document" | "image" | "audio" | "video";

type FileUploaderChangePayload = {
  file: File | null;
  remove: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: File | null;
    name?: string;
    type?: FileUploaderType;
    label?: string;
    hint?: string;
    accept?: string;
    maxSize?: number;
    fileName?: string | null;
    fileUrl?: string | null;
    disabled?: boolean;
    loading?: boolean;
    error?: string | null;
    clearable?: boolean;
  }>(),
  {
    modelValue: null,
    name: "file",
    type: "file",
    label: "File",
    hint: "",
    accept: "",
    maxSize: 0,
    fileName: null,
    fileUrl: null,
    disabled: false,
    loading: false,
    error: null,
    clearable: true,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: File | null): void;
  (e: "change", payload: FileUploaderChangePayload): void;
  (e: "changed", payload: FileUploaderChangePayload): void;
  (e: "remove"): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const removePending = ref(false);
const objectUrl = ref<string | null>(null);
const localError = ref<string | null>(null);
const selectedName = ref("");

const fileIcon = computed(() => {
  if (props.type === "image") return "lucide:image";
  if (props.type === "audio") return "lucide:headphones";
  if (props.type === "video") return "lucide:video";
  if (props.type === "document") return "lucide:file-text";
  return "lucide:paperclip";
});

const previewUrl = computed(() => {
  if (removePending.value) return null;
  return objectUrl.value || props.fileUrl || null;
});

const hasFile = computed(
  () => !!props.modelValue || !!props.fileName || !!props.fileUrl,
);

const fileLabel = computed(() => {
  if (removePending.value) return "File marked for removal";
  if (selectedName.value) return selectedName.value;
  if (props.fileName) return props.fileName;
  return "No file selected";
});

const displayError = computed(() => localError.value || props.error || "");

watch(
  () => props.modelValue,
  (file) => {
    setObjectUrl(file ?? null);
  },
  { immediate: true },
);

onBeforeUnmount(() => revokeObjectUrl());

function openFileDialog(): void {
  if (props.disabled || props.loading) return;
  inputRef.value?.click();
}

function onDragEnter(): void {
  if (props.disabled || props.loading) return;
  isDragging.value = true;
}

function onDragOver(): void {
  if (props.disabled || props.loading) return;
  isDragging.value = true;
}

function onDragLeave(event: DragEvent): void {
  const target = event.currentTarget as HTMLElement | null;
  const related = event.relatedTarget as Node | null;
  if (target && related && target.contains(related)) return;
  isDragging.value = false;
}

function onDrop(event: DragEvent): void {
  isDragging.value = false;
  if (props.disabled || props.loading) return;
  const file = event.dataTransfer?.files?.[0] ?? null;
  if (file) setFile(file);
}

function onInputChange(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  if (!file) return;
  setFile(file);
  input.value = "";
}

function setFile(file: File): void {
  localError.value = null;

  if (props.maxSize > 0 && file.size > props.maxSize) {
    localError.value = `File must be ${formatBytes(props.maxSize)} or smaller.`;
    return;
  }

  removePending.value = false;
  selectedName.value = file.name;
  setObjectUrl(file);
  emit("update:modelValue", file);
  emitChange({ file, remove: false });
}

function toggleRemove(): void {
  removePending.value = !removePending.value;
  const file = removePending.value ? null : props.modelValue ?? null;
  emit("update:modelValue", file);
  emitChange({ file, remove: removePending.value });
  if (removePending.value) emit("remove");
}

function emitChange(payload: FileUploaderChangePayload): void {
  emit("change", payload);
  emit("changed", payload);
}

function setObjectUrl(file: File | null): void {
  revokeObjectUrl();
  objectUrl.value = file ? URL.createObjectURL(file) : null;
  selectedName.value = file?.name ?? selectedName.value;
}

function revokeObjectUrl(): void {
  if (!objectUrl.value) return;
  URL.revokeObjectURL(objectUrl.value);
  objectUrl.value = null;
}

function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}
</script>

<style scoped lang="scss">
.file-uploader {
  display: grid;
  gap: 8px;
}

.file-uploader__audio {
  width: 100%;
}

.file-uploader__surface {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.file-uploader__surface:hover,
.file-uploader__surface--dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.file-uploader__surface--error {
  border-color: rgb(var(--v-theme-error));
}

.file-uploader__surface--disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.file-uploader__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.file-uploader__copy {
  min-width: 0;
}

.file-uploader__label {
  color: #1f2937;
  font-size: 0.84rem;
  font-weight: 700;
}

.file-uploader__name {
  overflow: hidden;
  color: #64748b;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-uploader__actions {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.file-uploader__error {
  color: rgb(var(--v-theme-error));
  font-size: 0.78rem;
}

.file-uploader__hint {
  color: #64748b;
  font-size: 0.78rem;
}

@media (max-width: 560px) {
  .file-uploader__surface {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .file-uploader__actions {
    grid-column: 1 / -1;
    justify-content: flex-end;
  }
}
</style>
