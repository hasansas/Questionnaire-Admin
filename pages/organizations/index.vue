<template>
  <div class="sb-Organization">
    <!-- @vue-generic {import('~/models/organization').OrganizationModel} -->
    <SbResourceTableCard
      :key="tableKey"
      ref="tableRef"
      page-title="Organizations"
      page-subtitle="Manage organizations, access, and questionnaire assignments."
      primary-text="Add Organization"
      primary-icon="lucide:plus"
      :store="organizationsStore"
      :columns="columns"
      search-placeholder="Search code, name"
      empty-icon="lucide:ticket-percent"
      empty-title="No organization found"
      empty-subtitle="Create your first organization."
      empty-primary-text="Add Organization"
      :build-query="buildQuery"
      :delete-action="handleDelete"
      delete-title="Delete organization?"
      delete-label-key="code"
      enable-panel
      :panel-title="editorTitle"
      @primary="openCreate"
      @edit="openEdit"
      @empty:primary="openCreate"
    >
      <!-- Columns -->
      <template #item.org="{ item }">
        <div class="d-flex align-center ga-3">
          <v-avatar size="36" variant="tonal" rounded="lg" color="primary">
            <!-- <v-img v-if="item.image" :src="item.image" cover />
            <v-icon v-else icon="lucide:building-2" size="18" /> -->
            <v-icon icon="lucide:building-2" size="18" />
          </v-avatar>

          <div class="min-w-0">
            <div class="text-body-2 font-weight-bold text-truncate">
              {{ item.name }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ item.website || item.email }}
            </div>
          </div>
        </div>
      </template>

      <template #item.category="{ item }">
        <div class="d-flex flex-wrap ga-2">
          <v-chip size="small" rounded="lg" variant="tonal">
            {{ item.category }}
          </v-chip>
          <v-chip
            v-if="item.subCategory"
            size="small"
            rounded="lg"
            variant="outlined"
            class="text-medium-emphasis"
          >
            {{ item.subCategory }}
          </v-chip>
        </div>
      </template>

      <template #item.type="{ item }">
        <v-chip size="small" rounded="lg" variant="tonal">
          {{ item.type }}
        </v-chip>
      </template>

      <template #item.contact="{ item }">
        <div class="d-flex flex-column">
          <div class="text-body-2 text-truncate">{{ item.email }}</div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{ item.phone || "-" }}
          </div>
        </div>
      </template>

      <template #item.location="{ item }">
        <div class="d-flex flex-column">
          <div class="text-body-2 text-truncate">
            {{ item.country?.name }} • {{ item.state?.name }} •
            {{ item.city?.name }}
          </div>
          <div class="text-caption text-medium-emphasis text-truncate">
            {{
              [item.subdistrict, item.postalCode].filter(Boolean).join(" • ") ||
              "-"
            }}
          </div>
        </div>
      </template>

      <template #item.status="{ item }">
        <v-chip
          size="small"
          rounded="lg"
          :variant="item.status === 'active' ? 'flat' : 'tonal'"
          :color="
            item.status === 'active'
              ? 'success'
              : item.status === 'inactive'
                ? 'warning'
                : 'grey'
          "
        >
          {{ item.status }}
        </v-chip>
      </template>

      <template #item.features="{ item }">
        <div class="d-flex flex-wrap ga-2 justify-end justify-sm-start">
          <v-chip
            size="small"
            rounded="lg"
            variant="tonal"
            :color="
              item.settingsJson?.features?.allowPublicQuestionnaires
                ? 'primary'
                : 'grey'
            "
          >
            Public
          </v-chip>

          <v-chip
            size="small"
            rounded="lg"
            variant="tonal"
            :color="
              item.settingsJson?.features?.requireEmailVerification
                ? 'primary'
                : 'grey'
            "
          >
            Email Verify
          </v-chip>
        </div>
      </template>

      <template #item.updatedAt="{ item }">
        <div class="text-caption text-medium-emphasis">
          {{ formatDateLabel(item.updatedAt) }}
        </div>
      </template>

      <template #actions="{ item }">
        <div class="d-flex justify-end ga-1">
          <v-btn
            icon
            variant="text"
            :to="`/organizations/${item.id}`"
            aria-label="View"
          >
            <v-icon icon="lucide:arrow-right" />
          </v-btn>

          <v-btn icon variant="text" aria-label="More actions">
            <v-icon icon="lucide:more-horizontal" />
            <v-menu activator="parent" location="bottom end">
              <v-list density="compact">
                <v-list-item
                  :to="`/organizations/${item.id}`"
                  title="View details"
                />
                <v-list-item title="Edit (UI)" />
                <v-list-item title="Disable (UI)" />
              </v-list>
            </v-menu>
          </v-btn>
        </div>
      </template>

      <!-- Filters -->
      <template #filters="{ draft, set }">
        <v-form @submit.prevent> Coming soon </v-form>
      </template>

      <!-- Panel content (Create/Edit form) -->
      <template #panel>
        <div class="text-body-2 text-medium-emphasis mb-4">
          Configure organizations, profiles, and settings.
        </div>

        <v-form ref="DataForm" @submit.prevent="onFormSubmit">
          <v-row dense>
            <!-- Basic -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2">Basic</div>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.name"
                label="Organization Name"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.required, rules.min3]"
                prepend-inner-icon="lucide:building-2"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-select
                v-model="form.type"
                label="Type"
                :items="typeOptions"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.required]"
                prepend-inner-icon="lucide:layers"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="form.category"
                label="Category"
                :items="categoryOptions"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.required]"
                prepend-inner-icon="lucide:tag"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.trim="form.subCategory"
                label="Sub Category (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:tags"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model.trim="form.description"
                label="Description (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                auto-grow
                rows="3"
                prepend-inner-icon="lucide:align-left"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <!-- Contact -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2 mt-2">
                Contact
              </div>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.website"
                label="Website (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.urlOptional]"
                prepend-inner-icon="lucide:globe"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.email"
                label="Email"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.email]"
                prepend-inner-icon="lucide:mail"
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.phone"
                label="Phone (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:phone"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <!-- <v-col cols="12">
              <v-text-field
                v-model.trim="form.image"
                label="Logo/Image URL (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                :rules="[rules.urlOptional]"
                prepend-inner-icon="lucide:image"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col> -->

            <!-- Address -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2 mt-2">
                Address
              </div>
            </v-col>

            <v-col cols="12">
              <InputLocationDialog
                :model-value="location"
                :initialCountryId="form.countryId"
                :initialStateId="form.stateId"
                :initialCityId="form.cityId"
                label="Location (optional)"
                @change="setLocation"
                @update:model-value="(val: any) => updateField(val)"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.postalCode"
                label="Postal Code (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:mailbox"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.address"
                label="Address (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:home"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <!-- Settings -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-bold mb-2 mt-2">
                Settings
              </div>
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="form.settingsJson.latitude"
                label="Latitude (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:locate-fixed"
                :rules="[rules.numberOptional]"
                inputmode="decimal"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.number="form.settingsJson.longitude"
                label="Longitude (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:locate-fixed"
                :rules="[rules.numberOptional]"
                inputmode="decimal"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model.trim="form.settingsJson.notes"
                label="Notes (optional)"
                variant="outlined"
                rounded="lg"
                density="comfortable"
                prepend-inner-icon="lucide:sticky-note"
                clearable
                hide-details="auto"
                class="mb-2"
              />
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined" rounded="xl" class="pa-3 h-100">
                <div class="text-body-2 font-weight-bold mb-2">Features</div>

                <v-switch
                  v-model="form.settingsJson.features.allowPublicQuestionnaires"
                  inset
                  color="primary"
                  label="Allow Public Questionnaires"
                  hide-details
                />

                <v-switch
                  v-model="form.settingsJson.features.requireEmailVerification"
                  inset
                  color="primary"
                  label="Require Email Verification"
                  hide-details
                />
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </template>

      <template #panel-actions="{ close }">
        <v-tooltip text="Close" location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              variant="outlined"
              color="grey"
              size="small"
              v-bind="props"
              @click="close"
            >
              <v-icon size="20" icon="lucide:x" />
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip text="Save" location="bottom">
          <template #activator="{ props }">
            <v-btn
              icon
              variant="flat"
              color="primary"
              size="small"
              v-bind="props"
              :loading="saving"
              @click="handleSave(close)"
            >
              <v-icon size="20" icon="lucide:check" />
            </v-btn>
          </template>
        </v-tooltip>
      </template>
    </SbResourceTableCard>
  </div>
