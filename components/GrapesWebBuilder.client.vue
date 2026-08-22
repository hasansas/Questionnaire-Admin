<template>
  <div class="gjs-builder" :class="themeClass">
    <div ref="editorEl"></div>
  </div>
</template>

<!-- Named exports for consumers -->
<script lang="ts">
export interface BuilderPanelButton {
  id: string
  label: string
  title?: string
  onClick: (editor: Editor) => void | Promise<void>
}
</script>

<script setup lang="ts">
import { computed, ref, onBeforeUnmount, onMounted, watch } from 'vue'
import type { Editor, ProjectData } from 'grapesjs'

const props = defineProps<{
  projectData?: ProjectData | null
  html?: string | null
  css?: string | null
  theme?: 'dark' | 'light'
  panelButtons?: BuilderPanelButton[]
}>()

const emit = defineEmits<{
  ready: [editor: Editor]
  'theme-change': [theme: 'dark' | 'light']
}>()

const editorEl = ref<HTMLElement | null>(null)

let editor: Editor | null = null

const activeTheme = ref<'dark' | 'light'>(props.theme ?? 'dark')

const themeClass = computed(() =>
  activeTheme.value === 'light' ? 'gjs-builder--light' : 'gjs-builder--dark'
)

watch(
  () => props.theme,
  (theme) => {
    if (!theme) return
    activeTheme.value = theme
  }
)

