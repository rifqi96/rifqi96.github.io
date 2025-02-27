<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import axios from "axios";

// Create refs for sections to track their intersection with viewport
const heroSection = ref(null);
const projectsSection = ref(null);
const aboutSection = ref(null);
const skillsSection = ref(null);
const experienceSection = ref(null);

// Get window dimensions for parallax effect
const windowHeight = ref(window.innerHeight);
const scrollPosition = ref(0);

// For animated counting
const yearsCount = ref(0);
const projectsCount = ref(0);
const experienceYears = 5; // Adjust based on your experience
const completedProjects = 35; // Adjust based on your portfolio

// Work experience data
interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  technologies: string[];
}

interface Project {
  title: string;
  description: string;
  image: string;
  link: string;
  technologies: string[];
  isAvailable: boolean;
}

const workExperience = ref<WorkExperience[]>([]);
const projects = ref<Project[]>([]);

// Function to parse CSV data
const parseCSV = <T,>(text: string): T[] => {
  const lines = text.split("\n");
  const headers = lines[0].split(",").map((header) => header.replace(/"/g, ""));

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      // Handle commas within quotes correctly
      const values: string[] = [];
      let inQuotes = false;
      let currentValue = "";

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(currentValue.replace(/"/g, ""));
          currentValue = "";
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.replace(/"/g, ""));

      // Create object from headers and values
      const entry = {} as any;
      headers.forEach((header, index) => {
        if (header === "technologies") {
          entry[header] = values[index] ? values[index].split(",") : [];
        } else {
          // Try to convert string to number if possible
          const value = values[index] || "";
          const numberValue = Number(value);
          entry[header] =
            !isNaN(numberValue) && value !== "" ? numberValue : value;
        }
      });

      return entry as T;
    });
};

// Load data from CSV files
const loadCSVData = async () => {
  try {
    const workExpResponse = await axios.get("/work-experience.csv");
    const projectsResponse = await axios.get("/projects.csv");

    workExperience.value = parseCSV<WorkExperience>(workExpResponse.data);
    projects.value = parseCSV<Project>(projectsResponse.data);

    // Fallback to hardcoded data if CSV loading fails
    if (workExperience.value.length === 0) {
      console.warn("No work experience data found.");
    }

    if (projects.value.length === 0) {
      console.warn("No projects data found.");
    }
  } catch (error) {
    console.error("Error loading data:", error);
  }
};

// Skills list
const technologies = [
  { name: "Vue.js", level: 95, icon: "mdi-vuejs" },
  { name: "Nuxt.js", level: 90, icon: "mdi-nuxt" },
  { name: "TypeScript", level: 85, icon: "mdi-language-typescript" },
  { name: "JavaScript", level: 90, icon: "mdi-language-javascript" },
  { name: "Laravel", level: 85, icon: "mdi-laravel" },
  { name: "Python", level: 80, icon: "mdi-language-python" },
  { name: "PostgreSQL", level: 80, icon: "mdi-database" },
  { name: "Redis", level: 75, icon: "mdi-database" },
  { name: "AWS", level: 75, icon: "mdi-aws" },
  { name: "Docker", level: 80, icon: "mdi-docker" },
  { name: "DevOps", level: 70, icon: "mdi-cog-refresh" },
  { name: "Full Stack", level: 90, icon: "mdi-layers" },
];

// Update scroll position for parallax effects
const handleScroll = () => {
  scrollPosition.value = window.scrollY;
};

// Update window dimensions
const handleResize = () => {
  windowHeight.value = window.innerHeight;
};

// Set up intersection observer for counting animation
let countersStarted = false;
const startCountingAnimation = () => {
  if (countersStarted) return;
  countersStarted = true;

  // Animate years count
  const yearsInterval = setInterval(() => {
    if (yearsCount.value < experienceYears) {
      yearsCount.value += 1;
    } else {
      clearInterval(yearsInterval);
    }
  }, 200);

  // Animate projects count
  const projectsInterval = setInterval(() => {
    if (projectsCount.value < completedProjects) {
      projectsCount.value += 1;
    } else {
      clearInterval(projectsInterval);
    }
  }, 20);
};

// Initialize intersection observers
onMounted(async () => {
  document.title = "Rifqi Ruhyattamam | Software Engineer";

  // Load data from CSV files
  await loadCSVData();

  // Set up scroll listener for parallax effect
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("resize", handleResize);

  // Create intersection observers for each section
  const options = {
    threshold: 0.2,
    rootMargin: "0px 0px -10% 0px",
  };

  // Observer for the about section to start counting animation
  const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        startCountingAnimation();
      }
    });
  }, options);

  if (aboutSection.value) {
    aboutObserver.observe(aboutSection.value);
  }

  // Setup observers for other sections if needed
  const sectionsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("section-visible");
      }
    });
  }, options);

  if (heroSection.value) sectionsObserver.observe(heroSection.value);
  if (projectsSection.value) sectionsObserver.observe(projectsSection.value);
  if (skillsSection.value) sectionsObserver.observe(skillsSection.value);
  if (experienceSection.value)
    sectionsObserver.observe(experienceSection.value);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <!-- Main Content with Apple-inspired design -->
  <div class="home-content">
    <!-- Hero Section with Parallax -->
    <section ref="heroSection" class="hero-section section-animation">
      <div
        class="hero-content"
        :style="{ transform: `translateY(${scrollPosition * 0.4}px)` }"
      >
        <h1 class="hero-title">
          Rifqi <span class="accent-text">Ruhyattamam</span>
        </h1>
        <h2 class="hero-subtitle">Software Engineer</h2>
        <p class="hero-description">
          Creating elegant solutions through clean code and modern technologies
        </p>
        <div class="hero-actions">
          <v-btn
            to="/projects"
            size="large"
            color="primary"
            class="hero-btn mr-4"
            >View My Work</v-btn
          >
          <v-btn
            href="mailto:rifqi96@gmail.com"
            size="large"
            variant="outlined"
            color="white"
            class="hero-btn"
            >Contact Me</v-btn
          >
        </div>
      </div>
      <div class="scroll-indicator">
        <span>Scroll to explore</span>
        <v-icon>mdi-chevron-down</v-icon>
      </div>
      <div class="hero-background"></div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section section-animation">
      <v-container>
        <v-row justify="center">
          <v-col cols="6" md="3" class="stat-item text-center">
            <h3 class="stat-number">{{ yearsCount }}+</h3>
            <p class="stat-label">Years Experience</p>
          </v-col>
          <v-col cols="6" md="3" class="stat-item text-center">
            <h3 class="stat-number">{{ projectsCount }}+</h3>
            <p class="stat-label">Projects Completed</p>
          </v-col>
          <v-col cols="6" md="3" class="stat-item text-center">
            <h3 class="stat-number">12</h3>
            <p class="stat-label">Technologies Mastered</p>
          </v-col>
          <v-col cols="6" md="3" class="stat-item text-center">
            <h3 class="stat-number">100%</h3>
            <p class="stat-label">Client Satisfaction</p>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- About Me Section with parallax effect -->
    <section ref="aboutSection" class="about-section section-animation">
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
                <h3>{{ experienceYears }}+</h3>
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
              I'm a software engineer with extensive experience in building
              modern web applications. My journey began with a fascination for
              creating elegant solutions to complex problems, and that passion
              continues to drive me today.
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

    <!-- Projects Section with cards that animate on scroll -->
    <section ref="projectsSection" class="projects-section section-animation">
      <v-container>
        <div class="section-header">
          <h2 class="section-title">Featured Projects</h2>
          <div class="section-divider"></div>
          <p class="section-description">
            A selection of my recent work and experiments
          </p>
        </div>

        <v-row class="mt-8">
          <!-- Dynamic Project Cards from CSV -->
          <v-col
            v-for="(project, index) in projects"
            :key="index"
            cols="12"
            md="6"
            lg="4"
          >
            <div class="project-card">
              <div class="project-image">
                <v-img
                  :src="project.image"
                  height="240"
                  cover
                  class="rounded-lg"
                ></v-img>
                <div class="project-overlay">
                  <v-btn
                    v-if="project.link && project.isAvailable"
                    :to="project.link"
                    color="primary"
                    variant="elevated"
                  >
                    View Project
                  </v-btn>
                  <v-btn
                    v-else-if="!project.isAvailable"
                    disabled
                    color="primary"
                    variant="elevated"
                  >
                    Coming Soon
                  </v-btn>
                </div>
              </div>
              <div class="project-content">
                <h3 class="project-title">{{ project.title }}</h3>
                <p class="project-description">
                  {{ project.description }}
                </p>
                <div class="project-tags">
                  <v-chip
                    v-for="(tech, techIndex) in project.technologies"
                    :key="techIndex"
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ tech }}
                  </v-chip>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>

        <div class="text-center mt-12">
          <v-btn to="/projects" color="primary" size="large" variant="tonal"
            >View All Projects</v-btn
          >
        </div>
      </v-container>
    </section>

    <!-- Work Experience Section -->
    <section
      ref="experienceSection"
      class="experience-section section-animation"
    >
      <v-container>
        <div class="section-header">
          <h2 class="section-title">Work Experience</h2>
          <div class="section-divider"></div>
          <p class="section-description">
            My professional journey and contributions
          </p>
        </div>

        <div class="timeline mt-12">
          <!-- Timeline Items - Dynamic rendering from CSV data -->
          <div
            v-for="(job, index) in workExperience"
            :key="index"
            class="timeline-item"
          >
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-date">
                {{ job.startDate }} - {{ job.endDate }}
              </div>
              <div class="timeline-card">
                <h3 class="timeline-title">{{ job.role }}</h3>
                <h4 class="timeline-company">{{ job.company }}</h4>
                <p class="timeline-description">
                  {{ job.description }}
                </p>
                <div class="timeline-tech">
                  <v-chip
                    v-for="(tech, techIndex) in job.technologies"
                    :key="techIndex"
                    size="small"
                    color="primary"
                    variant="outlined"
                    class="mr-1 mb-1"
                  >
                    {{ tech }}
                  </v-chip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </section>

    <!-- Skills Section with animated progress bars -->
    <section ref="skillsSection" class="skills-section section-animation">
      <v-container>
        <div class="section-header">
          <h2 class="section-title">Technical Expertise</h2>
          <div class="section-divider"></div>
          <p class="section-description">
            Technologies and tools I've mastered throughout my career
          </p>
        </div>

        <v-row class="mt-8">
          <v-col
            v-for="(tech, index) in technologies"
            :key="index"
            cols="12"
            sm="6"
            md="4"
            class="skill-item"
          >
            <div class="skill-card">
              <div class="skill-header">
                <v-icon :icon="tech.icon" color="primary" size="large"></v-icon>
                <h3 class="skill-name">{{ tech.name }}</h3>
              </div>

              <div class="skill-progress-container">
                <div class="skill-progress-bg">
                  <div
                    class="skill-progress-fill"
                    :style="{ width: `${tech.level}%` }"
                  >
                    <span class="skill-progress-label">{{ tech.level }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Contact CTA Section -->
    <section class="contact-section section-animation">
      <v-container>
        <div class="contact-content">
          <h2 class="contact-title">Ready to bring your ideas to life?</h2>
          <p class="contact-text">
            Let's work together to build something amazing.
          </p>
          <v-btn
            href="mailto:rifqi96@gmail.com"
            color="primary"
            size="x-large"
            class="mt-6"
            >Get in Touch</v-btn
          >
        </div>
      </v-container>
    </section>
  </div>
</template>

<style scoped>
/* General styles */
.home-content {
  overflow-x: hidden;
  height: auto;
  overflow-y: visible;
}

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

.accent-text {
  color: var(--v-primary-base);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #121212, #323232);
  z-index: -1;
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  padding: 40px;
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 800;
  letter-spacing: -1px;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 24px;
  opacity: 0.9;
}

.hero-description {
  font-size: 1.2rem;
  margin-bottom: 40px;
  opacity: 0.8;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.hero-btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 500;
  border-radius: 12px;
  min-width: 160px;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0.7;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0) translateX(-50%);
  }
  40% {
    transform: translateY(-15px) translateX(-50%);
  }
  60% {
    transform: translateY(-7px) translateX(-50%);
  }
}

