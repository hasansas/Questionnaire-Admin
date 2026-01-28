<!-- /pages/questionnaires/[id].vue -->
<template>
  <div class="sb-page">
    <AdminPageHeader :title="pageTitle" :subtitle="pageSubtitle">
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:arrow-left"
            to="/questionnaires"
          >
            Back
          </v-btn>

          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:download">
            Export
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item title="Export CSV (UI only)" />
                <v-list-item title="Export Excel (UI only)" />
              </v-list>
            </v-menu>
          </v-btn>

          <v-btn rounded="lg" color="primary" prepend-icon="lucide:save">
            Save changes
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <!-- 4 states -->
    <template v-if="ui.loading">
      <v-row>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text, text" />
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <v-skeleton-loader type="heading, text" />
            </div>
            <v-divider />
            <div class="pa-4">
              <v-skeleton-loader type="table" />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <template v-else-if="ui.error">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-alert type="error" variant="tonal" rounded="lg" class="mb-4">
          {{ ui.error }}
        </v-alert>
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
          <v-btn rounded="lg" variant="outlined" to="/questionnaires"
            >Back to list</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else-if="!questionnaire">
      <v-card rounded="xl" class="sb-card pa-10">
        <div class="d-flex flex-column align-center text-center">
          <v-avatar size="56" color="primary" variant="tonal" class="mb-3">
            <v-icon icon="lucide:clipboard-list" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">
            Questionnaire not found
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
            The requested questionnaire does not exist in mock data.
          </div>
          <v-btn
            rounded="lg"
            color="primary"
            to="/questionnaires"
            prepend-icon="lucide:arrow-left"
          >
            Back to Questionnaires
          </v-btn>
        </div>
      </v-card>
    </template>

    <template v-else>
      <div class="d-flex flex-column ga-4">
        <!-- Quick overview -->
        <v-row>
          <v-col cols="12" lg="8">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="d-flex align-start justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="d-flex align-center ga-2 flex-wrap">
                    <div class="text-subtitle-1 font-weight-black">
                      {{ questionnaire.title }}
                    </div>
                    <v-chip size="small" variant="tonal" color="success">{{
                      questionnaire.status
                    }}</v-chip>
                    <v-chip size="small" variant="tonal">{{
                      questionnaire.language.toUpperCase()
                    }}</v-chip>
                    <v-chip size="small" variant="tonal" color="primary">
                      {{
                        questionnaire.scoring_type === "multi_dimension"
                          ? "Multi-dimension"
                          : "Total score"
                      }}
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="optionsMode === 'fixed' ? 'success' : 'warning'"
                    >
                      Options:
                      {{ optionsMode === "fixed" ? "Fixed" : "Per-question" }}
                    </v-chip>
                  </div>

                  <div class="text-body-2 text-medium-emphasis mt-2">
                    {{ questionnaire.description }}
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap mt-4">
                    <v-chip size="small" variant="tonal">
                      Code:
                      <span class="ms-1 font-weight-bold">{{
                        questionnaire.code
                      }}</span>
                    </v-chip>
                    <v-chip size="small" variant="tonal">
                      Version:
                      <span class="ms-1 font-weight-bold"
                        >v{{ questionnaire.version }}</span
                      >
                    </v-chip>
                    <v-chip
                      size="small"
                      variant="tonal"
                      :color="
                        questionnaire.show_result_to_user
                          ? 'success'
                          : 'warning'
                      "
                    >
                      Result:
                      <span class="ms-1 font-weight-bold">{{
                        questionnaire.show_result_to_user ? "Shown" : "Hidden"
                      }}</span>
                    </v-chip>
                  </div>
                </div>

                <div class="d-flex align-center ga-2">
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:eye"
                    >Preview</v-btn
                  >
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:copy"
                    >Duplicate</v-btn
                  >
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" lg="4">
            <v-card rounded="xl" class="sb-card pa-4">
              <div class="text-subtitle-1 font-weight-black">Summary</div>
              <div class="text-caption text-medium-emphasis">
                Key building blocks
              </div>

              <v-divider class="my-4" />

              <div class="d-flex flex-column ga-3">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:list-checks" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">Questions</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ localQuestions.length }}
                  </div>
                </div>

                <div
                  v-if="isMultiDimension"
                  class="d-flex align-center justify-space-between"
                >
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="info"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:layers" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">Dimensions</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ dimensions.length }}
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="success"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:badge-check" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">Bands</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ bands.length }}
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="warning"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:sparkles" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">Meanings</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ meanings.length }}
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:form-input" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">User fields</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ userFieldConfigs.length }}
                  </div>
                </div>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      :color="optionsMode === 'fixed' ? 'success' : 'warning'"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:toggle-left" size="16" />
                    </v-avatar>
                    <div class="text-body-2 font-weight-bold">Options mode</div>
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ optionsMode === "fixed" ? "Fixed" : "Per-question" }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Tabs -->
        <v-card rounded="xl" class="sb-card">
          <v-tabs v-model="tab" class="px-2">
            <v-tab value="overview">Overview</v-tab>
            <v-tab value="questions">Questions</v-tab>
            <v-tab value="dimensions" v-if="isMultiDimension">Dimensions</v-tab>
            <v-tab value="bands">Bands</v-tab>
            <v-tab value="meanings">Meanings</v-tab>
            <v-tab value="user_info">User Info Config</v-tab>
          </v-tabs>

          <v-divider />

          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-6">
                <v-row>
                  <v-col cols="12" lg="7">
                    <v-card rounded="xl" variant="tonal" class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Meta
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Basic questionnaire configuration
                          </div>
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:pencil"
                          >Edit meta</v-btn
                        >
                      </div>

                      <v-divider class="my-4" />

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Code
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.code }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Version
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            v{{ questionnaire.version }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Language
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.language.toUpperCase() }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Scoring type
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              questionnaire.scoring_type === "multi_dimension"
                                ? "Multi-dimension"
                                : "Total score"
                            }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Show result
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              questionnaire.show_result_to_user ? "Yes" : "No"
                            }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="6">
                          <div class="text-caption text-medium-emphasis">
                            Options mode
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{
                              optionsMode === "fixed"
                                ? "Fixed (global)"
                                : "Per-question"
                            }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="5">
                    <v-card rounded="xl" class="pa-4">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Options
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            {{
                              optionsMode === "fixed"
                                ? "Global option set used by all questions."
                                : "Configured per question."
                            }}
                          </div>
                        </div>

                        <v-btn
                          v-if="optionsMode === 'fixed'"
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:pencil"
                          @click="fixedOptionsDialog = true"
                        >
                          Edit
                        </v-btn>
                      </div>

                      <v-divider class="my-4" />

                      <template v-if="optionsMode === 'fixed'">
                        <div class="d-flex flex-column ga-2">
                          <v-card
                            v-for="o in fixedOptions"
                            :key="o.id"
                            rounded="xl"
                            variant="tonal"
                            class="pa-3"
                          >
                            <div
                              class="d-flex align-center justify-space-between"
                            >
                              <div class="text-body-2 font-weight-bold">
                                {{ o.label }}
                              </div>
                              <v-chip size="small" variant="tonal"
                                >Score: {{ o.score_value }}</v-chip
                              >
                            </div>
                          </v-card>
                        </div>
                      </template>

                      <template v-else>
                        <v-alert type="info" variant="tonal" rounded="lg">
                          Open a question to manage its options.
                        </v-alert>
                      </template>
                    </v-card>
                  </v-col>
                </v-row>

                <!-- Fixed options dialog -->
                <v-dialog v-model="fixedOptionsDialog" max-width="820">
                  <v-card rounded="xl">
                    <v-card-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        Fixed options (global)
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        @click="fixedOptionsDialog = false"
                      >
                        <v-icon icon="lucide:x" />
                      </v-btn>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-6">
                      <v-alert
                        type="info"
                        variant="tonal"
                        rounded="lg"
                        class="mb-4"
                      >
                        UI only. Changes are not persisted.
                      </v-alert>

                      <v-data-table
                        :headers="fixedOptionHeaders"
                        :items="fixedOptionsDraft"
                        item-key="id"
                        density="comfortable"
                      >
                        <template #item.label="{ item }">
                          <v-text-field
                            v-model="item.label"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            hide-details
                          />
                        </template>

                        <template #item.score_value="{ item }">
                          <v-text-field
                            v-model.number="item.score_value"
                            type="number"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            hide-details
                          />
                        </template>

                        <template #item.sort_order="{ item }">
                          <v-text-field
                            v-model.number="item.sort_order"
                            type="number"
                            variant="outlined"
                            rounded="lg"
                            density="comfortable"
                            hide-details
                          />
                        </template>
                      </v-data-table>
                    </v-card-text>

                    <v-divider />

                    <v-card-actions class="pa-4">
                      <v-btn
                        rounded="lg"
                        variant="text"
                        @click="fixedOptionsDialog = false"
                        >Close</v-btn
                      >
                      <v-spacer />
                      <v-btn
                        rounded="lg"
                        variant="outlined"
                        prepend-icon="lucide:rotate-ccw"
                        @click="resetFixedDraft"
                      >
                        Reset
                      </v-btn>
                      <v-btn
                        rounded="lg"
                        color="primary"
                        prepend-icon="lucide:save"
                        @click="applyFixedDraft"
                      >
                        Apply (UI)
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </v-window-item>

            <!-- Questions -->
            <v-window-item value="questions">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Questions
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{
                        optionsMode === "fixed"
                          ? "Options are fixed globally for all questions."
                          : "Options are configured per question."
                      }}
                    </div>
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-text-field
                      v-model="questionSearch"
                      density="comfortable"
                      variant="outlined"
                      rounded="lg"
                      prepend-inner-icon="lucide:search"
                      placeholder="Search questions..."
                      hide-details
                      class="sb-search"
                    />

                    <v-btn
                      rounded="lg"
                      variant="outlined"
                      prepend-icon="lucide:sliders-horizontal"
                    >
                      Filters
                      <v-menu activator="parent" location="bottom end">
                        <v-list density="compact" class="pa-2">
                          <v-list-subheader>Dimension</v-list-subheader>
                          <v-list-item
                            v-for="opt in dimensionFilterItems"
                            :key="opt.value"
                            @click="filters.dimension_code = opt.value"
                          >
                            <v-list-item-title>{{
                              opt.title
                            }}</v-list-item-title>
                          </v-list-item>
                          <v-divider class="my-2" />
                          <v-list-item @click="filters.dimension_code = ''">
                            <v-list-item-title>Clear</v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </v-btn>

                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openQuestionDialog()"
                    >
                      Add question
                    </v-btn>
                  </div>
                </div>

                <v-card
                  v-if="optionsMode === 'fixed'"
                  rounded="xl"
                  variant="tonal"
                  class="pa-4 mb-4"
                >
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2"
                  >
                    <div class="text-body-2 font-weight-bold">
                      Fixed options (global)
                    </div>
                    <div class="d-flex align-center ga-2 flex-wrap">
                      <v-chip
                        v-for="o in fixedOptionsSorted"
                        :key="o.id"
                        size="small"
                        variant="tonal"
                      >
                        {{ o.label }} = {{ o.score_value }}
                      </v-chip>
                    </div>
                  </div>
                </v-card>

                <v-card rounded="xl" class="sb-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="d-flex align-center ga-2 flex-wrap">
                      <v-chip size="small" variant="tonal"
                        >Total: {{ localQuestions.length }}</v-chip
                      >
                      <v-chip size="small" variant="tonal" color="primary">
                        Showing: {{ filteredQuestions.length }}
                      </v-chip>
                      <v-chip
                        v-if="filters.dimension_code"
                        size="small"
                        variant="tonal"
                        color="primary"
                      >
                        Dimension: {{ filters.dimension_code }}
                      </v-chip>
                    </div>

                    <v-btn
                      rounded="lg"
                      variant="text"
                      prepend-icon="lucide:refresh-cw"
                      @click="resetQuestionFilters"
                    >
                      Reset
                    </v-btn>
                  </div>

                  <v-divider />

                  <v-data-table
                    :headers="questionHeaders"
                    :items="filteredQuestions"
                    item-key="id"
                    density="comfortable"
                  >
                    <template #item.sort_order="{ item }">
                      <v-chip size="small" variant="tonal">{{
                        item.sort_order
                      }}</v-chip>
                    </template>

                    <template #item.question_text="{ item }">
                      <div class="min-w-0">
                        <div class="font-weight-semibold text-truncate">
                          {{ item.question_text }}
                        </div>
                        <div class="text-caption text-medium-emphasis">
                          {{ getQuestionDimensionLabel(item.id) }}
                        </div>
                      </div>
                    </template>

                    <template #item.is_required="{ item }">
                      <v-chip
                        size="small"
                        :color="item.is_required ? 'success' : 'warning'"
                        variant="tonal"
                      >
                        {{ item.is_required ? "Required" : "Optional" }}
                      </v-chip>
                    </template>

                    <template #item.actions="{ item }">
                      <div class="d-flex justify-end ga-1">
                        <v-btn
                          icon
                          variant="text"
                          @click="openQuestionDialog(item.id)"
                          aria-label="Edit question"
                        >
                          <v-icon icon="lucide:pencil" />
                        </v-btn>
                        <v-btn icon variant="text" aria-label="More actions">
                          <v-icon icon="lucide:more-horizontal" />
                          <v-menu activator="parent" location="bottom end">
                            <v-list density="compact">
                              <v-list-item title="Duplicate (UI)" />
                              <v-list-item title="Disable (UI)" />
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-card>

                <!-- Question dialog -->
                <v-dialog v-model="questionDialog" max-width="920">
                  <v-card rounded="xl">
                    <v-card-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        {{ questionForm.id ? "Edit question" : "Add question" }}
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        @click="questionDialog = false"
                      >
                        <v-icon icon="lucide:x" />
                      </v-btn>
                    </v-card-title>

                    <v-divider />

                    <v-card-text class="pa-6">
                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12">
                          <v-textarea
                            v-model="questionForm.question_text"
                            label="Question text"
                            variant="outlined"
                            rounded="lg"
                            rows="3"
                            auto-grow
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-text-field
                            v-model.number="questionForm.sort_order"
                            type="number"
                            label="Sort order"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-select
                            v-model="questionForm.dimension_code"
                            :items="dimensionSelectItems"
                            item-title="title"
                            item-value="value"
                            label="Dimension"
                            variant="outlined"
                            rounded="lg"
                            :disabled="!isMultiDimension"
                            hint="Mapping question → dimension"
                            persistent-hint
                          />
                        </v-col>

                        <v-col cols="12" md="4">
                          <v-select
                            v-model="questionForm.is_required"
                            :items="requiredItems"
                            item-title="title"
                            item-value="value"
                            label="Required"
                            variant="outlined"
                            rounded="lg"
                          />
                        </v-col>

                        <v-col cols="12">
                          <template v-if="optionsMode === 'fixed'">
                            <v-card rounded="xl" variant="tonal" class="pa-4">
                              <div
                                class="d-flex align-center justify-space-between flex-wrap ga-2"
                              >
                                <div>
                                  <div class="text-body-2 font-weight-bold">
                                    Options (fixed)
                                  </div>
                                  <div
                                    class="text-caption text-medium-emphasis"
                                  >
                                    This questionnaire uses a global option set.
                                  </div>
                                </div>
                                <div class="d-flex ga-2 flex-wrap">
                                  <v-chip
                                    v-for="o in fixedOptionsSorted"
                                    :key="o.id"
                                    size="small"
                                    variant="tonal"
                                  >
                                    {{ o.label }} · {{ o.score_value }}
                                  </v-chip>
                                </div>
                              </div>
                            </v-card>
                          </template>

                          <template v-else>
                            <v-card rounded="xl" class="sb-card">
                              <div
                                class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                              >
                                <div>
                                  <div class="text-body-2 font-weight-bold">
                                    Options (per question)
                                  </div>
                                  <div
                                    class="text-caption text-medium-emphasis"
                                  >
                                    Add answer options and scoring for this
                                    question.
                                  </div>
                                </div>
                                <v-btn
                                  rounded="lg"
                                  color="primary"
                                  prepend-icon="lucide:plus"
                                  @click="addOptionRow"
                                >
                                  Add option
                                </v-btn>
                              </div>
                              <v-divider />
                              <div class="pa-4">
                                <v-data-table
                                  :headers="optionHeaders"
                                  :items="questionOptionsDraft"
                                  item-key="id"
                                  density="comfortable"
                                >
                                  <template #item.label="{ item }">
                                    <v-text-field
                                      v-model="item.label"
                                      variant="outlined"
                                      rounded="lg"
                                      density="comfortable"
                                      hide-details
                                    />
                                  </template>

                                  <template #item.score_value="{ item }">
                                    <v-text-field
                                      v-model.number="item.score_value"
                                      type="number"
                                      variant="outlined"
                                      rounded="lg"
                                      density="comfortable"
                                      hide-details
                                    />
                                  </template>

                                  <template #item.sort_order="{ item }">
                                    <v-text-field
                                      v-model.number="item.sort_order"
                                      type="number"
                                      variant="outlined"
                                      rounded="lg"
                                      density="comfortable"
                                      hide-details
                                    />
                                  </template>

                                  <template #item.actions="{ item }">
                                    <div class="d-flex justify-end">
                                      <v-btn
                                        icon
                                        variant="text"
                                        :disabled="
                                          questionOptionsDraft.length <= 2
                                        "
                                        @click="removeOptionRow(item.id)"
                                      >
                                        <v-icon icon="lucide:trash-2" />
                                      </v-btn>
                                    </div>
                                  </template>
                                </v-data-table>
                              </div>
                            </v-card>
                          </template>
                        </v-col>
                      </v-row>
                    </v-card-text>

                    <v-divider />

                    <v-card-actions class="pa-4">
                      <v-btn
                        rounded="lg"
                        variant="text"
                        @click="questionDialog = false"
                        >Cancel</v-btn
                      >
                      <v-spacer />
                      <v-btn
                        rounded="lg"
                        variant="outlined"
                        prepend-icon="lucide:check"
                        >Validate</v-btn
                      >
                      <v-btn
                        rounded="lg"
                        color="primary"
                        prepend-icon="lucide:save"
                        @click="saveQuestionUi"
                      >
                        Save (UI)
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </v-window-item>

            <!-- Dimensions -->
            <v-window-item value="dimensions" v-if="isMultiDimension">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Dimensions
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Visual, Auditori, Kinestetik (from uploaded xlsx)
                    </div>
                  </div>
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:plus"
                    >Add dimension</v-btn
                  >
                </div>

                <v-card rounded="xl" class="sb-card">
                  <v-data-table
                    :headers="dimensionHeaders"
                    :items="dimensions"
                    item-key="id"
                    density="comfortable"
                  >
                    <template #item.dimension_code="{ item }">
                      <v-chip size="small" variant="tonal" color="primary">{{
                        item.dimension_code
                      }}</v-chip>
                    </template>

                    <template #item.title="{ item }">
                      <div class="min-w-0">
                        <div class="font-weight-semibold text-truncate">
                          {{ item.title }}
                        </div>
                        <div
                          class="text-caption text-medium-emphasis text-truncate"
                        >
                          {{ item.description }}
                        </div>
                      </div>
                    </template>

                    <template #item.actions>
                      <div class="d-flex justify-end ga-1">
                        <v-btn icon variant="text" aria-label="Edit dimension">
                          <v-icon icon="lucide:pencil" />
                        </v-btn>
                        <v-btn icon variant="text" aria-label="More actions">
                          <v-icon icon="lucide:more-horizontal" />
                          <v-menu activator="parent" location="bottom end">
                            <v-list density="compact">
                              <v-list-item title="Reorder (UI)" />
                              <v-list-item title="Disable (UI)" />
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-card>
              </div>
            </v-window-item>

            <!-- Bands -->
            <v-window-item value="bands">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Score bands
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Thresholds per dimension: Low 0–10, Medium 11–20, High
                      21–30
                    </div>
                  </div>
                  <v-btn
                    rounded="lg"
                    variant="outlined"
                    prepend-icon="lucide:pencil"
                    >Edit bands</v-btn
                  >
                </div>

                <v-row>
                  <v-col
                    cols="12"
                    md="4"
                    v-for="group in bandsByDimension"
                    :key="group.key"
                  >
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center ga-2">
                          <v-avatar
                            size="34"
                            rounded="lg"
                            color="primary"
                            variant="tonal"
                          >
                            <v-icon icon="lucide:badge-check" size="16" />
                          </v-avatar>
                          <div>
                            <div class="text-body-2 font-weight-bold">
                              {{ group.title }}
                            </div>
                            <div class="text-caption text-medium-emphasis">
                              {{ group.subtitle }}
                            </div>
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal"
                          >{{ group.items.length }} bands</v-chip
                        >
                      </div>

                      <v-divider class="my-4" />

                      <div class="d-flex flex-column ga-3">
                        <div
                          v-for="b in group.items"
                          :key="b.id"
                          class="d-flex align-center justify-space-between"
                        >
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ b.band_label }}</v-chip
                          >
                          <div class="text-body-2 font-weight-bold">
                            {{ b.min_score }}–{{ b.max_score }}
                          </div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Meanings -->
            <v-window-item value="meanings">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      Meanings
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Rule type: band_combo + fallback (from uploaded xlsx)
                    </div>
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-text-field
                      v-model="meaningSearch"
                      density="comfortable"
                      variant="outlined"
                      rounded="lg"
                      prepend-inner-icon="lucide:search"
                      placeholder="Search label..."
                      hide-details
                      class="sb-search"
                    />
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      >Add meaning</v-btn
                    >
                  </div>
                </div>

                <v-card rounded="xl" class="sb-card">
                  <v-data-table
                    :headers="meaningHeaders"
                    :items="filteredMeanings"
                    item-key="id"
                    density="comfortable"
                  >
                    <template #item.rule_type="{ item }">
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="
                          item.rule_type === 'fallback' ? 'warning' : 'primary'
                        "
                      >
                        {{ item.rule_type }}
                      </v-chip>
                    </template>

                    <template #item.combo="{ item }">
                      <div
                        v-if="
                          item.rule_type === 'band_combo' && item.bands_json
                        "
                        class="d-flex ga-1 flex-wrap"
                      >
                        <v-chip size="x-small" variant="tonal"
                          >V: {{ item.bands_json.visual }}</v-chip
                        >
                        <v-chip size="x-small" variant="tonal"
                          >A: {{ item.bands_json.auditori }}</v-chip
                        >
                        <v-chip size="x-small" variant="tonal"
                          >K: {{ item.bands_json.kinestetik }}</v-chip
                        >
                      </div>
                      <span v-else class="text-caption text-medium-emphasis"
                        >—</span
                      >
                    </template>

                    <template #item.result_label="{ item }">
                      <div class="min-w-0">
                        <div class="font-weight-semibold text-truncate">
                          {{ item.result_label }}
                        </div>
                        <div
                          class="text-caption text-medium-emphasis text-truncate"
                        >
                          Priority {{ item.priority }}
                        </div>
                      </div>
                    </template>

                    <template #item.actions="{ item }">
                      <div class="d-flex justify-end ga-1">
                        <v-btn
                          icon
                          variant="text"
                          @click="openMeaningDialog(item.id)"
                          aria-label="View meaning"
                        >
                          <v-icon icon="lucide:eye" />
                        </v-btn>
                        <v-btn icon variant="text" aria-label="More actions">
                          <v-icon icon="lucide:more-horizontal" />
                          <v-menu activator="parent" location="bottom end">
                            <v-list density="compact">
                              <v-list-item title="Edit (UI)" />
                              <v-list-item title="Disable (UI)" />
                            </v-list>
                          </v-menu>
                        </v-btn>
                      </div>
                    </template>
                  </v-data-table>
                </v-card>

                <v-dialog v-model="meaningDialog" max-width="860">
                  <v-card rounded="xl">
                    <v-card-title
                      class="d-flex align-center justify-space-between"
                    >
                      <div class="text-subtitle-1 font-weight-bold">
                        Meaning detail
                      </div>
                      <v-btn icon variant="text" @click="meaningDialog = false">
                        <v-icon icon="lucide:x" />
                      </v-btn>
                    </v-card-title>
                    <v-divider />
                    <v-card-text class="pa-6">
                      <template v-if="activeMeaning">
                        <div class="d-flex align-center ga-2 flex-wrap mb-3">
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ activeMeaning.result_label }}</v-chip
                          >
                          <v-chip size="small" variant="tonal"
                            >Priority {{ activeMeaning.priority }}</v-chip
                          >
                          <v-chip
                            size="small"
                            variant="tonal"
                            :color="
                              activeMeaning.rule_type === 'fallback'
                                ? 'warning'
                                : 'primary'
                            "
                          >
                            {{ activeMeaning.rule_type }}
                          </v-chip>
                        </div>

                        <div
                          v-if="
                            activeMeaning.rule_type === 'band_combo' &&
                            activeMeaning.bands_json
                          "
                          class="d-flex ga-2 flex-wrap mb-4"
                        >
                          <v-chip size="small" variant="tonal"
                            >Visual:
                            {{ activeMeaning.bands_json.visual }}</v-chip
                          >
                          <v-chip size="small" variant="tonal"
                            >Auditori:
                            {{ activeMeaning.bands_json.auditori }}</v-chip
                          >
                          <v-chip size="small" variant="tonal"
                            >Kinestetik:
                            {{ activeMeaning.bands_json.kinestetik }}</v-chip
                          >
                        </div>

                        <v-card rounded="xl" variant="tonal" class="pa-4 mb-4">
                          <div class="text-body-2 font-weight-bold mb-2">
                            Description
                          </div>
                          <div class="text-body-2 text-medium-emphasis">
                            {{ activeMeaning.description }}
                          </div>
                        </v-card>

                        <v-card rounded="xl" variant="tonal" class="pa-4">
                          <div class="text-body-2 font-weight-bold mb-2">
                            Recommendations
                          </div>
                          <div class="d-flex flex-column ga-2">
                            <div
                              v-for="(r, idx) in activeMeaning.recommendations"
                              :key="idx"
                              class="d-flex align-start ga-2"
                            >
                              <v-icon icon="lucide:check" class="mt-1" />
                              <div class="text-body-2 text-medium-emphasis">
                                {{ r }}
                              </div>
                            </div>
                          </div>
                        </v-card>
                      </template>

                      <template v-else>
                        <v-alert type="info" variant="tonal" rounded="lg">
                          Select a meaning row to view details.
                        </v-alert>
                      </template>
                    </v-card-text>
                    <v-divider />
                    <v-card-actions class="pa-4">
                      <v-btn
                        rounded="lg"
                        variant="text"
                        @click="meaningDialog = false"
                        >Close</v-btn
                      >
                      <v-spacer />
                      <v-btn
                        rounded="lg"
                        variant="outlined"
                        prepend-icon="lucide:pencil"
                        >Edit</v-btn
                      >
                      <v-btn
                        rounded="lg"
                        color="primary"
                        prepend-icon="lucide:save"
                        >Save</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </div>
            </v-window-item>

            <!-- User info config -->
            <v-window-item value="user_info">
              <div class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-2 mb-4"
                >
                  <div class="min-w-0">
                    <div class="text-subtitle-1 font-weight-black">
                      User Info Config
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Attach user fields and control order + required flags
                    </div>
                  </div>

                  <div class="d-flex align-center ga-2 flex-wrap justify-end">
                    <v-btn
                      rounded="lg"
                      variant="outlined"
                      prepend-icon="lucide:plus"
                      >Attach field</v-btn
                    >
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:save"
                      >Save config</v-btn
                    >
                  </div>
                </div>

                <v-row>
                  <v-col cols="12" lg="7">
                    <v-card rounded="xl" class="sb-card">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Configured fields
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Order used in public form
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal" color="primary">
                          {{ userFieldConfigsSorted.length }} fields
                        </v-chip>
                      </div>

                      <v-divider />

                      <v-data-table
                        :headers="userFieldConfigHeaders"
                        :items="userFieldConfigsSorted"
                        item-key="id"
                        density="comfortable"
                      >
                        <template #item.sort_order="{ item }">
                          <v-chip size="small" variant="tonal">{{
                            item.sort_order
                          }}</v-chip>
                        </template>

                        <template #item.field="{ item }">
                          <div class="min-w-0">
                            <div class="font-weight-semibold text-truncate">
                              {{
                                getUserField(item.user_field_id)?.label || "—"
                              }}
                            </div>
                            <div
                              class="text-caption text-medium-emphasis text-truncate"
                            >
                              {{ getUserField(item.user_field_id)?.field_key }}
                            </div>
                          </div>
                        </template>

                        <template #item.is_required="{ item }">
                          <v-chip
                            size="small"
                            :color="item.is_required ? 'success' : 'warning'"
                            variant="tonal"
                          >
                            {{ item.is_required ? "Required" : "Optional" }}
                          </v-chip>
                        </template>

                        <template #item.actions="{ item }">
                          <div class="d-flex justify-end ga-1">
                            <v-btn
                              icon
                              variant="text"
                              :disabled="item.sort_order === 1"
                              aria-label="Move up"
                            >
                              <v-icon icon="lucide:chevron-up" />
                            </v-btn>
                            <v-btn
                              icon
                              variant="text"
                              :disabled="
                                item.sort_order ===
                                userFieldConfigsSorted.length
                              "
                              aria-label="Move down"
                            >
                              <v-icon icon="lucide:chevron-down" />
                            </v-btn>
                            <v-btn icon variant="text" aria-label="Edit config">
                              <v-icon icon="lucide:pencil" />
                            </v-btn>
                          </div>
                        </template>
                      </v-data-table>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="5">
                    <v-card rounded="xl" class="sb-card pa-4">
                      <div
                        class="d-flex align-center justify-space-between flex-wrap ga-2"
                      >
                        <div>
                          <div class="text-subtitle-1 font-weight-black">
                            Preview
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Public form mock (UI only)
                          </div>
                        </div>
                        <v-chip size="small" variant="tonal">{{
                          questionnaire.language.toUpperCase()
                        }}</v-chip>
                      </div>

                      <v-divider class="my-4" />

                      <div class="d-flex flex-column ga-3">
                        <div
                          v-for="cfg in userFieldConfigsSorted"
                          :key="cfg.id"
                        >
                          <template
                            v-if="
                              getUserField(cfg.user_field_id)?.field_type ===
                              'textarea'
                            "
                          >
                            <v-textarea
                              :label="previewLabel(cfg)"
                              :placeholder="previewPlaceholder(cfg)"
                              :hint="previewHelper(cfg)"
                              persistent-hint
                              variant="outlined"
                              rounded="lg"
                              density="comfortable"
                              auto-grow
                              rows="2"
                            />
                          </template>

                          <template
                            v-else-if="
                              getUserField(cfg.user_field_id)?.field_type ===
                                'select' &&
                              getUserField(cfg.user_field_id)?.field_key ===
                                'organization_id'
                            "
                          >
                            <v-autocomplete
                              :items="organizationsOptions"
                              item-title="title"
                              item-value="value"
                              :label="previewLabel(cfg)"
                              :hint="previewHelper(cfg)"
                              persistent-hint
                              variant="outlined"
                              rounded="lg"
                              density="comfortable"
                              prepend-inner-icon="lucide:building-2"
                            />
                          </template>

                          <template
                            v-else-if="
                              getUserField(cfg.user_field_id)?.field_type ===
                              'select'
                            "
                          >
                            <v-select
                              :items="[]"
                              :label="previewLabel(cfg)"
                              :hint="previewHelper(cfg)"
                              persistent-hint
                              variant="outlined"
                              rounded="lg"
                              density="comfortable"
                              prepend-inner-icon="lucide:list"
                            />
                          </template>

                          <template
                            v-else-if="
                              getUserField(cfg.user_field_id)?.field_type ===
                              'date'
                            "
                          >
                            <v-text-field
                              :label="previewLabel(cfg)"
                              :hint="previewHelper(cfg)"
                              persistent-hint
                              variant="outlined"
                              rounded="lg"
                              density="comfortable"
                              prepend-inner-icon="lucide:calendar"
                              placeholder="YYYY-MM-DD"
                            />
                          </template>

                          <template v-else>
                            <v-text-field
                              :label="previewLabel(cfg)"
                              :placeholder="previewPlaceholder(cfg)"
                              :hint="previewHelper(cfg)"
                              persistent-hint
                              variant="outlined"
                              rounded="lg"
                              density="comfortable"
                              :prepend-inner-icon="
                                fieldIcon(
                                  getUserField(cfg.user_field_id)?.field_type,
                                )
                              "
                            />
                          </template>
                        </div>

                        <v-card rounded="xl" variant="tonal" class="pa-4 mt-2">
                          <div class="text-body-2 font-weight-bold mb-2">
                            Note
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            This is a UI preview only. Validation and
                            persistence are handled later.
                          </div>
                        </v-card>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>
          </v-window>
        </v-card>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";

