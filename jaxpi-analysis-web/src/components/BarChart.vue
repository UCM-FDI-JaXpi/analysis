<template>
  <div class="widthBarChart">
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
  },
  colorPalette: {
    type: Array,
    required: false
  },
  customTooltip: {
    type: Boolean,
    default: false // No usar tooltip personalizado por defecto
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

// Watch for changes in the data prop
watch(() => props.data, (newData) => {
    drawBarChart(newData, props.chartId);
});

const drawBarChart = (data, chartId) => {
  const xAxisData = data.map(item => item.nameObject);
  const yAxisData = data.map(item => item.completionTime || item.value);
  const studentNamesHover = data.map(item => item.student);

  const names = {
    'bar-chart-student-detail1': 'Times',
    'bar-chart2': 'Time (ms)',
    'bar-chart3': 'Time',
    'bar-chart4': 'Time (ms)',
    'bar-chart-time-per-attempt': 'Time (ms)',
    'bar-chart-interactions-items': 'Number of interactions',
    'bar-chart-verb-count': 'Number of verbs',
  };

  const chartData = [
    ['x'].concat(xAxisData),
    [names[chartId]].concat(yAxisData)
  ];

  const tooltipOptions = props.customTooltip ? {
      contents: function (d) { //Funcion que genera contenido HTML del tooltip, d->objeto del punto de datos que hacemos hover(index->ejex, value->ejey, _id->de la serie, para graficos con multiples series)
        const index = d[0].index; //valor del eje x
        const studentNameHover = studentNamesHover[index].slice(0, -6);
        const value = d[0].value; //valor del eje y

        return `<div class='custom-tooltip'>
                  <div class='tooltip-header'>${studentNameHover}</div>
                  <div class='tooltip-body'>
                    <strong>Value:</strong> ${value}
                  </div>
                </div>`;
      }
  }
  : {};

  const labelOptions = (chartId === 'bar-chart-verb-count' || chartId === 'bar-chart-interactions-items') ? {
    format: {
      [names[chartId]]: function (value) {
        return value;
      }
    }
  } : {};

  chart.value = c3.generate({
    bindto: `#${chartId}`,
    data: {
      x: 'x',
      columns: chartData,
      type: 'bar',
      labels: labelOptions,
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
    },
    tooltip: tooltipOptions // Aquí se aplican las opciones del tooltip
  });
}
</script>

<style>
.chart-title {
  text-align: center; /* Centra el texto dentro del h2 */
}

.widthBarChart{
    width: 600px;
}

.custom-tooltip {
  background-color: #494949;
  color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Arial', sans-serif;
  font-size: 14px;
  text-align: left;
}

.custom-tooltip .tooltip-header {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.custom-tooltip .tooltip-body {
  font-size: 14px;
}

.custom-tooltip strong {
  color: rgb(255, 192, 32);
}

.c3-text {
  font-size: 15px; /* For all labels */
}
</style>