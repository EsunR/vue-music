<template>
  <!-- <div class="singer-detail"></div> -->
  <music-list :songs="songs" :title="singer.name" :bg-image="bgImage"></music-list>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from "vuex";
import { getSingerDetail, addSongUrl } from "api/singer";
import { ERR_OK } from "api/config";
import { createSong } from "common/js/song";
import MusicList from "components/music-list/music-list";

export default {
  components: {
    MusicList
  },
  data() {
    return {
      songs: []
    };
  },
  methods: {
    _getDetail() {
      let originData = {};
      if (!this.singer.id) {
        this.$router.push("/singer");
      }
      getSingerDetail(this.singer.id)
        .then(res => {
          if (res.code === ERR_OK) {
            originData = res.data.list;
          }
          return addSongUrl(originData);
        })
        .then(data => {
          console.log(data);
          this.songs = this._normalizeSongs(data);
        });
    },
    _normalizeSongs(list) {
      let ret = [];
      list.forEach(item => {
        // 解构赋值：let musicData = item.musicData
        let { musicData } = item;
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData));
        }
      });
      return ret;
    }
  },
  computed: {
    ...mapGetters(["singer"]),
    title() {
      return this.singer.name;
    },
    bgImage() {
      return this.singer.avatar;
    }
  },
  created() {
    this._getDetail();
  }
};
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable';

.singer-detail {
  position: fixed;
  z-index: 100;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: $color-background;
}
</style>