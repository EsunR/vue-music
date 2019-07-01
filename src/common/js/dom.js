/**
 * 想某个元素中插入一组Class
 * @param {Object} el 要插入Class的Dom元素
 * @param {String} className 要插入的ClassName
 */
export function addClass(el, className) {
  if (hasClass(el, className)) {
    return;
  }
  let newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ');
}


/**
 * 判断一个元素内是否包含一个className
 * @param {Object} el Dom元素
 * @param {String} className class名称
 */
export function hasClass(el, className) {
  let reg = new RegExp('(^|\\s)' + className + '($|\\s)');
  return reg.test(el.className);
}


/**
 * 为DOM元素设置 "data-" 属性，或者获取 "data-" 属性的值
 * @param {Object} el DOM元素
 * @param {String} name 获取属性名（data-后面的值）
 * @param {val} val 为dom元素设置的值
 */
export function getSetData(el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val);
  } else {
    return el.getAttribute(name);
  }
}

// 能力检测
let elementStyle = document.createElement('div').style

let vendor = (() => {

})