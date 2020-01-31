<template>
	<div class="modal modal-sm" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">Sign up</div>
			</div>
			<div class="modal-body">
				<div class="content">
					<p>Create a new SongDrive account.</p>
					<label class="form-label" for="name">Name <span class="text-error">*</span></label>
					<input id="name" type="text" v-model="auth.name" class="form-input mb-1" placeholder="John Doe" />
					<label class="form-label" for="email">Email <span class="text-error">*</span></label>
					<input id="email" type="text" v-model="auth.email" class="form-input mb-1" placeholder="john.doe@example.com" />
					<label class="form-label" for="password">Password <span class="text-error">*</span></label>
					<input id="password" type="password" v-model="auth.password" class="form-input mb-1" placeholder="enter password" />
					<input type="password" v-model="auth.repeat" class="form-input mb-1" placeholder="repeat password" />
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
				<button class="btn btn-primary ml-2" @click="$emit('submitted', auth);$emit('closed')">Confirm Email</button>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'sing-up',
	props: {
		db: Object,
		active: Boolean,
	},
	data () {
		return {
			auth: {
				name: '',
				email: '',
				password: '',
				repeat: '',
			}
		}
	},
}
</script>

<style lang="scss">

</style>