import type {
  Questionnaire,
  QuestionnaireDimension,
  QuestionnaireMeaning,
  QuestionnaireQuestion,
  QuestionnaireQuestionDimensionMap,
  QuestionnaireScoreBand,
  QuestionnaireOption,
  QuestionnaireUserField,
  QuestionnaireUserFieldConfig,
} from "~/utils/mockPublicData";

import {
  organizations,
  questionnaires,
  questionnaire_dimensions,
  questionnaire_meanings,
  questionnaire_question_dimension_maps,
  questionnaire_questions,
  questionnaire_score_bands,
  questionnaire_options,
  questionnaire_user_fields,
  questionnaire_user_field_configs,
} from "~/utils/mockPublicData";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

// -----------------------
// UI state (4 states)
// -----------------------
const ui = reactive({
  loading: true,
  error: "" as string | "",
});

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
  }, 220);
}

onMounted(() => reload());

// -----------------------
// Route & base data
// -----------------------
const route = useRoute();
const id = computed(() => (route.params.id ?? "").toString());

const questionnaire = computed<Questionnaire | undefined>(() =>
  questionnaires.find((q) => q.id === id.value),
);
const isMultiDimension = computed(
  () => questionnaire.value?.scoring_type === "multi_dimension",
);

// local editable copies (UI only)
const localQuestions = ref<QuestionnaireQuestion[]>(
  questionnaire_questions
    .filter((q) => q.questionnaire_id === id.value)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((x) => ({ ...x })),
);

