<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { randomInt } from './utils/index.js';

const stageRef = ref(null);
const stageWarpperRef = ref(null);
const pickedRef = ref(null);
const pickedWarpperRef = ref(null);

class square {
  private _id: number;
  top: number;
  left: number;
  zIndex: number;
  covered: boolean = false;
  selected: boolean = false;
  deleted: boolean = false;
  src: string;
  top_pre?: number;
  left_pre?: number;

  constructor(id: number, zIndex: number, top: number, left: number, src: string) {
    this.zIndex = zIndex;
    this._id = id;
    this.top = top;
    this.left = left;
    this.src = src;
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
const pickedSquareBorder = ref<number>(1);
const level = ref<number>(3);
const srcRowList: string[] = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
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
    squareList.value[i].covered = false;
    if (squareList.value[i].selected) { continue; }
    for (let j = 0; j < squareList.value.length; j++) {
      if (squareList.value[j].zIndex <= squareList.value[i].zIndex) { continue; }
      if (squareList.value[j].selected) { continue; }
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
        if (isPointIn) { squareList.value[i].covered = true; break; }
      }
      if (squareList.value[i].covered) { break; }
    }
  }
}
let selectedLength = 0;
const init = () => {
  squareList.value = [];
  selectedLength = 0;
  const stage: Element = stageRef.value as unknown as Element;
  stageSize.w = stage.clientWidth;
  stageSize.h = stage.clientHeight;
  squareBorder.value = Math.min(Math.floor(stageSize.w / (level.value + 2.5)), Math.floor(stageSize.h / (level.value + 2.5)));
  const genRandomParticalPos: (linesCount: number, itemLength: number, startOffsetLine?: number,) => number = (linesCount, itemLength, startOffsetLine = 1) => {
    return (randomInt(0, Math.ceil(linesCount - startOffsetLine)) + startOffsetLine) * (itemLength + 3); // +2 (px) border
  }

  let id = 0;
  const addSquare = (z: number, occupiedPos: Position[], i: number) => {
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
    squareList.value.push(new square(id, z, top, left, ''));
    id += 1;
  }
  for (let z = level.value + 1; z > 1; z--) {
    const occupiedPos: Position[] = [];
    const sum = Math.min(Math.max((((z - 1) * (z - 1))) * 2, 6), Math.min(z, level.value) ** 2);
    console.log(`z-index ${z} sum: `, sum);
    for (let i = 0; i < sum; i++) {
      addSquare(z, occupiedPos, i);
    }
  }
  const numNeedAdd: number = 3 - squareList.value.length % 3;
  if (numNeedAdd !== 3) {
    const occupiedPos: Position[] = [];
    for (let i = 0; i < numNeedAdd; i++) {
      addSquare(1, occupiedPos, i);
    }
  }
  const srcAddList: string[] = [];
  while (srcAddList.length !== squareList.value.length) {
    const idx = randomInt(0, srcRowList.length - 1 - Math.floor(Math.abs(level.value / 2 - 4)))
    console.log('range src', Math.floor(Math.abs(level.value / 2 - 4)));
    srcAddList.push(srcRowList[idx]);
    srcAddList.push(srcRowList[idx]);
    srcAddList.push(srcRowList[idx]);
  }
  for (const item of squareList.value) {
    const idx = randomInt(0, srcAddList.length - 1);
    item.src = srcAddList[idx];
    srcAddList.splice(idx, 1);
  }
  checkCover();
}

const handleSelectSquare = (idx: number) => {
  if (squareList.value[idx].covered) { return; }
  if (selectedLength == 8) { alert('fail') };
  const stageWarpper: Element = stageWarpperRef.value as unknown as Element;
  const stage: Element = stageRef.value as unknown as Element;
  const pickedBar: Element = pickedRef.value as unknown as Element;
  const pickeWarpper: Element = pickedWarpperRef.value as unknown as Element;
  console.log((pickedBar.clientHeight - pickedSquareBorder.value) / 2);
  const top: number = (stageWarpper.clientHeight - stage.clientHeight) / 2 + stage.clientHeight + (pickedBar.clientHeight - pickedSquareBorder.value) / 2 - 1;
  const left: number = selectedLength * (pickedSquareBorder.value + 10) + (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2;
  squareList.value[idx].selected = true;
  squareList.value[idx].top_pre = squareList.value[idx].top;
  squareList.value[idx].left_pre = squareList.value[idx].left;
  squareList.value[idx].left = left;
  squareList.value[idx].top = top;
  selectedLength += 1;
  setTimeout(() => {
    const currentSrc = squareList.value[idx].src;
    const samePicked = squareList.value.filter(item => !item.deleted && item.selected && item.src === currentSrc);
    if (samePicked.length === 3) {
      samePicked[0].deleted = true;
      samePicked[1].deleted = true;
      samePicked[2].deleted = true;
      selectedLength -= 3;
      const picked = squareList.value.filter(item => !item.deleted && item.selected);
      picked.sort((a, b) => a.src < b.src ? -1 : 1)
      for (let i = 0; i < picked.length; i++) {
        picked[i].left = i * (pickedSquareBorder.value + 10) + (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2;
      }
    }
    if (selectedLength == 8) { alert('fail') };
    const notDeleted = squareList.value.filter(item => !item.deleted);
    if (!notDeleted || notDeleted.length === 0) {
      nextLevel();
    }
  }, 750)
  checkCover();
}

onMounted(() => {
  init();
  const pickedBar: Element = pickedRef.value as unknown as Element;
  const pickeWarpper: Element = pickedWarpperRef.value as unknown as Element;
  pickedSquareBorder.value = Math.floor((pickedBar.clientWidth - 10 * 7 - (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2) / 7);
  console.log(pickedSquareBorder);
});
</script>

<template>
  <div class="page col align-center">
    <div class="title bold text-center pointer w100" @click="nextLevel">{{level - 2 }}</div>
    <div class="stage-warpper col align-center justify-center" ref="stageWarpperRef">
      <div class="stage" ref="stageRef" :style="{'--size':squareBorder+'px'}">
        <div v-for="item of squareList" :key="item.id"
          :style="`${item.deleted?'display:none;':`top:${item.top}px;left:${item.left}px;z-index:${item.zIndex};${item.selected?`width:${pickedSquareBorder}px;height:${pickedSquareBorder}px;`:''}`}`"
          :class="item.covered? 'covered':'pointer'" @click.prevent="handleSelectSquare(item.id)">
          {{ item.src }}
        </div>
      </div>
    </div>
    <div ref="pickedWarpperRef" class="picked-bar-warpper col align-center justify-center">
      <div class="picked-bar row align-center" ref="pickedRef"></div>
    </div>
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

  .picked-bar-warpper {
    width: 100vw;

    .picked-bar {
      width: 86%;
    }
  }
}

.stage,
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
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%),
      0 3px 10px 0 rgb(0 0 0 / 5%);
    transition: all ease-in-out .5s;
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
