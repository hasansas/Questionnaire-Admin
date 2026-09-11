<template>
  <div class="question-builder-page">
    <section class="question-builder-hero">
      <div class="min-w-0">
        <span class="question-builder-eyebrow">Question builder</span>
        <h2 class="question-builder-title">Questions</h2>
        <p class="question-builder-subtitle">
          Organize questions, options, and scoring maps from a cleaner
          workspace.
        </p>
        <div class="question-builder-status-row">
          <span class="question-builder-status-pill">
            {{ isMultiDimension ? "Multi-dimension" : "Total score" }}
          </span>
          <span v-if="isMultiDimension" class="question-builder-status-note">
            {{ dimensionItems.length }}
            {{ dimensionItems.length === 1 ? "dimension" : "dimensions" }}
          </span>
          <span class="question-builder-status-note">
            {{ localRows.length }}
            {{ localRows.length === 1 ? "question" : "questions" }}
          </span>
          <span
            class="question-builder-status-note"
            :class="{
              'question-builder-status-note--error': incompleteSectionCount > 0,
            }"
          >
            {{ incompleteSectionCount }}
            incomplete
            {{ isMultiDimension ? "dimension" : "section"
            }}{{ incompleteSectionCount === 1 ? "" : "s" }}
          </span>
        </div>
      </div>
    </section>

    <v-card rounded="xl" variant="outlined" class="sb-card">
      <!-- Error -->
      <div v-if="uiState.error" class="pa-10 text-center">
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
          {{ uiState.errorTitle }}
        </div>
        <div class="text-body-2 text-medium-emphasis mb-5">
          {{ uiState.errorMessage }}
        </div>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:refresh-cw"
          :loading="uiState.loading"
          @click="fetchFirstPage()"
        >
          Retry
        </v-btn>
      </div>

      <!-- Loading (first load) -->
      <SbSkeletonTable
        v-else-if="uiState.loading && !uiState.loaded"
        :show-header="false"
        :showTableHeader="false"
      />

      <!-- Empty -->
      <div
        v-else-if="items.length === 0 && !isMultiDimension"
        class="pa-10 text-center"
      >
        <v-avatar
          size="56"
          rounded="xl"
          color="primary"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="lucide:inbox" size="26" />
        </v-avatar>

        <div class="text-h6 font-weight-black mb-1">No questions yet</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Start by adding your first question.
        </div>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          @click="openCreateDialog"
        >
          New question
        </v-btn>
      </div>

      <!-- Data -->
      <template v-else>
        <!-- Header -->
        <div class="pa-5 pb-3">
          <div class="d-flex align-start justify-space-between flex-wrap ga-4">
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black">
                {{ isMultiDimension ? "Sections" : "Questions" }}
              </div>
              <div class="text-body-2 text-medium-emphasis mt-1">
                Drag dimensions or questions to reorder them.
              </div>
            </div>

            <div class="d-flex align-center ga-2 flex-wrap"></div>
          </div>

          <v-alert
            v-if="hasMore"
            type="info"
            variant="tonal"
            rounded="lg"
            class="mt-4"
          >
            Scroll down to load more questions automatically.
          </v-alert>
        </div>

        <v-divider />
        <!-- List -->
        <div
          class="question-builder-workspace"
          :class="{ 'question-builder-workspace--editor-open': dialogOpen }"
        >
          <aside class="question-builder-sidebar">
            <div class="question-builder-sidebar-head">
              <div class="d-flex align-center ga-3 min-w-0">
                <v-icon icon="lucide:folder" color="primary" size="20" />
                <span class="question-builder-sidebar-label">
                  {{ isMultiDimension ? "Dimensions" : "Questions" }}
                </span>
              </div>
              <v-btn
                size="small"
                rounded="lg"
                variant="outlined"
                append-icon="lucide:plus"
                @click="
                  isMultiDimension
                    ? openCreateDimensionDialog()
                    : openCreateDialog()
                "
              >
                Add
              </v-btn>
            </div>

            <v-text-field
              v-model.trim="questionSearch"
              clearable
              hide-details
              density="compact"
              variant="outlined"
              rounded="lg"
              placeholder="Search"
              prepend-inner-icon="lucide:search"
              class="question-builder-search"
            />

            <div v-if="!questionSections.length" class="question-section-empty">
              No dimensions yet.
            </div>

            <div v-else :key="sectionKey" class="question-section-list">
              <section
                v-for="section in questionSections"
                :key="section.id"
                class="question-section"
                :class="{
                  'question-section--selected':
                    selectedSectionId === section.id,
                  'question-section--incomplete': !section.questions.length,
                  'question-section--sortable': canSortSection(section),
                  'sb-dragging': draggingDimensionId === section.id,
                  'sb-drop-target':
                    dimensionDropTargetId === section.id &&
                    draggingDimensionId !== section.id,
                }"
                :draggable="canSortSection(section)"
                @dragstart="onDimensionDragStart($event, section)"
                @dragenter.prevent="onDimensionDragEnter(section)"
                @dragover.prevent
                @dragleave="onDimensionDragLeave(section)"
                @drop.prevent="onDimensionDrop(section)"
                @dragend="onDimensionDragEnd"
              >
                <div class="question-section-head">
                  <button
                    type="button"
                    class="question-section-card"
                    @click="selectSection(section)"
                  >
                    <v-icon icon="lucide:grip-vertical" size="18" />
                    <div class="question-section-copy">
                      <span class="question-section-title">
                        {{ section.name }}
                      </span>
                      <span class="question-section-meta">
                        <span v-if="section.key">{{ section.key }}</span>
                        <span v-if="section.key">•</span>
                        <span>
                          {{ section.questions.length }}
                          {{
                            section.questions.length === 1
                              ? "question"
                              : "questions"
                          }}
                        </span>
                      </span>
                    </div>
                    <v-spacer />
                    <v-chip
                      size="x-small"
                      label
                      class="question-section-status"
                      :color="section.questions.length ? 'success' : 'error'"
                      variant="tonal"
                    >
                      {{ section.questions.length ? "Ready" : "Empty" }}
                    </v-chip>
                  </button>

                  <v-btn
                    icon
                    variant="text"
                    size="small"
                    class="question-section-toggle"
                    :aria-label="
                      isSectionExpanded(section.id)
                        ? 'Collapse dimension'
                        : 'Expand dimension'
                    "
                    @click.stop="toggleSection(section.id)"
                  >
                    <v-icon
                      :icon="
                        isSectionExpanded(section.id)
                          ? 'lucide:chevron-up'
                          : 'lucide:chevron-down'
                      "
                      size="19"
                    />
                  </v-btn>
                </div>

                <v-expand-transition>
                  <div
                    v-show="isSectionExpanded(section.id)"
                    class="question-section-panel"
                  >
                    <div
                      v-if="section.questions.length"
                      class="question-row-list"
                    >
                      <div
                        v-for="q in section.questions"
                        :key="q.id"
                        class="question-row sb-draggable"
                        :class="{
                          'sb-dragging': draggingId === q.id,
                          'sb-drop-target':
                            dropTargetId === q.id && draggingId !== q.id,
                          'question-row--selected': selectedQuestionId === q.id,
                        }"
                        draggable="true"
                        @click="openEditDialog(q)"
                        @dragstart.stop="onDragStart($event, q)"
                        @dragenter.prevent.stop="onDragEnter(q)"
                        @dragover.prevent.stop
                        @dragleave.stop="onDragLeave(q)"
                        @drop.prevent.stop="onDrop(q)"
                        @dragend.stop="onDragEnd"
                      >
                        <v-avatar size="26">
                          <v-icon icon="lucide:grip-vertical" size="18" />
                        </v-avatar>
                        <v-avatar size="28" rounded="lg" variant="tonal">
                          {{ questionNumber(q) }}
                        </v-avatar>
                        <span class="question-row-text ml-2">
                          {{ plainTextFromHtml(q.text) }}
                        </span>
                        <v-spacer />
                        <div
                          v-if="deletingQuestionId === q.id"
                          class="question-row-delete-confirm"
                        >
                          <v-btn
                            size="x-small"
                            color="error"
                            variant="flat"
                            :loading="deleting"
                            @click.stop="deleteQuestion(q)"
                          >
                            Delete
                          </v-btn>
                          <v-btn
                            icon
                            variant="outlined"
                            size="x-small"
                            aria-label="Cancel delete"
                            :disabled="deleting"
                            @click.stop="cancelDeleteQuestion"
                          >
                            <v-icon icon="lucide:x" size="14" />
                          </v-btn>
                        </div>
                        <v-btn
                          v-else
                          icon
                          variant="text"
                          size="x-small"
                          aria-label="Delete question"
                          @click.stop="confirmDeleteQuestion(q)"
                        >
                          <v-icon icon="lucide:trash-2" size="16" />
                        </v-btn>
                      </div>
                    </div>

                    <div v-else class="question-section-alert">
                      This dimension has no question yet.
                    </div>

                    <div class="question-section-actions">
                      <v-btn
                        size="small"
                        rounded="lg"
                        variant="outlined"
                        :disabled="section.id === 'unassigned'"
                        @click="openCreateDialog(section.id)"
                      >
                        Add Question
                      </v-btn>
                    </div>
                  </div>
                </v-expand-transition>
              </section>
            </div>

            <!-- Load more -->
            <div class="mt-5">
              <div v-if="uiState.loadingMore" class="d-flex align-center ga-3">
                <v-progress-circular indeterminate size="18" />
                <div class="text-body-2 text-medium-emphasis">
                  Loading more…
                </div>
              </div>

              <div
                v-else-if="hasMore"
                class="d-flex align-center justify-space-between flex-wrap ga-2"
              >
                <div class="text-caption text-medium-emphasis">
                  Scroll to load more, or use the button.
                </div>
                <v-btn
                  rounded="lg"
                  variant="outlined"
                  prepend-icon="lucide:arrow-down"
                  :disabled="uiState.loadingMore"
                  @click="loadMore"
                >
                  Load more
                </v-btn>
              </div>

              <div ref="sentinelRef" class="sb-sentinel" />
            </div>
          </aside>

          <main class="question-builder-preview">
            <v-card flat rounded="xl" class="question-preview-card">
              <template v-if="selectedQuestion">
                <div class="question-preview-title-row">
                  <span class="question-preview-number">
                    {{ questionNumber(selectedQuestion) }}.
                  </span>
                  <div class="min-w-0">
                    <div
                      class="question-preview-text"
                      v-html="selectedQuestion.text"
                    />
                    <p v-if="isMultiDimension">
                      {{ selectedQuestion.dimension?.name || "Unassigned" }}
                    </p>
                  </div>
                </div>

                <v-img
                  v-if="getQuestionImageUrl(selectedQuestion)"
                  :src="getQuestionImageUrl(selectedQuestion)"
                  rounded="lg"
                  class="question-preview-image my-6"
                  cover
                />

                <v-img
                  v-if="
                    selectedQuestion.questionMode === 'image' &&
                    selectedQuestion.imageUrl
                  "
                  :src="selectedQuestion.imageUrl"
                  rounded="lg"
                  class="question-preview-image my-6"
                  cover
                />

                <div class="question-preview-options">
                  <article
                    v-for="option in selectedQuestion.options || []"
                    :key="option.key"
                    class="question-preview-option"
                    :class="{
                      active: isPercentageMode
                        ? option.isCorrect
                        : option.scoreValue === highestOptionScore,
                    }"
                  >
                    <v-icon
                      :icon="
                        (
                          isPercentageMode
                            ? option.isCorrect
                            : option.scoreValue === highestOptionScore
                        )
                          ? 'lucide:circle-dot'
                          : 'lucide:circle'
                      "
                      size="19"
                    />
                    <v-avatar
                      v-if="option.optionMode === 'image' && option.imageUrl"
                      size="42"
                      rounded="lg"
                    >
                      <v-img :src="option.imageUrl" cover />
                    </v-avatar>
                    <span>{{ option.label }}</span>
                    <v-spacer />
                    <v-chip
                      v-if="isPercentageMode"
                      size="x-small"
                      variant="tonal"
                      :color="option.isCorrect ? 'success' : undefined"
                    >
                      {{ option.isCorrect ? "Correct" : "Wrong" }}
                    </v-chip>
                    <v-chip v-else size="x-small" variant="tonal">
                      {{ option.scoreValue }}
                    </v-chip>
                  </article>
                </div>
              </template>

              <div v-else class="question-preview-empty">
                <v-icon icon="lucide:mouse-pointer-square" size="28" />
                <strong>Select a question</strong>
                <span
                  >Choose a question from the left drawer to preview it.</span
                >
              </div>
            </v-card>
          </main>
        </div>
      </template>
    </v-card>

    <!-- Right editor drawer -->
    <v-navigation-drawer
      v-model="dialogOpen"
      location="right"
      temporary
      floating
      :scrim="false"
      width="400"
      class="question-builder-editor-drawer"
    >
      <template #prepend>
        <v-toolbar flat color="white" class="question-builder-editor-toolbar">
          <v-avatar
            size="40"
            rounded="lg"
            :color="
              editorMode === 'dimension'
                ? 'primary'
                : dialogMode === 'create'
                  ? 'primary'
                  : 'info'
            "
            variant="tonal"
            class="mr-4"
          >
            <v-icon
              :icon="
                editorMode === 'dimension'
                  ? 'lucide:layers'
                  : dialogMode === 'create'
                    ? 'lucide:plus'
                    : 'lucide:pencil'
              "
              size="18"
            />
          </v-avatar>
          <div class="min-w-0">
            <div class="text-h6 font-weight-black">
              {{
                editorMode === "dimension"
                  ? dialogMode === "create"
                    ? "New dimension"
                    : "Edit Dimension"
                  : dialogMode === "create"
                    ? "New question"
                    : "Edit question"
              }}
            </div>
            <div class="text-caption text-medium-emphasis">
              {{
                editorMode === "dimension"
                  ? dialogMode === "create"
                    ? "Create a questionnaire dimension."
                    : "Update dimension details."
                  : "Configure question."
              }}
            </div>
          </div>
          <v-spacer />
          <v-btn
            icon
            variant="outlined"
            size="small"
            aria-label="Close editor"
            @click="closeDialog"
          >
            <v-icon icon="lucide:chevron-right" size="18" />
          </v-btn>
        </v-toolbar>
        <v-divider class="ma-0" />
      </template>

      <v-card flat class="question-builder-editor-card mt-4">
        <v-card variant="flat" class="overflow-y-auto">
          <v-card-text class="px-5 pt-2 pb-4">
            <v-alert
              v-if="dialogError"
              type="error"
              variant="tonal"
              rounded="lg"
              class="mb-4"
            >
              {{ dialogError }}
            </v-alert>

            <v-form
              v-if="editorMode === 'dimension'"
              ref="dimensionFormRef"
              @submit.prevent="handleDimensionSave"
            >
              <v-row dense>
                <v-col cols="12">
                  <v-text-field
                    v-model.trim="dimensionForm.name"
                    label="Name"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="lucide:type"
                    :rules="[rules.required, rules.min3]"
                    hide-details="auto"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model.trim="dimensionForm.description"
                    label="Description"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="lucide:align-left"
                    hide-details="auto"
                    auto-grow
                    rows="3"
                  />
                </v-col>
                <v-col v-if="dialogMode === 'edit'" cols="12">
                  <v-divider class="my-4" />
                  <div
                    v-if="dimensionDeleteConfirm"
                    class="dimension-delete-confirm"
                  >
                    <v-btn
                      color="error"
                      variant="flat"
                      :loading="deletingDimension"
                      @click="deleteDimension"
                    >
                      Delete Dimension
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      :disabled="deletingDimension"
                      @click="dimensionDeleteConfirm = false"
                    >
                      Cancel
                    </v-btn>
                  </div>
                  <v-btn
                    v-else
                    rounded="lg"
                    variant="outlined"
                    color="error"
                    prepend-icon="lucide:trash-2"
                    @click="dimensionDeleteConfirm = true"
                  >
                    Delete Dimension
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>

            <v-form v-else ref="dialogFormRef" @submit.prevent="handleSave">
              <v-row>
                <!-- Dimension selector -->
                <!-- <v-col v-if="isMultiDimension" cols="12">
                  <div class="question-editor-label">Dimension</div>
                  <v-select
                    v-model="editForm.dimensionId"
                    :items="dimensionItems"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="lucide:layers"
                    :rules="[rules.required]"
                    hide-details="auto"
                  />
                </v-col> -->

                <!-- Question mode -->
                <v-col cols="12">
                  <div class="question-editor-label">Question mode</div>
                  <v-select
                    v-model="editForm.questionMode"
                    :items="questionModeItems"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    rounded="lg"
                    density="comfortable"
                    prepend-inner-icon="lucide:list-filter"
                    hide-details="auto"
                  />
                </v-col>

                <!-- Image upload (question mode = image) -->
                <v-col v-if="editForm.questionMode === 'image'" cols="12">
                  <InputImageUploader
                    label="Image"
                    hint="Required media for image-mode questions."
                    ratio="wide"
                    :src="editForm.mediaPreviewUrl"
                    :loading="editForm.mediaUploading"
                    :error="mediaUploadError"
                    @change="onQuestionModeImageSelected"
                    @remove="clearQuestionModeImage"
                  />
                </v-col>

                <!-- Question text -->
                <v-col cols="12">
                  <div class="question-editor-field">
                    <div class="question-editor-label">Question text</div>
                    <ClientOnly>
                      <EditorTiptapEditor
                        v-model="editForm.text"
                        toolbar-preset="minimal"
                        :show-toolbar-preset-switch="false"
                        :toolbar-icon-only="true"
                        :show-history-buttons="false"
                        toolbar-size="small"
                        :min-height="132"
                        :max-height="220"
                        :disabled="saving"
                        placeholder="Example: Saya lebih mudah belajar dari gambar."
                      />
                    </ClientOnly>
                    <div v-if="questionTextError" class="question-editor-error">
                      {{ questionTextError }}
                    </div>
                  </div>
                </v-col>

                <!-- Question image -->
                <v-col cols="12">
                  <InputImageUploader
                    label="Question image"
                    hint="Optional question illustration."
                    ratio="wide"
                    :src="editForm.questionImagePreviewUrl"
                    :loading="editForm.questionImageUploading"
                    :error="questionImageUploadError"
                    @change="onQuestionImageSelected"
                    @remove="clearQuestionImage"
                  />
                </v-col>

                <!-- Options editor (per-question only) -->
                <v-col cols="12" class="mt-2">
                  <v-card rounded="xl" variant="outlined" class="pa-4">
                    <div
                      class="d-flex align-center justify-space-between flex-wrap ga-2"
                    >
                      <div>
                        <div class="text-body-2 font-weight-black">
                          Options
                          <span
                            v-if="optionsMode === 'fixed'"
                            class="text-medium-emphasis"
                          >
                            (Fixed / global)
                          </span>
                          <span v-else class="text-medium-emphasis">
                            (Per-question)
                          </span>
                        </div>
                        <div class="text-caption text-medium-emphasis mt-1">
                          {{
                            optionsMode === "fixed"
                              ? "Options are managed globally in questionnaire setup."
                              : "Define the options for this question."
                          }}
                        </div>
                      </div>

                      <div class="d-flex align-center ga-2">
                        <v-btn
                          v-if="optionsMode !== 'fixed'"
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:plus"
                          @click="addOption"
                        >
                          Add option
                        </v-btn>
                      </div>
                    </div>

                    <v-divider class="my-4" />

                    <!-- Fixed preview -->
                    <template v-if="optionsMode === 'fixed'">
                      <div class="d-flex flex-column ga-2">
                        <v-card
                          v-for="o in props.model.fixedOptionsJson || []"
                          :key="o.sortOrder"
                          rounded="xl"
                          variant="tonal"
                          color="grey"
                          class="pa-3"
                        >
                          <div
                            class="d-flex align-center justify-space-between ga-3"
                          >
                            <div class="min-w-0">
                              <div class="d-flex align-center ga-2">
                                <v-avatar
                                  size="28"
                                  rounded="lg"
                                  color="primary"
                                  variant="tonal"
                                >
                                  <v-icon
                                    icon="lucide:check-circle-2"
                                    size="14"
                                  />
                                </v-avatar>

                                <div
                                  class="text-body-2 font-weight-bold text-truncate"
                                >
                                  {{ o.label || "—" }}
                                </div>
                              </div>
                            </div>

                            <v-chip size="small" variant="tonal" class="px-3">
                              <v-icon
                                icon="lucide:sigma"
                                size="14"
                                class="me-1"
                              />
                              <span class="font-weight-bold">{{
                                o.scoreValue
                              }}</span>
                            </v-chip>
                          </div>
                        </v-card>

                        <v-alert
                          v-if="
                            (props.model.fixedOptionsJson || []).length === 0
                          "
                          type="info"
                          variant="tonal"
                          rounded="lg"
                        >
                          No fixed options configured.
                        </v-alert>
                      </div>
                    </template>

                    <!-- Per-question editor -->
                    <template v-else>
                      <v-alert
                        v-if="
                          validationAttempted && editForm.options.length < 2
                        "
                        type="warning"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        Add at least <b>2</b> options.
                      </v-alert>

                      <div class="d-flex flex-column ga-3">
                        <v-card
                          v-for="(o, i) in editForm.options"
                          :key="o.__localId"
                          rounded="xl"
                          variant="outlined"
                          class="pa-3 sb-draggable sb-option-card"
                          draggable="true"
                          :class="{
                            'sb-dragging': draggingOptionId === o.__localId,
                            'sb-drop-target':
                              optionDropTargetId === o.__localId &&
                              draggingOptionId !== o.__localId,
                          }"
                          @dragstart="onOptionDragStart($event, o)"
                          @dragenter.prevent="onOptionDragEnter(o)"
                          @dragover.prevent
                          @dragleave="onOptionDragLeave(o)"
                          @drop.prevent="onOptionDrop(o)"
                          @dragend="onOptionDragEnd"
                        >
                          <div
                            class="d-flex align-start justify-space-between ga-2"
                          >
                            <div class="d-flex align-center ga-2 min-w-0">
                              <!-- drag handle -->
                              <div
                                class="sb-handle sb-option-handle"
                                aria-hidden="true"
                              >
                                <v-icon icon="lucide:grip-vertical" size="18" />
                              </div>

                              <v-chip size="x-small" variant="tonal"
                                >#{{ i + 1 }}</v-chip
                              >
                            </div>

                            <v-menu location="bottom end">
                              <template #activator="{ props: mp }">
                                <v-btn
                                  v-bind="mp"
                                  icon
                                  variant="text"
                                  aria-label="Option actions"
                                  :disabled="editForm.options.length <= 2"
                                >
                                  <v-icon icon="lucide:trash-2" size="18" />
                                </v-btn>
                              </template>

                              <v-list density="compact" min-width="180">
                                <v-list-item
                                  title="Delete option"
                                  class="text-error"
                                  :disabled="editForm.options.length <= 2"
                                  @click="removeOption(i)"
                                >
                                  <template #prepend>
                                    <v-icon
                                      size="20"
                                      icon="lucide:trash-2"
                                      class="text-error"
                                    />
                                  </template>
                                </v-list-item>
                              </v-list>
                            </v-menu>
                          </div>

                          <v-row dense class="mt-2">
                            <v-col cols="12" :md="isPercentageMode ? 8 : 7">
                              <v-text-field
                                v-model.trim="o.label"
                                label="Label"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                :rules="[rules.required]"
                                hide-details="auto"
                              />
                            </v-col>
                            <v-col
                              v-if="isPercentageMode"
                              cols="12"
                              md="4"
                              class="d-flex align-center"
                            >
                              <v-checkbox
                                v-model="o.isCorrect"
                                label="Correct"
                                density="compact"
                                color="success"
                                hide-details
                              />
                            </v-col>
                            <v-col v-else cols="12" md="5">
                              <v-text-field
                                v-model.number="o.scoreValue"
                                label="Score"
                                type="number"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                :rules="[rules.requiredNumber]"
                                hide-details="auto"
                              />
                            </v-col>
                          </v-row>

                          <v-row dense class="mt-2">
                            <v-col cols="12">
                              <v-btn-toggle
                                v-model="o.optionMode"
                                color="primary"
                                variant="outlined"
                                rounded="lg"
                                density="compact"
                                mandatory
                              >
                                <v-btn
                                  value="text"
                                  size="small"
                                  prepend-icon="lucide:type"
                                >
                                  Text
                                </v-btn>
                                <v-btn
                                  value="image"
                                  size="small"
                                  prepend-icon="lucide:image"
                                >
                                  Image
                                </v-btn>
                              </v-btn-toggle>
                            </v-col>

                            <v-col v-if="o.optionMode === 'image'" cols="12">
                              <InputImageUploader
                                label="Option image"
                                hint="Required for image-mode options."
                                ratio="wide"
                                :src="o.mediaPreviewUrl"
                                :loading="o.mediaUploading"
                                :error="o.mediaUploadError"
                                @change="
                                  (payload) => onOptionImageSelected(o, payload)
                                "
                                @remove="clearOptionImage(o)"
                              />
                            </v-col>
                          </v-row>
                        </v-card>
                      </div>
                    </template>
                  </v-card>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-card>

      <template #append>
        <v-divider class="ma-0" />
        <v-card flat class="question-builder-editor-footer">
          <v-btn
            block
            size="large"
            rounded="lg"
            variant="outlined"
            :loading="saving"
            @click="
              editorMode === 'dimension' ? handleDimensionSave() : handleSave()
            "
          >
            {{
              editorMode === "dimension"
                ? "Save changes"
                : dialogMode === "create"
                  ? "Create"
                  : "Save changes"
            }}
          </v-btn>
        </v-card>
      </template>
    </v-navigation-drawer>
  </div>
