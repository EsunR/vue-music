<template>
  <div class="singer"></div>
</template>

<script>
import { getSingerList } from "api/singer.js";
import { ERR_OK } from "api/config";
import Singer from "common/js/singer.js";

const HOT_NAME = "热门数据";
const HOT_SINGER_LENGTH = 10;
export default {
  data() {
    return {
      singer: []
    };
  },
  methods: {
    _getSingerList() {
      getSingerList().then(res => {
        if (res.code === ERR_OK) {
          this.singer = res.data.list;
          console.log(this._normalizeSinger(this.singer));
        }
      });
    },
    _normalizeSinger(list) {
      // 将数据进行分类存放到map中
      let map = {
        hot: {
          title: HOT_NAME,
          items: []
        }
      };
      list.forEach((item, index) => {
        if (index < HOT_SINGER_LENGTH) {
          map.hot.items.push(
            new Singer({
              id: item.Fsinger_mid,
              name: item.Fsinger_name
            })
          );
        }
        const key = item.Findex;
        if (!map[key]) {
          map[key] = {
            title: key,
            items: []
          };
        }
        map[key].items.push(
          new Singer({
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          })
        );
      });
      // 为了得到有序列表，我们要处理map
      let hot = [];
      let ret = [];
      let oth = [{ title: "#", items: [] }];
      for (let key in map) {
        let val = map[key];
        if (val.title.match(/[a-zA-Z]/)) {
          ret.push(val);
        } else if (val.title === HOT_NAME) {
          hot.push(val);
        } else {
          oth[0].items = [...oth[0].items, ...val.items];
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0);
      });
      return hot.concat(ret).concat(oth);
    }
  },
  created() {
    this._getSingerList();
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.singer {
  position: fixed;
  top: 88px;
  bottom: 0;
  width: 100%;
}
</style>