</template>

<script setup lang="ts">
import type { SubmitEventPromise } from "vuetify";
import {
  createDefaultOrganization as createDefaultDataForm,
  normalizeOrganization,
  type OrganizationModel,
} from "~/models/organization";
import { formatDateLabel } from "~/utils/dateUtils";

definePageMeta({
  middleware: ["auth"],
  title: "Organizations",
  breadcrumbs: [{ title: "Organizations", disabled: true }],
});

const snack = useAppSnackbar();
const organizationsStore = useOrganizationsStore();

const tableKey = ref<number>(0);
const tableRef = ref<any>(null);

/** Table */
// Organization table columns (match Organization payload)
const columns: SbTableColumn<OrganizationModel>[] = [
  { title: "Organization", key: "org", sortable: true }, // name + code (optional) + logo
  { title: "Category", key: "category", sortable: true }, // category + subCategory
  { title: "Type", key: "type", sortable: true }, // client/partner/internal
  { title: "Contact", key: "contact", sortable: false }, // email + phone
  { title: "Location", key: "location", sortable: false }, // country/state/city/subdistrict/postalCode
  { title: "Status", key: "status", sortable: true }, // active/inactive/archived
  { title: "Features", key: "features", sortable: false }, // allowPublicQuestionnaires, requireEmailVerification
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

  const limit = Number(organizationsStore.data.pagination?.perPage ?? 10);
  params.set("limit", String(limit));

  const s = String(search ?? "").trim();
  if (s) params.set("search", s);

  if (filters?.type) params.set("type", filters.type);
  if (filters?.validity) params.set("validity", filters.validity);
  if (filters?.onlyWithUses) params.set("onlyWithUses", "1");

  const qs = params.toString();
  return qs ? qs : null;
}

