<template>
  <div class="sb-campaigns-page">
    <AdminPageHeader
      title="Campaigns"
      subtitle="Create email and WhatsApp campaigns by choosing an audience segment and message template."
    >
      <template #actions>
        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:plus"
          @click="openCreateDialog"
        >
          Create Campaign
        </v-btn>
      </template>
    </AdminPageHeader>

    <v-row class="mb-1">
      <v-col v-for="card in summaryCards" :key="card.label" cols="12" sm="6" lg="3">
        <v-card rounded="xl" class="sb-card pa-4">
          <div class="d-flex align-start justify-space-between ga-3">
            <div>
              <div class="text-caption text-medium-emphasis">{{ card.label }}</div>
              <div class="text-h5 font-weight-black mt-1">{{ card.value }}</div>
              <div class="text-caption text-medium-emphasis mt-2">{{ card.caption }}</div>
            </div>
            <v-avatar size="42" rounded="xl" :color="card.color" variant="tonal">
              <v-icon :icon="card.icon" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card rounded="xl" variant="outlined" class="sb-card overflow-hidden">
      <div class="campaign-table-head">
        <div>
          <div class="text-subtitle-1 font-weight-black">Campaign Registry</div>
          <div class="text-caption text-medium-emphasis">
            Draft campaigns created from the builder flow.
          </div>
        </div>
        <v-spacer />
        <v-text-field
          v-model="campaignSearch"
          density="compact"
          variant="outlined"
          rounded="lg"
          hide-details
          clearable
          placeholder="Search campaigns"
          class="campaign-search"
        >
          <template #prepend-inner>
            <v-icon icon="lucide:search" size="18" class="text-medium-emphasis" />
          </template>
        </v-text-field>
      </div>

      <v-divider />

      <v-data-table
        :headers="campaignHeaders"
        :items="filteredCampaigns"
        item-key="id"
        class="sb-table"
        :items-per-page="10"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center ga-3 min-w-0 py-2">
            <v-avatar size="34" rounded="lg" :color="channelColor(item.channel)" variant="tonal">
              <v-icon :icon="channelIcon(item.channel)" size="18" />
            </v-avatar>
            <div class="min-w-0">
              <div class="font-weight-bold text-truncate">{{ item.name }}</div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ item.description || "No description" }}
              </div>
            </div>
          </div>
        </template>

        <template #item.channel="{ item }">
          <v-chip size="small" rounded="lg" variant="tonal" :color="channelColor(item.channel)">
            <v-icon :icon="channelIcon(item.channel)" size="15" class="me-1" />
            {{ channelLabel(item.channel) }}
          </v-chip>
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" rounded="lg" variant="tonal" color="warning">
            <v-icon icon="lucide:file-clock" size="15" class="me-1" />
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.createdAt="{ item }">
          <span class="text-body-2">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #no-data>
          <div class="pa-10 text-center">
            <v-avatar size="56" rounded="xl" color="primary" variant="tonal" class="mb-4">
              <v-icon icon="lucide:megaphone" size="26" />
            </v-avatar>
            <div class="text-h6 font-weight-black mb-1">No campaigns yet</div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              Start by creating a campaign, then select the audience and template.
            </div>
            <v-btn color="primary" rounded="lg" prepend-icon="lucide:plus" @click="openCreateDialog">
              Create Campaign
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="detailsDialog" max-width="560" persistent>
      <v-card rounded="xl" class="sb-card overflow-hidden">
        <v-card-title class="d-flex align-center ga-3 px-6 py-5">
          <v-avatar size="38" rounded="lg" color="primary" variant="tonal">
            <v-icon icon="lucide:send" size="20" />
          </v-avatar>
          <div>
            <div class="text-subtitle-1 font-weight-black">Create campaign</div>
            <div class="text-caption text-medium-emphasis">
              Choose the channel and campaign identity before configuring delivery.
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-select
            v-model="createForm.channel"
            :items="channelItems"
            item-title="title"
            item-value="value"
            label="Channel"
            variant="outlined"
            rounded="lg"
            class="mb-4"
            hide-details="auto"
            @update:model-value="resetBuilderSelection"
          >
            <template #prepend-inner>
              <v-icon :icon="channelIcon(createForm.channel)" size="18" class="me-2" />
            </template>
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="channelIcon(item.raw.value)" size="18" />
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-text-field
            v-model="createForm.name"
            label="Campaign name"
            variant="outlined"
            rounded="lg"
            class="mb-4"
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-icon icon="lucide:megaphone" size="18" class="me-2" />
            </template>
          </v-text-field>

          <v-textarea
            v-model="createForm.description"
            label="Description"
            variant="outlined"
            rounded="lg"
            rows="3"
            auto-grow
            hide-details="auto"
          >
            <template #prepend-inner>
              <v-icon icon="lucide:text" size="18" class="me-2 mt-1" />
            </template>
          </v-textarea>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="detailsDialog = false">Cancel</v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            append-icon="lucide:arrow-right"
            :disabled="!canContinueToBuilder"
            :loading="loadingTemplates"
            @click="openBuilderDialog"
          >
            Next
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="builderDialog" max-width="1420" persistent scrollable>
      <v-card rounded="xl" class="sb-card campaign-builder-card">
        <v-card-title class="campaign-builder-title">
          <div class="d-flex align-center ga-3 min-w-0">
            <v-avatar size="38" rounded="lg" :color="channelColor(createForm.channel)" variant="tonal">
              <v-icon :icon="channelIcon(createForm.channel)" size="20" />
            </v-avatar>
            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-black text-truncate">
                {{ createForm.name || "Create campaign" }}
              </div>
              <div class="text-caption text-medium-emphasis text-truncate">
                {{ channelLabel(createForm.channel) }} campaign builder
              </div>
            </div>
          </div>
          <v-spacer />
          <v-btn icon variant="text" rounded="lg" aria-label="Close" @click="builderDialog = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-0">
          <div class="campaign-builder-grid">
            <section class="campaign-builder-panel">
              <div class="panel-head">
                <div>
                  <div class="text-subtitle-2 font-weight-black">Segments</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedSegment ? selectedSegment.name : "No segment selected" }}
                  </div>
                </div>
              </div>
              <v-text-field
                v-model="segmentSearch"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                clearable
                placeholder="Search segments"
                class="ma-4 mt-0"
              >
                <template #prepend-inner>
                  <v-icon icon="lucide:search" size="17" />
                </template>
              </v-text-field>

              <div class="panel-list">
                <v-card
                  v-for="segment in filteredSegments"
                  :key="segment.id"
                  rounded="lg"
                  variant="outlined"
                  class="campaign-select-card"
                  :class="{ 'is-selected': selectedSegmentId === segment.id }"
                  @click="selectedSegmentId = segment.id"
                >
                  <div class="d-flex align-start ga-3">
                    <v-avatar size="34" rounded="lg" color="primary" variant="tonal">
                      <v-icon icon="lucide:users" size="17" />
                    </v-avatar>
                    <div class="min-w-0 flex-grow-1">
                      <div class="font-weight-bold text-body-2 text-truncate">{{ segment.name }}</div>
                      <div class="text-caption text-medium-emphasis mt-1">{{ segment.description }}</div>
                      <div class="d-flex align-center ga-2 mt-2">
                        <v-chip size="x-small" rounded="lg" variant="tonal">
                          {{ segment.contactsLabel }} contacts
                        </v-chip>
                        <v-chip size="x-small" rounded="lg" variant="tonal" color="primary">
                          {{ segment.source }}
                        </v-chip>
                      </div>
                    </div>
                    <v-icon
                      v-if="selectedSegmentId === segment.id"
                      icon="lucide:check-circle"
                      color="primary"
                      size="18"
                    />
                  </div>
                </v-card>
              </div>
            </section>

            <section class="campaign-builder-panel">
              <div class="panel-head">
                <div>
                  <div class="text-subtitle-2 font-weight-black">Templates</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedTemplate ? selectedTemplate.name : "No template selected" }}
                  </div>
                </div>
              </div>
              <v-text-field
                v-model="templateSearch"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                clearable
                placeholder="Search templates"
                class="ma-4 mt-0"
              >
                <template #prepend-inner>
                  <v-icon icon="lucide:search" size="17" />
                </template>
              </v-text-field>

              <div class="panel-list">
                <div v-if="loadingTemplates" class="px-4">
                  <v-skeleton-loader type="list-item-three-line@4" />
                </div>

                <div v-else-if="filteredTemplates.length === 0" class="pa-6 text-center">
                  <v-avatar size="44" rounded="xl" color="grey" variant="tonal" class="mb-3">
                    <v-icon icon="lucide:file-search" size="22" />
                  </v-avatar>
                  <div class="font-weight-bold">No templates found</div>
                  <div class="text-caption text-medium-emphasis mt-1">
                    Try another search or create a template first.
                  </div>
                </div>

                <template v-else>
                  <v-card
                    v-for="template in filteredTemplates"
                    :key="template.id"
                    rounded="lg"
                    variant="outlined"
                    class="campaign-select-card"
                    :class="{ 'is-selected': selectedTemplateId === template.id }"
                    @click="selectedTemplateId = template.id"
                  >
                    <div class="d-flex align-start ga-3">
                      <v-avatar size="34" rounded="lg" :color="channelColor(template.channel)" variant="tonal">
                        <v-icon :icon="channelIcon(template.channel)" size="17" />
                      </v-avatar>
                      <div class="min-w-0 flex-grow-1">
                        <div class="font-weight-bold text-body-2 text-truncate">{{ template.name }}</div>
                        <div class="text-caption text-medium-emphasis mt-1 text-truncate">
                          {{ template.subject || template.description || "No subject" }}
                        </div>
                        <div class="d-flex align-center ga-2 mt-2">
                          <v-chip size="x-small" rounded="lg" variant="tonal">
                            {{ channelLabel(template.channel) }}
                          </v-chip>
                          <v-chip v-if="template.status" size="x-small" rounded="lg" variant="tonal" color="success">
                            {{ template.status }}
                          </v-chip>
                        </div>
                      </div>
                      <v-icon
                        v-if="selectedTemplateId === template.id"
                        icon="lucide:check-circle"
                        color="primary"
                        size="18"
                      />
                    </div>
                  </v-card>
                </template>
              </div>
            </section>

            <section class="campaign-builder-panel preview-panel">
              <div class="panel-head">
                <div>
                  <div class="text-subtitle-2 font-weight-black">Preview</div>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedTemplate ? selectedTemplate.name : "Select a template to preview" }}
                  </div>
                </div>
              </div>

              <div v-if="!selectedTemplate" class="preview-empty">
                <v-avatar size="58" rounded="xl" color="primary" variant="tonal" class="mb-4">
                  <v-icon icon="lucide:layout-template" size="28" />
                </v-avatar>
                <div class="text-subtitle-1 font-weight-black">Template preview</div>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  Select a template from the middle column to inspect the content before creating the campaign.
                </div>
              </div>

              <div v-else class="preview-content">
                <div class="d-flex align-center justify-space-between ga-2 mb-4">
                  <v-chip size="small" rounded="lg" variant="tonal" :color="channelColor(selectedTemplate.channel)">
                    <v-icon :icon="channelIcon(selectedTemplate.channel)" size="15" class="me-1" />
                    {{ channelLabel(selectedTemplate.channel) }}
                  </v-chip>
                  <div class="text-caption text-medium-emphasis">
                    {{ selectedSegment ? selectedSegment.name : "No segment" }}
                  </div>
                </div>

                <v-card v-if="selectedTemplate.channel === 'email'" rounded="xl" variant="outlined" class="email-preview-card">
                  <div class="pa-4 border-b-sm">
                    <div class="text-caption text-medium-emphasis">Subject</div>
                    <div class="font-weight-bold">{{ selectedTemplate.subject || "Untitled email" }}</div>
                  </div>
                  <div class="email-preview-body" v-html="selectedTemplate.previewHtml" />
                </v-card>

                <v-card v-else rounded="xl" variant="outlined" class="whatsapp-preview-card">
                  <div class="whatsapp-device">
                    <div class="whatsapp-device__bar">
                      <span>WhatsApp</span>
                      <v-icon icon="lucide:wifi" size="14" />
                    </div>
                    <div class="whatsapp-bubble">
                      {{ selectedTemplate.previewText }}
                    </div>
                  </div>
                </v-card>
              </div>
            </section>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="px-6 py-4">
          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:arrow-left" @click="backToDetails">
            Back
          </v-btn>
          <v-spacer />
          <v-btn rounded="lg" variant="text" @click="builderDialog = false">Cancel</v-btn>
          <v-btn
            rounded="lg"
            color="primary"
            prepend-icon="lucide:check"
            :disabled="!canCreateCampaign"
            @click="createCampaignDraft"
          >
            Create Campaign
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import type { EmailTemplateModel } from "~/models/email-template";

