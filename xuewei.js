var KWZ = {
    version : '1',
    tmp_org_id : '',
    _msg : {
        "statusCode_503" : "服务器当前负载过大或者正在维护!"
    }, // alert message
    statusCode : {
        ok : 200,
        error : 300,
        timeout : 301
    },
    keys : {
        statusCode : "statusCode",
        message : "msg"
    },
    _set : {
        loginUrl : "", // session timeout
        loginTitle : "", // if loginTitle open a login dialog
        debug : false
    },
    tmpdata : {},
    currmenukey : "",
    ywlx : "",
    ywms : "",
    pro_id : "",
    _CF: false,
    browser : {
        versions : function() {
            var u = navigator.userAgent, app = navigator.appVersion;
            return { // 移动终端浏览器版本信息
                trident : u.indexOf('Trident') > -1, // IE内核
                presto : u.indexOf('Presto') > -1, // opera内核
                webKit : u.indexOf('AppleWebKit') > -1, // 苹果、谷歌内核
                gecko : u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, // 火狐内核
                mobile : !!u.match(/AppleWebKit.*Mobile.*/), // 是否为移动终端
                ios : !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), // ios终端
                android : u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, // android终端或uc浏览器
                iPhone : u.indexOf('iPhone') > -1, // 是否为iPhone或者QQHD浏览器
                iPad : u.indexOf('iPad') > -1, // 是否iPad
                webApp : u.indexOf('Safari') == -1
            // 是否web应该程序，没有头部与底部
            };
        }(),
        language : (navigator.browserLanguage || navigator.language).toLowerCase()
    },
    goIndex : function() {
        Main.goIndex();
    },
    msg : function(key, args) {
        var _format = function(str, args) {
            args = args || [];
            var result = str || "";
            for (var i = 0; i < args.length; i++) {
                result = result.replace(new RegExp("\\{" + i + "\\}", "g"), args[i]);
            }
            return result;
        }
        return _format(this._msg[key], args);
    },
    debug : function(msg) {
        if (this._set.debug) {
            if (typeof (console) != "undefined")
                console.log(msg);
            else
                alert(msg);
        }
    },
    loadLogin : function() {
        // 登录处理
        // alert("会话过期,请重新登陆");
        window.location.href = "visit.jsp";
    },

    /*
     * json to string
     */
    obj2str : function(o) {
        var r = [];
        if (typeof o == "string")
            return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
        if (typeof o == "object") {
            if (!o.sort) {
                for ( var i in o)
                    r.push("\"" + i + "\":" + KWZ.obj2str(o[i]));
                if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
                    r.push("toString:" + o.toString.toString());
                }
                r = "{" + r.join() + "}"
            } else {
                for (var i = 0; i < o.length; i++) {
                    r.push(KWZ.obj2str(o[i]));
                }
                r = "[" + r.join() + "]"
            }
            return r;
        }
        return o.toString();
    },
    jsonEval : function(data) {
        try {
            if ($.type(data) == 'string')
                return eval('(' + data + ')');
            else
                return data;
        } catch (e) {
            return {};
        }
    },
    formSerialize : function($form) {
        var paramsArray = $form.serializeArray();
        var params = new Object();
        jQuery.each(paramsArray, function(i) {
            if (params[this.name]) {
                params[this.name] += "," + this.value;
            } else {
                params[this.name] = this.value;
            }
        });
        return params;
    },
    jsonSerialize : function(json) {
        var str = "";
        if (json) {
            for ( var key in json) {
                str = str + "&" + key + "=" + json[key];
            }
        }
        return str;
    },
    kwbm : function(str) {
        if (KWZ && KWZ.jc_isencode && KWZ.jc_isencode == "Y") {
            str = str.replace(/([^\u0000-\u007F^\u0080-\u00FF]|\u00b7|\u44e3|\u2022)/gm, function() {
                return "&#" + arguments[0].charCodeAt(0) + ";";
            });
        }
        return str;
    },
    kwfilter : function(str) {
        if (str) {
            str = str.replace(/\+/g, "_abc123");
            str = str.replace(/\-/g, "_def456");
            str = str.replace(/\=/g, "_ghi789");
            str = str.replace(/\//g, "_jkl098");
            str = str.replace(/\*/g, "_mno765");
        }
        return str;
    },
    kwfilters : function(p) {
        if (p) {
        	if(p instanceof Array){
        		var length = p.length;
        		for(var i =0;i<length;i++){
        			p[i].value = KWZ.kwfilter(p[i].value);
        		}        		
        	}else if(typeof(p) == "object"){
        		for ( var k in p) {
                    p[k] = KWZ.kwfilter(p[k]);
                }
        	}
        }
        return p;
    },
    kwbms : function(p) {
        if (p) {
        	if(p instanceof Array){
        		var length = p.length;
        		for(var i =0;i<length;i++){
        			p[i].value = KWZ.kwbm(p[i].value);
        		}
        	}else if(typeof(p) == "object"){
        		for ( var k in p) {
                    p[k] = KWZ.kwbm(p[k]);
                }
        	}
            
        }
        return p;
    },
    handleData : function(data) {
        if (data) {
            if (KWZ.jc_isencode && KWZ.jc_isencode == "Y") {
                data = KWZ.kwbms(data);
                if (KWZ.jc_isencrypt && KWZ.jc_isencrypt == "Y") {
                    KWZ.kwfilters(kwencrypts(data));
                }
            }
        }
        return data;
    },
    deepClone : function(obj){
        var objClone = Array.isArray(obj)?[]:{};
        if(obj && typeof obj==="object"){
            for(key in obj){
                if(obj.hasOwnProperty(key)){
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if(obj[key]&&typeof obj[key] ==="object"){
                        objClone[key] = KWZ.deepClone(obj[key]);
                    }else{
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                }
            }
        }
        return objClone;

    },
    ajaxError : function(xhr, ajaxOptions, thrownError) {
        var str = "Http status: " + xhr.status + " " + xhr.statusText + "\najaxOptions: " + ajaxOptions + "\nthrownError:" + thrownError + "\n";
        var reg = /style="[^"]*"/g;
        var rr = xhr.responseText.replace(reg, "");
        str += rr;
        KWZ.alert(str);
        // KWZ.alert(xhr.responseText);
    },
    ajaxDone : function(json) {
        if (json[KWZ.keys.statusCode] == KWZ.statusCode.error) {
            if (json[KWZ.keys.message])
                KWZ.alert(json[KWZ.keys.message]);
        } else if (json[KWZ.keys.statusCode] == KWZ.statusCode.timeout) {
            KWZ.alert("会话超时，请重新登录!");
            KWZ.loadLogin();
        } else if (json[KWZ.keys.statusCode] == KWZ.statusCode.ok) {
            if (json[KWZ.keys.message])
                KWZ.alert(json[KWZ.keys.message]);

            if ("forward" == json.callbackType) {
                var forwardInfo = json.forwardInfo;

                $.ajaxUrl(forwardInfo);
            }
        }
        ;
    },
    template : function(tpl, data) {
        var tplpage = "tpl_pagehelper";
        var tplpageSimple = "tpl_simple_pagehelper";
        var tplPageNoTotal = "tpl_noTotal_pageHelper";
        var tpldmmx = "tpl_dmmx";
        var tpldmmc = "tpl_dmmc";
        if ((tplpage == tpl.substring(0, tplpage.length) || tplpageSimple == tpl.substring(0, tplpageSimple.length)
            || tplPageNoTotal == tpl.substring(0, tplPageNoTotal.length)) && data && data.params) {
            data.params["jc_pagesize"] = KWZ.jc_pagesize;
            data.params["jc_pageoption"] = KWZ.jc_pageoption.split(",");
        }
        var v_tpl = tpl;
        if (tplpage == tpl.substring(0, tplpage.length)) {
            v_tpl = tplpage;
        } else if (tpldmmx == tpl.substring(0, tpldmmx.length)) {
            v_tpl = tpldmmx;
        }else if (tplpageSimple == tpl.substring(0, tplpageSimple.length)) {
            v_tpl = tplpageSimple;
        }else if (tpldmmc == tpl.substring(0, tpldmmc.length)) {
            v_tpl = tpldmmc;
        } else if (tplPageNoTotal == tpl.substring(0, tplPageNoTotal.length)) {
            v_tpl = tplPageNoTotal;
        }
        $("[tpl=" + tpl + "]").html(template(v_tpl, data));
        KWZ.initUI();
    },
    kwExport : function(url, form, params2) {
    	//导出数据如果有比较大的情况，引入窗体遮罩，防止重复点击，时间参数自行灵活判断设置
        fn_pagedisabled();
        if (form && form.substr(0, 1) != "#") {
            form = "#" + form;
        }
        var $form = $(form);
        if ($form.length > 0) {
            var params = KWZ.formSerialize($form);
            if (params) {
                params = KWZ.handleData(params);
            }
        } else if (params2) {
        	var isjm=params2.ISJM;
        	if(isjm=='N'){//不加密
        		params = params2;
        	}else{
        		params = KWZ.handleData(params2);
        	}
        }
        var $iframe = $("#callbackframe");
        if ($iframe.size() == 0) {
            $iframe = $("<iframe id='callbackframe' name='callbackframe' src='about:blank' style='display:none'></iframe>").appendTo("body");
        }

        var _form = $('<form></form>');
        _form.attr('action', url);
        _form.attr('method', 'post');
        _form.attr('target', 'callbackframe');
        if (params) {
            for ( var p in params) {
                var _input = $('<input type="text" name="' + p + '"/>');
                _input.attr('value', params[p]);
                _form.append(_input);
            }
        }
        var _input = $('<input type="text" name="token"/>');
        _input.attr('value', KWZ.token);
        _form.append(_input);
        $iframe.html(_form);
        _form.submit();
        return false;
    },
    dialog_clear : function() {
        $("div.modal").each(function() {
            if ($(this).is(":hidden")) {
                $(this).remove();
            }
        });
    },
    dialog_scrollInside : function (dialogId) {
        //内部滚动: 主动调整窗口位置，主要用于内容较多时限制对话框仅在 .modal-body 内部滚动
        let $modal = $("#" + dialogId);
        if ($modal.length > 0 && $modal.is("div.modal")) {
            //由于低版本的zui.modal不支持内部滚动参数，下面自定义计算来调整位置
            // $modal.modal({scrollInside: true});
            $modal.modal("ajustPosition", "fit");
            let $dialog = $modal.find('.modal-dialog');
            let winHeight = $(window).height();
            var $body = $dialog.find('.modal-body');
            if ($body.length) {
                let headerHeight = 0;
                let footerHeight = 0;
                let $header = $dialog.find('.modal-header');
                let $footer = $dialog.find('.modal-footer');
                if ($header.length) {
                    headerHeight = $header.outerHeight();
                }
                if ($footer.length) {
                    footerHeight = $footer.outerHeight();
                }
                let bodyCss = {};
                bodyCss.maxHeight = winHeight - headerHeight - footerHeight;
                bodyCss.overflow = $body[0].scrollHeight > bodyCss.maxHeight ? 'auto' : 'visible';
                $body.css(bodyCss);
            }
        }
    },
    dialog : function(modal_ctx, callback, op) {
        KWZ.dialog_clear();
        var tmpl = modal_ctx;
        if (callback) {
        	var option = {}
        	if(op && op.lock) {
        		option.backdrop = "static";
        		option.keyboard = false;
        	}
            // $(tmpl).modal().off('shown.zui.modal');
        	var $tmp = $(tmpl).off('shown.zui.modal');
        	$tmp.modal(option).on('shown.zui.modal', callback);
            if(op && typeof op.onDialogClose == 'function') {
            	$tmp.on("hide.zui.modal", op.onDialogClose)
            }
        } else {
            $(tmpl).modal();
        }
    },
    tmpFunc : null,
    cb_dialog : function() {
        if (KWZ.tmpFunc) {
            KWZ.tmpFunc();
        }
    },
    alert : function(msg, callback) {
        KWZ.dialog_clear();
        var oncli = "";
        if (callback) {
            KWZ.tmpFunc = callback;
            oncli = ' onclick="KWZ.cb_dialog()"';
        }
        var tmpl = '<div class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title"><i class="modal-icon icon-info-sign"></i> <span class="modal-title-name">消息提示</span><a href="javascript:void(0);" ><span style="float:right" title="返回" data-dismiss="modal" id="jc_xx_njjhssz_update_close">x</span></a></h4></div><div class="modal-body"><p>' + msg + '</p></div><div class="modal-footer"><button type="button" class="btn btn-primary" ' + oncli + ' data-dismiss="modal" id="kwz_alert_determine_btn">确定</button></div></div></div></div>';
        $(tmpl).modal();
    },
    alert_settime : function(msg, callback,time) {//读秒消息提示框
        KWZ.dialog_clear();
        var oncli = "";
        if (callback) {
            KWZ.tmpFunc = callback;
            oncli = ' onclick="KWZ.cb_dialog()"';
        }
        var tmpl = '<div class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title"><i class="modal-icon icon-info-sign"></i> <span class="modal-title-name">消息提示</span></h4></div><div class="modal-body"><p>' + msg + '</p></div><div class="modal-footer" id=\"kwz_alert_div_btns\"><span  style=\"color:red;font-size: 16px;font-weigth:bold;\" id="kwz_alert_span_miao">'+time+'s</span></div></div></div></div>';
        $(tmpl).modal();
        var miao = Number(time);
        var ydxz_ds = setInterval(function () {
            miao--;
            if (miao == 0) {
                $("#kwz_alert_span_miao").hide();
                $("#kwz_alert_div_btns").append("<button type=\"button\" class=\"btn btn-primary\" " + oncli + " data-dismiss=\"modal\" >确定</button>");
                clearInterval(ydxz_ds);
            } else {
                $("#kwz_alert_span_miao").html(miao + "s");
            }
        }, 1000);
    },
    confirm : function(msg, callback) {
        KWZ.dialog_clear();
        var oncli = "";
        if (callback) {
            KWZ.tmpFunc = callback;
            oncli = ' onclick="KWZ.cb_dialog()"';
        }
        var tmpl = '<div class="modal hide fade" tabindex="-1" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title"><i class="modal-icon icon-question-sign"></i> <span class="modal-title-name">确认提示</span></h4></div><div class="modal-body"><p>' + msg + '</p></div><div class="modal-footer"><button type="button" class="btn btn-primary" ' + oncli
                + ' data-dismiss="modal">确定</button><button type="button" class="btn btn-default" data-dismiss="modal">取消</button></div></div></div></div>';
        $(tmpl).modal();
    },
    piaofuxiaoxi : function(msg, map) {
        if (!map) {
            map = {};
        }
        var msg = new $.zui.Messager(msg, {
            placement : map.placement || 'top', //'top'(默认)|'bottom'|'top-left'|'top-right'|'bottom-left'|'bottom-right'|'center'
            type : map.type || 'success', //'default'(默认)|'primary'|'success'|'info'|'warning'|'danger'|'important'|'special'
            time : map.time || 4000, // 表示时间延迟，单位毫秒，默认为4000
            message : map.message || null, //使用选项来设置要显示的消息
            parent : map.parent || 'body', //决定消息内容DOM的父节点
            icon : map.icon || 'ok-sign', //可以额外指定一个图标在消息文本之前显示，图标定义参见“控件>图标”章节
            close : map.close || true, //true/false 如果为true，则在消息右侧显示一个关闭按钮，用户可以自行隐藏消息
            fade : map.fade || true, //true(默认)|false 如果为true，则在显示和隐藏消息时使用渐隐渐显的动画效果。
            scale : map.scale || true, //true(默认)|false 如果为true，则在显示和隐藏消息时使用缩放的动画效果。
            actions : map.actions, //使用包含操作定义对象的数组来自定义操作按钮
            onAction : map.onAction || false, //function(actionName, action, messager)，默认不设置
            show : map.show || true //true | false(默认) 是否在初始化之后立即显示消息。
        });
    },
    /**
     * 全选或全不选 params:
     * checkBox=触发方法的复选框对象;name=所有需要被操作的复选框的NAME属性;conid=name的父级容器id
     * example:KWZ.cbAll(this,'menu_ids','conid')
     */
    cbAll : function(checkBox, name, conid) {
        var select = {};
        if (conid) {
            select = $("#" + conid).find("input[name=" + name + "]");
        } else if (!conid) {
            select = document.getElementsByName(name);
        }
        if (checkBox.checked == true) {
            for (var i = 0; i < select.length; i++) {
                if (!$(select[i]).prop("disabled")) {
                    select[i].checked = true;
                }
            }
        } else {
            for (var i = 0; i < select.length; i++) {
                if (!$(select[i]).prop("disabled")) {
                    select[i].checked = false;
                }
            }
        }
    },
    /**
     * 功能：列表复选框事件
     * @param containerId  容器ID（PC端和移动端的ID不一样）
     * @param cbName 列表复选框NAME
     * @param cbPparentId 全选/反选ID
     */
    checkbox : function(containerId,cbName,cbPparentId){
        var s = $("#"+containerId+" input[name='"+cbName+"']").length;
        var cs = $("#"+containerId+" input[name='"+cbName+"']:checked").length;
        if(cs == 0 || cs < s){
            $("#"+cbPparentId).prop("checked", false);
        }else if(s == cs){
            $("#"+cbPparentId).prop("checked", true);
        }
    },
    /**
     * 反选 params: name=所有需要被操作的复选框的NAME属性 example:KWZ.cbInvert('menu_ids')
     */
    cbInvert : function(name) {
        var select = document.getElementsByName(name);
        for (var i = 0; i < select.length; i++) {
            if (select[i].checked == true) {
                if (!$(select[i]).prop("disabled")) {
                    select[i].checked = false;
                }
            } else {
                if (!$(select[i]).prop("disabled")) {
                    select[i].checked = true;
                }
            }
        }
    },
    /**
     * 返回选择的复选框的ids的字符串集合,以逗号分隔 params:name=所有需要被验证的子复选框NAME
     * example:KWZ.cbChecked('menu_ids')
     */
    cbChecked : function(name, conid) {
        var select = {};
        if (conid) {
            select = $("#" + conid).find("input[name=" + name + "]");
        } else if (!conid) {
            select = document.getElementsByName(name);
        }
        var ids = "";
        for (var i = 0; i < select.length; i++) {
            if (select[i].checked == true) {
                ids += (ids ? "," + select[i].value : select[i].value);
            }
        }
        if (ids) {
            return ids;
        } else {
            KWZ.alert("请先勾选要操作的对象!");
        }
    },
     /**
     * 返回选择的复选框的ids的字符串集合,以逗号分隔 params:name=所有需要被验证的子复选框NAME 不提示错误信息只返回结果
     * example:KWZ.cbChecked('menu_ids')
     */
    cbCheckedNoMsg : function(name, conid,pjfh,nametext) {
        var select = {};
        if (conid) {
            select = $("#" + conid).find("input[name=" + name + "]:checked");
        } else if (!conid) {
            select =$("input[name=" + name + "]:checked");
        }
        var ids = "";
        select.each(function(){ 
        	var v=$(this).val();
        	if(nametext){
        		v=$(this).attr(nametext);
        	}
        	var f=pjfh?pjfh:",";
            ids += (ids ? f +  v: v);
        }); 
        return ids;
    },
    conditionToggle : function(ele, obj) {
        var $obj = $(obj).children()[0];
        var $i = $($obj);
        if ($i && $i.hasClass("icon-caret-down")) {
            $i.removeClass("icon-caret-down");
            $i.addClass("icon-caret-up");
        } else {
            if ($i && $i.hasClass("icon-caret-up")) {
                $i.removeClass("icon-caret-up");
                $i.addClass("icon-caret-down");
            }
        }
        $(obj).parents('form').find(ele).toggle();
    },
    forbidBackSpace : function(e) {
        var ev = e || window.event;
        var obj = ev.target || ev.srcElement;
        var t = obj.type || obj.getAttribute("type");
        var vReadOnly = obj.readOnly;
        var vDisabled = obj.disabled;
        vReadOnly = (vReadOnly == undefined) ? false : vReadOnly;
        vDisabled = (vDisabled == undefined) ? true : vDisabled;
        var flag1 = ev.keyCode == 8 && (t == "password" || t == "text" || t == "textarea") && (vReadOnly == true || vDisabled == true);
        var flag2 = ev.keyCode == 8 && t != "password" && t != "text" && t != "textarea";
        if (flag2 || flag1)
            return false;

        if (ev.keyCode == 27) {
            ev.keyCode = 0;
            ev.returnValue = false;
            return;
        }
        ;
        if (ev.keyCode == 13 && t != "textarea") {
            ev.keyCode = 0;
            ev.returnValue = false;
            return;
        }
        ;
    },
    initUI : function() {
    	if(typeof(Main)!="undefined"){
    		Main.showWritePath();
    	}
    	if(typeof(Login)!="undefined"){
    		Login.showWritePath();
    	}
        kwValidate();
        kwDatetime();
        kwXq();
        $("[role='tab']").click(function(e) {
            e.preventDefault();
            $(this).tab('show');
        });
        kw_pagelist();
    },
    init : function(options) {
        var op = $.extend({
            loginUrl : "login.html",
            loginTitle : null,
            callback : null,
            debug : false,
            statusCode : {},
            keys : {}
        }, options);
        this._set.loginUrl = op.loginUrl;
        this._set.loginTitle = op.loginTitle;
        this._set.debug = op.debug;
        $.extend(KWZ.statusCode, op.statusCode);
        $.extend(KWZ.keys, op.keys);
    },
    /**
     * 功能：省市县函数
     * @param callback 回调函数
     * @param ssxdj 省市县登记
     * @param sheng 默认值：省
     * @param shi 默认值：市
     * @param xian 默认值：县
     * @param init 初始化函数
     */
    ssx : function(callback, ssxdj,sheng,shi,xian,init) {
        $.ajaxUrl({
            into : 'dialog',
            url : 'jc_dmxzqh/open/toList',
            tmpdata : {
                'ssxdj' : ssxdj,
                'sheng' : sheng,
                'shi' : shi,
                'xian' : xian
            }
        });
        KWZ.cb_xzqhDialog = callback;
        KWZ.cb_xzqhInitDialog = init;
    },
    ssxjd : function(callback, ssxdj,sheng,shi,xian,jd,init) {
        $.ajaxUrl({
            into : 'dialog',
            url : 'jc_dmxzqh/open/toListGz',
            tmpdata : {
                'ssxdj' : ssxdj,
                'sheng' : sheng,
                'shi' : shi,
                'xian' : xian,
                'jd': jd
            }
        });
        KWZ.cb_xzqhDialog = callback;
        KWZ.cb_xzqhInitDialog = init;
    },
    cb_xzqhDialog : null,
    cb_gz_sqxx: null,
    cb_xzqhInitDialog : null,
    
    /**
     * callback 回调函数
     * dm_code 代码 必传
     * def 默认选中值 可为空
     * isSearch 0 为不搜索 可为空默认为搜索
     * isonlydata 选传 只需要加载指定的数据 格式（1,2,3,4）用于调用fn_resetDmVal函数
     * 
     */
    dm : function(callback, dm_code, def, isSearch,isonlydata) {
        $.ajaxUrl({
            into : 'dialog',
            url : 'jc_dmtab/open/toSelect',
            tmpdata : {
                'dm_code' : dm_code,
                'def' : def,
                'isSearch' : isSearch,
                'isonlydata':isonlydata
            }
        });
        KWZ.cb_dmDialog = callback;
    },
    cb_dmDialog : null,
    initSelect : function(obj, datas) {
        if (obj == null || datas == null)
            return;
        for ( var o in obj) {
            var s = $("select[name='" + o + "']");
            var d = datas[obj[o]];
            for (var i = 0; i < d.length; i++) {
                var op = "<option value='" + d[i].DMMX_CODE + "'>" + d[i].DMMX_MC + "</option>";
                s.append(op);
            }
        }
    },
    checkForm : function(data) {
    	if(KWZ._CF) {
    		if(data instanceof Array) {
        		for(var i = 0, length = data.length; i < length; i++) {
        			if(data[i].value && /<[^>]+>/.test(data[i].value)) {
        				return false;
        			}
        		}
        	} else if(typeof data == 'object') {
        		for(var i in data) {
        			if(data[i] && /<[^>]+>/.test(data[i])) {
        				return false;
        			}
        		}
        	}    		
    	}
    	return true;
    },
    /**
     * 获取地址栏参数
     */
    getQueryString : function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
};

