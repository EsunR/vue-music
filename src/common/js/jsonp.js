import originJSONP from 'jsonp';

/**
 * 封装原始jsonp方法为一个Promise对象
 * @param {String} url 请求地址
 * @param {Object} data 请求地址url中携带的参数
 * @param {Object} option jsonp插件选项（如jsonp中执行的函数名）
 */
export default function jsonp(url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data);
      } else {
        reject(err);
      }
    })
  })
}

function param(data) {
  let url = '';
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : '';
    url += `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}