<
<template>
  <div class="sb-Organization">
    <!-- @vue-generic {import('~/models/orgUser').OrgUserModel} -->
    <SbResourceTableCard
      :key="tableKey"
      ref="tableRef"
      page-title="Organization Users"
      primary-text="Invite User"
      primary-icon="lucide:plus"
      :store="orgUserStore"
      :columns="columns"
      search-placeholder="Search email, name"
      empty-icon="lucide:ticket-percent"
      empty-title="No users found"
      empty-subtitle="Create your first user."
      empty-primary-text="Add User"
      :build-query="buildQuery"
      :delete-action="handleDelete"
      delete-title="Delete user?"
      :delete-label="(u) => u.user?.name ?? u.metaJson?.sendTo ?? '-'"
      enable-panel
      @primary="openCreate"
    >
      <!-- Columns -->
      <!-- User -->
      <template #item.user="{ item }">
        <div class="d-flex align-center ga-3 min-w-0">
          <v-avatar size="34" rounded="lg" color="primary" variant="tonal">
            <v-img
              v-if="item.user?.image"
              :src="item.user.image"
              :alt="item.user?.name || item.user?.email"
              cover
            />
            <v-icon v-else icon="lucide:user" size="18" />
          </v-avatar>

          <div class="min-w-0">
            <div class="text-body-2 font-weight-bold text-truncate">
              {{ item.user?.name || item.metaJson?.sendTo || "-" }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ item.user?.email || item.metaJson?.sendTo || "-" }}
            </div>
          </div>

          <v-tooltip
            v-if="item.user && item.user.isEmailVerified === false"
            location="top"
          >
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                size="x-small"
                variant="tonal"
                color="warning"
                class="sb-chip"
              >
                <v-icon icon="lucide:mail-warning" size="14" class="me-1" />
                Unverified
              </v-chip>
            </template>
            Email is not verified.
          </v-tooltip>

          <v-tooltip
            v-if="item.user && item.user.active === false"
            location="top"
          >
            <template #activator="{ props }">
              <v-chip
                v-bind="props"
                size="x-small"
                variant="tonal"
                color="grey"
                class="sb-chip"
              >
                <v-icon icon="lucide:user-x" size="14" class="me-1" />
                Inactive
              </v-chip>
            </template>
            User account is inactive.
          </v-tooltip>
        </div>
      </template>

      <!-- Role -->
      <template #item.role="{ item }">
        <v-chip size="small" variant="tonal" class="sb-chip">
          <v-icon icon="lucide:badge-check" size="16" class="me-1" />
          {{ formatRole(item.role) }}
        </v-chip>
      </template>

      <!-- Status -->
      <template #item.status="{ item }">
        <v-chip
          size="small"
          variant="tonal"
          :color="statusColor(item.status)"
          class="sb-chip"
        >
          <v-icon :icon="statusIcon(item.status)" size="16" class="me-1" />
          {{ item.status || "-" }}
        </v-chip>
      </template>

      <!-- Channel -->
      <template #item.channel="{ item }">
        <div class="d-flex align-center ga-2">
          <v-icon
            :icon="channelIcon(item.metaJson?.channel)"
            size="16"
            class="text-medium-emphasis"
          />
          <span class="text-body-2">{{ item.metaJson?.channel || "-" }}</span>
        </div>
      </template>

      <!-- Invite -->
      <template #item.invite="{ item }">
        <div class="d-flex flex-column py-2">
          <div class="text-body-2">
            <span class="text-medium-emphasis">To:</span>
            <span class="ms-1">{{
              item.metaJson?.sendTo || item.user?.email || "-"
            }}</span>
          </div>

          <div class="text-caption text-medium-emphasis">
            Expires: {{ formatDate(item.metaJson?.tokenExpires) }}
          </div>
          <div>
            <v-chip
              v-if="item.metaJson?.status"
              size="x-small"
              variant="tonal"
              :color="inviteStatusColor(item.metaJson.status)"
              class="sb-chip mt-1"
            >
              <v-icon
                :icon="inviteStatusIcon(item.metaJson.status)"
                size="14"
                class="me-1"
              />
              {{ item.metaJson.status }}
            </v-chip>
          </div>
        </div>
      </template>

      <!-- Inviter -->
      <template #item.inviter="{ item }">
        <div class="min-w-0">
          <div class="text-body-2 font-weight-medium text-truncate">
            {{ item.inviter?.name || "-" }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ item.inviter?.email || "-" }}
          </div>
        </div>
      </template>

      <!-- Created/Updated -->
      <template #item.createdAt="{ item }">
        <span class="text-body-2">{{ formatDateLabel(item.createdAt) }}</span>
      </template>
      <template #item.updatedAt="{ item }">
        <span class="text-body-2">{{ formatDateLabel(item.updatedAt) }}</span>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end">
          <v-btn icon variant="text" aria-label="More actions">
            <v-icon icon="lucide:more-horizontal" />
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item
                  title="View details"
                  @click="$emit('detail', item)"
                />
                <v-list-item
                  v-if="item.status === 'pending'"
                  title="Resend invite"
                  @click="$emit('resend', item)"
                />
                <v-list-item
                  v-if="item.status === 'pending'"
                  title="Revoke invite"
                  @click="$emit('revoke', item)"
                />
                <v-list-item title="Delete" @click="openDeleteDialog(item)" />
              </v-list>
            </v-menu>
          </v-btn>
        </div>
      </template>

      <!-- Filters -->
      <template #filters="{ draft, set }">
        <v-form @submit.prevent> Coming soon </v-form>
      </template>
    </SbResourceTableCard>

    <!-- Invite User Dialog -->
    <v-dialog v-model="dialogs.userForm" max-width="420" persistent>
      <v-card rounded="xl" class="sb-card">
        <!-- Header -->
        <v-card-title
          class="d-flex align-center justify-space-between py-5 px-6"
        >
          <div class="d-flex align-center ga-3">
            <v-avatar size="34" rounded="lg" color="primary" variant="tonal">
              <v-icon icon="lucide:user-plus" size="18" />
            </v-avatar>

            <div class="min-w-0">
              <div class="text-subtitle-1 font-weight-bold">Invite user</div>
              <div class="text-caption text-medium-emphasis">
                Send an invitation email to grant access.
              </div>
            </div>
          </div>
        </v-card-title>

        <v-divider />

        <!-- Body -->
        <v-card-text class="pa-6">
          <v-form
            ref="inviteFormRef"
            v-model="inviteFormValid"
            @submit.prevent="submitInvite"
          >
            <v-text-field
              v-model="userForm.name"
              :rules="[rules.required, rules.min3]"
              label="Full name"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              class="mb-4"
              :disabled="loadingInvite"
              autocomplete="name"
            >
              <template #prepend-inner>
                <v-icon icon="lucide:user" size="18" class="mx-2" />
              </template>
            </v-text-field>

            <v-text-field
              v-model="userForm.email"
              :rules="[rules.required, rules.email]"
              label="Email address"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              class="mb-4"
              :disabled="loadingInvite"
              autocomplete="email"
            >
              <template #prepend-inner>
                <v-icon icon="lucide:mail" size="18" class="mx-2" />
              </template>
            </v-text-field>

            <v-select
              v-model="userForm.role"
              :rules="[rules.required]"
              :items="roleOptions"
              item-title="name"
              item-value="key"
              label="Role"
              density="comfortable"
              variant="outlined"
              rounded="lg"
              hide-details="auto"
              :disabled="loadingInvite"
            >
              <template #prepend-inner>
                <v-icon icon="lucide:badge-check" size="18" class="mx-2" />
              </template>

              <!-- Nice dropdown rows -->
              <template #item="{ props, item }">
                <v-list-item v-bind="props" density="compact">
                  <template #prepend>
                    <v-avatar
                      size="28"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon :icon="roleIcon(item.raw.key)" size="16" />
                    </v-avatar>
                  </template>
                  <!-- <v-list-item-title class="font-weight-medium">
                    {{ item.raw.name }}
                  </v-list-item-title> -->
                  <v-list-item-subtitle
                    class="text-caption text-medium-emphasis"
                  >
                    {{ item.raw.key }}
                  </v-list-item-subtitle>
                </v-list-item>
              </template>
            </v-select>

            <v-alert
              variant="tonal"
              color="info"
              icon="lucide:info"
              class="mt-4"
              density="compact"
            >
              The invite link will expire automatically after 24 hours.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-divider />

        <!-- Footer -->
        <v-card-actions class="px-6 py-4 d-flex justify-end ga-2">
          <v-btn
            variant="text"
            rounded="lg"
            :disabled="loadingInvite"
            prepend-icon="lucide:x"
            @click="dialogs.userForm = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            variant="flat"
            rounded="lg"
            :loading="loadingInvite"
            prepend-icon="lucide:send"
            @click="submitInvite"
          >
            Send invite
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { type OrgUserModel } from "~/models/orgUser";
import { formatDateLabel } from "~/utils/dateUtils";

