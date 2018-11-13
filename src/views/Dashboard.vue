<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.svg">
    <HelloWorld msg="SONGDRIVE"/>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>

<style lang="scss">
.home img {
  width: 100px;
}
</style>

