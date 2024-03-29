<template>
    <div id="bar-chart"></div>
  </template>
  
  <script>
  import c3 from 'c3';
  import 'c3/c3.css';
  import jsonData from '../data/data.json'; // Import data from JSON file
  
  export default {
    mounted() {
      this.drawBarChart(jsonData); // Pass the JSON data to the drawBarChart method
    },
    methods: {
      drawBarChart(data) {
        const names = data.map(item => item.nombre);
        const values = data.map(item => item.valor);
  
        c3.generate({
          bindto: '#bar-chart',
          data: {
            columns: [
              ['Player Score'].concat(values) // Add 'Value' as column header and player values
            ],
            type: 'bar'
          },
          axis: {
            x: {
              type: 'category',
              categories: names // X axis: name of the players
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
    },
    unmounted() {
      // Destruye el gráfico cuando el componente es desmontado para evitar fugas de memoria
      if (this.chart) {
        this.chart.destroy();
      }
    }
  }
  </script>
  
  <style>
  </style>