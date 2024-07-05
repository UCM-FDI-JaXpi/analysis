<template>
    <nav class="navbar">
        <router-link class="nav-item" to="/">Home</router-link>
        <router-link class="nav-item" to="/charts">Go to Charts</router-link>
        <router-link class="nav-item" to="/login">Login</router-link>
        <router-link class="nav-item" to="/register">Register</router-link>
        <router-link class="nav-item" to="/about-us">About us</router-link>
    </nav>
</template>

<script setup>
</script>

<style scoped>
.navbar {
  display: flex; /* Flexbox para alinear los elementos */
  justify-content: center; /* Centrar los elementos horizontalmente */
  background-color: #1976d2;
  padding: 0.5em;
}

.nav-item {
  padding: 0.5rem 2rem; /* Espaciado interno de los enlaces */
  cursor: pointer; /* Cambiar el cursor al pasar por encima */
  color: rgba(255, 255, 255, 0.876); /* Color de texto */
  text-decoration: none; /* Quitar la decoración de texto (no underline) */
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover,
.nav-item.router-link-active:hover {
  background-color: #7bb3e0; /* Color de fondo al pasar el mouse */
  color: rgba(255, 255, 255, 0.87); /* Color de texto al pasar el mouse */
}

.nav-item.router-link-active { /* Cuando un link esta seleccionado */
  background-color: transparent;
  color: #ffffff; 
  font-weight: bold;
}
</style>