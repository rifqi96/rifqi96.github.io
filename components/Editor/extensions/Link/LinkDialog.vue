<template>
  <div class="link-dialog-overlay" v-if="show" @click.self="cancel">
    <div class="link-dialog">
      <div class="link-dialog-header">
        <h3>Insert Link</h3>
        <button class="close-button" @click="cancel">×</button>
      </div>
      <div class="link-dialog-body">
        <div class="form-group" v-if="canEditText">
          <label for="linkText">Link Text</label>
          <input
            type="text"
            id="linkText"
            v-model="linkText"
            placeholder="Text to display"
            @keydown.enter="submit"
            ref="textInput"
          />
        </div>
        <div class="form-group">
          <label for="linkUrl">URL</label>
          <input
            type="text"
            id="linkUrl"
            v-model="linkUrl"
            placeholder="https://example.com"
            @keydown.enter="submit"
            ref="urlInput"
          />
        </div>
      </div>
      <div class="link-dialog-footer">
        <div class="actions">
          <button class="cancel-button" @click="cancel">Cancel</button>
          <button class="submit-button" @click="submit" :disabled="!isValid">
            Insert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  initialText: {
    type: String,
    default: "",
  },
  initialUrl: {
    type: String,
    default: "",
  },
  canEditText: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:show", "submit", "cancel"]);

const linkText = ref(props.initialText);
const linkUrl = ref(props.initialUrl);
const textInput = ref<HTMLInputElement | null>(null);
const urlInput = ref<HTMLInputElement | null>(null);

// Watch for prop changes
watch(
  () => props.initialText,
  (newValue) => {
    linkText.value = newValue;
  },
);

watch(
  () => props.initialUrl,
  (newValue) => {
    linkUrl.value = newValue;
  },
);

const isValid = computed(() => {
  if (!props.canEditText) {
    return linkUrl.value.trim() !== "";
  }
  return linkText.value.trim() !== "" && linkUrl.value.trim() !== "";
});

function submit() {
  if (!isValid.value) return;

  // Add https:// if no protocol specified
  if (
    linkUrl.value &&
    !/^https?:\/\//.test(linkUrl.value) &&
    !/^mailto:/.test(linkUrl.value)
  ) {
    linkUrl.value = "https://" + linkUrl.value;
  }

  emit("submit", {
    text: linkText.value.trim(),
    url: linkUrl.value.trim(),
  });
  emit("update:show", false);
}

function cancel() {
  emit("cancel");
  emit("update:show", false);
}

onMounted(() => {
  // Focus the first input field when dialog opens
  if (props.canEditText && textInput.value) {
    textInput.value.focus();
  } else if (urlInput.value) {
    urlInput.value.focus();
  }
});
</script>

<style scoped>
.link-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.link-dialog {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
  overflow: hidden;
  animation: dialog-fade-in 0.2s ease-out;
}

@keyframes dialog-fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.link-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.link-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  color: #888;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  color: #333;
  background-color: #f5f5f5;
}

.link-dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

.link-dialog-footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.actions {
  display: flex;
  gap: 12px;
}

.cancel-button {
  background-color: transparent;
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  color: #555;
}

.cancel-button:hover {
  background-color: #f5f5f5;
}

.submit-button {
  background-color: #2563eb;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.submit-button:hover {
  background-color: #1d4ed8;
}

.submit-button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>
