<template>
  <div id="app">
    <m-header></m-header>
    <tab></tab>
    <router-view></router-view>
  </div>
</template>


<script>
import MHeader from "components/m-header/m-header.vue";
import Tab from "components/tab/tab";

export default {
  components: {
    MHeader,
    Tab
  }
};
</script>


<style lang="stylus" scoped>
@import '~common/stylus/variable';

#app {
  color: $color-theme;
}
</style>

