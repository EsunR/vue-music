import Vue from 'vue';
import App from './App.vue';
import router from './router'

// 解决移动端300ms点击延迟
import fastclick from 'fastclick';
import 'common/stylus/index.styl';

fastclick.attach(document.body);

new Vue({
  el: '#app',
  router,
  render: h => h(App)
})
