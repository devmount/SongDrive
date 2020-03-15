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
												<td><kbd><ion-icon name="arrow-forward"></ion-icon></kbd> / <kbd><ion-icon name="arrow-down"></ion-icon></kbd></td>
												<td></td>
												<td>{{ $t('tooltip.nextSlide') }}</td>
											</tr>
											<tr>
												<td><kbd><ion-icon name="arrow-back"></ion-icon></kbd> / <kbd><ion-icon name="arrow-up"></ion-icon></kbd></td>
												<td></td>
												<td>{{ $t('tooltip.previousSlide') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.S') }}</kbd></td>
												<td><ion-icon name="sync"></ion-icon></td>
												<td>{{ $t('tooltip.syncOn') }} / {{ $t('tooltip.syncOff') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.B') }}</kbd></td>
												<td><ion-icon name="eye-off-outline"></ion-icon></td>
												<td>{{ $t('tooltip.presentationShow') }} / {{ $t('tooltip.presentationHide') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.ctrl') }}</kbd> + <kbd>{{ $t('key.K') }}</kbd></td>
												<td><ion-icon name="musical-notes"></ion-icon></td>
												<td>{{ $t('tooltip.chordsShow') }} / {{ $t('tooltip.chordsHide') }}</td>
											</tr>
											<tr>
												<td><kbd>{{ $t('key.esc') }}</kbd></td>
												<td><ion-icon name="close"></ion-icon></td>
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
