<!-- /components/sb/SbResourceTableCard.vue -->
<template>
  <v-card rounded="xl" variant="outlined" class="data-table overflow-hidden">
    <v-card-text class="pa-0">
      <!-- Error -->
      <div v-if="state.error" class="pa-10 text-center">
        <v-avatar
          size="56"
          rounded="xl"
          color="error"
          variant="tonal"
          class="mb-4"
        >
          <v-icon icon="lucide:triangle-alert" size="26" />
        </v-avatar>

        <div class="text-h6 font-weight-black mb-1">{{ errorTitle }}</div>
        <div class="text-body-2 text-medium-emphasis mb-5">
          {{ state.errorMessage || fallbackErrorMessage }}
        </div>

        <v-btn
          color="primary"
          rounded="lg"
          prepend-icon="lucide:refresh-cw"
          :loading="state.loading"
          @click="refresh({ reset: true })"
        >
          Retry
        </v-btn>
      </div>

      <!-- Loading (first load) -->
      <div v-else-if="state.loading && !state.loaded" class="pa-4">
        <v-skeleton-loader type="table" />
      </div>

      <!-- Empty -->
      <div v-else-if="isEmpty" class="pa-10 text-center">
        <slot name="empty">
          <v-avatar
            size="56"
            rounded="xl"
            color="primary"
            variant="tonal"
            class="mb-4"
          >
            <v-icon :icon="emptyIcon" size="26" />
          </v-avatar>

          <div class="text-h6 font-weight-black mb-1">{{ emptyTitle }}</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            {{ emptySubtitle }}
          </div>

          <v-btn
            v-if="emptyPrimaryText"
            color="primary"
            rounded="lg"
            prepend-icon="lucide:plus"
            @click="$emit('empty:primary')"
          >
            {{ emptyPrimaryText }}
          </v-btn>
        </slot>
      </div>

      <!-- Data -->
      <v-card v-else variant="flat" class="rounded-0">
        <!-- Head -->
        <div class="d-flex align-center ga-2 pa-3 flex-wrap">
          <slot name="head-left" />

          <v-spacer />

          <div class="d-flex align-center ga-2 flex-wrap">
            <v-form @submit.prevent="onSearchSubmit">
              <v-text-field
                v-model="state.search"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                clearable
                :placeholder="searchPlaceholder"
                class="sb-search-form"
                @click:clear="onSearchClear"
              >
                <template #prepend-inner>
                  <v-icon
                    icon="lucide:search"
                    size="18"
                    class="text-medium-emphasis"
                  />
                </template>
              </v-text-field>
            </v-form>

            <v-btn
              v-if="showFilter"
              rounded="lg"
              variant="outlined"
              color="primary"
              height="40"
              @click="filterDrawer = true"
            >
              <v-icon icon="lucide:sliders-horizontal" size="18" class="me-2" />
              Filters
              <v-chip
                v-if="activeFilterCount > 0"
                size="x-small"
                rounded="lg"
                color="primary"
                variant="tonal"
                class="ms-2 font-weight-bold"
              >
                {{ activeFilterCount }}
              </v-chip>
            </v-btn>

            <slot name="head-right" />
          </div>
        </div>

        <v-divider class="sb-divider" />

        <v-data-table
          :headers="columns"
          :items="items"
          :item-key="itemKey as any"
          class="sb-table"
          :loading="state.loading"
          hide-default-footer
          @click:row="onRowClick"
        >
          <!-- Column templates:
               - consumer can override: #item.<key>
               - we pass our own column meta (NOT vuetify internal header) for stable typing
          -->
          <template
            v-for="col in columns"
            :key="String(col.key)"
            v-slot:[`item.${String(col.key)}`]="slotProps"
          >
            <slot
              :name="`item.${String(col.key)}`"
              :item="slotProps.item as TItem"
              :value="slotProps.value"
              :column="col"
            >
              <SbCellRenderer
                :col="col"
                :item="slotProps.item as TItem"
                :value="slotProps.value"
              />
            </slot>
          </template>

          <!-- Actions column slot -->
          <template v-if="actionsKey" v-slot:[`item.${actionsKey}`]="{ item }">
            <div class="d-flex justify-end ga-2">
              <slot name="actions" :item="item as TItem">
                <v-btn
                  icon
                  variant="tonal"
                  rounded="lg"
                  width="28"
                  height="28"
                  class="pa-0"
                  @click.stop="$emit('edit', item)"
                >
                  <v-icon icon="lucide:pencil" size="14" />
                </v-btn>

                <v-btn
                  v-if="canDelete"
                  icon
                  variant="tonal"
                  rounded="lg"
                  width="28"
                  height="28"
                  class="pa-0"
                  color="error"
                  @click.stop="openDeleteDialog(item)"
                >
                  <v-icon icon="lucide:trash-2" size="14" />
                </v-btn>
              </slot>
            </div>
          </template>
        </v-data-table>

        <v-divider />

        <!-- Footer -->
        <div
          class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4"
        >
          <div class="text-body-2 text-medium-emphasis">
            Total:
            <span class="font-weight-bold">{{ pagination.total }}</span> items
          </div>

          <div class="d-flex align-center ga-3 flex-wrap">
            <div class="d-flex align-center ga-2">
              <div class="text-body-2 text-medium-emphasis">Items per page</div>

              <v-select
                class="sb-perpage"
                :items="perPageOptions"
                density="compact"
                variant="outlined"
                rounded="lg"
                hide-details
                :model-value="pagination.perPage"
                @update:model-value="onPerPageChanged"
              />
            </div>

            <v-pagination
              v-if="(pagination.lastPage ?? 1) > 1"
              :length="pagination.lastPage ?? 1"
              :total-visible="10"
              :model-value="pagination.currentPage"
              size="40"
              rounded="lg"
              @update:model-value="onPageChanged"
            />
          </div>
        </div>
      </v-card>
    </v-card-text>

    <!-- Filters drawer (UI is provided by page via slot; logic lives here) -->
    <ClientOnly>
      <v-navigation-drawer
        v-model="filterDrawer"
        location="right"
        width="420"
        temporary
      >
        <div class="pa-4 d-flex align-center justify-space-between ga-3">
          <div class="text-h6 font-weight-black">Filters</div>
          <v-btn icon variant="text" @click="filterDrawer = false">
            <v-icon icon="lucide:x" />
          </v-btn>
        </div>

        <v-divider />

        <div class="pa-4">
          <slot
            name="filters"
            :draft="filtersDraft"
            :applied="filtersApplied"
            :set="setDraft"
          />
        </div>

        <v-divider />

        <div class="pa-4 d-flex justify-end ga-2">
          <v-btn variant="tonal" rounded="lg" @click="resetFilters"
            >Reset</v-btn
          >
          <v-btn
            color="primary"
            rounded="lg"
            :loading="state.loading"
            @click="applyFilters"
          >
            Apply
          </v-btn>
        </div>
      </v-navigation-drawer>
    </ClientOnly>

    <!-- Delete confirmation dialog -->
    <v-dialog v-model="deleteDialogOpen" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center ga-3">
          <v-avatar size="38" rounded="lg" color="error" variant="tonal">
            <v-icon icon="lucide:trash-2" />
          </v-avatar>
          <div class="min-w-0">
            <div class="text-h6 font-weight-black">{{ deleteTitle }}</div>
            <div class="text-caption text-medium-emphasis">
              This action can’t be undone.
            </div>
          </div>
        </v-card-title>

        <v-card-text class="pt-2">
          <div class="text-body-2">
            You’re about to delete:
            <span class="font-weight-bold">{{
              deleteLabel(deleteTarget)
            }}</span>
          </div>
        </v-card-text>

        <v-divider class="sb-divider" />

        <v-card-actions class="pa-4 d-flex justify-end ga-2">
          <v-btn
            variant="tonal"
            rounded="lg"
            :disabled="deleting"
            @click="deleteDialogOpen = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            rounded="lg"
            prepend-icon="lucide:trash-2"
            :loading="deleting"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup lang="ts" generic="TItem extends Record<string, any>">