/* Stats Section */
.stats-section {
  padding: 80px 0;
  background-color: white;
}

.stat-item {
  padding: 32px 16px;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 8px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 1.1rem;
  color: #666;
}

/* Projects Section */
.projects-section {
  padding: 120px 0;
  background-color: #f9f9f9;
}

.project-card {
  height: 100%;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  background: white;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.project-image {
  position: relative;
  overflow: hidden;
}

.project-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .project-overlay {
  opacity: 1;
}

.project-content {
  padding: 24px;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
}

.project-description {
  color: #666;
  margin-bottom: 16px;
  line-height: 1.6;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
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

/* Skills Section */
.skills-section {
  padding: 120px 0;
  background-color: #f9f9f9;
}

.skill-item {
  margin-bottom: 24px;
}

.skill-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  height: 100%;
  transition: transform 0.3s ease;
}

.skill-card:hover {
  transform: translateY(-5px);
}

.skill-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.skill-header i {
  margin-right: 16px;
}

.skill-name {
  font-size: 1.2rem;
  font-weight: 600;
}

.skill-progress-container {
  margin-top: 12px;
}

.skill-progress-bg {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.skill-progress-fill {
  height: 100%;
  background: linear-gradient(to right, var(--v-primary-base), #6200ea);
  border-radius: 5px;
  position: relative;
  transition: width 1.5s ease;
}

.skill-progress-label {
  position: absolute;
  right: 8px;
  top: -20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--v-primary-base);
}

/* Contact Section */
.contact-section {
  padding: 100px 0;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
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
}

.contact-text {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 24px;
}

/* Timeline Styles */
.experience-section {
  padding: 120px 0;
  background-color: white;
}

.timeline {
  position: relative;
  max-width: 900px;
  margin: 0 auto;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(to bottom, var(--v-primary-base), #6200ea);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 60px;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  top: 10px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  transform: translateX(-50%);
  z-index: 1;
  box-shadow: 0 0 0 4px rgba(98, 0, 234, 0.2);
}

.timeline-content {
  position: relative;
  width: 45%;
  margin-left: auto;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 0;
  margin-right: auto;
}

.timeline-date {
  position: absolute;
  top: 0;
  width: max-content;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--v-primary-base), #6200ea);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.timeline-item .timeline-date {
  left: -120px;
}

.timeline-item:nth-child(even) .timeline-date {
  right: -120px;
  left: auto;
}

.timeline-card {
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin-top: 30px;
}

.timeline-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.timeline-company {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 12px;
}

.timeline-description {
  margin-bottom: 16px;
  line-height: 1.6;
  color: #444;
}

.timeline-tech {
  display: flex;
  flex-wrap: wrap;
}

/* Media Queries */
@media (max-width: 960px) {
  .hero-title {
    font-size: 3.5rem;
  }

  .hero-subtitle {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .stat-number {
    font-size: 2.5rem;
  }

  .projects-section,
  .about-section,
  .skills-section,
  .experience-section {
    padding: 80px 0;
  }

  .contact-title {
    font-size: 2rem;
  }

  .timeline::before {
    left: 30px;
  }

  .timeline-dot {
    left: 30px;
  }

  .timeline-content {
    width: calc(100% - 70px);
    margin-left: 70px !important;
  }

  .timeline-item .timeline-date,
  .timeline-item:nth-child(even) .timeline-date {
    left: 70px;
    right: auto;
    top: -15px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 2.8rem;
  }

  .hero-actions {
    flex-direction: column;
    gap: 16px;
  }

  .projects-section,
  .about-section,
  .skills-section,
  .experience-section,
  .contact-section {
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

  .timeline-date {
    position: relative;
    left: 0 !important;
    top: 0 !important;
    right: auto !important;
    display: inline-block;
    margin-bottom: 10px;
  }

  .timeline-card {
    margin-top: 10px;
  }
}
</style>
