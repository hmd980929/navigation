let app = {
  data() {
    return {
      sitesData: {},
      settings: {},
      show_engine_box: false,
      show_engine_key: 0,
      advices: [],
      advice_selected: -1,
      input_value: "",
      currentTime: "",
      currentDate: "",
      timer: null
    };
  },
  methods: {
    open: function (url) {
      window.open(url, "__blank__");
    },
    init: function () {
      let that = this;
      $.ajax({
        url: "./data/settings.json",
        type: "get",
        dataType: "json",
        success: function (data) {
          that.loadSettings(data);
        },
        error: function (e) {
          console.log("载入设置失败!");
        },
        complete: function () {},
      });

      $.ajax({
        url: "./data/sites.json",
        type: "get",
        dataType: "json",
        success: function (data) {
          that.loadSites(data);
        },
        error: function (e) {
          console.log("载入数据失败!");
        },
        complete: function () {},
      });
    },
    loadSites: function (data) {
      this.sitesData = data;
      this.$nextTick(() => {
        $(".site-box .icon").lazyload({
          container: $(".center-container"),
          threshold: 200,
          effect: "fadeIn",
        });
      });
    },
    loadSettings: function (settings) {
      this.settings = settings;
    },
    getSelectedEngine: function () {
      return this.settings.searchEngine.engines[
        this.settings.searchEngine.selected
      ];
    },
    getEngines: function () {
      return this.settings.searchEngine.engines;
    },
    showEngineBox: function () {
      this.show_engine_box = true;
      this.show_engine_key += 1;
      this.$nextTick(() => {
        $(".engine-box").focus();
      });
    },
    hideEngineBox: function (time_delay) {
      let that = this;
      setTimeout(() => {
        that.show_engine_box = false;
      }, 100);
    },
    request_advice: function () {
      $.ajax({
        url: "https://www.baidu.com/sugrec?pre=1&p=3&ie=utf-8&json=1&prod=pc&from=pc_web&sugsid=34942,35106,31254,34902,35066,34504,34917,34871,26350,34970,34868,35018&req=2&csor=4&pwd=fsd&cb=&wd=fsdd",
      });
    },
    advice_clicked(index) {
      this.advice_selected = index;
      let engineId = this.settings.searchEngine.selected;
      let api = this.settings.searchEngine.engines[engineId].api;
      api = api.replace("%keyword%", this.advices[this.advice_selected]);
      window.open(api, "__blank__");
      let input_box = $("#search-input");
      input_box.val(this.advices[this.advice_selected]);
    },
    search() {
      let input_box = $("#search-input");
      let engineId = this.settings.searchEngine.selected;
      let api = this.settings.searchEngine.engines[engineId].api;
      api = api.replace("%keyword%", input_box.val());
      window.open(api, "__blank__");
    },
    getCurrentTime() {
      const weeks = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      this.currentTime = moment().format("HH:mm:ss");
      this.currentDate = `${moment().format("YYYY-MM-DD")} ${weeks[moment().format("d")]}`;
    }
  },
  created() {
    this.getCurrentTime();
    this.timer = setInterval(() => {
      this.getCurrentTime();
    }, 1000);
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },

  mounted() {
    this.init();
  },
};

const vueApp = Vue.createApp(app).mount("#app");

function showAdvice() {
  vueApp.$data.advice_selected = -1;
  let searchText = $("#search-input").val();
  vueApp.$data.input_value = searchText;
  let engineId = vueApp.$data.settings.searchEngine.selected;
  let advice_func =
    vueApp.$data.settings.searchEngine.engines[engineId].advice_func;
  eval(advice_func + "('" + searchText + "',advice_callback)");
}

function input_keydown(event) {
  let input_box = $("#search-input");
  if (event.key === "ArrowUp") {
    if (vueApp.$data.advice_selected <= -1) {
      vueApp.$data.advice_selected = -1;
    } else {
      vueApp.$data.advice_selected--;
      if (vueApp.$data.advice_selected === -1) {
        input_box.val(vueApp.$data.input_value);
      } else {
        vueApp.$nextTick(() => {
          input_box.val($(".advice_item.selected").text());
        });
      }
    }
  } else if (event.key === "ArrowDown") {
    if (vueApp.$data.advice_selected >= vueApp.$data.advices.length - 1) {
      vueApp.$data.advice_selected = vueApp.$data.advices.length - 1;
    } else {
      vueApp.$data.advice_selected++;
      vueApp.$nextTick(() => {
        input_box.val($(".advice_item.selected").text());
      });
    }
  }
  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
    return false;
  }
  if (event.key === "Enter") {
    vueApp.search();
  }
}

function advice_callback(arr) {
  vueApp.$data.advices = arr;
}

$(document).on("click", function (event) {
  if (event.target.id !== "search-input") {
    vueApp.$data.advices = [];
  }
});
