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
  },
  colorPalette: {
    type: Array,
    required: false
  }
});

const chart = ref(null);

onMounted(() => {
  drawBarChart(props.data, props.chartId);
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const drawBarChart = (data, chartId) => {
  const xAxisData = data.map(item => item.nameObject);
  const yAxisData = data.map(item => item.completionTime || item.value);

  const names = {
    'bar-chart1': 'Time',
    'bar-chart2': 'Time (ms)',
    'bar-chart3': 'Time (ms)',
    'bar-chart4': 'Score',
    'bar-chart5': 'Times'
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
      type: 'bar',
      colors: {
        [names[chartId]]: props.colorPalette
      }
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
