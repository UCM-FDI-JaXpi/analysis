<template>
  <div id="bar-chart"></div>
</template>

<script setup>
import c3 from 'c3';
import 'c3/c3.css';
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  data: {
    type: Array,
    required: true
  }
});

const chart = ref(null); // Reactive variable

onMounted(() => {
  drawBarChart(props.data);
});

onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy();
  }
});

const drawBarChart = (data) => { 
  const names = data.map(item => item.nombre);
  const values = data.map(item => item.valor);

  chart.value = c3.generate({
    bindto: '#bar-chart',
    data: {
      columns: [
        ['Player Score'].concat(values) // Chart columns
      ],
      type: 'bar'
    },
    axis: {
      x: {
        type: 'category',
        categories: names // X axis: player names
      },
      y: {
        label: {
          text: 'Score',
          position: 'outer-middle'
        }
      }
    }
  });
}
</script>

<style>
</style>
