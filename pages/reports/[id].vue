<template>
  <div class="sb-page">
    <AdminPageHeader
      :title="report ? `Report ${report.id}` : 'Report'"
      subtitle="Report detail with respondent snapshot, answers, scores, bands, and meaning."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-btn
            rounded="lg"
            variant="text"
            to="/reports"
            prepend-icon="lucide:arrow-left"
          >
            Back
          </v-btn>
          <v-btn
            rounded="lg"
            variant="outlined"
            prepend-icon="lucide:download"
            :disabled="!report"
          >
            Export (UI)
          </v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            prepend-icon="lucide:printer"
            :disabled="!report"
          >
            Print (UI)
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <template v-if="ui.loading">
      <v-card rounded="xl" class="sb-card pa-6">
        <v-skeleton-loader type="heading, text, text, actions" />
      </v-card>
      <v-row class="ga-4 mt-4" no-gutters>
        <v-col cols="12" lg="4" v-for="n in 3" :key="n">
          <v-card rounded="xl" class="sb-card pa-4">
            <v-skeleton-loader type="heading, text" />
          </v-card>
        </v-col>
      </v-row>
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
        <v-btn rounded="lg" color="primary" @click="reload">Retry</v-btn>
      </v-card>
    </template>

    <template v-else-if="!report">
      <v-card rounded="xl" class="sb-card pa-10">
        <div class="d-flex flex-column align-center text-center">
          <v-avatar size="56" color="warning" variant="tonal" class="mb-3">
            <v-icon icon="lucide:circle-off" />
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold">Report not found</div>
          <div class="text-body-2 text-medium-emphasis mt-1 mb-5">
            The report ID may be invalid or missing in mock results.
          </div>
          <v-btn
            rounded="lg"
            color="primary"
            to="/reports"
            prepend-icon="lucide:arrow-left"
          >
            Back to Reports
          </v-btn>
        </div>
      </v-card>
    </template>

    <template v-else>
      <v-row class="ga-4" no-gutters>
        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">Summary</div>
              <div class="text-caption text-medium-emphasis">
                {{ report.questionnaire_title }} · v{{
                  report.questionnaire_version
                }}
                · {{ report.scoring_type_snapshot }}
              </div>
            </div>
            <v-divider />

            <div class="pa-4">
              <v-row class="ga-4" no-gutters>
                <v-col cols="12" md="6">
                  <v-card rounded="xl" variant="tonal" class="pa-4">
                    <div class="text-caption text-medium-emphasis">
                      Organization
                    </div>
                    <div class="text-body-1 font-weight-black mt-1">
                      {{ report.organization_name || "—" }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ report.organization_code || "No org" }}
                    </div>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card rounded="xl" variant="tonal" class="pa-4">
                    <div class="text-caption text-medium-emphasis">
                      Result label
                    </div>
                    <div class="d-flex align-center ga-2 mt-1">
                      <v-chip size="small" variant="tonal" color="primary">{{
                        report.result_label
                      }}</v-chip>
                      <span class="text-caption text-medium-emphasis">
                        Submitted: {{ formatDateTime(report.submitted_at) }}
                      </span>
                    </div>
                  </v-card>
                </v-col>
              </v-row>

              <v-divider class="my-4" />

              <div class="text-subtitle-2 font-weight-black mb-2">
                Meaning snapshot
              </div>
              <div class="text-body-2">
                {{ report.meaning_snapshot || "—" }}
              </div>

              <div class="text-subtitle-2 font-weight-black mt-4 mb-2">
                Recommendations
              </div>
              <div class="text-body-2">
                {{ report.recommendations_snapshot || "—" }}
              </div>
            </div>
          </v-card>

          <v-card rounded="xl" class="sb-card mt-4">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">Answers</div>
              <div class="text-caption text-medium-emphasis">
                A compact answer summary (UI mock).
              </div>
            </div>
            <v-divider />
            <v-data-table
              :headers="answerHeaders"
              :items="answers"
              item-key="question_code"
              density="comfortable"
            >
              <template #item.score_value="{ item }">
                <v-chip size="small" variant="tonal">{{
                  item.score_value
                }}</v-chip>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">Respondent</div>
              <div class="text-caption text-medium-emphasis">
                Snapshot user info attached to attempt.
              </div>
            </div>
            <v-divider />
            <div class="pa-4">
              <div class="d-flex flex-column ga-3">
                <div v-for="row in respondentRows" :key="row.label">
                  <div class="text-caption text-medium-emphasis">
                    {{ row.label }}
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ row.value }}
                  </div>
                </div>
              </div>

              <v-divider class="my-4" />

              <div class="text-subtitle-2 font-weight-black mb-2">
                Scores JSON
              </div>
              <v-card rounded="lg" variant="tonal" class="pa-3 sb-mono">
                {{ report.scores_json }}
              </v-card>

              <div class="text-subtitle-2 font-weight-black mt-4 mb-2">
                Bands JSON
              </div>
              <v-card rounded="lg" variant="tonal" class="pa-3 sb-mono">
                {{ report.bands_json }}
              </v-card>
            </div>
          </v-card>

          <v-card rounded="xl" class="sb-card mt-4">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">
                Attempt metadata
              </div>
              <div class="text-caption text-medium-emphasis">
                Network and timing snapshot.
              </div>
            </div>
            <v-divider />
            <div class="pa-4">
              <div class="d-flex flex-column ga-3">
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Attempt ID
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ report.attempt_id }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    IP address
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ report.ip_address }}
                  </div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    User agent
                  </div>
                  <div class="text-body-2">{{ report.user_agent }}</div>
                </div>
                <div>
                  <div class="text-caption text-medium-emphasis">
                    Computed at
                  </div>
                  <div class="text-body-2 font-weight-bold">
                    {{ formatDateTime(report.computed_at) }}
                  </div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

