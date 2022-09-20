<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { randomInt } from './utils/index.js';

const stageRef = ref(null);

class square {
  private _id: number;
  top: number;
  left: number;
  zIndex: number;
  covered: boolean = false;

  constructor(id: number, zIndex: number, top: number, left: number) {
    this.zIndex = zIndex;
    this._id = id;
    this.top = top;
    this.left = left;
  }

  get id() {
    return this._id;
  }
}

interface Size {
  w: number,
  h: number
}
interface Position {
  top: number,
  left: number
}

const stageSize: Size = {
  w: -1,
  h: -1
}

const squareList = ref<Array<InstanceType<typeof square>>>([]);
const squareBorder = ref<number>(1);
const level = ref<number>(3);
const nextLevel = () => {
  if (level.value <= 7) {
    level.value += 1;
    init();
  } else {
    alert('All Passed!')
  }
}
const checkCover = () => {
  for (let i = 0; i < squareList.value.length; i++) {
    for (let j = 0; j < squareList.value.length; j++) {
      if (squareList.value[j].zIndex <= squareList.value[i].zIndex) { continue; }
      console.log(111);
      const x1 = squareList.value[i].left;
      const x2 = x1 + squareBorder.value;
      const y1 = squareList.value[i].top;
      const y2 = y1 + squareBorder.value;
      const points: Position[] = [
        { top: squareList.value[j].top, left: squareList.value[j].left },
        { top: squareList.value[j].top + squareBorder.value, left: squareList.value[j].left },
        { top: squareList.value[j].top, left: squareList.value[j].left + squareBorder.value },
        { top: squareList.value[j].top + squareBorder.value, left: squareList.value[j].left + squareBorder.value }
      ];
      for (const point of points) {
        const isPointIn: Boolean = point.top < y2 && point.top > y1 && point.left > x1 && point.left < x2;
        console.log(isPointIn);
        if (isPointIn) { squareList.value[i].covered = true; console.log(i); break; }
      }
      if (squareList.value[i].covered) { break; }
    }
  }
}
const init = (stage: Element = stageRef.value as unknown as Element) => {
  stageSize.w = stage.clientWidth;
  stageSize.h = stage.clientHeight;
  squareBorder.value = Math.min(Math.floor(stageSize.w / (level.value + 2.5)), Math.floor(stageSize.h / (level.value + 2.5)));
  const genRandomParticalPos: (linesCount: number, itemLength: number, startOffsetLine?: number,) => number = (linesCount, itemLength, startOffsetLine = 1) => {
    return (randomInt(0, Math.ceil(linesCount - startOffsetLine)) + startOffsetLine) * (itemLength + 3); // +2 (px) border
  }

  let id = 0;
  for (let z = level.value + 1; z > 1; z--) {
    const occupiedPos: Position[] = [];
    const sum = Math.min(Math.max((((z - 1) * (z - 1))) * 2, 6), Math.min(z, level.value) ** 2);
    console.log(sum);
    for (let i = 0; i < sum; i++) {
      let top: number;
      let left: number;
      let occupiedFLag: boolean;
      do {
        const params = [level.value, squareBorder.value, (level.value + 2 - z) * 0.5]
        top = genRandomParticalPos(params[0], params[1], params[2]);
        left = genRandomParticalPos(params[0], params[1], params[2]);
        occupiedFLag = !!occupiedPos.find(item => item.top == top && item.left == left);
      } while (occupiedFLag)
      occupiedPos[i] = { top, left };
      squareList.value.push(new square(id, z, top, left));
      id += 1;
    }
  }
  checkCover();
  console.log(squareList.value);
}

onMounted(() => {
  if (stageRef.value) {
    init(stageRef.value);
  }
});
</script>

<template>
  <div class="page col align-center">
    <div class="title bold text-center pointer w100" @click="nextLevel">{{level - 2 }}</div>
    <div class="stage-warpper col align-center justify-center">
      <div class="stage" ref="stageRef" :style="{'--size':squareBorder+'px'}">
        <div v-for="item of squareList" :key="item.id"
          :style="`top:${item.top}px;left:${item.left}px;z-index:${item.zIndex};`"
          :class="item.covered? 'covered':'pointer'">
          {{ item.id }}
        </div>
      </div>
    </div>
    <div class="picked-bar" ref="pickedRef"></div>
    <div class="action-bar row align-center justify-around"></div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  width: 100vw;
  height: 100vh;
  position: relative;

  .title {
    font-size: 20px;
    letter-spacing: 2px;
    line-height: 70px;
    height: 70px;
  }

  .stage-warpper {
    width: 100vw;
    height: calc(100vh - 100px - 80px - 70px);
    background: greenyellow;
  }
}

.stage,
.picked-bar,
.action-bar {
  width: 100%;
  position: relative;
}

.stage {
  height: 100vw;

  &>div {
    position: absolute;
    background: white;
    border: 1px solid white;
    width: var(--size, 0);
    height: var(--size, 0);
    border-radius: 4px;
    box-shadow: 0 4px 8px 0 rgb(0 0 0 / 10%),
      0 6px 20px 0 rgb(0 0 0 / 5%);
  }

  .covered {
    background: rgb(220, 220, 220) !important;
  }
}

.action-bar {
  height: 80px;
  background: blueviolet;
}

.picked-bar {
  background: salmon;
  height: 100px;
}
</style>
