<script setup lang="ts">
import {
  userService,
  whitelistService,
} from "@/domains/console/services/supabase";
import { supabaseWhitelist } from "@/domains/auth/services/supabase";
import type { UserProfile } from "@/domains/auth/types";
import type { WhitelistEntry } from "@/domains/auth/types";
import { useAuth } from "@/domains/auth/composables/useAuth";

// Users management page
definePageMeta({
  layout: "console",
  middleware: ["auth"],
  meta: {
    requireRole: "superadmin",
  },
});

// SEO metadata
useHead({
  title: "Manage Users",
  meta: [{ name: "robots", content: "noindex, nofollow" }],
});

// Users state
const users = ref<UserProfile[]>([]);
const whitelistEntries = ref<WhitelistEntry[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const search = ref("");
const activeTab = ref(0);

// User table headers
const userHeaders = [
  { title: "Email", key: "email" },
  { title: "Name", key: "full_name" },
  { title: "Role", key: "role" },
  { title: "Created At", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
];

// Whitelist table headers
const whitelistHeaders = [
  { title: "Email", key: "email" },
  { title: "Added By", key: "added_by" },
  { title: "Added At", key: "created_at" },
  { title: "Actions", key: "actions", sortable: false },
];

// Dialog states
const showRoleDialog = ref(false);
const showAddWhitelistDialog = ref(false);
const selectedUser = ref<UserProfile | null>(null);
const newRole = ref("");
const newWhitelistEmail = ref("");

// Load users and whitelist
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    // Load both users and whitelist concurrently
    const [usersData, whitelistData] = await Promise.all([
      userService.getAllUsers(),
      whitelistService.getAllEntries(),
    ]);

    users.value = usersData;
    whitelistEntries.value = whitelistData;
  } catch (err: any) {
    console.error("Failed to load data:", err);
    error.value = err.message || "Failed to load data";
  } finally {
    loading.value = false;
  }
};

// Add email to whitelist
const addToWhitelist = async () => {
  if (!newWhitelistEmail.value) {
    error.value = "Email is required";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newWhitelistEmail.value)) {
    error.value = "Invalid email format";
    return;
  }

  try {
    loading.value = true;
    const { user } = useAuth();

    // Add to whitelist
    await whitelistService.addEmail(
      newWhitelistEmail.value,
      user.value?.id || "",
    );

    // Reload whitelist data
    const entries = await whitelistService.getAllEntries();
    whitelistEntries.value = entries;

    // Close dialog
    showAddWhitelistDialog.value = false;
    newWhitelistEmail.value = "";
  } catch (err: any) {
    console.error("Failed to add to whitelist:", err);
    error.value = err.message || "Failed to add to whitelist";
  } finally {
    loading.value = false;
  }
};

// Remove email from whitelist
const removeFromWhitelist = async (entry: WhitelistEntry) => {
  if (
    !confirm(
      `Are you sure you want to remove ${entry.email} from the whitelist?`,
    )
  ) {
    return;
  }

  try {
    loading.value = true;
    await whitelistService.removeEntry(entry.id);

    // Update the list
    whitelistEntries.value = whitelistEntries.value.filter(
      (e) => e.id !== entry.id,
    );
  } catch (err: any) {
    console.error("Failed to remove from whitelist:", err);
    error.value = err.message || "Failed to remove from whitelist";
  } finally {
    loading.value = false;
  }
};

// Open the role dialog
const openRoleDialog = (user: UserProfile) => {
  selectedUser.value = user;
  newRole.value = user.role;
  showRoleDialog.value = true;
};

