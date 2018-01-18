declare var $: any;
declare var Swiper: any;
declare var echarts: any;
declare var weui: any;

(function(window:any) {
    let lastTime:number = 0;
    let vendors:string[] = ['','webkit', 'moz'];
    for(let x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] ||    // Webkit中此取消方法的名字变了
            window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback:any, element:any) {
            let currTime = new Date().getTime();
            let timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
            let id = window.setTimeout(function() {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id:number) {
            clearTimeout(id);
        };
    }
}(window));


class Basic{
    private _winfo:any;
    private _ww:number;
    private _wh:number;
    private _rem:number;
    private _scaleBit:number = 4;
    private achievementNodes:any;
    private saleTypeBitNodes:any;
    private saleFdScroll:any;
    private pageOneInfosNode:any;
    private pageShowTimeNode:any;
    private pageNum:number=0;
    private faceListSearch:any;
    private faceListStart:any;
    private pageDates:any={
        'yeji':null,
        'shouke':null,
        'dingdnalaiyuan':null,
        'kedan':null,
        'lirun':null,
        'leibie':null,
        'chanpin':null
    };
    private pageTitle:any;
    private getDateUrl:any;
    private searchDate:any;
    private loadNode:any;
    constructor(){
        this._winfo = document.body.getBoundingClientRect();
        this._ww = this._winfo.width;
        this._wh = this._winfo.height;
        this._rem = this._ww/25;
        this.getDateUrl = {
            //获取所有销售
            sale: '/sys/api/1.0.0/big-date/dsj-api-allSales',
            //获取单个销售基本信息
            itemSale: '/sys/api/1.0.0/big-date/dsj-api-itemSaleInfos',
            //获取销售不同页面的数据
            deepSale: '/sys/api/1.0.0/big-date/dsj-api-pageAlls'
        };
        this.searchDate = {
            saleID:'',  //销售ID
            saleName:'', //销售名称
            saleFace:'',  //销售照片
            deptName:'',  //销售部门
            operate_type:'', // 0  自营  1 他营
            dateType:'出团日期',   //时间类型
            startdate:'2017-01-01',  //起止时间
            enddate:'2018-01-01'
        };
        this.faceListSearch = $('#Js_faceList');
        this.faceListStart = $('#Js_s_faceList');
        this.init();
    }
    //销售模板
    private saleListTpl(obj:any){
        return `<li class="item" data-id="${obj.saleID}" data-name="${obj.saleName}" data-face="${obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}">
                    <img class="face" src="${obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}">
                    <span class="user eps">${obj.saleName}</span>
                </li>`;
    }
    private sfaceListTpl(obj:any){
        return `<dl class="face-item" data-id="${obj.saleID}" data-name="${obj.saleName}" data-face="${obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}">
                    <dt>
                        <img class="user-face" src="${obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}" />
                    </dt>
                    <dd class="user-name eps">${obj.saleName}</dd>
                </dl>`;
    }
    //销售基本信息模板
    private saleInfoPageOneTpl(obj:any){
        return `<dl class="saleInfo">
                    <dt class="face">
                        <img src="${obj.head_photo ? obj.head_photo : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}" />
                    </dt>
                    <!--sex-woman 女-->
                    <dd class="user sex-man">${obj.saleName}<span class="icon icon-${obj.sex==='男' ? 'man': 'sex'}"></span></dd>
                    <dd class="item">出生日期<span class="v">${obj.birthday ? obj.birthday.substring(0,10) : '-'}</span></dd>
                    <dd class="item fr">年龄<span class="v">${this.birthdayFn(obj.birthday)}</span></dd>
                    <dd class="item" style="width: 14rem;">入职时长<span class="v">${this.birthdayFn(obj.entryData)}年</span></dd>
                </dl>
                <dl class="amounts">
                    <dt>
                        <p class="title">未回款金额</p>
                        <strong class="no-amount amount">${this.formatNum(obj.pingAmountNo)}</strong>
                    </dt>
                    <dd>
                        <p class="title">当前客户量</p>
                        <strong class="psn">${obj.perNumTrue}</strong>
                    </dd>
                    <dd>
                        <p class="title">订单取消率</p>
                        <strong class="bit">${obj.perNumNoRate}</strong>
                    </dd>
                    <dd>
                        <p class="title">订单成功率</p>
                        <strong class="bit">${obj.perNumTrueRate}</strong>
                    </dd>
                    <dd>
                        <p class="title">单月最高收客</p>
                        <strong class="psn">${obj.monthHighPerNum}</strong>
                        <span class="time">[${obj.monthHighPerNumMonth}]</span>
                    </dd>
                </dl>`;
    }
    private getItemSaleTpl(){
        return `<dt class="face"><img src="${this.searchDate.saleFace ? this.searchDate.saleFace : 'http://cdnfile.op110.com.cn/files/1/file/20170727/face_1501143964193.jpg'}" /></dt>
                <dd class="user eps">${this.searchDate.saleName}</dd>
                <dd class="job eps">${this.searchDate.deptName}</dd>`;
    }
    private birthdayFn(time:any){
        if(time && time.length>=10 && time.split('-').length>2){
            var Y = time.substring(0,4),
                m = time.substr(5,2),
                d = time.substr(8,2);
            var now = new Date(),
                nY = now.getFullYear()+'',
                nm = this.toNum(now.getMonth()+1)+'',
                nd = this.toNum(now.getDate())+'';
            return Math.floor((parseInt(nY+nm+nd)-parseInt(Y+m+d))/10000);
        }else{
            return '-';
        }
    }
    //获取销售
    private getSaleFaceList(skey:string='',_node:any,from:string){
        let that = this;
        this.showLoading();
        $.post(this.getDateUrl.sale,{saleName:skey},function (res:any) {
            that.hideLoading();
            if(res.saleWhole.length){
                let str= '';
                $.each(res.saleWhole,function (index:number,item:any) {
                    if(from==='default'){
                        str+= that.saleListTpl(item);
                    }
                    if(from==='search'){
                        str+= that.sfaceListTpl(item);
                    }
                });
                _node.html(str);
            }else{
                _node.html('<p class="nodeDate">暂无数据</p>');
            }
        },'json');
    }
    //初始化数据
    private initDate(){
        this.getSaleFaceList('',this.faceListStart,'default');
        this.getSaleFaceList('',this.faceListSearch,'search');
    }
    //显示loading
    private showLoading(){
        this.loadNode = weui.loading('加载中...');
    }
    private hideLoading(){
        this.loadNode.hide();
    }
    private sfaceListEvents(){
        let saleListNode = $('#Js_saleList_panel');
        let that = this;
        saleListNode.on('click',function (e:any) {
            let nodeName = $(e.target);
            //选中销售
            if(nodeName.hasClass('face')){
                let preNode = nodeName.parent();
                preNode.addClass('active').siblings('.item').removeClass('active');
                saleListNode.removeClass('s-show');
                that.searchDate.saleID = preNode.attr('data-id');
                that.searchDate.saleName = preNode.attr('data-name');
                that.searchDate.saleFace = preNode.attr('data-face');
                that.loadPage();
            }
            //搜索框
            if(nodeName.hasClass('s-btn')){
                let skey = saleListNode.find('.s-skey').val();
                that.getSaleFaceList(skey,that.faceListStart,'default');
            }
            //跳过
            if(nodeName.hasClass('btn-jump')){
                saleListNode.removeClass('s-show');
                that.loadPage();
            }
        });
    }

