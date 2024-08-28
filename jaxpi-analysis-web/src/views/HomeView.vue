<template>
  <div class="home-container">
    <div class="text-section">
      <h1>Welcome to Jaxpi</h1>
      <p class="home-text">
        An application developed with Vue 3 and designed to offer data analytics for different players.<br>
        Data visualization to have a broad view of your game, your students or your statistics as a player.
        Enjoy it!
      </p>
    </div>
    <div class="image-charts">
      <img :src=pieChart alt="Pie chart image" class="pie-chart"/>
      <img :src=gameImage alt="Game image" class="small-game-image" />
      <img :src=barChart alt="Bar chart image" class="bar-chart"/>
    </div>
  </div>
</template>

<script setup>
import pieChart from '@/assets/pie-chart.png';
import barChart from '@/assets/bar-chart.png';
import gameImage from '@/assets/game.png';
</script>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
  background-color: #6fc8ff35;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.text-section {
  margin-bottom: 70px;
}

h1 {
  font-size: 30px;
  color: #005ebc;
  margin-bottom: 20px;
  font-weight: bold;
}

.home-text {
  font-size: 16px;
  color: #003163;
  margin-bottom: 30px;
  line-height: 1.6;
}

.image-charts {
  display: flex;
  justify-content: center;
  gap: 90px;
  align-items: flex-end;
}

.pie-chart {
  max-width: 200px;
  height: auto;
}

.bar-chart {
  max-width: 250px;
  height: auto;
}

.small-game-image {
  max-width: 150px;
  height: auto;
}
</style>