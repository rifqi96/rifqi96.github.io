// Nuxt auto-imports shims
declare module "#imports" {
  export * from "vue";
  export * from "nuxt/app";
}

declare module "#build/*" {
  const component: any;
  export default component;
}

declare module "#app" {
  export * from "nuxt/dist/app";
}

declare module "#app/*" {
  export * from "nuxt/dist/app/*";
}

declare module "#image/*" {
  export * from "@nuxt/image/dist/runtime/*";
}

declare module "#image" {
  export * from "@nuxt/image/dist/runtime";
}

declare module "#components" {
  const component: any;
  export default component;
}

declare module "#mdc-configs" {
  const config: any;
  export default config;
}

declare module "#mdc-highlighter" {
  const highlighter: any;
  export default highlighter;
}