const localOptions = ref<QuestionnaireOption[]>(
  questionnaire_options
    .filter((o) => localQuestions.value.some((q) => q.id === o.question_id))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((x) => ({ ...x })),
);

const dimensions = computed<QuestionnaireDimension[]>(() =>
  questionnaire_dimensions
    .filter((d) => d.questionnaire_id === id.value)
    .sort((a, b) => a.sort_order - b.sort_order),
);

const maps = computed<QuestionnaireQuestionDimensionMap[]>(() =>
  questionnaire_question_dimension_maps.filter(
    (m) => m.questionnaire_id === id.value,
  ),
);

const bands = computed<QuestionnaireScoreBand[]>(() =>
  questionnaire_score_bands
    .filter((b) => b.questionnaire_id === id.value)
    .sort((a, b) => a.sort_order - b.sort_order),
);

const meanings = computed<QuestionnaireMeaning[]>(() =>
  questionnaire_meanings
    .filter((m) => m.questionnaire_id === id.value)
    .sort((a, b) => a.priority - b.priority),
);

const userFields = computed<QuestionnaireUserField[]>(
  () => questionnaire_user_fields,
);

const userFieldConfigs = computed<QuestionnaireUserFieldConfig[]>(() =>
  questionnaire_user_field_configs.filter(
    (c) => c.questionnaire_id === id.value,
  ),
);

