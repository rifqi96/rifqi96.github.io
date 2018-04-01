<template>
  <div class="main">
    <Modal>
      <template slot="title">Your Geolocation</template>
      <template slot="body">
        <p>Latitude: <span v-show="location.lat">{{location.lat}}</span> </p>
        <p>Longitude: <span v-show="location.lon">{{location.lon}}</span> </p>
      </template>
    </Modal>
    <div class="row">
      <div class="col">
        <button class="btn btn-primary" v-on:click="getLocation">Show Location</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Main',
  data(){
    return {
      location: {}
    }
  },
  methods: {
    getLocation: function(){
      this.$emit('loader_active');
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
          this.$emit('loader_leave');
          this.showLocation();
        });
      } else {
          console.log("Geolocation is not supported by this browser.");
          this.$emit('loader_leave');
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
    }
  },
  created: function(){
    $('.modal').modal('hide');
    this.getLocation();
  },
  mounted: function(){
    this.$nextTick(() => {
      // this.loaderLeave();
    });
  }
}
</script>