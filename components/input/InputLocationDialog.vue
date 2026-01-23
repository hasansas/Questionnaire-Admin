<!-- components/input/InputLocationDialog.vue -->
<template>
  <div>
    <!-- Readonly text field showing formatted location -->
    <v-text-field
      :label="label"
      :model-value="displayValue"
      readonly
      :disabled="disabled"
      variant="outlined"
      density="comfortable"
      prepend-inner-icon="lucide:map-pin"
      hide-details="auto"
      @click="openDialog"
    />

    <component
      :is="shellComponent"
      v-model="dialog"
      :max-width="!isMobile ? '400' : ''"
    >
      <v-card :rounded="isMobile ? 't-xl b-0' : 'lg'">
        <v-card-title class="text-center font-weight-bold py-8">
          Select Location
        </v-card-title>

        <v-card-text>
          <v-row dense>
            <!-- Country -->
            <v-col cols="12">
              <v-autocomplete
                v-model="selectedCountryId"
                :items="countries"
                item-title="name"
                item-value="id"
                label="Country"
                :loading="loadingCountries"
                :disabled="disabled || loadingCountries"
                variant="outlined"
                density="comfortable"
                rounded
                clearable
                hide-details
                class="mb-4"
              />
            </v-col>

            <!-- State -->
            <v-col cols="12">
              <v-autocomplete
                v-model="selectedStateId"
                :items="states"
                item-title="name"
                item-value="id"
                label="State / Province"
                :loading="loadingStates"
                :disabled="
                  disabled || selectedCountryId == null || loadingStates
                "
                variant="outlined"
                density="comfortable"
                rounded
                hide-details
                clearable
                class="mb-4"
              />
            </v-col>

            <!-- City -->
            <v-col cols="12">
              <v-autocomplete
                v-model="selectedCityId"
                :items="cities"
                item-title="name"
                item-value="id"
                label="City"
                :loading="loadingCities"
                :disabled="disabled || selectedStateId == null || loadingCities"
                variant="outlined"
                density="comfortable"
                rounded
                clearable
                hide-details
                class="mb-4"
              />
            </v-col>

            <!-- Optional: errors -->
            <v-alert
              v-if="countriesError"
              type="error"
              variant="tonal"
              class="mt-2"
            >
              {{ countriesError }}
            </v-alert>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-8 pb-6">
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

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useApiService } from "@/composables/useApiService";
import { VDialog, VBottomSheet } from "vuetify/components";

const { isMobile } = useIsMobile();

interface Country {
  id: number;
  code: string;
  name: string;
}

interface State {
  id: number; // ✅ string -> number
  country_id: number;
  name: string;
}

interface City {
  id: number; // ✅ string -> number
  state_id: number;
  name: string;
}

type LocationChangePayload = {
  country: Country | null;
  state: State | null;
  city: City | null;
};

const props = withDefaults(
  defineProps<{
    modelValue?: string | null; // still formatted string
    label?: string;
    disabled?: boolean;

    /** ✅ initial selected IDs (optional) */
    initialCountryId?: number | null;
    initialStateId?: number | null;
    initialCityId?: number | null;
  }>(),
  {
    modelValue: null,
    label: "Location",
    disabled: false,
    initialCountryId: null,
    initialStateId: null,
    initialCityId: null,
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string | null): void;
  (e: "change", payload: LocationChangePayload): void;
}>();

const api = useApiService();

// dialog
const dialog = ref(false);
const shellComponent = computed(() =>
  isMobile.value ? VBottomSheet : VDialog,
);

// options
const countries = ref<Country[]>([]);
const states = ref<State[]>([]);
const cities = ref<City[]>([]);

// ✅ selected ids (all number now)
const selectedCountryId = ref<number | null>(null);
const selectedStateId = ref<number | null>(null);
const selectedCityId = ref<number | null>(null);

// loading & error
const loadingCountries = ref(false);
const loadingStates = ref(false);
const loadingCities = ref(false);
const countriesError = ref<string | null>(null);

// textfield display
const displayValue = computed(() => props.modelValue ?? "");

// prevent cascading watchers during prefill
const isPrefilling = ref(false);

// --------- selected objects (derived) ----------
const selectedCountry = computed<Country | null>(() => {
  return countries.value.find((c) => c.id === selectedCountryId.value) ?? null;
});

const selectedState = computed<State | null>(() => {
  return states.value.find((s) => s.id === selectedStateId.value) ?? null;
});

const selectedCity = computed<City | null>(() => {
  return cities.value.find((c) => c.id === selectedCityId.value) ?? null;
});

const emitChange = () => {
  emit("change", {
    country: selectedCountry.value,
    state: selectedState.value,
    city: selectedCity.value,
  });
};

// ---------- API helpers ----------
const fetchCountries = async () => {
  loadingCountries.value = true;
  countriesError.value = null;

  try {
    const res = await api.get("/v1/countries?limit=300");

    if (res.success) {
      countries.value = res.data.rows ?? [];
    } else {
      const message = res.error || "Failed to load countries";
      countriesError.value = message;
      countries.value = [];
      console.error("Failed to fetch countries (API error):", message, res);
    }
  } catch (e: any) {
    const message =
      e?.response?.data?.message || e?.message || "Failed to load countries";
    countriesError.value = message;
    countries.value = [];
    console.error("Failed to fetch countries (exception):", e);
  } finally {
    loadingCountries.value = false;
  }
};