definePageMeta({
  middleware: ["auth"],
  title: "Campaigns",
  breadcrumbs: [{ title: "Campaigns", disabled: true }],
});

type CampaignChannel = "email" | "whatsapp";

interface CampaignSegment {
  id: string;
  name: string;
  description: string;
  contactsLabel: string;
  source: string;
}

interface CampaignTemplate {
  id: string;
  channel: CampaignChannel;
  name: string;
  description?: string | null;
  subject?: string | null;
  status?: string | null;
  previewHtml: string;
  previewText: string;
}

interface CampaignDraft {
  id: string;
  name: string;
  description: string;
  channel: CampaignChannel;
  segment: string;
  template: string;
  status: string;
  createdAt: Date;
}

const snack = useAppSnackbar();
const emailTemplatesStore = useEmailTemplatesStore();

const detailsDialog = ref(false);
const builderDialog = ref(false);
const loadingTemplates = ref(false);
const campaignSearch = ref("");
const segmentSearch = ref("");
const templateSearch = ref("");
const selectedSegmentId = ref<string | null>(null);
const selectedTemplateId = ref<string | null>(null);
const campaigns = ref<CampaignDraft[]>([]);

const createForm = reactive({
  channel: "email" as CampaignChannel,
  name: "",
  description: "",
});

