declare var $: any;
declare var Swiper: any;
declare var echarts: any;
declare var weui: any;


class operateBasic{
    private nowTime:any;
    private pageTitle:any;
    private saleFdScroll:any;
    private getDateUrl:any;
    private onePageSelect:any;
    private searchTimeSelect:any;
    private pageShowTimeNode:any;
    private pageOneCxt:any;
    private pageTwoCxt:any;
    private pageDates:any={
        one:null,
        two:null
    };
    private searchDates:any;
    private pageNum:number=0;
    private loadNode:any;
    constructor(){
        this.getDateUrl={
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
        this.searchDates={
            timeType:'month',
            operate_type:'',
            lineTypeID:'',
            lineID:'',
            startdate:'2017-01-01',
            enddate:'2018-01-01'
        };
        this.nowTime = new Date();
        this.setQueryTime(1);
        this.init();
    }
    private init(){
        this.initNodes();
        this.searchEvents();
        this.createSwiper();
        this.loadPage();
        this.pageShowTime();
    }
    private initNodes(){
        this.pageShowTimeNode = $('#Js_page_showTime');
        this.pageTitle = $('#Js_pageTitle');
        this.saleFdScroll = $('#Js_fdScroll');
        this.onePageSelect = $('#Js_onePage_select');
        this.searchTimeSelect = $('#Js_Search_timeSelect');
        //
        this.pageOneCxt = $('#Js_saleNum');
        this.pageTwoCxt = $('#Js_optNum');
    }
    private toNum(num:number){
        if(num<10){
            return '0'+num;
        }
        return num;
    }
    //显示loading
    private showLoading(){
        this.loadNode = weui.loading('加载中...');
    }
    //页面时间显示
    private pageShowTime(){
        this.pageShowTimeNode.html('[ '+this.searchDates.startdate+' — '+this.searchDates.enddate+' ]');
    }
    private hideLoading(){
        this.loadNode.hide();
    }
    private getTimeItem(time:string,type:string){
        if(time && time.length>=10){
            switch (type){
                case "Y":
                    return time.substr(0,4);
                case 'm':
                    return parseInt(time.substr(5,2));
                case 'd':
                    return parseInt(time.substr(7,2));
            }
        }
        return '';
    }
    //筛选
    private searchEvents(){
        let _this:any = this;
        let now = new Date();
        let searchPanelNode = $('#Js_searchPanel');
        $('#Js_screen').click(function () {
            searchPanelNode.addClass('s-show');
        });
        this.onePageSelect.on('click',function (e:any) {
            let nowNodes = $(e.target);
            nowNodes.addClass('active').siblings('.item').removeClass('active');
            _this.searchTimeSelect.find('.s-click').removeClass('active').eq(nowNodes.attr('data-index')).addClass('active');
            _this.searchDates.timeType = nowNodes.attr('data-type');
            _this.loadPage();
        });
        searchPanelNode.on('click',function (e:any) {
            let nodeName = $(e.target);
            //确定
            if(nodeName.hasClass('btn-true')){
                searchPanelNode.removeClass('s-show');
                _this.loadPage();
                _this.pageShowTime();
            }

            //返回
            if(nodeName.hasClass('back')){
                searchPanelNode.removeClass('s-show');
            }

            //开始时间
            if(nodeName.hasClass('s-start')){
                weui.datePicker({
                    start: 2012,
                    defaultValue:[_this.getTimeItem(_this.searchDates.startdate,'Y'),_this.getTimeItem(_this.searchDates.startdate,'m'),_this.getTimeItem(_this.searchDates.startdate,'d')],
                    end: _this.searchDates.enddate,
                    onConfirm: function (result:any) {
                        _this.searchDates.startdate = result[0].value+'-'+_this.toNum(result[1].value)+'-'+_this.toNum(result[2].value);
                        nodeName.val(_this.searchDates.startdate);
                    }
                });
            }

            //结束时间
            if(nodeName.hasClass('s-end')){
                weui.datePicker({
                    start: _this.searchDates.startdate,
                    defaultValue:[_this.getTimeItem(_this.searchDates.enddate,'Y'),_this.getTimeItem(_this.searchDates.enddate,'m'),_this.getTimeItem(_this.searchDates.enddate,'d')],
                    // end: new Date().getFullYear()+1,
                    onConfirm: function (result:any) {
                        _this.searchDates.enddate = result[0].value+'-'+_this.toNum(result[1].value)+'-'+_this.toNum(result[2].value);
                        nodeName.val(_this.searchDates.enddate);
                    }
                });
            }
            if(nodeName.hasClass('s-click') && !nodeName.hasClass('active')){
                if(nodeName.parent().attr('data-text')==='timeType'){
                    _this.onePageSelect.find('.item').removeClass('active').eq(nodeName.attr('data-index')).addClass('active');
                }
                _this.searchDates[nodeName.parent().attr('data-text')] = nodeName.attr('data-type');
                nodeName.addClass('active').siblings('.s-click').removeClass('active');
            }

            //搜索线路类别
            if(nodeName.hasClass('s-lineType')){
                let _skeyNode:any = nodeName.parent().find('.s-input');
                $.post(_this.getDateUrl.lineTypeUrl, {
                    'query':_skeyNode.val(),
                    'operate_type':_this.searchDates.operate_type
                },function (data:any) {
                    weui.picker(
                        data.rows.length>0 ? data.rows : [{value:'',label:'暂无类别'}],
                        {
                        onConfirm: function (result:any) {
                            _this.searchDates.lineTypeID = result[0].value;
                            _skeyNode.val(result[0].label);
                        }
                    });
                },"json");
            }

            //按线路搜索
            if(nodeName.hasClass('s-line')){
                let _skeyNode:any = nodeName.parent().find('.s-input');
                $.post(_this.getDateUrl.lineListUrl,{
                    'query':_skeyNode.val(),
                    'operate_type':_this.searchDates.operate_type,
                    'lineTypeID':_this.searchDates.lineTypeID
                },function (data:any) {
                    weui.picker(data.rows.length>0 ? data.rows : [{value:'',label:'暂无类别'}],
                        {
                            onConfirm: function (result:any) {
                                _this.searchDates.lineID = result[0].value;
                                _skeyNode.val(result[0].label);
                            }
                        });
                },'json');
            }
        });
    }
    private getTimeString(time:any){
        let [Y,m,d] = [time.getFullYear(),this.toNum(time.getMonth()+1),this.toNum(time.getData())];
        return Y+'-'+m+'-'+d;
    }
    /*设置快捷时间*/
    private setQueryTime(m:number){
        console.log(m);
        console.log(this.getTimeString(this.nowTime));
    }
    private createSwiper(){
        let _this = this;
        new Swiper('.swiper-container',{
            direction : 'vertical',
            loop:false,
            initialSlide :0,
            onSlideChangeEnd:function(e:any){
                _this.pageNum = e.realIndex;
                if(e.realIndex===0){
                    _this.saleFdScroll.removeClass('prev').addClass('next').text('上滑查看更多');
                }
                if(e.realIndex===(e.slidesSizesGrid.length-1)){
                    _this.saleFdScroll.removeClass('next').addClass('prev').text('下滑查看更多');
                }
                _this.loadPage()
            }
        });
    }
    private loadPage(){
        let _this = this;
        this.showLoading();
        switch (this.pageNum){
            case 0:
                this.pageTitle.text('产品销量分析');
                $.post(this.getDateUrl.productSale,this.searchDates,function (data:any) {
                    _this.pageDates.one = data.baseLineSalesVolume || [];
                    _this.hideLoading();
                    _this.saleNums();
                },'json');
                break;
            case 1:
                this.pageTitle.text('产品营业情况分析');
                $.post(this.getDateUrl.productBusiness,this.searchDates,function (data:any) {
                    _this.pageDates.two = data.baseLineIncome || [];
                    _this.hideLoading();
                    _this.optNums();
                },'json');
                break;
            case 2:
        }
    }
    private saleNums(){  //销量
        let dataLen = this.pageDates.one.length;
        // this.pageOneCxt.css('width',dataLen*1.5+'rem');
        let dataTimeArr:any = [];
        let planNums:any = [];
        let stayNums:any = [];
        let trueNums:any = [];
        let Len = this.pageDates.one.length;

        this.pageDates.one.forEach(function (item:any,index:number) {
            dataTimeArr.push(item.planDate);
            planNums.push(item.planNum);
            stayNums.push(item.stayNum);
            trueNums.push(item.trueNum);
        });

        let chart = echarts.init(document.getElementById('Js_saleNum'));
        let option = {
            color: ['#293271', '#36ff2c', '#04a6f6'],
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
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
                color: '#33b4eb',
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
                data:  dataTimeArr,
                axisTick: {
                    alignWithLabel: true,
                },
                axisLine: {
                    show:true,
                    lineStyle: {
                        width:0,
                        color: '#33b4eb'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        width:0,
                        color: '#0e5f97'
                    }
                }
            }],
            yAxis: [{
                type: 'value',
                axisLine: {
                    lineStyle: {
                        color: '#33b4eb',
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: '#0e5f97',
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
    }
    private optNums(){  //营业
        let amountList:any = [];
        let profitAmountList:any = [];
        let planDateList:any = [];
        this.pageDates.two.forEach(function (item:any,index:number) {
            amountList.push(Number(item.amount).toFixed(2));
            profitAmountList.push(Number(item.profitAmount).toFixed(2));
            planDateList.push(item.planDate);
        });
        let chart = echarts.init(document.getElementById('Js_optNum'));
        var option = {
            color: ['#0db9fb', '#fdbd44'],
            tooltip: {
                trigger: 'axis',
                axisPointer: { // 坐标轴指示器，坐标轴触发有效
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
                left: 20
            },
            textStyle: {
                color: '#33b4eb',
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
                        width:0,
                        color: '#33b4eb'
                    }
                },
                splitLine: {
                    show: true,
                    lineStyle: {
                        width:0,
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
    }
}

$(function () {
    new operateBasic();
});