(function() {
    $.extend({
        /**
         * @param {Object}
         *            op: {type:GET/POST, url:ajax请求地址, data:ajax请求参数列表,
         *            callback:回调函数 }
         */
        ajaxUrl : function(op) {
            var jsondata = {};
            var async = false;
            if (op.into)
                async = false;
            KWZ.tmpdata = op.tmpdata || {};
            if (op.data) {
            	
            	if(!KWZ.checkForm(op.data)){
            		KWZ.alert("输入参数不合法，请检查");
            		return false;
            	}
                //交换栈中的地址，防止加密传入参数
                var temp = KWZ.deepClone(op.data);
                op.data = KWZ.handleData(temp);
            } else {
                op.data = {};
            }
            if (KWZ.token) {
            	if(op.data instanceof Array){
            		op.data.push({"name":"token","value":KWZ.token});
            	}else{
            		op.data.token = KWZ.token;
            	}
                
            }
            // 版本控制
            var af = op.url;
            // 当请求路径是html时，添加版本号更新处理
            if (op.url.indexOf(".html") != -1) {
                if (op.url.indexOf("?") == -1) {
                    af = op.url + "?ver=" + KWZ.version;
                } else {
                    af = op.url + "&ver=" + KWZ.version;
                }
            }
            $.ajax({
                type : op.type || 'POST',
                url : af,
                data : op.data,
                async : op.async || async,
                cache : false,
                into : op.into || "",
                success : function(response) {
                    var json = KWZ.jsonEval(response);

                    if (json[KWZ.keys.statusCode] == KWZ.statusCode.error) {
                        if (json[KWZ.keys.message])
                            KWZ.alert(json[KWZ.keys.message]);
                    } else if (json[KWZ.keys.statusCode] == KWZ.statusCode.timeout) {
                        KWZ.alert("会话超时，请重新登录!");
                        KWZ.loadLogin();
                    } else {
                        if (json[KWZ.keys.statusCode] == KWZ.statusCode.ok) {
                            if (json[KWZ.keys.message])
                                KWZ.alert(json[KWZ.keys.message]);
                        }
                        if (op.into) {
                            if ("body" == op.into) {
                                $("body").append(response);
                                KWZ.initUI();
                            } else {
                                if ("dialog" == op.into) {
                                	//console.log(op)
                                    KWZ.dialog(response, function() {
                                        KWZ.initUI();
                                        if ($.isFunction(op.callback))
                                            op.callback();
                                    }, op);
                                } else {
                                    $("#" + op.into).html(response);
                                    KWZ.initUI();
                                }
                            }
                        } else {
                            jsondata = json;
                        }
                        if ($.isFunction(op.callback) && "dialog" != op.into)
                            op.callback(response, op.tmpdata);
                    }
                },
                error : $.isFunction(op.error) ? op.error : KWZ.ajaxError,
                statusCode : {
                    503 : function(xhr, ajaxOptions, thrownError) {
                        KWZ.alert(KWZ.msg("statusCode_503") || thrownError);
                    }
                }
            });
            return jsondata;
        },
        loadUrl : function(url, data, callback) {
            $(this).ajaxUrl({
                url : url,
                data : data,
                callback : callback
            });
        },
        /**
         * 输出firebug日志
         * 
         * @param {Object}
         *            msg
         */
        log : function(msg) {
            return this.each(function() {
                if (console)
                    console.log("%s: %o", msg, this);
            });
        }
    });

    /**
     * 扩展String方法
     */
    $.extend(String.prototype, {
        isPositiveInteger : function() {
            return (new RegExp(/^[1-9]\d*$/).test(this));
        },
        isInteger : function() {
            return (new RegExp(/^\d+$/).test(this));
        },
        isNumber : function(value, element) {
            return (new RegExp(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/).test(this));
        },
        trim : function() {
            return this.replace(/(^\s*)|(\s*$)|\r|\n/g, "");
        },
        startsWith : function(pattern) {
            return this.indexOf(pattern) === 0;
        },
        endsWith : function(pattern) {
            var d = this.length - pattern.length;
            return d >= 0 && this.lastIndexOf(pattern) === d;
        },
        replaceSuffix : function(index) {
            return this.replace(/\[[0-9]+\]/, '[' + index + ']').replace('#index#', index);
        },
        trans : function() {
            return this.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
        },
        encodeTXT : function() {
            return (this).replaceAll('&', '&amp;').replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll(" ", "&nbsp;");
        },
        replaceAll : function(os, ns) {
            return this.replace(new RegExp(os, "gm"), ns);
        },
        replaceTm : function($data) {
            if (!$data)
                return this;
            return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_]*})", "g"), function($1) {
                return $data[$1.replace(/[{}]+/g, "")];
            });
        },
        replaceTmById : function(_box) {
            var $parent = _box || $(document);
            return this.replace(RegExp("({[A-Za-z_]+[A-Za-z0-9_]*})", "g"), function($1) {
                var $input = $parent.find("#" + $1.replace(/[{}]+/g, ""));
                return $input.val() ? $input.val() : $1;
            });
        },
        isFinishedTm : function() {
            return !(new RegExp("{[A-Za-z_]+[A-Za-z0-9_]*}").test(this));
        },
        skipChar : function(ch) {
            if (!this || this.length === 0) {
                return '';
            }
            if (this.charAt(0) === ch) {
                return this.substring(1).skipChar(ch);
            }
            return this;
        },
        isValidPwd : function() {
            return (new RegExp(/^([_]|[a-zA-Z0-9]){6,32}$/).test(this));
        },
        isValidMail : function() {
            return (new RegExp(/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/).test(this.trim()));
        },
        isSpaces : function() {
            for (var i = 0; i < this.length; i += 1) {
                var ch = this.charAt(i);
                if (ch != ' ' && ch != "\n" && ch != "\t" && ch != "\r") {
                    return false;
                }
            }
            return true;
        },
        isPhone : function() {
            return (new RegExp(/(^([0-9]{3,4}[-])?\d{3,8}(-\d{1,6})?$)|(^\([0-9]{3,4}\)\d{3,8}(\(\d{1,6}\))?$)|(^\d{3,8}$)/).test(this));
        },
        isUrl : function() {
            return (new RegExp(/^[a-zA-z]+:\/\/([a-zA-Z0-9\-\.]+)([-\w .\/?%&=:]*)$/).test(this));
        },
        isExternalUrl : function() {
            return this.isUrl() && this.indexOf("://" + document.domain) == -1;
        },
        isContains : function(subStr) {
            return this.indexOf(subStr) != -1;
        }
    });
})(jQuery);
/**
 * 普通ajax表单提交
 * 
 * @param {Object}
 *            form
 * @param {Object}
 *            callback
 * @param {String}
 *            confirmMsg 提示确认信息
 */
