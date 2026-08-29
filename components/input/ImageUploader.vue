<template>
  <div class="image-uploader">
    <div
      class="image-uploader__surface"
      :class="[
        ratioClass,
        {
          'image-uploader__surface--disabled': disabled,
          'image-uploader__surface--dragging': isDragging,
          'image-uploader__surface--error': !!displayError,
        },
      ]"
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
        class="image-uploader__input"
        type="file"
        accept="image/*"
        :name="name"
        :disabled="disabled || loading"
        @change="onInputChange"
      />

      <v-img
        v-if="previewUrl"
        :src="previewUrl"
        class="image-uploader__image"
        cover
      />

      <div v-else class="image-uploader__empty">
        <v-icon icon="lucide:image-plus" size="34" />
        <span>{{ label }}</span>
        <small>{{ hint }}</small>
      </div>

      <div v-if="loading" class="image-uploader__loading">
        <v-progress-circular indeterminate size="26" />
      </div>

      <div class="image-uploader__actions" @click.stop>
        <v-tooltip text="Upload image">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="lucide:upload"
              size="small"
              color="primary"
              variant="flat"
              :disabled="disabled || loading"
              @click="openFileDialog"
            />
          </template>
        </v-tooltip>

        <v-tooltip v-if="previewUrl" text="Preview image">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="lucide:maximize-2"
              size="small"
              color="surface"
              variant="flat"
              :disabled="disabled || loading"
              @click="dialog = true"
            />
          </template>
        </v-tooltip>

        <v-tooltip v-if="previewUrl && clearable" text="Remove image">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :icon="removePending ? 'lucide:rotate-ccw' : 'lucide:trash-2'"
              size="small"
              :color="removePending ? 'warning' : 'error'"
              variant="flat"
              :disabled="disabled || loading"
              @click="toggleRemove"
            />
          </template>
        </v-tooltip>
      </div>
    </div>

    <div v-if="showMeta" class="image-uploader__meta">
      <div class="min-w-0">
        <div class="image-uploader__title">{{ label }}</div>
        <div class="image-uploader__text">
          {{ fileLabel }}
        </div>
      </div>
      <v-chip
        v-if="removePending"
        size="x-small"
        color="warning"
        variant="tonal"
      >
        Remove on save
      </v-chip>
    </div>

    <div v-if="displayError" class="image-uploader__error">
      {{ displayError }}
    </div>

    <v-dialog v-model="dialog" fullscreen transition="fade-transition">
      <v-card color="black" flat>
        <v-toolbar color="transparent" density="comfortable">
          <v-spacer />
          <v-btn icon="lucide:x" variant="text" color="white" @click="dialog = false" />
        </v-toolbar>
        <div class="image-uploader__dialog-body">
          <img v-if="previewUrl" :src="previewUrl" :alt="label" />
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";

type ImageUploaderChangePayload = {
  file: File | null;
  remove: boolean;
};

const props = withDefaults(
  defineProps<{
    modelValue?: File | null;
    src?: string | null;
    name?: string;
    label?: string;
    hint?: string;
    ratio?: "square" | "wide" | "portrait" | "free" | string;
    maxSize?: number;
    disabled?: boolean;
    loading?: boolean;
    error?: string | null;
    clearable?: boolean;
    showMeta?: boolean;
  }>(),
  {
    modelValue: null,
    src: null,
    name: "image",
    label: "Image",
    hint: "PNG, JPG, or WEBP",
    ratio: "wide",
    maxSize: 0,
    disabled: false,
    loading: false,
    error: null,
    clearable: true,
    showMeta: false,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: File | null): void;
  (e: "change", payload: ImageUploaderChangePayload): void;
  (e: "changed", payload: ImageUploaderChangePayload): void;
  (e: "remove"): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const dialog = ref(false);
const isDragging = ref(false);
const removePending = ref(false);
const objectUrl = ref<string | null>(null);
const localError = ref<string | null>(null);
const selectedName = ref("");

const ratioClass = computed(() => {
  if (props.ratio === "free") return "image-uploader__surface--free";
  if (props.ratio === "square") return "image-uploader__surface--square";
  if (props.ratio === "portrait") return "image-uploader__surface--portrait";
  return "image-uploader__surface--wide";
});

const previewUrl = computed(() => {
  if (removePending.value) return null;
  return objectUrl.value || props.src || null;
});

const displayError = computed(() => localError.value || props.error || "");
const showMeta = computed(() => props.showMeta);

const fileLabel = computed(() => {
  if (removePending.value) return "Image marked for removal";
  if (selectedName.value) return selectedName.value;
  if (props.src) return "Current image";
  return "No image selected";
});

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

  if (!file.type.startsWith("image/")) {
    localError.value = "Select an image file.";
    return;
  }

  if (props.maxSize > 0 && file.size > props.maxSize) {
    localError.value = `Image must be ${formatBytes(props.maxSize)} or smaller.`;
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

function emitChange(payload: ImageUploaderChangePayload): void {
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
.image-uploader {
  display: grid;
  gap: 10px;
}

.image-uploader__surface {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 100%;
  min-height: 180px;
  border: 1px dashed rgba(148, 163, 184, 0.45);
  border-radius: 14px;
  background: #f8fafc;
  cursor: pointer;
  transition:
    border-color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}

.image-uploader__surface--wide {
  aspect-ratio: 16 / 9;
}

.image-uploader__surface--square {
  aspect-ratio: 1;
}

.image-uploader__surface--portrait {
  aspect-ratio: 4 / 5;
}

.image-uploader__surface--free {
  aspect-ratio: auto;
}

.image-uploader__surface:hover,
.image-uploader__surface--dragging {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.04);
}

.image-uploader__surface--error {
  border-color: rgb(var(--v-theme-error));
}

.image-uploader__surface--disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.image-uploader__input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.image-uploader__image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.image-uploader__empty {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 24px;
  color: #64748b;
  text-align: center;
}

.image-uploader__empty span {
  color: #1f2937;
  font-weight: 700;
}

.image-uploader__empty small {
  font-size: 0.78rem;
}

.image-uploader__actions {
  position: absolute;
  right: 12px;
  bottom: 12px;
  z-index: 2;
  display: inline-flex;
  gap: 8px;
}

.image-uploader__loading {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.72);
}

.image-uploader__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.image-uploader__title {
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 700;
}

.image-uploader__text {
  overflow: hidden;
  color: #64748b;
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-uploader__error {
  color: rgb(var(--v-theme-error));
  font-size: 0.78rem;
}

.image-uploader__dialog-body {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 48px);
  padding: 24px;
}

.image-uploader__dialog-body img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