// Update user role
const updateRole = async () => {
  if (!selectedUser.value) return;

  try {
    loading.value = true;
    const updatedUser = await userService.updateUserRole(
      selectedUser.value.id,
      newRole.value,
    );

    // Update the user in the list
    const index = users.value.findIndex((u) => u.id === selectedUser.value?.id);
    if (index !== -1) {
      users.value[index] = updatedUser;
    }

    // Close dialog
    showRoleDialog.value = false;
    selectedUser.value = null;
  } catch (err: any) {
    console.error("Failed to update user role:", err);
    error.value = err.message || "Failed to update user role";
  } finally {
    loading.value = false;
  }
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Check if a user is whitelisted
const isUserWhitelisted = (email: string) => {
  return !!whitelistEntries.value.find((entry) => entry.email === email);
};

// Filtered users based on search
const filteredUsers = computed(() => {
  return users.value.filter((user) => {
    const searchLower = search.value.toLowerCase();
    return (
      user.email.toLowerCase().includes(searchLower) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      user.role.toLowerCase().includes(searchLower)
    );
  });
});

// Filtered whitelist entries based on search
const filteredWhitelistEntries = computed(() => {
  return whitelistEntries.value.filter((entry) => {
    const searchLower = search.value.toLowerCase();
    return entry.email.toLowerCase().includes(searchLower);
  });
});

// Load data on mount
onMounted(async () => {
  await loadData();
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <h1 class="text-h4">User & Whitelist Management</h1>
      <v-btn
        color="primary"
        prepend-icon="mdi-refresh"
        @click="loadData"
        :loading="loading"
      >
        Refresh
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" class="mb-6" dismissible>
      {{ error }}
    </v-alert>

    <v-card>
      <v-card-text>
        <v-tabs
          :model-value="activeTab"
          @update:model-value="
            (val) => (activeTab = isNaN(val as number) ? 0 : (val as number))
          "
          class="mb-4"
        >
          <v-tab value="0">Users</v-tab>
          <v-tab value="1">Whitelist</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <!-- Users Tab -->
          <v-window-item value="0">
            <div class="d-flex justify-space-between align-center mb-4">
              <v-text-field
                v-model="search"
                density="comfortable"
                label="Search users"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
                class="mr-4"
              ></v-text-field>
            </div>

            <v-data-table
              :headers="userHeaders"
              :items="filteredUsers"
              :loading="loading"
              class="elevation-1"
            >
              <!-- Role column -->
              <template v-slot:[`item.role`]="{ item }">
                <v-chip
                  :color="item.role === 'superadmin' ? 'error' : 'secondary'"
                  density="comfortable"
                  size="small"
                  class="text-capitalize"
                >
                  {{ item.role }}
                </v-chip>
              </template>

              <!-- Created at column -->
              <template v-slot:[`item.created_at`]="{ item }">
                {{ formatDate(item.created_at) }}
              </template>

              <!-- Actions column -->
              <template v-slot:[`item.actions`]="{ item }">
                <!-- Whitelist status badge -->
                <v-badge
                  :color="isUserWhitelisted(item.email) ? 'success' : 'grey'"
                  :icon="
                    isUserWhitelisted(item.email) ? 'mdi-check' : 'mdi-close'
                  "
                  inline
                  class="mr-2"
                >
                </v-badge>

                <!-- Role edit button -->
                <v-btn
                  variant="text"
                  icon
                  color="primary"
                  size="small"
                  @click="openRoleDialog(item)"
                  title="Edit role"
                >
                  <v-icon icon="mdi-shield-edit"></v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-window-item>

          <!-- Whitelist Tab -->
          <v-window-item value="1">
            <div class="d-flex justify-space-between align-center mb-4">
              <v-text-field
                v-model="search"
                density="comfortable"
                label="Search whitelist"
                prepend-inner-icon="mdi-magnify"
                single-line
                hide-details
                class="mr-4"
              ></v-text-field>

              <v-btn
                color="success"
                prepend-icon="mdi-email-plus"
                @click="showAddWhitelistDialog = true"
              >
                Add Email
              </v-btn>
            </div>

            <v-data-table
              :headers="whitelistHeaders"
              :items="filteredWhitelistEntries"
              :loading="loading"
              class="elevation-1"
            >
              <!-- Added by column -->
              <template v-slot:[`item.added_by`]="{ item }">
                {{ item.added_by || "Unknown" }}
              </template>

              <!-- Created at column -->
              <template v-slot:[`item.created_at`]="{ item }">
                {{ formatDate(item.created_at) }}
              </template>

              <!-- Actions column -->
              <template v-slot:[`item.actions`]="{ item }">
                <v-btn
                  variant="text"
                  icon
                  color="error"
                  size="small"
                  @click="removeFromWhitelist(item)"
                  title="Remove from whitelist"
                >
                  <v-icon icon="mdi-delete"></v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>

    <!-- Role Edit Dialog -->
    <v-dialog v-model="showRoleDialog" max-width="500px">
      <v-card>
        <v-card-title>Edit User Role</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Updating role for user: <strong>{{ selectedUser?.email }}</strong>
          </p>
          <v-select
            v-model="newRole"
            :items="[
              { title: 'Whitelisted User', value: 'whitelisted_user' },
              { title: 'Superadmin', value: 'superadmin' },
            ]"
            label="Select Role"
            variant="outlined"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="error" variant="text" @click="showRoleDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="updateRole" :loading="loading"
            >Save</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add to Whitelist Dialog -->
    <v-dialog v-model="showAddWhitelistDialog" max-width="500px">
      <v-card>
        <v-card-title>Add to Whitelist</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newWhitelistEmail"
            label="Email Address"
            placeholder="example@example.com"
            variant="outlined"
            :rules="[
              (v) => !!v || 'Email is required',
              (v) =>
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email format',
            ]"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            variant="text"
            @click="showAddWhitelistDialog = false"
            >Cancel</v-btn
          >
          <v-btn color="primary" @click="addToWhitelist" :loading="loading"
            >Add</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
