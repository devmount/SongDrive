<template>
	<div class="flex flex-col gap-6 w-full">
		<!-- page heading -->
		<div class="text-3xl uppercase font-thin tracking-wider">
			{{ t('page.shortcuts')}}
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
			<panel class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('page.songs', 2) }} / {{ t('page.setlists', 2) }}
				</div>
				<table class="table-auto border-separate border-spacing-4">
					<tbody>
						<tr>
							<td>
								<kbd><icon-arrow-left /></kbd> /
								<kbd><icon-arrow-right /></kbd>
							</td>
							<td></td>
							<td>{{ t('tooltip.pagination') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.F') }}</kbd></td>
							<td><icon-search /></td>
							<td>{{ t('tooltip.search') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.esc') }}</kbd></td>
							<td><icon-x /></td>
							<td>{{ t('tooltip.clear') }}</td>
						</tr>
					</tbody>
				</table>
			</panel>
			<panel class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('widget.songView') }}
				</div>
				<table class="table-auto border-separate border-spacing-4">
					<tbody>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.K') }}</kbd></td>
							<td><icon-music /></td>
							<td>{{ t('tooltip.chordsShow') }} / {{ t('tooltip.chordsHide') }}</td>
						</tr>
						<tr>
							<td>
								<kbd><icon-arrow-right /></kbd> /
								<kbd><icon-arrow-up /></kbd>
							</td>
							<td></td>
							<td>{{ t('tooltip.transposeUp') }}</td>
						</tr>
						<tr>
							<td>
								<kbd><icon-arrow-left /></kbd> /
								<kbd><icon-arrow-down /></kbd>
							</td>
							<td></td>
							<td>{{ t('tooltip.transposeDown') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.R') }}</kbd></td>
							<td><icon-reload /></td>
							<td>{{ t('tooltip.keyReset') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.P') }}</kbd></td>
							<td><icon-presentation /></td>
							<td>{{ t('tooltip.presentationStart') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.I') }}</kbd></td>
							<td><icon-info-circle /></td>
							<td>{{ t('tooltip.infoSongData') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.L') }}</kbd></td>
							<td><icon-brightness /></td>
							<td>{{ t('tooltip.invertColors') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.esc') }}</kbd></td>
							<td><icon-x /></td>
							<td>{{ t('tooltip.presentationClose') }}</td>
						</tr>
					</tbody>
				</table>
			</panel>
			<panel class="flex flex-col gap-4">
				<div class="text-2xl">
					{{ t('widget.setlistView') }}
				</div>
				<table class="table-auto border-separate border-spacing-4">
					<tbody>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.S') }}</kbd></td>
							<td><icon-refresh /></td>
							<td>{{ t('tooltip.syncOn') }} / {{ t('tooltip.syncOff') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.K') }}</kbd></td>
							<td><icon-music /></td>
							<td>{{ t('tooltip.chordsShow') }} / {{ t('tooltip.chordsHide') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.P') }}</kbd></td>
							<td><icon-presentation /></td>
							<td>{{ t('tooltip.presentationStart') }}</td>
						</tr>
						<tr>
							<td>
								<kbd><icon-arrow-right /></kbd> /
								<kbd><icon-arrow-down /></kbd>
							</td>
							<td></td>
							<td>{{ t('tooltip.nextSlide') }}</td>
						</tr>
						<tr>
							<td>
								<kbd><icon-arrow-left /></kbd> /
								<kbd><icon-arrow-up /></kbd>
							</td>
							<td></td>
							<td>{{ t('tooltip.previousSlide') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.B') }}</kbd></td>
							<td><icon-eye-off /></td>
							<td>{{ t('tooltip.presentationShow') }} / {{ t('tooltip.presentationHide') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.I') }}</kbd></td>
							<td><icon-info-circle /></td>
							<td>{{ t('tooltip.infoSongData') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.ctrl') }}</kbd>&nbsp;+&nbsp;<kbd>{{ t('key.L') }}</kbd></td>
							<td><icon-brightness /></td>
							<td>{{ t('tooltip.invertColors') }}</td>
						</tr>
						<tr>
							<td><kbd>{{ t('key.esc') }}</kbd></td>
							<td><icon-x /></td>
							<td>{{ t('tooltip.presentationClose') }}</td>
						</tr>
					</tbody>
				</table>
			</panel>
		</div>
	</div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import Panel from '@/elements/Panel';

// icons
import {
	IconArrowDown,
	IconArrowLeft,
	IconArrowRight,
	IconArrowUp,
	IconBrightness,
	IconEyeOff,
	IconInfoCircle,
	IconMusic,
	IconPresentation,
	IconRefresh,
	IconReload,
	IconSearch,
	IconX,
} from '@tabler/icons-vue';

// component constants
const { t } = useI18n();
</script>