const channelItems = [
  { title: "Email", value: "email" },
  { title: "WhatsApp", value: "whatsapp" },
] as const;

const campaignHeaders = [
  { title: "Campaign", key: "name", sortable: true },
  { title: "Channel", key: "channel", sortable: true },
  { title: "Segment", key: "segment", sortable: true },
  { title: "Template", key: "template", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Created", key: "createdAt", sortable: true },
] as const;

const segments = ref<CampaignSegment[]>([
  {
    id: "all-users",
    name: "All Users",
    description: "Everyone available in the current questionnaire workspace.",
    contactsLabel: "All",
    source: "System",
  },
  {
    id: "active-users",
    name: "Active Users",
    description: "Users with active accounts and valid contact details.",
    contactsLabel: "Active",
    source: "System",
  },
  {
    id: "pending-invites",
    name: "Pending Invites",
    description: "People who have been invited but have not accepted yet.",
    contactsLabel: "Pending",
    source: "Invite",
  },
  {
    id: "recent-respondents",
    name: "Recent Respondents",
    description: "Users who recently submitted questionnaire responses.",
    contactsLabel: "Recent",
    source: "Reports",
  },
]);

const whatsappTemplates = ref<CampaignTemplate[]>([
  {
    id: "wa-questionnaire-invite",
    channel: "whatsapp",
    name: "Questionnaire Invite",
    description: "Invite users to complete an assigned questionnaire.",
    status: "ready",
    previewHtml: "",
    previewText:
      "Hi {{name}}, you have a new questionnaire from {{organization}}. Please open {{link}} to complete it.",
  },
  {
    id: "wa-submission-reminder",
    channel: "whatsapp",
    name: "Submission Reminder",
    description: "Remind users who have not completed their questionnaire.",
    status: "ready",
    previewHtml: "",
    previewText:
      "Hi {{name}}, this is a reminder to complete your questionnaire. Your response helps us prepare your report.",
  },
  {
    id: "wa-report-ready",
    channel: "whatsapp",
    name: "Report Ready",
    description: "Notify users when their questionnaire report is available.",
    status: "ready",
    previewHtml: "",
    previewText:
      "Hi {{name}}, your report is ready. You can view it here: {{reportUrl}}.",
  },
]);

const summaryCards = computed(() => {
  const email = campaigns.value.filter((item) => item.channel === "email").length;
  const whatsapp = campaigns.value.filter((item) => item.channel === "whatsapp").length;

  return [
    {
      label: "Total Campaigns",
      value: campaigns.value.length,
      caption: "Drafts created in this session",
      icon: "lucide:megaphone",
      color: "primary",
    },
    {
      label: "Email",
      value: email,
      caption: "Email campaigns",
      icon: "lucide:mail",
      color: "info",
    },
    {
      label: "WhatsApp",
      value: whatsapp,
      caption: "WhatsApp campaigns",
      icon: "lucide:message-circle",
      color: "success",
    },
    {
      label: "Segments",
      value: segments.value.length,
      caption: "Available audience groups",
      icon: "lucide:users",
      color: "warning",
    },
  ];
});

const emailTemplates = computed<CampaignTemplate[]>(() => {
  const rows = emailTemplatesStore.data.rows.flat() as EmailTemplateModel[];

  return rows.map((item) => ({
    id: `email-${item.id}`,
    channel: "email",
    name: item.name || "Untitled email template",
    description: item.description,
    subject: item.subject,
    status: "ready",
    previewHtml: item.contentHtml || buildEmailFallbackHtml(item),
    previewText: item.contentText || item.subject || item.description || item.name,
  }));
});

const activeTemplates = computed(() => {
  return createForm.channel === "email" ? emailTemplates.value : whatsappTemplates.value;
});

const selectedSegment = computed(() => {
  return segments.value.find((item) => item.id === selectedSegmentId.value) || null;
});

const selectedTemplate = computed(() => {
  return activeTemplates.value.find((item) => item.id === selectedTemplateId.value) || null;
});

const filteredSegments = computed(() => {
  return filterItems(segments.value, segmentSearch.value, ["name", "description", "source"]);
});

const filteredTemplates = computed(() => {
  return filterItems(activeTemplates.value, templateSearch.value, ["name", "description", "subject"]);
});

const filteredCampaigns = computed(() => {
  return filterItems(campaigns.value, campaignSearch.value, ["name", "description", "segment", "template", "channel"]);
});

const canContinueToBuilder = computed(() => {
  return createForm.channel && createForm.name.trim().length > 0;
});

const canCreateCampaign = computed(() => {
  return Boolean(selectedSegment.value && selectedTemplate.value && createForm.name.trim());
});

function filterItems<T extends Record<string, any>>(items: T[], query: string, keys: string[]) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;

  return items.filter((item) => {
    return keys.some((key) => String(item[key] ?? "").toLowerCase().includes(normalized));
  });
}