const props = withDefaults(
  defineProps<{
    organizationId: string;
  }>(),
  {},
);

const snack = useAppSnackbar();
const orgUserStore = useOrgUserStore(props.organizationId);

const tableKey = ref<number>(0);
const tableRef = ref<any>(null);

/** Table */
// Organization table columns (match Organization payload)
const columns: SbTableColumn<OrgUserModel>[] = [
  { title: "User", key: "user", sortable: false },
  { title: "Role", key: "role", sortable: true },
  { title: "Status", key: "status", sortable: true },
  { title: "Channel", key: "channel", sortable: false },
  { title: "Invite", key: "invite", sortable: false },
  { title: "Invited by", key: "inviter", sortable: false },
  { title: "Created", key: "createdAt", sortable: true },
  { title: "Updated", key: "updatedAt", sortable: true },
  { title: "", key: "actions", sortable: false, align: "end" },
];

function buildQuery({
  search,
  filters,
}: {
  search: string;
  filters: Record<string, any>;
}) {
  const params = new URLSearchParams();

  const limit = Number(orgUserStore.data.pagination?.perPage ?? 10);
  params.set("limit", String(limit));

  const s = search ? String(search).trim() : "";
  if (s) params.set("search", s);

  if (filters?.type) params.set("type", filters.type);
  if (filters?.validity) params.set("validity", filters.validity);
  if (filters?.onlyWithUses) params.set("onlyWithUses", "1");

  const qs = params.toString();
  return qs ? qs : null;
}