    //初始化节点
    private initNodes(){
        this.pageShowTimeNode = $('#Js_page_showTime');
        this.pageTitle = $('#Js_pageTitle');
        this.saleFdScroll = $('#Js_fdScroll');
        this.pageOneInfosNode = $('#Js_pageOne_saleInfo');
        this.achievementNodes = $('#Js_achievement');
        this.saleTypeBitNodes = $('#Js_saleTypeBit');
    }
    private init (){
        //获取页面节点
        this.initNodes();
        this.sfaceListEvents();
        this.searchEvents();
        this.createSwiper();
        //初始化页面显示数据
        this.initDate();
        //初始化页面时间显示
        this.pageShowTime();
    }
    private toNum(num:number){
        if(num<10){
            return '0'+num;
        }
        return num;
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
        let faceListNode = $('#Js_faceList');
        let skey = '';
        $('#Js_screen').click(function () {
            searchPanelNode.addClass('s-show');
        });

        searchPanelNode.on('click',function (e:any) {
            let nodeName = $(e.target);
            if(nodeName.hasClass('btn-true')){  //确定
                searchPanelNode.removeClass('s-show');
                _this.pageShowTime();
                _this.loadPage();
            }
            //返回
            if(nodeName.hasClass('back')){
                searchPanelNode.removeClass('s-show');
            }

            //销售搜索
            if(nodeName.hasClass('s-face-btn')){
                skey = nodeName.parent().find('.s-input').val();
                _this.getSaleFaceList(skey,_this.faceListSearch,'search');
            }

            //选择销售
            if(nodeName.hasClass('user-face') || nodeName.hasClass('user-name')){
                let nowItemNode=null;
                if(nodeName.hasClass('user-face')){
                    nowItemNode = nodeName.parent().parent();
                }else{
                    nowItemNode = nodeName.parent();
                }
                _this.searchDate.saleID = nowItemNode.attr('data-id');
                _this.searchDate.saleName = nowItemNode.attr('data-name');
                _this.searchDate.saleFace = nowItemNode.attr('data-face');
                nowItemNode.addClass('active').siblings('.face-item').removeClass('active');
            }

            //开始时间
            if(nodeName.hasClass('s-start')){  //
                weui.datePicker({
                    start: 2012,
                    defaultValue:[_this.getTimeItem(_this.searchDate.startdate,'Y'),_this.getTimeItem(_this.searchDate.startdate,'m'),_this.getTimeItem(_this.searchDate.startdate,'d')],
                    end: _this.searchDate.enddate,
                    onConfirm: function (result:any) {
                        _this.searchDate.startdate = result[0].value+'-'+_this.toNum(result[1].value)+'-'+_this.toNum(result[2].value);
                        nodeName.val(_this.searchDate.startdate);
                    }
                });
            }
            //结束时间
            if(nodeName.hasClass('s-end')){
                weui.datePicker({
                    start: _this.searchDate.startdate,
                    defaultValue:[_this.getTimeItem(_this.searchDate.enddate,'Y'),_this.getTimeItem(_this.searchDate.enddate,'m'),_this.getTimeItem(_this.searchDate.enddate,'d')],
                    // end: new Date().getFullYear()+1,
                    onConfirm: function (result:any) {
                        _this.searchDate.enddate = result[0].value+'-'+_this.toNum(result[1].value)+'-'+_this.toNum(result[2].value);
                        nodeName.val(_this.searchDate.enddate);
                    }
                });
            }
            //全部
            if(nodeName.hasClass('dropLoadMax')){
                if(faceListNode.hasClass('max')){
                    nodeName.addClass('max');
                    faceListNode.removeClass('max');
                }else{
                    nodeName.removeClass('max');
                    faceListNode.addClass('max');
                }
            }
            //确定
            if(nodeName.hasClass('s-click') && !nodeName.hasClass('active')){
                _this.searchDate[nodeName.parent().attr('data-text')] = nodeName.attr('data-type');
                nodeName.addClass('active').siblings('.s-click').removeClass('active');
            }
        });
    }
    //外层翻页
    private createSwiper(){
        let _this = this;
        new Swiper('.swiper-container',{
            direction : 'vertical',
            autoHeight:true,
            loop:false,
            initialSlide :0,
            onSlideChangeEnd:function(e:any){
                if(e.realIndex===0){
                    _this.saleFdScroll.removeClass('prev').addClass('next').text('上滑查看更多');
                }
                if(e.realIndex===(e.slidesSizesGrid.length-1)){
                    _this.saleFdScroll.removeClass('next').addClass('prev').text('下滑查看更多');
                }
                _this.pageNum = e.realIndex;
                _this.loadPage();
            }
        });
    }
    private loadDatePages(pagestr:string,fn:Function){
        let  that = this;
        this.showLoading();
        this.searchDate.pageType = pagestr;
        $.post(this.getDateUrl.deepSale,this.searchDate,function (data:any) {
            that.pageDates[pagestr] = data;
            that.hideLoading();
            fn.call(that);
        },'json');
    }
    private setPageItemSale(page:number){
        $('#Js_pageInfo_sale_'+page).html(this.getItemSaleTpl());
    }
    //页面时间显示
    private pageShowTime(){
        this.pageShowTimeNode.html('[ '+this.searchDate.startdate+' — '+this.searchDate.enddate+' ]');
    }
    private loadPage(){
        let pageNum = this.pageNum;
        switch (pageNum){
            case 0:
                this.pageTitle.text('基本信息');
                this.getSaleInfos();
                break;
            case 1:
                this.pageTitle.text('业绩走势');
                this.setPageItemSale(pageNum);
                this.loadDatePages('yeji',this.achievement);
                break;
            case 2:
                this.pageTitle.text('收客人数');
                this.setPageItemSale(pageNum);
                this.loadDatePages('shouke',this.saloon);
                break;
            case 3:
                this.pageTitle.text('订单利润与亏损占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('lirun',this.profit);
                break;
            case 4:
                this.pageTitle.text('产品类别销售占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('chanpin',this.saleTypeBit);
                break;
            case 5:
                this.pageTitle.text('客单价区间销量占比');
                this.setPageItemSale(pageNum);
                this.loadDatePages('kedan',this.unitPrice);
                break;
        }
    }
    //获取第一页数据
    private getSaleInfos(){
        let that = this;
        this.showLoading();
        $.post(this.getDateUrl.itemSale,that.searchDate,function (data:any) {
            that.hideLoading();
            that.searchDate.deptName = data.saleSingles.deptName;
            if(data.saleSingles){
                that.pageOneInfosNode.html(that.saleInfoPageOneTpl(data.saleSingles));
            }
        },'json');
    }
    private formatNum(num:number) {
        var str = num.toString().split('.');
        var num1 = str[0];
        var num2 = '00',
            len1 = 0,
            len2 = 0;
        if (str.length > 1) {
            num2 = str[1];
        }
        var re = /(?=(?!(\b))(\d{3})+$)/g;
        var str1 = num1.replace(re, ",");
        var str2 = Number('0.' + num2).toFixed(2);
        return str1 + str2.substring(1);
    }
    //业绩走势
    private achievement(){
        let arr = this.pageDates.yeji.saleAchievement || [];
        let arrDateKey:any = [];
        let arrDateValue:any = [];
        let sum:number = 0;
        arr.forEach(function (item:any,index:number) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.amount);
            sum+=Number(item.amount);
        });
        $('#Js_page_1_title').text(this.formatNum(sum));
        let trendChart = echarts.init(document.getElementById('Js_achievement'));
        let option = {
            color: ['#33b4eb'],
            textStyle: {
                color: '#33b4eb',
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
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
                name: '营业额',
                type: 'bar',
                data: arrDateValue
            }]
        };
        trendChart.setOption(option);
    }
    //收客走势
    private saloon(){
        let sum:number = 0;
        let arr = this.pageDates.shouke.salePerNumTrend || [];
        let arrDateKey:any = [];
        let arrDateValue:any = [];
        arr.forEach(function (item:any,index:number) {
            arrDateKey.push(item.addTimeYearMonth);
            arrDateValue.push(item.perNum);
            sum+= Number(item.perNum);
        });
        $('#Js_page_2_title').text(sum);
        let trendChart = echarts.init(document.getElementById('Js_saloon'));
        let option = {
            color: ['ffd800'],
            textStyle: {
                color: '#33b4eb',
            },
            tooltip : {
                trigger: 'axis',
                axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                    type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
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
                        shadowOffsetY: 10,
                    }
                },
                data: arrDateValue
            }]
        };
        trendChart.setOption(option);
    }
    //订单利润与亏损占比
    private profit(){
        let _this = this;
        let obj:any = this.pageDates.lirun.saleProfitLoss;
        let cvsBox:any = $("#Js_profit_loss");
        let _H = cvsBox.height();
        let cvsHeight = cvsBox.find('.item-hd').height();
        let cvsList = cvsBox.find('.ctx');
        cvsList.parent().css('width',cvsHeight);
        let data=[
            {
                color:'#3bccff',
                bit:Number(obj.profit.saleProfitPercentage || 0),
                iNum:0,
                deg:0,
                timer:0,
                amount:obj.profit.saleProfitAmount
            },
            {
                color:'#715eff',
                bit:Number(obj.loss.saleLossPercentage || 0),
                iNum:0,
                deg:0,
                timer:0,
                amount:obj.loss.saleLossAmount
            }
        ];
        data.forEach(function(item:any,index:number){
            cvsBox.find('.item').eq(index).find('.bit').html((item.bit ? item.bit.toFixed(2):'0')+'<span>%</span>');
            cvsBox.find('.item').eq(index).find('.pst').html('<span>￥</span>'+Math.abs(item.amount || 0));
        });


        cvsList.attr({
            'width':cvsHeight*_this._scaleBit,
            'height':cvsHeight*_this._scaleBit
        });
        cvsList.each(function (index:number,cvsNode:any) {
            let ctx = cvsNode.getContext('2d');
            let disX = cvsNode.width/2;
            let arcWidth = 20*_this._scaleBit;
            function run(){
                ctx.clearRect(0, 0, cvsNode.width, cvsNode.height);
                ctx.beginPath();
                ctx.lineWidth = arcWidth;
                ctx.strokeStyle = '#0e3c6c';
                ctx.arc(disX, disX, disX-arcWidth/2, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.beginPath();
                ctx.strokeStyle = data[index].color;
                data[index].deg = ((data[index].iNum - 25) / 50) * Math.PI;
                ctx.arc(disX, disX, disX-arcWidth/2, -0.5*Math.PI,data[index].deg);
                ctx.stroke();
                data[index].iNum++;
                if(data[index].iNum>data[index].bit){
                    window.cancelAnimationFrame(data[index].timer);
                    return;
                }
                data[index].timer = window.requestAnimationFrame(run);
            }
            run();
        });
    }
    //生成图表
    private salePropCvs(id:any,num:any,color:any) {
        let _this = this;
        let cvsNode:any = document.querySelector('#Js_saleType_' + id);
        cvsNode.width = parseInt(cvsNode.width)*_this._scaleBit;
        cvsNode.height = parseInt(cvsNode.height)*_this._scaleBit;
        let numText = cvsNode.parentNode.childNodes[3];
        let ctx = cvsNode.getContext('2d'),
            deg=0;
        let _W = cvsNode.width;
        let _R = 14*_this._scaleBit;
        ctx.Num = 0;
        ctx.timer = null;
        function run(){
            if(num===0){
                ctx.beginPath();
                ctx.lineWidth = _R;
                ctx.strokeStyle = '#17305a';
                ctx.arc(_W/2, _W/2, _W/2-_R/2, 0, 2 * Math.PI);
                ctx.stroke();

                ctx.fillStyle = color;
                ctx.textBaseline="middle";
                ctx.font="bold 2.8rem Arial";
                ctx.textAlign = "center";
                numText.innerHTML = '0<span class="bit">%</span>';
                ctx.fillText(0,_W/2, _W/2);
            }

            ctx.clearRect(0, 0, cvsNode.width, cvsNode.height);
            ctx.beginPath();
            ctx.lineWidth = _R;
            ctx.strokeStyle = '#17305a';
            ctx.arc(_W/2, _W/2, _W/2-_R/2, 0, 2 * Math.PI);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = color;
            if(ctx.Num-num>0 && ctx.Num-num<=1){
                deg = ((num-25)/50) * Math.PI;
                numText.innerHTML = num+'<span class="bit">%</span>';
            }else{
                deg = ((ctx.Num - 25) / 50) * Math.PI;
                numText.innerHTML = ctx.Num+'<span class="bit">%</span>';
            }
            ctx.arc(_W/2, _W/2, _W/2-_R/2, -0.5*Math.PI, deg);
            ctx.stroke();
            if(ctx.Num-num>0 && ctx.Num-num<=1){
                window.cancelAnimationFrame(ctx.timer);
                return;
            }
            ctx.Num++;
            ctx.timer = window.requestAnimationFrame(run);
        }
        run();
    }


    //销售类别占比模板
    private saleTypeTpl(obj:any,_width:number,_marginRight:number,num:number){
        return `<dl class="cvs-item" style="width: ${_width}px;margin-right:${_marginRight}px;">
                    <dt class="cvs-cnt" style="width:${_width}px;height: ${_width}px;">
                        <canvas class="cxt" id="Js_saleType_${num}" width="${_width}" height="${_width}"></canvas>
                        <p class="ctx-num"></p>
                    </dt>
                    <dd class="typeName eps">${obj.lineTypeName || '-'}</dd>
                    <dd class="num eps">收客${obj.salePerNum}人</dd>
                    <dd class="no eps">团队NO.${obj.saleRanking+1}</dd>
                </dl>`;
    }

    //产品类别销售占比
    private saleTypeBit(){
        let that = this;
        let arr:any = this.pageDates.chanpin.saleLineTypePercentage || [];
        let len = arr.length;
        let iMr = 0;
        let iWd = 0;
        if(len>6){
            this.saleTypeBitNodes.css(
                {
                    'width':this._ww*0.38*Math.ceil(len/2),
                    "padding-left":this._ww*0.025
                }
            );
            iWd = this._ww*0.3;
            iMr = this._ww*0.08;
        }else{
            this.saleTypeBitNodes.addClass('min');
            this.saleTypeBitNodes.css('width',this._ww*0.325*Math.ceil(len/2)-this._ww*0.025);
            iWd = this._ww*0.3;
            iMr = this._ww*0.025;
        }
        var html = '';
        arr.forEach(function (item:any,index:number) {
            html+=that.saleTypeTpl(item,iWd,iMr,index);
        });
        this.saleTypeBitNodes.html(html);
        let cvsList:any = this.saleTypeBitNodes.find('.cxt');
        var iNum = 0;
        var _this = this;

        var _timer = setInterval(function () {
            if(iNum>=len){
                clearInterval(_timer);
                return;
            }
            _this.salePropCvs(iNum,Number(arr[iNum].salePerNumPercentage),'#725cff');
            iNum++;
        },100)
    }

    //客单价区间销量占比
    private unitPrice(){
        let data:any = this.pageDates.kedan.saleUnitPriceSection || [];
        data.sort(function (a:any,b:any) {
            return b.startAmount-a.startAmount;
        });
        let [bit,Len,_LH] = [this._scaleBit,data.length,50];
        let cvsNode:any = $("#Js_unitPrice");
        Len = Math.floor(cvsNode.parent().height()/_LH) > Len ? Len : Math.floor(cvsNode.parent().height()/_LH);
        cvsNode.parent().css({
            width:this._ww,
            height:Len*_LH
        });

        let cvs = cvsNode.get(0);
        cvs.width = this._ww*bit;
        cvs.height = Len*_LH*bit;

        let ctx = cvs.getContext('2d');
        let disX:number = 15*bit,
            _height:number = 25*bit,
            _lineHeight:number = _LH*bit,
            maxWidth:number = cvs.width-30*bit,
            maxValue:number = 0;
        data.forEach(function (item:any,index:number) {
            if(Number(item.saleUnitPriceSection)>maxValue){
                maxValue = Number(item.saleUnitPriceSection);
            }
        });



        let iNum:number = 0;
        let linearFillType:any = ctx.createLinearGradient(disX, 0, disX+(maxWidth*maxValue)/100, 0);
        linearFillType.addColorStop(0, "#5943ff");
        linearFillType.addColorStop(1, "#ed69c7");
        let _timer:any = null;
        function run(){
            if(iNum-maxValue>0 && iNum-maxValue<=1){
                window.cancelAnimationFrame(_timer);
                return false;
            }
            ctx.clearRect(0, 0, cvs.width, cvs.height);
            for(let i=0;i<Len;i++){
                ctx.fillStyle = '#17305a';
                ctx.fillRect(disX, _height+i*_lineHeight, maxWidth, _height);
                ctx.fillStyle = '#3bccff';
                ctx.textBaseline="bottom";
                ctx.font=13*bit+"px Arial";
                ctx.textAlign = "start";
                if(i===0){
                    ctx.fillText(data[i].startAmount+'以上',disX,_height+i*_lineHeight);
                }else if(i===Len-1){
                    ctx.fillText(data[i].endAmount+'以下',disX,_height+i*_lineHeight);
                }else{
                    ctx.fillText(data[i].startAmount+'-'+data[i].endAmount,disX,_height+i*_lineHeight);
                }

                ctx.fillStyle = '#44f8ff';
                ctx.textAlign = "end";
                if(data[i].saleUnitPriceSection>iNum){
                    ctx.fillText(iNum+'%',cvs.width-disX,_height+i*_lineHeight);
                    ctx.fillStyle = linearFillType;
                    ctx.fillRect(disX, _height+i*_lineHeight,(maxWidth*iNum)/100 , _height);
                }else{
                    ctx.fillText(data[i].saleUnitPriceSection+'%',cvs.width-disX,_height+i*_lineHeight);
                    ctx.fillStyle = linearFillType;
                    ctx.fillRect(disX, _height+i*_lineHeight,(maxWidth*data[i].saleUnitPriceSection)/100 , _height);
                }
            }
            iNum++;
            _timer = window.requestAnimationFrame(run);
        }
        run();

    }
}

$(function () {
    new Basic();
});