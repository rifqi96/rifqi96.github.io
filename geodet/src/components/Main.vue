<template>
  <div class="main">
    <transition name="fade" v-if="isLoading">
      <div class="flex-center loader_bg">
        <div class="loader"></div>
      </div>
    </transition>
    <Modal>
      <template slot="title">Your Geolocation</template>
      <template slot="body">
        <p>Latitude: <span v-show="location.lat">{{location.lat}}</span> </p>
        <p>Longitude: <span v-show="location.lon">{{location.lon}}</span> </p>
      </template>
    </Modal>
    <!-- <div class="row">
      <div class="col">
        <button class="btn btn-primary" v-on:click="showLocation">Show Location</button>
      </div>
    </div> -->
  </div>
</template>

<script>
import Modal from '@/components/Modal'

export default {
  name: 'Main',
  components: {
    Modal
  },
  data(){
    return {
      location: {},
      isLoading: true
    }
  },
  methods: {
    getLocation: function(){
      this.isLoading = true;
      this.addLocationToApi({
        location: {
          lat: 0,
          lon: 0
        }
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          this.location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          this.addLocationToApi(this);
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
    addLocationToApi: function(data){
      this.$http.post('https://ec44e23e.ngrok.io/api/geolocation/do/add', {
        latitude: data.location.lat,
        longitude: data.location.lon
      })
        .then((res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        });
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