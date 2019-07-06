# 开发日志

```
┌──────────────────┐
|    ---------     |
|   / / 0 0 \ \    |
|  /  |  v  |  \   |
|      \ _ /       |
|        |         |
|       /|\        |
|      / | \       |
|        |         |              Vue-Music Developing Log
|       / \        |              
|      /   \       |              -- By: EsunR
|     /     \      |
|------------------|
|  哈哈哈哈哈哈哈哈 |
|  23333333333333  |
|  红红火火恍恍惚惚 |
└──────────────────┘
```

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

### 2.1.1 数据分组：

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

### 2.1.2 点击快捷列表进行快速定位

遍历第一步分组好的数据，并将 `data.title` 的数据存放为一个数组，将数组进行遍历最后渲染出列表，并且在每个渲染出来的列表DOM中添加一个 `data-index` 属性存放索引值。

我们将 `data` 中的数据分别分为多个 `list-group` 渲染出来。当我们点击右边的快捷列表中的某个字母时，会判断我们当前点击的字母DOM的 `data-index` 属性，从而获取其索引值，如项目中 `A` 的索引值为 `1` ，那么就应该跳转到第二组分类中，我们可以利用这个索引值，来获取到对应的DOM节点。我们只需要使用 BetterScroll 的 `scrollTo` 方法就可以滚动到对应DOM的位置上。

### 2.1.3 在快捷列表上滑动定位

当用户手指点击到屏幕上时，记录当前手指在屏幕上Y轴的位置，再监听 `touchmove` 事件，获取用户手指在滑动时Y轴的位置。这样我们就可以实时计算出用户手指滑动的距离。

获得滑动距离后，我们只需要计算在用户滑动过了多少个快捷列表按钮，再加上用户开始滑动时的快捷列表按钮的索引值，就可以得出用户当前手指滑动到的快捷列表按钮的索引值，计算公式为：

```js
// ANCHOR_HEIGHT为索引列表按钮的高度
let delta = ((this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT) | 0;
// 获取用户滑动手指时当前所在按钮的索引值
let anchorIndex = parseInt(this.touch.anchorIndex) + delta;
```

之后我们跟点击快捷列表时的操作一样，获取到索引值后利用 `scrollTo` 跳转到对应位置。

### 2.1.4 滑动主列表时，快捷列表上的索引会高亮显示

我们先要获取一个数组，这个数组中存放的是每个区域的边界值，我们可以通过遍历每个 `list-group` 的 `clientHeight` 来获取到每个元素的高度从而计计算出边界值。

