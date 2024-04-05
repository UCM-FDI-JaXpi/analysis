<template>
  <div :id="chartId"></div>
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
  }
});

const chart = ref(null);

onMounted(() => {
  drawBarChart(props.data);
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const drawBarChart = (data) => { 
  const xAxisData = data.map(item => item.name || item.level);
  const yAxisData = data.map(item => item.value || item.time);

  const chartData = [
    ['x'].concat(xAxisData),
    ['data'].concat(yAxisData)
  ];

  chart.value = c3.generate({
    bindto: `#${props.chartId}`,
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
          text: 'Value',
          position: 'outer-middle'
        }
      }
    }
  });
}
</script>

<style>
</style>
