<template>
  <div class="chart-container" style="text-align: -webkit-center;" >
    <h2 class="chart-title">{{ title }}</h2>
    <div :id="chartId" style="max-width: fit-content;"></div>

    <button v-if="chartId == 'pie-chart-completed-game'" @click="changeChartType">Change type chart</button>
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
let currentChartType = ref('pie');

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

const changeChartType = () => {
  if (chart.value) {
    const newType = currentChartType.value === 'pie' ? 'bar' : 'pie';
    chart.value.transform(newType);
    currentChartType.value = newType;
    drawPieChart(props.data, props.chartId);
  }
};

// Watch for changes in the data prop
watch(() => props.data, (newData) => {
    if (chart.value) {
        chart.value.destroy(); // Destruir el gráfico anterior
    }
    drawPieChart(newData, props.chartId); // Redibujar el gráfico con los nuevos datos
});

// Configuración de c3 para crear el gráfico de tarta
const drawPieChart = (data, chartId) => {
  let res = [];
  data.forEach( elem => {
    let comp = [];
    comp.push(elem.nameObject);
    comp.push(elem.value);
    res.push(comp);
  });

  // Obtener valores únicos para el eje Y
  const yValues = data.map(item => item.value);
  const uniqueYValues = Array.from(new Set(yValues));

  chart.value = c3.generate({
    bindto: `#${chartId}`,
    data: {
      columns: res,
      type: currentChartType.value
    },
    size: {
          width: 370, // Ajusta la anchura del gráfico
        },
    axis: {
      y: {
        tick: {
          format: function (value) {
            return Math.round(value); // Formatear el eje Y para mostrar enteros
          },
          values: uniqueYValues // Mostrar solo los valores únicos en el eje Y
        }
      }
    }
  });
}
</script>

<style scoped>
.chart-title {
  text-align: center; /* Centra el texto dentro del h2 */
}

button {
  margin-top: 10px;
  display: block;
  /* margin-left: auto;
  margin-right: auto; */
  background-color: #3498DB;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  padding: 5px 7px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}
</style>