<template>
	<transition
		enter-from-class="opacity-0"
		enter-active-class="transition-all ease-out"
		enter-to-class="opacity-100"
		leave-from-class="opacity-100"
		leave-active-class="transition-all ease-in"
		leave-to-class="opacity-0"
	>
		<slot></slot>
	</transition>
</template>