const fetchStates = async () => {
  if (selectedCountryId.value == null) {
    states.value = [];
    return;
  }

  loadingStates.value = true;
  try {
    const res = await api.get(
      `/v1/states?countryId=${encodeURIComponent(
        String(selectedCountryId.value),
      )}&limit=500`,
    );

    states.value = res.success ? (res.data.rows ?? []) : [];
    if (!res.success) console.error("Failed to fetch states:", res.error);
  } catch (e) {
    states.value = [];
    console.error("Failed to fetch states (exception):", e);
  } finally {
    loadingStates.value = false;
  }
};

const fetchCities = async () => {
  if (selectedStateId.value == null) {
    cities.value = [];
    return;
  }

  loadingCities.value = true;
  try {
    const res = await api.get(
      `/v1/cities?stateId=${encodeURIComponent(
        String(selectedStateId.value),
      )}&limit=500`,
    );

    cities.value = res.success ? (res.data.rows ?? []) : [];
    if (!res.success) console.error("Failed to fetch cities:", res.error);
  } catch (e) {
    cities.value = [];
    console.error("Failed to fetch cities (exception):", e);
  } finally {
    loadingCities.value = false;
  }
};

// Close dialog if disabled becomes true while open
watch(
  () => props.disabled,
  (v) => {
    if (v) dialog.value = false;
  },
);

// ---------- cascading watchers + emit change ----------
watch(
  () => selectedCountryId.value,
  async () => {
    if (isPrefilling.value) return;

    selectedStateId.value = null;
    selectedCityId.value = null;
    states.value = [];
    cities.value = [];

    emitChange();

    if (selectedCountryId.value != null) {
      await fetchStates();
      emitChange();
    }
  },
);

watch(
  () => selectedStateId.value,
  async () => {
    if (isPrefilling.value) return;

    selectedCityId.value = null;
    cities.value = [];

    emitChange();

    if (selectedStateId.value != null) {
      await fetchCities();
      emitChange();
    }
  },
);

watch(
  () => selectedCityId.value,
  () => {
    if (isPrefilling.value) return;
    emitChange();
  },
);

// ---------- prefill helpers ----------
const resetSelection = () => {
  selectedCountryId.value = null;
  selectedStateId.value = null;
  selectedCityId.value = null;
  states.value = [];
  cities.value = [];
};

const prefillFromInitialIds = async () => {
  resetSelection();

  // validate country exists
  const initCountryId = props.initialCountryId ?? null;
  if (initCountryId == null) return;

  const countryExists = countries.value.some((c) => c.id === initCountryId);
  if (!countryExists) return;

  selectedCountryId.value = initCountryId;
  await fetchStates();

  const initStateId = props.initialStateId ?? null;
  if (initStateId == null) return;

  const stateExists = states.value.some((s) => s.id === initStateId);
  if (!stateExists) return;

  selectedStateId.value = initStateId;
  await fetchCities();

  const initCityId = props.initialCityId ?? null;
  if (initCityId == null) return;

  const cityExists = cities.value.some((c) => c.id === initCityId);
  if (!cityExists) return;

  selectedCityId.value = initCityId;
};

const prefillFromModelValue = async (value: string) => {
  resetSelection();

  // ✅ if IDs provided via props, prioritize them
  const initCountryId = props.initialCountryId ?? null;
  const initStateId = props.initialStateId ?? null;
  const initCityId = props.initialCityId ?? null;

  // Always ensure countries are loaded before this runs (openDialog already does)
  // ---- COUNTRY ----
  if (initCountryId != null) {
    const countryExists = countries.value.some((c) => c.id === initCountryId);
    if (!countryExists) return;

    selectedCountryId.value = initCountryId;
    await fetchStates();
  } else {
    const parts = value.split(",").map((p) => p.trim());
    const [, , countryName] = parts;

    if (!countryName) return;

    const country = countries.value.find(
      (c) => c.name.toLowerCase() === countryName.toLowerCase(),
    );
    if (!country) return;

    selectedCountryId.value = country.id;
    await fetchStates();
  }

  // ---- STATE ----
  if (initStateId != null) {
    const stateExists = states.value.some((s) => s.id === initStateId);
    if (!stateExists) return;

    selectedStateId.value = initStateId;
    await fetchCities();
  } else {
    const parts = value.split(",").map((p) => p.trim());
    const [, stateName] = parts;

    if (!stateName) return;

    const state = states.value.find(
      (s) => s.name.toLowerCase() === stateName.toLowerCase(),
    );
    if (!state) return;

    selectedStateId.value = state.id;
    await fetchCities();
  }

  // ---- CITY ----
  if (initCityId != null) {
    const cityExists = cities.value.some((c) => c.id === initCityId);
    if (!cityExists) return;

    selectedCityId.value = initCityId;
    return;
  } else {
    const parts = value.split(",").map((p) => p.trim());
    const [cityName] = parts;

    if (!cityName) return;

    const city = cities.value.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase(),
    );
    if (city) selectedCityId.value = city.id;
  }
};

// ---------- open dialog & prefill ----------
const openDialog = async () => {
  if (props.disabled) return;

  await fetchCountries();

  isPrefilling.value = true;
  try {
    if (props.modelValue) {
      await prefillFromModelValue(props.modelValue);
    } else {
      await prefillFromInitialIds();
    }
  } finally {
    isPrefilling.value = false;
  }

  emitChange();
  dialog.value = true;
};

// ---------- submit ----------
const handleSubmit = () => {
  if (props.disabled) return;

  const parts = [
    selectedCity.value?.name || null,
    selectedState.value?.name || null,
    selectedCountry.value?.name || null,
  ].filter((x): x is string => !!x);

  const formatted = parts.length ? parts.join(", ") : null;

  emit("update:modelValue", formatted);
  emitChange();

  dialog.value = false;
};
</script>