definePageMeta({
  layout: "admin",
  middleware: ["auth"],
});

type ScoringType = "multi_dimension" | "total_score";
type AttemptStatus = "in_progress" | "submitted";

interface Attempt {
  id: string;
  questionnaire_id: string;
  questionnaire_version: number;
  organization_id?: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  ip_address: string;
  user_agent: string;
}

interface Result {
  id: string;
  attempt_id: string;
  scoring_type_snapshot: ScoringType;
  scores_json: string;
  bands_json: string;
  result_label: string;
  meaning_snapshot: string;
  recommendations_snapshot: string;
  computed_at: string;
}

interface Organization {
  id: string;
  code: string;
  name: string;
  type: string;
  status: "active" | "inactive";
  timezone: string;
  created_at: string;
  updated_at: string;
}

interface Questionnaire {
  id: string;
  code: string;
  title: string;
  description: string;
  language: string;
  status: "draft" | "published" | "archived";
  version: number;
  scoring_type: ScoringType;
  show_result_to_user: boolean;
  created_at: string;
  updated_at: string;
}

interface ReportDetail {
  id: string;
  attempt_id: string;
  questionnaire_id: string;
  questionnaire_title: string;
  questionnaire_version: number;
  organization_id?: string;
  organization_code?: string;
  organization_name?: string;
  status: AttemptStatus;
  submitted_at?: string;
  scoring_type_snapshot: ScoringType;
  scores_json: string;
  bands_json: string;
  result_label: string;
  meaning_snapshot: string;
  recommendations_snapshot: string;
  computed_at: string;
  ip_address: string;
  user_agent: string;
}

const route = useRoute();

const ui = reactive({
  loading: true,
  error: "" as string | "",
});

const organizations = ref<Organization[]>([
  {
    id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    code: "SBZ",
    name: "SuperBazi Internal",
    type: "internal",
    status: "active",
    timezone: "Asia/Jakarta",
    created_at: "2026-01-01T08:00:00Z",
    updated_at: "2026-01-10T10:30:00Z",
  },
  {
    id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    code: "ACME",
    name: "Acme Wellness",
    type: "client",
    status: "active",
    timezone: "Asia/Jakarta",
    created_at: "2025-12-20T02:10:00Z",
    updated_at: "2026-01-12T09:20:00Z",
  },
]);

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
]);

const attempts = ref<Attempt[]>([
  {
    id: "att_001",
    questionnaire_id: "c4caa2f7-43c8-4ed2-99dc-2d72c9c2f0ef",
    questionnaire_version: 3,
    organization_id: "0d4b8b9e-4c70-4c4f-a98c-4608c7e972a4",
    status: "submitted",
    started_at: "2026-01-17T03:10:00Z",
    submitted_at: "2026-01-17T03:18:00Z",
    ip_address: "103.10.10.10",
    user_agent: "Mozilla/5.0",
  },
  {
    id: "att_002",
    questionnaire_id: "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25",
    questionnaire_version: 1,
    organization_id: "2bbd7b1a-2d9c-4b86-9a2c-9f1d01b5cdb1",
    status: "submitted",
    started_at: "2026-01-16T09:10:00Z",
    submitted_at: "2026-01-16T09:22:00Z",
    ip_address: "103.10.10.11",
    user_agent: "Mozilla/5.0",
  },
]);

