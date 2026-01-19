<template>
  <div class="sb-page">
    <AdminPageHeader
      title="Dashboard"
      subtitle="A clean operational overview of users, revenue, and reports flow."
    >
      <template #action>
        <div class="d-flex align-center ga-2 flex-wrap justify-end">
          <v-select
            v-model="range"
            :items="rangeItems"
            item-title="title"
            item-value="value"
            density="comfortable"
            variant="outlined"
            rounded="lg"
            hide-details
            class="sb-range"
          />

          <v-btn rounded="lg" variant="outlined" prepend-icon="lucide:plus">
            New Report
          </v-btn>
          <v-btn rounded="lg" color="primary" prepend-icon="lucide:zap">
            Quick Action
          </v-btn>
        </div>
      </template>
    </AdminPageHeader>

    <div class="d-flex flex-column ga-4">
      <!-- KPI -->
      <v-row>
        <v-col v-for="k in kpis" :key="k.key" cols="12" sm="6" lg="3">
          <v-card rounded="xl" class="sb-card pa-4">
            <div class="d-flex align-start justify-space-between ga-3">
              <div class="min-w-0">
                <div class="text-caption text-medium-emphasis">
                  {{ k.label }}
                </div>
                <div class="text-h5 font-weight-black mt-1">
                  {{ k.value }}
                </div>

                <div class="d-flex align-center ga-2 mt-2">
                  <v-chip
                    size="small"
                    :color="k.delta >= 0 ? 'success' : 'error'"
                    variant="tonal"
                    class="sb-chip"
                  >
                    <v-icon
                      :icon="
                        k.delta >= 0
                          ? 'lucide:trending-up'
                          : 'lucide:trending-down'
                      "
                      size="14"
                      class="me-1"
                    />
                    {{ formatPercent(k.delta) }}
                  </v-chip>

                  <div class="text-caption text-medium-emphasis">
                    vs previous {{ rangeLabel.toLowerCase() }}
                  </div>
                </div>
              </div>

              <v-avatar
                size="44"
                rounded="xl"
                :color="k.iconColor"
                variant="tonal"
              >
                <v-icon :icon="k.icon" size="20" />
              </v-avatar>
            </div>

            <div class="mt-4">
              <v-progress-linear
                :model-value="k.progress"
                height="6"
                rounded
                color="primary"
                class="opacity-90"
              />
              <div
                class="d-flex justify-space-between mt-2 text-caption text-medium-emphasis"
              >
                <span>{{ k.noteLeft }}</span>
                <span>{{ k.noteRight }}</span>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Main charts -->
      <v-row>
        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="sb-card">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-2 pa-4 pb-2"
            >
              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-black">
                  Revenue trend
                </div>
                <div class="text-caption text-medium-emphasis">
                  Daily net revenue + orders for {{ rangeLabel.toLowerCase() }}
                </div>
              </div>

              <div class="d-flex align-center ga-2">
                <v-chip size="small" variant="tonal" color="primary">
                  Net: {{ formatCurrency(summary.net) }}
                </v-chip>
                <v-chip size="small" variant="tonal">
                  Orders: {{ formatCompact(summary.orders) }}
                </v-chip>
              </div>
            </div>

            <div class="px-2 pb-4">
              <ClientOnly>
                <ApexChart
                  type="area"
                  height="320"
                  :options="revenueOptions"
                  :series="revenueSeries"
                />
              </ClientOnly>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="sb-card fill-height">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">
                Traffic sources
              </div>
              <div class="text-caption text-medium-emphasis">
                Where users discovered SuperBazi
              </div>
            </div>

            <div class="px-2 pb-4">
              <ClientOnly>
                <ApexChart
                  type="donut"
                  height="320"
                  :options="trafficOptions"
                  :series="trafficSeries"
                />
              </ClientOnly>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Secondary widgets -->
      <v-row>
        <v-col cols="12" lg="5">
          <v-card rounded="xl" class="sb-card">
            <div class="pa-4 pb-2">
              <div class="text-subtitle-1 font-weight-black">New users</div>
              <div class="text-caption text-medium-emphasis">
                Signups and activations
              </div>
            </div>

            <div class="px-2 pb-4">
              <ClientOnly>
                <ApexChart
                  type="bar"
                  height="260"
                  :options="usersOptions"
                  :series="usersSeries"
                />
              </ClientOnly>
            </div>
          </v-card>
        </v-col>

        <!-- NEW: Reports Pipeline -->
        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="sb-card pa-4">
            <div class="d-flex align-start justify-space-between ga-3">
              <div class="min-w-0">
                <div class="text-subtitle-1 font-weight-black">
                  Reports Pipeline
                </div>
                <div class="text-caption text-medium-emphasis">
                  Production stages for {{ rangeLabel.toLowerCase() }}
                </div>
              </div>

              <v-chip size="small" variant="tonal" color="primary">
                Total: {{ pipelineTotal }}
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-column ga-4">
              <div v-for="s in pipelineStages" :key="s.key">
                <div class="d-flex align-center justify-space-between mb-2">
                  <div class="d-flex align-center ga-2">
                    <v-avatar
                      size="34"
                      rounded="lg"
                      :color="s.color"
                      variant="tonal"
                    >
                      <v-icon :icon="s.icon" size="16" />
                    </v-avatar>
                    <div class="min-w-0">
                      <div class="text-body-2 font-weight-bold">
                        {{ s.label }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ s.hint }}
                      </div>
                    </div>
                  </div>

                  <div class="text-body-2 font-weight-bold">
                    {{ s.count }}
                  </div>
                </div>

                <v-progress-linear
                  :model-value="
                    pipelineTotal === 0 ? 0 : (s.count / pipelineTotal) * 100
                  "
                  height="6"
                  rounded
                  color="primary"
                  class="opacity-90"
                />
              </div>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex align-center justify-space-between">
              <div class="text-caption text-medium-emphasis">
                Tip: keep “Queued” low to maintain SLA.
              </div>
              <v-btn
                size="small"
                rounded="lg"
                variant="outlined"
                prepend-icon="lucide:kanban"
              >
                View board
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <!-- Focus & follow-ups -->
        <v-col cols="12" lg="3">
          <v-card rounded="xl" class="sb-card pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-black">Today</div>
                <div class="text-caption text-medium-emphasis">
                  Focus & follow-ups
                </div>
              </div>
              <v-btn icon rounded="lg" variant="text">
                <v-icon icon="lucide:more-horizontal" />
              </v-btn>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-column ga-3">
              <v-card
                v-for="t in tasks"
                :key="t.title"
                rounded="xl"
                variant="tonal"
                class="pa-3"
              >
                <div class="d-flex align-start ga-3">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    :color="t.color"
                    variant="tonal"
                  >
                    <v-icon :icon="t.icon" size="16" />
                  </v-avatar>
                  <div class="min-w-0">
                    <div class="text-body-2 font-weight-bold">
                      {{ t.title }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ t.subtitle }}
                    </div>
                  </div>
                </div>
              </v-card>
            </div>
          </v-card>
        </v-col>

        <!-- NEW: Quick Actions -->
        <!-- <v-col cols="12" lg="3">
          <v-card rounded="xl" class="sb-card pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-black">
                  Quick Actions
                </div>
                <div class="text-caption text-medium-emphasis">
                  Shortcuts for daily ops
                </div>
              </div>
              <v-btn icon rounded="lg" variant="text">
                <v-icon icon="lucide:more-horizontal" />
              </v-btn>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-column ga-2">
              <v-btn
                v-for="a in quickActions"
                :key="a.label"
                :to="a.to"
                rounded="lg"
                variant="outlined"
                class="justify-start"
                :prepend-icon="a.icon"
              >
                <div class="d-flex flex-column align-start">
                  <span class="text-body-2 font-weight-bold">{{
                    a.label
                  }}</span>
                  <span class="text-caption text-medium-emphasis">{{
                    a.hint
                  }}</span>
                </div>
              </v-btn>

              <v-btn
                rounded="lg"
                color="primary"
                variant="flat"
                prepend-icon="lucide:sparkles"
                class="mt-1"
              >
                Generate report now
              </v-btn>
            </div>
          </v-card>
        </v-col> -->

        <!-- <v-col cols="12" lg="4">
          <v-card rounded="xl" class="sb-card pa-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-black">
                  System health
                </div>
                <div class="text-caption text-medium-emphasis">
                  Last 24 hours
                </div>
              </div>
              <v-chip color="success" variant="tonal" size="small">
                <v-icon icon="lucide:shield-check" size="14" class="me-1" />
                Stable
              </v-chip>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    color="primary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:activity" size="16" />
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">API latency</div>
                    <div class="text-caption text-medium-emphasis">
                      p95 response time
                    </div>
                  </div>
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ health.latency }}
                </div>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-avatar
                    size="34"
                    rounded="lg"
                    color="secondary"
                    variant="tonal"
                  >
                    <v-icon icon="lucide:server" size="16" />
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">Error rate</div>
                    <div class="text-caption text-medium-emphasis">
                      last 1 hour
                    </div>
                  </div>
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ health.errorRate }}
                </div>
              </div>

              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-avatar size="34" rounded="lg" color="info" variant="tonal">
                    <v-icon icon="lucide:database" size="16" />
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-bold">
                      DB connections
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      pool usage
                    </div>
                  </div>
                </div>
                <div class="text-body-2 font-weight-bold">
                  {{ health.dbPool }}
                </div>
              </div>
            </div>
          </v-card>
        </v-col> -->
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from "vue";

