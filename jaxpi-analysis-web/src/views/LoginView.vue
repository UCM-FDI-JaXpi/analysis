<template>
	<div class="container">
		<h1>Login</h1>	

		<form action="http://localhost:3000/login" method="POST">
			<div>
				<label for="email">Email</label>
				<input type="text" id="email" name="email" required>
			</div>
			<div>
				<label for="password">Password</label>
				<input type="password" id="password" name="password" required>
			</div>
			<button type="submit">Login</button>
		</form>
		
		<a href="/register">Register</a>
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
