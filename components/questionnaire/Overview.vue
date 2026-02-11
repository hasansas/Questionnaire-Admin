<template>
  <v-row>
    <!-- Summary -->
    <v-col cols="12" lg="7">
      <v-card rounded="xl" variant="outlined" class="sb-card pa-5">
        <div class="d-flex align-start justify-space-between flex-wrap ga-3">
          <div class="min-w-0">
            <div class="text-subtitle-1 font-weight-black text-capitalize">
              Overview
            </div>
            <div class="text-body-2 text-medium-emphasis mt-1">
              A quick overview of identity, status, configuration, and
              visibility.
            </div>
          </div>
        </div>

        <v-divider class="my-4" />

        <v-row dense class="ga-3" no-gutters>
          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Code</div>
            <div class="text-body-2 font-weight-bold">{{ q.code || "—" }}</div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Version</div>
            <div class="text-body-2 font-weight-bold">
              v{{ q.version ?? 1 }}
            </div>
          </v-col>

          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">Title</div>
            <div class="text-body-2 font-weight-bold text-capitalize">
              {{ q.title || "—" }}
            </div>
          </v-col>

          <v-col cols="12">
            <div class="text-caption text-medium-emphasis">Description</div>
            <div class="text-body-2 text-medium-emphasis">
              {{ q.description || "—" }}
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Language</div>
            <div class="text-body-2 font-weight-bold">
              {{ (q.language || "—").toUpperCase() }}
            </div>
          </v-col>

          <v-col cols="12" md="6">
            <div class="text-caption text-medium-emphasis">Visibility</div>
            <div class="text-body-2 font-weight-bold">
              {{
                q.showResultToUser
                  ? "Result shown to user"
                  : "Admin-only result"
              }}
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
              Each question contributes to one overall score, then mapped into
              bands and meanings.
            </span>
            <span v-else>
              Each question contributes to one or more dimensions, then mapped
              into bands and meanings per dimension.
            </span>
          </div>
        </v-alert>
      </v-card>
    </v-col>

    <!-- Configuration -->
    <v-col cols="12" lg="5">
      <v-card rounded="xl" variant="outlined" class="sb-card pa-5">
        <div class="text-subtitle-1 font-weight-black">Configuration</div>
        <div class="text-body-2 text-medium-emphasis mt-1">
          Key settings that affect scoring, options, and publishing readiness.
        </div>

        <v-divider class="my-4" />

        <div class="d-flex flex-column ga-3">
          <div class="d-flex align-center justify-space-between">
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

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
              <v-avatar size="34" rounded="lg" color="primary" variant="tonal">
                <v-icon icon="lucide:calculator" size="16" />
              </v-avatar>
              <div class="text-body-2 font-weight-bold">Scoring</div>
            </div>
            <div class="text-body-2 font-weight-bold">{{ scoringLabel }}</div>
          </div>

          <div class="d-flex align-center justify-space-between">
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

          <div class="d-flex align-center justify-space-between">
            <div class="d-flex align-center ga-2">
              <v-avatar size="34" rounded="lg" color="success" variant="tonal">
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

          <div class="d-flex align-center justify-space-between">
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