![20190621210722.png](http://img.cdn.esunr.xyz/markdown/20190621210722.png)

我们通过监听滚动事件，可以获取页面滚动的高度，由边界值数组，我们可以计算出我们当前滚动在那个边界值中，通过数组的索引，我们可以得到快捷列表的索引。

只需要在 `data` 上挂载一个 `currentIndex` 通过改变这个索引值就可以来改变DOM的css样式。

## 2.2 FixedTitle的实现

FixedTtle即固定在列表顶端的标题，用来显示当前的分组，也是一个简单的吸顶效果，它主要分为如下几个阶段要点：

- FixedTitle会一直固定在顶部
- 当在顶部下拉时FixedTitle会被跟随下拉
- 当下一个标题与FixedTitle接触时，FixedTitle会被上顶
  
![20190622095552.png](http://img.cdn.esunr.xyz/markdown/20190622095552.png)

### 2.2.1 固定标题的实现思路

其实FixedTitile是一个独立的DIV元素，它被固定在顶部渲染，用一个变量保存文案的内容，当滚动到不同区域时，有区域索引值获取到标题的文案，再填充到FixedTitle的文本中。

```html
<div class="list-fixed" ref="fixed">
  <h1 class="fixed-title">{{fixedTitle}}</h1>
</div>
```

### 2.2.2 当在顶部下拉时FixedTitle会被跟随下拉

这个实现的原理就是当顶部下拉时，我们将 `fixedTitle` 变量空置，之后再使用 `v-show` 来隐藏FixedTitle，这样就会让用户感觉FixedTitle被下拉了：

```html
<div class="list-fixed" ref="fixed" v-show="fixedTitle">
  <h1 class="fixed-title">{{fixedTitle}}</h1>
</div>
```

### 2.2.3 当下一个标题与FixedTitle接触时，FixedTitle会被上顶

我们需要在 `data` 设置一个变量为 `diff` ，其代表了上方FixedTitle的顶部距离下方标题栏顶部的距离，其是由list-group的边界值计算得出的：

![20190622104108.png](http://img.cdn.esunr.xyz/markdown/20190622104108.png)

当fixedTitle与listGropuTitle发生接触时，diff的取值范围为 `0~FiexdTitle的高度` 这时我们便可以求出fixedTitle被顶到视口上方的距离：

![20190622105138.png](http://img.cdn.esunr.xyz/markdown/20190622105138.png)

之后我们可以通过js来调整fixedTitle的css样式即可让其向上偏移：

```js
// this.$refs.fixed 是获取fixedTitle的DOM对象
this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`;
```

# 3. Vuex的使用

## 3.1 使用严格模式

按照规范，所有的Vuex数据变动都需要通过mutation来操作，如果我们开启Vuex的严格模式，所有的非法操作都会在控制台中报错，以便我们开发。

```js
const store = new Vuex.Store({
  // ...
  strict: true
})
```

> 不要在发布环境下启用严格模式！严格模式会深度监测状态树来检测不合规的状态变更——请确保在发布环境下关闭严格模式，以避免性能损失。 --[官方文档](https://vuex.vuejs.org/zh/guide/strict.html)

所以对于是否开启一个严格模式，我们可以通过检查打包环境是否为开发环境还是生产环境，来决定是否启用严格模式。其中，检查当前打包环境可以通过 `process.env.NODE_ENV !== 'production'` 的判断结果来取得。

```js
const store = new Vuex.Store({
  // ...
  strict: process.env.NODE_ENV !== 'production'
})
```

## 3.2 使用插件

采用 `createLogger` 插件，当Vuex的state数据发生变动时，会在控制台中打印出一条记录。

## 3.3 使用辅助函数（语法糖）

### mapMutations

你可以在组件中使用 `this.$store.commit('xxx')` 提交 mutation，或者使用 `mapMutations` 辅助函数将组件中的 methods 映射为 `store.commit` 调用（需要在根节点注入 `store`）。

```js
import { mapMutations } from 'vuex'

export default {
  // ...
  methods: {
    ...mapMutations([
      'increment', // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      'incrementBy' // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: 'increment' // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
}
```

> 同样的，`mapGetters` 可以作用在 `computed` 上，提供便捷的属性获取（只读）；`mapActions` 可以作用在 `methods` 上，提供便捷的数据更改操作。其用法与 `mapMutations` 相似。





# 4. 歌手详情页

## 4.1 歌手详情页布局

歌手是通过路由进行跳转过去的，其总体页面为 `singer-detal.vue` 文件，该页面中处理了歌曲列表数据，并对数据进行了规范化。其整体的 `template` 部分仅一个 `music-list` 组件，向子组件内部分别传递了歌曲列表、歌手图片以及歌手名字。

![20190701120851.png](http://img.cdn.esunr.xyz/markdown/20190701120851.png)

![20190701120418.png](http://img.cdn.esunr.xyz/markdown/20190701120418.png)

## 4.2 歌手详情页如何处理上滑效果

![](http://markdown.img.esunr.xyz/上滑效果.gif)

页面很自然的被我们分为两个部分，顶部歌手图片层，底部列表层，但是为了实现上面的效果，我们必须做一个layer层，整体的思路为：

- 让歌手图片放在最底层，其宽高比为10:7
- layer层放在中部，其高度为视口高度
- 顶层放置歌曲列表

当列表上滑时，layer层会跟着列表上滑，等layer层达到顶部界限值时，layer层会停止上滑，但是列表仍可上滑；此时会出现列表文字超出layer层覆盖到顶部被遮挡的图片上，这样文字就会显示在顶部。我们此时需要将文字隐藏与顶部的背景图片下，所以在此时将背景图的高度设置为固定值，将其 `z-index` 值设置为10，顶部歌手的背景图就可以遮挡住列表层，当列表向下滑动时，将背景图样式复原即可。

![20190701134836.png](http://img.cdn.esunr.xyz/markdown/20190701134836.png)

## 4.3 数据的传递过程

**singer-detail组件**

`components/singer-detail/singer-detail.vue` 仅仅用来处理初始化数据，在其内部处理了 `songs、title、bg-image` 这三部分的数据。其中嵌套了一个 `music-list` 组件，将数据源传递给 `music-list` 组件

**music-list组件**

`components/music-list/music-list.vue` 组件主要创建了歌手歌单页面的详细布局，定制了该页面的动画，其内部再嵌套了一个 `song-list` (当然 `song-list` 组件外部还包裹了一个 `scroll` 组件)，向其内部传递了 `songs` 数据。

**song-list组件**

`base/song-list.vue` 组件是一个基础组件，其实可复用的，接收从外部传入的歌曲列表，但其内部还要向外输出数据，该组件向外部暴露了一个 `select` 方法，当用户点击song-list中的歌曲时，触发这个方法，可以在父组件中调用该方法，其包含两个参数：歌曲项 `item` 与索引值 `index`。当外部获取到该数据后，就可以操作vuex来改变相关数据，播放当前歌曲。



# 5. 播放器展开、收回动画

播放器展开时，上方文字和icon下降，下方操作面板icon上升，中间唱片从左下角滑动到中部位置，放大后再瞬间缩小，整体面板有一个透明度过度的效果。其最终效果如下：

![](http://markdown.img.esunr.xyz/播放器动画.gif)

## 5.1 使用vue的transtion组件

Vue的transition组件可以提供播放器面板的整体效果，主要控制面板的渐变过度、文字和icon的上下展现，其状态比较单一，只需要在 `v-enter-acitve`、`v-leave-active` 阶段设置 `transition` 属性，之后再在 `v-enter` 和 `v-leave-to` 设置其动画的其实和结束状态，即可设置基本的动画效果。

首先为其添加动画名称，然后再css中编写css3动画：

```html
<!-- template -->
<transition name="normal">
  <div class="normal-player"></div>
</transition>
```

```css
/* style */
&.normal-enter-active, &.normal-leave-active {
  transition: all 0.4s;

  .top, .bottom {
    transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
  }
}

&.normal-enter, &.normal-leave-to {
  opacity: 0;

  .top {
    transform: translate3d(0, -100px, 0);
  }

  .bottom {
    transform: translate3d(0, 100px, 0);
  }
}
```

## 5.2 使用create-keyframe-animation在js中创建动画

> 当我们需要动态计算一些动画样式的时候，vue中的transition组件就无法满足我们的需求了，这就需要用javascript去添加动画样式。

create-keyframe-animation是一个提供在js中创建css动画的插件，将其运用在vue中，可以定制更为复杂的动画效果。该插件中为我们提供了如下的方法：

**注册动画**

```js
import animations from "create-keyframe-animation";
... ...
animations.registerAnimation({
  name: "animationName", // 动画名称
  animation: {
    // 为动画设置关键帧上的效果, exp:
    0: {
      opacity: 0
    },
    60: {
      opacity: 0.2
    },
    100: {
      opacity: 1
    }
  },
  presets: {
    // 动画预设, exp:
    duration: 400,
    easing: "linear"
  }
})
```

**启用已注册动画**

```js
import animations from "create-keyframe-animation";
... ...
// el: 想要添加动画效果的dom元素
// animationName: 动画名称
// callback: 回调函数
animations.runAnimation(el, animationName, callback);
```

**注销动画**

```js
import animations from "create-keyframe-animation";
... ...
animations.unregisterAnimation("move");
```

在Vue中，我们可以利用Vue动画的钩子函数，来决定创建的动画的样式、启用动画的时刻、以及注销动画的时刻，我们在transition组件中注册这几个钩子函数：

```html
<!-- template -->
<transition
  name="normal"
  @enter="enter"
  @after-enter="afterEnter"
  @leave="leave"
  @after-leave="afterLeave"
>
... ...
</transition>
```

这样我们就可以在各个钩子函数中控制动画的效果，我们要做的是计算出唱片动画的起始位置与最终位置之间的偏差值，然后再 `enter` 阶段去注册与运行唱片进入的动画，在 `afterEnter` 注销动画与清空动画样式:

```js
enter(el, done) {
  const { x, y, scale } = this._getPosAndScale();
  let animation = {
    0: {
      transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
    },
    60: {
      transform: `translate3d(0,0,0) scale(1.1)`
    },
    100: {
      transform: `translate3d(0,0,0) scale(1)`
    }
  };
  animations.registerAnimation({
    name: "move",
    animation,
    presets: {
      duration: 400,
      easing: "linear"
    }
  });
  animations.runAnimation(this.$refs.cdWrapper, "move", done);
},
afterEnter() {
  animations.unregisterAnimation("move");
  this.$refs.cdWrapper.style.animation = "";
}
```

当关闭主播放器时，唱片仅仅做了一个简单的下滑动作，这时候我们就没有必要借助create-keyframe-animation插件来编写动画了，只需要利用钩子函数，在 `leave` 阶段为元素添加动画，然后在 `afterLeave` 阶段清空动画和动画完成后的样式即可：

```js
leave(el, done) {
  this.$refs.cdWrapper.style.transition = "all 0.4s";
  const { x, y, scale } = this._getPosAndScale();
  this.$refs.cdWrapper.style[
    transform
  ] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
  this.$refs.cdWrapper.addEventListener("transitionend", done);
},
afterLeave() {
  this.$refs.cdWrapper.style.transition = "";
  this.$refs.cdWrapper.style[transform] = "";
}
```