</template>

<script setup lang="ts">
import type { QuestionnaireModel } from "~/models/questionnaire";
import type { QuestionnaireDimensionModel } from "~/models/questionnaire-dimension";
import type { QuestionnaireQuestionModel } from "~/models/questionnaire-questions";
import {
  normalizeQuestionnaireQuestion,
  normalizeQuestionnaireQuestions,
} from "~/models/questionnaire-questions";

const props = defineProps<{ model: QuestionnaireModel }>();

const snack = useAppSnackbar();

const sectionKey = ref<number>(0);
const questionnaireId = computed(() => props.model?.id || "");
const optionsMode = computed(() => props.model?.optionsMode || "fixed");
const isMultiDimension = computed(
  () => props.model?.scoringType === "multi_dimension",
);
const isPercentageMode = computed(
  () => props.model?.scoringMode === "percentage",
);

const questionsStore = useQuestionnaireQuestions(questionnaireId.value);
const dimensionStore = useQuestionnaireDimensionStore(questionnaireId.value);

const uiState = reactive({
  loading: false,
  loaded: false,
  loadingMore: false,
  error: false,
  errorTitle: `Couldn’t load data`,
  errorMessage: "",
});

const pageSize = 100;
const baseQuery = computed(() => `limit=${pageSize}&include=options`);

