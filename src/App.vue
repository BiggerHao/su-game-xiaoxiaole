<script setup lang="ts">
import { ref } from 'vue';

const stageRef = ref(null);

</script>

<template>
  <div class="page col">
    <div class="action-bar row align-center justify-around"></div>
    <div class="stage" ref="stageRef"></div>
    <div class="picked-bar" ref="pickedRef"></div>
  </div>
</template>

<style lang="scss" scoped>
.page{
  width: 100vw;
  height: 100vh;
  position: relative;
}
.stage, .picked-bar, .action-bar{
  width: 100%;
  position: relative;
  &>div{
    position: absolute;
  }
}
.action-bar{
  height: 100px;
}
</style>
