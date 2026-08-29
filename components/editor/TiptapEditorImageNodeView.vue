<template>
  <node-view-wrapper
    as="span"
    :class="['sb-img-wrap', `sb-img-wrap--${currentAlign}`]"
  >
    <span class="sb-img-frame" :class="{ 'sb-img-frame--on': selected }">
      <img
        ref="imgRef"
        :src="node.attrs.src"
        :alt="node.attrs.alt ?? ''"
        class="sb-img"
        :style="imgStyle"
        draggable="false"
      />

      <template v-if="selected">
        <!-- Alignment + size toolbar -->
        <span class="sb-img-toolbar">
          <button
            v-for="opt in ALIGN_OPTIONS"
            :key="opt.value"
            class="sb-img-btn"
            :class="{ 'sb-img-btn--on': currentAlign === opt.value }"
            :title="opt.title"
            @mousedown.prevent="setAlign(opt.value)"
          >
            <svg v-if="opt.value === 'none'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
            <svg v-else-if="opt.value === 'left'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="9" height="12" rx="1"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="3" y1="22" x2="16" y2="22"/></svg>
            <svg v-else-if="opt.value === 'center'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="3" width="10" height="12" rx="1"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="5" y1="22" x2="19" y2="22"/></svg>
            <svg v-else-if="opt.value === 'right'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="12" y="3" width="9" height="12" rx="1"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="8" y1="22" x2="21" y2="22"/></svg>
            <svg v-else-if="opt.value === 'inline'" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="8" height="14" rx="1"/><rect x="13" y="5" width="8" height="14" rx="1"/></svg>
          </button>
          <span class="sb-img-sep" />
          <span class="sb-img-dim">{{ dispWidth }}</span>
        </span>

        <!-- Right-edge resize handle -->
        <span class="sb-img-handle" @mousedown.prevent.stop="onHandleDown" />
      </template>
    </span>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const ALIGN_OPTIONS = [
  { value: 'none',   title: 'Full width' },
  { value: 'left',   title: 'Float left (text wraps right)' },
  { value: 'center', title: 'Centered' },
  { value: 'right',  title: 'Float right (text wraps left)' },
  { value: 'inline', title: 'Inline — place next to other inline images' },
]

// Width is tracked locally during drag and then persisted on mouseup
const liveWidth = ref<number | null>(props.node.attrs.width ?? null)
const imgRef = ref<HTMLImageElement | null>(null)

const currentAlign = computed<string>(() => props.node.attrs.align || 'none')

const imgStyle = computed(() => {
  const w = liveWidth.value
  if (!w) return {}
  return { width: `${w}px`, maxWidth: '100%', height: 'auto' }
})

const dispWidth = computed(() => {
  const w = liveWidth.value ?? imgRef.value?.naturalWidth
  return w ? `${w}px` : ''
})

function setAlign(value: string) {
  props.updateAttributes({ align: value })
}

// Resize drag
let dragStartX = 0
let dragStartWidth = 0
let rafId: number | null = null

function onHandleDown(e: MouseEvent) {
  dragStartX = e.clientX
  dragStartWidth =
    imgRef.value?.getBoundingClientRect().width ??
    liveWidth.value ??
    300

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e: MouseEvent) {
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(() => {
    const next = Math.max(40, Math.round(dragStartWidth + (e.clientX - dragStartX)))
    liveWidth.value = next
    rafId = null
  })
}

function onMouseUp() {
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null }
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (liveWidth.value !== null) {
    props.updateAttributes({ width: liveWidth.value })
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* --- wrapper alignment classes --- */
.sb-img-wrap {
  display: block;
  line-height: 0;
}
.sb-img-wrap--none    { display: block; }
.sb-img-wrap--center  { display: block; text-align: center; }
.sb-img-wrap--left    { display: block; }
.sb-img-wrap--right   { display: block; }
.sb-img-wrap--inline  { display: inline-block; vertical-align: top; }

/* --- frame (position: relative so toolbar + handle anchor to it) --- */
.sb-img-frame {
  position: relative;
  display: inline-block;
  line-height: 0;
  user-select: none;
}
.sb-img-wrap--none  .sb-img-frame { width: 100%; }
.sb-img-wrap--left  .sb-img-frame { float: left;  margin: 0 14px 8px 0; }
.sb-img-wrap--right .sb-img-frame { float: right; margin: 0 0 8px 14px; }

/* --- image itself --- */
.sb-img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  cursor: default;
}
.sb-img-wrap--none .sb-img { width: 100%; }

/* selection ring */
.sb-img-frame--on .sb-img {
  outline: 2px solid #6413F0;
  outline-offset: 2px;
}

/* --- alignment toolbar (floats above) --- */
.sb-img-toolbar {
  position: absolute;
  top: -38px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 6px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.14);
  white-space: nowrap;
  z-index: 200;
}
.sb-img-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.sb-img-btn:hover { background: rgba(100, 19, 240, 0.08); color: #6413F0; }
.sb-img-btn--on   { background: rgba(100, 19, 240, 0.13); color: #6413F0; }
.sb-img-sep {
  display: inline-block;
  width: 1px;
  height: 16px;
  margin: 0 4px;
  background: rgba(0, 0, 0, 0.1);
}
.sb-img-dim {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  letter-spacing: 0.02em;
  min-width: 34px;
  text-align: right;
}

/* --- right-edge resize handle --- */
.sb-img-handle {
  position: absolute;
  right: -5px;
  top: 50%;
  transform: translateY(-50%);
  width: 10px;
  height: 44px;
  border-radius: 5px;
  background: #6413F0;
  cursor: ew-resize;
  opacity: 0.85;
  transition: opacity 0.15s, transform 0.15s;
}
.sb-img-handle:hover {
  opacity: 1;
  transform: translateY(-50%) scaleX(1.2);
}
</style>