const hasMore = computed(() => Boolean(questionsStore?.hasMore));

// Flatten pages -> normalized items
const items = computed<QuestionnaireQuestionModel[]>(() => {
  const pages = questionsStore?.data?.rows ?? [];
  const flat = Array.isArray(pages) ? (pages as any[]).flat() : [];
  return normalizeQuestionnaireQuestions(flat);
});

/** Keep local order stable (draggable) */
const localRows = ref<QuestionnaireQuestionModel[]>([]);
const baselineOrder = ref<string[]>([]);
const questionSearch = ref("");
const selectedQuestionId = ref<string | null>(null);
const selectedSectionId = ref<string | null>(null);
const expandedSections = ref<string[]>([]);
const dimensionItems = computed(() => dimensionStore.items);
const localDimensions = ref<QuestionnaireDimensionModel[]>([]);
const baselineDimensionOrder = ref<string[]>([]);

function syncLocalDimensionsFromStore(nextRows: QuestionnaireDimensionModel[]) {
  const sorted = [...nextRows].sort(
    (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
  );
  const map = new Map(sorted.map((dimension) => [dimension.id, dimension]));

  const kept = localDimensions.value
    .map((dimension) => map.get(dimension.id))
    .filter(Boolean) as QuestionnaireDimensionModel[];

  const keptIds = new Set(kept.map((dimension) => dimension.id));
  const appended = sorted.filter((dimension) => !keptIds.has(dimension.id));

  localDimensions.value = [...kept, ...appended];

  if (!baselineDimensionOrder.value.length) {
    baselineDimensionOrder.value = sorted.map((dimension) => dimension.id);
  } else {
    const baseSet = new Set(baselineDimensionOrder.value);
    baselineDimensionOrder.value = [
      ...baselineDimensionOrder.value.filter((id) => map.has(id)),
      ...appended
        .map((dimension) => dimension.id)
        .filter((id) => !baseSet.has(id)),
    ];
  }
}

function syncLocalRowsFromStore(nextRows: QuestionnaireQuestionModel[]) {
  const sorted = [...nextRows].sort(
    (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0),
  );
  const map = new Map(sorted.map((x) => [x.id, x]));

  const kept = localRows.value
    .map((x) => {
      const incoming = map.get(x.id);
      if (!incoming) return null;

      return {
        ...x,
        ...incoming,
        dimension: incoming.dimension ?? x.dimension,
        options: incoming.options?.length ? incoming.options : x.options,
        imageUrl: incoming.imageUrl ?? x.imageUrl,
        media: incoming.media ?? x.media,
      };
    })
    .filter(Boolean) as QuestionnaireQuestionModel[];

  const keptIds = new Set(kept.map((x) => x.id));
  const appended = sorted.filter((x) => !keptIds.has(x.id));

  localRows.value = [...kept, ...appended];

  // baseline init/update without marking as changes when loading more
  if (!baselineOrder.value.length) {
    baselineOrder.value = sorted.map((x) => x.id);
  } else {
    const baseSet = new Set(baselineOrder.value);
    baselineOrder.value = [
      ...baselineOrder.value.filter((id) => map.has(id)),
      ...appended.map((x) => x.id).filter((id) => !baseSet.has(id)),
    ];
  }
}

watch(items, (rows) => syncLocalRowsFromStore(rows), { immediate: true });
watch(dimensionItems, (rows) => syncLocalDimensionsFromStore(rows), {
  immediate: true,
});

watch(
  localRows,
  (rows) => {
    if (
      selectedQuestionId.value &&
      !rows.some((q) => q.id === selectedQuestionId.value)
    ) {
      selectedQuestionId.value = null;
    }
  },
  { immediate: true },
);

const filteredRows = computed(() => {
  const search = questionSearch.value.trim().toLowerCase();
  if (!search) return localRows.value;

  return localRows.value.filter((question) => {
    const haystack = [
      question.text,
      question.dimension?.name,
      question.dimension?.key,
      ...(question.options || []).map((option) => option.label),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
});

const selectedQuestion = computed(
  () =>
    localRows.value.find(
      (question) => question.id === selectedQuestionId.value,
    ) ?? null,
);

const highestOptionScore = computed(() => {
  const scores = (selectedQuestion.value?.options || []).map((option) =>
    Number(option.scoreValue),
  );
  return scores.length ? Math.max(...scores) : null;
});

type QuestionSection = {
  id: string;
  key: string;
  name: string;
  questions: QuestionnaireQuestionModel[];
};

function resolveQuestionSection(
  question: QuestionnaireQuestionModel,
  sectionMap: Map<string, QuestionSection>,
) {
  const rawDimensionId = String((question as any).dimensionId ?? "");
  const dimension = question.dimension;
  const dimensionId = dimension?.id || rawDimensionId;
  const dimensionKey = dimension?.key || "";

  if (dimensionId && sectionMap.has(dimensionId)) {
    return sectionMap.get(dimensionId) ?? null;
  }

  if (dimensionKey) {
    const matchedSection = [...sectionMap.values()].find(
      (section) => section.key === dimensionKey,
    );
    if (matchedSection) return matchedSection;
  }

  if (dimension) {
    return {
      id: dimensionId || dimensionKey,
      key: dimension.key,
      name: dimension.name,
      questions: [],
    };
  }

  return null;
}

const questionSections = computed<QuestionSection[]>(() => {
  if (!isMultiDimension.value) {
    return [
      {
        id: "all",
        key: "",
        name: "Questions",
        questions: filteredRows.value,
      },
    ];
  }

  const sectionMap = new Map<string, QuestionSection>();

  for (const dimension of localDimensions.value) {
    sectionMap.set(dimension.id, {
      id: dimension.id,
      key: dimension.key,
      name: dimension.name,
      questions: [],
    });
  }

  const unassigned: QuestionSection = {
    id: "unassigned",
    key: "",
    name: "Unassigned",
    questions: [],
  };

  for (const question of filteredRows.value) {
    const section = resolveQuestionSection(question, sectionMap);

    if (section && !sectionMap.has(section.id)) {
      sectionMap.set(section.id, section);
    }

    (section ?? unassigned).questions.push(question);
  }

  const sections = [...sectionMap.values()];
  if (unassigned.questions.length) sections.push(unassigned);
  return sections;
});

const incompleteSectionCount = computed(() => {
  if (!isMultiDimension.value) {
    return localRows.value.length ? 0 : 1;
  }

  return questionSections.value.filter(
    (section) => section.id !== "unassigned" && !section.questions.length,
  ).length;
});

function questionNumber(question: QuestionnaireQuestionModel) {
  const index = localRows.value.findIndex((item) => item.id === question.id);
  return index >= 0 ? index + 1 : "";
}

function getQuestionImageUrl(question: QuestionnaireQuestionModel | null) {
  return (
    (question as any)?.questionImageUrl ||
    (question as any)?.questionImage?.publicUrl ||
    (question as any)?.questionImage?.media?.publicUrl ||
    null
  );
}

function isSectionExpanded(sectionId: string) {
  return expandedSections.value.includes(sectionId);
}

function toggleSection(sectionId: string) {
  expandedSections.value = isSectionExpanded(sectionId)
    ? expandedSections.value.filter((id) => id !== sectionId)
    : [...expandedSections.value, sectionId];
}

function selectQuestion(question: QuestionnaireQuestionModel) {
  selectedQuestionId.value = question.id;
  selectedSectionId.value =
    question.dimension?.id || question.dimension?.key || null;
}

function selectSection(section: QuestionSection) {
  selectedSectionId.value = section.id;
  selectedQuestionId.value = null;

  if (!isMultiDimension.value || section.id === "unassigned") {
    closeDialog();
    return;
  }

  openDimensionEditor(section);
}

function resolveQuestionDimensionId(question: QuestionnaireQuestionModel) {
  const dimension = question.dimension;
  if (!dimension) return "";

  if (
    dimension.id &&
    dimensionItems.value.some((item) => item.id === dimension.id)
  ) {
    return dimension.id;
  }

  const matchedByKey = dimensionItems.value.find(
    (item) => item.key === dimension.key,
  );
  return matchedByKey?.id ?? "";
}

function resolveDimension(id: string) {
  const dimension =
    localDimensions.value.find((dimension) => dimension.id === id) ??
    dimensionItems.value.find((dimension) => dimension.id === id);

  if (dimension) return dimension;

  const section = questionSections.value.find((section) => section.id === id);
  if (!section || section.id === "unassigned") return null;

  return {
    id: section.id,
    questionnaireId: questionnaireId.value,
    key: section.key,
    name: section.name,
    description: null,
    sortOrder: 1,
  };
}

function upsertLocalQuestion(question: QuestionnaireQuestionModel) {
  const index = localRows.value.findIndex((item) => item.id === question.id);
  localRows.value =
    index === -1
      ? [...localRows.value, question]
      : localRows.value.map((item) =>
          item.id === question.id ? { ...item, ...question } : item,
        );

  if (!baselineOrder.value.includes(question.id)) {
    baselineOrder.value = [...baselineOrder.value, question.id];
  }
}

function removeLocalQuestion(questionId: string) {
  localRows.value = localRows.value.filter((item) => item.id !== questionId);
  baselineOrder.value = baselineOrder.value.filter((id) => id !== questionId);
  if (selectedQuestionId.value === questionId) {
    selectedQuestionId.value = null;
    closeDialog();
  }
}

function buildLocalQuestionFromForm(
  responseData: any,
  fallbackId: string,
): QuestionnaireQuestionModel {
  const rawQuestion = responseData?.question ?? responseData ?? {};
  const dimension = resolveDimension(editForm.dimensionId);
  const questionDimension = dimension
    ? {
        id: dimension.id,
        key: dimension.key,
        name: dimension.name,
        weight: 1,
      }
    : null;
  const rawOptions =
    optionsMode.value === "fixed"
      ? props.model.fixedOptionsJson || []
      : editForm.options.map((option, index) => ({
          key: option.key || `option_${index + 1}`,
          label: option.label,
          scoreValue: option.scoreValue,
          isCorrect: Boolean(option.isCorrect),
          sortOrder: index + 1,
          optionMode: option.optionMode,
          imageUrl: option.mediaPreviewUrl,
          media: option.mediaId ? { mediaId: option.mediaId } : null,
        }));

  return normalizeQuestionnaireQuestion({
    ...rawQuestion,
    id: rawQuestion?.id || fallbackId,
    questionnaireId: questionnaireId.value,
    text: editForm.text.trim(),
    description: editForm.description.trim() || null,
    questionType: "single_choice",
    questionMode: editForm.questionMode,
    isRequired: Boolean(editForm.isRequired),
    sortOrder: rawQuestion?.sortOrder ?? localRows.value.length + 1,
    meta: { hint: editForm.hint.trim() },
    questionImageUrl: editForm.questionImagePreviewUrl,
    questionImage: editForm.questionImageId
      ? {
          mediaId: editForm.questionImageId,
          publicUrl: editForm.questionImagePreviewUrl,
          originalName: null,
          mimeType: null,
        }
      : null,
    imageUrl:
      editForm.questionMode === "image" ? editForm.mediaPreviewUrl : null,
    media:
      editForm.questionMode === "image" && editForm.mediaId
        ? {
            mediaId: editForm.mediaId,
            publicUrl: editForm.mediaPreviewUrl,
            originalName: null,
            mimeType: null,
          }
        : null,
    dimensionId: editForm.dimensionId,
    dimension: questionDimension,
    options: rawOptions,
    dimensionMaps: questionDimension
      ? [
          {
            dimensionId: questionDimension.id,
            weight: 1,
            dimension: questionDimension,
          },
        ]
      : [],
  });
}

function upsertLocalDimension(dimension: QuestionnaireDimensionModel) {
  const index = localDimensions.value.findIndex(
    (item) => item.id === dimension.id,
  );
  localDimensions.value =
    index === -1
      ? [...localDimensions.value, dimension]
      : localDimensions.value.map((item) =>
          item.id === dimension.id ? { ...item, ...dimension } : item,
        );

  if (!baselineDimensionOrder.value.includes(dimension.id)) {
    baselineDimensionOrder.value = [
      ...baselineDimensionOrder.value,
      dimension.id,
    ];
  }

  localRows.value = localRows.value.map((question) => {
    if (question.dimension?.id !== dimension.id) return question;

    return {
      ...question,
      dimension: {
        ...question.dimension,
        key: dimension.key,
        name: dimension.name,
      },
    };
  });
}

function removeLocalDimension(dimensionId: string) {
  localDimensions.value = localDimensions.value.filter(
    (item) => item.id !== dimensionId,
  );
  baselineDimensionOrder.value = baselineDimensionOrder.value.filter(
    (id) => id !== dimensionId,
  );
  expandedSections.value = expandedSections.value.filter(
    (id) => id !== dimensionId,
  );
  if (selectedSectionId.value === dimensionId) {
    selectedSectionId.value = null;
    closeDialog();
  }
}

function canSortSection(section: QuestionSection) {
  return isMultiDimension.value && section.id !== "unassigned";
}

const draggingDimensionId = ref<string | null>(null);
const dimensionDropTargetId = ref<string | null>(null);

function onDimensionDragStart(evt: DragEvent, section: QuestionSection) {
  if (!canSortSection(section)) return;
  draggingDimensionId.value = section.id;
  dimensionDropTargetId.value = null;
  evt.dataTransfer?.setData("text/plain", section.id);
  if (evt.dataTransfer) evt.dataTransfer.effectAllowed = "move";
}

function onDimensionDragEnter(section: QuestionSection) {
  if (
    !canSortSection(section) ||
    !draggingDimensionId.value ||
    draggingDimensionId.value === section.id
  ) {
    return;
  }
  dimensionDropTargetId.value = section.id;
}

function onDimensionDragLeave(section: QuestionSection) {
  if (dimensionDropTargetId.value === section.id) {
    dimensionDropTargetId.value = null;
  }
}

async function onDimensionDrop(section: QuestionSection) {
  const fromId = draggingDimensionId.value;
  if (!fromId || fromId === section.id || !canSortSection(section)) return;

  const fromIndex = localDimensions.value.findIndex(
    (dimension) => dimension.id === fromId,
  );
  const toIndex = localDimensions.value.findIndex(
    (dimension) => dimension.id === section.id,
  );
  if (fromIndex < 0 || toIndex < 0) return;

  const previousDimensions = [...localDimensions.value];
  const previousQuestions = [...localRows.value];
  const next = [...localDimensions.value];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  localDimensions.value = next;
  dimensionDropTargetId.value = null;

  await saveDimensionOrder(previousDimensions, previousQuestions);
}

function onDimensionDragEnd() {
  draggingDimensionId.value = null;
  dimensionDropTargetId.value = null;
}

function getQuestionDimensionId(question: QuestionnaireQuestionModel) {
  return (
    question.dimension?.id || String((question as any).dimensionId ?? "") || ""
  );
}

function sortQuestionsByDimensionOrder() {
  const dimensionIds = localDimensions.value.map((dimension) => dimension.id);
  const dimensionIndex = new Map(
    dimensionIds.map((dimensionId, index) => [dimensionId, index]),
  );

  const indexedRows = localRows.value.map((question, index) => ({
    question,
    index,
  }));

  const sortedRows = indexedRows
    .sort((a, b) => {
      const aDimensionIndex =
        dimensionIndex.get(getQuestionDimensionId(a.question)) ??
        Number.MAX_SAFE_INTEGER;
      const bDimensionIndex =
        dimensionIndex.get(getQuestionDimensionId(b.question)) ??
        Number.MAX_SAFE_INTEGER;

      if (aDimensionIndex !== bDimensionIndex) {
        return aDimensionIndex - bDimensionIndex;
      }

      return a.index - b.index;
    })
    .map(({ question }, index) => ({
      ...question,
      sortOrder: index + 1,
    }));

  localRows.value = sortedRows;
  baselineOrder.value = sortedRows.map((question) => question.id);

  return sortedRows.map((question) => ({
    id: question.id,
    sortOrder: question.sortOrder,
  }));
}

async function saveQuestionOrder(
  orderPayload: { id: string; sortOrder: number }[],
) {
  try {
    for (const question of orderPayload) {
      const result = await questionsStore.update(question.id, {
        id: question.id,
        sortOrder: question.sortOrder,
      } as any);

      if (!result?.success) return false;
    }

    return true;
  } catch {
    return false;
  }
}

async function saveDimensionOrder(
  previousDimensions: QuestionnaireDimensionModel[],
  previousQuestions: QuestionnaireQuestionModel[],
) {
  const payload = localDimensions.value.map((dimension, index) => ({
    ...dimension,
    sortOrder: index + 1,
  }));

  try {
    const results = await Promise.all(
      payload.map((dimension) =>
        dimensionStore.update(dimension.id, {
          id: dimension.id,
          name: dimension.name,
          description: dimension.description ?? "",
          sortOrder: dimension.sortOrder,
        } as any),
      ),
    );

    const failed = results.find((result) => !result?.success);
    if (failed) {
      localDimensions.value = previousDimensions;
      localRows.value = previousQuestions;
      snack.open("Failed to save dimension order.", { color: "error" });
      return;
    }

    localDimensions.value = payload;
    baselineDimensionOrder.value = payload.map((dimension) => dimension.id);
    const questionOrderPayload = sortQuestionsByDimensionOrder();
    const questionOrderSaved = await saveQuestionOrder(questionOrderPayload);

    if (!questionOrderSaved) {
      localRows.value = previousQuestions;
      snack.open("Dimension order saved, but question order failed.", {
        color: "warning",
      });
      return;
    }

    snack.open("Dimension and question order saved.", { color: "success" });
  } catch {
    localDimensions.value = previousDimensions;
    localRows.value = previousQuestions;
    snack.open("Failed to save dimension order.", { color: "error" });
  }
}

/** Drag & Drop (native) */
const draggingId = ref<string | null>(null);
const dropTargetId = ref<string | null>(null);

function onDragStart(evt: DragEvent, q: QuestionnaireQuestionModel) {
  draggingId.value = q.id;
  dropTargetId.value = null;
  evt.dataTransfer?.setData("text/plain", q.id);
  if (evt.dataTransfer) evt.dataTransfer.effectAllowed = "move";
}
function onDragEnter(target: QuestionnaireQuestionModel) {
  if (!draggingId.value || draggingId.value === target.id) return;
  dropTargetId.value = target.id;
}
function onDragLeave(target: QuestionnaireQuestionModel) {
  if (dropTargetId.value === target.id) dropTargetId.value = null;
}
async function onDrop(target: QuestionnaireQuestionModel) {
  const fromId = draggingId.value;
  if (!fromId || fromId === target.id) return;

  const fromIndex = localRows.value.findIndex((x) => x.id === fromId);
  const toIndex = localRows.value.findIndex((x) => x.id === target.id);
  if (fromIndex < 0 || toIndex < 0) return;

  const previousRows = [...localRows.value];
  const next = [...localRows.value];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  localRows.value = next.map((question, index) => ({
    ...question,
    sortOrder: index + 1,
  }));
  dropTargetId.value = null;

  const saved = await saveQuestionOrder([
    { id: moved.id, sortOrder: toIndex + 1 },
  ]);

  if (!saved) {
    localRows.value = previousRows;
    snack.open("Failed to save question order.", { color: "error" });
    return;
  }

  baselineOrder.value = localRows.value.map((question) => question.id);
  snack.open("Question order saved.", { color: "success" });
}
function onDragEnd() {
  draggingId.value = null;
  dropTargetId.value = null;
}

/** Fetch + infinite scroll */
async function fetchFirstPage() {
  uiState.loading = true;
  uiState.error = false;
  uiState.errorMessage = "";

  const res = await questionsStore.fetchAll({
    page: 1,
    query: baseQuery.value, // sets savedQuery -> loadMore works
    reset: true,
  });

  uiState.loading = false;
  uiState.loaded = true;

  if (!res?.success) {
    uiState.error = true;
    uiState.errorMessage = res?.error || "Failed to fetch questions";
  }
}

async function loadMore() {
  if (uiState.loadingMore || uiState.loading) return;
  if (!hasMore.value) return;
  uiState.loadingMore = true;
  try {
    await questionsStore.loadMore();
  } finally {
    uiState.loadingMore = false;
  }
}

const sentinelRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

onMounted(async () => {
  await fetchFirstPage();

  // prefetch dimensions for dialog if needed
  if (isMultiDimension.value) {
    await dimensionStore.fetchAll({ query: "limit=100" });
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting) return;
      loadMore();
    },
    { root: null, rootMargin: "240px", threshold: 0.01 },
  );
  if (sentinelRef.value) observer.observe(sentinelRef.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

/**
 * Dialog add/edit
 */
type DialogMode = "create" | "edit";
type EditorMode = "question" | "dimension";
const dialogOpen = ref(false);
const dialogMode = ref<DialogMode>("create");
const editorMode = ref<EditorMode>("question");
const dialogFormRef = ref<any>(null);
const dimensionFormRef = ref<any>(null);
const dialogError = ref("");
const saving = ref(false);
const deleting = ref(false);
const validationAttempted = ref(false);

type LocalOption = {
  __localId: string;
  key?: string;
  label: string;
  scoreValue: number;
  isCorrect: boolean;
  sortOrder?: number;
  optionMode: "text" | "image";
  mediaId: string;
  mediaPreviewUrl: string | null;
  mediaUploading: boolean;
  mediaUploadError: string;
};

const editForm = reactive<{
  id: string;
  text: string;
  description: string;
  isRequired: boolean;
  hint: string;
  dimensionId: string;
  options: LocalOption[];
  questionMode: "text" | "image";
  questionImageId: string;
  questionImagePreviewUrl: string | null;
  questionImageUploading: boolean;
  mediaId: string;
  mediaPreviewUrl: string | null;
  mediaUploading: boolean;
}>({
  id: "",
  text: "",
  description: "",
  isRequired: true,
  hint: "...",
  dimensionId: "",
  options: [],
  questionMode: "text",
  questionImageId: "",
  questionImagePreviewUrl: null,
  questionImageUploading: false,
  mediaId: "",
  mediaPreviewUrl: null,
  mediaUploading: false,
});

const dimensionForm = reactive({
  id: "",
  key: "",
  name: "",
  description: "",
});

const mediaUploadError = ref("");
const questionImageUploadError = ref("");
const deletingQuestionId = ref<string | null>(null);
const dimensionDeleteConfirm = ref(false);
const deletingDimension = ref(false);

const questionModeItems = [
  { title: "Text", value: "text" },
  { title: "Image", value: "image" },
];

const questionTextPlain = computed(() => plainTextFromHtml(editForm.text));
const questionTextError = computed(() => {
  if (!validationAttempted.value) return "";
  if (!questionTextPlain.value) return "Question text is required.";
  if (questionTextPlain.value.length < 3) {
    return "Question text must be at least 3 characters.";
  }
  return "";
});

type ImageUploaderPayload =
  | File
  | File[]
  | { file: File | null; remove?: boolean }
  | null;

function plainTextFromHtml(value: string): string {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function createLocalOption(overrides: Partial<LocalOption> = {}): LocalOption {
  return {
    __localId: crypto.randomUUID(),
    label: "",
    scoreValue: 0,
    isCorrect: false,
    optionMode: "text",
    mediaId: "",
    mediaPreviewUrl: null,
    mediaUploading: false,
    mediaUploadError: "",
    ...overrides,
  };
}

const rules = {
  required: (v: any) => (!!String(v ?? "").trim() ? true : "Required"),
  min3: (v: any) => (String(v ?? "").trim().length >= 3 ? true : "Min 3 chars"),
  requiredNumber: (v: any) =>
    Number.isFinite(Number(v)) ? true : "Must be a number",
};

function resetForm() {
  dialogError.value = "";
  saving.value = false;
  validationAttempted.value = false;
  mediaUploadError.value = "";
  questionImageUploadError.value = "";
  editForm.id = "";
  editForm.text = "";
  editForm.description = "";
  editForm.isRequired = true;
  editForm.hint = "...";
  editForm.dimensionId = "";
  editForm.options = [
    createLocalOption({ label: "Setuju", scoreValue: 2 }),
    createLocalOption({ label: "Ragu", scoreValue: 1 }),
    createLocalOption({ label: "Tidak setuju", scoreValue: 0 }),
  ];
  editForm.questionMode = "text";
  editForm.questionImageId = "";
  editForm.questionImagePreviewUrl = null;
  editForm.questionImageUploading = false;
  editForm.mediaId = "";
  editForm.mediaPreviewUrl = null;
  editForm.mediaUploading = false;
  nextTick(() => dialogFormRef.value?.resetValidation?.());
}

function openCreateDialog(dimensionId = "") {
  editorMode.value = "question";
  dialogMode.value = "create";
  resetForm();
  if (isMultiDimension.value) {
    const selectedDimensionId = dimensionItems.value.some(
      (dimension) => dimension.id === selectedSectionId.value,
    )
      ? selectedSectionId.value
      : "";
    editForm.dimensionId = dimensionId || selectedDimensionId || "";
  }
  dialogOpen.value = true;
}

function openEditDialog(item: QuestionnaireQuestionModel) {
  selectQuestion(item);
  editorMode.value = "question";
  dialogMode.value = "edit";
  dialogError.value = "";
  saving.value = false;
  validationAttempted.value = false;

  mediaUploadError.value = "";
  questionImageUploadError.value = "";
  editForm.id = item.id;
  editForm.text = item.text ?? "";
  editForm.description = (item as any).description ?? "";
  editForm.isRequired = Boolean(item.isRequired);
  editForm.hint = String((item as any)?.meta?.hint ?? "...");
  editForm.questionImageId = String(item.questionImage?.mediaId ?? "");
  editForm.questionImagePreviewUrl =
    item.questionImageUrl ?? item.questionImage?.publicUrl ?? null;
  editForm.questionImageUploading = false;
  editForm.dimensionId = resolveQuestionDimensionId(item);
  editForm.questionMode =
    (item as any)?.questionMode === "image" ? "image" : "text";
  editForm.mediaId = item.media?.mediaId ?? "";
  editForm.mediaPreviewUrl = item.imageUrl ?? item.media?.publicUrl ?? null;
  editForm.mediaUploading = false;

  // load options for per-question editing UI
  editForm.options =
    (item.options || []).map((o: any) =>
      createLocalOption({
        key: o.key,
        label: o.label,
        scoreValue: Number(o.scoreValue ?? 0),
        isCorrect: Boolean(o.isCorrect),
        sortOrder: Number(o.sortOrder ?? 1),
        optionMode: o.optionMode === "image" ? "image" : "text",
        mediaId: o.media?.mediaId ?? "",
        mediaPreviewUrl: o.imageUrl ?? o.media?.publicUrl ?? null,
      }),
    ) || [];

  dialogOpen.value = true;
  nextTick(() => dialogFormRef.value?.resetValidation?.());
}

function openCreateDimensionDialog() {
  editorMode.value = "dimension";
  dialogMode.value = "create";
  selectedQuestionId.value = null;
  selectedSectionId.value = null;
  dialogError.value = "";
  saving.value = false;
  dimensionForm.id = "";
  dimensionForm.key = "";
  dimensionForm.name = "";
  dimensionForm.description = "";
  dimensionDeleteConfirm.value = false;
  dialogOpen.value = true;
  nextTick(() => dimensionFormRef.value?.resetValidation?.());
}

function openDimensionEditor(section: QuestionSection) {
  if (!isMultiDimension.value || section.id === "unassigned") return;

  const dimension = dimensionItems.value.find((item) => item.id === section.id);
  if (!dimension) return;

  editorMode.value = "dimension";
  dialogMode.value = "edit";
  dialogError.value = "";
  saving.value = false;
  dimensionForm.id = dimension.id;
  dimensionForm.key = dimension.key ?? "";
  dimensionForm.name = dimension.name ?? "";
  dimensionForm.description = dimension.description ?? "";
  dimensionDeleteConfirm.value = false;
  dialogOpen.value = true;
  nextTick(() => dimensionFormRef.value?.resetValidation?.());
}

function closeDialog() {
  dialogOpen.value = false;
}

async function handleDimensionSave() {
  dialogError.value = "";

  const res = await dimensionFormRef.value?.validate?.();
  if (!res?.valid) return;
  if (dialogMode.value === "edit" && !dimensionForm.id) return;

  saving.value = true;
  try {
    const payload = {
      id: dialogMode.value === "edit" ? dimensionForm.id : "",
      name: dimensionForm.name.trim(),
      description: dimensionForm.description.trim(),
    };

    const response =
      dialogMode.value === "create"
        ? await dimensionStore.create(payload)
        : await dimensionStore.update(dimensionForm.id, payload);

    if (typeof response?.success === "boolean" && !response.success) {
      const errorMsg =
        response.error?.message || response.error || "Failed to save dimension";
      snack?.open?.(errorMsg, { color: "error" });
      return;
    }

    const savedDimension = response?.data as
      | QuestionnaireDimensionModel
      | undefined;
    if (savedDimension?.id) {
      upsertLocalDimension(savedDimension);
      selectedSectionId.value = savedDimension.id;
    }
    snack.open(
      dialogMode.value === "create"
        ? "Dimension created."
        : "Dimension updated.",
      { color: "success" },
    );
    if (dialogMode.value === "create") {
      closeDialog();
    }
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save dimension";
  } finally {
    saving.value = false;
  }
}

async function deleteDimension() {
  if (!dimensionForm.id) return;

  deletingDimension.value = true;
  try {
    const res = await dimensionStore.remove(dimensionForm.id);

    if (typeof res?.success === "boolean" && !res.success) {
      const errorMsg =
        res.error?.message || res.error || "Failed to delete dimension";
      snack?.open?.(errorMsg, { color: "error" });
      return;
    }

    removeLocalDimension(dimensionForm.id);
    snack.open("Dimension deleted.", { color: "success" });
  } catch (err: any) {
    const errorMsg =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to delete dimension";
    snack?.open?.(errorMsg, { color: "error" });
  } finally {
    deletingDimension.value = false;
    dimensionDeleteConfirm.value = false;
  }
}

function getImageUploaderFile(payload: ImageUploaderPayload): File | null {
  if (Array.isArray(payload)) return payload[0] ?? null;
  if (payload instanceof File) return payload;
  return payload?.file ?? null;
}

async function onQuestionImageSelected(
  payload: ImageUploaderPayload,
): Promise<void> {
  const file = getImageUploaderFile(payload);

  if (!(file instanceof File) || file.size === 0) {
    clearQuestionImage();
    return;
  }

  questionImageUploadError.value = "";
  editForm.questionImageUploading = true;

  try {
    const res = await questionsStore.uploadMedia(file);

    if (!res?.success) {
      questionImageUploadError.value =
        res?.error?.message || res?.error || "Failed to upload image.";
      return;
    }

    editForm.questionImageId = res.data?.id ?? "";
    editForm.questionImagePreviewUrl = res.data?.publicUrl ?? null;
  } catch (err: any) {
    questionImageUploadError.value = err?.message || "Failed to upload image.";
  } finally {
    editForm.questionImageUploading = false;
  }
}

function clearQuestionImage(): void {
  editForm.questionImageId = "";
  editForm.questionImagePreviewUrl = null;
  questionImageUploadError.value = "";
}

async function onQuestionModeImageSelected(
  payload: ImageUploaderPayload,
): Promise<void> {
  const file = getImageUploaderFile(payload);

  if (!(file instanceof File) || file.size === 0) {
    clearQuestionModeImage();
    return;
  }

  mediaUploadError.value = "";
  editForm.mediaUploading = true;

  try {
    const res = await questionsStore.uploadMedia(file);

    if (!res?.success) {
      mediaUploadError.value =
        res?.error?.message || res?.error || "Failed to upload image.";
      return;
    }

    editForm.mediaId = res.data?.id ?? "";
    editForm.mediaPreviewUrl = res.data?.publicUrl ?? null;
  } catch (err: any) {
    mediaUploadError.value = err?.message || "Failed to upload image.";
  } finally {
    editForm.mediaUploading = false;
  }
}

function clearQuestionModeImage(): void {
  editForm.mediaId = "";
  editForm.mediaPreviewUrl = null;
  mediaUploadError.value = "";
}

function addOption() {
  editForm.options.push(createLocalOption());
}

function removeOption(index: number) {
  editForm.options.splice(index, 1);
}

async function onOptionImageSelected(
  option: LocalOption,
  payload: ImageUploaderPayload,
): Promise<void> {
  const file = getImageUploaderFile(payload);

  if (!(file instanceof File) || file.size === 0) {
    clearOptionImage(option);
    return;
  }

  option.mediaUploadError = "";
  option.mediaUploading = true;

  try {
    const res = await questionsStore.uploadMedia(file, {
      partition: "options",
    });

    if (!res?.success) {
      option.mediaUploadError =
        res?.error?.message || res?.error || "Failed to upload image.";
      return;
    }

    option.mediaId = res.data?.id ?? "";
    option.mediaPreviewUrl = res.data?.publicUrl ?? null;
  } catch (err: any) {
    option.mediaUploadError = err?.message || "Failed to upload image.";
  } finally {
    option.mediaUploading = false;
  }
}

function clearOptionImage(option: LocalOption): void {
  option.mediaId = "";
  option.mediaPreviewUrl = null;
  option.mediaUploadError = "";
}

async function handleSave() {
  validationAttempted.value = true;
  dialogError.value = "";

  const res = await dialogFormRef.value?.validate?.();
  if (!res?.valid) return;

  if (questionTextError.value) return;

  if (optionsMode.value !== "fixed" && editForm.options.length < 2) {
    dialogError.value = "Add at least 2 options.";
    return;
  }

  if (editForm.questionMode === "image" && !editForm.mediaId) {
    dialogError.value = "Upload an image before saving.";
    return;
  }

  if (
    optionsMode.value !== "fixed" &&
    editForm.options.some((o) => o.optionMode === "image" && !o.mediaId)
  ) {
    dialogError.value = "Upload an image for every image-mode option.";
    return;
  }

  if (
    optionsMode.value !== "fixed" &&
    isPercentageMode.value &&
    !editForm.options.some((o) => o.isCorrect)
  ) {
    dialogError.value = "Mark at least one option as correct.";
    return;
  }

  saving.value = true;
  try {
    const payload: any = {
      text: editForm.text.trim(),
      description: editForm.description.trim(),
      questionType: "single_choice",
      questionMode: editForm.questionMode,
      questionImageMediaId: editForm.questionImageId || null,
      mediaId: editForm.questionMode === "image" ? editForm.mediaId : null,

      isRequired: Boolean(editForm.isRequired),
      meta: { hint: editForm.hint.trim() },
      options: editForm.options.map((o: LocalOption) => ({
        label: o.label.trim(),
        scoreValue: Number(o.scoreValue),
        isCorrect: Boolean(o.isCorrect),
        optionMode: o.optionMode,
        mediaId: o.optionMode === "image" ? o.mediaId : null,
      })),
    };

    if (isMultiDimension.value) {
      payload.dimensionId = editForm.dimensionId;
      payload.weight = 1;
    }

    if (optionsMode.value !== "fixed") {
      payload.options = editForm.options.map((o: LocalOption) => ({
        label: o.label.trim(),
        scoreValue: Number(o.scoreValue),
        isCorrect: Boolean(o.isCorrect),
        optionMode: o.optionMode,
        mediaId: o.optionMode === "image" ? o.mediaId : null,
      }));
    }

    if (dialogMode.value === "create") {
      const res = await questionsStore.create(payload);

      if (typeof res?.success === "boolean") {
        if (!res.success) {
          const errorMsg =
            res.error?.message || res.error || "Failed to create question";
          snack?.open?.(errorMsg, { color: "error" });
          return;
        }
      }

      const createdQuestionId = String(res?.data?.id || "");
      const targetDimensionId = editForm.dimensionId;

      if (createdQuestionId) {
        upsertLocalQuestion(
          buildLocalQuestionFromForm(res?.data, createdQuestionId),
        );
        selectedQuestionId.value = createdQuestionId;
      }
      if (targetDimensionId && !isSectionExpanded(targetDimensionId)) {
        toggleSection(targetDimensionId);
      }

      sectionKey.value++;
      snack.open("Question created.", { color: "success" });
      closeDialog();

      return;
    } else if (dialogMode.value === "edit") {
      const id = editForm.id;
      if (!id) throw new Error("Missing question id.");

      const res = await questionsStore.update(id, payload);

      if (typeof res?.success === "boolean") {
        if (!res.success) {
          const errorMsg =
            res.error?.message || res.error || "Failed to save question";
          snack?.open?.(errorMsg, { color: "error" });
          return;
        }
      }

      upsertLocalQuestion(buildLocalQuestionFromForm(res?.data, id));
      selectedQuestionId.value = id;
      snack.open("Changes saved.", { color: "success" });

      return;
    }
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to save";
  } finally {
    saving.value = false;
  }
}

function confirmDeleteQuestion(question: QuestionnaireQuestionModel) {
  deletingQuestionId.value = question.id;
}

function cancelDeleteQuestion() {
  deletingQuestionId.value = null;
}

async function deleteQuestion(question: QuestionnaireQuestionModel) {
  try {
    deleting.value = true;
    const res = await questionsStore.remove(question.id);

    if (typeof res?.success === "boolean") {
      if (!res.success) {
        const errorMsg =
          res.error?.message || res.error || "Failed to delete question";
        snack?.open?.(errorMsg, { color: "error" });
        return;
      }
    }

    removeLocalQuestion(question.id);
    deletingQuestionId.value = null;
    snack.open("Question deleted.", { color: "success" });
  } catch (err: any) {
    dialogError.value =
      err?.response?.data?.error?.message ||
      err?.response?.data?.message ||
      err?.message ||
      "Failed to delete question";
  } finally {
    deleting.value = false;
  }
}

// Options drag state
const draggingOptionId = ref<string | null>(null);
const optionDropTargetId = ref<string | null>(null);

function onOptionDragStart(evt: DragEvent, o: any) {
  draggingOptionId.value = o.__localId;
  optionDropTargetId.value = null;
  evt.dataTransfer?.setData("text/plain", o.__localId);
  if (evt.dataTransfer) evt.dataTransfer.effectAllowed = "move";
}

function onOptionDragEnter(target: any) {
  if (!draggingOptionId.value || draggingOptionId.value === target.__localId)
    return;
  optionDropTargetId.value = target.__localId;
}

function onOptionDragLeave(target: any) {
  if (optionDropTargetId.value === target.__localId)
    optionDropTargetId.value = null;
}

function onOptionDrop(target: any) {
  const fromId = draggingOptionId.value;
  if (!fromId || fromId === target.__localId) return;

  const fromIndex = editForm.options.findIndex((x) => x.__localId === fromId);
  const toIndex = editForm.options.findIndex(
    (x) => x.__localId === target.__localId,
  );
  if (fromIndex < 0 || toIndex < 0) return;

  const next = [...editForm.options];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  editForm.options = next;

  optionDropTargetId.value = null;
}

function onOptionDragEnd() {
  draggingOptionId.value = null;
  optionDropTargetId.value = null;
}
</script>

<style scoped lang="scss">
.question-builder-page {
  display: grid;
  gap: 24px;
}

.question-builder-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px;
  background:
    radial-gradient(
      circle at top left,
      rgba(var(--v-theme-primary), 0.14),
      transparent 34%
    ),
    linear-gradient(135deg, #ffffff, #f8fbff 52%, #f4f7fb);
}

.question-builder-eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.question-builder-title {
  margin: 10px 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.question-builder-subtitle {
  max-width: 680px;
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.question-builder-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.question-builder-status-pill,
.question-builder-status-note {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.question-builder-status-pill {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.question-builder-status-note {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

.question-builder-status-note--error {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.08);
}

.question-section-list {
  display: grid;
  gap: 12px;
  background: transparent;
}

.question-builder-workspace {
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  min-height: 640px;
  background:
    linear-gradient(90deg, #ffffff 0, #ffffff 400px, transparent 400px),
    radial-gradient(
      circle at top left,
      rgba(var(--v-theme-primary), 0.07),
      transparent 36%
    ),
    #f8fafc;
}

.question-builder-sidebar {
  padding: 24px;
  border-right: 1px solid rgba(148, 163, 184, 0.18);
  background: #fff;
}

.question-builder-sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
}

.question-builder-sidebar-label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.question-builder-search {
  margin-bottom: 18px;
}

.question-builder-preview {
  min-width: 0;
  padding: 32px;
  overflow: auto;
  transition: padding-right 0.18s ease;
}

.question-builder-workspace--editor-open .question-builder-preview {
  padding-right: 432px;
}

.question-preview-card {
  max-width: 720px;
  min-height: 520px;
  margin: 0 auto;
  padding: 56px 64px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 28px !important;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.06);
}

.question-preview-title-row {
  display: grid;
  grid-template-columns: 54px minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

.question-preview-number {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1f2937;
}

.question-preview-text {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.45;
  color: #1f2937;
}

.question-preview-text :deep(p) {
  margin: 0 0 10px;
}

.question-preview-text :deep(p:last-child) {
  margin-bottom: 0;
}

.question-preview-title-row p {
  margin: 8px 0 0;
  font-size: 0.82rem;
  color: #64748b;
}

.question-preview-image {
  margin-left: 64px;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.question-preview-options {
  display: grid;
  gap: 12px;
  margin-top: 36px;
  padding-left: 66px;
}

.question-preview-option {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 56px;
  padding: 12px 16px;
  border: 1px solid rgba(var(--v-theme-primary), 0.24);
  border-radius: 14px;
  color: #1f2937;
  background: rgba(var(--v-theme-primary), 0.04);
}

.question-preview-option.active {
  color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.12);
}

.question-preview-empty {
  display: flex;
  min-height: 400px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #64748b;
  text-align: center;
}

.question-preview-empty strong {
  color: #0f172a;
}

.question-builder-editor-drawer {
  border-left: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: none !important;

  :deep(.v-navigation-drawer__content) {
    box-shadow: none !important;
  }
}

.question-builder-editor-toolbar {
  min-height: 68px;
  padding: 0 16px;
}

.question-builder-editor-card {
  background: transparent;
}

.question-builder-editor-footer {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.96);
}

.question-editor-field {
  display: grid;
  gap: 8px;
}

.question-editor-label {
  margin-bottom: 4px;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
}

.question-editor-error {
  color: rgb(var(--v-theme-error));
  font-size: 0.75rem;
  line-height: 1.4;
}

.question-editor-field :deep(.tiptap-editor > .v-card) {
  border-color: rgba(148, 163, 184, 0.28);
  border-radius: 16px !important;
  box-shadow: none;
}

.question-editor-field
  :deep(.tiptap-editor > .v-card > .v-card-text:first-child) {
  padding: 10px 12px !important;
}

.question-editor-field :deep(.tiptap-editor .sb-toolbar-btn) {
  min-width: 32px;
  min-height: 32px;
  border-color: rgba(148, 163, 184, 0.22);
  background: #fff;
}

.question-editor-field
  :deep(.tiptap-editor .sb-toolbar-btn:not(.sb-toolbar-btn--icon-only)) {
  padding: 0 10px;
}

.question-editor-field :deep(.tiptap-editor .editor-surface) {
  min-height: 132px !important;
  padding: 14px !important;
  background: #fff;
}

.question-editor-field :deep(.tiptap-content) {
  color: #1f2937;
  font-size: 0.94rem;
  line-height: 1.65;
}

.question-editor-field :deep(.tiptap-content p:last-child) {
  margin-bottom: 0;
}

.question-section {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 20px !important;
  background: #fff;
  overflow: hidden;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.04);
}

.question-section--sortable {
  cursor: grab;
}

.question-section--sortable:active {
  cursor: grabbing;
}

.question-section--selected {
  border-color: rgba(var(--v-theme-primary), 0.34);
}

.question-section--incomplete {
  border-color: rgba(var(--v-theme-error), 0.34);
}

.question-section-head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 48px;
  align-items: stretch;
  min-height: 64px !important;
  padding: 0 !important;
}

.question-section-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 14px 0 14px 16px;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.question-section-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.question-section-title {
  overflow: hidden;
  color: #1f2937;
  font-size: 0.92rem;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.question-section-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  color: #64748b;
  font-size: 0.78rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-section-status {
  min-width: 52px;
  justify-content: center;
  font-size: 0.66rem;
}

.question-section-toggle {
  width: 48px !important;
  height: 100% !important;
  min-height: 64px;
  border-radius: 0 !important;
  color: #6b7280;
}

.question-section-panel {
  border-top: 1px solid rgba(148, 163, 184, 0.14);
}

.question-row {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #64748b;
  cursor: pointer;
}

.question-row:last-child {
  border-bottom: 0;
}

.question-row-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 24px;
  padding: 0 8px;
  border-radius: 5px;
  color: #374151;
  background: #e5e7eb;
  font-size: 0.78rem;
  font-weight: 600;
}

.question-row-text {
  overflow: hidden;
  font-size: 0.82rem;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.question-row--selected {
  color: #0f172a;
  background: rgba(var(--v-theme-primary), 0.06);
}

.question-row-delete-confirm,
.dimension-delete-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.question-section-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 86px;
  border: 1px dashed rgba(148, 163, 184, 0.32);
  border-radius: 18px;
  color: #64748b;
  font-size: 0.88rem;
  background: #f8fafc;
}

.question-section-alert {
  margin: 16px;
  padding: 10px 12px;
  border: 1px solid rgba(var(--v-theme-error), 0.36);
  border-radius: 14px;
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.04);
  font-size: 0.78rem;
  line-height: 1.45;
}

.question-section-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px 16px;
}

.sb-handle {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  background: rgba(var(--v-theme-on-surface), 0.04);
}
.sb-draggable {
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}
.sb-dragging {
  opacity: 0.65;
}
.sb-drop-target {
  border-color: rgba(var(--v-theme-primary), 0.55) !important;
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.1);
}
.sb-sentinel {
  height: 1px;
}

@media (max-width: 960px) {
  .question-builder-hero {
    flex-direction: column;
    align-items: stretch;
    padding: 24px;
  }

  .question-builder-workspace {
    grid-template-columns: 1fr;
  }

  .question-builder-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  }

  .question-builder-preview {
    padding: 20px;
  }

  .question-builder-workspace--editor-open .question-builder-preview {
    padding-right: 20px;
  }

  .question-preview-card {
    padding: 28px 22px;
  }

  .question-preview-title-row {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .question-preview-options {
    padding-left: 0;
  }
}
</style>