definePageMeta({
  middleware: ["auth"],
});

const ApexChart = defineAsyncComponent(() => import("vue3-apexcharts"));

// -----------------------
// Range
// -----------------------
type RangeKey = "7d" | "30d" | "90d";

const range = ref<RangeKey>("30d");
const rangeItems = [
  { title: "Last 7 days", value: "7d" },
  { title: "Last 30 days", value: "30d" },
  { title: "Last 90 days", value: "90d" },
];

const rangeLabel = computed(() => {
  if (range.value === "7d") return "Last 7 days";
  if (range.value === "90d") return "Last 90 days";
  return "Last 30 days";
});

// -----------------------
// Mock data (swap later)
// -----------------------
const summary = computed(() => {
  if (range.value === "7d") return { net: 12850000, orders: 412 };
  if (range.value === "90d") return { net: 462900000, orders: 10842 };
  return { net: 185400000, orders: 4320 };
});

const kpis = computed(() => [
  {
    key: "revenue",
    label: "Net revenue",
    value: formatCurrency(summary.value.net),
    delta: 0.128,
    icon: "lucide:banknote",
    iconColor: "success",
    progress: 72,
    noteLeft: "Target",
    noteRight: "72%",
  },
  {
    key: "orders",
    label: "Orders",
    value: formatCompact(summary.value.orders),
    delta: 0.061,
    icon: "lucide:shopping-bag",
    iconColor: "primary",
    progress: 58,
    noteLeft: "Fulfilled",
    noteRight: "58%",
  },
  {
    key: "newUsers",
    label: "New users",
    value:
      range.value === "7d"
        ? "1,248"
        : range.value === "90d"
        ? "18,902"
        : "6,430",
    delta: 0.093,
    icon: "lucide:users",
    iconColor: "info",
    progress: 64,
    noteLeft: "Activated",
    noteRight: "64%",
  },
  {
    key: "conversion",
    label: "Conversion",
    value:
      range.value === "7d" ? "3.4%" : range.value === "90d" ? "2.7%" : "3.1%",
    delta: -0.012,
    icon: "lucide:percent",
    iconColor: "warning",
    progress: 31,
    noteLeft: "Checkout",
    noteRight: "31%",
  },
]);