function openCreateDialog() {
  createForm.channel = "email";
  createForm.name = "";
  createForm.description = "";
  resetBuilderSelection();
  detailsDialog.value = true;
}

async function openBuilderDialog() {
  if (!canContinueToBuilder.value) return;

  await ensureTemplatesLoaded();
  detailsDialog.value = false;
  builderDialog.value = true;
}

function backToDetails() {
  builderDialog.value = false;
  detailsDialog.value = true;
}

function resetBuilderSelection() {
  selectedSegmentId.value = null;
  selectedTemplateId.value = null;
  segmentSearch.value = "";
  templateSearch.value = "";
}

async function ensureTemplatesLoaded() {
  if (createForm.channel !== "email" || emailTemplates.value.length > 0) return;

  loadingTemplates.value = true;
  const result = await emailTemplatesStore.fetchAll({ query: "limit=100", reset: true });
  loadingTemplates.value = false;

  if (!result.success) {
    snack.open("Failed to load email templates.", { color: "error" });
  }
}

function createCampaignDraft() {
  if (!selectedSegment.value || !selectedTemplate.value) return;

  campaigns.value.unshift({
    id: `${Date.now()}`,
    name: createForm.name.trim(),
    description: createForm.description.trim(),
    channel: createForm.channel,
    segment: selectedSegment.value.name,
    template: selectedTemplate.value.name,
    status: "draft",
    createdAt: new Date(),
  });

  builderDialog.value = false;
  detailsDialog.value = false;
  snack.open("Campaign draft created.", { color: "success" });
}

