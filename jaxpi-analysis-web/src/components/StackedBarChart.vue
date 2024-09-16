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

watch(() => props.data, (newData) => {
    drawBarChart(newData, props.chartId);
});

const drawBarChart = (data, chartId) => {
    const columns = [];
    const categories = ['x'];
    
    let long = 0;
    let result;
    data.forEach(element => {
      if(element.value.length >= long){
        result=element;
        long =element.value.length;
      }
    }); 
    if (props.chartId == "stacked-bar-chart-number-completed-levels")
        categories.push(...result.value.map((_, i) => `Level ${i + 1}`));

    data.forEach((item, index) => {
        if (index === 0) {
            // if (props.chartId == "stacked-bar-chart-number-completed-levels")
            //     categories.push(...item.value.map((_, i) => `Level ${i + 1}`));
            // else 
            if (props.chartId == "stacked-bar-chart-interactions-items")
                categories.push(...item.interactions.map((e) => `${e}`));
        }
        columns.push([item.nameObject, ...item.value]);
    });

    // Ensure columns have the same length as the categories
    columns.forEach(column => {
        while (column.length < categories.length) {
            column.push(0);
        }
    });

    chart.value = c3.generate({
        bindto: '#' + chartId,
        data: {
            x: 'x',
            columns:  [categories, ...columns],
            type: 'bar',
            labels:{
                format: (value) => {
                    return value === 0 ? '' : value; // Show the label only if value is not zero
                }
            },
            groups: [columns.map(col => col[0])]
        },
        axis: {
            x: {
                type: 'category',
                tick: {
                rotate: 45,
                multiline: false
                }
            },
            y: {
                label: {
                    text: 'Number of Times',
                    position: 'outer-middle' // (outer-middle, outer-top, outer-bottom)
                },
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