import {
  computed,
  defineComponent,
  h,
  reactive,
  ref,
  resolveComponent,
  watch,
} from "vue";

type AnyObj = Record<string, any>;

type ResourceStore<T> = {
  data: {
    rows: T[][];
    pagination: {
      total: number;
      perPage: number;
      currentPage: number;
      lastPage?: number | null;
      nextPage?: number | null;
      prevPage?: number | null;
    };
  };
  fetchAll: (args: {
    page?: number;
    query?: string | null;
    reset?: boolean;
  }) => Promise<{
    success: boolean;
    error?: string;
  }>;
};

type DataTableSlotProps = {
  item: TItem;
  value: any;
  column: SbTableColumn<TItem>;
};

defineSlots<{
  [key: `item.${string}`]: (p: DataTableSlotProps) => any;
  actions?: (p: { item: TItem }) => any;
  filters?: (p: {
    draft: AnyObj;
    applied: AnyObj;
    set: (k: string, v: any) => void;
  }) => any;
  empty?: () => any;
  "head-left"?: () => any;
  "head-right"?: () => any;
}>();

const props = withDefaults(
  defineProps<{
    store: ResourceStore<TItem>;
    columns: SbTableColumn<TItem>[];

    // query building
    buildQuery?: (ctx: { search: string; filters: AnyObj }) => string | null; // returns "a=b&c=d"
    initialFilters?: AnyObj;

    // behavior
    autoFetch?: boolean;
    searchDebounceMs?: number;

    // ui/table
    itemKey?: keyof TItem | string;
    actionsKey?: string | null;
    perPageOptions?: number[];
    showFilter?: boolean;
    searchPlaceholder?: string;

    // empty
    emptyIcon?: string;
    emptyTitle?: string;
    emptySubtitle?: string;
    emptyPrimaryText?: string;

    // error strings
    errorTitle?: string;

    // deletion
    deleteAction?: (item: TItem) => Promise<any>;
    deleteTitle?: string;
    deleteLabelKey?: string;
  }>(),
  {
    autoFetch: true,
    searchDebounceMs: 350,
    itemKey: "id",
    actionsKey: "actions",
    perPageOptions: () => [10, 25, 50, 100],
    showFilter: true,
    searchPlaceholder: "Search",
    emptyIcon: "lucide:inbox",
    emptyTitle: "No data found",
    emptySubtitle: "Try adjusting your search or filters.",
    emptyPrimaryText: "",
    errorTitle: "Couldn’t load data",
    deleteTitle: "Delete item?",
    deleteLabelKey: "code",
  },
);

