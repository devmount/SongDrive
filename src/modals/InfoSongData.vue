<template>
	<div class="modal modal-md" :class="{ active: active }">
		<a href="#" class="modal-overlay" aria-label="Close" @click.prevent="$emit('closed')"></a>
		<div class="modal-container">
			<div class="modal-header">
				<a href="#" class="btn btn-clear float-right" aria-label="Close" @click.prevent="$emit('closed')"></a>
				<div class="modal-title h5">{{ $t('modal.songInfo') }}</div>
			</div>
			<div class="modal-body">
				<div v-if="song.note">
					<div class="text-bold">{{ $t('field.note') }}</div>
					<p v-html="song.note"></p>
				</div>
			</div>
			<div class="modal-footer"></div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'info-song-data',
	props: {
		active: Boolean,
		song: Object
	},
}
</script>
