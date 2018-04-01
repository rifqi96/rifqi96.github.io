<template>
    <transition name="fade" v-if="isLoading">
        <div class="flex-center loader_bg">
            <div class="loader"></div>
        </div>
    </transition>
</template>

<style>
.loader_bg {
  background:snow;
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}
.loader {
    border: 16px solid #f3f3f3; /* Light grey */
    border-top: 16px solid #3498db; /* Blue */
    border-radius: 50%;
    width: 120px;
    height: 120px;
    animation: spin 2s linear infinite;
    display:block;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>

<script>
export default {
  name:'Loader',
  data () {
    return {
      isLoading: true
    }
  },
  methods: {
    loaderLeave: function () {
      setTimeout(() => {
        this.isLoading = false
      }, 1500)
    },
    loaderActive: function () {
        this.isLoading = true;
    }
  },
  created: function() {
      this.$emit('loader_active', this.loaderActive())
      this.$emit('loader_leave', this.loaderLeave())
  }
}
</script>