function validateCallback(form, cus_validate, callback, confirmMsg) {
    formtrim(form);

    var $form = $(form);

    if (!$form.valid()) {
        return false;
    }

    if (cus_validate && !cus_validate()) {
        return false;
    }

    var _submitFn = function() {
        $form.find(':focus').blur();
        var params = KWZ.formSerialize($form);
        if (params) {
        	if(!KWZ.checkForm(params)){
        		KWZ.alert("输入参数不合法，请检查");
        		return false;
        	}
            params = KWZ.handleData(params);
            if (KWZ.token) {
                params.token = KWZ.token;
            }
        }

        $.ajax({
            type : form.method || 'POST',
            url : $form.attr("action"),
            data : params,
            dataType : "json",
            cache : false,
            success : callback || KWZ.ajaxDone,
            error : KWZ.ajaxError
        });
    }

    if (confirmMsg) {
        KWZ.confirm(confirmMsg, _submitFn);
    } else {
        _submitFn();
    }

    return false;
}
/**
 * 普通ajax表单提交 只做验证不提交
 *
 * @param {Object}
 *            form
 * @param {Object}
 *            callback
 * @param {String}
 *            confirmMsg 提示确认信息
 */
function validateCallback_notsubmit(form, cus_validate, callback, confirmMsg) {
    formtrim(form);

    var $form = $(form);

    if (!$form.valid()) {
        return false;
    }

    if (cus_validate && !cus_validate()) {
        return false;
    }
    var _submitFn = function() {
        $form.find(':focus').blur();
        var params = KWZ.formSerialize($form);
        if (params) {
            if(!KWZ.checkForm(params)){
                KWZ.alert("输入参数不合法，请检查");
                return false;
            }
            params = KWZ.handleData(params);
            if (KWZ.token) {
                params.token = KWZ.token;
            }
        }
    }
    if (confirmMsg) {
        KWZ.confirm(confirmMsg, _submitFn);
        return false;
    }else{
        return true;
    }
}
/**
 * 使用协议
 * @param type 类型 U:用户类型，Y:隐私类型
 */