// -----------------------
// Options mode detection
// -----------------------
type OptionsMode = "fixed" | "per_question";

function normalizeSetForQuestion(questionId: string) {
  return localOptions.value
    .filter((o) => o.question_id === questionId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((o) => `${o.label}::${o.score_value}`);
}

const optionsMode = computed<OptionsMode>(() => {
  const qs = localQuestions.value
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  if (qs.length === 0) return "per_question";
  const base = normalizeSetForQuestion(qs[0].id).join("|");
  if (!base) return "per_question";
  for (const q of qs.slice(1)) {
    const current = normalizeSetForQuestion(q.id).join("|");
    if (current !== base) return "per_question";
  }
  return "fixed";
});

const fixedOptions = computed<QuestionnaireOption[]>(() => {
  const first = localQuestions.value
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0];
  if (!first) return [];
  return localOptions.value
    .filter((o) => o.question_id === first.id)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
});

const fixedOptionsSorted = computed(() => fixedOptions.value);

// fixed options dialog draft
const fixedOptionsDialog = ref(false);
const fixedOptionsDraft = ref<QuestionnaireOption[]>([]);
const fixedOptionHeaders = [
  { title: "Label", key: "label", sortable: false },
  { title: "Score", key: "score_value", sortable: false, width: 160 },
  { title: "Order", key: "sort_order", sortable: false, width: 160 },
];

