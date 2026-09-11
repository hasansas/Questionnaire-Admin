<template>
  <div class="d-flex flex-column ga-4">
    <section class="overview-hero">
      <div class="min-w-0">
        <span class="overview-eyebrow">Questionnaire overview</span>
        <h2 class="overview-title">Overview</h2>
        <p class="overview-subtitle">
          A quick look at identity, status, configuration, and visibility.
        </p>
        <div class="overview-status-row">
          <span
            class="overview-status-pill"
            :class="`overview-status-pill--${statusColor}`"
          >
            <v-icon :icon="statusIcon" size="12" class="me-1" />
            {{ statusLabel }}
          </span>
          <span class="overview-status-note">{{ scoringLabel }}</span>
          <span class="overview-status-note">
            {{ q.optionsMode === "fixed" ? "Fixed options" : "Per-question options" }}
          </span>
          <span class="overview-status-note">
            {{ (q.language || "—").toUpperCase() }}
          </span>
        </div>
      </div>
    </section>

    <v-row>
      <!-- Details -->
      <v-col cols="12" lg="7">
        <v-card rounded="xl" variant="outlined" class="sb-card pa-5">
          <div class="d-flex align-center ga-2">
            <v-icon
              icon="lucide:id-card"
              size="16"
              class="text-medium-emphasis"
            />
            <span class="text-subtitle-1 font-weight-black">Details</span>
          </div>

          <v-divider class="my-4" />

          <v-row dense class="ga-3" no-gutters>
            <v-col cols="12" md="6">
              <div class="overview-field">
                <v-icon icon="lucide:hash" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">Code</div>
                  <div class="text-body-2 font-weight-bold">
                    {{ q.code || "—" }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="overview-field">
                <v-icon icon="lucide:git-branch" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">Version</div>
                  <div class="text-body-2 font-weight-bold">
                    v{{ q.version ?? 1 }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="overview-field">
                <v-icon icon="lucide:type" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">Title</div>
                  <div class="text-body-2 font-weight-bold text-capitalize">
                    {{ q.title || "—" }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12">
              <div class="overview-field">
                <v-icon icon="lucide:align-left" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Description
                  </div>
                  <div class="text-body-2 text-medium-emphasis">
                    {{ q.description || "—" }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="overview-field">
                <v-icon icon="lucide:languages" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Language
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ (q.language || "—").toUpperCase() }}
                  </div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6">
              <div class="overview-field">
                <v-icon icon="lucide:eye" size="14" />
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Visibility
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{
                      q.showResultToUser
                        ? "Result shown to user"
                        : "Admin-only result"
                    }}
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <v-alert variant="tonal" type="info" rounded="lg">
            <div class="text-body-2 font-weight-bold">
              How this questionnaire behaves
            </div>
            <div class="text-caption text-medium-emphasis mt-1">
              This questionnaire uses
              <span class="font-weight-bold">{{ scoringLabel }}</span>
              scoring.
              <span v-if="q.scoringType === 'total_score'">
                Each question contributes to one overall score, then mapped
                into bands and meanings.
              </span>
              <span v-else>
                Each question contributes to one or more dimensions, then
                mapped into bands and meanings per dimension.
              </span>
            </div>
          </v-alert>
        </v-card>
      </v-col>

      <!-- Configuration -->
      <v-col cols="12" lg="5">
        <v-card rounded="xl" variant="outlined" class="sb-card pa-5">
          <div class="d-flex align-center ga-2">
            <v-icon
              icon="lucide:settings-2"
              size="16"
              class="text-medium-emphasis"
            />
            <span class="text-subtitle-1 font-weight-black">
              Configuration
            </span>
          </div>
          <div class="text-body-2 text-medium-emphasis mt-1">
            Key settings that affect scoring, options, and publishing
            readiness.
          </div>

          <v-divider class="my-4" />

          <div class="d-flex flex-column ga-2">
            <div class="overview-config-row">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="34"
                  rounded="lg"
                  :color="statusColor"
                  variant="tonal"
                >
                  <v-icon :icon="statusIcon" size="16" />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">Status</div>
              </div>
              <v-chip size="small" variant="tonal" :color="statusColor">
                {{ statusLabel }}
              </v-chip>
            </div>

            <div class="overview-config-row">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="34"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:calculator" size="16" />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">Scoring</div>
              </div>
              <div class="text-body-2 font-weight-bold">
                {{ scoringLabel }}
              </div>
            </div>

            <div class="overview-config-row">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="34"
                  rounded="lg"
                  :color="q.optionsMode === 'fixed' ? 'success' : 'info'"
                  variant="tonal"
                >
                  <v-icon
                    :icon="
                      q.optionsMode === 'fixed'
                        ? 'lucide:toggle-left'
                        : 'lucide:list-tree'
                    "
                    size="16"
                  />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">Options mode</div>
              </div>
              <div class="text-body-2 font-weight-bold">
                {{ q.optionsMode === "fixed" ? "Fixed" : "Per-question" }}
              </div>
            </div>

            <div class="overview-config-row">
              <div class="d-flex align-center ga-2">
                <v-avatar
                  size="34"
                  rounded="lg"
                  color="success"
                  variant="tonal"
                >
                  <v-icon icon="lucide:eye" size="16" />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">User result</div>
              </div>
              <v-chip
                size="small"
                variant="tonal"
                :color="q.showResultToUser ? 'success' : 'grey'"
              >
                {{ q.showResultToUser ? "Enabled" : "Hidden" }}
              </v-chip>
            </div>

            <div class="overview-config-row">
              <div class="d-flex align-center ga-2">
                <v-avatar size="34" rounded="lg" color="grey" variant="tonal">
                  <v-icon icon="lucide:clock" size="16" />
                </v-avatar>
                <div class="text-body-2 font-weight-bold">Updated</div>
              </div>
              <div class="text-body-2 font-weight-bold">
                {{ formatDateTime(q.updatedAt) }}
              </div>
            </div>
          </div>

          <v-divider class="my-4" />

          <v-alert variant="tonal" type="warning" rounded="lg">
            <div class="text-body-2 font-weight-bold">Draft checklist</div>
            <div class="text-caption text-medium-emphasis mt-1">
              Before publishing, ensure questions are complete, scoring is
              validated, and bands + meanings are finalized.
            </div>
          </v-alert>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { QuestionnaireModel } from "~/models/questionnaire";

const props = defineProps<{
  model: QuestionnaireModel;
}>();

const q = computed(() => props.model);

const statusLabel = computed(() => {
  const s = (q.value.status || "draft").toLowerCase();
  if (s === "published") return "Published";
  if (s === "archived") return "Archived";
  return "Draft";
});

const statusColor = computed(() => {
  const s = (q.value.status || "draft").toLowerCase();
  if (s === "published") return "success";
  if (s === "archived") return "grey";
  return "warning";
});

const statusIcon = computed(() => {
  const s = (q.value.status || "draft").toLowerCase();
  if (s === "published") return "lucide:badge-check";
  if (s === "archived") return "lucide:archive";
  return "lucide:file-edit";
});

const scoringLabel = computed(() => {
  return q.value.scoringType === "total_score"
    ? "Total score"
    : "Multi-dimension";
});

function formatDateTime(v?: string | Date) {
  if (!v) return "—";
  const d = typeof v === "string" ? new Date(v) : v;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<style scoped lang="scss">
.overview-hero {
  display: flex;
  flex-wrap: wrap;
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

.overview-eyebrow {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #64748b;
}

.overview-title {
  margin: 10px 0 0;
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
}

.overview-subtitle {
  max-width: 640px;
  margin: 12px 0 0;
  color: #64748b;
  line-height: 1.7;
}

.overview-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
}

.overview-status-pill,
.overview-status-note {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
}

.overview-status-pill {
  letter-spacing: 0.04em;
  text-transform: capitalize;
}

.overview-status-pill--success {
  color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.12);
}

.overview-status-pill--warning {
  color: rgb(var(--v-theme-warning));
  background: rgba(var(--v-theme-warning), 0.12);
}

.overview-status-pill--grey {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

.overview-status-note {
  color: #475569;
  background: rgba(148, 163, 184, 0.14);
}

.overview-field {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  border-radius: 10px;
  transition: background-color 0.15s ease;

  .v-icon {
    margin-top: 2px;
    color: rgba(var(--v-theme-on-surface), 0.4);
  }
}

.overview-field:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.overview-config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border: 1px solid var(--sb-border-soft);
  border-radius: 12px;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.overview-config-row:hover {
  border-color: var(--sb-border);
  background: rgba(var(--v-theme-on-surface), 0.02);
}

@media (max-width: 960px) {
  .overview-hero {
    padding: 24px;
    align-items: flex-start;
  }
}
</style>
