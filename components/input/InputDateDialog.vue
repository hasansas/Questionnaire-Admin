<template>
  <div>
    <v-text-field
      :label="label"
      :model-value="modelValue ?? ''"
      :rules="computedRules"
      readonly
      :disabled="disabled"
      rounded
      type="text"
      variant="outlined"
      density="comfortable"
      required
      hide-details="auto"
      @click="openDialog"
    >
      <template v-slot:prepend-inner>
        <v-icon icon="lucide:calendar" size="20" class="mx-2" />
      </template>
    </v-text-field>

    <component
      :is="shellComponent"
      v-model="dialog"
      :max-width="!isMobile ? 400 : ''"
    >
      <v-card :rounded="isMobile ? 't-xl b-0' : 'lg'">
        <v-card-title class="text-center font-weight-bold py-8">
          Select Date
        </v-card-title>

        <v-card-text>
          <!-- Year -->
          <v-text-field
            v-model="yearModel"
            label="Year"
            type="number"
            variant="outlined"
            density="comfortable"
            rounded
            hide-details
            class="mb-4"
            :disabled="disabled"
            @keydown="onlyDigitsKeydown"
          />

          <!-- Month -->
          <v-select
            v-model="month"
            :items="months"
            item-title="label"
            item-value="value"
            label="Month"
            variant="outlined"
            density="comfortable"
            rounded
            hide-details
            class="mb-4"
            :disabled="disabled"
          />

          <!-- Day -->
          <v-select
            v-model="day"
            :items="daysInMonth"
            label="Day"
            variant="outlined"
            density="comfortable"
            rounded
            hide-details
            :disabled="disabled"
          />
        </v-card-text>

        <v-card-actions class="px-8 py-6">
          <v-btn
            rounded
            block
            variant="flat"
            color="primary"
            size="large"
            :disabled="disabled"
            @click="handleSubmit"
          >
            Apply
          </v-btn>
        </v-card-actions>
      </v-card>
    </component>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { onlyDigitsKeydown, sanitizeDigits } from "~/utils/input";
import { VDialog, VBottomSheet } from "vuetify/components";

const { isMobile } = useIsMobile();

type DateRule = (v: string | null) => true | string;

const props = defineProps<{
  modelValue?: string | null;
  label?: string;
  /** Extra rules from parent (min age, max age, etc.) */
  rules?: DateRule[];
  /** Add "required" rule automatically */
  required?: boolean;
  /** Disable input + prevent opening picker */
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
}>();

const dialog = ref(false);

const year = ref("");
const month = ref<number | null>(null);
const day = ref<number | null>(null);

const months = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const yearModel = computed({
  get: () => year.value,
  set: (val: string) => {
    year.value = sanitizeDigits(val ?? "", 4);
  },
});

const daysInMonth = computed(() => {
  const y = parseInt(year.value, 10);
  const m = month.value;

  if (!y || !m) return Array.from({ length: 31 }, (_, i) => i + 1);

  const max = new Date(y, m, 0).getDate();
  return Array.from({ length: max }, (_, i) => i + 1);
});

const internalBaseRules: DateRule[] = [
  (v) =>
    !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || "Date format must be YYYY-MM-DD",
  (v) => {
    if (!v) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return true;

    const [yy, mm, dd] = v.split("-").map(Number);
    if (mm < 1 || mm > 12) return "Month must be between 1 and 12";
    if (dd < 1 || dd > 31) return "Day must be between 1 and 31";

    const date = new Date(v);
    if (
      date.getFullYear() !== yy ||
      date.getMonth() + 1 !== mm ||
      date.getDate() !== dd
    ) {
      return "Invalid date value";
    }
    return true;
  },
];

const shellComponent = computed(() =>
  isMobile.value ? VBottomSheet : VDialog
);

watch([year, month], () => {
  const max = daysInMonth.value.length;
  if (day.value && day.value > max) day.value = max;
});

// Close dialog if disabled becomes true while open
watch(
  () => props.disabled,
  (v) => {
    if (v) dialog.value = false;
  }
);

const openDialog = () => {
  if (props.disabled) return;

  if (props.modelValue) {
    const parts = props.modelValue.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts;
      year.value = y || "";
      month.value = m ? Number(m) : null;
      day.value = d ? Number(d) : null;
    }
  } else {
    year.value = "";
    month.value = null;
    day.value = null;
  }

  dialog.value = true;
};

const handleSubmit = () => {
  if (props.disabled) return;

  const y = parseInt(year.value, 10);
  if (!y || !month.value || !day.value) {
    dialog.value = false;
    return;
  }

  const formatted = [
    y.toString().padStart(4, "0"),
    String(month.value).padStart(2, "0"),
    String(day.value).padStart(2, "0"),
  ].join("-");

  emit("update:modelValue", formatted);
  dialog.value = false;
};

const computedRules = computed<DateRule[]>(() => {
  const base: DateRule[] = [];

  if (props.required) base.push((v) => !!v || "Date of birth is required");
  base.push(...internalBaseRules);

  if (props.rules?.length) base.push(...props.rules);

  return base;
});
</script>

<style lang="scss" scoped>
:deep(.select-center) {
  .v-field__input {
    text-align: center !important;
  }
  .v-select__selection {
    width: 100% !important;
  }
  .v-select__selection-text {
    text-align: center !important;
    width: 100%;
  }
}
</style>