async function handleDelete(item: OrgUserModel) {
  const res = await orgUserStore.remove(item.id as string);
  if (!res.success)
    throw new Error(res.error || "Failed to delete organization");
  snack.open("organization deleted", { color: "success" });
}

/** Panel form logic */
const editorMode = ref<"create" | "edit">("create");
const loadingInvite = ref(false);

const selectedId = ref<string | null>(null);
const selectedorganization = ref<OrgUserModel | null>(null);

const editorTitle = computed(() =>
  editorMode.value === "create" ? "Create organization" : "Edit organization",
);

async function openCreate() {
  userForm.name = "";
  userForm.email = "";
  userForm.role = null as OrgUserRole | null;
  dialogs.userForm = true;
}

function openDetail(item: OrgUserModel) {
  void navigateTo(`/organizations/${item.id}`);
}

function openDeleteDialog(item: OrgUserModel) {
  tableRef?.value?.openDeleteDialog?.(item);
}

/** Invite user */
const inviteFormValid = ref(false);
const inviteFormRef = ref<any>(null);

const rules = {
  required: (v: any) => !!v || v === 0 || "This field is required",
  min3: (v: any) =>
    !v || String(v).trim().length >= 3 || "Minimum 3 characters",
  email: (v: any) =>
    !v ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ||
    "Invalid email address",
};

const dialogs = reactive({
  orgForm: false,
  userForm: false,
  confirm: false,
});
const roleOptions = [
  { key: "org_admin", name: "Admin" },
  { key: "org_viewer", name: "Viewer" },
] as const;

function roleIcon(key: string) {
  if (key === "org_admin") return "lucide:shield";
  if (key === "org_viewer") return "lucide:eye";
  return "lucide:badge";
}

type OrgUserRole = "org_viewer" | "org_editor" | "org_admin";
const userForm = reactive({
  name: "",
  email: "",
  role: null as OrgUserRole | null,
});

async function submitInvite() {
  const { valid } = await inviteFormRef.value?.validate?.();
  if (!valid) return;

  loadingInvite.value = true;

  try {
    const payload: Partial<OrgUserModel> = userForm as Partial<OrgUserModel>;

    if (editorMode.value === "create") {
      const res = await orgUserStore.invite(payload as any);
      if (!res.success)
        throw new Error(res.error || "Failed to create organization");
      snack.open("Organization created", { color: "success" });
    } else if (editorMode.value === "edit" && selectedId.value) {
      if (!selectedorganization.value)
        throw new Error("Selected organization is missing for update.");

      const updatePayload = {
        ...selectedorganization.value,
        ...payload,
      } as any;
      const res = await orgUserStore.update(selectedId.value, updatePayload);
      if (!res.success)
        throw new Error(res.error || "Failed to update organization");
      snack.open("Organization updated", { color: "success" });
    }

    selectedId.value = null;
    selectedorganization.value = null;

    dialogs.userForm = false;
    tableRef.value?.refresh?.({ reset: true });
  } catch (e: any) {
    snack.open(e?.message || "Failed to save organization", { color: "error" });
  } finally {
    loadingInvite.value = false;
  }
}

/** Helpers */
function formatDate(v?: string | Date | null) {
  if (!v) return "-";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function formatRole(role?: string) {
  if (!role) return "-";
  return role.replaceAll("_", " ");
}

function statusColor(status?: string) {
  if (status === "active") return "success";
  if (status === "pending") return "warning";
  if (status === "revoked") return "grey";
  if (status === "disabled") return "grey";
  return "grey";
}

function statusIcon(status?: string) {
  if (status === "active") return "lucide:check-circle";
  if (status === "pending") return "lucide:clock";
  if (status === "revoked") return "lucide:ban";
  if (status === "disabled") return "lucide:user-x";
  return "lucide:help-circle";
}

function channelIcon(channel?: string) {
  if (channel === "email") return "lucide:mail";
  if (channel === "whatsapp") return "lucide:message-circle";
  return "lucide:send";
}

function inviteStatusColor(status?: string) {
  if (status === "sent") return "success";
  if (status === "failed") return "red";
  if (status === "queued") return "warning";
  return "grey";
}

function inviteStatusIcon(status?: string) {
  if (status === "sent") return "lucide:check";
  if (status === "failed") return "lucide:x";
  if (status === "queued") return "lucide:clock";
  return "lucide:help-circle";
}

onMounted(() => {
  // Initialize form or fetch data if needed
});
</script>
>
