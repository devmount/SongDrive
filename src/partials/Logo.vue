<template>
	<div class="logo">
		<img src="../assets/logo.svg" alt="SongDrive Song Management Tool" />
		<h1>{{ $t('app.name') }}</h1>
		<div class="version text-gray text-small text-right mr-5">v{{ $version }} BETA</div>
	</div>
</template>

<style lang="scss">
.logo {
	padding: .3em 0;
	text-decoration: none;
	cursor: default;
	text-align: center;

	img {
		display: inline-block;
		width: 32px;
	}
	h1 {
		color: #88b544;
		display: inline-block;
		font-size: 1.1rem;
		font-weight: 400;
		letter-spacing: 2px;
		line-height: 1.6rem;
		margin-bottom: 0;
		margin-left: .5rem;
	}
}

.logo.featured {
	margin: 0 auto;
	max-width: 300px;
	width: 100%;

	img {
		width: 48px;
	}
	h1 {
		font-size: 1.75rem;
	}
}

.logo.hide-version .version {
	display: none;
}

a .logo {
	cursor: pointer;
}
</style>
