<script setup lang="ts">
// Contact CTA section component
</script>

<template>
  <section class="contact-section">
    <v-container>
      <div class="contact-content">
        <h2 class="contact-title">Ready to bring your ideas to life?</h2>
        <p class="contact-text">
          Let's work together to build something amazing.
        </p>
        <v-btn
          href="mailto:mail@rifqi.dev"
          color="primary"
          size="x-large"
          class="mt-6"
          >Get in Touch</v-btn
        >
      </div>
    </v-container>
  </section>
</template>

<style scoped>
/* Contact Section */
.contact-section {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--v-primary-base), #4a4a4a);
  color: white;
  text-align: center;
}

.contact-content {
  max-width: 800px;
  margin: 0 auto;
}

.contact-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: rgba(var(--v-theme-on-background), var(--v-high-emphasis-opacity));
}

.contact-text {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 24px;
  color: #666;
}

/* Animation for section */
.section-animation {
  opacity: 0;
  transform: translateY(30px);
  transition:
    opacity 0.8s ease,
    transform 0.8s ease;
}

.section-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Media Queries */
@media (max-width: 960px) {
  .contact-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .contact-section {
    padding: 60px 0;
  }
}
</style>