const emit = defineEmits<{
  (e: "edit", item: TItem): void;
  (e: "loaded"): void;
  (e: "deleted", item: TItem): void;
  (e: "empty:primary"): void;
}>();

const fallbackErrorMessage =
  "Something went wrong while fetching data. Please try again.";

/** Local state */
const state = reactive({
  loading: false,
  loaded: false,
  error: false,
  errorMessage: "",
  search: "",
});

const filterDrawer = ref(false);

/** Filters */
const baseFilters = computed<AnyObj>(() => props.initialFilters ?? {});
const filtersDraft = reactive<AnyObj>({ ...baseFilters.value });
const filtersApplied = reactive<AnyObj>({ ...baseFilters.value });

/** Pagination + items from store */
const pagination = computed(
  () =>
    props.store?.data?.pagination ?? {
      total: 0,
      perPage: 10,
      currentPage: 1,
      lastPage: 1,
    },
);

const items = computed<TItem[]>(() => {
  const rowsPages = props.store?.data?.rows;
  const pageIdx = (pagination.value.currentPage ?? 1) - 1;
  return (rowsPages?.[pageIdx] ?? []) as TItem[];
});

const activeFilterCount = computed(() => {
  const f = filtersApplied;
  let c = 0;
  for (const k of Object.keys(f)) {
    const v = f[k];
    if (Array.isArray(v) && v.length > 0) c++;
    else if (typeof v === "string" && v.trim() !== "") c++;
    else if (typeof v === "number" && !Number.isNaN(v)) c++;
    else if (typeof v === "boolean" && v === true) c++;
    else if (v && typeof v === "object" && Object.keys(v).length > 0) c++;
  }
  return c;
});

const isEmpty = computed(() => {
  const total = Number(pagination.value.total ?? 0);
  const search = state.search ? state.search.trim() : "";
  const hasSearch = search.length > 0;
  const hasFilters = activeFilterCount.value > 0;
  return (
    total === 0 &&
    !state.error &&
    state.loaded &&
    !state.loading &&
    !hasSearch &&
    !hasFilters
  );
});

/** Draft setter */
function setDraft(key: string, value: any) {
  filtersDraft[key] = value;
}

/** Query builder */
function buildQueryString() {
  const fn = props.buildQuery;
  const search = state.search ? state.search.trim() : "";
  if (fn) return fn({ search, filters: { ...filtersApplied } });
  return null;
}

/** Core fetch pattern */
async function fetchPage({
  page = 1,
  reset = false,
}: { page?: number; reset?: boolean } = {}) {
  try {
    state.loading = true;
    state.error = false;
    state.errorMessage = "";

    const query = buildQueryString();
    const res = await props.store.fetchAll({ page, query, reset });

    if (!res.success) throw new Error(res.error || "Failed to fetch data");

    state.loaded = true;
    emit("loaded");
  } catch (e: any) {
    state.error = true;
    state.errorMessage = e?.message || "Failed to fetch data";
  } finally {
    state.loading = false;
  }
}

function refresh({ reset = false }: { reset?: boolean } = {}) {
  fetchPage({ page: 1, reset });
}

function onPageChanged(p: number) {
  fetchPage({ page: p, reset: false });
}

