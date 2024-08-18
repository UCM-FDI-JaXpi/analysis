<template>
  <div class="chart-container">
    <h2 class="chart-title">{{ title }}</h2>
    <div :id="chartId"></div>
  </div>
</template>

<script setup>
import c3 from 'c3';
import 'c3/c3.css';
import { ref, onMounted, onUnmounted, watch } from 'vue';

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

// Ref al elemento DOM donde se renderizará el gráfico
const chart = ref(null);

// Monta el gráfico al montar el componente
onMounted(() => {
    drawPieChart(props.data, props.chartId);
});

// Desmonta el gráfico para limpiar recursos
onUnmounted(() => {
    if (chart.value) {
        chart.value.destroy();
    }
});

// Watch for changes in the data prop
watch(() => props.data, (newData) => {
    drawPieChart(newData, props.chartId);
});

// Configuración de c3 para crear el gráfico de tarta
const drawPieChart = (data, chartId) => {
  //const xAxisData = data.map(item => item.nameObject);
  //const yAxisData = data.map(item => item.completionTime || item.value);
console.log(data);
//   const names = {
//     'pie-chart1': 'Times'
//   };

  let res=[];
  data.forEach( elem => {
    let comp = [];
    comp.push(elem.nameObject);
    comp.push(elem.value);
    res.push(comp);
  });


  // [
  //   ['x'].concat(xAxisData),
  //   [names[chartId]].concat(yAxisData)
  // ];

  chart.value = c3.generate({
    bindto: `#${chartId}`,
    data: {
      columns: res,
      type: 'pie',
      onclick: function (d, i) { console.log("onclick", d, i); },
      onmouseover: function (d, i) { console.log("onmouseover", d, i); },
      onmouseout: function (d, i) { console.log("onmouseout", d, i); }
    }
  });
}
</script>

<style scoped>
.chart-title {
  text-align: center; /* Centra el texto dentro del h2 */
}
</style>