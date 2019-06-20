import Vue from 'vue';
import App from './App.vue';
import router from './router'
// 解决移动端300ms点击延迟
import fastclick from 'fastclick';
import 'common/stylus/index.styl';
import vueLazyload from 'vue-lazyload';

fastclick.attach(document.body);

Vue.use(vueLazyload, {
  loading: require('common/image/default.png')
})

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
