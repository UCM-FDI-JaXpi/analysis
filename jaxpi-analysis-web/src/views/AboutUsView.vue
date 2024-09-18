<template>
    <div class="about-us-container">
        <h1>About Us</h1>
        <p class="about-us-text">
          Welcome to our About Us page! <br>
          Feel free to contact us if you have any questions or inquiries.
        </p>
        <h3 style="color: #005ebc; margin-bottom: 10px;">Attributions</h3>
        <a href="https://www.flaticon.es/iconos-gratis/hecho" title="hecho iconos">Checkmark icon created by Octopocto - Flaticon</a><br>
        <a href="https://www.flaticon.es/iconos-gratis/copia-de-contenido" title="copia de contenido iconos">Content copy icon created by Freepik - Flaticon</a>
    </div>
</template>

<script setup></script>

<style scoped>
.about-us-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
  background-color: #BBE3FF;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 30px;
  color: #005ebc;
  margin-bottom: 20px;
  font-weight: bold;
}

.about-us-text {
  font-size: 16px;
  color: #003163;
  margin-bottom: 20px;
  line-height: 1.6;
}

.about-us-container a {
  display: inline-block;
  margin-bottom: 7px;
  text-decoration: none;
  color: #005ebc;
}

.about-us-container a:hover {
  color: #004386;
  text-decoration: underline;
}
</style>