function buildEmailFallbackHtml(item: EmailTemplateModel) {
  const subject = item.subject || item.name || "Untitled email";
  const description = item.description || "Template content is not available.";

  return `<div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937"><h2>${escapeHtml(subject)}</h2><p>${escapeHtml(description)}</p></div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function channelIcon(channel?: string) {
  return channel === "whatsapp" ? "lucide:message-circle" : "lucide:mail";
}

function channelColor(channel?: string) {
  return channel === "whatsapp" ? "success" : "info";
}

function channelLabel(channel?: string) {
  return channel === "whatsapp" ? "WhatsApp" : "Email";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
</script>

<style scoped lang="scss">
.sb-campaigns-page {
  .campaign-table-head {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    flex-wrap: wrap;
  }

  .campaign-search {
    max-width: 320px;
    min-width: 240px;
  }

  .campaign-builder-card {
    overflow: hidden;
  }

  .campaign-builder-title {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 24px;
  }

  .campaign-builder-grid {
    display: grid;
    grid-template-columns: minmax(260px, 0.9fr) minmax(300px, 1fr) minmax(360px, 1.25fr);
    min-height: 660px;
  }

  .campaign-builder-panel {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    min-width: 0;
    display: flex;
    flex-direction: column;
    background: rgb(var(--v-theme-surface));

    &:last-child {
      border-right: 0;
    }
  }

  .panel-head {
    padding: 18px 18px 14px;
  }

  .panel-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px 16px;
    overflow: auto;
    max-height: 560px;
  }

  .campaign-select-card {
    padding: 14px;
    cursor: pointer;
    transition: border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease;

    &:hover {
      border-color: rgba(var(--v-theme-primary), 0.42);
      transform: translateY(-1px);
    }

    &.is-selected {
      border-color: rgb(var(--v-theme-primary));
      background: rgba(var(--v-theme-primary), 0.06);
    }
  }

  .preview-panel {
    background:
      radial-gradient(circle at top right, rgba(var(--v-theme-primary), 0.08), transparent 34%),
      rgb(var(--v-theme-surface));
  }

  .preview-empty {
    min-height: 520px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    padding: 32px;
  }

  .preview-content {
    padding: 0 18px 18px;
    overflow: auto;
    max-height: 620px;
  }

  .email-preview-card {
    background: #fff;
    color: #1f2937;
    overflow: hidden;
  }

  .email-preview-body {
    padding: 18px;
    min-height: 420px;
    overflow: auto;
  }

  .whatsapp-preview-card {
    overflow: hidden;
    background: linear-gradient(145deg, #e9f6ef, #f8fafc);
  }

  .whatsapp-device {
    max-width: 360px;
    min-height: 560px;
    margin: 22px auto;
    border-radius: 28px;
    background: #eef7f0;
    border: 10px solid #17211b;
    box-shadow: 0 18px 48px rgba(15, 23, 42, 0.16);
    overflow: hidden;
  }

  .whatsapp-device__bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    color: #fff;
    background: #075e54;
    font-size: 13px;
    font-weight: 700;
  }

  .whatsapp-bubble {
    margin: 22px 16px;
    padding: 14px 16px;
    border-radius: 16px 16px 16px 4px;
    background: #fff;
    color: #17211b;
    line-height: 1.55;
    white-space: pre-wrap;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
  }
}

@media (max-width: 1100px) {
  .sb-campaigns-page {
    .campaign-builder-grid {
      grid-template-columns: 1fr;
    }

    .campaign-builder-panel {
      border-right: 0;
      border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    }

    .panel-list,
    .preview-content {
      max-height: none;
    }
  }
}
</style>
