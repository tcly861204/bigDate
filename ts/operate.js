var operateBasic = /** @class */ (function () {
    function operateBasic() {
        this.pageDates = {
            one: null,
            two: null
        };
        this.pageNum = 0;
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
            startdate: '2017-01-01',
            enddate: '2018-01-01'
        };
        this.init();
    }
    operateBasic.prototype.init = function () {
        this.initNodes();
        this.searchEvents();
        this.createSwiper();
        this.loadPage();
        this.pageShowTime();
    };
    operateBasic.prototype.initNodes = function () {
        this.pageShowTimeNode = $('#Js_page_showTime');
        this.pageTitle = $('#Js_pageTitle');
        this.saleFdScroll = $('#Js_fdScroll');
        this.onePageSelect = $('#Js_onePage_select');
        this.searchTimeSelect = $('#Js_Search_timeSelect');
        //
        this.pageOneCxt = $('#Js_saleNum');
        this.pageTwoCxt = $('#Js_optNum');
    };
    operateBasic.prototype.toNum = function (num) {
        if (num < 10) {
            return '0' + num;
        }
        return num;
    };
    //显示loading
    operateBasic.prototype.showLoading = function () {
        this.loadNode = weui.loading('加载中...');
    };
    //页面时间显示
    operateBasic.prototype.pageShowTime = function () {
        this.pageShowTimeNode.html('[ ' + this.searchDates.startdate + ' — ' + this.searchDates.enddate + ' ]');
    };
    operateBasic.prototype.hideLoading = function () {
        this.loadNode.hide();
    };
    operateBasic.prototype.getTimeItem = function (time, type) {
        if (time && time.length >= 10) {
            switch (type) {
                case "Y":
                    return time.substr(0, 4);
                case 'm':
                    return parseInt(time.substr(5, 2));
                case 'd':
                    return parseInt(time.substr(7, 2));
            }
        }
        return '';
    };
    //筛选
    operateBasic.prototype.searchEvents = function () {
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
            _this.loadPage();
        });
        searchPanelNode.on('click', function (e) {
            var nodeName = $(e.target);
            //确定
            if (nodeName.hasClass('btn-true')) {
                searchPanelNode.removeClass('s-show');
                _this.loadPage();
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
                    }
                });
            }
            if (nodeName.hasClass('s-click') && !nodeName.hasClass('active')) {
                if (nodeName.parent().attr('data-text') === 'timeType') {
                    _this.onePageSelect.find('.item').removeClass('active').eq(nodeName.attr('data-index')).addClass('active');
                }
                _this.searchDates[nodeName.parent().attr('data-text')] = nodeName.attr('data-type');
                nodeName.addClass('active').siblings('.s-click').removeClass('active');
            }
            //搜索线路类别
            if (nodeName.hasClass('s-lineType')) {
                var _skeyNode_1 = nodeName.parent().find('.s-input');
                $.post(_this.getDateUrl.lineTypeUrl, {
                    'query': _skeyNode_1.val(),
                    'operate_type': _this.searchDates.operate_type
                }, function (data) {
                    weui.picker(data.rows.length > 0 ? data.rows : [{ value: '', label: '暂无类别' }], {
                        onConfirm: function (result) {
                            _this.searchDates.lineTypeID = result[0].value;
                            _skeyNode_1.val(result[0].label);
                        }
                    });
                }, "json");
            }
            //按线路搜索
            if (nodeName.hasClass('s-line')) {
                var _skeyNode_2 = nodeName.parent().find('.s-input');
                $.post(_this.getDateUrl.lineListUrl, {
                    'query': _skeyNode_2.val(),
                    'operate_type': _this.searchDates.operate_type,
                    'lineTypeID': _this.searchDates.lineTypeID
                }, function (data) {
                    weui.picker(data.rows.length > 0 ? data.rows : [{ value: '', label: '暂无类别' }], {
                        onConfirm: function (result) {
                            _this.searchDates.lineID = result[0].value;
                            _skeyNode_2.val(result[0].label);
                        }
                    });
                }, 'json');
            }
        });
    };
    operateBasic.prototype.createSwiper = function () {
        var _this = this;
        new Swiper('.swiper-container', {
            direction: 'vertical',
            loop: false,
            initialSlide: 0,
            onSlideChangeEnd: function (e) {
                _this.pageNum = e.realIndex;
                if (e.realIndex === 0) {
                    _this.saleFdScroll.removeClass('prev').addClass('next').text('上滑查看更多');
                }
                if (e.realIndex === (e.slidesSizesGrid.length - 1)) {
                    _this.saleFdScroll.removeClass('next').addClass('prev').text('下滑查看更多');
                }
                _this.loadPage();
            }
        });
    };
    operateBasic.prototype.loadPage = function () {
        var _this = this;
        this.showLoading();
        switch (this.pageNum) {
            case 0:
                this.pageTitle.text('产品销量分析');
                $.post(this.getDateUrl.productSale, this.searchDates, function (data) {
                    _this.pageDates.one = data.baseLineSalesVolume || [];
                    _this.hideLoading();
                    _this.saleNums();
                }, 'json');
                break;
            case 1:
                this.pageTitle.text('产品营业情况分析');
                $.post(this.getDateUrl.productBusiness, this.searchDates, function (data) {
                    _this.pageDates.two = data.baseLineIncome || [];
                    _this.hideLoading();
                    _this.optNums();
                }, 'json');
                break;
            case 2:
        }
    };
    operateBasic.prototype.saleNums = function () {
        var dataLen = this.pageDates.one.length;
        // this.pageOneCxt.css('width',dataLen*1.5+'rem');
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
        var chart = echarts.init(document.getElementById('Js_saleNum'));
        var option = {
            color: ['#293271', '#36ff2c', '#04a6f6'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            // legend: {
            //     data: [{
            //         name: '库存数量',
            //         textStyle: {
            //             color: '#3bccff'
            //         }
            //     }, {
            //         name: '预留人数',
            //         textStyle: {
            //             color: '#3bccff'
            //         }
            //     }, {
            //         name: '确认人数',
            //         textStyle: {
            //             color: '#3bccff'
            //         }
            //     }],
            //     top: 0,
            //     left: 20
            // },
            textStyle: {
                color: '#33b4eb'
            },
            grid: {
                show: true,
                left: '20',
                right: '20',
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
                    stack: '收入',
                    data: trueNums
                }, {
                    name: '预留人数',
                    type: 'bar',
                    stack: '收入',
                    data: stayNums
                }, {
                    name: '库存数量',
                    type: 'bar',
                    stack: '收入',
                    data: planNums
                }
            ]
        };
        chart.setOption(option);
    };
    operateBasic.prototype.optNums = function () {
        var amountList = [];
        var profitAmountList = [];
        var planDateList = [];
        this.pageDates.two.forEach(function (item, index) {
            amountList.push(Number(item.amount).toFixed(2));
            profitAmountList.push(Number(item.profitAmount).toFixed(2));
            planDateList.push(item.planDate);
        });
        var chart = echarts.init(document.getElementById('Js_optNum'));
        var option = {
            color: ['#0db9fb', '#fdbd44'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow' // 默认为直线，可选为：'line' | 'shadow'
                }
            },
            // legend: {
            //     data: [{
            //             name: '收入',
            //             textStyle: {
            //                 color: '#3bccff'
            //             }
            //         }, {
            //             name: '毛利',
            //             textStyle: {
            //                 color: '#3bccff'
            //             }
            //         }],
            //     top: 0,
            //     left: 20
            // },
            textStyle: {
                color: '#33b4eb'
            },
            grid: {
                show: true,
                left: '20',
                right: '20',
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
                    stack: '收入',
                    data: amountList
                }, {
                    name: '毛利',
                    type: 'bar',
                    stack: '收入',
                    data: profitAmountList
                }
            ]
        };
        chart.setOption(option);
    };
    return operateBasic;
}());
$(function () {
    new operateBasic();
});