// -----------------------
// Reports Pipeline (mock)
// -----------------------
const pipelineStages = computed(() => {
  if (range.value === "7d") {
    return [
      {
        key: "queued",
        label: "Queued",
        hint: "Waiting to start",
        count: 12,
        icon: "lucide:clock",
        color: "warning",
      },
      {
        key: "generating",
        label: "Generating",
        hint: "AI producing content",
        count: 6,
        icon: "lucide:cpu",
        color: "primary",
      },
      // {
      //   key: "review",
      //   label: "Review",
      //   hint: "QA / checks",
      //   count: 4,
      //   icon: "lucide:check-circle-2",
      //   color: "info",
      // },
      {
        key: "published",
        label: "Published",
        hint: "Delivered to users",
        count: 28,
        icon: "lucide:rocket",
        color: "success",
      },
    ];
  }

  if (range.value === "90d") {
    return [
      {
        key: "queued",
        label: "Queued",
        hint: "Waiting to start",
        count: 86,
        icon: "lucide:clock",
        color: "warning",
      },
      {
        key: "generating",
        label: "Generating",
        hint: "AI producing content",
        count: 42,
        icon: "lucide:cpu",
        color: "primary",
      },
      {
        key: "review",
        label: "Review",
        hint: "QA / checks",
        count: 31,
        icon: "lucide:check-circle-2",
        color: "info",
      },
      {
        key: "published",
        label: "Published",
        hint: "Delivered to users",
        count: 612,
        icon: "lucide:rocket",
        color: "success",
      },
    ];
  }

  return [
    {
      key: "queued",
      label: "Queued",
      hint: "Waiting to start",
      count: 34,
      icon: "lucide:clock",
      color: "warning",
    },
    {
      key: "generating",
      label: "Generating",
      hint: "AI producing content",
      count: 18,
      icon: "lucide:cpu",
      color: "primary",
    },
    // {
    //   key: "review",
    //   label: "Review",
    //   hint: "QA / checks",
    //   count: 12,
    //   icon: "lucide:check-circle-2",
    //   color: "info",
    // },
    {
      key: "published",
      label: "Published",
      hint: "Delivered to users",
      count: 198,
      icon: "lucide:rocket",
      color: "success",
    },
  ];
});

