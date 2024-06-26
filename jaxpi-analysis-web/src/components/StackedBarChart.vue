<template>
    <div>
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
            },
            y: {
                tick: {
                    format: d => Number.isInteger(d) ? d : null // Format without decimals
                }
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