async function handleDelete(item: OrganizationModel) {
  const res = await organizationsStore.remove(item.id as string);
  if (!res.success)
    throw new Error(res.error || "Failed to delete organization");
  snack.open("organization deleted", { color: "success" });
}

/** Panel form logic */
const editorMode = ref<"create" | "edit">("create");
const saving = ref(false);

const selectedId = ref<string | null>(null);
const selectedorganization = ref<OrganizationModel | null>(null);

const editorTitle = computed(() =>
  editorMode.value === "create" ? "Create organization" : "Edit organization",
);

function openCreate() {
  handleOpenDataForm("create", null);
}
function openEdit(item: OrganizationModel) {
  handleOpenDataForm("edit", item);
}

/** Data form */
const DataForm = ref<any>(null);
const rules = {
  required: (v: any) => !!v || v === 0 || "This field is required",
  min3: (v: any) =>
    !v || String(v).trim().length >= 3 || "Minimum 3 characters",
  email: (v: any) =>
    !v ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v)) ||
    "Invalid email address",
  int: (v: any) => Number.isInteger(Number(v)) || "Must be an integer",
  digitsOptional: (v: any) => !v || /^\d+$/.test(String(v)) || "Digits only",
  numberOptional: (v: any) =>
    v === null || v === "" || Number.isFinite(Number(v)) || "Must be a number",
  urlOptional: (v: any) => {
    if (!v) return true;
    try {
      // eslint-disable-next-line no-new
      new URL(String(v));
      return true;
    } catch {
      return "Invalid URL";
    }
  },
};

