<template>
  <v-container fluid class="sb-auth-shell pa-0">
    <v-row no-gutters class="sb-auth-row">
      <!-- LEFT / HERO (Desktop only) -->
      <v-col
        cols="12"
        md="6"
        lg="7"
        class="sb-auth-hero d-none d-md-flex flex-column align-center text-center h-100"
      >
        <!-- Center content -->
        <div
          class="sb-auth-hero-center d-flex align-center justify-center flex-grow-1 w-100"
        >
          <div class="sb-auth-hero-inner">
            <v-chip
              color="white"
              variant="tonal"
              size="small"
              rounded="pill"
              class="font-weight-bold px-3 mb-6"
            >
              <!-- changed: image avatar -> icon -->
              <v-avatar size="20" color="white" class="mr-2">
                <v-icon icon="lucide:clipboard-check" size="16" />
              </v-avatar>
              SB Questioner
            </v-chip>

            <h1 class="sb-auth-hero-title text-white mb-6">
              Ask Better Questions,
              <span class="opacity-60">Get Clearer Answers</span>
            </h1>

            <div class="sb-auth-hero-points mt-8">
              <div class="d-flex ga-3 align-start mb-4 sb-auth-point">
                <v-icon
                  icon="lucide:sparkles"
                  size="18"
                  class="text-white opacity-80 mt-1"
                />
                <div class="text-white opacity-85">
                  <div class="font-weight-bold">Fast setup & publishing</div>
                  <div class="text-caption opacity-80">
                    Create questionnaires quickly with a clean, guided flow.
                  </div>
                </div>
              </div>

              <div class="d-flex ga-3 align-start mb-4 sb-auth-point">
                <v-icon
                  icon="lucide:bar-chart-3"
                  size="18"
                  class="text-white opacity-80 mt-1"
                />
                <div class="text-white opacity-85">
                  <div class="font-weight-bold">
                    Structured scoring & insights
                  </div>
                  <div class="text-caption opacity-80">
                    Track results clearly with consistent rules and
                    reporting-ready data.
                  </div>
                </div>
              </div>

              <div class="d-flex ga-3 align-start sb-auth-point">
                <v-icon
                  icon="lucide:shield-check"
                  size="18"
                  class="text-white opacity-80 mt-1"
                />
                <div class="text-white opacity-85">
                  <div class="font-weight-bold">Secure org-based access</div>
                  <div class="text-caption opacity-80">
                    Protected sessions, role control, and safe admin operations
                    by default.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom (sticks) -->
        <div class="sb-auth-hero-bottom w-100 mt-auto">
          <div class="d-flex justify-center mb-2">
            <v-btn
              icon
              size="small"
              variant="text"
              class="sb-auth-social"
              aria-label="Website"
            >
              <v-icon icon="lucide:globe" size="18" />
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              class="sb-auth-social"
              aria-label="GitHub"
            >
              <v-icon icon="lucide:github" size="18" />
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              class="sb-auth-social"
              aria-label="Twitter/X"
            >
              <v-icon icon="lucide:twitter" size="18" />
            </v-btn>
          </div>

          <p class="text-caption text-white opacity-60 font-weight-medium mb-0">
            &copy; 2026 SB Questioner. All rights reserved.
          </p>
        </div>
      </v-col>

      <!-- RIGHT / FORM -->
      <v-col cols="12" md="6" lg="5" class="sb-auth-panel d-flex align-center">
        <div class="sb-auth-panel-inner w-100">
          <!-- Mobile brand header -->
          <div class="d-flex d-md-none align-center justify-center ga-3 mb-8">
            <!-- changed: image avatar -> icon -->
            <v-avatar size="40" color="primary" class="sb-auth-mobile-logo">
              <v-avatar size="36" color="white">
                <v-icon icon="lucide:clipboard-check" size="20" />
              </v-avatar>
            </v-avatar>

            <div>
              <div class="text-h6 font-weight-black">SB Questioner</div>
              <div class="text-caption text-medium-emphasis">Admin Console</div>
            </div>
          </div>

          <v-card variant="flat" class="sb-auth-card mx-auto" max-width="440">
            <v-card-text class="pa-8 pa-sm-10">
              <header class="mb-8">
                <div class="d-flex align-center ga-3 mb-2">
                  <v-avatar
                    size="34"
                    color="primary"
                    variant="tonal"
                    rounded="lg"
                    class="sb-auth-key"
                  >
                    <v-icon icon="lucide:key-round" size="18" />
                  </v-avatar>

                  <div class="min-w-0">
                    <h2 class="text-h5 font-weight-black text-slate-900 mb-0">
                      Sign in
                    </h2>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      Enter your credentials to continue.
                    </p>
                  </div>
                </div>
              </header>

              <v-form
                ref="loginForm"
                v-model="formValid"
                @submit.prevent="handleLogin"
              >
                <v-text-field
                  v-model="email"
                  label="Email"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  class="mb-4"
                  :rules="[rules.required, rules.email]"
                  hide-details="auto"
                  required
                  :disabled="loading"
                  autocomplete="email"
                >
                  <template #prepend-inner>
                    <v-icon icon="lucide:mail" size="18" class="mx-2" />
                  </template>
                </v-text-field>

                <v-text-field
                  v-model="password"
                  label="Password"
                  :type="showPassword ? 'text' : 'password'"
                  density="comfortable"
                  variant="outlined"
                  rounded="lg"
                  :append-inner-icon="
                    showPassword ? 'lucide:eye' : 'lucide:eye-off'
                  "
                  @click:append-inner="
                    !loading && (showPassword = !showPassword)
                  "
                  class="mb-2"
                  :rules="[rules.required, rules.min(6)]"
                  hide-details="auto"
                  required
                  :disabled="loading"
                  autocomplete="current-password"
                >
                  <template #prepend-inner>
                    <v-icon icon="lucide:lock" size="18" class="mx-2" />
                  </template>
                </v-text-field>

                <div class="d-flex align-center justify-space-between mb-5">
                  <v-checkbox
                    v-model="rememberMe"
                    density="compact"
                    hide-details
                    label="Remember me"
                    :disabled="loading"
                    class="sb-auth-remember"
                  />
                  <NuxtLink
                    to="/auth/forgot-password"
                    class="sb-auth-link text-caption text-decoration-none"
                  >
                    Forgot password?
                  </NuxtLink>
                </div>

                <v-alert
                  v-if="errorMessage"
                  variant="tonal"
                  border="start"
                  icon="lucide:triangle-alert"
                  color="red"
                  class="mb-5"
                >
                  {{ errorMessage }}
                </v-alert>

                <v-btn
                  color="primary"
                  variant="flat"
                  block
                  size="large"
                  type="submit"
                  :loading="loading"
                  class="sb-auth-submit"
                >
                  Sign in to Console
                </v-btn>

                <div class="d-flex align-center ga-3 my-6">
                  <v-divider />
                  <span class="text-caption text-medium-emphasis">
                    Need&nbsp;help?
                  </span>
                  <v-divider />
                </div>

                <div class="d-flex justify-center">
                  <NuxtLink
                    to="/support"
                    class="sb-auth-link text-caption text-decoration-none"
                  >
                    Contact support
                  </NuxtLink>
                </div>
              </v-form>
            </v-card-text>

            <v-divider />

            <v-card-text class="py-4 text-center">
              <p class="text-caption text-medium-emphasis mb-0">
                SB Questioner Admin Console • v1.0
              </p>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/stores/auth";