function openFixedDraft() {
  fixedOptionsDraft.value = fixedOptions.value.map((x) => ({ ...x }));
}
function resetFixedDraft() {
  openFixedDraft();
}
function applyFixedDraft() {
  // apply to ALL questions when fixed mode (UI only)
  const draft = fixedOptionsDraft.value
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const qs = localQuestions.value.slice();

  // remove existing options for these questions
  const qIds = new Set(qs.map((q) => q.id));
  localOptions.value = localOptions.value.filter(
    (o) => !qIds.has(o.question_id),
  );

  // re-create options per question based on draft
  const newOptions: QuestionnaireOption[] = [];
  for (const q of qs) {
    for (const row of draft) {
      newOptions.push({
        id: `opt-${q.id}-${row.sort_order}`,
        question_id: q.id,
        label: row.label,
        score_value: row.score_value,
        sort_order: row.sort_order,
        created_at: row.created_at,
      } as any);
    }
  }
  localOptions.value = [...localOptions.value, ...newOptions];
  fixedOptionsDialog.value = false;
}

// keep draft in sync when opening
watchEffect(() => {
  if (fixedOptionsDialog.value) openFixedDraft();
});

// -----------------------
// Page header text
// -----------------------
const pageTitle = computed(() => questionnaire.value?.title || "Questionnaire");
const pageSubtitle = computed(() =>
  questionnaire.value
    ? `${questionnaire.value.code} · v${questionnaire.value.version} · ${questionnaire.value.scoring_type}`
    : "Questionnaire detail",
);

