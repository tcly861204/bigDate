/* vue改造版 */
(function(window){
    /* 动画对象 */
    var lastTime = 0;
    var vendors = ['', 'webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
    /* 基本方法 */
    window._base = {
      toNum: function (num) {
          if (num < 10) {
              return '0' + num;
          }
          return num;
      },
      //显示loading
      showLoading : function () {
          this.loadNode = weui.loading('加载中...');
      },
      //隐藏loading
      hideLoading : function () {
          this.loadNode.hide();
      },
      /**/
      hasClass:function(node,clsName){
          if(node.className){
            return new RegExp(' ' + clsName + ' ').test(' ' + node.className + ' ');
          }
          return false;
      },
      addClass:function(node,clsName,mutile){
          if(mutile){
             var all = node.parentNode.childNodes;
             for(var i=0,len = all.length;i<len;i++){
               if(all[i].nodeType===1 && all[i]!==node){
                  _base.removeClass(all[i],clsName);
               }
             }
          }
          if(!this.hasClass(node,clsName)){
            node.className = node.className+' '+clsName;
          }
      },
      removeClass:function(node,clsName){
          if(this.hasClass(node,clsName)){
            var reg = new RegExp(' ' + clsName + ' ');
            node.className = (' '+node.className+' ').replace(reg,'');
          }
      },
       /*设置快捷时间*/
      setQueryTime : function (m) {
            var start = new Date();
            if (m === 0) {
                start.setMonth(0);
                start.setDate(1);
                return _base.getTimeString(start);
            }else {
                start.setMonth(start.getMonth() - m);
                return _base.getTimeString(start);
            }
        },
      getTimeString:function(time){
        if (time && typeof time === 'object') {
            var _a = [time.getFullYear(), _base.toNum(time.getMonth() + 1), _base.toNum(time.getDate())], Y = _a[0], m = _a[1], d = _a[2];
            return Y + '-' + m + '-' + d;
        }
      },
      getTimeItem:function(time,type){
          if(time && time.length>=10){
              switch (type){
                  case "Y":
                      return parseInt(time.substr(0,4));
                  case 'm':
                      return parseInt(time.substr(5,2));
                  case 'd':
                      return parseInt(time.substr(8,2));
              }
          }
          return '';
      },
      css:function(node,obj){
        if(obj){
           var str='';
           for(var i in obj){
             str+=i+':'+obj[i]+';';
           }
           node.style.cssText = str;
        }
      },
      attr:function(node,attr){
          return node.getAttribute(attr)
      }
    };
    Vue.prototype.$http = axios;
    Vue.filter('noFace',function(value){
        if (!value)
          return 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg';
        else
          return value;
    });
    Vue.filter("formatTime",function(value){
        if(value)
          return value.substring(0,10);
        else
          return '-';
    });
    Vue.filter("formatNum",function(num){
      if(num!==0 && num){
          return num.toFixed(2);
      }else{
          return num;
      }
    });
    Vue.filter("absNum",function(num){
      if(num!==0){
          return Math.abs(num).toFixed(2);
      }else{
          return num;
      }
    });
    Vue.filter("saleSex",function(value){
        if(value && value=="男"){
          return 'icon icon-man';
        }else if(value && value=="女"){
          return 'icon icon-woman';
        }else{
          return '-';
        }
    });
    Vue.filter('birthTime',function(time){
        if(time && time.length>=10 && time.split('-').length>2){
          var Y = time.substring(0,4),
              m = time.substr(5,2),
              d = time.substr(8,2);
          var now = new Date(),
              nY = now.getFullYear()+'',
              nm = _base.toNum(now.getMonth()+1)+'',
              nd = _base.toNum(now.getDate())+'';
          return Math.floor((parseInt(nY+nm+nd)-parseInt(Y+m+d))/10000);
        }else{
          return '-';
        }
    });





var app = new Vue({
  el: '#app',
  data: {
      SaleEnterFaceFlag:'s-show',
      pageTitleList:[
         '基本信息',
         '业绩走势',
         '收客人数',
         '订单利润与亏损占比',
         '产品类别销售占比',
         '客单价区间销量占比'
      ],
      searchPanel:{
        dataTimes:['','','',''],
        operate_type:['active','','']
      },
      searchSales:[],
      resetSaleAll:[],
      pageTitle:'基本信息',
      footText:'上滑查看更多',
      footDist:'next',
      nowTime:new Date(),
      nowPageIndex:0,
      echartOptions:{
        act:{
          bit:10,
          key:[]
        },
        sal:{
          bit:10,
          key:[]
        }
      },
      pageTypes:{
          1:'yeji',
          2:'shouke',
          3:'lirun',
          4:'chanpin',
          5:'kedan'
      },
      pageLoads:{
        1:false,
        2:false,
        3:false,
        4:false,
        5:false
      },
      pageDatas:{
        yeji:[],
        sum1:0,
        show:[],
        sum2:0,
        lirun:{
          loss:{
            saleLossAmount:0,
            saleLossPercentage:0
          },
          profit:{
            saleProfitAmount:0,
            saleProfitPercentage:0
          }
        },
        kedan:[],
        chanpin:[]
      },
      dataURL:{
        //获取所有销售
        // sale: '/sys/api/1.0.0/big-date/dsj-api-allSales',
        sale: '/sys/main?xwl=34580M8L8X9A',
        //获取单个销售基本信息
        // itemSale: '/sys/api/1.0.0/big-date/dsj-api-itemSaleInfos',
        itemSale: '/sys/main?xwl=34580M8L8X9P',
        //获取销售不同页面的数据
        // deepSale: '/sys/api/1.0.0/big-date/dsj-api-pageAlls'
        deepSale: '/sys/main?xwl=34580M8L8Z1I'
      },
      //搜索条件
      searchDates:{
        saleID: '',
        saleName: '',
        saleFace: '',
        deptName: '',
        operate_type: '',
        dateType: '出团日期',
        startdate: '',
        enddate: ''
      },
      saleWholeFlag:'false',
      saleWhole:[],
      saleSingles:{
        birthday:'',
        deptName:'',
        education:'',
        entryData:'',
        head_photo:'',
        monthHighPerNum:'',
        monthHighPerNumMonth:'',
        perNumNoRate:'',
        perNumTrue:'',
        perNumTrueRate:'',
        pingAmountNo:'',
        saleID:'',
        saleName:'',
        sex:''
      }
  },
  /*初始化时间*/
  initDate:function(){
      this.searchDates.startdate = _base.setQueryTime(3);
      this.searchDates.enddate = _base.getTimeString(this.nowTime);
  },
  getSaleFaceList : function (skey,from) {
      var that = this;
      if (skey === void 0) { skey = ''; }
      _base.showLoading();
      this.$http.post(this.dataURL.sale,{saleName:skey}).then(function(res){
          _base.hideLoading();
          if(!that.resetSaleAll.length){
             that.resetSaleAll = res.data.saleWhole;
          }
          if(from==='first'){
             that.saleWholeFlag = 'true';
             that.saleWhole = res.data.saleWhole;
          }
          if(from==='search'){
             that.searchSales = res.data.saleWhole;
          }
      });
  },
  created: function () {
      var that = this;
      this.$options.initDate.call(this);
      this.$options.getSaleFaceList.call(this,'','first');
  },
  createSwiper : function () {
      var that = this;
      var swiper = new Swiper('.swiper-container', {
          direction: 'vertical',
          autoHeight: true,
          loop: false,
          initialSlide: 0,
          onSlideChangeEnd: function (e) {
              that.nowPageIndex = e.realIndex;
              that.pageTitle = that.pageTitleList[that.nowPageIndex];
              if(e.realIndex===5){
                 that.footText = '最后一页了';
                 that.footDist = 'prev';
              }else{
                 that.footText = '上滑查看更多';
                 that.footDist = 'next';
              }
              if(!that.pageLoads[that.nowPageIndex]){
                  that.loadPages.call(app,that.nowPageIndex);
              }
              switch(e.realIndex){
                case 0:
//                   that.achievementTrendChart.setOption(that.achievConfig(that.echartOptions.act.bit,that.echartOptions.act.key,[]));
                  break;
                case 1:
                  //业绩走势
                  that.achievement.call(app);
//                   that.saloonTrendChart.setOption(that.saloonConfig(that.echartOptions.sal.bit,that.echartOptions.sal.key,[]));
                  setTimeout(function(){
                     if(!that.pageLoads[0]){
                         that.loadPages.call(app,0);
                     }
                     if(!that.pageLoads[2]){
                         that.loadPages.call(app,2);
                     }
                  },100);
                  break;
                case 2:
                  //收客走势
//                   that.achievementTrendChart.setOption(that.achievConfig(that.echartOptions.act.bit,that.echartOptions.act.key,[]));
                  that.saloon.call(app);
                  setTimeout(function(){
                      if(!that.pageLoads[1]){
                        that.loadPages.call(app,1);
                      }
                      if(!that.pageLoads[3]){
                        that.loadPages.call(app,3);
                      }
                  },100);
                  break;
                case 3:
                  that.profit.call(app);
//                   that.saloonTrendChart.setOption(that.saloonConfig(that.echartOptions.sal.bit,that.echartOptions.sal.key,[]));
                  setTimeout(function(){
                      if(!that.pageLoads[2]){
                         that.loadPages.call(app,2);
                      }
                      if(!that.pageLoads[4]){
                         that.loadPages.call(app,4);
                      }
                   },100);
                  break;
                case 4:
                  that.saleTypeBit.call(app);
                  setTimeout(function(){
                      if(!that.pageLoads[3]){
                         that.loadPages.call(app,3);
                      }
                      if(!that.pageLoads[5]){
                        that.loadPages.call(app,5);
                      }
                  },100);
                  break;
                case 5:

                  that.unitPrice.call(app);
                  break;
              }
          }
      });
  },
  //初始化图表
  initNodes:function(){
    //业绩走势
    this.achievementTrendChart = echarts.init(document.getElementById('Js_achievement'));
    //收客走势
    this.saloonTrendChart = echarts.init(document.getElementById('Js_saloon'));
  },
  mounted:function(){
      this._winfo = document.body.getBoundingClientRect();
      this._ww = this._winfo.width;
      this._wh = this._winfo.height;
      this._scaleBit = 4;
      this.$options.createSwiper.call(this);
      this.$options.initNodes.call(this);
      this.unitPriceInfos = this.$refs.Js_unitPrice_box.getBoundingClientRect();
  },
  methods:{
      /*首页进入*/
      enterFaceList:function(e){
        var tagName = e.target;
        if(_base.hasClass(tagName,'face')){
          _base.addClass(tagName.parentNode,'active');
          this.searchDates.saleID = _base.attr(tagName.parentNode,'data-id');
          this.searchDates.saleName = _base.attr(tagName.parentNode,'data-name');
          this.searchDates.saleFace = _base.attr(tagName.parentNode,'data-face');
          _base.removeClass(this.$refs.JsSaleEnterFace,'s-show');
          this.loadPages(0); //加载第一页
        }
        /* 搜索 */
        if(_base.hasClass(tagName,'s-btn')){
          var skey = this.$refs.Js_skey_face_enter.value;
          this.$options.getSaleFaceList.call(this,skey,'first');
        }
        /* 跳过 */
        if(_base.hasClass(tagName,'face-fd')){
           _base.removeClass(this.$refs.JsSaleEnterFace,'s-show');
        }
      },
      //点击筛选
      showRagePanel:function(){
         this.searchSales = this.resetSaleAll;
         _base.addClass(this.$refs.Js_searchPanel,'s-show');
      },
      /* 高级筛选 */
      searchRage:function(e){
         var _this = this;
         var tagName = e.target;
         /* 显隐全部销售 */
         if(_base.hasClass(tagName,'dropLoadMax')){
            if(_base.hasClass(this.$refs.Js_faceList,'max')){
               _base.removeClass(this.$refs.Js_faceList,'max');
               _base.addClass(tagName,'max');
            }else{
               _base.addClass(this.$refs.Js_faceList,'max');
               _base.removeClass(tagName,'max');
            }
         }
         /* 返回 */
         if (_base.hasClass(tagName,'back')) {
            _base.removeClass(this.$refs.Js_searchPanel,'s-show');
         }
         /* 开始时间 */
         if (_base.hasClass(tagName,'s-start')) {
            weui.datePicker({
              start: 2012,
              defaultValue: [_base.getTimeItem(_this.searchDates.startdate, 'Y'), _base.getTimeItem(_this.searchDates.startdate, 'm'), _base.getTimeItem(_this.searchDates.startdate, 'd')],
              end: _this.searchDates.enddate,
              onConfirm: function (result) {
                 _this.searchDates.startdate = result[0].value + '-' + _base.toNum(result[1].value) + '-' + _base.toNum(result[2].value);
              }
            });
         }
         /* 结束时间 */
         if (_base.hasClass(tagName,'s-start')) {
            weui.datePicker({
              start: _this.searchDates.startdate,
              defaultValue: [_base.getTimeItem(_this.searchDates.enddate, 'Y'), _base.getTimeItem(_this.searchDates.enddate, 'm'), _base.getTimeItem(_this.searchDates.enddate, 'd')],
              onConfirm: function (result) {
                 _this.searchDates.enddate = result[0].value + '-' + _base.toNum(result[1].value) + '-' + _base.toNum(result[2].value);
              }
            });
         }
         /* 搜索销售 */
         if(_base.hasClass(tagName,'user-face')){
             var preNode = tagName.parentNode.parentNode;
             _this.searchDates.saleID = _base.attr(preNode,'data-id');
             _this.searchDates.saleName = _base.attr(preNode,'data-name');
             _this.searchDates.saleFace = _base.attr(preNode,'data-face');
             _base.addClass(preNode,'active','mutile');
         }
         /* 搜索框 */
         if(_base.hasClass(tagName,'s-face-btn')){
            var skey = this.$refs.Js_skey_face_search.value;
            _this.$options.getSaleFaceList.call(_this,skey,'search');
         }
         /* 其他搜索 */
         if(_base.hasClass(tagName,'s-click')){

             /* 设置快捷时间 */
             if(_base.attr(tagName.parentNode,'data-text')==='dataTimes'){
                 _this.searchDates.startdate = _base.setQueryTime(parseInt(_base.attr(tagName,'data-type'),10));
                 _this.searchDates.enddate = _base.getTimeString(_this.nowTime);
                 _base.addClass(tagName,'active','mutile');
             }else{
                 var _type = _base.attr(tagName.parentNode,'data-text');
                 _base.addClass(tagName,'active','mutile');
                 if(_type){
                    _this.searchDates[_type] = _base.attr(tagName,'data-type');
                 }
             }
         }
         /* 确定 */
         if(_base.hasClass(tagName,'btn-true')){
             for(var k in _this.pageLoads){
                _this.pageLoads[k] = false;
             }
             _base.removeClass(this.$refs.Js_searchPanel,'s-show');
             _this.loadPages(_this.nowPageIndex);
         }
      },
      /* 加载其它页 */
      loadPages:function(num){
        var that = this;
        var sum = 0;
        if(num===that.nowPageIndex){
           _base.showLoading();
        }
        if(num===0){
             /* 首页 */
             this.$http.post(this.dataURL.itemSale,this.searchDates).then(function(res){
                _base.hideLoading();
                that.pageLoads[num] = true;
                that.saleSingles = res.data.saleSingles;
                if(!that.pageLoads[1]){
                   that.loadPages(1);
                }
              });
        }else{
            /* 其它页 */
            this.searchDates.pageType = that.pageTypes[num];
            this.$http.post(this.dataURL.deepSale,this.searchDates).then(function(res){
                _base.hideLoading();
                that.pageLoads[num] = true;
                switch(num){
                  case 1:
                    that.pageDatas[that.pageTypes[num]] = res.data.saleAchievement || [];
                    that.pageDatas[that.pageTypes[num]].forEach(function(item,index){
                        sum+=item.amount*1;
                    });
                    that.pageDatas.sum1 = sum;
                    if(that.nowPageIndex===1){
                       that.achievement.call(that);
                    }

                    break;
                  case 2:
                    that.pageDatas[that.pageTypes[num]] = res.data.salePerNumTrend || [];

                    that.pageDatas[that.pageTypes[num]].forEach(function(item,index){
                        sum+=item.perNum*1;
                    });
                    that.pageDatas.sum2 = sum;
                    if(that.nowPageIndex===2){
                       that.saloon.call(that);
                    }
                    break;
                  case 3:
                    that.pageDatas[that.pageTypes[num]] = res.data.saleProfitLoss;
                    if(that.nowPageIndex===3){
                        that.profit.call(that);
                    }
                    break;
                  case 4:
                    res.data.saleLineTypePercentage.sort(function(a,b){
                          return b.salePerNumPercentage - a.salePerNumPercentage;
                    });
                    that.pageDatas[that.pageTypes[num]] = res.data.saleLineTypePercentage;
                    if(that.nowPageIndex===4){
                        that.saleTypeBit.call(that);
                    }
                    break;
                  case 5:
                    res.data.saleUnitPriceSection.sort(function (a, b) {
                        return b.startAmount - a.startAmount;
                    });
                    that.pageDatas[that.pageTypes[num]] = res.data.saleUnitPriceSection;
                    if(that.nowPageIndex===5){
                        that.unitPrice.call(that);
                    }
                    break;
                };
            });
        }
      },
      /* 业绩走势配置 */
      achievConfig:function(bit,arrDateKey,arrDateValue){
        return {
            color: ['#33b4eb'],
            textStyle: {
              color: '#33b4eb'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
              }
            },
            dataZoom: {
              show: true,
              type: 'inside',
              realtime: true,
              start: 0,
              end: bit
            },
            grid: {
              show: true,
              left: '10',
              right: '0',
              top: '10',
              bottom: '5',
              containLabel: true,
              borderColor: '#33b4eb',
              borderWidth: 0,
              shadowBlur: 0
            },
            xAxis: [{
              type: 'category',
              data: arrDateKey,
              axisTick: {
                alignWithLabel: true
              },
              axisLine: {
                lineStyle: {
                  width: 0,
                  color: '#33b4eb'
                }
              },
              splitLine: {
                show: true,
                lineStyle: {
                  width: 0,
                  color: '#0e5f97'
                }
              }
            }],
            yAxis: [{
              type: 'value',
              axisLine: {
                lineStyle: {
                  color: '#33b4eb'
                }
              },
              splitLine: {
                show: true,
                lineStyle: {
                  color: '#0e5f97'
                }
              },
              axisLabel: {
                formatter: '￥{value}'
              }
            }],
            series: [{
              name: '营业额',
              type: 'bar',
              barWidth:20,
              data: arrDateValue
            }]
          };
      },
      /*业绩走势*/
      achievement:function(){
          if(!this.pageLoads[1]){
             _base.showLoading();
             return false;
          }
          var arr = this.pageDatas.yeji || [];
          var arrLen = arr.length || 1;
          arrLen = arrLen<10 ? 10 : arrLen;
          var bit = Math.floor(1000/arrLen);
          var arrDateKey = [];
          var arrDateValue = [];
          var sum = 0;
          arr.forEach(function (item, index) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.amount);
            sum += Number(item.amount);
          });
          arrDateKey.push('');
          arrDateValue.push('');
          this.echartOptions.act.bit = bit;
          this.echartOptions.act.key = arrDateKey;
          this.achievementTrendChart.setOption(this.achievConfig(bit,arrDateKey,arrDateValue));
      },
      /* 收客走势配置 */
      saloonConfig:function(bit,arrDateKey,arrDateValue){
          return {
            color: ['ffd800'],
              textStyle: {
                  color: '#33b4eb'
              },
              tooltip: {
                  trigger: 'axis',
                  axisPointer: {
                      type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                  }
              },
              dataZoom: {
                  show: true,
                  type: 'inside',
                  realtime: true,
                  start: 0,
                  end: bit
              },
              grid: {
                  show: true,
                  left: '10',
                  right: '0',
                  top: '10',
                  bottom: '5',
                  containLabel: true,
                  borderColor: '#33b4eb',
                  borderWidth: 0,
                  shadowBlur: 0
              },
              xAxis: [{
                      type: 'category',
                      data: arrDateKey,
                      axisTick: {
                          alignWithLabel: true
                      },
                      axisLine: {
                          lineStyle: {
                              width: 0,
                              color: '#33b4eb'
                          }
                      },
                      splitLine: {
                          show: true,
                          lineStyle: {
                              width: 0,
                              color: '#0e5f97'
                          }
                      }
                  }],
              yAxis: [{
                      type: 'value',
                      axisLine: {
                          lineStyle: {
                              color: '#33b4eb'
                          }
                      },
                      splitLine: {
                          show: true,
                          lineStyle: {
                              color: '#0e5f97'
                          }
                      },
                      axisLabel: {
                          formatter: '{value}人'
                      }
                  }],
              series: [{
                      name: '收 客',
                      type: 'line',
                      smooth: true,
                      lineStyle: {
                          normal: {
                              color: '#ffd800',
                              width: 3,
                              shadowColor: 'rgba(0,0,0,0.4)',
                              shadowBlur: 10,
                              shadowOffsetY: 10
                          }
                      },
                      itemStyle: {
                          normal: {
                              color: '#ffd800',
                              width: 3,
                              shadowColor: 'rgba(0,0,0,0.4)',
                              shadowBlur: 10,
                              shadowOffsetY: 10
                          }
                      },
                      data: arrDateValue
              }]
          };
      },
      /*收客走势*/
      saloon:function(){
         if(!this.pageLoads[2]){
             _base.showLoading();
             return false;
        }
        var arr = this.pageDatas.shouke || [];
        var bit = 1000/((arr.length || 1)<10 ? 10 : arr.length);
        var arrDateKey = [];
        var arrDateValue = [];
        arr.forEach(function (item, index) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.perNum);
        });
        arrDateKey.push('');
        arrDateValue.push('');
        this.echartOptions.sal.bit = bit;
        this.echartOptions.sal.key = arrDateKey;
        this.saloonTrendChart.setOption(this.saloonConfig(bit,arrDateKey,arrDateValue));
      },
      /* 订单利润与亏损占比 */
      profit : function () {
         if(!this.pageLoads[3]){
             _base.showLoading();
             return false;
          }
        var arr = this.pageDatas.lirun;
        var data = [
            {
                ctx:this.$refs.Js_prefit_ctx.getContext('2d'),
                color: '#3bccff',
                bit: Number(arr.profit.saleProfitPercentage || 0),
                iNum: 0,
                deg: 0,
                timer: 0,
                amount: arr.profit.saleProfitAmount
            },
            {
                ctx:this.$refs.Js_loss_ctx.getContext('2d'),
                color: '#715eff',
                bit: Number(arr.loss.saleLossPercentage || 0),
                iNum: 0,
                deg: 0,
                timer: 0,
                amount: arr.loss.saleLossAmount
            }
        ];

        var infos = this.$refs.Js_prefit_box.getBoundingClientRect();
        var h = Math.floor(infos.height);
        this.$refs.Js_prefit_ctx.width = h*4;
        this.$refs.Js_prefit_ctx.height = h*4;
        this.$refs.Js_loss_ctx.width = h*4;
        this.$refs.Js_loss_ctx.height = h*4;

        var disX = h*2;
        var arcWidth = 20 * 4;
        data.forEach(function(item,index){
            function run(){
               item.ctx.clearRect(0, 0, h*4, h*4);
               item.ctx.beginPath();
               item.ctx.lineWidth = arcWidth;
               item.ctx.strokeStyle = '#0e3c6c';
               item.ctx.arc(disX, disX, disX - arcWidth / 2, 0, 2 * Math.PI);
               item.ctx.stroke();

               item.ctx.beginPath();
               item.ctx.strokeStyle = item.color;
               item.deg = ((item.iNum - 25) / 50) * Math.PI;

               item.ctx.arc(disX, disX, disX - arcWidth / 2, -0.5 * Math.PI, item.deg);
               item.ctx.stroke();
               item.iNum+=2;
               if (item.iNum > item.bit) {
                  window.cancelAnimationFrame(item.timer);
                  return false;
               }
               item.timer = window.requestAnimationFrame(run)
            }
            run();
        });
      },
      //生成图表
      salePropCvs : function (id, num, color) {
          var _this = this;
          var cvsNode = document.querySelector('#Js_saleType_' + id);

          cvsNode.width = parseInt(cvsNode.width) * _this._scaleBit;
          cvsNode.height = parseInt(cvsNode.height) * _this._scaleBit;

          var numText = cvsNode.parentNode.childNodes[3];
          var ctx = cvsNode.getContext('2d'), deg = 0;
          var _W = cvsNode.width;
          var _R = 14 * _this._scaleBit;
          ctx.Num = 0;
          ctx.timer = null;
          function run() {
              if (num === 0) {
                  ctx.beginPath();
                  ctx.lineWidth = _R;
                  ctx.strokeStyle = '#17305a';
                  ctx.arc(_W / 2, _W / 2, _W / 2 - _R / 2, 0, 2 * Math.PI);
                  ctx.stroke();
                  ctx.fillStyle = color;
                  ctx.textBaseline = "middle";
                  ctx.font = "bold 2.8rem Arial";
                  ctx.textAlign = "center";
                  numText.innerHTML = '0<span class="bit">%</span>';
                  ctx.fillText(0, _W / 2, _W / 2);
              }

              ctx.clearRect(0, 0, cvsNode.width, cvsNode.height);
              ctx.beginPath();
              ctx.lineWidth = _R;
              ctx.strokeStyle = '#17305a';
              ctx.arc(_W / 2, _W / 2, _W / 2 - _R / 2, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.beginPath();
              ctx.strokeStyle = color;
              if (num-ctx.Num> 0 && num-ctx.Num <= 2) {
                  deg = ((num - 25) / 50) * Math.PI;
                  numText.innerHTML = num + '<span class="bit">%</span>';
              }else {
                  deg = ((ctx.Num - 25) / 50) * Math.PI;
                  numText.innerHTML = ctx.Num + '<span class="bit">%</span>';
              }
              ctx.arc(_W / 2, _W / 2, _W / 2 - _R / 2, -0.5 * Math.PI, deg);
              ctx.stroke();
              if (num-ctx.Num > 0 && num-ctx.Num <= 2) {
                  window.cancelAnimationFrame(ctx.timer);
                  return;
              }
              ctx.Num+=2;
              ctx.timer = window.requestAnimationFrame(run);
          }
          run();
      },
      //销售类别占比模板
      saleTypeTpl : function (obj, _width, _marginRight, num) {
          return "<dl class=\"cvs-item\" style=\"width: " + _width + "px;margin-right:" + _marginRight + "px;\">\n                    <dt class=\"cvs-cnt\" style=\"width:" + _width + "px;height: " + _width + "px;\">\n                        <canvas style=\"zoom:0.25;\" class=\"cxt\" id=\"Js_saleType_" + num + "\" width=\"" + _width + "\" height=\"" + _width + "\"></canvas>\n                        <p class=\"ctx-num\"></p>\n                    </dt>\n                    <dd class=\"typeName eps\">" + (obj.lineTypeName || '-') + "</dd>\n                    <dd class=\"num eps\">\u6536\u5BA2" + obj.salePerNum + "\u4EBA</dd>\n                    <dd class=\"no eps\">\u56E2\u961FNO." + (obj.saleRanking + 1) + "</dd>\n                </dl>";
      },
      /* 产品类别销售占比 */
      saleTypeBit : function(){
          if(!this.pageLoads[4]){
             _base.showLoading();
             return false;
          }
          var that = this;
          var arr = this.pageDatas.chanpin || [];
          var len = arr.length;
          var iMr = 0;
          var iWd = 0;
          if (len > 6) {
               _base.removeClass(this.$refs.Js_saleTypeBit_list,'min');
               _base.css(this.$refs.Js_saleTypeBit_list,{
                    'width': (this._ww * 0.38 * Math.ceil(len / 2))+'px',
                    "padding-left": (this._ww * 0.025)+'px'
               });
               iWd = this._ww * 0.3;
               iMr = this._ww * 0.08;
          }else {
               _base.addClass(this.$refs.Js_saleTypeBit_list,'min min-'+len);
               _base.css(this.$refs.Js_saleTypeBit_list,{'width':(this._ww * 0.325 * Math.ceil(len / 2) - this._ww * 0.025)+'px'});
               iWd = this._ww * 0.3;
               iMr = this._ww * 0.025;
          }
          var html = '';
          arr.forEach(function (item, index) {
              html += that.saleTypeTpl(item, iWd, iMr, index);
          });
          this.$refs.Js_saleTypeBit_list.innerHTML = html;

          var iNum = 0;
          var _timer = setInterval(function () {
              if (iNum >= len) {
                  clearInterval(_timer);
                  return;
              }
              that.salePropCvs(iNum, Number(arr[iNum].salePerNumPercentage), '#725cff');
              iNum++;
          }, 100);
      },
      /*客单价区间销量占比*/
      unitPrice : function(){
          if(!this.pageLoads[5]){
             _base.showLoading();
             return false;
          }
         var data = this.pageDatas.kedan || [];
         var boxH = this.unitPriceInfos.height;
         var _a = [this._scaleBit, data.length, 50],
             bit = _a[0],
             Len = _a[1],
             _LH = _a[2];
             Len = Math.floor(boxH/ _LH) > Len ? Len : Math.floor(boxH / _LH);

          var cvs = this.$refs.Js_unitPrice;
          cvs.width = this._ww * bit;
          cvs.height = Len * _LH * bit;
          var ctx = cvs.getContext('2d');

          var disX = 15 * bit,
               _height = 25 * bit,
               _lineHeight = _LH * bit,
               maxWidth = cvs.width - 30 * bit,
               maxValue = 0;
          var iNum = 0;
          var _timer = null;
          var ceilBit = 0;
          for(var k=0;k<Len;k++){
            if(k===0){
               data[k].text=data[k].startAmount+'以上';
               ceilBit+=data[k].saleUnitPriceSection*100;
            }
            if(k>0 && k<Len-1){
               data[k].text=data[k].startAmount + '-' + data[k].endAmount;
               ceilBit+=data[k].saleUnitPriceSection*100;
            }
            if(k===Len-1){
               data[k].saleUnitPriceSection = (10000-ceilBit)/100;
               data[k].text = data[k].endAmount+'以下';
            }
            if (data[k].saleUnitPriceSection*1 > maxValue) {
                maxValue = data[k].saleUnitPriceSection*1;
            }
          }
          var linearFillType = ctx.createLinearGradient(disX, 0, disX + (maxWidth * maxValue) / 100, 0);
          linearFillType.addColorStop(0, "#5943ff");
          linearFillType.addColorStop(1, "#ed69c7");
          function run() {
              ctx.clearRect(0, 0, cvs.width, cvs.height);
              for (var i = 0; i < Len; i++) {
                  ctx.fillStyle = '#17305a';
                  ctx.fillRect(disX, _height + i * _lineHeight, maxWidth, _height);
                  ctx.fillStyle = '#3bccff';
                  ctx.textBaseline = "bottom";
                  ctx.font = 13 * bit + "px Arial";
                  ctx.textAlign = "start";
                  ctx.fillText(data[i].text, disX, _height + i * _lineHeight);
                  ctx.fillStyle = '#44f8ff';
                  ctx.textAlign = "end";
                  if (data[i].saleUnitPriceSection*1 > iNum) {
                      ctx.fillText(iNum + '%', cvs.width - disX, _height + i * _lineHeight);
                      ctx.fillStyle = linearFillType;
                      ctx.fillRect(disX, _height + i * _lineHeight, (maxWidth * iNum) / 100, _height);
                  }
                  else {
                      ctx.fillText(Number(data[i].saleUnitPriceSection).toFixed(2) + '%', cvs.width - disX, _height + i * _lineHeight);
                      ctx.fillStyle = linearFillType;
                      ctx.fillRect(disX, _height + i * _lineHeight, (maxWidth * data[i].saleUnitPriceSection) / 100, _height);
                  }
              }
              if (iNum - maxValue > 0 && iNum - maxValue <= 1) {
                  window.cancelAnimationFrame(_timer);
                  return false;
              }
              iNum++;
              _timer = window.requestAnimationFrame(run);
          }
          run();
      }
  }
});
})(window);