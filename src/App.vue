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
const bgList = [
  "background-image: linear-gradient(45deg, #dd5e89, #f7bb97);",
  "background-image: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);",
  "background-image: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%);",
  "background-image: linear-gradient(45deg, #d299c2 0%, #fef9d7 100%);",
  "background-image: linear-gradient(45deg, #9890e3 0%, #b1f4cf 100%);",
  "background-image: linear-gradient(60deg, #abecd6 0%, #fbed96 100%);",
  "background-image: linear-gradient(45deg, #93a5cf 0%, #e4efe9 100%);",
  "background-image: linear-gradient(145deg, #ffe259, #ffa751);",
  "background-image: linear-gradient(145deg, #dad299, #b0dab9);",
  "background-image: url('https://rescdn.sudaxmt.cn/img/bg_colorful/l4.png');",
]
const bgIdx = randomInt(0, bgList.length - 1);
console.log(new Date(), bgIdx);
const bg = bgList[bgIdx];
const srcPrefix = 'https://rescdn.sudaxmt.cn/g';
const srcRowList: string[] = [
  '/1.png',
  // '/2.png',
  '/3.png',
  '/4.png',
  '/5.png',
  '/6.png',
  '/7.png',
  // '/8.png',
  // '/9.png',
  '/a1.png',
  '/a2.png',
  '/a3.png',
  '/a4.png',
  '/a5.png',
  '/a6.png',
  '/a7.png',
  '/a8.png',
  '/21.png',
  '/31.png',
  '/41.png',
];
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
let gameOver = ref(false);
const init = () => {
  gameOver.value = false;
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
    const idx = randomInt(0, srcRowList.length - 1 - (8 - level.value));
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
  if (gameOver.value) {
    level.value = 3;
    init();
    return;
  }
  if (selectedLength >= 8) {
    gameOver.value = true;
    if ((typeof navigator?.vibrate).toLocaleLowerCase() === 'function') {
      navigator?.vibrate(80);
    }
    return;
  };
  if (squareList.value[idx].covered) { return }
  const stageWarpper: Element = stageWarpperRef.value as unknown as Element;
  const stage: Element = stageRef.value as unknown as Element;
  const pickedBar: Element = pickedRef.value as unknown as Element;
  const pickeWarpper: Element = pickedWarpperRef.value as unknown as Element;
  const orderPicked = () => {
    const picked = squareList.value.filter(item => !item.deleted && item.selected);
    picked.sort((a, b) => a.src < b.src ? -1 : 1)
    for (let i = 0; i < picked.length; i++) {
      picked[i].left = i * (pickedSquareBorder.value + 10) + (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2;
    }
  }
  if (level.value < 7 && (typeof navigator?.vibrate).toLocaleLowerCase() === 'function') {
    navigator?.vibrate(5);
  }
  if (squareList.value[idx].selected && squareList.value[idx].top_pre && squareList.value[idx].left_pre) {
    squareList.value[idx].top = squareList.value[idx].top_pre as number;
    squareList.value[idx].left = squareList.value[idx].left_pre as number;
    squareList.value[idx].selected = false;
    selectedLength -= 1;
    orderPicked();
    checkCover();
    return;
  }

  const top: number = (stageWarpper.clientHeight - stage.clientHeight) / 2 + stage.clientHeight + (pickedBar.clientHeight - pickedSquareBorder.value) / 2 - 1;
  const left: number = selectedLength * (pickedSquareBorder.value + 10) + (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2;
  squareList.value[idx].selected = true;
  squareList.value[idx].top_pre = squareList.value[idx].top;
  squareList.value[idx].left_pre = squareList.value[idx].left;
  squareList.value[idx].left = left;
  squareList.value[idx].top = top;
  selectedLength += 1;
  const currentSrc = squareList.value[idx].src;
  checkCover();

  setTimeout(() => {
    const samePicked = squareList.value.filter(item => !item.deleted && item.selected && item.src === currentSrc);
    if (samePicked.length >= 3) {
      samePicked[0].deleted = true;
      samePicked[1].deleted = true;
      samePicked[2].deleted = true;
      selectedLength -= 3;
      orderPicked();
    }
    const notDeleted = squareList.value.filter(item => !item.deleted);
    if (!notDeleted || notDeleted.length === 0) {
      nextLevel();
    }
  }, 600);
}

onMounted(() => {
  init();
  const pickedBar: Element = pickedRef.value as unknown as Element;
  const pickeWarpper: Element = pickedWarpperRef.value as unknown as Element;
  pickedSquareBorder.value = Math.floor((pickedBar.clientWidth - 10 * 7 - (pickeWarpper.clientWidth - pickedBar.clientWidth) / 2) / 7);
});
</script>

<template>
  <div class="page col align-center" :style="bg">
    <div class="title bold col align-center pointer w100" @click="nextLevel">
      第 {{level - 2 }} 关
    </div>
    <div class="stage-warpper col align-center justify-center" ref="stageWarpperRef">
      <div class="stage" ref="stageRef" :style="{'--size':squareBorder+'px'}">
        <div v-for="item of squareList" :key="item.id"
          :style="`${item.deleted?'display:none;':`background-image: url(${srcPrefix}${item.src});top:${item.top}px;left:${item.left}px;z-index:${item.zIndex};${item.selected?`width:${pickedSquareBorder}px;height:${pickedSquareBorder}px;`:''}`}`"
          :class="item.covered||gameOver? 'covered':''" @click="handleSelectSquare(item.id)">
        </div>
      </div>
    </div>
    <div ref="pickedWarpperRef" class="picked-bar-warpper row align-center justify-center">
      <div class="picked-bar-border row align-center justify-center" :class="gameOver?'failed':''">
        <div class="picked-bar row align-center" ref="pickedRef"></div>
      </div>
    </div>
    <div class="copyright row warp align-center justify-center">
      <div>点击已选择的方块可以放回原位</div>
      <div>苏ICP备19066469号-1</div>
      <div>苏公网安备32050802011229号</div>
      <div>Copyright © 2022 陈昊</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.copyright {
  font-size: 12px;
  height: 30px;
  margin-top: 40px;

  div {
    margin: 0 5px;
  }
}

.page {
  width: 100vw;
  color: #393929;
  height: 100vh;
  position: relative;
  background-size: cover;
  background-position: center;
  text-shadow: 1px 1px 1px rgb(255 255 255 / 30%);

  .title {
    font-size: 32px;
    letter-spacing: 2px;
    line-height: 100px;
    height: 100px;
    margin: 15px 0 5px 0;
  }

  .stage-warpper {
    width: 100vw;
    height: calc(100vh - 100px - 120px - 80px);
  }

  .picked-bar-warpper {
    width: 100vw;

    .failed {
      background: rgba(255, 110, 110, 0.4) !important;
      border: 1px solid rgba(255, 0, 0, 0.8) !important;
    }

    .picked-bar-border {
      width: 90%;
      border-radius: 5px;
      height: 80%;
      background: rgba(241, 241, 241, 0.35);
      border: 1px solid rgba(241, 241, 241, 0.8);
    }

    .picked-bar {
      height: 80px;
      width: 95%;
    }
  }
}

.stage {
  height: 100vw;
  width: 100%;
  position: relative;

  &>div {
    position: absolute;
    background: white;
    border: 1px solid white;
    width: var(--size, 0);
    height: var(--size, 0);
    border-radius: 4px;
    box-shadow: 0 2px 4px 0 rgb(0 0 0 / 10%),
      0 3px 10px 0 rgb(0 0 0 / 5%);
    transition: all ease-in-out .35s;
    overflow: hidden;
    background-size: cover;
    background-position: center;
  }

  .covered {
    filter: brightness(60%);
  }
}
</style>
