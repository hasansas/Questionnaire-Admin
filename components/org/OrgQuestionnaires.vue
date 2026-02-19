<template>
  <div>
    <!-- @vue-generic {import('~/models/organization-questionnaire').OrganizationQuestionnaireModel} -->
    <SbResourceTableCard
      :key="tableKey"
      ref="tableRef"
      page-title="Questionnaires"
      page-subtitle="Manage assigned questionnaires, share links, and visibility."
      primary-text="Add questionnaire"
      primary-icon="lucide:plus"
      :store="orgQuestionnairesStore"
      :columns="columns"
      search-placeholder="Search code, name"
      empty-icon="lucide:ticket-percent"
      empty-title="No questionnaire found"
      empty-subtitle="Add your first questionnaire."
      empty-primary-text="Add questionnaire"
      :build-query="buildQuery"
      :delete-action="handleDelete"
      delete-title="Remove questionnaire?"
      delete-info="You are about to remove this questionnaire from your organization."
      delete-label="questionnaire.title"
      delete-label-key="questionnaire.code"
      delete-text="Remove"
      enable-panel
      :panel-title="editorTitle"
      @primary="openCreate"
      @edit="openEdit"
      @empty:primary="openCreate"
    >
      <!-- Columns -->
      <template #item.title="{ item }">
        <div class="d-flex align-center ga-3">
          <v-avatar size="36" variant="tonal" rounded="lg" color="primary">
            <v-icon icon="lucide:clipboard-list" size="18" />
          </v-avatar>

          <div class="min-w-0">
            <div class="d-flex align-center ga-2">
              <div class="text-body-2 font-weight-bold text-truncate">
                {{ item.questionnaire.title }}
              </div>

              <v-chip
                v-if="item.questionnaire.status"
                size="x-small"
                variant="tonal"
                :color="statusColor(item.questionnaire.status)"
                class="text-caption"
              >
                {{ item.questionnaire.status }}
              </v-chip>
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ item.questionnaire.code }} • v{{ item.questionnaire.version }}
              •
              {{
                item.questionnaire.language?.toUpperCase?.() ||
                item.questionnaire.language
              }}
            </div>
          </div>
        </div>
      </template>

      <!-- Description -->
      <template #item.description="{ item }">
        <div class="text-body-2">
          {{ item.description || item.description || "-" }}
        </div>
      </template>

      <!-- Links -->
      <template #item.links="{ item }">
        <div class="d-flex flex-column ga-2">
          <div class="d-flex align-center ga-2">
            <div class="text-caption text-medium-emphasis truncate">
              {{ item.isPublic ? item.publicUrl : item.shareUrl }}
            </div>
            <v-spacer />
            <v-btn
              v-if="item.shareUrl"
              icon
              size="x-small"
              variant="text"
              @click="copy(item.shareUrl)"
            >
              <v-icon icon="lucide:copy" />
            </v-btn>
            <v-btn
              v-if="item.shareUrl"
              icon
              size="x-small"
              variant="text"
              :href="item.shareUrl"
              target="_blank"
              rel="noopener"
            >
              <v-icon icon="lucide:external-link" />
            </v-btn>
          </div>
        </div>
      </template>

      <!-- Active -->
      <template #item.isActive="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          class="text-caption px-3"
          :color="item.isActive ? 'success' : 'grey'"
          variant="tonal"
          style="cursor: pointer"
          @click="onToggleActive(item, !item.isActive)"
        >
          <v-icon
            start
            size="14"
            :icon="item.isActive ? 'lucide:check-circle' : 'lucide:x-circle'"
          />
          {{ item.isActive ? "Active" : "Inactive" }}
        </v-chip>
      </template>
    </SbResourceTableCard>

    <OrgQuestionnaireForm
      v-model="dialogForm"
      :organization-id="organizationId"
      :selectedItem="selectedItem"
    />
  </div>
</template>

<script setup lang="ts">
import type { OrganizationQuestionnaireModel } from "~/models/organization-questionnaire";

const props = withDefaults(
  defineProps<{
    organizationId: string;
  }>(),
  {},
);

const snack = useAppSnackbar();
const orgQuestionnairesStore = useOrganizationQuestionnairesStore(
  props.organizationId,
);

const tableKey = ref<number>(0);
const tableRef = ref<any>(null);

/** Table */
// Organization table columns (match Organization payload)
const columns: SbTableColumn<OrganizationQuestionnaireModel>[] = [
  { title: "Questionnaire", key: "title", sortable: false, width: "320px" },
  { title: "Description", key: "description", sortable: false },
  { title: "Links", key: "links", sortable: false, width: "320px" },
  {
    title: "Active",
    key: "isActive",
    sortable: false,
    width: "90px",
    align: "center",
  },
  { title: "", key: "actions", sortable: false, width: "110px", align: "end" },
];

function buildQuery({
  search,
  filters,
}: {
  search: string;
  filters: Record<string, any>;
}) {
  const params = new URLSearchParams();

  const limit = Number(orgQuestionnairesStore.data.pagination?.perPage ?? 10);
  params.set("limit", String(limit));

  const s = String(search ?? "").trim();
  if (s) params.set("search", s);

  if (filters?.type) params.set("type", filters.type);
  if (filters?.validity) params.set("validity", filters.validity);
  if (filters?.onlyWithUses) params.set("onlyWithUses", "1");

  const qs = params.toString();
  return qs ? qs : null;
}

/** Form */
const dialogForm = ref(false);
const editorMode = ref<"create" | "edit">("create");
const saving = ref(false);

const selectedId = ref<string | null>(null);
const selectedItem = ref<OrganizationQuestionnaireModel | null>(null);

const editorTitle = computed(() =>
  editorMode.value === "create"
    ? "Edit Organization Questionnaire"
    : "Assign Questionnaire to Organization",
);

function openCreate() {
  selectedItem.value = null;
  dialogForm.value = true;
}
function openEdit(item: OrganizationQuestionnaireModel) {
  selectedItem.value = item;
  dialogForm.value = true;
}

async function handleDelete(item: OrganizationQuestionnaireModel) {
  const res = await orgQuestionnairesStore.remove(item.id as string);
  if (!res.success)
    throw new Error(res.error || "Failed to delete questionnaire");
  snack.open("questionnaire deleted", { color: "success" });
}

/** Helpers */
function statusColor(s: string) {
  if (s === "published") return "success";
  if (s === "draft") return "warning";
  if (s === "archived") return "grey";
  return "info";
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    snack.open("Copied to clipboard.", { color: "success" });
  } catch (e) {
    snack.open("Copy failed.", { color: "error" });
  }
}

async function onToggleActive(
  row: OrganizationQuestionnaireModel,
  isActive: boolean,
) {
  // toggle active
}
</script>
