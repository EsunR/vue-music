# 开发日志

# 1. 推荐界面

## 1.1 jsonp插件

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

## 1.2 解决轮播图元素无法挂载className的问题

在项目中会使用 `slider` 组件，这个组件在被渲染时会对组件内的元素样式进行初始化。然而轮播图的数据时父组件加载完成后图片需要通过组件插槽才会被插入 `slider` 组件中的。这就产生了一个问题，当 `slider` 组件被初始化时，图片数据还未加载，也就是说轮播图还未被插入进组件，就进行了轮播图样式初始化的操作，这显然是顺序错误的。

错误顺序：加载组件=>初始化组件样式=>获取数据=>将数据映射为DOM元素插入组件

利用获取数据后的回调函数进行组件的挂载过于复杂，索引我们可以利用 `v-if` 来控制 `slider` 组件在插入父级元素的时机，当数据获取完成之后，再渲染组件DOM：

```html
<!-- 调用slider组件的父组件，recommend是获取的数据 -->
<slider v-if="recommends.length">
  <div v-for="item in recommends" :key="item.id">
    <a :href="item.linkUrl">
      <img :src="item.picUrl">
    </a>
  </div>
</slider>
```

正确顺序：获取数据=>加载组件=>将数据映射为DOM元素插入组件=>初始化组件样式

## 1.3 slider组件的优化

### 使用 `<keep-alive>` 组件保持页面不被销毁

当 `<router-view>` 组件切换路由时，组件会被销毁，所有数据请求都会重新获取，这在该应用中是没有必要的，所以我们可以用 `<keep-alive>` 组件去保持页面不会销毁和重新渲染

```js
<keep-alive>
  <router-view></router-view>
</keep-alive>
```

## 1.4 反向代理QQ音乐API

由于QQ音乐的api做了访问限制，只有QQ音乐的域名才能够请求api来获取数据，这与其后台api设置的 `Access-Control-Allow-Origin` 有关。

反向代理的原理就是在我们自己的服务器上去访问QQ音乐的API，同时在访问时修改http请求的head，让QQ音乐的api服务器认为我们的请求是被允许的，在我们的服务器端获取到数据后，我们的应用只需要访问我们的服务器即可获取到数据。

使用axios做反向代理的示例：

```js
router.get('/getDiscList', (req, res) => {
  var url = 'https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg'
  axios.get(url, {
    headers: {
      // 修改请求头
      referer: 'https://c.y.qq.com/',
      host: 'c.y.qq.com'
    },
    // 获取url参数
    params: req.query
  }).then((response) => {
    res.json(response.data)
  }).catch((e) => {
    console.log(e)
  })
})
```

## 1.5 子组件的事件代理

拿滚动组件 `scroll.vue` 来说，其内部定义了一个 BetterScroll 对象的实例挂载于该组件上，我们想要从外部控制其内部的 BetterScroll 实例，我们要调用 BetterScroll 对象上的方法，则必须通过访问该子组件，在访问该子组件上的 BetterScroll 实例，再通过其实例访问其内部的方法，如：

```js
// 假设子组件的 ref 属性为 “listview”， 子组件内部的 BetterScroll 实例为 this.scroll
this.$refs.listview.scroll.scrollToElement(el,time);
```

> 当我们用 `$refs` 去获取一个Vue的组件DOM时，获取的实际上是一个VueComponent对象

这样显然很麻烦，也不符合Vue直接操作对象实例的规定。所以我们可以通过在子组件内部代理一个 `scrollToElement` 事件从而简化父组件对子组件内的 BetterScroll 实例进行的操作。

```js
// scrool.vue
methods: {
  scrollToElement() {
    this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
  }
}
```

这样在父组件中如果我们要调用 BetterScroll 实例的方法时，只需要执行：

```js
this.$refs.listview.scrollToElement(el,time);
```


## 1.6 合理利用Vue单个组件对象保存变量

我们在使用单个Vue文件去编写一个组件的时候，每个组件对象都被Vue进行了处理，实例化为一个Vue对象，我们在data中设置的数据、methods中编写的方法，都会被挂载到这个组件对象上，因此我们可以通过 `this` 来访问到所有的方法、数据。

同理，我们可以在对象本身上添加一些属性，这样就可以在组件内部通过 `this` 来进行调用。比如组件的两个方法之间存在一个共用的变量，我们就可以在 `created()` 生命周期函数中，将该变量挂载到 `this` 上，比如：

```js
created(){
  this.obj = {}
}
```

这样我们在不同的方法函数中都可以操作这个变量 `obj` 。

使用 `data` 也可以进行此类操作，但是 `data` 中存放的数据我们主要是用于做DOM映射的，Vue会在其身上挂载geter和seter，单纯作为变量使用的变量没有必要存放于 `data` 中。




# 2. 歌手页面

## 2.1 处理歌手列表的快捷操作思路（通讯录快捷列表）

![20190621202732.png](http://img.cdn.esunr.xyz/markdown/20190621202732.png)

### 数据分组：

首先将数据进行头字母分组排序，分组的格式为:

```js
data: [
  {
    title: '热门',
    items: [{name: "aa"}, {name: "bb"} ... ...]
  }，
  {
    title: 'A',
    items: [{name: "a1"}, {name: "a2"} ... ...]
  },
  {
    title: 'B',
    items: [{name: "b1"}, {name: "b2"} ... ...]
  }
  ... ...
]
```

### 点击快捷列表进行快速定位

遍历第一步分组好的数据，并将 `data.title` 的数据存放为一个数组，将数组进行遍历最后渲染出列表，并且在每个渲染出来的列表DOM中添加一个 `data-index` 属性存放索引值。

我们将 `data` 中的数据分别分为多个 `list-group` 渲染出来。当我们点击右边的快捷列表中的某个字母时，会判断我们当前点击的字母DOM的 `data-index` 属性，从而获取其索引值，如项目中 `A` 的索引值为 `1` ，那么就应该跳转到第二组分类中，我们可以利用这个索引值，来获取到对应的DOM节点。我们只需要使用 BetterScroll 的 `scrollTo` 方法就可以滚动到对应DOM的位置上。

### 在快捷列表上滑动定位

当用户手指点击到屏幕上时，记录当前手指在屏幕上Y轴的位置，再监听 `touchmove` 事件，获取用户手指在滑动时Y轴的位置。这样我们就可以实时计算出用户手指滑动的距离。

获得滑动距离后，我们只需要计算在用户滑动过了多少个快捷列表按钮，再加上用户开始滑动时的快捷列表按钮的索引值，就可以得出用户当前手指滑动到的快捷列表按钮的索引值，计算公式为：

```js
// ANCHOR_HEIGHT为索引列表按钮的高度
let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
// 获取用户滑动手指时当前所在按钮的索引值
let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
```

之后我们跟点击快捷列表时的操作一样，获取到索引值后利用 `scrollTo` 跳转到对应位置。

### 滑动主列表时，快捷列表上的索引会高亮显示

我们先要获取一个数组，这个数组中存放的是每个区域的边界值，我们可以通过遍历每个 `list-group` 的 `clientHeight` 来获取到每个元素的高度从而计计算出边界值。

![20190621210722.png](http://img.cdn.esunr.xyz/markdown/20190621210722.png)

我们通过监听滚动事件，可以获取页面滚动的高度，由边界值数组，我们可以计算出我们当前滚动在那个边界值中，通过数组的索引，我们可以得到快捷列表的索引。

只需要在 `data` 上挂载一个 `currentIndex` 通过改变这个索引值就可以来改变DOM的css样式。

## 2.2 Fixtitle的实现

Fixtitle即