// -----------------------
// Tabs
// -----------------------
type TabKey =
  | "overview"
  | "questions"
  | "dimensions"
  | "bands"
  | "meanings"
  | "user_info";
const tab = ref<TabKey>("overview");

// -----------------------
// Questions: search + dimension filter + dialog
// -----------------------
const questionSearch = ref("");
const filters = reactive<{
  dimension_code: "visual" | "auditori" | "kinestetik" | "";
}>({ dimension_code: "" });

const dimensionSelectItems = computed(() =>
  dimensions.value.map((d) => ({
    title: `${d.title} (${d.dimension_code})`,
    value: d.dimension_code,
  })),
);

const dimensionFilterItems = computed(() => [
  { title: "Visual", value: "visual" as const },
  { title: "Auditori", value: "auditori" as const },
  { title: "Kinestetik", value: "kinestetik" as const },
]);

const questionHeaders = [
  { title: "#", key: "sort_order", sortable: false, width: 80 },
  { title: "Question", key: "question_text", sortable: false },
  { title: "Required", key: "is_required", sortable: false, width: 140 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];

const filteredQuestions = computed(() => {
  const q = questionSearch.value.trim().toLowerCase();
  return localQuestions.value
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((it) => {
      if (filters.dimension_code) {
        const dc = getQuestionDimensionCode(it.id);
        if (dc !== filters.dimension_code) return false;
      }
      if (!q) return true;
      return it.question_text.toLowerCase().includes(q);
    });
});

function getQuestionDimensionCode(questionId: string) {
  return (
    maps.value.find((m) => m.question_id === questionId)?.dimension_code || ""
  );
}

function getQuestionDimensionLabel(questionId: string) {
  const dc = getQuestionDimensionCode(questionId);
  if (!dc) return "No dimension mapping";
  const dim = dimensions.value.find((d) => d.dimension_code === dc);
  return dim ? `Dimension: ${dim.title}` : `Dimension: ${dc}`;
}

function resetQuestionFilters() {
  questionSearch.value = "";
  filters.dimension_code = "";
}

// dialog state
const questionDialog = ref(false);
const requiredItems = [
  { title: "Required", value: true },
  { title: "Optional", value: false },
];

const questionForm = reactive<{
  id: string;
  question_text: string;
  sort_order: number;
  is_required: boolean;
  dimension_code: "visual" | "auditori" | "kinestetik" | "";
}>({
  id: "",
  question_text: "",
  sort_order: 1,
  is_required: true,
  dimension_code: "",
});

// per-question options draft (used only when optionsMode === per_question)
const optionHeaders = [
  { title: "Label", key: "label", sortable: false },
  { title: "Score", key: "score_value", sortable: false, width: 160 },
  { title: "Order", key: "sort_order", sortable: false, width: 160 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 80,
  },
];

type DraftOpt = {
  id: string;
  label: string;
  score_value: number;
  sort_order: number;
};
const questionOptionsDraft = ref<DraftOpt[]>([]);

function loadDraftOptions(questionId: string) {
  const opts = localOptions.value
    .filter((o) => o.question_id === questionId)
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  questionOptionsDraft.value = opts.map((o) => ({
    id: o.id,
    label: o.label,
    score_value: o.score_value,
    sort_order: o.sort_order,
  }));
}

function defaultDraftOptions() {
  questionOptionsDraft.value = [
    {
      id: `tmp-${cryptoId()}`,
      label: "Option A",
      score_value: 2,
      sort_order: 1,
    },
    {
      id: `tmp-${cryptoId()}`,
      label: "Option B",
      score_value: 1,
      sort_order: 2,
    },
    {
      id: `tmp-${cryptoId()}`,
      label: "Option C",
      score_value: 0,
      sort_order: 3,
    },
  ];
}

function addOptionRow() {
  const maxOrder = Math.max(
    0,
    ...questionOptionsDraft.value.map((x) => x.sort_order),
  );
  questionOptionsDraft.value.push({
    id: `tmp-${cryptoId()}`,
    label: "",
    score_value: 0,
    sort_order: maxOrder + 1,
  });
}

function removeOptionRow(optId: string) {
  questionOptionsDraft.value = questionOptionsDraft.value.filter(
    (x) => x.id !== optId,
  );
}

function openQuestionDialog(questionId?: string) {
  if (!questionId) {
    questionForm.id = "";
    questionForm.question_text = "";
    questionForm.sort_order = localQuestions.value.length + 1;
    questionForm.is_required = true;
    questionForm.dimension_code = isMultiDimension.value ? "visual" : "";
    if (optionsMode.value === "per_question") defaultDraftOptions();
    questionDialog.value = true;
    return;
  }

  const q = localQuestions.value.find((x) => x.id === questionId);
  questionForm.id = q?.id || "";
  questionForm.question_text = q?.question_text || "";
  questionForm.sort_order = q?.sort_order || 1;
  questionForm.is_required = q?.is_required ?? true;
  questionForm.dimension_code =
    (getQuestionDimensionCode(questionId) as any) || "";

  if (optionsMode.value === "per_question") loadDraftOptions(questionId);
  questionDialog.value = true;
}

function saveQuestionUi() {
  // UI-only: apply to localQuestions + localOptions if per_question
  const isEdit = !!questionForm.id;
  const newId = isEdit
    ? questionForm.id
    : `q-${id.value}-${String(Date.now())}`;

  const row: QuestionnaireQuestion = {
    id: newId,
    questionnaire_id: id.value,
    question_type: "single_choice" as any,
    question_text: questionForm.question_text,
    sort_order: questionForm.sort_order,
    is_required: questionForm.is_required,
  } as any;

  if (!isEdit) {
    localQuestions.value.push(row);
  } else {
    const idx = localQuestions.value.findIndex((x) => x.id === newId);
    if (idx >= 0)
      localQuestions.value[idx] = { ...localQuestions.value[idx], ...row };
  }

  if (optionsMode.value === "per_question") {
    // remove existing options for this question
    localOptions.value = localOptions.value.filter(
      (o) => o.question_id !== newId,
    );

    // add draft options
    const opts: QuestionnaireOption[] = questionOptionsDraft.value
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((o) => ({
        id: `opt-${newId}-${o.sort_order}`,
        question_id: newId,
        label: o.label || `Option ${o.sort_order}`,
        score_value: o.score_value,
        sort_order: o.sort_order,
      })) as any;

    localOptions.value = [...localOptions.value, ...opts];
  }

  questionDialog.value = false;
}

// helpers
function cryptoId() {
  return Math.random().toString(16).slice(2);
}

// -----------------------
// Bands grouping
// -----------------------
const bandsByDimension = computed(() => {
  const groups = [
    {
      key: "visual",
      title: "Visual",
      subtitle: "Score 0–30",
      items: [] as QuestionnaireScoreBand[],
    },
    {
      key: "auditori",
      title: "Auditori",
      subtitle: "Score 0–30",
      items: [] as QuestionnaireScoreBand[],
    },
    {
      key: "kinestetik",
      title: "Kinestetik",
      subtitle: "Score 0–30",
      items: [] as QuestionnaireScoreBand[],
    },
  ];

  bands.value.forEach((b) => {
    const g = groups.find((x) => x.key === b.dimension_code);
    if (g) g.items.push(b);
  });

  groups.forEach((g) => g.items.sort((a, b) => a.sort_order - b.sort_order));
  return groups;
});

// -----------------------
// Meanings: search + dialog
// -----------------------
const meaningSearch = ref("");
const meaningDialog = ref(false);
const activeMeaningId = ref<string>("");

const meaningHeaders = [
  { title: "Rule", key: "rule_type", sortable: false, width: 140 },
  { title: "Bands", key: "combo", sortable: false },
  { title: "Result label", key: "result_label", sortable: false },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];

const filteredMeanings = computed(() => {
  const q = meaningSearch.value.trim().toLowerCase();
  return meanings.value.filter((m) =>
    !q ? true : `${m.result_label} ${m.rule_type}`.toLowerCase().includes(q),
  );
});

const activeMeaning = computed(() =>
  meanings.value.find((m) => m.id === activeMeaningId.value),
);

function openMeaningDialog(meaningId: string) {
  activeMeaningId.value = meaningId;
  meaningDialog.value = true;
}

// -----------------------
// User info config
// -----------------------
const userFieldConfigsSorted = computed(() =>
  userFieldConfigs.value.slice().sort((a, b) => a.sort_order - b.sort_order),
);

const userFieldConfigHeaders = [
  { title: "Order", key: "sort_order", sortable: false, width: 90 },
  { title: "Field", key: "field", sortable: false },
  { title: "Required", key: "is_required", sortable: false, width: 140 },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 180,
  },
];