defineI18nRoute({
  paths: {
    en: "/auth/login",
    id: "/auth/masuk",
  },
});

const snack = useAppSnackbar();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const rememberMe = ref(true);

const loading = ref(false);
const showPassword = ref(false);
const errorMessage = ref<string | null>(null);

const formValid = ref(true);
const loginForm = ref<any>(null); // keeps it simple + stable across Vuetify typings

const rules = {
  required: (v: string) => !!v || "Field is required",
  email: (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email address",
  min: (len: number) => (v: string) =>
    (v && v.length >= len) || `Minimum ${len} characters required`,
};

async function handleLogin() {
  const form = loginForm.value;
  if (!form) return;

  const { valid } = await form.validate();
  if (!valid) return;

  loading.value = true;
  errorMessage.value = null;

  const fetchLogin: ApiResult = await auth.login({
    identifier: email.value,
    password: password.value,
    // rememberMe: rememberMe.value,
  });

  if (!fetchLogin.success) {
    loading.value = false;
    const errorMsg =
      typeof fetchLogin.error === "object"
        ? fetchLogin.error.message || "Login failed."
        : String(fetchLogin.error);

    return snack.open(errorMsg, { color: "error" });
  }

  await navigateTo("/", { replace: true });
}
</script>

<style lang="scss" scoped>
// ===============================
// Auth Shell Layout
// ===============================
.sb-auth-shell {
  height: 100vh;
}

.sb-auth-row {
  height: 100%;
}

// ===============================
// Left Hero Panel
// ===============================
.sb-auth-hero {
  position: relative;
  padding: 64px;
  overflow: hidden;

  /* base */
  background: #2fa942;

  /* IMPORTANT: makes blend modes render predictably */
  isolation: isolate;
}

/* keep content above mesh */
.sb-auth-hero > * {
  position: relative;
  z-index: 2;
}

/* Mesh layers (stronger visibility) */
.sb-auth-hero::before,
.sb-auth-hero::after {
  content: "";
  position: absolute;
  inset: -20%;
  z-index: 1;
  pointer-events: none;

  /* more punch */
  filter: blur(42px) saturate(140%);
  opacity: 1;
}

/* Layer A */
.sb-auth-hero::before {
  background:
    radial-gradient(
      circle at 15% 25%,
      rgba(255, 255, 255, 0.32),
      transparent 45%
    ),
    radial-gradient(circle at 85% 20%, rgba(0, 0, 0, 0.22), transparent 48%),
    radial-gradient(
      circle at 70% 85%,
      rgba(255, 255, 255, 0.22),
      transparent 50%
    ),
    radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.18), transparent 52%);

  animation: sbMeshMoveA 9s ease-in-out infinite;
  mix-blend-mode: soft-light;
}

