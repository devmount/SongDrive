<template>
	<div class="logo">
		<img src="../assets/logo.svg" alt="SongDrive Song Management Tool" />
		<h1>{{ t('app.name') }}</h1>
		<div class="version text-gray text-small text-right mr-5">v{{ version }}</div>
	</div>
</template>

<script setup>
import { inject } from 'vue';
import { useI18n } from "vue-i18n";
const { t } = useI18n();
const version = inject('version');
</script>

<style>
.logo {
  padding: 0.3em 0;
  text-decoration: none;
  cursor: default;
  text-align: center;
}
.logo img {
  display: inline-block;
  width: 32px;
}
.logo h1 {
  color: #88b544;
  display: inline-block;
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 2px;
  line-height: 1.6rem;
  margin-bottom: 0;
  margin-left: 0.5rem;
}
.logo.featured {
  margin: 0 auto;
  max-width: 300px;
  width: 100%;
}
.logo.featured img {
  width: 48px;
}
.logo.featured h1 {
  font-size: 1.75rem;
}
.logo.hide-version .version {
  display: none;
}
a .logo {
  cursor: pointer;
}
</style>
