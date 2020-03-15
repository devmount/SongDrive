<template>
	<div class="shortcuts">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						{{ $t('page.shortcuts') }}
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="columns">
						<div class="column col-12">
							<div class="panel">
								<div class="panel-header">
									<div class="panel-title h5">{{ $t('widget.presentation') }}</div>
								</div>
								<div class="panel-body text-center pb-3">
									<table class="table">
										<tbody>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.S') }}</kbd></td>
												<td>{{ $t('tooltip.syncOn') }} / {{ $t('tooltip.syncOff') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.B') }}</kbd></td>
												<td>{{ $t('tooltip.presentationShow') }} / {{ $t('tooltip.presentationHide') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.K') }}</kbd></td>
												<td>{{ $t('tooltip.chordsShow') }} / {{ $t('tooltip.chordsHide') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.esc') }}</kbd></td>
												<td>{{ $t('tooltip.presentationClose') }}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'shortcuts',
}
</script>

<style lang="scss">

</style>