function getUserField(fieldId: string) {
  return userFields.value.find((f) => f.id === fieldId);
}

const organizationsOptions = computed(() =>
  organizations.map((o) => ({ title: `${o.name} (${o.code})`, value: o.id })),
);

function previewLabel(cfg: QuestionnaireUserFieldConfig) {
  const f = getUserField(cfg.user_field_id);
  return cfg.overrides_json?.label || f?.label || "Field";
}

function previewPlaceholder(cfg: QuestionnaireUserFieldConfig) {
  const f = getUserField(cfg.user_field_id);
  return cfg.overrides_json?.placeholder || f?.placeholder || "";
}

function previewHelper(cfg: QuestionnaireUserFieldConfig) {
  const f = getUserField(cfg.user_field_id);
  return cfg.overrides_json?.helper_text || f?.helper_text || "";
}

function fieldIcon(type?: QuestionnaireUserField["field_type"]) {
  if (type === "email") return "lucide:mail";
  if (type === "phone") return "lucide:phone";
  if (type === "number") return "lucide:hash";
  if (type === "date") return "lucide:calendar";
  return "lucide:text-cursor";
}

// -----------------------
// Dimensions table headers
// -----------------------
const dimensionHeaders = [
  { title: "#", key: "sort_order", sortable: false, width: 80 },
  { title: "Code", key: "dimension_code", sortable: false, width: 150 },
  { title: "Title", key: "title", sortable: false },
  {
    title: "",
    key: "actions",
    sortable: false,
    align: "end" as const,
    width: 120,
  },
];
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-search {
  min-width: 320px;
}
</style>
