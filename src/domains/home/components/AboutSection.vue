<script setup lang="ts">
// About Me section component
defineProps<{
  scrollPosition: number;
}>();
</script>

<template>
  <section class="about-section">
    <v-container>
      <div class="section-header">
        <h2 class="section-title">About Me</h2>
        <div class="section-divider"></div>
        <p class="section-description">
          My journey, philosophy, and approach to software development
        </p>
      </div>

      <v-row class="mt-12">
        <v-col
          cols="12"
          md="6"
          class="about-image-col"
          :style="{ transform: `translateY(${scrollPosition * 0.05}px)` }"
        >
          <div class="about-image">
            <v-img
              src="https://images.unsplash.com/photo-1555952517-2e8e729e0b44?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80"
              height="400"
              width="100%"
              class="rounded-lg elevation-5"
              cover
            ></v-img>

            <div class="about-experience">
              <h3>8+</h3>
              <p>Years of Experience</p>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="6" class="about-content">
          <h3 class="text-h5 mb-4">
            Full-Stack Developer with a passion for creating impactful
            applications
          </h3>

          <p class="text-body-1 mb-4">
            I'm a software engineer with extensive experience in building modern
            web applications. My journey began with a fascination for creating
            elegant solutions to complex problems, and that passion continues to
            drive me today.
          </p>

          <p class="text-body-1 mb-6">
            I specialize in full-stack development with a focus on Vue,
            TypeScript, and Laravel. I believe in writing clean, maintainable
            code and creating intuitive user experiences that make technology
            more accessible and enjoyable for everyone.
          </p>

          <div class="about-features">
            <div class="feature">
              <v-icon color="primary" size="large">mdi-lightning-bolt</v-icon>
              <div>
                <h4>Fast Performance</h4>
                <p>Optimized applications with excellent loading times</p>
              </div>
            </div>

            <div class="feature">
              <v-icon color="primary" size="large">mdi-responsive</v-icon>
              <div>
                <h4>Responsive Design</h4>
                <p>Interfaces that work beautifully on all devices</p>
              </div>
            </div>

            <div class="feature">
              <v-icon color="primary" size="large">mdi-shield-check</v-icon>
              <div>
                <h4>Secure & Reliable</h4>
                <p>Applications built with security and stability in mind</p>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>

<style scoped>
/* Section styling */
.section-header {
  text-align: center;
  max-width: 800px;
  margin: 0 auto 40px;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.section-divider {
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, var(--v-primary-base), #6200ea);
  margin: 0 auto 16px;
  border-radius: 4px;
}

.section-description {
  font-size: 1.1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
}

/* About Section */
.about-section {
  padding: 120px 0;
  background-color: white;
}

.about-image {
  position: relative;
}

.about-experience {
  position: absolute;
  right: -20px;
  bottom: -20px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 140px;
}

.about-experience h3 {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 4px;
}

.about-experience p {
  font-size: 1rem;
  opacity: 0.9;
}

.about-features {
  margin-top: 40px;
}

.feature {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
}

.feature i {
  margin-right: 16px;
}

.feature h4 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.feature p {
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
  .about-section {
    padding: 80px 0;
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .about-section {
    padding: 60px 0;
  }

  .about-experience {
    position: relative;
    right: auto;
    bottom: auto;
    margin-top: 20px;
    display: inline-block;
  }

  .about-image-col {
    margin-bottom: 40px;
  }
}
</style>
