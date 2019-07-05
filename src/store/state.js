import { palyMode } from 'common/js/config';

const state = {
  singer: {},
  playing: false,
  fullScreen: false,
  playlist: [],
  sequenceList: [], // 播放序列，由播放模式决定
  mode: palyMode.sequence, // 播放模式
  currentIndex: -1, // 当前播放的索引
  
}

export default state;