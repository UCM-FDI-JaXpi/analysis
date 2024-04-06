<template>
  <h1>Bar Charts</h1>
  <div class="chart-container"> <!-- Pass the same data structure for both .json -->
    <BarChart :data="jsonData" chartId="bar-chart1"
              title="Players score"/> <!-- Pass the complete JSON object -->
    <BarChart :data="jsonDataTimeLevelPlayer.levels" chartId="bar-chart2"
              :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" /> <!-- Passing only the 'levels' property of the JSON object -->
    <LineChart :data="jsonDataScoreSessionPlayer" chartId="line-chart1"
               title="Score progression per session"/>
  </div>
</template>

<script setup>
import BarChart from './components/BarChart.vue';
import LineChart from './components/LineChart.vue';

import jsonData from './data/data.json';
import jsonDataTimeLevelPlayer from './data/time-level-player.json';
import jsonDataScoreSessionPlayer from './data/score-session-player.json';

</script>

<style>
#app { /* Style for the div app that comes by default  */
  background-color:#bfdbf3;
}

.chart-container {
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: #79c1fd;
  padding: 10px;
}

#bar-chart1, #bar-chart2, #line-chart1  {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 5px; /* Margin between graphics and container */
}
</style>
