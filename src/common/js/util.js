/**
 * 获取 [min, max] 之间的随机整数
 * @param {Number} min 
 * @param {Number} max 
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * 洗牌算法
 * @param {Array} arr 
 * @return {Array} 返回全新数组
 */
export function shuffle(arr) {
  var cpArr = JSON.parse(JSON.stringify(arr));
  for (let i = 0; i < cpArr.length; i++) {
    let j = getRandomInt(0, arr.length - 1);
    let t = cpArr[i];
    cpArr[i] = cpArr[j];
    cpArr[j] = t;
  }
  return cpArr;
}