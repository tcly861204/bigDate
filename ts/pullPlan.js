Wd.isURL = function(url){
    var Exp = /((http|https):\/\/([\w\-]+\.)+[\w\-]+(\/[\w\u4e00-\u9fa5\-\.\/?\@\%\!\&=\+\~\:\#\;\,]*)?)/ig;
    if(url && url.length && Exp.test(url)){
        return true;
    }else{
        return false;
    }
};

Wd.addLines = {
    //是否暂停采集
    isStop:false,
    //选择了几条要采集的线路
    PullLineLens:0,
    //是否开始采集线路
    isPullLine:false,
    //跑马灯效果timer
    timer:null,
    //当前采集的线路原始数据
    nowRunDate:null,
    //记录还有多少未采集
    backDate:null,
    //采集中timer
    collTimer:null,
    nodeCopyLists:[],
    nowRunNode:null,
    nowRunNum:0,
    diyCollLens:0,
    isInterface:false,
    /* 团期是否在采集中 */
    isPullPlan:false,
    /*添加ctrl*/
    addCol:function(){
        var that = this;
        return {
            layout:"absolute",
            width:650,
            id:"win_add_items_0_panel",
            height:30,
            xtype:"panel",
            border:false,
            items:[
                {
                    allowBlank:false,
                    width:552,
                    x:5,
                    y:2,
                    id:"win_add_items_0_line",
                    emptyText:'请输入网址...',
                    xtype:"textfield",
                    value:'',
                    fieldStyle:"padding:0 20px 0 5px",
                    listeners:{
                        change:function(text, newValue, oldValue, options){
                            var dom = $('#'+text.name);
                            if(newValue.length && newValue !==oldValue && isURL(newValue)){
                                if(dom.siblings('.viewUrl').length<1){
                                    that.viewUrlIcon(dom,newValue);
                                }else{
                                    dom.siblings('.viewUrl').attr('href',newValue);
                                }
                            }else{
                                dom.siblings('.viewUrl').remove();
                            }
                        }
                    }
                },
                {width:64,x:560,y:2,id:"win_add_items_0_add",iconCls:"x_add_icon",xtype:"button",text:"添加",height:22,
                    listeners:{click:function(button,event,options){
                            addLines.isAddNum++;
                            addLines.addLine(addLines.isAddNum);
                        }}
                }
            ]};
    },
    getWindow:function(){
        return {
            ww:viewport.getWidth(),
            wh:viewport.getHeight()
        };
    },
    showDetail:function(val,name){
        Wd.win_show_line_typeID = val;
        Wd.win_show_line_LineName = name;
        win_show_line_details.show();
    },
    getWebForm:function(newValue){
        if(newValue.indexOf('.ctrip.com')>0 && (newValue.indexOf('.ctrip.com')===newValue.lastIndexOf('.ctrip.com'))){
            return 1;
        }else if(newValue.indexOf('.qunar.com')>0 && (newValue.indexOf('.qunar.com')===newValue.lastIndexOf('.qunar.com'))){
            return 2;
        }else if(newValue.indexOf('.tuniu.com')>0 && (newValue.indexOf('.tuniu.com')===newValue.lastIndexOf('.tuniu.com'))){
            return 3;
        }else{
            return 0;
        }
    },
    /* 添加完线路显示Icon */
    viewUrlIcon:function(dom,newValue){
        switch(this.getWebForm(newValue)){
            case 1:
                dom.before('<a class="viewUrl viewUrl-xiecheng" title="查看" href="'+newValue+'" target="_blank"></a>');
                break;
            case 2:
                dom.before('<a class="viewUrl viewUrl-qunar" title="查看" href="'+newValue+'" target="_blank"></a>');
                break;
            case 3:
                dom.before('<a class="viewUrl viewUrl-tuniu" title="查看" href="'+newValue+'" target="_blank"></a>');
                break;
            default:
                dom.before('<a class="viewUrl viewUrl-default" title="查看" href="'+newValue+'" target="_blank"></a>');
                break;
        }
    },
    /* 清除网址不必要的参数 */
    clearUrl:function(url){
        var indexOf = url && url.indexOf('#');
        if(indexOf>0){
            return url.substring(0,indexOf);
        }
        return url;
    },
    /* 线路开始采集 */
    lineStart:function(flag){
        var that = this;
        //按网址添加
        var obj = {};
        var arr = [];
        if(!this.isInterface && Wb.verify(win_add_items)){

            obj.lineType = win_add_items_lienType.getValue();
            obj.lineType_text = win_add_items_lienType.getRawValue();

            var obj2 = Wb.getValue(win_add_items_panel);
            for(var i in obj2){
                if(/win_add_items_\d_line/.test(i) && obj2[i] && this.getWebForm(obj2[i])>0){
                    arr.push(that.clearUrl(obj2[i]));
                }
            }

            if(!arr.length){
                layer.msg('没有一条网址是有效的',{shift:6});
                return false;
            }
            if(!flag){ //只保存
                obj.url = arr.join('*#;#*');
                that.saveLineFn('34560VTZ7L23',obj,true);
                return false;
            }else{
                that.PullLineLens = arr.length;
                obj.url = arr.join('*#;#*');
                that.saveLineFn('34560VTZ7L23',obj,false);
                return false;
            }
        }
        //接口采集
        if(this.isInterface && Wb.verify(win_add_all)){
            var sel = Wb.getSelRec(win_add_all_grid);
            if(sel.length<1){
                layer.msg('请至少选择一条线路');
            }
            obj.lineType = win_add_all_lienType.getValue();
            obj.lineType_text = win_add_all_lienType.getRawValue();
            $.each(sel,function(index,item){
                arr.push({
                    lineCode:item.get('lineCode'),
                    lineName:item.get('lineName')
                });
            });
            if(!flag){   //只保存
                obj.interFaceList = Wb.encode(arr);
                that.saveLineFn('34580M8L7IQ6',obj,true);
                return false;
            }else{  //开始采集
                that.PullLineLens = arr.length;
                obj.interFaceList = Wb.encode(arr);
                that.saveLineFn('34580M8L7IQ6',obj,false);
            }
        }
    },
    saveLineFn:function(url,data,flag){
        var that = this;
        Wb.request({
            url: 'main?xwl='+url,
            params: data,
            showMask:flag,
            success: function(r){
                var j = Wb.decode(r.responseText);
                if(j.success){

                    win_add_coll.hide();
                    if(flag){
                        layer.msg('保存成功');
                    }else{
                        layer.msg('添加成功，准备开始采集中...');
                        //选择了几条要采集的线路
                        that.isPullLine = true;
                    }
                    Wb.reload(store_grid_list);
                }else{
                    layer.msg(j.msg,{shift:6});
                }
            }
        });
    },
    insertData:function(){
        var that = this;
        this.diyCollLens = this.PullLineLens;
        for(var k=0;k<this.PullLineLens;k++){
            grid_lines.getSelectionModel().select(k,true);
        }
        that.pullLine(false);
    },
    /*带有删除ctrl*/
    itemCol:function(id){
        var that = this;
        return {layout:"absolute",width:650,
            id:"win_add_items_"+id+"_panel",
            height:30,xtype:"panel",
            border:false,items:[
                {
//                   allowBlank:false,
                    width:552,
                    x:5,
                    y:2,
                    id:"win_add_items_"+id+"_line",
                    emptyText:'请输入网址...',
                    xtype:"textfield",
                    fieldStyle:"padding:0 20px 0 5px",
                    listeners:{
                        change:function(text, newValue, oldValue, options){
                            var dom = $('#'+text.name);
                            if(newValue.length && newValue !==oldValue && isURL(newValue)){
                                if(dom.siblings('.viewUrl').length<1){
                                    that.viewUrlIcon(dom,newValue);
                                }else{
                                    dom.siblings('.viewUrl').attr('href',newValue);
                                }
                            }else{
                                dom.siblings('.viewUrl').remove();
                            }
                        }
                    }
                },
                {
                    width:64,
                    x:560,
                    y:2,
                    id:"win_add_items_"+id+"_del",
                    colNum:id,
                    iconCls:"x_cancel_icon",xtype:"button",text:"删除",height:22,
                    listeners:{click:function(button,event,options){
                            addLines.remove(this);
                        }}
                }
            ]};
    },
    /*初始化*/
    init:function(){
        win_add_items_panel.add(addLines.addCol());
        win_add_items_panel.add(addLines.itemCol(addLines.isAddNum));
    },
    //添加
    addLine:function(id){
        win_add_items_panel.add(addLines.itemCol(id));
    },
    //删除
    remove:function(that){
        var num = that.colNum;
        win_add_items_panel.remove('win_add_items_'+num+'_panel');
    },
    scrollTips:function(){
        var W = 624,
            num = 0;
        var initLeft = -624;
        var scrollNode = $('#J_scrollTip');
        var pW = $('#J_scrollTip').parent().width();
        clearInterval(this.timer);
        scrollNode.css('right',num); //重置right
        this.timer = setInterval(function(){
            num++;
            if(initLeft+num>pW){
                num = 0;
            }
            scrollNode.css('right',initLeft+num);
        },20);
    },
    disabled:function(flag){
        btn_add.setDisabled(flag);
        btn_del.setDisabled(flag);
        btn_coll_plan.setDisabled(flag);
        btn_coll.setDisabled(flag);
        btn_ref.setDisabled(flag);
        btn_stop.setDisabled(!flag);
        btn_search.setDisabled(flag);
    },
    //线路开始采集中收集数据
    pullLine:function(flag,sel){
        var that = this,sels;
        this.isStop = false;
        this.nodeCopyLists.length = 0;
        if(flag){ //外面按钮开始采集
            sels = sel;
        }else{ //窗口按钮开始采集
            sels = Wb.getSelRec(grid_lines);
        }
        $.each(sels,function(index,item){
            that.nodeCopyLists.push(
                {
                    index:item.index,
                    isLock:item.get('is_lock') || 0,
                    lineType:item.get('line_type'),
                    lineType_text:item.get('cnName'),
                    url:item.get('web_url'),
                    id:item.get('id'),
                    lineCode:item.get('line_code'),
                    lineName:item.get('product_name'),
                    fromType:item.get('web_type')  //4众信
                });
        });
        that.nodeCopyLists.sort(function(a,b){
            return a.index-b.index;
        });
        loading_tips.show();
        this.scrollTips();
        this.disabled(true);
        //采集中
        this.copyList();
    },
    changeStatic:function(store,rowNum,obj){
        if(!store || !obj){
            return false;
        }
        store.getAt(rowNum).set(obj);
        store.getAt(rowNum).commit();
    },
    copyList:function(){
        var that = this;
        var rowNum = 0;
        var url = '';
        if(this.nodeCopyLists.length){
            var data = that.nodeCopyLists[0];
            rowNum = data.index;
            this.nowRunDate = data;
            this.nowRunNum = rowNum;

            //采集中
            that.changeStatic(store_grid_list,rowNum,{'is_lock':10});
            that.nodeCopyLists.shift();
            if(data.fromType===4){  //inderFace接口采集
                url = '3457PQGHMOSA';
            }else{   //url网址采集
                url = '34560VTZ7DCL';
            }
            Wb.request({
                url: 'main?xwl='+url,
                params: data,
                showMask: false,
                success: function(r){
                    var j = Wb.decode(r.responseText);
                    if(!that.isStop){  //采集没被暂停
                        if(j.success){
                            var s = Wb.decode(j.data);
                            that.changeStatic(store_grid_list,rowNum,
                                {
                                    'is_lock':1,
                                    'product_name':s.lineName,
                                    'cost_time':s.costTime,
                                    'line_id':s.lineId,
                                    'add_time':new Date(s.addTime)
                                }
                            );
                        }else{
                            that.changeStatic(store_grid_list,rowNum,{'is_lock':2});
                        }
                        grid_lines.getSelectionModel().deselect(rowNum);
                        that.copyList();
                    }
                }
            });
        }else{
            layer.msg('全部采集成功');
            //取消勾选
            that.disabled(false);
            that.diyCollLens = 0;
            that.isPullLine = false;
            //清除定时器
            clearInterval(that.timer);
            loading_tips.hide();
        }
    },
    //团期采集
    pullPlan:function(){
        grid_lines.mask();
    },
    //事件统一处理
    pullPlanBtns:function(isPull){
        this.isPullPlan = isPull;
        win_add_plan_start.setDisabled(isPull);
        win_add_plan_stop.setDisabled(!isPull);
        win_add_plan_ref.setDisabled(isPull);
        win_add_plan_close.setDisabled(isPull);
    },
    //团期开始采集前收集数据
    pullPlanStart:function(){
        if(Wb.verify(win_add_plan_hd)){
            var sel = Wb.getSelRec(win_add_plan_list);
            if(sel.length<1){
                layer.msg('请至少选择一条团期！',{shift:6});
                return false;
            }
            this.pullPlanBtns(true);
            var arr = [];
            for(var i=0;i<sel.length;i++){
                arr.push({
                    index:sel[i].index
                });
            }
            arr.sort(function(a,b){
                return a.index-b.index;
            });
            this.pullPlanList(arr,store_grid_list_plan);
        }
    },
    //暂停团期采集
    pullPlanStop:function(){
        this.changeStatic(store_grid_list_plan,this.nowRunNum,{'isLock':2});
        clearTimeout(this.collTimer);
        win_add_plan_start.setDisabled(false);
        win_add_plan_stop.setDisabled(true);
        this.pullPlanBtns(false);
    },
    /* 团期采集中 */
    pullPlanList:function(arr,store){
        var that = this;
        if(arr.length){
            var rowNum = arr[0].index;
            that.nowRunNum = rowNum;
            arr.shift();
            that.changeStatic(store,rowNum,{'isLock':3});
            that.collTimer = setTimeout(function(){
                //采集成功
                that.changeStatic(store_grid_list_plan,rowNum,{'isLock':1});
                win_add_plan_list.getSelectionModel().deselect(rowNum);
                that.pullPlanList(arr,store);
            },2000);
        }else{
            layer.msg('全部采集成功');
            that.pullPlanBtns(false);
        }
    },
    //暂停
    stop:function(){
        var that = this;
        this.isStop = true;
        //暂停跑马灯
        clearInterval(this.timer);
        loading_tips.hide();
        this.disabled(false);
        //暂停数据
        clearTimeout(that.collTimer);
        if(this.nowRunDate.isLock===0){
            //如果本来这条数据采集之前就是成功的，暂停只是取消，保留原来数据
            that.changeStatic(store_grid_list,that.nowRunNum,{'is_lock':3});
            Wb.request({
                url: 'main?xwl=3456YRCZGDT1',
                params: {ids:this.nowRunDate.id},
                showMask:false,
                success: function(r){
                    var j = Wb.decode(r.responseText);
                    if(j.success){
                        layer.msg(j.msg);
                    }
                }
            });
        }else{
            that.changeStatic(store_grid_list,that.nowRunNum,{'is_lock':this.nowRunDate.isLock});
        }

    }
};
