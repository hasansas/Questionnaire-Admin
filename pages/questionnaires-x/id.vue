<template>
  <div class="sb-page">
    <AdminPageHeader
      :title="questionnaire ? questionnaire.title : 'Questionnaire'"
      subtitle="Configure overview, questions, scoring, bands, meanings, and user info."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="text"
            to="/questionnaires"
            prepend-icon="lucide:arrow-left"
          >
            Back
          </v-btn>
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:copy"
            :disabled="!questionnaire"
          >
            Duplicate (UI)
          </v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            prepend-icon="lucide:save"
            :disabled="!questionnaire"
          >
            Save (UI)
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <template v-if="ui.loading">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-skeleton-loader type="heading, text, text, actions" />
      </v-card>
      <v-card rounded="xl" class="sb-card mt-4">
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
        <div class="d-flex ga-2 flex-wrap">
          <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
          <v-btn rounded="lg" variant="outlined" to="/questionnaires"
            >Back</v-btn
          >
        </div>
      </v-card>
    </template>

    <template v-else-if="!questionnaire">
      <v-card rounded="xl" class="sb-card pa-10">
        <div class="d-flex flex-column align-center text-center">
          <v-avatar size="56" color="warning" variant="tonal" class="mb-3">
            <v-icon icon="lucide:circle-off" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">
            Questionnaire not found
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
            The ID may be invalid, or not present in mock data.
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
      <v-card rounded="xl" class="sb-card">
        <div class="pa-4 pb-0">
          <div class="d-flex align-center ga-2 flex-wrap mb-3">
            <v-chip size="small" variant="tonal" color="primary">{{
              questionnaire.code
            }}</v-chip>
            <v-chip
              size="small"
              variant="tonal"
              :color="
                questionnaire.status === 'published'
                  ? 'success'
                  : questionnaire.status === 'draft'
                    ? 'warning'
                    : 'secondary'
              "
            >
              {{ questionnaire.status }}
            </v-chip>
            <v-chip size="small" variant="tonal"
              >v{{ questionnaire.version }}</v-chip
            >
            <v-chip size="small" variant="tonal">{{
              questionnaire.scoring_type
            }}</v-chip>
            <v-chip
              size="small"
              variant="tonal"
              :color="questionnaire.show_result_to_user ? 'success' : 'warning'"
            >
              Show result:
              {{ questionnaire.show_result_to_user ? "Yes" : "No" }}
            </v-chip>
          </div>

          <v-tabs v-model="tab" color="primary">
            <v-tab value="overview" prepend-icon="lucide:info">Overview</v-tab>
            <v-tab value="questions" prepend-icon="lucide:list-checks"
              >Questions</v-tab
            >
            <v-tab
              v-if="questionnaire.scoring_type === 'multi_dimension'"
              value="dimensions"
              prepend-icon="lucide:layers"
            >
              Dimensions
            </v-tab>
            <v-tab value="bands" prepend-icon="lucide:badge-percent"
              >Bands</v-tab
            >
            <v-tab value="meanings" prepend-icon="lucide:sparkles"
              >Meanings</v-tab
            >
            <v-tab value="userInfo" prepend-icon="lucide:form-input"
              >User Info Config</v-tab
            >
          </v-tabs>
        </div>

        <v-divider class="mt-2" />

        <v-card-text class="pa-0">
          <v-window v-model="tab">
            <!-- Overview -->
            <v-window-item value="overview">
              <div class="pa-6">
                <v-row class="ga-4" no-gutters>
                  <v-col cols="12" lg="8">
                    <v-card
                      rounded="xl"
                      variant="flat"
                      class="sb-inner-card pa-4"
                    >
                      <div
                        class="d-flex align-center justify-space-between ga-2 flex-wrap"
                      >
                        <div class="min-w-0">
                          <div class="text-subtitle-1 font-weight-black">
                            Questionnaire info
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Basic metadata and publish settings.
                          </div>
                        </div>
                        <v-btn
                          rounded="lg"
                          variant="outlined"
                          prepend-icon="lucide:pencil"
                          @click="openEditOverview"
                        >
                          Edit
                        </v-btn>
                      </div>

                      <v-divider class="my-4" />

                      <v-row class="ga-4" no-gutters>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Code
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.code }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="8">
                          <div class="text-caption text-medium-emphasis">
                            Title
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.title }}
                          </div>
                        </v-col>
                        <v-col cols="12">
                          <div class="text-caption text-medium-emphasis">
                            Description
                          </div>
                          <div class="text-body-2">
                            {{ questionnaire.description || "—" }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Language
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.language }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Scoring type
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.scoring_type }}
                          </div>
                        </v-col>
                        <v-col cols="12" md="4">
                          <div class="text-caption text-medium-emphasis">
                            Version
                          </div>
                          <div class="text-body-2 font-weight-bold">
                            {{ questionnaire.version }}
                          </div>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>

                  <v-col cols="12" lg="4">
                    <v-card
                      rounded="xl"
                      variant="flat"
                      class="sb-inner-card pa-4"
                    >
                      <div class="text-subtitle-1 font-weight-black">
                        Quick checks
                      </div>
                      <div class="text-caption text-medium-emphasis mb-4">
                        A Phase 1 completeness snapshot.
                      </div>

                      <div class="d-flex flex-column ga-2">
                        <div class="d-flex align-center justify-space-between">
                          <div class="text-body-2">Questions</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qQuestions.length }}</v-chip
                          >
                        </div>
                        <div class="d-flex align-center justify-space-between">
                          <div class="text-body-2">Options</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qOptions.length }}</v-chip
                          >
                        </div>
                        <div
                          class="d-flex align-center justify-space-between"
                          v-if="
                            questionnaire.scoring_type === 'multi_dimension'
                          "
                        >
                          <div class="text-body-2">Dimensions</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qDimensions.length }}</v-chip
                          >
                        </div>
                        <div class="d-flex align-center justify-space-between">
                          <div class="text-body-2">Score bands</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qBands.length }}</v-chip
                          >
                        </div>
                        <div class="d-flex align-center justify-space-between">
                          <div class="text-body-2">Meanings</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qMeanings.length }}</v-chip
                          >
                        </div>
                        <div class="d-flex align-center justify-space-between">
                          <div class="text-body-2">User fields attached</div>
                          <v-chip
                            size="small"
                            variant="tonal"
                            color="primary"
                            >{{ qUserFieldConfigs.length }}</v-chip
                          >
                        </div>
                      </div>

                      <v-divider class="my-4" />

                      <v-alert variant="tonal" type="info" rounded="lg">
                        UI only — this page uses mock data and local edits.
                      </v-alert>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
            </v-window-item>

            <!-- Questions -->
            <v-window-item value="questions">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-black">
                        Questions
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Single choice questions with options + scores.
                      </div>
                    </div>
                    <div class="d-flex align-center ga-2 flex-wrap">
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
                        color="primary"
                        prepend-icon="lucide:plus"
                        @click="openCreateQuestion"
                      >
                        Add question
                      </v-btn>
                    </div>
                  </div>
                  <v-divider />

                  <template v-if="filteredQuestions.length === 0">
                    <div class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:list-checks" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No questions
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Add questions to start collecting answers.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openCreateQuestion"
                        >
                          Add question
                        </v-btn>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="questionHeaders"
                      :items="filteredQuestions"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.text="{ item }">
                        <div class="min-w-0">
                          <div class="font-weight-semibold text-truncate">
                            {{ item.text }}
                          </div>
                          <div
                            class="text-caption text-medium-emphasis text-truncate"
                          >
                            {{ item.code }} · sort {{ item.sort_order }}
                          </div>
                        </div>
                      </template>

                      <template #item.is_required="{ item }">
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="item.is_required ? 'success' : 'warning'"
                        >
                          {{ item.is_required ? "Required" : "Optional" }}
                        </v-chip>
                      </template>

                      <template #item.options="{ item }">
                        <v-chip size="small" variant="tonal" color="primary">
                          {{ optionsByQuestion(item.id).length }} options
                        </v-chip>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditQuestion(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                          <v-btn icon variant="text" aria-label="More">
                            <v-icon icon="lucide:more-vertical" />
                            <v-menu activator="parent" location="bottom end">
                              <v-list density="compact">
                                <v-list-item
                                  title="Edit (UI)"
                                  @click="openEditQuestion(item)"
                                />
                                <v-list-item
                                  title="Disable (UI)"
                                  @click="
                                    openConfirm(
                                      'Disable question',
                                      `UI only — would disable ${item.code}.`,
                                    )
                                  "
                                />
                              </v-list>
                            </v-menu>
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>

            <!-- Dimensions -->
            <v-window-item
              value="dimensions"
              v-if="questionnaire.scoring_type === 'multi_dimension'"
            >
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-black">
                        Dimensions
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Keys used for multi-dimension scoring.
                      </div>
                    </div>
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openCreateDimension"
                    >
                      Add dimension
                    </v-btn>
                  </div>
                  <v-divider />

                  <template v-if="qDimensions.length === 0">
                    <div class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:layers" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No dimensions
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Add dimensions to enable multi_dimension scoring.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openCreateDimension"
                        >
                          Add dimension
                        </v-btn>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="dimensionHeaders"
                      :items="qDimensions"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.name="{ item }">
                        <div class="min-w-0">
                          <div class="font-weight-semibold text-truncate">
                            {{ item.name }}
                          </div>
                          <div
                            class="text-caption text-medium-emphasis text-truncate"
                          >
                            key: {{ item.key }} · sort {{ item.sort_order }}
                          </div>
                        </div>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditDimension(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>

            <!-- Bands -->
            <v-window-item value="bands">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-black">
                        Score bands
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Define ranges for total or per-dimension scoring.
                      </div>
                    </div>
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openCreateBand"
                    >
                      Add band
                    </v-btn>
                  </div>
                  <v-divider />

                  <template v-if="qBands.length === 0">
                    <div class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:badge-percent" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No bands
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Add bands to map scores to labels and meaning rules.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openCreateBand"
                        >
                          Add band
                        </v-btn>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="bandHeaders"
                      :items="qBands"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.scope="{ item }">
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="item.scope === 'total' ? 'primary' : 'info'"
                        >
                          {{ item.scope }}
                        </v-chip>
                      </template>

                      <template #item.dimension_id="{ item }">
                        <span class="text-body-2">
                          {{
                            item.scope === "dimension"
                              ? dimensionName(item.dimension_id) || "—"
                              : "—"
                          }}
                        </span>
                      </template>

                      <template #item.range="{ item }">
                        <v-chip size="small" variant="tonal">
                          {{ item.min_score }}–{{ item.max_score }}
                        </v-chip>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditBand(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>

            <!-- Meanings -->
            <v-window-item value="meanings">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-black">
                        Meaning rules
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Build rules for dominant_dimension, band_combo, or
                        fallback.
                      </div>
                    </div>
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openCreateMeaning"
                    >
                      Add meaning
                    </v-btn>
                  </div>
                  <v-divider />

                  <template v-if="qMeanings.length === 0">
                    <div class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:sparkles" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No meanings
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Add meaning rules to produce a result_label and
                          recommendations.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openCreateMeaning"
                        >
                          Add meaning
                        </v-btn>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="meaningHeaders"
                      :items="qMeanings"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.rule_type="{ item }">
                        <v-chip size="small" variant="tonal" color="primary">{{
                          item.rule_type
                        }}</v-chip>
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

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditMeaning(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>

            <!-- User info config -->
            <v-window-item value="userInfo">
              <div class="pa-6">
                <v-card rounded="xl" variant="flat" class="sb-inner-card">
                  <div
                    class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
                  >
                    <div class="min-w-0">
                      <div class="text-subtitle-1 font-weight-black">
                        User Info Config
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Attach user fields and define order + overrides.
                      </div>
                    </div>
                    <v-btn
                      rounded="lg"
                      color="primary"
                      prepend-icon="lucide:plus"
                      @click="openAttachUserField"
                    >
                      Attach field
                    </v-btn>
                  </div>
                  <v-divider />

                  <template v-if="qUserFieldConfigs.length === 0">
                    <div class="pa-10">
                      <div class="d-flex flex-column align-center text-center">
                        <v-avatar
                          size="56"
                          color="primary"
                          variant="tonal"
                          class="mb-3"
                        >
                          <v-icon icon="lucide:form-input" />
                        </v-avatar>
                        <div class="text-subtitle-1 font-weight-bold">
                          No user fields attached
                        </div>
                        <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
                          Attach fields to collect respondent info alongside
                          attempts.
                        </div>
                        <v-btn
                          rounded="lg"
                          color="primary"
                          prepend-icon="lucide:plus"
                          @click="openAttachUserField"
                        >
                          Attach field
                        </v-btn>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <v-data-table
                      :headers="userFieldCfgHeaders"
                      :items="qUserFieldConfigs"
                      item-key="id"
                      density="comfortable"
                    >
                      <template #item.user_field_id="{ item }">
                        <div class="min-w-0">
                          <div class="font-weight-semibold text-truncate">
                            {{ userFieldLabel(item.user_field_id) || "—" }}
                          </div>
                          <div
                            class="text-caption text-medium-emphasis text-truncate"
                          >
                            key: {{ userFieldKey(item.user_field_id) || "—" }}
                          </div>
                        </div>
                      </template>

                      <template #item.is_required="{ item }">
                        <v-chip
                          size="small"
                          variant="tonal"
                          :color="item.is_required ? 'success' : 'warning'"
                        >
                          {{ item.is_required ? "Required" : "Optional" }}
                        </v-chip>
                      </template>

                      <template #item.overrides_json="{ item }">
                        <v-chip size="small" variant="tonal">
                          {{
                            hasOverrides(item.overrides_json)
                              ? "Overrides"
                              : "—"
                          }}
                        </v-chip>
                      </template>

                      <template #item.actions="{ item }">
                        <div class="d-flex justify-end">
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Edit"
                            @click="openEditUserFieldCfg(item)"
                          >
                            <v-icon icon="lucide:pencil" />
                          </v-btn>
                          <v-btn
                            icon
                            variant="text"
                            aria-label="Detach"
                            @click="
                              openConfirm(
                                'Detach field',
                                'UI only — would detach field from questionnaire.',
                              )
                            "
                          >
                            <v-icon icon="lucide:unlink" />
                          </v-btn>
                        </div>
                      </template>
                    </v-data-table>
                  </template>
                </v-card>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>

      <!-- Overview edit -->
      <v-dialog v-model="dialogs.overview" max-width="840">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">Edit overview</div>
            <v-btn icon variant="text" @click="dialogs.overview = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="overviewForm.code"
                  label="Code"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="overviewForm.title"
                  label="Title"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="overviewForm.description"
                  label="Description"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="overviewForm.language"
                  :items="['en', 'id']"
                  label="Language"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="overviewForm.status"
                  :items="['draft', 'published', 'archived']"
                  label="Status"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="overviewForm.version"
                  type="number"
                  label="Version"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="overviewForm.scoring_type"
                  :items="['multi_dimension', 'total_score']"
                  label="Scoring type"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="overviewForm.show_result_to_user"
                  color="primary"
                  inset
                  label="Show result to user"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — changes are local to this page.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.overview = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              @click="dialogs.overview = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Question editor -->
      <v-dialog v-model="dialogs.question" max-width="980">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                questionFormMode === "create" ? "Add question" : "Edit question"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.question = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="questionForm.code"
                  label="Code"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="questionForm.text"
                  label="Text"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>

              <v-col cols="12" md="4">
                <v-select
                  v-model="questionForm.question_type"
                  :items="['single_choice']"
                  label="Question type"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="questionForm.is_required"
                  color="primary"
                  inset
                  label="Required"
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

              <v-col cols="12">
                <v-textarea
                  v-model="questionForm.meta"
                  label="Meta (JSON)"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                  hint="Store extra config as JSON string (UI only)."
                  persistent-hint
                />
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <div
              class="d-flex align-center justify-space-between flex-wrap ga-2 mb-3"
            >
              <div class="min-w-0">
                <div class="text-subtitle-2 font-weight-black">Options</div>
                <div class="text-caption text-medium-emphasis">
                  Label + score_value + sort_order.
                </div>
              </div>
              <v-btn
                rounded="lg"
                variant="outlined"
                prepend-icon="lucide:plus"
                @click="addOptionRow"
              >
                Add option
              </v-btn>
            </div>

            <v-row
              class="ga-3"
              no-gutters
              v-for="(opt, idx) in questionForm.options"
              :key="idx"
            >
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="opt.label"
                  label="Label"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model.number="opt.score_value"
                  type="number"
                  label="Score value"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="10" md="2">
                <v-text-field
                  v-model.number="opt.sort_order"
                  type="number"
                  label="Sort"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="2" md="1" class="d-flex align-center justify-end">
                <v-btn
                  icon
                  variant="text"
                  aria-label="Remove option"
                  @click="removeOptionRow(idx)"
                >
                  <v-icon icon="lucide:trash-2" />
                </v-btn>
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving does not persist.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.question = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              @click="dialogs.question = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Dimension editor -->
      <v-dialog v-model="dialogs.dimension" max-width="760">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                dimensionFormMode === "create"
                  ? "Add dimension"
                  : "Edit dimension"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.dimension = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="dimensionForm.key"
                  label="Key"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="dimensionForm.name"
                  label="Name"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model.number="dimensionForm.sort_order"
                  type="number"
                  label="Sort"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving does not persist.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn
              rounded="lg"
              variant="text"
              @click="dialogs.dimension = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              @click="dialogs.dimension = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Band editor -->
      <v-dialog v-model="dialogs.band" max-width="860">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                bandFormMode === "create" ? "Add score band" : "Edit score band"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.band = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-select
                  v-model="bandForm.scope"
                  :items="['total', 'dimension']"
                  label="Scope"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="8" v-if="bandForm.scope === 'dimension'">
                <v-select
                  v-model="bandForm.dimension_id"
                  :items="dimensionSelectItems"
                  item-title="title"
                  item-value="value"
                  label="Dimension"
                  variant="outlined"
                  rounded="lg"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="bandForm.label"
                  label="Label"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model.number="bandForm.min_score"
                  type="number"
                  label="Min score"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model.number="bandForm.max_score"
                  type="number"
                  label="Max score"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model.number="bandForm.sort_order"
                  type="number"
                  label="Sort"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving does not persist.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.band = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.band = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Meaning editor -->
      <v-dialog v-model="dialogs.meaning" max-width="980">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                meaningFormMode === "create"
                  ? "Add meaning rule"
                  : "Edit meaning rule"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.meaning = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="4">
                <v-select
                  v-model="meaningForm.rule_type"
                  :items="['dominant_dimension', 'band_combo', 'fallback']"
                  label="Rule type"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="meaningForm.priority"
                  type="number"
                  label="Priority"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="meaningForm.is_active"
                  color="primary"
                  inset
                  label="Active"
                />
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="meaningForm.rule_json"
                  label="Rule JSON"
                  variant="outlined"
                  rounded="lg"
                  rows="4"
                  hint="Store rule_json as a JSON string (UI only)."
                  persistent-hint
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="meaningForm.result_label"
                  label="Result label"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="meaningForm.description"
                  label="Description"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="meaningForm.recommendations"
                  label="Recommendations"
                  variant="outlined"
                  rounded="lg"
                  rows="3"
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving does not persist.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn rounded="lg" variant="text" @click="dialogs.meaning = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn rounded="lg" color="primary" @click="dialogs.meaning = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Attach/edit user field config -->
      <v-dialog v-model="dialogs.userFieldCfg" max-width="920">
        <v-card rounded="xl">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="text-subtitle-1 font-weight-bold">
              {{
                userFieldCfgFormMode === "create"
                  ? "Attach user field"
                  : "Edit user field config"
              }}
            </div>
            <v-btn icon variant="text" @click="dialogs.userFieldCfg = false">
              <v-icon icon="lucide:x" />
            </v-btn>
          </v-card-title>
          <v-divider />
          <v-card-text class="pa-6">
            <v-row class="ga-4" no-gutters>
              <v-col cols="12" md="8">
                <v-select
                  v-model="userFieldCfgForm.user_field_id"
                  :items="userFieldSelectItems"
                  item-title="title"
                  item-value="value"
                  label="User field"
                  variant="outlined"
                  rounded="lg"
                  density="comfortable"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model.number="userFieldCfgForm.sort_order"
                  type="number"
                  label="Sort order"
                  variant="outlined"
                  rounded="lg"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-switch
                  v-model="userFieldCfgForm.is_required"
                  color="primary"
                  inset
                  label="Required"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="userFieldCfgForm.overrides_json"
                  label="Overrides JSON"
                  variant="outlined"
                  rounded="lg"
                  rows="4"
                  hint="Store overrides_json as JSON string (UI only)."
                  persistent-hint
                />
              </v-col>
            </v-row>

            <v-alert class="mt-4" variant="tonal" type="info" rounded="lg">
              UI only — saving does not persist.
            </v-alert>
          </v-card-text>
          <v-divider />
          <v-card-actions class="pa-4">
            <v-btn
              rounded="lg"
              variant="text"
              @click="dialogs.userFieldCfg = false"
              >Cancel</v-btn
            >
            <v-spacer />
            <v-btn
              rounded="lg"
              color="primary"
              @click="dialogs.userFieldCfg = false"
              >Save (UI)</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Confirm dialog -->
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

type QuestionnaireStatus = "draft" | "published" | "archived";
type ScoringType = "multi_dimension" | "total_score";

interface Questionnaire {
  id: string;
  code: string;
  title: string;
  description: string;
  language: string;
  status: QuestionnaireStatus;
  version: number;
  scoring_type: ScoringType;
  show_result_to_user: boolean;
  created_at: string;
  updated_at: string;
}

interface QuestionnaireDimension {
  id: string;
  questionnaire_id: string;
  key: string;
  name: string;
  sort_order: number;
  created_at: string;
}

type QuestionType = "single_choice";

interface QuestionnaireQuestion {
  id: string;
  questionnaire_id: string;
  code: string;
  text: string;
  question_type: QuestionType;
  is_required: boolean;
  sort_order: number;
  meta: string; // UI: JSON string
  created_at: string;
  updated_at: string;
}

interface QuestionnaireOption {
  id: string;
  question_id: string;
  label: string;
  score_value: number;
  sort_order: number;
  created_at: string;
}

type BandScope = "dimension" | "total";

interface QuestionnaireScoreBand {
  id: string;
  questionnaire_id: string;
  scope: BandScope;
  dimension_id?: string;
  label: string;
  min_score: number;
  max_score: number;
  sort_order: number;
  created_at: string;
}

type MeaningRuleType = "dominant_dimension" | "band_combo" | "fallback";

interface QuestionnaireMeaning {
  id: string;
  questionnaire_id: string;
  rule_type: MeaningRuleType;
  rule_json: string; // UI: JSON string
  result_label: string;
  description: string;
  recommendations: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

type UserFieldType = "text" | "email" | "select" | "number" | "date";

interface QuestionnaireUserField {
  id: string;
  key: string;
  label: string;
  field_type: UserFieldType;
  validation_json: string; // UI: JSON string
  options_json: string; // UI: JSON string
  is_active: boolean;
  created_at: string;
}

interface QuestionnaireUserFieldConfig {
  id: string;
  questionnaire_id: string;
  user_field_id: string;
  is_required: boolean;
  sort_order: number;
  overrides_json: string; // UI: JSON string
}

const route = useRoute();

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

const tab = ref<string>("overview");

const questionnaires = ref<Questionnaire[]>([
  {
    id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    code: "Q-HEALTH-01",
    title: "Health Readiness Check",
    description: "A quick screening for readiness and support needs.",
    language: "en",
    status: "published",
    version: 3,
    scoring_type: "multi_dimension",
    show_result_to_user: true,
    created_at: "2025-12-10T08:00:00Z",
    updated_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    code: "Q-STRESS-01",
    title: "Stress Snapshot",
    description: "Self-reported stress signals and patterns.",
    language: "en",
    status: "published",
    version: 1,
    scoring_type: "total_score",
    show_result_to_user: true,
    created_at: "2026-01-02T08:00:00Z",
    updated_at: "2026-01-02T08:00:00Z",
  },
  {
    id: "f4a7a73e-7e8f-4bdb-8d95-2cbdfb5f7d8a",
    code: "Q-ONBOARD-01",
    title: "Onboarding Baseline",
    description: "Collect basic context + readiness baseline.",
    language: "en",
    status: "draft",
    version: 0,
    scoring_type: "total_score",
    show_result_to_user: false,
    created_at: "2026-01-14T08:00:00Z",
    updated_at: "2026-01-14T08:00:00Z",
  },
]);

const dimensions = ref<QuestionnaireDimension[]>([
  {
    id: "dim_001",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    key: "energy",
    name: "Energy",
    sort_order: 1,
    created_at: "2025-12-10T08:10:00Z",
  },
  {
    id: "dim_002",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    key: "sleep",
    name: "Sleep",
    sort_order: 2,
    created_at: "2025-12-10T08:10:00Z",
  },
]);

const questions = ref<QuestionnaireQuestion[]>([
  {
    id: "qq_001",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    code: "Q1",
    text: "How often do you feel energetic during the day?",
    question_type: "single_choice",
    is_required: true,
    sort_order: 1,
    meta: '{"dimension_key":"energy"}',
    created_at: "2025-12-10T09:00:00Z",
    updated_at: "2025-12-10T09:00:00Z",
  },
  {
    id: "qq_002",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    code: "Q2",
    text: "How restful is your sleep most nights?",
    question_type: "single_choice",
    is_required: true,
    sort_order: 2,
    meta: '{"dimension_key":"sleep"}',
    created_at: "2025-12-10T09:10:00Z",
    updated_at: "2025-12-10T09:10:00Z",
  },
  {
    id: "qq_010",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    code: "Q1",
    text: "How stressed do you feel today?",
    question_type: "single_choice",
    is_required: true,
    sort_order: 1,
    meta: "{}",
    created_at: "2026-01-02T10:00:00Z",
    updated_at: "2026-01-02T10:00:00Z",
  },
]);

const options = ref<QuestionnaireOption[]>([
  {
    id: "opt_001",
    question_id: "qq_001",
    label: "Rarely",
    score_value: 1,
    sort_order: 1,
    created_at: "2025-12-10T09:00:00Z",
  },
  {
    id: "opt_002",
    question_id: "qq_001",
    label: "Sometimes",
    score_value: 2,
    sort_order: 2,
    created_at: "2025-12-10T09:00:00Z",
  },
  {
    id: "opt_003",
    question_id: "qq_001",
    label: "Often",
    score_value: 3,
    sort_order: 3,
    created_at: "2025-12-10T09:00:00Z",
  },

  {
    id: "opt_004",
    question_id: "qq_002",
    label: "Poor",
    score_value: 1,
    sort_order: 1,
    created_at: "2025-12-10T09:10:00Z",
  },
  {
    id: "opt_005",
    question_id: "qq_002",
    label: "Okay",
    score_value: 2,
    sort_order: 2,
    created_at: "2025-12-10T09:10:00Z",
  },
  {
    id: "opt_006",
    question_id: "qq_002",
    label: "Great",
    score_value: 3,
    sort_order: 3,
    created_at: "2025-12-10T09:10:00Z",
  },

  {
    id: "opt_020",
    question_id: "qq_010",
    label: "Low",
    score_value: 1,
    sort_order: 1,
    created_at: "2026-01-02T10:00:00Z",
  },
  {
    id: "opt_021",
    question_id: "qq_010",
    label: "Medium",
    score_value: 2,
    sort_order: 2,
    created_at: "2026-01-02T10:00:00Z",
  },
  {
    id: "opt_022",
    question_id: "qq_010",
    label: "High",
    score_value: 3,
    sort_order: 3,
    created_at: "2026-01-02T10:00:00Z",
  },
]);

const bands = ref<QuestionnaireScoreBand[]>([
  {
    id: "band_001",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    scope: "total",
    label: "Calm",
    min_score: 1,
    max_score: 1,
    sort_order: 1,
    created_at: "2026-01-02T12:00:00Z",
  },
  {
    id: "band_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    scope: "total",
    label: "Alert",
    min_score: 2,
    max_score: 2,
    sort_order: 2,
    created_at: "2026-01-02T12:00:00Z",
  },
  {
    id: "band_003",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    scope: "total",
    label: "High Alert",
    min_score: 3,
    max_score: 3,
    sort_order: 3,
    created_at: "2026-01-02T12:00:00Z",
  },

  {
    id: "band_010",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    scope: "dimension",
    dimension_id: "dim_001",
    label: "Low Energy",
    min_score: 1,
    max_score: 1,
    sort_order: 1,
    created_at: "2025-12-11T08:00:00Z",
  },
  {
    id: "band_011",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    scope: "dimension",
    dimension_id: "dim_001",
    label: "Balanced Energy",
    min_score: 2,
    max_score: 2,
    sort_order: 2,
    created_at: "2025-12-11T08:00:00Z",
  },
  {
    id: "band_012",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    scope: "dimension",
    dimension_id: "dim_001",
    label: "High Energy",
    min_score: 3,
    max_score: 3,
    sort_order: 3,
    created_at: "2025-12-11T08:00:00Z",
  },
]);

const meanings = ref<QuestionnaireMeaning[]>([
  {
    id: "mean_001",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    rule_type: "band_combo",
    rule_json: '{"scope":"total","band_label":"High Alert"}',
    result_label: "High Alert",
    description: "You may be experiencing elevated stress.",
    recommendations: "Reduce load, improve sleep, and seek support.",
    priority: 10,
    is_active: true,
    created_at: "2026-01-02T13:00:00Z",
  },
  {
    id: "mean_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    rule_type: "fallback",
    rule_json: "{}",
    result_label: "Balanced",
    description: "Your stress signals appear stable.",
    recommendations: "Keep routines consistent and monitor weekly.",
    priority: 1,
    is_active: true,
    created_at: "2026-01-02T13:10:00Z",
  },
]);

const userFields = ref<QuestionnaireUserField[]>([
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
    key: "age",
    label: "Age",
    field_type: "number",
    validation_json: '{"min":0,"max":120}',
    options_json: "{}",
    is_active: true,
    created_at: "2025-12-01T08:00:00Z",
  },
]);

const userFieldConfigs = ref<QuestionnaireUserFieldConfig[]>([
  {
    id: "ufc_001",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    user_field_id: "uf_001",
    is_required: true,
    sort_order: 1,
    overrides_json: "{}",
  },
  {
    id: "ufc_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    user_field_id: "uf_002",
    is_required: true,
    sort_order: 2,
    overrides_json: "{}",
  },
]);

const qId = computed(() => String(route.params.id || ""));
const questionnaire = computed(() =>
  questionnaires.value.find((q) => q.id === qId.value),
);

const qDimensions = computed(() =>
  dimensions.value.filter((d) => d.questionnaire_id === qId.value),
);
const qQuestions = computed(() =>
  questions.value.filter((q) => q.questionnaire_id === qId.value),
);
const qOptions = computed(() => {
  const qids = new Set(qQuestions.value.map((q) => q.id));
  return options.value.filter((o) => qids.has(o.question_id));
});
const qBands = computed(() =>
  bands.value.filter((b) => b.questionnaire_id === qId.value),
);
const qMeanings = computed(() =>
  meanings.value.filter((m) => m.questionnaire_id === qId.value),
);
const qUserFieldConfigs = computed(() =>
  userFieldConfigs.value.filter((c) => c.questionnaire_id === qId.value),
);

function optionsByQuestion(questionId: string) {
  return options.value
    .filter((o) => o.question_id === questionId)
    .sort((a, b) => a.sort_order - b.sort_order);
}

function dimensionName(id?: string) {
  if (!id) return "";
  return qDimensions.value.find((d) => d.id === id)?.name || "";
}

const dimensionSelectItems = computed(() =>
  qDimensions.value.map((d) => ({
    title: `${d.name} (${d.key})`,
    value: d.id,
  })),
);

const userFieldSelectItems = computed(() =>
  userFields.value
    .filter((f) => f.is_active)
    .map((f) => ({ title: `${f.label} (${f.key})`, value: f.id })),
);

function userFieldLabel(id: string) {
  return userFields.value.find((f) => f.id === id)?.label || "";
}
function userFieldKey(id: string) {
  return userFields.value.find((f) => f.id === id)?.key || "";
}
function hasOverrides(v: string) {
  const s = (v || "").trim();
  return s && s !== "{}";
}

// -----------------------
// Tables
// -----------------------
const questionSearch = ref("");
const filteredQuestions = computed(() => {
  const q = questionSearch.value.trim().toLowerCase();
  return qQuestions.value
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((it) => {
      if (!q) return true;
      return `${it.code} ${it.text}`.toLowerCase().includes(q);
    });
});

const questionHeaders = [
  { title: "Question", key: "text", sortable: false },
  { title: "Required", key: "is_required", sortable: false },
  { title: "Options", key: "options", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const dimensionHeaders = [
  { title: "Dimension", key: "name", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const bandHeaders = [
  { title: "Scope", key: "scope", sortable: false },
  { title: "Dimension", key: "dimension_id", sortable: false },
  { title: "Label", key: "label", sortable: true },
  { title: "Range", key: "range", sortable: false },
  { title: "Sort", key: "sort_order", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const meaningHeaders = [
  { title: "Rule type", key: "rule_type", sortable: false },
  { title: "Result label", key: "result_label", sortable: true },
  { title: "Priority", key: "priority", sortable: true },
  { title: "Active", key: "is_active", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

const userFieldCfgHeaders = [
  { title: "Field", key: "user_field_id", sortable: false },
  { title: "Required", key: "is_required", sortable: false },
  { title: "Sort", key: "sort_order", sortable: true },
  { title: "Overrides", key: "overrides_json", sortable: false },
  { title: "", key: "actions", sortable: false, align: "end" as const },
];

// -----------------------
// Dialogs + forms (UI only)
// -----------------------
const dialogs = reactive({
  overview: false,
  question: false,
  dimension: false,
  band: false,
  meaning: false,
  userFieldCfg: false,
  confirm: false,
});

const confirm = reactive({
  title: "Confirm action",
  message: "UI only.",
});

function openConfirm(title: string, message: string) {
  confirm.title = title;
  confirm.message = message;
  dialogs.confirm = true;
}

const overviewForm = reactive({
  code: "",
  title: "",
  description: "",
  language: "en",
  status: "draft" as QuestionnaireStatus,
  version: 0,
  scoring_type: "total_score" as ScoringType,
  show_result_to_user: false,
});

function openEditOverview() {
  if (!questionnaire.value) return;
  overviewForm.code = questionnaire.value.code;
  overviewForm.title = questionnaire.value.title;
  overviewForm.description = questionnaire.value.description;
  overviewForm.language = questionnaire.value.language;
  overviewForm.status = questionnaire.value.status;
  overviewForm.version = questionnaire.value.version;
  overviewForm.scoring_type = questionnaire.value.scoring_type;
  overviewForm.show_result_to_user = questionnaire.value.show_result_to_user;
  dialogs.overview = true;
}

type QuestionFormMode = "create" | "edit";
const questionFormMode = ref<QuestionFormMode>("create");

const questionForm = reactive({
  id: "",
  code: "",
  text: "",
  question_type: "single_choice" as QuestionType,
  is_required: true,
  sort_order: 1,
  meta: "{}",
  options: [] as Array<{
    label: string;
    score_value: number;
    sort_order: number;
  }>,
});

function addOptionRow() {
  questionForm.options.push({
    label: "",
    score_value: 0,
    sort_order: questionForm.options.length + 1,
  });
}
function removeOptionRow(i: number) {
  questionForm.options.splice(i, 1);
}

function openCreateQuestion() {
  questionFormMode.value = "create";
  questionForm.id = "";
  questionForm.code = `Q${qQuestions.value.length + 1}`;
  questionForm.text = "";
  questionForm.question_type = "single_choice";
  questionForm.is_required = true;
  questionForm.sort_order = qQuestions.value.length + 1;
  questionForm.meta = "{}";
  questionForm.options = [
    { label: "Option A", score_value: 1, sort_order: 1 },
    { label: "Option B", score_value: 2, sort_order: 2 },
  ];
  dialogs.question = true;
}

function openEditQuestion(item: QuestionnaireQuestion) {
  questionFormMode.value = "edit";
  questionForm.id = item.id;
  questionForm.code = item.code;
  questionForm.text = item.text;
  questionForm.question_type = item.question_type;
  questionForm.is_required = item.is_required;
  questionForm.sort_order = item.sort_order;
  questionForm.meta = item.meta || "{}";
  questionForm.options = optionsByQuestion(item.id).map((o) => ({
    label: o.label,
    score_value: o.score_value,
    sort_order: o.sort_order,
  }));
  dialogs.question = true;
}

type DimensionFormMode = "create" | "edit";
const dimensionFormMode = ref<DimensionFormMode>("create");
const dimensionForm = reactive({
  id: "",
  key: "",
  name: "",
  sort_order: 1,
});

function openCreateDimension() {
  dimensionFormMode.value = "create";
  dimensionForm.id = "";
  dimensionForm.key = "";
  dimensionForm.name = "";
  dimensionForm.sort_order = qDimensions.value.length + 1;
  dialogs.dimension = true;
}

function openEditDimension(item: QuestionnaireDimension) {
  dimensionFormMode.value = "edit";
  dimensionForm.id = item.id;
  dimensionForm.key = item.key;
  dimensionForm.name = item.name;
  dimensionForm.sort_order = item.sort_order;
  dialogs.dimension = true;
}

type BandFormMode = "create" | "edit";
const bandFormMode = ref<BandFormMode>("create");
const bandForm = reactive({
  id: "",
  scope: "total" as BandScope,
  dimension_id: "" as string | "",
  label: "",
  min_score: 0,
  max_score: 0,
  sort_order: 1,
});

function openCreateBand() {
  bandFormMode.value = "create";
  bandForm.id = "";
  bandForm.scope = "total";
  bandForm.dimension_id = "";
  bandForm.label = "";
  bandForm.min_score = 0;
  bandForm.max_score = 0;
  bandForm.sort_order = qBands.value.length + 1;
  dialogs.band = true;
}

function openEditBand(item: QuestionnaireScoreBand) {
  bandFormMode.value = "edit";
  bandForm.id = item.id;
  bandForm.scope = item.scope;
  bandForm.dimension_id = item.dimension_id || "";
  bandForm.label = item.label;
  bandForm.min_score = item.min_score;
  bandForm.max_score = item.max_score;
  bandForm.sort_order = item.sort_order;
  dialogs.band = true;
}

type MeaningFormMode = "create" | "edit";
const meaningFormMode = ref<MeaningFormMode>("create");
const meaningForm = reactive({
  id: "",
  rule_type: "fallback" as MeaningRuleType,
  rule_json: "{}",
  result_label: "",
  description: "",
  recommendations: "",
  priority: 1,
  is_active: true,
});

function openCreateMeaning() {
  meaningFormMode.value = "create";
  meaningForm.id = "";
  meaningForm.rule_type = "fallback";
  meaningForm.rule_json = "{}";
  meaningForm.result_label = "";
  meaningForm.description = "";
  meaningForm.recommendations = "";
  meaningForm.priority = 1;
  meaningForm.is_active = true;
  dialogs.meaning = true;
}

function openEditMeaning(item: QuestionnaireMeaning) {
  meaningFormMode.value = "edit";
  meaningForm.id = item.id;
  meaningForm.rule_type = item.rule_type;
  meaningForm.rule_json = item.rule_json || "{}";
  meaningForm.result_label = item.result_label;
  meaningForm.description = item.description;
  meaningForm.recommendations = item.recommendations;
  meaningForm.priority = item.priority;
  meaningForm.is_active = item.is_active;
  dialogs.meaning = true;
}

type UserFieldCfgFormMode = "create" | "edit";
const userFieldCfgFormMode = ref<UserFieldCfgFormMode>("create");
const userFieldCfgForm = reactive({
  id: "",
  user_field_id: "" as string | "",
  is_required: true,
  sort_order: 1,
  overrides_json: "{}",
});

function openAttachUserField() {
  userFieldCfgFormMode.value = "create";
  userFieldCfgForm.id = "";
  userFieldCfgForm.user_field_id = userFieldSelectItems.value[0]?.value || "";
  userFieldCfgForm.is_required = true;
  userFieldCfgForm.sort_order = qUserFieldConfigs.value.length + 1;
  userFieldCfgForm.overrides_json = "{}";
  dialogs.userFieldCfg = true;
}

function openEditUserFieldCfg(item: QuestionnaireUserFieldConfig) {
  userFieldCfgFormMode.value = "edit";
  userFieldCfgForm.id = item.id;
  userFieldCfgForm.user_field_id = item.user_field_id;
  userFieldCfgForm.is_required = item.is_required;
  userFieldCfgForm.sort_order = item.sort_order;
  userFieldCfgForm.overrides_json = item.overrides_json || "{}";
  dialogs.userFieldCfg = true;
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => {
    ui.loading = false;
    tab.value = String(route.query.tab || "overview");
  }, 250);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-inner-card {
  background: rgba(var(--v-theme-surface), 1);
}

.sb-search {
  min-width: 320px;
}
</style>
