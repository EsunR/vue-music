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