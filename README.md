# 开发日志

## jsonp插件

### 安装：

```
npm install jsonp -S
```

### 使用说明：

jsonp(url，opts，fn)

*   `url` ( `String` )url来获取
*   `opts` ( `Object` )，可选
    *   `param` ( `String` )用于指定回调的查询字符串参数的名称(默认为 `callback` )
    *   `timeout` ( `Number` )发出超时错误后多长时间。 `0` 禁用(默认为 `60000` )
    *   `prefix` ( `String` )前缀用于处理jsonp响应的全局回调函数(默认为 `__jp` )
    *   `name` ( `String` )处理jsonp响应的全局回调函数的名称(默认为 `prefix` +递增计数器)
*   `fn` 打回来

使用 `err, data` 参数 调用回调 。

如果超时， `err` 将是一个 `Error` 对象，它 `message` 是 `Timeout` 。

返回一个函数，当被调用时，将取消正在进行的jsonp请求( `fn` 不会被调用)。

### 注意事项：

我们在 `common/js/jsonp.js` 文件中对jsonp插件进行了封装，将其封装为一个Promise对象，并且可以传入一个Object作为url的后缀参数。

我们使用了一个jsonp插件 `opts` 参数的属性，即`parma`。我们知道jsonp的原理是在window下定义一个全局回调函数，在返回的jsonp数据中去执行这个回调函数，那么前后台就会需要去约定这个回调函数名。

所以我们可以利用url传参，使用一个参数去规定这个全局回调函数的名字，如 `http://127.0.0.0?callback=_fn`，`param` 参数就是去规定后缀参数的key，默认为 `callback`，在QQ音乐的jsonp规范中为 `jsonpCallback`。

同时我们可以利用jsonp插件 `opts` 参数的 `prefix` 属性去定义全局回调函数的函数名即为url传参中的value，如果我们不规定的话，默认为 `__jp`