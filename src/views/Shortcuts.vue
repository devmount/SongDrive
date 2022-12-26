<template>
	<div class="shortcuts">
		<div class="container no-sidebar">
			<div class="columns">
				<!-- heading -->
				<div class="column col-12">
					<h2 class="view-title">
						{{ t('page.shortcuts') }}
					</h2>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">{{ t('page.songs') }} / {{ t('page.setlists') }}</div>
						</div>
						<div class="panel-body text-center pb-3">
							<table class="table">
								<tbody>
									<tr>
										<td>
											<kbd><ion-icon :icon="arrowBack" /></kbd> /
											<kbd><ion-icon :icon="arrowForward" /></kbd>
										</td>
										<td></td>
										<td>{{ t('tooltip.pagination') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.F') }}</kbd></td>
										<td><ion-icon :icon="search" /></td>
										<td>{{ t('tooltip.search') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.esc') }}</kbd></td>
										<td><ion-icon :icon="closeOutline" /></td>
										<td>{{ t('tooltip.clear') }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">{{ t('widget.songView') }}</div>
						</div>
						<div class="panel-body text-center pb-3">
							<table class="table">
								<tbody>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.K') }}</kbd></td>
										<td><ion-icon :icon="musicalNotes" /></td>
										<td>{{ t('tooltip.chordsShow') }} / {{ t('tooltip.chordsHide') }}</td>
									</tr>
									<tr>
										<td>
											<kbd><ion-icon :icon="arrowForward" /></kbd> /
											<kbd><ion-icon :icon="arrowUp" /></kbd>
										</td>
										<td></td>
										<td>{{ t('tooltip.transposeUp') }}</td>
									</tr>
									<tr>
										<td>
											<kbd><ion-icon :icon="arrowBack" /></kbd> /
											<kbd><ion-icon :icon="arrowDown" /></kbd>
										</td>
										<td></td>
										<td>{{ t('tooltip.transposeDown') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.R') }}</kbd></td>
										<td><ion-icon :icon="musicalNote" /></td>
										<td>{{ t('tooltip.keyReset') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.P') }}</kbd></td>
										<td><ion-icon :icon="videocamOutline" /></td>
										<td>{{ t('tooltip.presentationStart') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.I') }}</kbd></td>
										<td><ion-icon :icon="informationOutline" /></td>
										<td>{{ t('tooltip.infoSongData') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.L') }}</kbd></td>
										<td><ion-icon :icon="contrastOutline" /></td>
										<td>{{ t('tooltip.invertColors') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.esc') }}</kbd></td>
										<td><ion-icon :icon="close" /></td>
										<td>{{ t('tooltip.presentationClose') }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
				<div class="column col-4 col-xl-6 col-sm-12 mt-4">
					<div class="panel">
						<div class="panel-header">
							<div class="panel-title h5">{{ t('widget.setlistView') }}</div>
						</div>
						<div class="panel-body text-center pb-3">
							<table class="table">
								<tbody>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.S') }}</kbd></td>
										<td><ion-icon :icon="sync" /></td>
										<td>{{ t('tooltip.syncOn') }} / {{ t('tooltip.syncOff') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.K') }}</kbd></td>
										<td><ion-icon :icon="musicalNotes" /></td>
										<td>{{ t('tooltip.chordsShow') }} / {{ t('tooltip.chordsHide') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.P') }}</kbd></td>
										<td><ion-icon :icon="videocamOutline" /></td>
										<td>{{ t('tooltip.presentationStart') }}</td>
									</tr>
									<tr>
										<td>
											<kbd><ion-icon :icon="arrowForward" /></kbd> /
											<kbd><ion-icon :icon="arrowDown" /></kbd>
										</td>
										<td></td>
										<td>{{ t('tooltip.nextSlide') }}</td>
									</tr>
									<tr>
										<td>
											<kbd><ion-icon :icon="arrowBack" /></kbd> /
											<kbd><ion-icon :icon="arrowUp" /></kbd>
										</td>
										<td></td>
										<td>{{ t('tooltip.previousSlide') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.B') }}</kbd></td>
										<td><ion-icon :icon="eyeOffOutline" /></td>
										<td>{{ t('tooltip.presentationShow') }} / {{ t('tooltip.presentationHide') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.I') }}</kbd></td>
										<td><ion-icon :icon="informationOutline" /></td>
										<td>{{ t('tooltip.infoSongData') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.L') }}</kbd></td>
										<td><ion-icon :icon="contrastOutline" /></td>
										<td>{{ t('tooltip.invertColors') }}</td>
									</tr>
									<tr>
										<td><kbd>{{ t('key.esc') }}</kbd></td>
										<td><ion-icon :icon="close" /></td>
										<td>{{ t('tooltip.presentationClose') }}</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useI18n } from "vue-i18n";
import {
	arrowBack,
	arrowDown,
	arrowForward,
	arrowUp,
	close,
	closeOutline,
	contrastOutline,
	eyeOffOutline,
	informationOutline,
	musicalNote,
	musicalNotes,
	search,
	sync,
	videocamOutline
} from 'ionicons/icons';
const { t } = useI18n();
</script>