const pipelineTotal = computed(() =>
  pipelineStages.value.reduce((sum, s) => sum + s.count, 0)
);

// -----------------------
// Quick Actions (routes are placeholders)
// -----------------------
const quickActions = ref([
  {
    label: "Create report",
    hint: "Start a new report run",
    icon: "lucide:file-plus-2",
    to: "/reports/create",
  },
  {
    label: "Manage vouchers",
    hint: "Create / update promotions",
    icon: "lucide:ticket",
    to: "/vouchers",
  },
  {
    label: "Email templates",
    hint: "Edit builder + HTML",
    icon: "lucide:mail",
    to: "/settings/email-template",
  },
  {
    label: "Users",
    hint: "Access & lifecycle status",
    icon: "lucide:users",
    to: "/users",
  },
]);

// -----------------------
// ApexCharts - Revenue area
// -----------------------
const revenueSeries = computed(() => {
  const points =
    range.value === "7d"
      ? [12, 14, 11, 16, 18, 15, 20]
      : range.value === "90d"
      ? [18, 22, 20, 26, 29, 24, 28, 33, 31, 36, 40, 38]
      : [14, 16, 15, 18, 20, 19, 23, 25, 22, 26, 28, 27];

  const orders =
    range.value === "7d"
      ? [48, 55, 50, 62, 66, 60, 72]
      : range.value === "90d"
      ? [210, 240, 230, 260, 280, 270, 300, 320, 310, 340, 360, 355]
      : [120, 140, 135, 160, 170, 165, 180, 200, 190, 210, 220, 215];

  return [
    { name: "Revenue (M)", data: points },
    { name: "Orders", data: orders },
  ];
});