function onPerPageChanged(v: any) {
  const next = Number(v) || 10;
  // If your store supports setPerPage, call it. Otherwise, we reset and re-fetch.
  // NOTE: mutating store.pagination.perPage directly is not ideal; keep this simple for now.
  if (props.store?.data?.pagination)
    (props.store.data.pagination.perPage as any) = next;
  refresh({ reset: true });
}

function onRowClick(_: any, row: { item: any }) {
  emit("edit", row.item as TItem);
}

/** Search (debounced) */
let searchTimer: any = null;

function onSearchSubmit() {
  refresh({ reset: true });
}

function onSearchClear() {
  refresh({ reset: true });
}

watch(
  () => state.search,
  () => {
    if (!props.searchDebounceMs) return;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(
      () => refresh({ reset: true }),
      props.searchDebounceMs,
    );
  },
);

/** Filters */
function applyFilters() {
  Object.assign(filtersApplied, { ...filtersDraft });
  filterDrawer.value = false;
  refresh({ reset: true });
}

function resetFilters() {
  Object.assign(filtersDraft, { ...baseFilters.value });
  Object.assign(filtersApplied, { ...baseFilters.value });
  refresh({ reset: true });
}

/** Initial fetch */
if (props.autoFetch) {
  fetchPage({ page: 1, reset: true });
}

/** Delete logic */
const canDelete = computed(() => typeof props.deleteAction === "function");
const deleteDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const deleting = ref(false);

function deleteLabel(item: any) {
  if (!item) return "";
  const k = props.deleteLabelKey || "code";
  return item?.[k] ?? item?.id ?? "item";
}

function openDeleteDialog(item: any) {
  if (!canDelete.value) return;
  deleteTarget.value = item as TItem;
  deleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!deleteTarget.value || !props.deleteAction) return;
  deleting.value = true;
  try {
    await props.deleteAction(deleteTarget.value as TItem);
    emit("deleted", deleteTarget.value as TItem);
    deleteDialogOpen.value = false;
    deleteTarget.value = null;
    refresh({ reset: true });
  } finally {
    deleting.value = false;
  }
}

/** Built-in cell renderer */
const SbCellRenderer = defineComponent({
  name: "SbCellRenderer",
  props: {
    col: { type: Object as any, required: true },
    item: { type: Object as any, required: true },
    value: { required: false },
  },
  setup(p) {
    const asText = computed(
      () => (p.value ?? p.item?.[p.col.key] ?? "") as any,
    );

    const formatDate = (
      d: any,
      mode: "date" | "datetime",
      locale = "en-US",
    ) => {
      if (!d) return "—";
      const dt = new Date(d);
      if (Number.isNaN(dt.getTime())) return "—";
      const opts: Intl.DateTimeFormatOptions =
        mode === "datetime"
          ? {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }
          : { year: "numeric", month: "short", day: "2-digit" };
      return new Intl.DateTimeFormat(locale, opts).format(dt);
    };

    return () => {
      const col = p.col as SbTableColumn<TItem>;

      if (col.cellType === "chip") {
        const label = col.chip?.label
          ? col.chip.label(p.item as TItem)
          : String(asText.value ?? "");
        const color =
          typeof col.chip?.color === "function"
            ? col.chip.color(p.item as TItem)
            : (col.chip?.color ?? "primary");
        return h(
          resolveComponent("VChip"),
          {
            size: col.chip?.size ?? "small",
            rounded: "lg",
            variant: col.chip?.variant ?? "tonal",
            color,
            class: "font-weight-bold",
          },
          () => label,
        );
      }

      if (col.cellType === "date") {
        const mode = col.date?.format ?? "date";
        const locale = col.date?.locale ?? "en-US";
        return h(
          "span",
          { class: "text-body-2" },
          formatDate(asText.value, mode, locale),
        );
      }

      if (col.cellType === "avatar") {
        const image = col.avatar?.image?.(p.item as TItem) ?? null;
        const text = col.avatar?.text?.(p.item as TItem) ?? "";
        const color =
          typeof col.avatar?.color === "function"
            ? col.avatar.color(p.item as TItem)
            : (col.avatar?.color ?? "primary");

        return h("div", { class: "d-flex align-center ga-2" }, [
          h(
            resolveComponent("VAvatar"),
            {
              size: 30,
              rounded: "lg",
              color,
              variant: "tonal",
              image: image || undefined,
            },
            () =>
              image
                ? null
                : col.avatar?.icon
                  ? h(resolveComponent("VIcon"), { icon: col.avatar.icon })
                  : null,
          ),
          h(
            "span",
            { class: "text-body-2" },
            text || String(asText.value ?? ""),
          ),
        ]);
      }

      return h("span", { class: "text-body-2" }, String(asText.value ?? "—"));
    };
  },
});
</script>

<style scoped lang="scss">
.sb-perpage {
  max-width: 140px;
}
</style>