function escapeTextarea(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function loadProjectData(projectData: ProjectData): void {
  if (!editor) return
  editor.loadProjectData(projectData)
}

function loadHtmlCss(html: string, css?: string | null): void {
  if (!editor) return
  editor.setComponents(html || '')
  editor.setStyle(css || '')
}

function registerImportExportCommands(editor: Editor): void {
  editor.Commands.add('open-import-html-modal', {
    run(editor) {
      const currentHtml = editor.getHtml() ?? ''
      const currentCss = editor.getCss() ?? ''

      const modalContent = document.createElement('div')

      modalContent.innerHTML = `
        <div class="gjs-builder-modal">
          <p class="gjs-builder-modal__hint">
            Paste body HTML and CSS. Avoid full doctype, html, head, and body wrappers.
          </p>

          <label class="gjs-builder-modal__label">HTML</label>
          <textarea
            id="gjs-import-html"
            class="gjs-builder-modal__textarea gjs-builder-modal__textarea--html"
          >${escapeTextarea(currentHtml)}</textarea>

          <label class="gjs-builder-modal__label gjs-builder-modal__label--spaced">CSS</label>
          <textarea
            id="gjs-import-css"
            class="gjs-builder-modal__textarea gjs-builder-modal__textarea--css"
          >${escapeTextarea(currentCss)}</textarea>

          <div class="gjs-builder-modal__actions">
            <button id="gjs-import-cancel" type="button" class="gjs-builder-modal__button">
              Cancel
            </button>
            <button id="gjs-import-apply" type="button" class="gjs-builder-modal__button gjs-builder-modal__button--primary">
              Apply
            </button>
          </div>
        </div>
      `

      editor.Modal.open({ title: 'Import HTML / CSS', content: modalContent })

      const htmlInput = modalContent.querySelector<HTMLTextAreaElement>('#gjs-import-html')
      const cssInput = modalContent.querySelector<HTMLTextAreaElement>('#gjs-import-css')

      modalContent
        .querySelector<HTMLButtonElement>('#gjs-import-cancel')
        ?.addEventListener('click', () => editor.Modal.close())

      modalContent
        .querySelector<HTMLButtonElement>('#gjs-import-apply')
        ?.addEventListener('click', () => {
          editor.setComponents(htmlInput?.value ?? '')
          editor.setStyle(cssInput?.value ?? '')
          editor.Modal.close()
        })
    }
  })

  editor.Commands.add('open-export-html-modal', {
    run(editor) {
      const html = editor.getHtml() ?? ''
      const css = editor.getCss() ?? ''
      const projectJson = editor.getProjectData() ?? {}

      const modalContent = document.createElement('div')

      modalContent.innerHTML = `
        <div class="gjs-builder-modal">
          <label class="gjs-builder-modal__label">HTML</label>
          <textarea readonly
            class="gjs-builder-modal__textarea gjs-builder-modal__textarea--html"
          >${escapeTextarea(html)}</textarea>

          <label class="gjs-builder-modal__label gjs-builder-modal__label--spaced">CSS</label>
          <textarea readonly
            class="gjs-builder-modal__textarea gjs-builder-modal__textarea--css"
          >${escapeTextarea(css)}</textarea>

          <label class="gjs-builder-modal__label gjs-builder-modal__label--spaced">Project JSON</label>
          <textarea readonly
            class="gjs-builder-modal__textarea gjs-builder-modal__textarea--json"
          >${escapeTextarea(JSON.stringify(projectJson, null, 2))}</textarea>
        </div>
      `

      editor.Modal.open({ title: 'Export HTML / CSS / JSON', content: modalContent })
    }
  })

  editor.Panels.addButton('options', {
    id: 'import-html',
    label: panelIcon('lucide:upload', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
    command: 'open-import-html-modal',
    attributes: { title: 'Import HTML/CSS into canvas' }
  })

  editor.Panels.addButton('options', {
    id: 'export-html',
    label: panelIcon('lucide:download', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    command: 'open-export-html-modal',
    attributes: { title: 'Export HTML/CSS/JSON' }
  })
}

/** Injects page-level action buttons (Save, Load, Preview, etc.) into the GrapesJS options panel. */
function registerCustomPanelButtons(editor: Editor): void {
  if (!props.panelButtons?.length) return

  props.panelButtons.forEach((btn) => {
    editor.Commands.add(`custom:${btn.id}`, {
      run(ed) {
        Promise.resolve(btn.onClick(ed)).catch(console.error)
      }
    })

    editor.Panels.addButton('options', {
      id: btn.id,
      label: btn.label,
      command: `custom:${btn.id}`,
      attributes: { title: btn.title ?? btn.label }
    })
  })
}

/** Renders an Iconify/Lucide-style SVG for GrapesJS HTML-only controls. */
function lucideIcon(name: string, paths: string): string {
  return `<span class="gjs-lucide-icon" data-icon="lucide:${name}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>`
}

/** Renders a compact Lucide icon for GrapesJS panel buttons. */
function panelIcon(name: string, paths: string): string {
  return `<span class="gjs-panel-icon" data-icon="${name}" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg></span>`
}

/** Replaces preset-webpage oversized Basic block icons with compact Lucide icons. */
function registerPresetBlockIconOverrides(editor: Editor): void {
  const blockIcons = [
    {
      id: 'link-block',
      icon: lucideIcon('link', `
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      `)
    },
    {
      id: 'quote',
      icon: lucideIcon('quote', `
        <path d="M16 3a2 2 0 0 0-2 2v6h6V5a2 2 0 0 0-2-2z"/>
        <path d="M8 3a2 2 0 0 0-2 2v6h6V5a2 2 0 0 0-2-2z"/>
        <path d="M20 11a8 8 0 0 1-8 8"/>
        <path d="M12 11a8 8 0 0 1-8 8"/>
      `)
    },
    {
      id: 'text-basic',
      icon: lucideIcon('align-left', `
        <line x1="3" y1="6" x2="21" y2="6"/>
        <line x1="3" y1="12" x2="18" y2="12"/>
        <line x1="3" y1="18" x2="15" y2="18"/>
      `)
    }
  ]

  blockIcons.forEach(({ id, icon }) => {
    editor.BlockManager.get(id)?.set('media', icon)
  })
}

/** Adds custom content blocks into the Basic category alongside the preset-webpage blocks. */
function registerCustomBasicBlocks(editor: Editor): void {
  editor.BlockManager.add('basic-container', {
    label: 'Container',
    category: 'Basic',
    media: lucideIcon('panel-top', `
      <rect x="2" y="3" width="20" height="18" rx="2" stroke-dasharray="4 2"/>
      <line x1="6" y1="9" x2="18" y2="9"/>
      <line x1="6" y1="13" x2="14" y2="13"/>
      <line x1="6" y1="17" x2="10" y2="17"/>
    `),
    content: `
      <div class="container-block">
        <h2>Container Title</h2>
        <p>Write your content here...</p>
      </div>
    `
  })

  editor.BlockManager.add('basic-card', {
    label: 'Card',
    category: 'Basic',
    media: lucideIcon('panel-top-open', `
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="7" y1="10" x2="17" y2="10"/>
      <line x1="7" y1="14" x2="13" y2="14"/>
    `),
    content: `
      <div class="card-block">
        <h3>Card Title</h3>
        <p>Card description goes here...</p>
      </div>
    `
  })

  editor.BlockManager.add('basic-heading', {
    label: 'Heading',
    category: 'Basic',
    media: lucideIcon('heading', `
      <line x1="4" y1="5" x2="4" y2="19"/>
      <line x1="20" y1="5" x2="20" y2="19"/>
      <line x1="4" y1="12" x2="20" y2="12"/>
      <line x1="4" y1="17" x2="20" y2="17" stroke-width="3"/>
    `),
    content: `<h2 class="heading-block">Heading Text</h2>`
  })

  editor.BlockManager.add('basic-paragraph', {
    label: 'Paragraph',
    category: 'Basic',
    media: lucideIcon('align-left', `
      <line x1="3" y1="6" x2="21" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="3" y1="14" x2="21" y2="14"/>
      <line x1="3" y1="18" x2="15" y2="18"/>
    `),
    content: `
      <p class="paragraph-block">
        Write your paragraph content here. This block is useful for invoice notes, report sections, descriptions, or disclaimers.
      </p>
    `
  })

  editor.BlockManager.add('basic-button', {
    label: 'Button',
    category: 'Basic',
    media: lucideIcon('badge', `
      <rect x="3" y="8" width="18" height="8" rx="4"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="12" y1="9.5" x2="12" y2="14.5"/>
    `),
    content: `<a href="#" class="button-block">Button Text</a>`
  })

  editor.BlockManager.add('basic-divider', {
    label: 'Divider',
    category: 'Basic',
    media: lucideIcon('minus', `
      <line x1="3" y1="7" x2="21" y2="7" stroke-opacity="0.35"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke-width="2.5"/>
      <line x1="3" y1="17" x2="21" y2="17" stroke-opacity="0.35"/>
    `),
    content: `<hr class="divider-block" />`
  })

  editor.BlockManager.add('basic-spacer', {
    label: 'Spacer',
    category: 'Basic',
    media: lucideIcon('move-vertical', `
      <line x1="12" y1="3" x2="12" y2="21"/>
      <polyline points="8,7 12,3 16,7"/>
      <polyline points="8,17 12,21 16,17"/>
      <line x1="4" y1="12" x2="20" y2="12" stroke-dasharray="3 2" stroke-opacity="0.5"/>
    `),
    content: `<div class="spacer-block"></div>`
  })

  editor.BlockManager.add('basic-list', {
    label: 'List',
    category: 'Basic',
    media: lucideIcon('list', `
      <circle cx="4.5" cy="7" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
      <circle cx="4.5" cy="17" r="1.5" fill="currentColor" stroke="none"/>
      <line x1="8" y1="7" x2="21" y2="7"/>
      <line x1="8" y1="12" x2="21" y2="12"/>
      <line x1="8" y1="17" x2="17" y2="17"/>
    `),
    content: `
      <ul class="list-block">
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
    `
  })

  editor.BlockManager.add('basic-table', {
    label: 'Table',
    category: 'Basic',
    media: lucideIcon('table', `
      <rect x="2" y="4" width="20" height="16" rx="1"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
      <line x1="9" y1="10" x2="9" y2="20"/>
      <line x1="16" y1="10" x2="16" y2="20"/>
    `),
    content: `
      <table class="table-block">
        <thead>
          <tr>
            <th>Column 1</th>
            <th>Column 2</th>
            <th>Column 3</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Value 1</td>
            <td>Value 2</td>
            <td>Value 3</td>
          </tr>
        </tbody>
      </table>
    `
  })

  editor.BlockManager.add('basic-two-column-text', {
    label: 'Text 2 Col',
    category: 'Basic',
    media: lucideIcon('columns-2', `
      <line x1="2" y1="6" x2="10" y2="6"/>
      <line x1="2" y1="10" x2="10" y2="10"/>
      <line x1="2" y1="14" x2="8" y2="14"/>
      <line x1="14" y1="6" x2="22" y2="6"/>
      <line x1="14" y1="10" x2="22" y2="10"/>
      <line x1="14" y1="14" x2="20" y2="14"/>
    `),
    content: `
      <div class="two-column-text-block">
        <div>
          <h3>Left Title</h3>
          <p>Left content here...</p>
        </div>
        <div>
          <h3>Right Title</h3>
          <p>Right content here...</p>
        </div>
      </div>
    `
  })

  editor.BlockManager.add('basic-image-text', {
    label: 'Image',
    category: 'Basic',
    media: lucideIcon('image', `
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
    `),
    content: `
      <img class="image-block" src="https://via.placeholder.com/640x360" alt="Image" />
    `
  })

  editor.BlockManager.add('basic-alert', {
    label: 'Alert Box',
    category: 'Basic',
    media: lucideIcon('badge-alert', `
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none"/>
    `),
    content: `
      <div class="alert-block">
        <strong>Important:</strong>
        <span>Write important information here.</span>
      </div>
    `
  })

  editor.BlockManager.add('basic-signature', {
    label: 'Signature',
    category: 'Basic',
    media: lucideIcon('signature', `
      <path d="M3 16 C5 11 7 11 9 16 C11 21 13 11 15 16 C17 21 19 14 21 16"/>
      <line x1="3" y1="20" x2="21" y2="20"/>
    `),
    content: `
      <div class="signature-block">
        <p>Best regards,</p>
        <br />
        <strong>Your Name</strong>
        <p>Position / Company</p>
      </div>
    `
  })

  editor.BlockManager.add('basic-page-break', {
    label: 'Page Break',
    category: 'Basic',
    media: lucideIcon('between-horizontal-end', `
      <line x1="3" y1="5" x2="21" y2="5"/>
      <line x1="3" y1="12" x2="21" y2="12" stroke-dasharray="4 3"/>
      <line x1="3" y1="19" x2="21" y2="19"/>
      <polyline points="9,9 12,12 15,9"/>
      <polyline points="9,15 12,12 15,15"/>
    `),
    content: `<div class="page-break-block"></div>`
  })
}

onMounted(async () => {
  const grapesjs = (await import('grapesjs')).default
  const presetWebpage = (await import('grapesjs-preset-webpage')).default

  await import('grapesjs/dist/css/grapes.min.css')

  if (!editorEl.value) return

  editor = grapesjs.init({
    container: editorEl.value,
    height: '100%',
    fromElement: false,
    storageManager: false,

    plugins: [presetWebpage],
    pluginsOpts: {
      [presetWebpage as any]: {
        blocksBasicOpts: { flexGrid: true },
        navbarOpts: false,
        countdownOpts: false,
        formsOpts: false
      }
    },

    canvas: { styles: [], scripts: [] },

    deviceManager: {
      devices: [
        { name: 'Desktop', width: '' },
        { name: 'Tablet', width: '768px', widthMedia: '992px' },
        { name: 'Mobile', width: '375px', widthMedia: '480px' }
      ]
    },

    styleManager: {
      sectors: [
        {
          name: 'General',
          open: false,
          buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
        },
        {
          name: 'Dimension',
          open: false,
          buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding']
        },
        {
          name: 'Typography',
          open: false,
          buildProps: [
            'font-family', 'font-size', 'font-weight', 'letter-spacing',
            'color', 'line-height', 'text-align', 'text-decoration', 'text-shadow'
          ]
        },
        {
          name: 'Decorations',
          open: false,
          buildProps: ['background-color', 'border', 'border-radius', 'box-shadow', 'opacity']
        },
        {
          name: 'Extra',
          open: false,
          buildProps: ['transition', 'transform']
        }
      ]
    }
  })

  registerImportExportCommands(editor)
  registerCustomPanelButtons(editor)
  registerPresetBlockIconOverrides(editor)
  registerCustomBasicBlocks(editor)

  if (props.projectData) {
    editor.loadProjectData(props.projectData)
  } else if (props.html || props.css) {
    editor.setComponents(props.html || '')
    editor.setStyle(props.css || '')
  }

  emit('ready', editor)
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})

defineExpose({
  getEditor: () => editor,
  getProjectData: () => editor?.getProjectData() ?? null,
  getHtml: () => editor?.getHtml() ?? '',
  getCss: () => editor?.getCss() ?? '',
  loadProjectData,
  loadHtmlCss
})
</script>

<style scoped>
.gjs-builder {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.gjs-builder :deep(.gjs-lucide-icon) {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  color: currentColor;
}

.gjs-builder :deep(.gjs-lucide-icon svg),
.gjs-builder :deep(.gjs-panel-icon svg) {
  width: 100%;
  height: 100%;
  fill: none;
}

.gjs-builder :deep(.gjs-panel-icon) {
  display: inline-flex;
  width: 17px;
  height: 17px;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.gjs-builder :deep(.gjs-pn-btn) {
  min-width: 34px;
  border-radius: 8px;
}

.gjs-builder :deep(.gjs-pn-btn[title*="Import"]),
.gjs-builder :deep(.gjs-pn-btn[title*="Export"]) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0;
}

.gjs-builder :deep(.gjs-block) {
  min-height: 92px;
  border-radius: 8px;
  box-shadow: none;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.gjs-builder :deep(.gjs-block:hover) {
  transform: translateY(-1px);
}

.gjs-builder :deep(.gjs-block__media) {
  display: flex;
  height: 36px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  color: currentColor;
}

.gjs-builder :deep(.gjs-block__label) {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.gjs-builder :deep(.gjs-category-title),
.gjs-builder :deep(.gjs-layer-title),
.gjs-builder :deep(.gjs-block-category .gjs-title),
.gjs-builder :deep(.gjs-sm-sector-title),
.gjs-builder :deep(.gjs-trait-category .gjs-title) {
  letter-spacing: 0;
  font-weight: 700;
}

.gjs-builder :deep(.gjs-field),
.gjs-builder :deep(.gjs-field input),
.gjs-builder :deep(.gjs-field select),
.gjs-builder :deep(.gjs-field textarea),
.gjs-builder :deep(.gjs-clm-tags #gjs-clm-new),
.gjs-builder :deep(.gjs-sm-unit) {
  border-radius: 7px;
}

.gjs-builder :deep(.gjs-layer-title) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.gjs-builder :deep(.gjs-layer-name) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.gjs-builder :deep(.gjs-layer-vis),
.gjs-builder :deep(.gjs-layer-caret),
.gjs-builder :deep(.gjs-layer-move) {
  opacity: 0.7;
}

.gjs-builder :deep(.gjs-builder-modal) {
  padding: 18px;
}

.gjs-builder :deep(.gjs-builder-modal__hint) {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.5;
}

.gjs-builder :deep(.gjs-builder-modal__label) {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 800;
}

.gjs-builder :deep(.gjs-builder-modal__label--spaced) {
  margin-top: 16px;
}

.gjs-builder :deep(.gjs-builder-modal__textarea) {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 12px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.gjs-builder :deep(.gjs-builder-modal__textarea:focus) {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.16);
}

.gjs-builder :deep(.gjs-builder-modal__textarea--html) {
  min-height: 220px;
}

.gjs-builder :deep(.gjs-builder-modal__textarea--css) {
  min-height: 150px;
}

.gjs-builder :deep(.gjs-builder-modal__textarea--json) {
  min-height: 170px;
}

.gjs-builder :deep(.gjs-builder-modal__actions) {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.gjs-builder :deep(.gjs-builder-modal__button) {
  min-height: 36px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
}

.gjs-builder :deep(.gjs-builder-modal__button--primary) {
  border: 0;
  background: #4f46e5;
  color: #fff;
}

.gjs-builder--light :deep(.gjs-editor) {
  --gjs-main-color: #f8fafc;
  --gjs-primary-color: #fff;
  --gjs-secondary-color: #475569;
  --gjs-tertiary-color: #4f46e5;
  --gjs-quaternary-color: #6366f1;
  --gjs-font-color: #334155;
  --gjs-font-color-active: #111827;
  --gjs-main-dark-color: rgba(15, 23, 42, 0.08);
  --gjs-secondary-dark-color: rgba(15, 23, 42, 0.05);
  --gjs-main-light-color: rgba(255, 255, 255, 0.9);
  --gjs-secondary-light-color: rgba(255, 255, 255, 0.98);
  --gjs-color-blue: #4f46e5;
  --gjs-color-highlight: #6366f1;
  --gjs-light-border: rgba(15, 23, 42, 0.1);
  --gjs-arrow-color: #64748b;
  background: #eef2f7;
  color: #334155;
}

.gjs-builder--light :deep(.gjs-pn-panel),
.gjs-builder--light :deep(.gjs-pn-views-container),
.gjs-builder--light :deep(.gjs-block-categories),
.gjs-builder--light :deep(.gjs-sm-sectors),
.gjs-builder--light :deep(.gjs-trt-traits),
.gjs-builder--light :deep(.gjs-clm-tags),
.gjs-builder--light :deep(.gjs-layers-c) {
  background: #f8fafc;
  color: #334155;
  border-color: #e2e8f0;
}

.gjs-builder--light :deep(.gjs-category-title),
.gjs-builder--light :deep(.gjs-block-category .gjs-title),
.gjs-builder--light :deep(.gjs-sm-sector-title),
.gjs-builder--light :deep(.gjs-trait-category .gjs-title),
.gjs-builder--light :deep(.gjs-trt-header),
.gjs-builder--light :deep(.gjs-traits-label) {
  background: #eef2f7;
  color: #0f172a;
  border-color: #e2e8f0;
}

.gjs-builder--light :deep(.gjs-blocks-c),
.gjs-builder--light :deep(.gjs-sm-properties),
.gjs-builder--light :deep(.gjs-sm-sector .gjs-sm-properties),
.gjs-builder--light :deep(.gjs-layer-children) {
  background: #f8fafc;
}

.gjs-builder--light :deep(.gjs-block),
.gjs-builder--light :deep(.gjs-layer),
.gjs-builder--light :deep(.gjs-sm-sector),
.gjs-builder--light :deep(.gjs-trt-trait) {
  background: #fff;
  color: #334155;
  border-color: #e2e8f0;
}

.gjs-builder--light :deep(.gjs-block:hover),
.gjs-builder--light :deep(.gjs-layer.gjs-hovered),
.gjs-builder--light :deep(.gjs-layer-title:hover) {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #312e81;
}

.gjs-builder--light :deep(.gjs-layer.gjs-selected),
.gjs-builder--light :deep(.gjs-layer.gjs-selected .gjs-layer-title),
.gjs-builder--light :deep(.gjs-pn-btn.gjs-pn-active),
.gjs-builder--light :deep(.gjs-pn-views .gjs-pn-btn.gjs-pn-active) {
  background: #e0e7ff;
  color: #4338ca;
}

.gjs-builder--light :deep(.gjs-sm-label),
.gjs-builder--light :deep(.gjs-sm-property__label),
.gjs-builder--light :deep(.gjs-layer-title),
.gjs-builder--light :deep(.gjs-layer-name),
.gjs-builder--light :deep(.gjs-layer-count),
.gjs-builder--light :deep(.gjs-clm-label),
.gjs-builder--light :deep(.gjs-trt-trait .gjs-label) {
  color: #334155;
}

.gjs-builder--light :deep(.gjs-field),
.gjs-builder--light :deep(.gjs-select),
.gjs-builder--light :deep(.gjs-clm-tags #gjs-clm-new),
.gjs-builder--light :deep(.gjs-sm-unit) {
  background: #fff;
  color: #0f172a;
  border: 1px solid #cbd5e1;
  box-shadow: none;
}

.gjs-builder--light :deep(.gjs-field input),
.gjs-builder--light :deep(.gjs-field select),
.gjs-builder--light :deep(.gjs-field textarea) {
  background: transparent;
  color: #0f172a;
}

.gjs-builder--light :deep(.gjs-pn-btn) {
  color: #475569;
}

.gjs-builder--light :deep(.gjs-pn-btn:hover) {
  background: #eef2ff;
  color: #312e81;
}

.gjs-builder--light :deep(.gjs-cv-canvas) {
  background: #dbe3ee;
}

.gjs-builder--light :deep(.gjs-toolbar),
.gjs-builder--light :deep(.gjs-badge) {
  background: #312e81;
  color: #fff;
}

.gjs-builder--light :deep(.gjs-selected) {
  outline: 2px solid #4f46e5 !important;
}

.gjs-builder--light :deep(.gjs-hovered) {
  outline: 1px solid #818cf8 !important;
}

.gjs-builder--light :deep(.gjs-mdl-container) {
  background: rgba(15, 23, 42, 0.32);
}

.gjs-builder--light :deep(.gjs-mdl-dialog) {
  overflow: hidden;
  background: #fff;
  color: #0f172a;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.22);
}

.gjs-builder--light :deep(.gjs-mdl-header) {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.gjs-builder--light :deep(.gjs-mdl-title),
.gjs-builder--light :deep(.gjs-mdl-btn-close) {
  color: #0f172a;
}

.gjs-builder--light :deep(.gjs-builder-modal__hint) {
  color: #64748b;
}

.gjs-builder--light :deep(.gjs-builder-modal__textarea) {
  background: #f8fafc;
  color: #0f172a;
  border: 1px solid #cbd5e1;
}

.gjs-builder--light :deep(.gjs-builder-modal__button) {
  background: #fff;
  color: #334155;
  border: 1px solid #cbd5e1;
}

.gjs-builder--dark :deep(.gjs-editor) {
  --gjs-main-color: #151923;
  --gjs-primary-color: #1f2430;
  --gjs-secondary-color: #cbd5e1;
  --gjs-tertiary-color: #818cf8;
  --gjs-quaternary-color: #a5b4fc;
  --gjs-font-color: #cbd5e1;
  --gjs-font-color-active: #fff;
  --gjs-main-dark-color: rgba(0, 0, 0, 0.28);
  --gjs-secondary-dark-color: rgba(255, 255, 255, 0.06);
  --gjs-main-light-color: rgba(255, 255, 255, 0.08);
  --gjs-secondary-light-color: rgba(255, 255, 255, 0.12);
  --gjs-color-blue: #818cf8;
  --gjs-color-highlight: #a5b4fc;
  --gjs-light-border: rgba(255, 255, 255, 0.08);
  --gjs-arrow-color: #94a3b8;
  background: #0f172a;
  color: #cbd5e1;
}

.gjs-builder--dark :deep(.gjs-pn-panel),
.gjs-builder--dark :deep(.gjs-pn-views-container),
.gjs-builder--dark :deep(.gjs-block-categories),
.gjs-builder--dark :deep(.gjs-sm-sectors),
.gjs-builder--dark :deep(.gjs-trt-traits),
.gjs-builder--dark :deep(.gjs-clm-tags),
.gjs-builder--dark :deep(.gjs-layers-c) {
  background: #151923;
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.18);
}

.gjs-builder--dark :deep(.gjs-category-title),
.gjs-builder--dark :deep(.gjs-block-category .gjs-title),
.gjs-builder--dark :deep(.gjs-sm-sector-title),
.gjs-builder--dark :deep(.gjs-trait-category .gjs-title),
.gjs-builder--dark :deep(.gjs-trt-header),
.gjs-builder--dark :deep(.gjs-traits-label) {
  background: #1f2430;
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.16);
}

.gjs-builder--dark :deep(.gjs-blocks-c),
.gjs-builder--dark :deep(.gjs-sm-properties),
.gjs-builder--dark :deep(.gjs-sm-sector .gjs-sm-properties),
.gjs-builder--dark :deep(.gjs-layer-children) {
  background: #111827;
}

.gjs-builder--dark :deep(.gjs-block),
.gjs-builder--dark :deep(.gjs-layer),
.gjs-builder--dark :deep(.gjs-sm-sector),
.gjs-builder--dark :deep(.gjs-trt-trait) {
  background: #1f2430;
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.16);
}

.gjs-builder--dark :deep(.gjs-block:hover),
.gjs-builder--dark :deep(.gjs-layer.gjs-hovered),
.gjs-builder--dark :deep(.gjs-layer-title:hover) {
  background: #263047;
  border-color: rgba(129, 140, 248, 0.55);
  color: #fff;
}

.gjs-builder--dark :deep(.gjs-layer.gjs-selected),
.gjs-builder--dark :deep(.gjs-layer.gjs-selected .gjs-layer-title),
.gjs-builder--dark :deep(.gjs-pn-btn.gjs-pn-active),
.gjs-builder--dark :deep(.gjs-pn-views .gjs-pn-btn.gjs-pn-active) {
  background: rgba(129, 140, 248, 0.2);
  color: #c7d2fe;
}

.gjs-builder--dark :deep(.gjs-sm-label),
.gjs-builder--dark :deep(.gjs-sm-property__label),
.gjs-builder--dark :deep(.gjs-layer-title),
.gjs-builder--dark :deep(.gjs-layer-name),
.gjs-builder--dark :deep(.gjs-layer-count),
.gjs-builder--dark :deep(.gjs-clm-label),
.gjs-builder--dark :deep(.gjs-trt-trait .gjs-label) {
  color: #cbd5e1;
}

.gjs-builder--dark :deep(.gjs-field),
.gjs-builder--dark :deep(.gjs-select),
.gjs-builder--dark :deep(.gjs-clm-tags #gjs-clm-new),
.gjs-builder--dark :deep(.gjs-sm-unit) {
  background: #0f172a;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: none;
}

.gjs-builder--dark :deep(.gjs-field input),
.gjs-builder--dark :deep(.gjs-field select),
.gjs-builder--dark :deep(.gjs-field textarea) {
  background: transparent;
  color: #e5e7eb;
}

.gjs-builder--dark :deep(.gjs-pn-btn) {
  color: #cbd5e1;
}

.gjs-builder--dark :deep(.gjs-pn-btn:hover) {
  background: rgba(129, 140, 248, 0.16);
  color: #fff;
}

.gjs-builder--dark :deep(.gjs-cv-canvas) {
  background: #0b1020;
}

.gjs-builder--dark :deep(.gjs-toolbar),
.gjs-builder--dark :deep(.gjs-badge) {
  background: #6366f1;
  color: #fff;
}

.gjs-builder--dark :deep(.gjs-mdl-container) {
  background: rgba(0, 0, 0, 0.58);
}

.gjs-builder--dark :deep(.gjs-mdl-dialog) {
  overflow: hidden;
  background: #151923;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 12px;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
}

.gjs-builder--dark :deep(.gjs-mdl-header) {
  background: #1f2430;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
}

.gjs-builder--dark :deep(.gjs-mdl-title),
.gjs-builder--dark :deep(.gjs-mdl-btn-close) {
  color: #f8fafc;
}

.gjs-builder--dark :deep(.gjs-builder-modal__hint) {
  color: #94a3b8;
}

.gjs-builder--dark :deep(.gjs-builder-modal__textarea) {
  background: #0f172a;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.24);
}

.gjs-builder--dark :deep(.gjs-builder-modal__button) {
  background: #1f2430;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.24);
}
</style>
