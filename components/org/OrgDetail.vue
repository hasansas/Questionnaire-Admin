<!-- /components/admin/organizations/OrgDetail.vue -->
<template>
  <div class="pa-6">
    <v-row>
      <!-- Compact Profile + quick facts -->
      <v-col cols="12" lg="4">
        <v-card variant="outlined" class="sb-card fill-height">
          <v-card-text class="pa-5">
            <!-- header row -->
            <div class="d-flex align-start justify-space-between ga-3">
              <div class="d-flex align-center ga-3 min-w-0">
                <v-avatar
                  size="52"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-img
                    v-if="org?.image"
                    :src="org.image"
                    :alt="org.name"
                    cover
                  />
                  <v-icon v-else icon="lucide:building-2" size="20" />
                </v-avatar>

                <div class="min-w-0">
                  <div
                    class="text-subtitle-1 font-weight-black text-truncate text-capitalize"
                  >
                    {{ org?.name || "-" }}
                  </div>

                  <div class="d-flex align-center flex-wrap ga-2 mt-1">
                    <div
                      class="text-caption text-medium-emphasis text-truncate"
                    >
                      {{ org?.code || "-" }}
                    </div>

                    <v-chip
                      v-if="org?.status"
                      size="x-small"
                      variant="tonal"
                      :color="statusColor"
                      class="sb-chip"
                    >
                      <v-icon :icon="statusIcon" size="14" class="me-1" />
                      {{ org.status }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </div>

            <!-- quick chips -->
            <div class="d-flex flex-wrap ga-2 mt-4">
              <v-chip size="small" variant="tonal" class="sb-chip">
                <v-icon icon="lucide:briefcase" size="16" class="me-1" />
                {{ org?.type || "-" }}
              </v-chip>

              <v-chip size="small" variant="tonal" class="sb-chip">
                <v-icon icon="lucide:tag" size="16" class="me-1" />
                {{ org?.category || "-" }}
              </v-chip>

              <v-chip
                v-if="org?.subCategory"
                size="small"
                variant="tonal"
                class="sb-chip"
              >
                <v-icon icon="lucide:hash" size="16" class="me-1" />
                {{ org.subCategory }}
              </v-chip>

              <v-chip size="small" variant="tonal" class="sb-chip">
                <v-icon icon="lucide:clock" size="16" class="me-1" />
                {{ org?.settingsJson?.timezone || "-" }}
              </v-chip>
            </div>

            <!-- description -->
            <p
              v-if="org?.description"
              class="text-body-2 text-medium-emphasis mt-4 mb-0"
            >
              {{ org.description }}
            </p>

            <v-divider class="my-4" />

            <!-- contact compact list -->
            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-start ga-3">
                <v-avatar
                  size="28"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:mail" size="15" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="text-caption text-medium-emphasis">Email</div>
                  <div class="text-body-2 text-truncate">
                    <a
                      v-if="org?.email"
                      class="sb-link text-decoration-none"
                      :href="`mailto:${org.email}`"
                    >
                      {{ org.email }}
                    </a>
                    <span v-else>-</span>
                  </div>
                </div>
              </div>

              <div class="d-flex align-start ga-3">
                <v-avatar
                  size="28"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:phone" size="15" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="text-caption text-medium-emphasis">Phone</div>
                  <div class="text-body-2 text-truncate">
                    <a
                      v-if="org?.phone"
                      class="sb-link text-decoration-none"
                      :href="`tel:${org.phoneSanitized || org.phone}`"
                    >
                      {{ org.phone }}
                    </a>
                    <span v-else>-</span>
                  </div>
                </div>
              </div>

              <div class="d-flex align-start ga-3">
                <v-avatar
                  size="28"
                  rounded="lg"
                  color="primary"
                  variant="tonal"
                >
                  <v-icon icon="lucide:globe" size="15" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="text-caption text-medium-emphasis">Website</div>
                  <div class="text-body-2 text-truncate">
                    <a
                      v-if="org?.website"
                      class="sb-link text-decoration-none"
                      :href="org.website"
                      target="_blank"
                      rel="noopener"
                    >
                      {{ org.website }}
                    </a>
                    <span v-else>-</span>
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <!-- metadata compact -->
            <div class="d-flex flex-column ga-2">
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">Created</div>
                <div class="text-caption font-weight-medium">
                  {{ formatDate(org?.createdAt) }}
                </div>
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="text-caption text-medium-emphasis">Updated</div>
                <div class="text-caption font-weight-medium">
                  {{ formatDate(org?.updatedAt) }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Location -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="sb-card fill-height">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar rounded="lg" variant="tonal">
                <v-icon icon="lucide:map-pin" size="16" />
              </v-avatar>

              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-bold">Location</div>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  Official address and regional information
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <!-- use list rows instead of many cols (less empty space) -->
            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center justify-space-between ga-3">
                <div class="text-caption text-medium-emphasis">Country</div>
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ org?.country?.name || "-" }}
                </div>
              </div>

              <div class="d-flex align-center justify-space-between ga-3">
                <div class="text-caption text-medium-emphasis">State</div>
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ org?.state?.name || "-" }}
                </div>
              </div>

              <div class="d-flex align-center justify-space-between ga-3">
                <div class="text-caption text-medium-emphasis">City</div>
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ org?.city?.name || "-" }}
                </div>
              </div>

              <div class="d-flex align-center justify-space-between ga-3">
                <div class="text-caption text-medium-emphasis">Subdistrict</div>
                <div class="text-body-2 font-weight-medium text-truncate">
                  {{ org?.subdistrict || "-" }}
                </div>
              </div>

              <div class="d-flex align-start justify-space-between ga-3">
                <div class="text-caption text-medium-emphasis pt-1">
                  Address
                </div>
                <div class="text-body-2 font-weight-medium text-right">
                  {{ org?.address || "-" }}
                  <div class="text-caption text-medium-emphasis mt-1">
                    Postal code: <b>{{ org?.postalCode || "-" }}</b>
                  </div>
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-wrap align-center ga-2">
              <v-chip size="small" variant="tonal" class="sb-chip">
                <v-icon icon="lucide:locate-fixed" size="16" class="me-1" />
                {{ org?.settingsJson?.latitude ?? "-" }},
                {{ org?.settingsJson?.longitude ?? "-" }}
              </v-chip>

              <v-chip size="small" variant="tonal" class="sb-chip">
                <v-icon icon="lucide:hash" size="16" class="me-1" />
                countryId: {{ org?.countryId ?? "-" }} · stateId:
                {{ org?.stateId ?? "-" }} · cityId: {{ org?.cityId ?? "-" }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Settings -->
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="sb-card fill-height">
          <v-card-text class="pa-5">
            <div class="d-flex align-center ga-3 mb-3">
              <v-avatar rounded="lg" variant="tonal">
                <v-icon icon="lucide:sliders-horizontal" size="16" />
              </v-avatar>

              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-bold">Settings</div>
                <div class="text-body-2 text-medium-emphasis mt-1">
                  Official address and regional information
                </div>
              </div>
            </div>

            <v-divider class="my-4" />

            <!-- compact “setting rows” -->
            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="text-body-2 font-weight-bold">
                    Require email verification
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Users must verify email to proceed.
                  </div>
                </div>

                <v-chip
                  size="small"
                  variant="tonal"
                  :color="
                    org?.settingsJson?.features?.requireEmailVerification
                      ? 'success'
                      : 'grey'
                  "
                  class="sb-chip"
                >
                  <v-icon
                    :icon="
                      org?.settingsJson?.features?.requireEmailVerification
                        ? 'lucide:check'
                        : 'lucide:x'
                    "
                    size="16"
                    class="me-1"
                  />
                  {{
                    org?.settingsJson?.features?.requireEmailVerification
                      ? "Enabled"
                      : "Disabled"
                  }}
                </v-chip>
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between ga-3">
                <div class="min-w-0">
                  <div class="text-body-2 font-weight-bold">
                    Allow public questionnaires
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    Allow questionnaires to be accessed publicly.
                  </div>
                </div>

                <v-chip
                  size="small"
                  variant="tonal"
                  :color="
                    org?.settingsJson?.features?.allowPublicQuestionnaires
                      ? 'success'
                      : 'grey'
                  "
                  class="sb-chip"
                >
                  <v-icon
                    :icon="
                      org?.settingsJson?.features?.allowPublicQuestionnaires
                        ? 'lucide:check'
                        : 'lucide:x'
                    "
                    size="16"
                    class="me-1"
                  />
                  {{
                    org?.settingsJson?.features?.allowPublicQuestionnaires
                      ? "Enabled"
                      : "Disabled"
                  }}
                </v-chip>
              </div>

              <v-divider />

              <div>
                <div class="text-caption text-medium-emphasis">
                  Internal notes
                </div>
                <div class="text-body-2 font-weight-medium">
                  {{ org?.settingsJson?.notes || "-" }}
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { type OrganizationModel } from "~/models/organization";

const props = withDefaults(
  defineProps<{
    org: OrganizationModel | null;
    showActions?: boolean;
  }>(),
  {
    showActions: true,
  },
);

const statusColor = computed(() =>
  props.org?.status === "active" ? "success" : "grey",
);
const statusIcon = computed(() =>
  props.org?.status === "active"
    ? "lucide:check-circle"
    : "lucide:pause-circle",
);

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}
</script>

<style scoped lang="scss">
// keep styling in your global sb-card/sb-link/sb-chip tokens (no inline styles here)
</style>
