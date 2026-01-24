<!-- /components/admin/organizations/OrgDetail.vue -->
<template>
  <div class="pa-6">
    <v-row class="ga-6" align="stretch">
      <!-- LEFT: Profile + status -->
      <v-col cols="12" lg="4">
        <v-card variant="flat" class="sb-card">
          <v-card-text class="pa-6">
            <div class="d-flex align-start justify-space-between ga-4">
              <div class="d-flex align-center ga-4 min-w-0">
                <v-avatar
                  size="56"
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
                  <v-icon v-else icon="lucide:building-2" size="22" />
                </v-avatar>

                <div class="min-w-0">
                  <div class="text-h6 font-weight-black text-truncate">
                    {{ org?.name || "-" }}
                  </div>
                  <div class="text-body-2 text-medium-emphasis text-truncate">
                    {{ org?.code || "-" }}
                  </div>
                </div>
              </div>

              <v-chip
                v-if="org?.status"
                size="small"
                variant="tonal"
                :color="statusColor"
                class="sb-chip"
              >
                <v-icon :icon="statusIcon" size="16" class="me-1" />
                {{ org.status }}
              </v-chip>
            </div>

            <v-divider class="my-5" />

            <div class="d-flex flex-wrap ga-2">
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
            </div>

            <p
              v-if="org?.description"
              class="text-body-2 text-medium-emphasis mt-4 mb-0"
            >
              {{ org.description }}
            </p>

            <v-divider class="my-5" />

            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-start ga-3">
                <v-icon
                  icon="lucide:mail"
                  size="18"
                  class="mt-1 text-medium-emphasis"
                />
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
                <v-icon
                  icon="lucide:phone"
                  size="18"
                  class="mt-1 text-medium-emphasis"
                />
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
                <v-icon
                  icon="lucide:globe"
                  size="18"
                  class="mt-1 text-medium-emphasis"
                />
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
          </v-card-text>
        </v-card>
      </v-col>

      <!-- RIGHT: Details -->
      <v-col cols="12" lg="8">
        <v-row class="ga-6">
          <!-- Location -->
          <v-col cols="12">
            <v-card variant="flat" class="sb-card">
              <v-card-text class="pa-6">
                <div
                  class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
                >
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="28"
                      rounded="lg"
                      color="primary"
                      variant="tonal"
                    >
                      <v-icon icon="lucide:map-pin" size="16" />
                    </v-avatar>
                    <div class="text-subtitle-1 font-weight-bold">Location</div>
                  </div>

                  <v-chip size="small" variant="tonal" class="sb-chip">
                    <v-icon icon="lucide:clock" size="16" class="me-1" />
                    {{ org?.settingsJson?.timezone || "-" }}
                  </v-chip>
                </div>

                <v-row class="ga-4">
                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">Country</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.country?.name || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">State</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.state?.name || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">City</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.city?.name || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">
                      Subdistrict
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.subdistrict || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="8">
                    <div class="text-caption text-medium-emphasis">Address</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.address || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="4">
                    <div class="text-caption text-medium-emphasis">
                      Postal code
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.postalCode || "-" }}
                    </div>
                  </v-col>

                  <v-col cols="12">
                    <div class="d-flex flex-wrap align-center ga-2">
                      <v-chip size="small" variant="tonal" class="sb-chip">
                        <v-icon
                          icon="lucide:locate-fixed"
                          size="16"
                          class="me-1"
                        />
                        {{ org?.settingsJson?.latitude ?? "-" }},
                        {{ org?.settingsJson?.longitude ?? "-" }}
                      </v-chip>

                      <v-chip size="small" variant="tonal" class="sb-chip">
                        <v-icon icon="lucide:hash" size="16" class="me-1" />
                        countryId: {{ org?.countryId ?? "-" }} · stateId:
                        {{ org?.stateId ?? "-" }} · cityId:
                        {{ org?.cityId ?? "-" }}
                      </v-chip>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Settings -->
          <v-col cols="12">
            <v-card variant="flat" class="sb-card">
              <v-card-text class="pa-6">
                <div class="d-flex align-center ga-2 mb-4">
                  <v-avatar
                    size="28"
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:sliders-horizontal" size="16" />
                  </v-avatar>
                  <div class="text-subtitle-1 font-weight-bold">Settings</div>
                </div>

                <v-row class="ga-4">
                  <v-col cols="12" md="6">
                    <div class="d-flex align-center justify-space-between">
                      <div>
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
                            org?.settingsJson?.features
                              ?.requireEmailVerification
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
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="d-flex align-center justify-space-between">
                      <div>
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
                            org?.settingsJson?.features
                              ?.allowPublicQuestionnaires
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
                  </v-col>

                  <v-col cols="12">
                    <div class="text-caption text-medium-emphasis">
                      Internal notes
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ org?.settingsJson?.notes || "-" }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Metadata -->
          <v-col cols="12">
            <v-card variant="flat" class="sb-card">
              <v-card-text class="pa-6">
                <div class="d-flex align-center ga-2 mb-4">
                  <v-avatar
                    size="28"
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:info" size="16" />
                  </v-avatar>
                  <div class="text-subtitle-1 font-weight-bold">Metadata</div>
                </div>

                <v-row class="ga-4">
                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">Created</div>
                    <div class="text-body-2 font-weight-medium">
                      {{ formatDate(org?.createdAt) }}
                    </div>
                  </v-col>

                  <v-col cols="12" md="6">
                    <div class="text-caption text-medium-emphasis">
                      Last updated
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      {{ formatDate(org?.updatedAt) }}
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
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
