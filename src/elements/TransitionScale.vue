<template>
	<transition
		enter-from-class="opacity-0 scale-90"
		enter-active-class="transition-all ease-out"
		enter-to-class="opacity-100 scale-100"
		leave-from-class="opacity-100 scale-100"
		leave-active-class="transition-all ease-in delay-150"
		leave-to-class="opacity-0 scale-90"
	>
		<slot></slot>
	</transition>
</template>