const revenueOptions = computed(() => ({
  chart: {
    type: "area",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "inherit",
  },
  dataLabels: { enabled: false },
  stroke: { curve: "smooth", width: 3 },
  fill: {
    type: "gradient",
    gradient: { shadeIntensity: 0.25, opacityFrom: 0.35, opacityTo: 0.05 },
  },
  grid: { borderColor: "rgba(0,0,0,0.08)", strokeDashArray: 4 },
  legend: {
    position: "top",
    horizontalAlign: "right",
    fontSize: "12px",
    markers: { radius: 10 },
  },
  xaxis: {
    categories:
      range.value === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [
            "W1",
            "W2",
            "W3",
            "W4",
            "W5",
            "W6",
            "W7",
            "W8",
            "W9",
            "W10",
            "W11",
            "W12",
          ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      style: { fontSize: "12px" },
      formatter: (v: number) => `${Math.round(v)}`,
    },
  },
  tooltip: { shared: true, intersect: false },
}));

// -----------------------
// ApexCharts - Traffic donut
// -----------------------
const trafficSeries = computed(() => [44, 26, 18, 12]);

const trafficOptions = computed(() => ({
  chart: { type: "donut", toolbar: { show: false }, fontFamily: "inherit" },
  labels: ["Organic", "Referral", "Social", "Ads"],
  legend: { position: "bottom", fontSize: "12px" },
  stroke: { width: 0 },
  plotOptions: {
    pie: {
      donut: {
        size: "72%",
        labels: {
          show: true,
          total: {
            show: true,
            label: "Total",
            formatter: () => "100%",
          },
        },
      },
    },
  },
  dataLabels: { enabled: false },
}));

// -----------------------
// ApexCharts - Users bar
// -----------------------
const usersSeries = computed(() => [
  {
    name: "Signups",
    data:
      range.value === "7d"
        ? [120, 150, 140, 190, 210, 175, 230]
        : range.value === "90d"
        ? [820, 900, 880, 1040, 1120, 1080, 1200, 1320, 1280, 1420, 1500, 1480]
        : [420, 460, 440, 520, 560, 540, 610, 660, 640, 720, 760, 740],
  },
  {
    name: "Activated",
    data:
      range.value === "7d"
        ? [75, 92, 88, 105, 118, 102, 130]
        : range.value === "90d"
        ? [520, 590, 565, 680, 740, 710, 820, 890, 860, 980, 1050, 1020]
        : [260, 290, 275, 320, 350, 330, 390, 430, 410, 470, 520, 500],
  },
]);

const usersOptions = computed(() => ({
  chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
  plotOptions: {
    bar: { borderRadius: 10, columnWidth: "52%" },
  },
  dataLabels: { enabled: false },
  grid: { borderColor: "rgba(0,0,0,0.08)", strokeDashArray: 4 },
  xaxis: {
    categories:
      range.value === "7d"
        ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        : [
            "W1",
            "W2",
            "W3",
            "W4",
            "W5",
            "W6",
            "W7",
            "W8",
            "W9",
            "W10",
            "W11",
            "W12",
          ],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { fontSize: "12px" } },
  },
  yaxis: { labels: { style: { fontSize: "12px" } } },
  legend: { position: "top", horizontalAlign: "right", fontSize: "12px" },
  tooltip: { shared: true, intersect: false },
}));

// -----------------------
// Health
// -----------------------
const health = ref({
  latency: "248 ms",
  errorRate: "0.18%",
  dbPool: "18 / 50",
});

// -----------------------
// Tasks
// -----------------------
const tasks = ref([
  {
    title: "Review failed payments",
    subtitle: "3 orders need follow-up",
    icon: "lucide:credit-card",
    color: "warning",
  },
  {
    title: "Publish January email blast",
    subtitle: "Template ready to send",
    icon: "lucide:mail",
    color: "primary",
  },
  {
    title: "Voucher usage report",
    subtitle: "Redeems trending up",
    icon: "lucide:ticket",
    color: "success",
  },
]);

// -----------------------
// Helpers
// -----------------------
function formatCurrency(v: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(v);
}

function formatCompact(v: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(v);
}

function formatPercent(v: number) {
  const pct = Math.round(v * 1000) / 10; // 1 decimal
  return `${pct >= 0 ? "+" : ""}${pct}%`;
}
</script>

<style scoped>
.sb-card {
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.sb-range {
  max-width: 190px;
}
</style>
