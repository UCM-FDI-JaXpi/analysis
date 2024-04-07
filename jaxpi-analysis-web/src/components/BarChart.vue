<template>
  <div>
    <h2>{{ title }}</h2>
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import c3 from 'c3';
import 'c3/c3.css';
import { ref, onMounted, onUnmounted } from 'vue';

import axios from 'axios';

const props = defineProps({
  data: {
    type: Array,
    required: true
  },
  chartId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
});

const chart = ref(null);
const dataFromServer = ref([]); 

onMounted(() => {
  // Hacer solicitud GET al servidor
  axios.get('http://localhost:3000/records', {
    headers: {
              'Content-Type': 'application/json',
            }
  })
    .then(response => {
      // Guardar los datos en el ref
      dataFromServer.value = response.data;
      console.log(response)
      console.log(dataFromServer.value)
    })
    .catch(error => {
      console.error('Error al obtener datos del servidor:', error);
  });

  drawBarChart(props.data, props.chartId);
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const drawBarChart = (data, chartId) => {
  const xAxisData = data.map(item => item.name || item.level);
  const yAxisData = data.map(item => item.value || item.time);

  const names = {
    'bar-chart1': 'Score',
    'bar-chart2': 'Time'
  };

  const chartData = [
    ['x'].concat(xAxisData),
    [names[chartId]].concat(yAxisData)
  ];

  chart.value = c3.generate({
    bindto: `#${chartId}`,
    data: {
      x: 'x',
      columns: chartData,
      type: 'bar'
    },
    axis: {
      x: {
        type: 'category',
        tick: {
          centered: true
        }
      },
      y: {
        label: {
          text: names[chartId],
          position: 'outer-middle'
        }
      }
    },
    grid: {
      y: {
        show: true
      }
    },
    legend: {
      show: false
    }
  });
}
</script>

<style scoped>
h2 {
  text-align: center;
}
</style>