const results = ref<Result[]>([
  {
    id: "res_001",
    attempt_id: "att_001",
    scoring_type_snapshot: "multi_dimension",
    scores_json: '{"dimensions":{"energy":2,"sleep":3},"total":5}',
    bands_json:
      '{"dimensions":{"energy":"Balanced Energy","sleep":"High Sleep"},"total":"—"}',
    result_label: "Balanced Builder",
    meaning_snapshot: "Stable baseline with strong sleep signals.",
    recommendations_snapshot: "Maintain routine; improve daytime breaks.",
    computed_at: "2026-01-17T03:18:05Z",
  },
  {
    id: "res_002",
    attempt_id: "att_002",
    scoring_type_snapshot: "total_score",
    scores_json: '{"total":3}',
    bands_json: '{"total":"High Alert"}',
    result_label: "High Alert",
    meaning_snapshot: "Elevated stress indicators today.",
    recommendations_snapshot: "Reduce load; improve sleep; seek support.",
    computed_at: "2026-01-16T09:22:05Z",
  },
]);

const qById = computed(
  () => new Map(questionnaires.value.map((q) => [q.id, q])),
);
const orgById = computed(
  () => new Map(organizations.value.map((o) => [o.id, o])),
);

const reportId = computed(() => String(route.params.id || ""));

const report = computed<ReportDetail | null>(() => {
  const res = results.value.find((r) => r.id === reportId.value);
  if (!res) return null;

  const att = attempts.value.find((a) => a.id === res.attempt_id);
  if (!att) return null;

  const q = qById.value.get(att.questionnaire_id);
  const org = att.organization_id
    ? orgById.value.get(att.organization_id)
    : undefined;

  return {
    id: res.id,
    attempt_id: res.attempt_id,
    questionnaire_id: att.questionnaire_id,
    questionnaire_title: q?.title || "—",
    questionnaire_version: att.questionnaire_version,
    organization_id: att.organization_id,
    organization_code: org?.code,
    organization_name: org?.name,
    status: att.status,
    submitted_at: att.submitted_at,
    scoring_type_snapshot: res.scoring_type_snapshot,
    scores_json: res.scores_json,
    bands_json: res.bands_json,
    result_label: res.result_label,
    meaning_snapshot: res.meaning_snapshot,
    recommendations_snapshot: res.recommendations_snapshot,
    computed_at: res.computed_at,
    ip_address: att.ip_address,
    user_agent: att.user_agent,
  };
});

// Mock respondent info (would come from questionnaire_attempt_user_info in real app)
const respondent = ref({
  full_name: "Sample Respondent",
  email: "respondent@example.com",
  age: "29",
});

const respondentRows = computed(() => [
  { label: "Full name", value: respondent.value.full_name },
  { label: "Email", value: respondent.value.email },
  { label: "Age", value: respondent.value.age },
]);

// Mock answers
const answers = computed(() => {
  if (!report.value) return [];
  if (
    report.value.questionnaire_id === "0a2f5d60-3d32-4d58-94b0-3a23f62f7b25"
  ) {
    return [
      {
        question_code: "Q1",
        question_text: "How stressed do you feel today?",
        answer_label: "High",
        score_value: 3,
      },
    ];
  }
  return [
    {
      question_code: "Q1",
      question_text: "How often do you feel energetic during the day?",
      answer_label: "Sometimes",
      score_value: 2,
    },
    {
      question_code: "Q2",
      question_text: "How restful is your sleep most nights?",
      answer_label: "Great",
      score_value: 3,
    },
  ];
});

const answerHeaders = [
  { title: "Question", key: "question_text", sortable: false },
  { title: "Answer", key: "answer_label", sortable: false },
  { title: "Score", key: "score_value", sortable: false },
];

function formatDateTime(v?: string) {
  if (!v) return "—";
  return new Date(v).toLocaleString();
}

function reload() {
  ui.loading = true;
  ui.error = "";
  setTimeout(() => (ui.loading = false), 250);
}

onMounted(() => reload());
</script>

<style lang="scss" scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-mono {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
  font-size: 12px;
  white-space: pre-wrap;
}
</style>
