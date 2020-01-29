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
					<input type="text" v-model="auth.email" class="form-input mb-1" placeholder="email" />
					<input type="password" v-model="auth.password" class="form-input mb-1" placeholder="password" />
					<input type="password" v-model="auth.repeat" class="form-input mb-1" placeholder="repeat password" />
				</div>
			</div>
			<div class="modal-footer">
				<a class="btn btn-link btn-gray" href="#" aria-label="Cancel" @click.prevent="$emit('closed')">Cancel</a>
				<button class="btn btn-primary ml-2" @click="signUp">Send Confirmation Mail</button>
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
				email: '',
				password: '',
				repeat: '',
			}
		}
	},
	methods: {
		signUp () {
			var self = this
			this.db.collection('songs').doc(this.id).delete().then(function() {
				self.$emit('closed')
				if (self.$route.name != 'songs') {
					self.$router.push({ name: 'songs' })
				}
				// toast success message
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Success!',
					text: 'The song was removed.',
					type: 'toast-primary'
				});
			}).catch(function() {
				self.$emit('closed')
				// toast error message
				self.$notify({
					title: '<button class="btn btn-clear float-right"></button>Error!',
					text: 'The song could not be removed.',
					type: 'toast-error'
				});
			});
		},
	}
}
</script>

<style lang="scss">

</style>
