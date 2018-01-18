(function (window) {
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
}(window));
var Basic = /** @class */ (function () {
    function Basic() {
        this._scaleBit = 4;
        this.pageNum = 0;
        this.pageDates = {
            'yeji': null,
            'shouke': null,
            'dingdnalaiyuan': null,
            'kedan': null,
            'lirun': null,
            'leibie': null,
            'chanpin': null
        };
        this._winfo = document.body.getBoundingClientRect();
        this._ww = this._winfo.width;
        this._wh = this._winfo.height;
        this._rem = this._ww / 25;
        this.getDateUrl = {
            //获取所有销售
            sale: '/sys/api/1.0.0/big-date/dsj-api-allSales',
            //获取单个销售基本信息
            itemSale: '/sys/api/1.0.0/big-date/dsj-api-itemSaleInfos',
            //获取销售不同页面的数据
            deepSale: '/sys/api/1.0.0/big-date/dsj-api-pageAlls'
        };
        this.searchDate = {
            saleID: '',
            saleName: '',
            saleFace: '',
            deptName: '',
            operate_type: '',
            dateType: '出团日期',
            startdate: '2017-01-01',
            enddate: '2018-01-01'
        };
        this.faceListSearch = $('#Js_faceList');
        this.faceListStart = $('#Js_s_faceList');
        this.init();
    }
    //销售模板
    Basic.prototype.saleListTpl = function (obj) {
        return "<li class=\"item\" data-id=\"" + obj.saleID + "\" data-name=\"" + obj.saleName + "\" data-face=\"" + (obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\">\n                    <img class=\"face\" src=\"" + (obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\">\n                    <span class=\"user eps\">" + obj.saleName + "</span>\n                </li>";
    };
    Basic.prototype.sfaceListTpl = function (obj) {
        return "<dl class=\"face-item\" data-id=\"" + obj.saleID + "\" data-name=\"" + obj.saleName + "\" data-face=\"" + (obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\">\n                    <dt>\n                        <img class=\"user-face\" src=\"" + (obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\" />\n                    </dt>\n                    <dd class=\"user-name eps\">" + obj.saleName + "</dd>\n                </dl>";
    };
    //销售基本信息模板
    Basic.prototype.saleInfoPageOneTpl = function (obj) {
        return "<dl class=\"saleInfo\">\n                    <dt class=\"face\">\n                        <img src=\"" + (obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\" />\n                    </dt>\n                    <!--sex-woman \u5973-->\n                    <dd class=\"user sex-man\">" + obj.saleName + "<span class=\"icon icon-" + (obj.sex === '男' ? 'man' : 'sex') + "\"></span></dd>\n                    <dd class=\"item\">\u51FA\u751F\u65E5\u671F<span class=\"v\">" + (obj.birthday ? obj.birthday.substring(0, 10) : '-') + "</span></dd>\n                    <dd class=\"item fr\">\u5E74\u9F84<span class=\"v\">" + this.birthdayFn(obj.birthday) + "</span></dd>\n                    <dd class=\"item\" style=\"width: 14rem;\">\u5165\u804C\u65F6\u957F<span class=\"v\">" + this.birthdayFn(obj.entryData) + "\u5E74</span></dd>\n                </dl>\n                <dl class=\"amounts\">\n                    <dt>\n                        <p class=\"title\">\u672A\u56DE\u6B3E\u91D1\u989D</p>\n                        <strong class=\"no-amount amount\">" + this.formatNum(obj.pingAmountNo) + "</strong>\n                    </dt>\n                    <dd>\n                        <p class=\"title\">\u5F53\u524D\u5BA2\u6237\u91CF</p>\n                        <strong class=\"psn\">" + obj.perNumTrue + "</strong>\n                    </dd>\n                    <dd>\n                        <p class=\"title\">\u8BA2\u5355\u53D6\u6D88\u7387</p>\n                        <strong class=\"bit\">" + obj.perNumNoRate + "</strong>\n                    </dd>\n                    <dd>\n                        <p class=\"title\">\u8BA2\u5355\u6210\u529F\u7387</p>\n                        <strong class=\"bit\">" + obj.perNumTrueRate + "</strong>\n                    </dd>\n                    <dd>\n                        <p class=\"title\">\u5355\u6708\u6700\u9AD8\u6536\u5BA2</p>\n                        <strong class=\"psn\">" + obj.monthHighPerNum + "</strong>\n                        <span class=\"time\">[" + obj.monthHighPerNumMonth + "]</span>\n                    </dd>\n                </dl>";
    };
    Basic.prototype.getItemSaleTpl = function () {
        return "<dt class=\"face\"><img src=\"" + (this.searchDate.saleFace ? this.searchDate.saleFace : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg') + "\" /></dt>\n                <dd class=\"user eps\">" + this.searchDate.saleName + "</dd>\n                <dd class=\"job eps\">" + this.searchDate.deptName + "</dd>";
    };
    Basic.prototype.birthdayFn = function (time) {
        if (time && time.length >= 10 && time.split('-').length > 2) {
            var Y = time.substring(0, 4), m = time.substr(5, 2), d = time.substr(8, 2);
            var now = new Date(), nY = now.getFullYear() + '', nm = this.toNum(now.getMonth() + 1) + '', nd = this.toNum(now.getDate()) + '';
            return Math.floor((parseInt(nY + nm + nd) - parseInt(Y + m + d)) / 10000);
        }
        else {
            return '-';
        }
    };
    //获取销售
    Basic.prototype.getSaleFaceList = function (skey, _node, from) {
        if (skey === void 0) { skey = ''; }
        var that = this;
        this.showLoading();
        $.post(this.getDateUrl.sale, { saleName: skey }, function (res) {
            that.hideLoading();
            if (res.saleWhole.length) {
                var str_1 = '';
                $.each(res.saleWhole, function (index, item) {
                    if (from === 'default') {
                        str_1 += that.saleListTpl(item);
                    }
                    if (from === 'search') {
                        str_1 += that.sfaceListTpl(item);
                    }
                });
                _node.html(str_1);
            }
            else {
                _node.html('<p class="nodeDate">暂无数据</p>');
            }
        }, 'json');
    };
    //初始化数据
    Basic.prototype.initDate = function () {
        this.getSaleFaceList('', this.faceListStart, 'default');
        this.getSaleFaceList('', this.faceListSearch, 'search');
    };
    //显示loading
    Basic.prototype.showLoading = function () {
        this.loadNode = weui.loading('加载中...');
    };
    Basic.prototype.hideLoading = function () {
        this.loadNode.hide();
    };
    Basic.prototype.sfaceListEvents = function () {
        var saleListNode = $('#Js_saleList_panel');
        var that = this;
        saleListNode.on('click', function (e) {
            var nodeName = $(e.target);
            //选中销售
            if (nodeName.hasClass('face')) {
                var preNode = nodeName.parent();
                preNode.addClass('active').siblings('.item').removeClass('active');
                saleListNode.removeClass('s-show');
                that.searchDate.saleID = preNode.attr('data-id');
                that.searchDate.saleName = preNode.attr('data-name');
                that.searchDate.saleFace = preNode.attr('data-face');
                that.loadPage();
            }
            //搜索框
            if (nodeName.hasClass('s-btn')) {
                var skey = saleListNode.find('.s-skey').val();
                that.getSaleFaceList(skey, that.faceListStart, 'default');
            }
            //跳过
            if (nodeName.hasClass('btn-jump')) {
                saleListNode.removeClass('s-show');
                that.loadPage();
            }
        });
    };
    //初始化节点
    Basic.prototype.initNodes = function () {
        this.pageShowTimeNode = $('#Js_page_showTime');
        this.pageTitle = $('#Js_pageTitle');
        this.saleFdScroll = $('#Js_fdScroll');
        this.pageOneInfosNode = $('#Js_pageOne_saleInfo');
        this.achievementNodes = $('#Js_achievement');
        this.saleTypeBitNodes = $('#Js_saleTypeBit');
    };
    Basic.prototype.init = function () {
        //获取页面节点
        this.initNodes();
        this.sfaceListEvents();
        this.searchEvents();
        this.createSwiper();
        //初始化页面显示数据
        this.initDate();
        //初始化页面时间显示
        this.pageShowTime();
    };
    Basic.prototype.toNum = function (num) {
        if (num < 10) {
            return '0' + num;
        }
        return num;
    };
    Basic.prototype.getTimeItem = function (time, type) {
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
    Basic.prototype.searchEvents = function () {
        var _this = this;
        var now = new Date();
        var searchPanelNode = $('#Js_searchPanel');
        var faceListNode = $('#Js_faceList');
        var skey = '';
        $('#Js_screen').click(function () {
            searchPanelNode.addClass('s-show');
        });
        searchPanelNode.on('click', function (e) {
            var nodeName = $(e.target);
            if (nodeName.hasClass('btn-true')) {
                searchPanelNode.removeClass('s-show');
                _this.pageShowTime();
                _this.loadPage();
            }
            //返回
            if (nodeName.hasClass('back')) {
                searchPanelNode.removeClass('s-show');
            }
            //销售搜索
            if (nodeName.hasClass('s-face-btn')) {
                skey = nodeName.parent().find('.s-input').val();
                _this.getSaleFaceList(skey, _this.faceListSearch, 'search');
            }
            //选择销售
            if (nodeName.hasClass('user-face') || nodeName.hasClass('user-name')) {
                var nowItemNode = null;
                if (nodeName.hasClass('user-face')) {
                    nowItemNode = nodeName.parent().parent();
                }
                else {
                    nowItemNode = nodeName.parent();
                }
                _this.searchDate.saleID = nowItemNode.attr('data-id');
                _this.searchDate.saleName = nowItemNode.attr('data-name');
                _this.searchDate.saleFace = nowItemNode.attr('data-face');
                nowItemNode.addClass('active').siblings('.face-item').removeClass('active');
            }
            //开始时间
            if (nodeName.hasClass('s-start')) {
                weui.datePicker({
                    start: 2012,
                    defaultValue: [_this.getTimeItem(_this.searchDate.startdate, 'Y'), _this.getTimeItem(_this.searchDate.startdate, 'm'), _this.getTimeItem(_this.searchDate.startdate, 'd')],
                    end: _this.searchDate.enddate,
                    onConfirm: function (result) {
                        _this.searchDate.startdate = result[0].value + '-' + _this.toNum(result[1].value) + '-' + _this.toNum(result[2].value);
                        nodeName.val(_this.searchDate.startdate);
                    }
                });
            }
            //结束时间
            if (nodeName.hasClass('s-end')) {
                weui.datePicker({
                    start: _this.searchDate.startdate,
                    defaultValue: [_this.getTimeItem(_this.searchDate.enddate, 'Y'), _this.getTimeItem(_this.searchDate.enddate, 'm'), _this.getTimeItem(_this.searchDate.enddate, 'd')],
                    // end: new Date().getFullYear()+1,
                    onConfirm: function (result) {
                        _this.searchDate.enddate = result[0].value + '-' + _this.toNum(result[1].value) + '-' + _this.toNum(result[2].value);
                        nodeName.val(_this.searchDate.enddate);
                    }
                });
            }
            //全部
            if (nodeName.hasClass('dropLoadMax')) {
                if (faceListNode.hasClass('max')) {
                    nodeName.addClass('max');
                    faceListNode.removeClass('max');
                }
                else {
                    nodeName.removeClass('max');
                    faceListNode.addClass('max');
                }
            }
            //确定
            if (nodeName.hasClass('s-click') && !nodeName.hasClass('active')) {
                _this.searchDate[nodeName.parent().attr('data-text')] = nodeName.attr('data-type');
                nodeName.addClass('active').siblings('.s-click').removeClass('active');
            }
        });
    };
    //外层翻页
    Basic.prototype.createSwiper = function () {
        var _this = this;
        new Swiper('.swiper-container', {
            direction: 'vertical',
            autoHeight: true,
            loop: false,
            initialSlide: 0,
            onSlideChangeEnd: function (e) {
                if (e.realIndex === 0) {
                    _this.saleFdScroll.removeClass('prev').addClass('next').text('上滑查看更多');
                }
                if (e.realIndex === (e.slidesSizesGrid.length - 1)) {
                    _this.saleFdScroll.removeClass('next').addClass('prev').text('下滑查看更多');
                }
                _this.pageNum = e.realIndex;
                _this.loadPage();
            }
        });
    };
    Basic.prototype.loadDatePages = function (pagestr, fn) {
        var that = this;
        this.showLoading();
        this.searchDate.pageType = pagestr;
        $.post(this.getDateUrl.deepSale, this.searchDate, function (data) {
            that.pageDates[pagestr] = data;
            that.hideLoading();
            fn.call(that);
        }, 'json');
    };
    Basic.prototype.setPageItemSale = function (page) {
        $('#Js_pageInfo_sale_' + page).html(this.getItemSaleTpl());
    };
    //页面时间显示
    Basic.prototype.pageShowTime = function () {
        this.pageShowTimeNode.html('[ ' + this.searchDate.startdate + ' — ' + this.searchDate.enddate + ' ]');
    };
    Basic.prototype.loadPage = function () {
        var pageNum = this.pageNum;
        switch (pageNum) {
            case 0:
                this.pageTitle.text('基本信息');
                this.getSaleInfos();
                break;
            case 1:
                this.pageTitle.text('业绩走势');
                this.setPageItemSale(pageNum);
                this.loadDatePages('yeji', this.achievement);
                break;
            case 2:
                this.pageTitle.text('收客人数');
                this.setPageItemSale(pageNum);
                this.loadDatePages('shouke', this.saloon);
                break;
            case 3:
                this.pageTitle.text('订单利润与亏损占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('lirun', this.profit);
                break;
            case 4:
                this.pageTitle.text('产品类别销售占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('chanpin', this.saleTypeBit);
                break;
            case 5:
                this.pageTitle.text('客单价区间销量占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('kedan', this.unitPrice);
                break;
        }
    };
    //获取第一页数据
    Basic.prototype.getSaleInfos = function () {
        var that = this;
        this.showLoading();
        $.post(this.getDateUrl.itemSale, that.searchDate, function (data) {
            that.hideLoading();
            that.searchDate.deptName = data.saleSingles.deptName;
            if (data.saleSingles) {
                that.pageOneInfosNode.html(that.saleInfoPageOneTpl(data.saleSingles));
            }
        }, 'json');
    };
    Basic.prototype.formatNum = function (num) {
        var str = num.toString().split('.');
        var num1 = str[0];
        var num2 = '00', len1 = 0, len2 = 0;
        if (str.length > 1) {
            num2 = str[1];
        }
        var re = /(?=(?!(\b))(\d{3})+$)/g;
        var str1 = num1.replace(re, ",");
        var str2 = Number('0.' + num2).toFixed(2);
        return str1 + str2.substring(1);
    };
    //业绩走势
    Basic.prototype.achievement = function () {
        var arr = this.pageDates.yeji.saleAchievement || [];
        var arrDateKey = [];
        var arrDateValue = [];
        var sum = 0;
        arr.forEach(function (item, index) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.amount);
            sum += Number(item.amount);
        });
        $('#Js_page_1_title').text(this.formatNum(sum));
        var trendChart = echarts.init(document.getElementById('Js_achievement'));
        var option = {
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
            grid: {
                show: true,
                left: '20',
                right: '20',
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
                    data: arrDateValue
                }]
        };
        trendChart.setOption(option);
    };
    //收客走势
    Basic.prototype.saloon = function () {
        var sum = 0;
        var arr = this.pageDates.shouke.salePerNumTrend || [];
        var arrDateKey = [];
        var arrDateValue = [];
        arr.forEach(function (item, index) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.perNum);
            sum += Number(item.perNum);
        });
        $('#Js_page_2_title').text(sum);
        var trendChart = echarts.init(document.getElementById('Js_saloon'));
        var option = {
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
            grid: {
                show: true,
                left: '20',
                right: '20',
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
        trendChart.setOption(option);
    };
    //订单利润与亏损占比
    Basic.prototype.profit = function () {
        var _this = this;
        var obj = this.pageDates.lirun.saleProfitLoss;
        var cvsBox = $("#Js_profit_loss");
        var _H = cvsBox.height();
        var cvsHeight = cvsBox.find('.item-hd').height();
        var cvsList = cvsBox.find('.ctx');
        cvsList.parent().css('width', cvsHeight);
        var data = [
            {
                color: '#3bccff',
                bit: Number(obj.profit.saleProfitPercentage || 0),
                iNum: 0,
                deg: 0,
                timer: 0,
                amount: obj.profit.saleProfitAmount
            },
            {
                color: '#715eff',
                bit: Number(obj.loss.saleLossPercentage || 0),
                iNum: 0,
                deg: 0,
                timer: 0,
                amount: obj.loss.saleLossAmount
            }
        ];
        data.forEach(function (item, index) {
            cvsBox.find('.item').eq(index).find('.bit').html((item.bit ? item.bit.toFixed(2) : '0') + '<span>%</span>');
            cvsBox.find('.item').eq(index).find('.pst').html('<span>￥</span>' + Math.abs(item.amount || 0));
        });
        cvsList.attr({
            'width': cvsHeight * _this._scaleBit,
            'height': cvsHeight * _this._scaleBit
        });
        cvsList.each(function (index, cvsNode) {
            var ctx = cvsNode.getContext('2d');
            var disX = cvsNode.width / 2;
            var arcWidth = 20 * _this._scaleBit;
            function run() {
                ctx.clearRect(0, 0, cvsNode.width, cvsNode.height);
                ctx.beginPath();
                ctx.lineWidth = arcWidth;
                ctx.strokeStyle = '#0e3c6c';
                ctx.arc(disX, disX, disX - arcWidth / 2, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = data[index].color;
                data[index].deg = ((data[index].iNum - 25) / 50) * Math.PI;
                ctx.arc(disX, disX, disX - arcWidth / 2, -0.5 * Math.PI, data[index].deg);
                ctx.stroke();
                data[index].iNum++;
                if (data[index].iNum > data[index].bit) {
                    window.cancelAnimationFrame(data[index].timer);
                    return;
                }
                data[index].timer = window.requestAnimationFrame(run);
            }
            run();
        });
    };
    //生成图表
    Basic.prototype.salePropCvs = function (id, num, color) {
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
            if (ctx.Num - num > 0 && ctx.Num - num <= 1) {
                deg = ((num - 25) / 50) * Math.PI;
                numText.innerHTML = num + '<span class="bit">%</span>';
            }
            else {
                deg = ((ctx.Num - 25) / 50) * Math.PI;
                numText.innerHTML = ctx.Num + '<span class="bit">%</span>';
            }
            ctx.arc(_W / 2, _W / 2, _W / 2 - _R / 2, -0.5 * Math.PI, deg);
            ctx.stroke();
            if (ctx.Num - num > 0 && ctx.Num - num <= 1) {
                window.cancelAnimationFrame(ctx.timer);
                return;
            }
            ctx.Num++;
            ctx.timer = window.requestAnimationFrame(run);
        }
        run();
    };
    //销售类别占比模板
    Basic.prototype.saleTypeTpl = function (obj, _width, _marginRight, num) {
        return "<dl class=\"cvs-item\" style=\"width: " + _width + "px;margin-right:" + _marginRight + "px;\">\n                    <dt class=\"cvs-cnt\" style=\"width:" + _width + "px;height: " + _width + "px;\">\n                        <canvas class=\"cxt\" id=\"Js_saleType_" + num + "\" width=\"" + _width + "\" height=\"" + _width + "\"></canvas>\n                        <p class=\"ctx-num\"></p>\n                    </dt>\n                    <dd class=\"typeName eps\">" + (obj.lineTypeName || '-') + "</dd>\n                    <dd class=\"num eps\">\u6536\u5BA2" + obj.salePerNum + "\u4EBA</dd>\n                    <dd class=\"no eps\">\u56E2\u961FNO." + (obj.saleRanking + 1) + "</dd>\n                </dl>";
    };
    //产品类别销售占比
    Basic.prototype.saleTypeBit = function () {
        var that = this;
        var arr = this.pageDates.chanpin.saleLineTypePercentage || [];
        var len = arr.length;
        var iMr = 0;
        var iWd = 0;
        if (len > 6) {
            this.saleTypeBitNodes.css({
                'width': this._ww * 0.38 * Math.ceil(len / 2),
                "padding-left": this._ww * 0.025
            });
            iWd = this._ww * 0.3;
            iMr = this._ww * 0.08;
        }
        else {
            this.saleTypeBitNodes.addClass('min');
            this.saleTypeBitNodes.css('width', this._ww * 0.325 * Math.ceil(len / 2) - this._ww * 0.025);
            iWd = this._ww * 0.3;
            iMr = this._ww * 0.025;
        }
        var html = '';
        arr.forEach(function (item, index) {
            html += that.saleTypeTpl(item, iWd, iMr, index);
        });
        this.saleTypeBitNodes.html(html);
        var cvsList = this.saleTypeBitNodes.find('.cxt');
        var iNum = 0;
        var _this = this;
        var _timer = setInterval(function () {
            if (iNum >= len) {
                clearInterval(_timer);
                return;
            }
            _this.salePropCvs(iNum, Number(arr[iNum].salePerNumPercentage), '#725cff');
            iNum++;
        }, 100);
    };
    //客单价区间销量占比
    Basic.prototype.unitPrice = function () {
        var data = this.pageDates.kedan.saleUnitPriceSection || [];
        data.sort(function (a, b) {
            return b.startAmount - a.startAmount;
        });
        var _a = [this._scaleBit, data.length, 50], bit = _a[0], Len = _a[1], _LH = _a[2];
        var cvsNode = $("#Js_unitPrice");
        Len = Math.floor(cvsNode.parent().height() / _LH) > Len ? Len : Math.floor(cvsNode.parent().height() / _LH);
        cvsNode.parent().css({
            width: this._ww,
            height: Len * _LH
        });
        var cvs = cvsNode.get(0);
        cvs.width = this._ww * bit;
        cvs.height = Len * _LH * bit;
        var ctx = cvs.getContext('2d');
        var disX = 15 * bit, _height = 25 * bit, _lineHeight = _LH * bit, maxWidth = cvs.width - 30 * bit, maxValue = 0;
        data.forEach(function (item, index) {
            if (Number(item.saleUnitPriceSection) > maxValue) {
                maxValue = Number(item.saleUnitPriceSection);
            }
        });
        var iNum = 0;
        var linearFillType = ctx.createLinearGradient(disX, 0, disX + (maxWidth * maxValue) / 100, 0);
        linearFillType.addColorStop(0, "#5943ff");
        linearFillType.addColorStop(1, "#ed69c7");
        var _timer = null;
        function run() {
            if (iNum - maxValue > 0 && iNum - maxValue <= 1) {
                window.cancelAnimationFrame(_timer);
                return false;
            }
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            for (var i = 0; i < Len; i++) {
                ctx.fillStyle = '#17305a';
                ctx.fillRect(disX, _height + i * _lineHeight, maxWidth, _height);
                ctx.fillStyle = '#3bccff';
                ctx.textBaseline = "bottom";
                ctx.font = 13 * bit + "px Arial";
                ctx.textAlign = "start";
                if (i === 0) {
                    ctx.fillText(data[i].startAmount + '以上', disX, _height + i * _lineHeight);
                }
                else if (i === Len - 1) {
                    ctx.fillText(data[i].endAmount + '以下', disX, _height + i * _lineHeight);
                }
                else {
                    ctx.fillText(data[i].startAmount + '-' + data[i].endAmount, disX, _height + i * _lineHeight);
                }
                ctx.fillStyle = '#44f8ff';
                ctx.textAlign = "end";
                if (data[i].saleUnitPriceSection > iNum) {
                    ctx.fillText(iNum + '%', cvs.width - disX, _height + i * _lineHeight);
                    ctx.fillStyle = linearFillType;
                    ctx.fillRect(disX, _height + i * _lineHeight, (maxWidth * iNum) / 100, _height);
                }
                else {
                    ctx.fillText(data[i].saleUnitPriceSection + '%', cvs.width - disX, _height + i * _lineHeight);
                    ctx.fillStyle = linearFillType;
                    ctx.fillRect(disX, _height + i * _lineHeight, (maxWidth * data[i].saleUnitPriceSection) / 100, _height);
                }
            }
            iNum++;
            _timer = window.requestAnimationFrame(run);
        }
        run();
    };
    return Basic;
}());
$(function () {
    new Basic();
});