type OrgType = "client" | "partner" | "internal";

type OrgCategory =
  | "university"
  | "company"
  | "school"
  | "government"
  | "community"
  | "other";

const typeOptions: OrgType[] = ["client", "partner", "internal"];
const categoryOptions: OrgCategory[] = [
  "university",
  "company",
  "school",
  "government",
  "community",
  "other",
];

const form = ref({
  id: "" as any,
  name: "" as any,
  type: "" as any,
  category: "" as any,
  subCategory: "" as any,
  email: "" as any,
  phone: "" as any,
  phoneSanitized: "" as any,
  image: "" as any,
  website: "" as any,
  description: "" as any,
  countryId: 0,
  stateId: 0,
  cityId: 0,
  subdistrict: "" as any,
  postalCode: "" as any,
  address: "" as any,
  status: "" as any,
  settingsJson: {
    timezone: "" as any,
    latitude: null as number | null,
    longitude: null as number | null,
    notes: "" as any,
    features: {
      allowPublicQuestionnaires: false,
      requireEmailVerification: false,
    },
  },
});
const location = ref<string | null>(null);

async function handleOpenDataForm(
  mode: "create" | "edit",
  item: OrganizationModel | null,
) {
  editorMode.value = mode;
  selectedId.value = item?.id ?? null;
  selectedorganization.value = item;

  const base = item ?? createDefaultDataForm();
  form.value = normalizeOrganization(base) as any;

  // Set location string (safely access optional nested country/state/city if present)
  const fv: any = form.value;
  const locationCity = fv?.city?.name ? fv.city.name + ", " : "";
  const locationState = fv?.state?.name ? fv.state.name + ", " : "";
  const locationCountry = fv?.country?.name ?? "";
  location.value = locationCity + locationState + locationCountry;

  // location.value = "Salatiga, Jawa Tengah, Indonesia";

  await nextTick();
  if (mode === "edit") DataForm.value?.resetValidation?.();
  else DataForm.value?.reset?.();

  tableRef.value?.openPanel?.();
}

function onFormSubmit(_e: SubmitEventPromise) {
  void handleSave(); // no close here
}

async function handleSave(close?: () => void) {
  const { valid } = await DataForm.value?.validate?.();
  if (!valid) return;

  saving.value = true;

  try {
    const payload: Partial<OrganizationModel> =
      form.value as Partial<OrganizationModel>;

    if (editorMode.value === "create") {
      const res = await organizationsStore.create(payload as any);
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
      const res = await organizationsStore.update(
        selectedId.value,
        updatePayload,
      );
      if (!res.success)
        throw new Error(res.error || "Failed to update organization");
      snack.open("Organization updated", { color: "success" });
    }

    selectedId.value = null;
    selectedorganization.value = null;

    close?.();
    tableRef.value?.refresh?.({ reset: true });
  } catch (e: any) {
    snack.open(e?.message || "Failed to save organization", { color: "error" });
  } finally {
    saving.value = false;
  }
}

/** Helpers */
function setLocation(loc: any) {
  form.value.countryId = loc?.country?.id ?? null;
  form.value.stateId = loc?.state?.id ?? null;
  form.value.cityId = loc?.city?.id ?? null;

  const timezone =
    loc?.country?.timezone ??
    loc?.state?.timezone ??
    loc?.city?.timezone ??
    null;

  // Ensure settingsJson exists before assigning (avoid optional chaining on LHS)
  if (!form.value) return;

  if (!form.value.settingsJson) {
    form.value.settingsJson = {
      timezone: timezone,
      latitude: null,
      longitude: null,
      notes: null,
      features: {
        allowPublicQuestionnaires: false,
        requireEmailVerification: false,
      },
    };
  } else {
    form.value.settingsJson.timezone = timezone;
  }
}

function updateField(value: any) {
  location.value = value;
}

onMounted(() => {
  // Initialize form or fetch data if needed
});
</script>
