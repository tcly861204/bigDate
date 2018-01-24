(function(window){
    ({
        init:function(){
            this.pageDates = {
                one: null,
                two: null
            };
            this.getDateUrl = {
                //线路类别
                lineTypeUrl: '/sys/api/1.0.0/big-date/dsj-api-lineType',
                //线路列表
                lineListUrl: '/sys/api/1.0.0/big-date/dsj-api-lineList',
                //产品销售经营统计
                productSale: '/sys/api/1.0.0/big-date/dsj-api-saleOperation',
                //产品营业经营统计
                productBusiness: '/sys/api/1.0.0/big-date/dsj-api-productOperation'
            };
            //搜索列表
            this.searchDates = {
                timeType: 'month',
                operate_type: '',
                lineTypeID: '',
                lineID: '',
                startdate: '',
                enddate: ''
            };
            this.pageLoads={
              0:false,
              1:false
            }
            this.nowPageIndex = 0;
            this.nowTime = new Date();
            this.searchDates.startdate = this.setQueryTimeTool(1);
            this.searchDates.enddate = this.getTimeString(new Date());
            this._init();

        },
        _init : function () {
            this.initNodes();
            this.searchEvents();
            this.createSwiper();
            this.loadPage(0);
            this.pageShowTime();
        },
        initNodes : function () {
            this.pageShowTimeNode = $('#Js_page_showTime');
            this.selectQueryTime = $('#Js_select_queryTime');
            this.pageTitle = $('#Js_pageTitle');
            this.saleFdScroll = $('#Js_fdScroll');
            this.onePageSelect = $('#Js_onePage_select');
            this.searchTimeSelect = $('#Js_Search_timeSelect');
            this.searchStartDate = $('#Js_startDate');
            this.searchEndDate = $('#Js_endDate');
            this.pageOneCxt = $('#Js_saleNum');
            this.pageTwoCxt = $('#Js_optNum');
            this.saleChartNode = echarts.init(document.getElementById('Js_saleNum'));
            this.optEchartNodes = echarts.init(document.getElementById('Js_optNum'));
        },
        toNum : function (num) {
            if (num < 10) {
                return '0' + num;
            }
            return num;
        },
        //显示loading
        showLoading : function () {
            this.loadNode = weui.loading('加载中...');
        },
        //页面时间显示
        pageShowTime : function () {
            this.pageShowTimeNode.html('[ ' + this.searchDates.startdate + ' — ' + this.searchDates.enddate + ' ]');
        },
        hideLoading : function () {
            this.loadNode.hide();
        },
        getTimeItem : function (time, type) {
            if (time && time.length >= 10) {
                switch (type) {
                    case "Y":
                        return parseInt(time.substr(0, 4));
                    case 'm':
                        return parseInt(time.substr(5, 2));
                    case 'd':
                        return parseInt(time.substr(8, 2));
                }
            }
            return '';

        },
        //筛选
        searchEvents : function () {
            var _this = this;
            var now = new Date();
            var searchPanelNode = $('#Js_searchPanel');
            $('#Js_screen').click(function () {
                searchPanelNode.addClass('s-show');
            });
            this.onePageSelect.on('click', function (e) {
                var nowNodes = $(e.target);
                nowNodes.addClass('active').siblings('.item').removeClass('active');
                _this.searchTimeSelect.find('.s-click').removeClass('active').eq(nowNodes.attr('data-index')).addClass('active');
                _this.searchDates.timeType = nowNodes.attr('data-type');
                _this.pageLoads={
                    0:false,
                    1:false
                }
                _this.loadPage(_this.nowPageIndex);
            });
            searchPanelNode.on('click', function (e) {
                var nodeName = $(e.target);
                //确定
                if (nodeName.hasClass('btn-true')) {
                    searchPanelNode.removeClass('s-show');
                    _this.pageLoads={
                        0:false,
                        1:false
                    }
                    _this.loadPage(_this.nowPageIndex);
                    _this.pageShowTime();
                }
                //返回
                if (nodeName.hasClass('back')) {
                    searchPanelNode.removeClass('s-show');
                }
                //开始时间
                if (nodeName.hasClass('s-start')) {
                    weui.datePicker({
                        start: 2012,
                        defaultValue: [_this.getTimeItem(_this.searchDates.startdate, 'Y'), _this.getTimeItem(_this.searchDates.startdate, 'm'), _this.getTimeItem(_this.searchDates.startdate, 'd')],
                        end: _this.searchDates.enddate,
                        onConfirm: function (result) {
                            _this.searchDates.startdate = result[0].value + '-' + _this.toNum(result[1].value) + '-' + _this.toNum(result[2].value);
                            nodeName.val(_this.searchDates.startdate);
                            _this.selectQueryTime.find('.s-click').removeClass('active');
                        }
                    });
                }
                //结束时间
                if (nodeName.hasClass('s-end')) {
                    weui.datePicker({
                        start: _this.searchDates.startdate,
                        defaultValue: [_this.getTimeItem(_this.searchDates.enddate, 'Y'), _this.getTimeItem(_this.searchDates.enddate, 'm'), _this.getTimeItem(_this.searchDates.enddate, 'd')],
                        // end: new Date().getFullYear()+1,
                        onConfirm: function (result) {
                            _this.searchDates.enddate = result[0].value + '-' + _this.toNum(result[1].value) + '-' + _this.toNum(result[2].value);
                            nodeName.val(_this.searchDates.enddate);
                            _this.selectQueryTime.find('.s-click').removeClass('active');
                        }
                    });
                }
                if (nodeName.hasClass('s-click') && !nodeName.hasClass('active')) {
                    if (nodeName.parent().attr('data-text') === 'timeType') {
                        _this.onePageSelect.find('.item').removeClass('active').eq(nodeName.attr('data-index')).addClass('active');
                    }
                    _this.searchDates[nodeName.parent().attr('data-text')] = nodeName.attr('data-type');
                    nodeName.addClass('active').siblings('.s-click').removeClass('active');
                    if (nodeName.parent().attr('data-text') === 'dataTimes') {
                        _this.setQueryTime(parseInt(nodeName.attr('data-type')));
                    }
                }
                //搜索线路类别
                if (nodeName.hasClass('s-lineType')) {
                    var _skeyNode_1 = nodeName.parent().find('.s-input');
                    _this.showLoading();
                    $.post(_this.getDateUrl.lineTypeUrl, {
                        'query': _skeyNode_1.val(),
                        'operate_type': _this.searchDates.operate_type
                    }, function (data) {
                        _this.hideLoading();
                        weui.picker(data.rows.length > 0 ? data.rows : [{ value: '', label: '暂无类别' }], {
                            onConfirm: function (result) {
                                _this.searchDates.lineTypeID = result[0].value;
                                _skeyNode_1.val(result[0].label);
                                $('#Js_lineId_search').val('');;
                            }
                        });
                    }, "json");
                }
                //按线路搜索
                if (nodeName.hasClass('s-line')) {
                    var _skeyNode_2 = nodeName.parent().find('.s-input');
                    _this.showLoading();
                    $.post(_this.getDateUrl.lineListUrl, {
                        'query': _skeyNode_2.val(),
                        'operate_type': _this.searchDates.operate_type,
                        'lineTypeID': _this.searchDates.lineTypeID
                    }, function (data) {
                        _this.hideLoading();
                        weui.picker(data.rows.length > 0 ? data.rows : [{ value: '', label: '暂无类别' }], {
                            onConfirm: function (result) {
                              if(result[0].value){
                                for(var k=0,len=data.rows.length;k<len;k++){
                                  if(data.rows[k].value==result[0].value){
                                     _this.searchDates.lineTypeID = data.rows[k].LineTypeID;
                                     $('#Js_lineTypeId_search').val(data.rows[k].LineTypeName);
                                     break;
                                  }
                                }
                              }
                              _this.searchDates.lineID = result[0].value;
                              _skeyNode_2.val(result[0].label);
                            }
                        });
                    }, 'json');
                }
            });
            searchPanelNode.on('input propertychange', '.s-input', function (e) {
                var inputNode = $(e.target);
                //清空搜索
                if (!inputNode.val()) {
                    _this.searchDates[inputNode.attr('data-text')] = '';
                }
            });
        },
        getTimeString : function (time) {
            if (time && typeof time === 'object') {
                var _a = [time.getFullYear(), this.toNum(time.getMonth() + 1), this.toNum(time.getDate())], Y = _a[0], m = _a[1], d = _a[2];
                return Y + '-' + m + '-' + d;
            }
        },
        setQueryTimeTool:function(m){
         var start = new Date();
              if (m === 0) {
                  start.setMonth(0);
                  start.setDate(1);
              }
              else {
                  start.setMonth(start.getMonth() - m);
              }
          return this.getTimeString(start);
        },
        /*设置快捷时间*/
        setQueryTime : function (m) {
            var start = new Date();
            if (m === 0) {
                start.setMonth(0);
                start.setDate(1);
            }
            else {
                start.setMonth(start.getMonth() - m);
            }
            this.searchDates.startdate = this.getTimeString(start);
            this.searchDates.enddate = this.getTimeString(this.nowTime);
            this.searchStartDate.val(this.searchDates.startdate);
            this.searchEndDate.val(this.searchDates.enddate);
        },
        createSwiper : function () {
            var _this = this;
            new Swiper('.swiper-container', {
                direction: 'vertical',
                loop: false,
                initialSlide: 0,
                onSlideChangeEnd: function (e) {
                    _this.nowPageIndex = e.realIndex;
                    if (e.realIndex === 0) {
                        _this.saleFdScroll.removeClass('prev').addClass('next').text('上滑查看更多');
                    }
                    if (e.realIndex === (e.slidesSizesGrid.length - 1)) {
                        _this.saleFdScroll.removeClass('next').addClass('prev').text('最后一页了');
                    }
                    switch(_this.nowPageIndex){
                        case 0:
                           _this.saleNums();
                           if(!_this.pageLoads[0]){
                              _this.loadPage(0);
                           }
                           break;
                        case 1:
                           _this.optNums();
                           if(!_this.pageLoads[1]){
                              _this.loadPage(1);
                           }
                           break;
                    };
                    _this.loadPage(_this.pageNum);
                }
            });
        },
        loadPage : function (num) {
            var _this = this;
            if(num===this.nowPageIndex){
               this.showLoading();
            }
            switch (num) {
                case 0:
                    this.pageTitle.text('产品销量分析');
                    $.post(this.getDateUrl.productSale, this.searchDates, function (data) {
                        _this.pageDates.one = data.baseLineSalesVolume || [];
                        _this.pageLoads[num] = true;
                        _this.hideLoading();
                        if(_this.nowPageIndex === num){
                           _this.saleNums();
                        }
                        if(!_this.pageLoads[1]){
                           _this.loadPage(1);
                        }
                    }, 'json');
                    break;
                case 1:
                    this.pageTitle.text('产品营业情况分析');
                    $.post(this.getDateUrl.productBusiness, this.searchDates, function (data) {
                        _this.pageDates.two = data.baseLineIncome || [];
                        _this.pageLoads[num] = true;
                        _this.hideLoading();
                        if(_this.nowPageIndex === num){
                          _this.optNums();
                        }
                        if(!_this.pageLoads[0]){
                           _this.loadPage(0);
                        }
                    }, 'json');
                    break;
                case 2:
            }
        },
        saleNumConfig:function(bit,dataTimeArr,trueNums,stayNums,planNums){
          return {
                color: ['#fdbd44', '#36ff2c', '#04a6f6'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: [{
                            name: '库存数量',
                            textStyle: {
                                color: '#3bccff'
                            }
                        }, {
                            name: '预留人数',
                            textStyle: {
                                color: '#3bccff'
                            }
                        }, {
                            name: '确认人数',
                            textStyle: {
                                color: '#3bccff'
                            }
                        }],
                    top: 0,
                    right: 10
                },
                textStyle: {
                    color: '#33b4eb'
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
                    top: '30',
                    bottom: '5',
                    containLabel: true,
                    borderColor: '#33b4eb',
                    borderWidth: 0,
                    shadowBlur: 0
                },
                xAxis: [{
                        type: 'category',
                        data: dataTimeArr,
                        axisTick: {
                            alignWithLabel: true
                        },
                        axisLine: {
                            show: true,
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
                        }
                    }],
                series: [{
                        name: '确认人数',
                        type: 'bar',
                        barWidth:20,
                        stack: '收入',
                        data: trueNums
                    }, {
                        name: '预留人数',
                        type: 'bar',
                        barWidth:20,
                        stack: '收入',
                        data: stayNums
                    }, {
                        name: '库存数量',
                        type: 'bar',
                        barWidth:20,
                        stack: '收入',
                        data: planNums
                    }
                ]
            };
        },
        saleNums : function () {
            if(!this.pageLoads[0]){
               this.showLoading();
               return false;
            }
            var dataLen = this.pageDates.one.length || 1;
            dataLen = dataLen<10 ? 10 : dataLen;
            var bit = Math.floor(1000 / dataLen);
            var dataTimeArr = [];
            var planNums = [];
            var stayNums = [];
            var trueNums = [];
            var Len = this.pageDates.one.length;
            this.pageDates.one.forEach(function (item, index) {
                dataTimeArr.push(item.planDate);
                planNums.push(item.planNum);
                stayNums.push(item.stayNum);
                trueNums.push(item.trueNum);
            });
            dataTimeArr.push('');
            planNums.push('');
            stayNums.push('');
            trueNums.push('');
            this.saleChartNode.setOption(this.saleNumConfig(bit,dataTimeArr,planNums,stayNums,trueNums));
        },
        optNumConfig:function(bit,planDateList,amountList,profitAmountList){
            return {
                color: ['#0db9fb', '#fdbd44'],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                    }
                },
                legend: {
                    data: [{
                            name: '收入',
                            textStyle: {
                                color: '#3bccff'
                            }
                        }, {
                            name: '毛利',
                            textStyle: {
                                color: '#3bccff'
                            }
                        }],
                    top: 0,
                    right: 10
                },
                textStyle: {
                    color: '#33b4eb'
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
                    left: '20',
                    right: '0',
                    top: '30',
                    bottom: '5',
                    containLabel: true,
                    borderColor: '#33b4eb',
                    borderWidth: 0,
                    shadowBlur: 0
                },
                xAxis: [{
                        type: 'category',
                        data: planDateList,
                        axisTick: {
                            alignWithLabel: false
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
                        name: '收入',
                        type: 'bar',
                        barWidth:20,
                        stack: '收入',
                        data: amountList
                    }, {
                        name: '毛利',
                        type: 'bar',
                        barWidth:20,
                        stack: '收入',
                        data: profitAmountList
                    }
                ]
            };
        },
        optNums : function () {
            if(!this.pageLoads[1]){
               this.showLoading();
               return false;
            }
            var dataLen = this.pageDates.two.length || 1;
            dataLen = dataLen<10 ? 10 : dataLen;
            var bit = Math.floor(1000 / dataLen);
            var amountList = [];
            var profitAmountList = [];
            var planDateList = [];
            this.pageDates.two.forEach(function (item, index) {
                amountList.push(Number(item.amount).toFixed(2));
                profitAmountList.push(Number(item.profitAmount).toFixed(2));
                planDateList.push(item.planDate);
            });
            amountList.push('');
            profitAmountList.push('');
            planDateList.push('');
            this.optEchartNodes.setOption(this.optNumConfig(bit,planDateList,amountList,profitAmountList));
        }
    }).init();

})(window);