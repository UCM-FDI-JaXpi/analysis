<template>
  <h1>Bar Charts</h1>
  <div class="chart-container">
    <BarChart :data="dataJson" chartId="bar-chart1"
              title="Players score"/>
    <BarChart :data="dataTimeLevelPlayer" chartId="bar-chart2"
              :title="'Playing time per level for ' + jsonDataTimeLevelPlayer.player" />
    <BarChart :data="dataLevelCompletionTimes" chartId="bar-chart3"
              title="Completion time per level" />
    <BarChart :data="dataLevelCompletionTimesMongo" chartId="bar-chart4"
              title="Completion time per level MONGO" />
    <StackedBarChart :data="attemptsPerLevel" chartId="stacked-bar-chart1"
              title="Number of attempts per level MONGO" />
    <LineChart :data="jsonDataScoreSessionPlayer" chartId="line-chart1"
               title="Score progression per session"/>
  </div>
</template>

<script setup>
import BarChart from './components/BarChart.vue';
import LineChart from './components/LineChart.vue';
import StackedBarChart from './components/StackedBarChart.vue';

import jsonData from './data/data.json';
import jsonDataTimeLevelPlayer from './data/time-level-player.json';
import jsonDataScoreSessionPlayer from './data/score-session-player.json';
import jsonDataExample from './data/example.json';
import jsonDataRecordsMongo from './data/recordsMongo.json';
import jsonDataRecordsMongoAttemptsPerLevel from './data/recordsMongoAttemptsPerLevel.json';

import { calculateLevelCompletionTimes, calculateAttemptsPerLevel } from './utils/utilities.js';


/**************************************************** For BarChart *******************************************************/
function prepareBarChartData(jsonData) {
  return jsonData.map(entry => ({
    nameObject: entry.name || entry.level,
    value: entry.value || entry.time
  }));
}
const dataJson = prepareBarChartData(jsonData) //For data.json - the data in the correct format to paint on the bar chart
const dataTimeLevelPlayer = prepareBarChartData(jsonDataTimeLevelPlayer.levels) //For time-level-player.json

const dataLevelCompletionTimes = calculateLevelCompletionTimes(jsonDataExample); //For example.json - the data in the correct format to paint on the bar chart
const dataLevelCompletionTimesMongo = calculateLevelCompletionTimes(jsonDataRecordsMongo); //For recordsMongo.json


/*********************************************** For StackedBarChart ****************************************************/ 
const attemptsPerLevel = calculateAttemptsPerLevel(jsonDataRecordsMongoAttemptsPerLevel); //For recordsMongoAttemptsPerLevel.json
console.log(attemptsPerLevel)


/************************************************** For LineChart *******************************************************/ 


</script>

<style>
#app { /* Style for the div app that comes by default */
  background-color:#bfdbf3;
}

.chart-container {
  display: grid;
  grid-template-columns: 50% 50%;
  background-color: #79c1fd;
  padding: 10px;
}

#bar-chart1, #bar-chart2, #bar-chart3, #bar-chart4, #stacked-bar-chart1, #line-chart1  {
  background-color: rgba(255, 255, 255, 0.8);
  margin: 5px; /* Margin between graphics and container */
}
</style>
