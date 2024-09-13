<template>
    <div class="widthLineChart">
        <h2>{{ title }}</h2>
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

const chart = ref(null);

onMounted(() => {
    drawLineChart(props.data, props.chartId);
});

onUnmounted(() => {
    if (chart.value) {
        chart.value.destroy();
    }
});

watch(() => props.data, (newData) => {
    drawLineChart(newData, props.chartId);
});

const drawLineChart = (data, chartId) => {

    // data = [[
    //     {nameObject: '17/8/2024', value: 40,name: 'maria'},
    //     {nameObject: '18/8/2024', value: 5,name: 'maria'},
    //     {nameObject: '19/8/2024', value: 0,name: 'maria'},
    //     {nameObject: '20/8/2024', value: 10,name: 'maria'}],
    //     [
    //     {nameObject: '18/8/2024', value: 25,name: 'ana'},
    //     {nameObject: '20/8/2024', value: 4,name: 'ana'},
    //     {nameObject: '21/8/2024', value: 10,name: 'ana'}]]

    //     const chartData = [];
    // data.forEach(element => {
    //     const xAxisData = element.map(item => item.nameObject);
    //     const yAxisData = element.map(item => item.value);
    //     // const names = {
    //     // 'line-chart1': 'Statements'
    //     // };
          
    //     chartData.push(['x'].concat(xAxisData));
    //     chartData.push([element[0].name].concat(yAxisData));

    // });  
    const xAxisData = data.map(item => item.nameObject);
    const yAxisData = data.map(item => item.value);

    const names = {
        'line-chart1': 'Number of statements'
    };

    const chartData = [
        ['x'].concat(xAxisData),
        [names[chartId]].concat(yAxisData)
    ];

    chart.value = c3.generate({
        bindto: `#${chartId}`,
        data: {
            x: 'x',
            xFormat: '%d/%m/%Y', // Formato de las fechas de entrada
            columns: chartData,
            colors: {
                [names[chartId]]: '#00C206',
            }
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%d/%m/%Y',
                    rotate: -25,
                    multiline: false
                },
                height: 55
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
        zoom: {
            enabled: true
        }
    });
}
</script>

<style scoped>
h2 {
    text-align: center;
}

.widthLineChart{
    width: 600px;
}
</style>
