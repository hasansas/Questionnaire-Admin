<template>
  <v-container fluid class="pa-0 h-screen overflow-hidden">
    <v-row no-gutters class="h-100">
      <!-- Left Column: Visual Content -->
      <v-col
        cols="12"
        md="6"
        lg="7"
        class="bg-primary d-none d-md-flex flex-column h-100 relative pa-12"
      >
        <div class="d-flex align-center ga-3 mb-auto">
          <v-avatar color="white" size="40" rounded="lg">
            <v-icon icon="lucide:zap" color="primary" size="24" />
          </v-avatar>
          <span class="text-h5 font-weight-black text-white">SuperBazi</span>
        </div>

        <div class="auth-visual-content my-auto">
          <v-chip
            color="white"
            variant="tonal"
            size="small"
            class="mb-6 font-weight-bold"
            prepend-icon="lucide:shield-check"
          >
            Enterprise Grade Security
          </v-chip>

          <h1
            class="text-h2 font-weight-black mb-6 text-white tracking-tight leading-tight"
          >
            Master Your Energy, <br />
            <span class="text-green-lighten-3">Transform Your Life.</span>
          </h1>

          <div class="d-flex flex-column ga-6 mt-8">
            <div
              v-for="(feature, i) in features"
              :key="i"
              class="d-flex align-start ga-4"
            >
              <v-icon
                :icon="feature.icon"
                color="green-lighten-3"
                class="mt-1"
                size="24"
              />
              <div>
                <div class="text-h6 font-weight-bold text-white">
                  {{ feature.title }}
                </div>
                <div class="text-body-1 text-white opacity-70">
                  {{ feature.desc }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <v-card flat class="glass-morphism pa-6 mt-auto" rounded="xl">
          <div class="d-flex align-center ga-4 mb-3">
            <v-avatar size="48" image="https://i.pravatar.cc/150?u=9" />
            <div>
              <div class="text-subtitle-1 font-weight-bold text-white">
                Sarah Jenkins
              </div>
              <div class="text-caption text-white opacity-60">
                Operations Director @ EnergyFlow
              </div>
            </div>
          </div>
          <p class="text-body-2 text-white italic opacity-90 leading-relaxed">
            "SuperBazi has completely revolutionized how we track organizational
            energy. The admin console is intuitive, fast, and remarkably
            powerful."
          </p>
        </v-card>

        <div class="glass-circle-1"></div>
      </v-col>

      <!-- Right Column: Login Form -->
      <v-col
        cols="12"
        md="6"
        lg="5"
        class="d-flex align-center justify-center h-100 bg-white shadow-xl"
      >
        <div
          class="w-100 h-100 d-flex flex-column justify-center pa-8 pa-md-16"
        >
          <v-card flat max-width="420" class="mx-auto w-100 bg-transparent">
            <header class="mb-10">
              <h2 class="text-h4 font-weight-black text-slate-900">Sign in</h2>
              <p class="text-body-1 text-medium-emphasis mt-2">
                Enter your admin credentials to continue.
              </p>
            </header>

            <v-form @submit.prevent="handleLogin">
              <div class="d-flex flex-column ga-5">
                <v-text-field
                  v-model="email"
                  label="Work Email"
                  variant="outlined"
                  rounded="lg"
                  color="primary"
                  density="comfortable"
                  hide-details
                />

                <v-text-field
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Password"
                  variant="outlined"
                  rounded="lg"
                  color="primary"
                  density="comfortable"
                  hide-details
                >
                  <template #append-inner>
                    <v-btn
                      variant="text"
                      icon
                      density="compact"
                      @click="showPassword = !showPassword"
                    >
                      <v-icon
                        :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                        size="18"
                      />
                    </v-btn>
                  </template>
                </v-text-field>

                <div class="d-flex align-center justify-space-between">
                  <v-checkbox
                    v-model="remember"
                    label="Stay logged in"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                  <v-btn
                    variant="plain"
                    class="text-caption font-weight-bold"
                    color="primary"
                    >Forgot?</v-btn
                  >
                </div>

                <v-btn
                  block
                  color="primary"
                  rounded="lg"
                  size="x-large"
                  elevation="0"
                  class="text-none font-weight-bold"
                  :loading="loading"
                  type="submit"
                >
                  Access Dashboard
                </v-btn>
              </div>
            </v-form>

            <footer class="mt-12 pt-8 border-t text-center">
              <div class="d-flex justify-center ga-4 mb-4">
                <v-icon icon="lucide:globe" size="16" class="text-disabled" />
                <v-icon icon="lucide:github" size="16" class="text-disabled" />
                <v-icon icon="lucide:twitter" size="16" class="text-disabled" />
              </div>
              <p class="text-caption text-disabled font-weight-medium">
                &copy; 2026 SuperBazi Inc. All rights reserved.
              </p>
            </footer>
          </v-card>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from "vue";

const email = ref("admin@superbazi.com");
const password = ref("");
const remember = ref(true);
const showPassword = ref(false);
const loading = ref(false);

const features = [
  {
    icon: "lucide:bar-chart-3",
    title: "Real-time Analytics",
    desc: "Track transformation metrics as they happen with sub-second latency.",
  },
  {
    icon: "lucide:users",
    title: "User Governance",
    desc: "Manage permissions and access levels across your entire organization.",
  },
  {
    icon: "lucide:layers",
    title: "Energy Mapping",
    desc: "Visualize energy flow patterns through our proprietary Bazi engine.",
  },
];

const handleLogin = async () => {
  loading.value = true;
  await new Promise((r) => setTimeout(r, 1200));
  loading.value = false;
};
</script>

<style lang="scss" scoped>
.h-screen {
  height: 100vh !important;
}

.glass-morphism {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.leading-tight {
  line-height: 1.1 !important;
}
.leading-relaxed {
  line-height: 1.6 !important;
}

.glass-circle-1 {
  position: absolute;
  top: 20%;
  right: -10%;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.05) 0%,
    rgba(255, 255, 255, 0) 70%
  );
}

/* Shadow for the divider effect */
.shadow-xl {
  box-shadow: -20px 0 50px rgba(0, 0, 0, 0.05) !important;
}

/* Custom transitions */
.v-btn {
  letter-spacing: 0.02em;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.v-btn:active {
  transform: scale(0.98);
}
</style>
