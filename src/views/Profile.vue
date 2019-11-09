<template>
	<div class="profile">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						Profile
					</h2>
				</div>
				<div class="column col-4">
					<div class="panel mt-3">
						<div class="panel-header text-center">
							<figure v-if="userObject && userObject.photoURL != ''" class="avatar avatar-lg mb-2">
								<img :src="userObject.photoURL" alt="Avatar" />
							</figure>
							<div v-if="userObject && userObject.displayName" class="panel-title h5 mt-10">{{ userObject.displayName }}</div>
							<div v-if="roleName" class="panel-subtitle text-gray">{{ roleName }}</div>
						</div>
						<!-- <nav class="panel-nav">
							<ul class="tab tab-block">
								<li class="tab-item active"><a href="#panels">Profile</a></li>
								<li class="tab-item"><a href="#panels">Files</a></li>
								<li class="tab-item"><a href="#panels">Tasks</a></li>
							</ul>
						</nav> -->
						<div class="panel-body">
							<div v-if="userObject && userObject.email" class="tile tile-centered">
								<div class="tile-icon  mr-2">
									<i class="icon icon-2x ion-md-mail"></i>
								</div>
								<div class="tile-content">
									<div class="tile-title text-bold">Email</div>
									<div class="tile-subtitle text-gray">{{ userObject.email }}</div>
								</div>
								<div class="tile-action">
									<button class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Edit Email">
										<i class="icon ion-md-create"></i>
									</button>
								</div>
							</div>
							<div v-if="userObject && userObject.photoURL" class="tile tile-centered">
								<div class="tile-icon  mr-2">
									<i class="icon icon-2x ion-md-camera"></i>
								</div>
								<div class="tile-content">
									<div class="tile-title text-bold">Photo URL</div>
									<div class="tile-subtitle text-gray">{{ userObject.photoURL }}</div>
								</div>
								<div class="tile-action">
									<button class="btn btn-link btn-action btn-lg tooltip tooltip-left" data-tooltip="Edit Photo URL">
										<i class="icon ion-md-create"></i>
									</button>
								</div>
							</div>
						</div>
						<!-- <div class="panel-footer">
							<button class="btn btn-primary btn-block">Save</button>
						</div> -->
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'profile',
	props: ['userObject', 'roleName']
}
</script>

<style lang="scss">

</style>
