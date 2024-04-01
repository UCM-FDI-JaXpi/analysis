<template>
  <div id="app">
    <h1>Bar Chart</h1>
    <BarChart :data="jsonData" />
  </div>
</template>

<script setup>
import BarChart from './components/BarChart.vue';
import jsonData from './data/data.json';
</script>

<style>
</style>
