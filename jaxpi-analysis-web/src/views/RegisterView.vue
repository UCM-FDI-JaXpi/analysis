<template>
		<h1>Register</h1>

<form action="http://localhost:3000/admin/register" method="POST">
	<div>
		<label for="name">Name</label>
		<input type="text" id="name" name="name" required>
	</div>
	<div>
		<label for="email">Email</label>
		<input type="text" id="email" name="email" required>
	</div>
	<div>
		<label for="pwd">Password</label>
		<input type="password" id="pwd" name="pwd" required>
	</div>
	<div>
		<label for="rep_pwd">Repeat password</label>
		<input type="password" id="rep_pwd" name="rep_pwd" required>
	</div>
	<div>
        <label for="usr_type">I am a:</label>
        <select name="usr_type" id="usr_type">
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="dev">Developer</option>
        </select>
    </div>
	<button type="submit">Register</button>
</form>
<a href="/login">Login</a>
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
  