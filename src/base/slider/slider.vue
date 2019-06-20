<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span
        class="dot"
        v-for="(item,index) in dots"
        :key="index"
        :class="{active: currentPageIndex === index}"
      ></span>
    </div>
  </div>
</template>

<script>
import BScroll from "better-scroll";
import { addClass } from "common/js/dom";
export default {
  data() {
    return {
      dots: [],
      currentPageIndex: 0
    };
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  methods: {
    // 让图片宽度自适应，因为图片是作为插槽插入的，我们不可能在调用该组件的父组件中编写图片的样式让其自适应，所以我们要在DOM被挂载在页面上后，使用js去初始化图片的样式
    _setSliderWidth(isResize) {
      this.children = this.$refs.sliderGroup.children;

      // 整体滚动区域的宽度
      let width = 0;
      // 单个滚动横幅的宽度
      let sliderWidth = this.$refs.slider.clientWidth;

      // 设置每个图片的宽度，并且累积总体滚动区域的宽度
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i];
        addClass(child, "slider-item");
        child.style.width = sliderWidth + "px";
        width += sliderWidth;
      }

      // 如果有自动滚动，则总体宽度要×2
      if (this.loop && !isResize) {
        width += 2 * sliderWidth;
      }

      // 设置总体区域的宽度
      this.$refs.sliderGroup.style.width = width + "px";
    },
    _initDots() {
      this.dots = new Array(this.children.length);
    },
    _initSlider() {
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop
        },
        snapThreshold: 0.3,
        snapSpeed: 400,
        click: true
      });

      this.slider.on("scrollEnd", () => {
        let pageIndex = this.slider.getCurrentPage().pageX;
        this.currentPageIndex = pageIndex;

        if (this.autoPlay) {
          clearTimeout(this.timer);
          this._play();
        }
      });
    },
    _play() {
      let pageIndex = this.currentPageIndex + 1;
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex, 0, 400);
        if (pageIndex === this.children.length - 2) {
          this.timer = setTimeout(() => {
            this.slider.goToPage(0, 0, 400);
          }, this.interval);
        }
      }, this.interval);
    }
  },
  mounted() {
    // 保证DOM成功渲染后再调用，浏览器刷新通常是在17ms时刷新
    setTimeout(() => {
      this._setSliderWidth();
      this._initDots();
      this._initSlider();

      if (this.autoPlay) {
        this._play();
      }
    }, 20);

    window.addEventListener("resize", () => {
      if (!this.slider) {
        return;
      } else {
        this._setSliderWidth(true);
      }
    });
  },
  destroyed() {
    clearTimeout(this.timer);
  }
};
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.slider {
  min-height: 1px;

  .slider-group {
    position: relative;
    overflow: hidden;
    white-space: nowrap;

    .slider-item {
      float: left;
      box-sizing: border-box;
      overflow: hidden;
      text-align: center;

      a {
        display: block;
        width: 100%;
        overflow: hidden;
        text-decoration: none;
      }

      img {
        display: block;
        width: 100%;
      }
    }
  }

  .dots {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 12px;
    text-align: center;
    font-size: 0;

    .dot {
      display: inline-block;
      margin: 0 4px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: $color-text-l;

      &.active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }
}
</style>