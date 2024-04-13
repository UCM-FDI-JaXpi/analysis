<template>
    <div>
      <h1>Home</h1>
      <router-link to="/about-us" class="link">About us</router-link>
      <router-link to="/charts" class="link">Go to Charts</router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style>
  h1 {
    font-size: 25px;
    color: #333;
  }
  
  .link {
    display: block;
    margin-bottom: 10px; /* Space between links */
  }
  </style>
  