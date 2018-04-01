<template>
  <div class="main">
    <transition name="fade" v-if="isLoading">
      <div class="loader_bg">
        <div class="loader"></div>
        <p>Please wait, we are doing the magic ...</p>
      </div>
    </transition>
    <div class="modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Your Geolocation</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Latitude: <span v-show="location.lat">{{location.lat}}</span> </p>
            <p>Longitude: <span v-show="location.lon">{{location.lon}}</span> </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="row">
      <div class="col">
        <button class="btn btn-primary" v-on:click="showLocation">Show Location</button>
      </div>
    </div> -->
  </div>
</template>

<script>
export default {
  name: 'Main',
  data(){
    return {
      location: {},
      isLoading: true
    }
  },
  methods: {
    getLocation: function(){
      this.isLoading = true;
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          this.loaderLeave();
          this.showLocation();
        });
      } else {
          console.log("Geolocation is not supported by this browser.");
          this.loaderLeave();
      }
    },
    showLocation: function(){
      $('.modal').modal('show');
    },
    loaderLeave: function(){
      setTimeout(() => {
        this.isLoading = false;
      }, 1500)
    }
  },
  created: function(){
    this.getLocation();
  },
  mounted: function(){
    this.$nextTick(() => {
      // this.loaderLeave();
    });
  }
}
</script>