function fn_syxy_click(type) {
    var xyurl = "";
    if (type == "U") {
        xyurl = "xyuser.html";
    } else if (type == "Y") {
        xyurl = "xyys.html";
    }
    $.ajaxUrl({
        into: "dialog",
        url: xyurl
    })
}

// 扩展jQuery，加入从光标位置插入内容的函数
$.fn.extend({
    insertContent: function(myValue, t) {
        var $t = $(this)[0];
        if (document.selection) { // ie
            this.focus();
            var sel = document.selection.createRange();
            sel.text = myValue;
            this.focus();
            sel.moveStart('character', -l);
            var wee = sel.text.length;
            if (arguments.length == 2) {
                var l = $t.value.length;
                sel.moveEnd("character", wee + t);
                t <= 0 ? sel.moveStart("character", wee - 2 * t - myValue.length) : sel.moveStart("character", wee - t - myValue.length);
                sel.select();
            }
        } else if ($t.selectionStart || $t.selectionStart == '0') {
            var startPos = $t.selectionStart;
            var endPos = $t.selectionEnd;
            var scrollTop = $t.scrollTop;
            $t.value = $t.value.substring(0, startPos) + myValue + $t.value.substring(endPos, $t.value.length);
            this.focus();
            $t.selectionStart = startPos + myValue.length;
            $t.selectionEnd = startPos + myValue.length;
            $t.scrollTop = scrollTop;
            if (arguments.length == 2) {
                $t.setSelectionRange(startPos - t, $t.selectionEnd + t);
                this.focus();
            }
        } else {
            this.value += myValue;
            this.focus();
        }
    }
})
