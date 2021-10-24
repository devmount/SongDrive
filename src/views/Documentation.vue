<template>
	<div class="shortcuts">
		<div class="container no-sidebar">
			<!-- title -->
			<div class="columns text-center">
				<!-- heading -->
				<div class="column col-12 mb-15">
					<img class="logo" src="@/assets/logo.svg" alt="SongDrive Song Management Tool" />
					<h2 class="text-primary weight-normal mb-3">{{ $t('app.name') }}</h2>
					<div class="text-gray">{{ $t('app.summary') }}</div>
				</div>
				<!-- features -->
				<div class="columns col-8 col-xl-12 col-mx-auto">
					<div v-for="i in 3" class="column col-4 col-xl-6 col-sm-12">
						<ion-icon :name="$t('docu.features')[i-1].icon" class="icon-3x icon-thin mb-3"></ion-icon>
						<h3>{{ $t('docu.features')[i-1].title }}</h3>
						<div>{{ $t('docu.features')[i-1].description }}</div>
					</div>
				</div>
			</div>
			<!-- content -->
			<div v-html="content"></div>
		</div>
	</div>
</template>

<script>
const marked = require("marked");
const docs = {
	de: require("@/docs/docs.de.md"),
	en: require("@/docs/docs.en.md"),
};

export default {
	name: 'documentation',
	computed: {
		content () {
			return marked(docs[this.$i18n.locale].default);
		}
	}
}
</script>

<style lang="scss" scoped>
.logo {
	width: 150px;
	margin-top: 2rem;
}
</style>
