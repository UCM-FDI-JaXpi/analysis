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
//import axios from 'axios';

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
// const dataFromServer = ref([]); 

onMounted(() => {
    // Hacer solicitud GET al servidor
    /*axios.get('http://localhost:3000/records', {
      headers: {
                'Content-Type': 'application/json',
              }
    })
      .then(response => {
        // Guardar los datos en el ref
        dataFromServer.value = response.data;
        //console.log(response)
        //console.log(dataFromServer.value)
      })
      .catch(error => {
        console.error('Error al obtener datos del servidor:', error);
    });*/

    drawBarChart(props.data, props.chartId);
});

onUnmounted(() => {
    if (chart.value) {
        chart.value.destroy();
    }
});

const drawBarChart = (data, chartId) => {
    const levels = data.map(item => item.nameObject);
    const successedAttempts = data.map(item => item.successedAttempts);
    const failedAttempts = data.map(item => item.failedAttempts);

    chart.value = c3.generate({
        bindto: '#' + chartId,
        data: {
            x: 'x',
            columns: [
                ['x'].concat(levels),
                ['Successed Attempts'].concat(successedAttempts),
                ['Failed Attempts'].concat(failedAttempts)
            ],
            type: 'bar',
            groups: [['Successed Attempts', 'Failed Attempts']]
        },
        axis: {
            x: {
                type: 'category'
            }
        }
    });
}
</script>

<style scoped>
h2 {
    text-align: center;
}
</style>