/* Layer B */
.sb-auth-hero::after {
  background:
    radial-gradient(
      circle at 30% 40%,
      rgba(255, 255, 255, 0.22),
      transparent 48%
    ),
    radial-gradient(circle at 75% 55%, rgba(0, 0, 0, 0.2), transparent 52%),
    radial-gradient(
      circle at 55% 15%,
      rgba(255, 255, 255, 0.18),
      transparent 55%
    ),
    radial-gradient(circle at 10% 55%, rgba(0, 0, 0, 0.16), transparent 58%);

  animation: sbMeshMoveB 12s ease-in-out infinite;
  mix-blend-mode: overlay;
  opacity: 0.85;
}

@keyframes sbMeshMoveA {
  0% {
    transform: translate(-2%, -2%) scale(1.05);
  }
  50% {
    transform: translate(2%, 1%) scale(1.12);
  }
  100% {
    transform: translate(-2%, -2%) scale(1.05);
  }
}

@keyframes sbMeshMoveB {
  0% {
    transform: translate(2%, 0%) scale(1.06);
  }
  50% {
    transform: translate(-2%, 2%) scale(1.14);
  }
  100% {
    transform: translate(2%, 0%) scale(1.06);
  }
}

.sb-auth-hero-top {
  position: relative;
  z-index: 1;
}

.sb-auth-hero-center {
  position: relative;
  z-index: 1;
  max-width: 580px;
  margin: auto;
  text-align: left;
}

.sb-auth-hero-title {
  font-size: clamp(28px, 3vw, 42px);
  line-height: 1.15;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.sb-auth-hero-sub {
  max-width: 520px;
  line-height: 1.65;
}

.sb-auth-hero-bottom {
  position: relative;
  z-index: 1;
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.sb-auth-social {
  color: rgba(255, 255, 255, 0.75);
}

// ===============================
// Right Panel
// ===============================
.sb-auth-panel {
  background: #ffffff;
}

.sb-auth-panel-inner {
  padding: 32px;
}

@media (min-width: 960px) {
  .sb-auth-panel-inner {
    padding: 64px;
  }
}

.sb-auth-key {
  box-shadow: 0 10px 30px rgba(47, 169, 66, 0.18);
}

.sb-auth-remember :deep(.v-label) {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.75);
}

.sb-auth-link {
  color: var(--color-primary);
  font-weight: 700;
}

.sb-auth-remember :deep(.v-label) {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.75);
}

.sb-auth-submit {
  border-radius: 12px;
}
</style>
