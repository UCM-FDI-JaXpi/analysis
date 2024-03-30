<template>
  <div id="app">
    <h1>Bar Chart</h1>
    <BarChart :data="jsonData" />
  </div>
</template>

<script>
import BarChart from './components/BarChart.vue';
import jsonData from './data/data.json';

export default {
  name: 'App',
  components: {
    BarChart
  },
  data(){
    return {
      jsonData
    };
  }
}
</script>

<style>
</style>
