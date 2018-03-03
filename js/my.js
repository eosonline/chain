var ws;
var version={style:0,version:'2.2.0'};
var order_style=[{style:'danger',text:'新订单'},{style:'primary',text:'备货中'},{style:'warning',text:'已发货'},{style:'success',text:'已完成'},{style:'default',text:'已取消'}];
var net_win=false;
var last_30=false;
var last_orders;
var net_orders;
var COMM_ready=false;
var print_id=-1;
var print_name=-1;
var print_barcode=-1;
var print_mode=54;
var serial_port='COM1';
var pst=['现金','银行卡','微信','支付宝','其他','微信转账','支付宝转账'];
var snap={cur:0,tmps:[[],[],[]]};
var cur_pos="#barcode";
var pre_pos="";
var hold_on=false;//是否在微信支付宝支付状态中。
var abs=false;
var shop_id=1;
var shop_name='神仙的小店';
var scan_list=[];
var in_version=4;
var pay_style=0;
var oper_openid='';
var nickname='';
var headimgurl='images/yichi.png';
var goods_refund=1;
var goods_to_renew=[];
var edit_status=false;
var detail_first=true;
var detail_obj;
var detail_status=false;
var cats=[];
var shop_qr='';
var shop_detail={};
var P_ON=false;//是否随时打印
var P_status=false
var P_debug=false;//是否预览
var qr_base64='';
var goods_pvt=[]
var order_sw=false
var ws_status=false
var nwjs=false
/*
var LODOP;
*/
var zoom=0
var scale=false
var scale_sel=false
var scale_now={}
var scale_row=[]
var version
var remote_version
try{
    global.comm={
        _x:0,
        _y:0,
        _event:null,
        /*
         _event_change:null,
         */
        _event_scale:null,
        _event_eval:null,
        _event_ads:null,
        _event_cash:null,
        get_shop:function(){return shop_detail},
        pull:function(){return scan_list},
        send:function(data){if(this._event!=null){this._event(data)}},
        /*
         change_cus_back:function(data){if(this._event_change!=null){this._event_change(data)}},
         */
        dis_cus_scale:function(onoff,data){if(this._event_scale!=null){this._event_scale(onoff,data)}},
        eval:function(data){if(this._event_eval!=null){this._event_eval(data)}},
        ads:function(data){if(this._event_ads!=null){this._event_ads(data)}},
        cash:function(data){if(this._event_cash!=null){this._event_cash(data)}},
        sub:function(callback){this._event=callback},
        /*
         sub_change:function(callback){this._event_change=callback},
         */
        sub_scale:function(callback){this._event_scale=callback},
        sub_eval:function(callback){this._event_eval=callback},
        sub_close:function(callback){this._close=callback},
        sub_ads:function(callback){this._event_ads=callback},
        sub_cash:function(callback){this._event_cash=callback},
        _close:null
    }
    win.on('close',function(){
        app.quit()
    })
}catch(err){

}

/*$.fn.longPress = function(fn) {
    var timeout = undefined;
    var $this = this;
    for(var i = 0;i<$this.length;i++){
        $this[i].addEventListener('touchstart', function(event) {
            timeout = setTimeout(fn, 800);  //长按时间超过800ms，则执行传入的方法
        }, false);
        $this[i].addEventListener('touchend', function(event) {
            clearTimeout(timeout);  //长按时间少于800ms，不会执行传入的方法
        }, false);
    }
}*/
window.onbeforeunload=function(){
    ws.close()
}
$(document).ready(function(){
    try{
        chrome.serial.getDevices(function(ports){
            var _port=[]
            ports.reverse()
            ports.map(function(p){
                if(p.path.indexOf('蓝牙')==-1&&p.path.indexOf('Bluetooth')==-1){_port.push(p.path)}
            })
            if(_port.length>0){
                var _txt=''
                _port.map(function(_ps){
                    _txt+='<option value="'+_ps+'">'+_ps+'</option>'
                })
                $("#serial_port").html(_txt)
                var _serial=window.localStorage.getItem('serial_port')
                if(_serial==null){
                    _serial=_port[0]
                    window.localStorage.setItem('serial_port',_serial)
                    serial_port=_serial
                    $("#serial_port").val(serial_port)
                }
                else
                {
                    serial_port=_serial
                }
                $("#serial_port").val(serial_port)

            }
        })
    }catch(err){

    }
    try{
        version = get_local_version()
        if(window.navigator.onLine) {
            if(nwjs){
                $.when(get_remote_version()).done(function(data){
                    remote_version = data
                    fire_update()
                })
            }

        }
    }catch(err){

    }

    setInterval(function(){
        var _d=new Date()
        $("#date_show").html(_d.toLocaleDateString().replace(/\//g,'-'))
        $("#time_show").html(_d.toLocaleTimeString())
    },1000)
    if(!window.navigator.onLine){
        $(".net_status").attr('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAE8ElEQVR42u3baahVVRQH8F+WlmFZoVQEu4LKBqO0IspKo3pKma/ChMQmo6IgigYkKijIsILKiKYPUdSHBuqh0GSIlRRhls02KbrJoInmCRL7sO+Tx+2cOzzPPe96u3+4H87Z66y91v/ss/daa+9LF1108X/GNmV0EhmGKRiHA7Av9sQu2A5/4Qd8hTX4DJ8HVmyVBESOwnRchL0KULkcT+D5wIa2JCByAq7EWUUamIP5eCSwdkgJiOyMy7CgBKezsAGXBxaXSkBkDG6U3ngzeA/vSN/5d/gNGzECo6V54UAco/lP5zw8HlpJQEwT1nW4rQHxdbgfSwPvNmlXf39wMmbgigYfmxZ4uXACYprFl9UR+0IaGc8F/hmM03VsCJgjzQG18CrmNDJh1iUgsj0W4tIaYg/gjpDeeimITK7YdVgNsXMCTw6agJjW7E+wbY7IQtwS+LEsxzNsnIhHcWiOyOO4OPB3UwREpuKlnOY3cW4Ry1CBREzDiznN3+OwwNfVDcNylM2t4fyswKR2ch5Csnck7stoHoMNkYOqG/4zAiJX4e4MJWsxOaRwta0R6ZG/EkwMrOq/yBoBP2fcewjjtgbnIbAEe+P3jOY/6iqInB/ZVPldPdQODRaRUZG3Bviyf7VMrUlwDkYEHinImONwpJQoTZBWmIGryy/SivOOlAW+HVhdQL8jsAhXBL5smIACOh6P2bh+C1Wtxl14OiSSCkWhBMT0Rufi4aINrWAF5oUU6bUPAZHhUmJ0Z4scr8afOKMy2Q0tATElKosaFP9IMvpDKSj5FZ/iEOwqzdxH4kwp1a6H93F2SDlIuQTEZPATOLWG2EbMQ99gAqfIsTgfl9QRvRL3NpsKD5qAyBFYWUOkDzcHPhiM/pw+T5di/t1yRF5Db8iOY4ojIKaS17M5zUukCs2aohzP6L9WlAf7BNY3qm9Yo4KVzi+s4XxPYGornWdzlLcdbsoRWRdT9bl4AvBNxr1l2C3wSisdryJhY+BWKajKQuHxwmZEpg0ILW+LZXmdb8/YyPoBNu1RRqc97ZQjRHaMrIzsPtS2dLG1oZS9wX5EDpd+B0sV3pFSzh7xMVaFFC12BgEx6T9bKpUf2sSjK6W9h77BRHdDTkCllH6ttFRtKa6RwtzC9xlaQkCTyVEz6GlFrFHk7vBwPCjVA2rhG8mRL6Xvf5RUHZoqP87vxz24NqQkq30IqOwSvyWj7FzBC7g98HoDuk6S5owpOSJvSKOhfnGzATQbCuehN8f5xVJyclojzkNIm6knSqMiay9yEk4pyO7iEJkzIBzdFGvXCZrRO7NK7xlD7WstY2dXjNyvYL3jK3pnDLWPXXTRRRcdhVKzwX5EdpJih8lS9LcGLweWdjQBlSRpgXQGIQ+zAs90HAExnQNcLZ0FrIcFYcs3VduHgEpd4DUc38RjFwQe6xQC8g5cPYrPpfng6Iz20a3YEi8dkXer4vlNlUOPA2V6M2Rmt9q2orLBephQdT09bD4JmxBSEeX5KrmZnUJANfI2Vvuqrsd3KgFjcu7vW3X9facSML96Sy0yFjdU3X6xQX1tT0D1mt6LxTHtD4ipwvNtxnNPtdqwspbB0fipycf6Qgl/vyllBFRObUxp8rELy7CttDkgpEjwhAZEV2Fss0dd2p6ACgnLsYN0qOm3quYV0t9dJoYSZv8uuugC/AvqaULUWMciNAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wNS0xOVQwMTozMDoxNiswODowMFVNi2cAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDUtMTlUMDE6MzA6MTYrMDg6MDAkEDPbAAAAAElFTkSuQmCC')
    }
    window.addEventListener("offline", function() {
        $(".net_status").attr('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAE8ElEQVR42u3baahVVRQH8F+WlmFZoVQEu4LKBqO0IspKo3pKma/ChMQmo6IgigYkKijIsILKiKYPUdSHBuqh0GSIlRRhls02KbrJoInmCRL7sO+Tx+2cOzzPPe96u3+4H87Z66y91v/ss/daa+9LF1108X/GNmV0EhmGKRiHA7Av9sQu2A5/4Qd8hTX4DJ8HVmyVBESOwnRchL0KULkcT+D5wIa2JCByAq7EWUUamIP5eCSwdkgJiOyMy7CgBKezsAGXBxaXSkBkDG6U3ngzeA/vSN/5d/gNGzECo6V54UAco/lP5zw8HlpJQEwT1nW4rQHxdbgfSwPvNmlXf39wMmbgigYfmxZ4uXACYprFl9UR+0IaGc8F/hmM03VsCJgjzQG18CrmNDJh1iUgsj0W4tIaYg/gjpDeeimITK7YdVgNsXMCTw6agJjW7E+wbY7IQtwS+LEsxzNsnIhHcWiOyOO4OPB3UwREpuKlnOY3cW4Ry1CBREzDiznN3+OwwNfVDcNylM2t4fyswKR2ch5Csnck7stoHoMNkYOqG/4zAiJX4e4MJWsxOaRwta0R6ZG/EkwMrOq/yBoBP2fcewjjtgbnIbAEe+P3jOY/6iqInB/ZVPldPdQODRaRUZG3Bviyf7VMrUlwDkYEHinImONwpJQoTZBWmIGryy/SivOOlAW+HVhdQL8jsAhXBL5smIACOh6P2bh+C1Wtxl14OiSSCkWhBMT0Rufi4aINrWAF5oUU6bUPAZHhUmJ0Z4scr8afOKMy2Q0tATElKosaFP9IMvpDKSj5FZ/iEOwqzdxH4kwp1a6H93F2SDlIuQTEZPATOLWG2EbMQ99gAqfIsTgfl9QRvRL3NpsKD5qAyBFYWUOkDzcHPhiM/pw+T5di/t1yRF5Db8iOY4ojIKaS17M5zUukCs2aohzP6L9WlAf7BNY3qm9Yo4KVzi+s4XxPYGornWdzlLcdbsoRWRdT9bl4AvBNxr1l2C3wSisdryJhY+BWKajKQuHxwmZEpg0ILW+LZXmdb8/YyPoBNu1RRqc97ZQjRHaMrIzsPtS2dLG1oZS9wX5EDpd+B0sV3pFSzh7xMVaFFC12BgEx6T9bKpUf2sSjK6W9h77BRHdDTkCllH6ttFRtKa6RwtzC9xlaQkCTyVEz6GlFrFHk7vBwPCjVA2rhG8mRL6Xvf5RUHZoqP87vxz24NqQkq30IqOwSvyWj7FzBC7g98HoDuk6S5owpOSJvSKOhfnGzATQbCuehN8f5xVJyclojzkNIm6knSqMiay9yEk4pyO7iEJkzIBzdFGvXCZrRO7NK7xlD7WstY2dXjNyvYL3jK3pnDLWPXXTRRRcdhVKzwX5EdpJih8lS9LcGLweWdjQBlSRpgXQGIQ+zAs90HAExnQNcLZ0FrIcFYcs3VduHgEpd4DUc38RjFwQe6xQC8g5cPYrPpfng6Iz20a3YEi8dkXer4vlNlUOPA2V6M2Rmt9q2orLBephQdT09bD4JmxBSEeX5KrmZnUJANfI2Vvuqrsd3KgFjcu7vW3X9facSML96Sy0yFjdU3X6xQX1tT0D1mt6LxTHtD4ipwvNtxnNPtdqwspbB0fipycf6Qgl/vyllBFRObUxp8rELy7CttDkgpEjwhAZEV2Fss0dd2p6ACgnLsYN0qOm3quYV0t9dJoYSZv8uuugC/AvqaULUWMciNAAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wNS0xOVQwMTozMDoxNiswODowMFVNi2cAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDUtMTlUMDE6MzA6MTYrMDg6MDAkEDPbAAAAAElFTkSuQmCC')
/*
        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","请注意，您的收银机网络断了，请检查")}
*/
        $(".point").hide()
        $("#sys_update").off('tap')
    })

    window.addEventListener("online", function() {
        $(".net_status").attr('src','data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAFd0lEQVR42u2be4hVRRzHP+tjsjA3RQsn0IRQxxR1U6SXbg8fpe2maJBsmUZFkShpSNQfRZqWYNkfvSAxlOhBrQpqromaFLGtbQ9r8omJTlhGaWY1tNQfc27cDufce871nHPX7X7/O2d+85vf73vP/OY385sLFVRQwf8ZVVkMIq3qBNQCg4CBwACgL3AR0AX4A/gJOAocBPYC+4zQzeckAdKq0cAU4B7g0gRU7gLWAhuN0MfaJQHSqrHAPGBakgaGYAmwygh9qKwESKt6AA8AyzJwOgjHgAeN0BsyJUBa1Rt4HPeLx8HnwG7cPP8ROA20AQKoxsWFwcBVxJ86dwFrjNDpESCt6gI8AjwdQfww8CKwzQj9WUxncuMB3ATUAXMjdptkhN6SOAHSqlpgexGx/bgv4z0j9F+lOF3Ehn5AAy4GFMIOoCFKwCxKgLTqPGAlcH8BsZeAZ43Qh5N2uoBd4zy7hhcQu8MI/WbJBEirBgLfAJ1DRFYCTxqhf87K8QAba4DVwLAQkTXAvUboP2MRIK2aCLwf0vwxcGcSy1CCREwCNoc0nwCGG6FNJAKkVXOA10KU3W6EfqfcDofY3Q1YDjwUIjLECP2fZaIqQMl84LmAzoeAcUboo+V2NAIRE4CwlaDGCN2ae+gUIHAy4N0rwKBzwXkAI3QT0B/4LaD5TP5D2BSYhQssAAuM0CvK7VQpkFZ1Bz4AxnivBhqh9xclwOvcAAgj9KqEjLkWGAWMBkbidoX5q8sp3IqzG2gGPvXP1xLHFcB6YK4R+oC/PbXtsLRqKDATePQsVWlgBfC2EfpU0nYmSoC0qjMwB3g1aUM9NAOLjNA72hUB0qquuI3R8pQc9+N34DYv2JWXAGlVHW6ORcEeoAn4CjDAr8C3wBVAT1zkHgVMBXpE0PcFMMMf2DIhQFrVE3dKc0sBsTZgEdBYStYorboamAXcV0R0HvBC3K1wyQRIq64EWgqINAJPGKG/LEV/yJi34pbmXiEiO4F6I/TJyEpLIUBaNQ14N6S5CXdCczApxwPGL5TlAVxmhP4uFQKkVbOBsLxgghF6a1qO++zojFtenwoRGWyE3htFV6coQnk4HvBuO9ArK+cBjNBtRujFuKQqCJHzhVgEGKE3ATfnvVoK3FCu8wAjdAtwMXAk73VfI/T3qQ4srZogrXq4HE6H2HOBtKpFWnVJuW2p4FxDJrXBHKRVI4ARwBCgH3A+bs9+BPgaaDVC7+kwBEirqoAZuKPyYTG6tuBqD42lZHdlJ8A7Sl8ILE5A3QJcmpt4nSEVAmJujuIglUQryepwV+Bl3HlAIRwHtgIHcPO/O+50aCLheX4OzwMLjdBt7YoAr0r8CaBCRDYBzxihP4yg60ZczKgNEfkI9zWcKaYrCuKmwmGoD3F+A25zMjmK8wBG6G1G6OtxX0VQLfIaYHxCdic6BRpwZagcJnup89nqnQ7kF2KmGqHXJWV3opBWzZRW/S2tujxhvUM9vXXl9rGCCiqooEMh091gDtKqC3G5wzhc9ncQ2GKE3tahCfA2ScuA+QXEMr2AkRkB0qpqXKGzbwTxZUbosy2qth8CvHOBncB1MbrdbYR+vaMQEHbhajWwDxcPxgS0V6dREs9HlywIwB2f+9HfCJ07zl4qraoH1vlkpgBvpGlYUrvBYhjpdyzPeQCM0OuBjT656WkblhUBfoQVVht9z0M7KgG9Q94P8D2f6KgELPFugv8LaVUf4DGf3ObIGts5Af41vR7YIK0a4jk/HvghoN9baRuW1TJYDfwSs1ujETr1v99k8gV4tzZqY3abnYVtmcUAI/ROYGwE0VagT9yrLu2eAI+EXUA33KWm077mZtzfXWqM0KlH/woqqACAfwBSEqcUioZEhQAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAxNy0wNS0xOVQwMToyNTozNSswODowMAEnggMAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTctMDUtMTlUMDE6MjU6MzUrMDg6MDBwejq/AAAAAElFTkSuQmCC')
/*
        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","太棒啦，您的网络连接恢复了")}
*/
        if(nwjs){
            $.when(get_remote_version()).done(function(data){
                remote_version = data
                fire_update()
            })
        }

    })
    if(nwjs){init_screen()};
    F1_msg('加载打印模块')
    scale_time=setTimeout(do_hide,1000)
    var _shop_id = window.localStorage.getItem('shop_id');
    if(_shop_id==null){window.location.href="/dlogin";}
    else{
        if(screen.width<1280){
            $("#ai_clock").hide();
            $("#ai_1").css('margin-left',0)
            $("#sys_info1 div:eq(0)").css('width','20rem')
            $("#sys_info1 div:eq(1)").css('width','15rem')
            $("#sys_info1 div:eq(2)").css('width','15rem')
            $("#sys_info1 div:eq(3)").css('width','6rem')
        }
        shop_id=JSON.parse(_shop_id);
        createWebSocket();
        var _qr=window.localStorage.getItem('qr')
        if(_qr!=null){
            qr_base64=_qr
        }
        else{
            $.get('http://yichihui.com/get_qr/'+shop_id,function(result){
                shop_qr=result;
                get_base64('http://yichihui.com'+shop_qr).done(function(data){
                    qr_base64=data;
                    window.localStorage.removeItem('qr')
                    window.localStorage.setItem('qr',qr_base64)
                })
            });
        }


        std_ajax('get_shop',{shop_id:shop_id})
            .done(function(data){
                shop_detail=data;
                window.localStorage.removeItem('shop_detail')
                window.localStorage.setItem('shop_detail',JSON.stringify(data))
                if(nwjs){global.comm.ads(shop_detail.ads)}
                if(shop_detail.sys_setup!=''){
                    var sys_setup=JSON.parse(shop_detail.sys_setup);
                    $("#print_mode").val(sys_setup.print_mode);
                    if(sys_setup.serial_port!=null){$("#serial_port").val(sys_setup.serial_port)};
                    print_id=sys_setup.print_name;
                    print_name=sys_setup.print_name;
                    print_mode=sys_setup.print_mode;
                    if(sys_setup.print_barcode!='undefined'){print_barcode=sys_setup.print_barcode;}
                }
            })
            .fail(function(){
            var _data=window.localStorage.getItem('shop_detail')
                if(_data!=null){
                _data=JSON.parse(_data)
                    shop_detail=_data
                    if(nwjs){global.comm.ads(shop_detail.ads)}
                    if(shop_detail.sys_setup!=''){
                        var sys_setup=JSON.parse(shop_detail.sys_setup);
                        $("#print_mode").val(sys_setup.print_mode);
                        if(sys_setup.serial_port!=null){$("#serial_port").val(sys_setup.serial_port)};
                        print_id=sys_setup.print_name;
                        print_name=sys_setup.print_name;
                        print_mode=sys_setup.print_mode;
                        if(sys_setup.print_barcode!='undefined'){print_barcode=sys_setup.print_barcode;}
                    }
                }
            })
    }
    var _zoom=window.localStorage.getItem('zoom')
    if(_zoom==null){window.localStorage.setItem('zoom',0)}
    else{
        zoom=parseFloat(_zoom)
        if(nwjs){win.zoomLevel=zoom};
    }
    var _shop_name = window.localStorage.getItem('shop_name');
    if(_shop_name==null){shop_name='未知店铺';}
    else{
        shop_name=JSON.parse(_shop_name)
    }
    var _oper_openid = window.localStorage.getItem('oper_openid');
    if(_oper_openid==null){oper_openid=''}
    else{
        oper_openid=JSON.parse(_oper_openid)
    }
    console.log('pvt_read')
    pvt_read().done(function(){
        console.log('显示goods_pvt长度:',goods_pvt.length)
        if(goods_pvt.length>0){
            var p=[]
            goods_pvt.map(function(pvt){
                console.log(pvt)
                if(pvt&&!pvt.base64){
                    p.push(get_local_64(pvt))
                }
            })
            if(p.length>0){
                $.when.apply(this,p).always(function(){
                    pvt_write().done(function(){
                        draw_scale_goods()
                        draw_no_bn_goods()
                        $("#no_bn_goods_list").hide()
                    })
                })
            }
            else{
                draw_scale_goods()
                draw_no_bn_goods()
                $("#no_bn_goods_list").hide()
            }
        }
    })

    login()
    var _headimgurl = window.localStorage.getItem('headimgurl');
    if(_headimgurl!=null)
    {headimgurl=JSON.parse(_headimgurl)}
    var _nickname = window.localStorage.getItem('nickname');
    if(_nickname==null){nickname=''}
    else{
        nickname=unescape(JSON.parse(_nickname))
    }

    draw_cat();
    $("#shop_name").html(shop_name);

    order_mp3 = document.getElementById('order_mp3');
    error_mp3 = document.getElementById('error_mp3');
    cash_box_mp3 = document.getElementById('cash_box_mp3');
    ok_mp3 = document.getElementById('ok_mp3');
    click_mp3 = document.getElementById('click_mp3');
    warn_mp3 = document.getElementById('warn_mp3');
    ask_mp3 = document.getElementById('ask_mp3');
    welcome_mp3 = document.getElementById('welcome_mp3');
    //thanks_mp3 = document.getElementById('thanks_mp3');
    ready_mp3 = document.getElementById('ready_mp3');
    wait_mp3 = document.getElementById('wait_mp3');
    F1_msg('加载商品数据');
    get_shop_goods(shop_id);
    /*setTimeout(function(){
        if(ws_status){$(".mmm").attr('src',headimgurl)}
        LODOP = getCLodop();
        if(typeof(LODOP)!='undefined'){
            LODOP.Create_Printer_List(document.getElementById('print_name'));
            LODOP.Create_Printer_List(document.getElementById('print_barcode'));
            LODOP.SET_LICENSES("北京壹尺生活电子商务有限公司","F05C7E3178E35E561365D1F3A6ED58D3","","")
            if(typeof(LODOP)!='undefined'){
                LODOP.FORMAT("VOICE:0;100","您好，欢迎使用，你的店铺名称是"+shop_name+"，当前营业员是"+nickname)};
            if(!window.navigator.onLine){
                if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","请注意，您的收银机网络断了，请检查")};
            }
            else{
                say('系统网络连接正常，祝您工作好心情！')
            }
        }
        else{
            $(".sys_setup .modal-body").html("您没有安装正确的打印系统软件，无法进行相关设置，请咨询管理员")
        }

    },1000)*/
    $(".btn").mouseout(function(){
        $(".fake_btn").focus().tap();
    })
    $(".btn").tap(function(){
        $(".fake_btn").focus().tap();
    })
    $(".btn").click(function(){
        $(".fake_btn").focus().tap();
    })
    ban_obj=$(".ban_all:eq(0)")
    ban_onfocus=true
    ban_obj.css('border-color','red')
    $(".ban_all").on('focus',function(){
        ban_obj=$(this)
        ban_onfocus=true
        $(this).select()
        $(".ban_all").css('border-color','darkgray')
        ban_obj.css('border-color','red')
    })
    $("#zoom").on('change',function(){
        zoom=parseFloat($(this).val())
        window.localStorage.setItem('zoom',zoom)
        win.zoomLevel=zoom
        setTimeout(function(){
            $(".pay_order_div").css('height','calc((100% - 19rem)/2.5)')
            var _w=$(".pay_order_div").height()
            $(".pay_order_div").css('width',_w).css('border-radius',_w/2)
        },1000)

    })
    $(".P_ON_bt").on('tap',function(){
        $(".fake_btn").focus().tap();
        P_ON=!P_ON;
        if(P_ON){
            $(".P_ON_bt").addClass('btn-danger').html('打印机状态:开')
        }
        else{
            $(".P_ON_bt").removeClass('btn-danger').html('打印机状态:关')
        }
    })
    $(".debug_mode").on('tap',function(){
        $(".fake_btn").focus().tap();
        P_debug=!P_debug;
        if(P_debug){
            $(".debug_mode").addClass('btn-primary').html('打印调试:开')
        }
        else{
            $(".debug_mode").removeClass('btn-primary').html('打印调试:关')
        }
    })
    $(".order_sel").on('tap',function(){
        var obj=$(this);
        var _index=$(".order_sel").index(this);
        do_snap(_index);
        $("#net_order_win").animate({'right':'100%'});
        $("#last_30").animate({'right':'100%'});
        last_30=false;
        net_win=false;
    });
    $("body").on('tap',function(){
        var obj=$("#in_count");
        check_in_count(obj)
        if(detail_status){
            change_detail(detail_obj).done(function(){})
                .fail(function(){})
        }
    });

    $(".abs_off").on('tap',function(){
        tg_abs()
    });
    $("body").keydown(function(event) {
        keycode = (event.keyCode ? event.keyCode : event.which);
        main_key(keycode)
    });
    $("#in_count").on('tap',function(){
        act_pos("#in_count");
        $("#in_count").html("");
        do_abs(true);
        return false
    });
    $(".change_count").on('tap',function(){
        var act=$(this).data('change')
        var obj=$("#in_count")
        var _count=obj.html()
        if(!regex.isNum(_count)){
            obj.focus().select()
            $("#in_count").popover('show')
            error_mp3.play()
            setTimeout(function(){$("#in_count").popover('destroy')},1000)
            return
        }
        else{
            if(act=='plus'){
                if(_count<99){_count++;obj.html(_count)}
                return
            }
            else{
                if(_count>1){_count--;obj.html(_count)}
            }

        }
    });
    $(".ask-key").on('tap',function(){
        tg_abs()
    });
    $(".mkey").on('tap',function(){
        var obj=$(this);
        var _key=obj.data('key');
        click_mp3.play();
        proc_keypad(_key);
        return false
    });
    $(".mkey1").on('tap',function(){
        var _key=$(this).data('key')
        if(ban_onfocus){
            ban_obj.val('')
            ban_onfocus=false
        }
        if(_key=='b'){
            ban_obj.val(ban_obj.val().substr(0,ban_obj.val().length-1))
            if((ban_obj).val()==''){
                ban_obj.val('0.00').select()
            }
        }
        else{
            ban_obj.val(ban_obj.val()+_key)
        }
    })
    $(".goods_refund").on('tap',function(){
        var obj=$(this);
        if(goods_refund>0){
            obj.addClass('button-highlight')
        }
        else{
            obj.removeClass('button-highlight')
        }
        goods_refund=goods_refund*-1
        $(".fake_btn").focus().tap()
        return false
    })
    $(".fake_btn").on('tap',function(){
        return false
    })
    $(".pay_style").on('tap',function(){
        var obj=$(this)
        pay_style=parseInt($(this).data('pay_style'))
        $(".pay_select").css('background-color','transparent')
        obj.find('.pay_select').css('background-color','red')
        if(pay_style!=0){
            $("#in_order").html($(".total_price").html())
            return false
        }
    })
    $(".del_bill").on('tap',function(){
        del_bill()
    })

    $(".cash_box").on('tap',function(){
/*
        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","打开钱箱")}
*/
        open_cash_box()
    })
    /*$(".cash_box").on('dblclick',function(){
        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","打开钱箱")}
        LODOP.SET_PRINT_MODE("CONTROL_PRINTER:"+print_name,"RESUME");
        LODOP.FORMAT("VOICE:0;100","双击恢复打印状态，单击打开钱箱")
    })*/

    $(".ban_ok").on('tap',function(){
        if(!regex.isDecimal($("#ban_cash").val())){
            error_mp3.play()
            $("#ban_cash").css('background-color','red')
            setTimeout(function(){$("#ban_cash").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#ban_wex").val())){
            error_mp3.play()
            $("#ban_wex").css('background-color','red')
            setTimeout(function(){$("#ban_wex").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#ban_ali").val())){
            error_mp3.play()
            $("#ban_ali").css('background-color','red')
            setTimeout(function(){$("#ban_ali").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#ban_card").val())){
            error_mp3.play()
            $("#ban_card").css('background-color','red')
            setTimeout(function(){$("#ban_card").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#ban_other").val())){
            error_mp3.play()
            $("#ban_other").css('background-color','red')
            setTimeout(function(){$("#ban_other").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#ban_pay").val())){
            error_mp3.play()
            $("#ban_pay").css('background-color','red')
            setTimeout(function(){$("#ban_pay").css('background-color','white')},200)
            return false;
        }
        $("#ban").modal('hide')
        _confirm('请确认操作','您将提交结账数据，并退出银台，请确认操作')
            .done(function(){
                if(goods_to_renew.length>0){
                    var p=[]
                    goods_to_renew.map(function(goods){//将所有需要更新的订单提交，未成功的，下次订单的时候再试
                        p.push(upload_goods(goods))
                    })
                    $.when.apply(this,p).done(function(){
                        goods_to_renew=[];
                        logout()
                            .done(function(){
                                window.location.href="dlogin.html"
                            })
                    })
                }
                else{
                    logout()
                        .done(function(data){
                            window.location.href="dlogin.html"
                        })
                }
            })
            .fail(function(){
                edit_status=true
                $("#ban").modal()
                $("#ban").off('hidden.bs.modal').on('hidden.bs.modal',function(e){
                    edit_status=false
                })
            })
    })
    $(".logout").on('tap',function(){
        edit_status=true
        $("#ban").modal()
        $("#ban").off('hidden.bs.modal').on('hidden.bs.modal',function(e){
            edit_status=false
        })
    })
    $("#net_order_win").on('swipeleft',function(){
        if(net_win){
            net_win=false;
            hide_option($("#net_order_win"))
        }
        return false
    })
    $("#last_30").on('swipeleft',function(){
        if(last_30){
            last_30=false;
            hide_option($("#last_30"))
        }
        return false
    })
    $(".net_sign").on('tap',function(){
        $(this).removeClass("net_alert")
        order_mp3.pause()
        if(net_win){
            hide_option($("#net_order_win"))
        }
        else{

            std_ajax('get_net_orders',{shop_id:shop_id})
                .done(function(orders){net_orders=orders;draw_net_orders()})

            show_option($("#net_order_win"))
            hide_option($("#last_30"))
            last_30=false
        }
        net_win=!net_win
    })
    $("#last_30_btn").on('tap',function(){
        if(last_30){
            hide_option($("#last_30"))
        }
        else{
            std_ajax('get_last_30_orders',{shop_id:shop_id,oper_openid:oper_openid})
                .done(function(orders){last_orders=orders;draw_last_30()})
            show_option($("#last_30"))
            hide_option($("#net_order_win"))
            net_win=false
        }
        last_30=!last_30
    })
    $(".direct_pay").on('tap',function(){
        if(cur_pos=="#barcode"){
            pre_pos="#barcode"
            act_pos("#in_dpay")
            $("body").off('tap')
            $("#direct_cash").show()
            $('#direct_cash .d_cancel').one('tap', function (e) {
                act_pos(pre_pos)
                $("#in_dpay").html('')
                $("#direct_cash").hide()
                $("body").off('tap').on('tap',function(){
                    var obj=$("#in_count")
                    check_in_count(obj)
                })
            })
            $('.d_ok').off('tap').on('tap', function (e) {
                do_dpay()
                    .done(function(){
                        $('#direct_cash .d_cancel').off('tap')
                        act_pos(pre_pos)
                        $("#in_dpay").html('')
                        $("#direct_cash").hide()
                        $("body").off('tap').on('tap',function(){
                            var obj=$("#in_count")
                            check_in_count(obj)
                        })
                    })
                    .fail(function(){
                        error_mp3.play()
                        $("#in_dpay").html('输入错误')
                        setTimeout(function(){$("#in_dpay").html('')},500)
                    })

                return false
            })
        }
    })
    $(".left_move").on('swipeleft',function(){
        var obj=$(this)
        obj.animate({"margin-left":"-100%","margin-right":"100%"},"fast",function(){
            do_snap(check_index('left'))
            obj.css('margin-left',"100%").css('margin-right',"-100%").animate({"margin-left":"0%","margin-right":"0%"},"fast")
        })
        return false
    })
    $(".left_move").on('swiperight',function(){
        var obj=$(this)
        obj.animate({"margin-left":"100%","margin-right":"-100%"},"fast",function(){
            do_snap(check_index('right'))
            obj.css('margin-left',"-100%").css('margin-right',"100%").animate({"margin-left":"0%","margin-right":"0%"},"fast")
        })
        return false
    })
    $(".pad_swipe").off("swipeleft").on("swipeleft",function(){
        do_abs(true)
        return false
    })
    $(".abs").off("swiperight").on("swiperight",function(){
        do_abs(false)
        return false
    })

    $(".order_div").off("swiperight").on("swiperight",function(){
        proc_esc()
        return false
    })
    $(".sys_setup").on('click',function(){
        edit_status=true
        var names=[]
        $.each($("#print_name option"),function(index,obj){
            names.push({val:this.value,name:this.text})
        })
        var _res=names.filter(function(item){return item.name==print_name})
        if(_res.length>0){
            $("#print_name").val(_res[0].val)
        }
        var __res=names.filter(function(item){return item.name==print_barcode})
        if(__res.length>0){
            $("#print_barcode").val(__res[0].val)
        }
        $("#print_setup").modal()
        $("#print_setup").off('hidden.bs.modal').on('hidden.bs.modal',function(e){
            edit_status=false
        })
        $("#print_setup").focus()

    })
    $(".print_setup_ok").on('click',function(){
        edit_status=false
            update_shop_detail()
        $("#print_setup").modal('hide')
    })
    $(".new_goods_ok").on('click',function(){
        if($("#new_name").val()==''){
            error_mp3.play()
            $("#new_name").css('background-color','red')
            setTimeout(function(){$("#new_name").css('background-color','white')},200)
            return false;
        }
        if(!regex.isDecimal($("#new_price").val())){
            error_mp3.play()
            $("#new_price").css('background-color','red')
            setTimeout(function(){$("#new_price").css('background-color','white')},200)
            return false;
        }
        if(($("#new_bn").html().length!=7)&&($("#new_pvt").val()==1)){
            error_mp3.play()
            $("#new_pvt").css('background-color','red')
            setTimeout(function(){$("#new_pvt").css('background-color','white')},200)
            return false;
        }
        if($("#new_pvt").val()==1){$("#new_cat").val(408)}
        if($("#new_pvt").val()==2){$("#new_cat").val(409)}
        var _new_goods={bn:$("#new_bn").html(),name:$("#new_name").val(),price:$("#new_price").val(),cat_id:$("#new_cat").val(),pvt:$("#new_pvt").val()}
        upload_goods(_new_goods)
            .done(function(id){
                _new_goods.goods_id=id
                console.log('upload',_new_goods)
                renew_goods(_new_goods)
                    .done(function(){
                        ok_mp3.play()
                        $("#barcode").html($("#new_bn").html())
                        $("#new_goods_modal").modal('hide')
                        edit_status=false
                        main_key(13)
                    })
                    .fail(function(){
                        $("#new_goods_alert").html('提交新商品未成功,输入非法，请检查')
                    })
            })
            .fail(function(){
                $("#new_goods_alert").html('提交新商品未成功，请检查网络情况！')
            })
    })
    $(".hide_finished").on('click',function(){
        var obj=$(this)
        var _h=obj.data('hide')
        if(_h){
            show_finished()
            obj.data('hide',false)
            obj.html('隐藏已完成订单')
        }
        else{
            hide_finished()
            obj.data('hide',true)
            obj.html('显示已完成订单')
        }
    })
    $(".all_tmp").on('tap','.del_tmp',function(){
        console.log('del_tmp')
        var _goods_id=$(this).data('goods_id')
        var _goods_name=$(this).data('detail')
        _confirm('确认删除本商品吗？',_goods_name).done(function(){
            var _ind=scan_list.findIndex(function(item){return item.goods_id==_goods_id})
            scan_list.splice(_ind,1)
            redraw_tmp_list()
            if(nwjs){global.comm.send(scan_list)}
        })
    })
    $(".all_tmp").on('tap','.can',function(){
        var obj=$(this)
        if(detail_status){//已经在编辑状态，检查上次编辑的内容是否合法，是否需要提交
            if(detail_obj.val()!=detail_obj.data('detail')){
                change_detail(detail_obj)
                    .done(function(){
                        var _goods_id=obj.data('goods_id')
                        if(_goods_id!=0){
                            if(obj.find('input').length>0){
                                detail_obj=obj.find('input:eq(0)')
                                detail_obj.focus().select()
                                edit_status=true
                                detail_status=true
                                detail_first=true
                            }
                            else{
                                var _v=obj.html()
                                obj.html('<input type="text" value="'+_v+'" class="edit">').find('input').focus().select()
                                edit_status=true
                                detail_status=true;
                                detail_first=true;
                                detail_obj=obj.find('input')
                                obj.off('change','input').on('change','input',function() {
                                    change_detail($(this)).done(function(){})
                                        .fail(function(){})
                                })
                            }
                            return false
                        }
                    })
            }
        }
        else{
            var _goods_id=obj.data('goods_id')
            if(_goods_id!=0){
                if(obj.find('input').length>0){
                    detail_obj=obj.find('input:eq(0)')
                    detail_obj.focus().select()
                    edit_status=true
                    detail_status=true
                    detail_first=true
                }
                else{
                    var _v=obj.html()
                    obj.html('<input type="text" value="'+_v+'" class="edit">').find('input').focus().select()
                    edit_status=true
                    detail_status=true;
                    detail_first=true;
                    detail_obj=obj.find('input')
                    obj.off('change','input').on('change','input',function() {
                        change_detail($(this)).done(function(){})
                            .fail(function(){})
                    })
                }
                return false
            }
        }


    })
    $(".no_bn").on('tap',function(){
        //do_abs(false)
        $(".abs_scale").animate({right:"0"},'fast',function(){show_no_bn()})
    })
    $(".abs_scale").on('swiperight',function(){
        $(".abs_scale").animate({right:"-41.5%"})
        return false
    })
    $(".close_abs_scale").on('tap',function(){
        $(".abs_scale").animate({right:"-41.5%"})
    })
    $(".scale_price_div").on('tap',function(){
        $(".abs_scale").animate({right:"0"},'fast',function(){show_scale()})
    })
    $("#scale_goods_list").on('tap','.scale_goods',function(){
        if(scale) {
            scale_sel = true
            var obj = $(this)
            var offset = $(".scale_price").offset()
            var _goods_id = obj.data('goods_id')
            var _g = goods_pvt.filter(function (item) {
                return item.goods_id == _goods_id
            })[0]
            scale_now = _g
            var img = obj.find('img').attr('src');
            var start = obj.offset();
            var flyer = $('<img class="u-flyer" src="' + img + '" style="z-index: 11;width: 10%">');

            flyer.fly({
                start: {
                    left: start.left,
                    top: start.top
                },
                end: {
                    left: offset.left + 30,
                    top: offset.top,
                    width: 0,
                    height: 0
                },
                onEnd: function () {
                    this.destroy();
                    $(".scale_price").html(parseFloat(_g.price).toFixed(2)).animate({'font-size': '5rem'}, 'fast', function () {
                        $(".scale_price").animate({'font-size': '3rem'}, 'fast')
                    })
                }
            });

        }

    })
    $("#no_bn_goods_list").on('tap','.no_bn_goods',function(){
        var obj = $(this)
        var _goods_id=obj.data('goods_id')
        var offset=$(".all_tmp").offset()
        var _g=goods_pvt.filter(function (item) {return item.goods_id == _goods_id})[0]
        var img = obj.find('img').attr('src');
        var start = obj.offset();
        var flyer = $('<img class="u-flyer" src="' + img + '" style="z-index: 11;width: 10%">');

        flyer.fly({
            start: {
                left: start.left,
                top: start.top
            },
            end: {
                left: offset.left + 30,
                top: offset.top,
                width: 0,
                height: 0
            },
            onEnd: function () {
                this.destroy();
                var _p={}
                _p.from=true
                _p.bn=_g.bn;
                _p.goods_id=_g.goods_id
                _p.price=_g.price
                _p.total=parseFloat(_g.price)*parseInt($("#in_count").html()).toFixed(2)
                _p.shop_id=shop_id
                _p.cat_id=_g.cat_id
                _p.name=_g.name
                add_tmp_list(_p)
                if(nwjs){global.comm.send(scan_list)}
                $("#in_count").html("1")
            }
        });
    })
    $(".up_scale").on('tap',function(){
        if(scale_row[0]>0){
            if(typeof(scale_now.goods_id)!='undefined'){//选择了称重商品
                var _p={}
                _p.from=true
                _p.bn=scale_now.bn;
                _p.goods_id=scale_now.goods_id
                _p.price=scale_now.price
                _p.total=(scale_row[0]*parseFloat(scale_now.price)).toFixed(2)
                _p.shop_id=scale_now.shop_id
                _p.cat_id=scale_now.cat_id
                _p.name=scale_now.name
                add_tmp_list(_p)
                if(nwjs){global.comm.send(scan_list)}
                scale_sel=false
                scale_now={}
                $("#in_count").html("1")
            }
            else{
                if(scale_row[2]>0){
                    var _p={}
                    _p.from=true
                    var _m=Math.round(Math.random()*1000)
                    _p.bn='秤'+_m;
                    _p.goods_id='秤'+_m;
                    _p.price=scale_row[1].toFixed(2)
                    _p.total=scale_row[2].toFixed(2)
                    _p.shop_id=shop_id
                    _p.cat_id=0
                    _p.name='称重商品'+_m
                    add_tmp_list(_p)
                    if(nwjs){global.comm.send(scan_list)}
                    scale_sel=false
                    scale_now={}
                    $("#in_count").html("1")
                }
            }
        }
    })
    $(".scale_menu").on('tap',function(){
        show_scale()
    })
    $(".no_bn_menu").on('tap',function(){
        show_no_bn()
    })
    $("#serial_port").on('change',function(){
        serial_port=$(this).val()
        window.localStorage.removeItem('serial_port')
        window.localStorage.setItem('serial_port',serial_port)
    })
    setInterval(function(){
        //update_orders()
        console.log('定时器')
    },60000)
    $("body").on('new_goods',function(){
        var goods=$(this).data('goods')
        console.log('ws',goods)
        renew_goods(goods)
    })
    $("body").on('del_goods',function(){
        var _goods_id=$(this).data('goods_id')
        var _ind=goods_pvt.findIndex(function(item){return item.goods_id==_goods_id})
        if(_ind!=-1){
            goods_pvt.splice(_ind,1)
            pvt_write().done(function(){
                draw_scale_goods()
                draw_no_bn_goods()
            })
        }
    })
    $("body").on('new_net_orders',function(){
        proc_net_orders(new_net_orders)
    })

    $("#print_bc_btn").on('tap',function(){
        print_lbc()
    })
    $(".fast_query").on('tap',function(){
        draw_no_bn_goods()
    })
    if(nwjs) {
        setTimeout(function () {
            chrome.serial.connect(serial_port, {//以波特率9600，连接串口3，指定连接函数onConnect
                bitrate: 9600
            }, function (e) {
                chrome.serial.onReceive.addListener(function (data) {
                    parseSerialportData(data.data);
                })
            });
        }, 1000)
    }
})

function show_scale(){
    $(".scale_menu").css('background-color','#EEEEEE')
    $(".no_bn_menu").css('background-color','gray')
    $("#scale_goods_list").show()
    $("#no_bn_goods_list").hide()
}
function show_no_bn(){
    $(".no_bn_menu").css('background-color','#EEEEEE')
    $(".scale_menu").css('background-color','gray')
    $("#scale_goods_list").hide()
    $("#no_bn_goods_list").show()
}
   /* var MIN_PKG_LEN = 7;
    var BUF_SIZE = 128;
    var readBuffer = Buffer.allocUnsafe(BUF_SIZE).fill(0x0);  // Create read buffer, filled with zero.
    var tmpBuffer = Buffer.allocUnsafe(BUF_SIZE).fill(0x0);   // Create temp buffer, filled with zero.
    var newLine = '\n\r';                                     // Each packet starts with new line.
    var buffLength = 0;

function parseSerialportData(data) {

    var dataview = new DataView(data);
    for (var i = 0; i < data.byteLength; i++) {
        readBuffer[buffLength + i] = dataview.getInt8(i);
    }

    buffLength += data.byteLength;

    if (buffLength < MIN_PKG_LEN) {
        return;
    }
    while (true) {
        var firstNewline = readBuffer.indexOf(newLine);

        if (firstNewline == -1) {
            break;
        }
        var secondNewline = readBuffer.indexOf(newLine, firstNewline + 1);
        if (secondNewline == -1) {
            shrinkData(firstNewline);
            break;
        }
        var curPos = firstNewline;
        var returnData = [];
        var i = 0;
        const digBuff = Buffer.allocUnsafe(10).fill(0x0);
        while (curPos < secondNewline) {
            curPos += 2;
            i++;
            var value = 0;
            var digitInString = "";
            switch (i) {
                case 1:
                    readBuffer.copy(digBuff, 0, curPos, curPos + 5);
                    curPos += 5;
                    digitInString = digBuff.toString();
                    value = parseFloat(digBuff.toString())/1000;
                    break;
                case 2:
                    readBuffer.copy(digBuff, 0, curPos, curPos + 5);
                    curPos += 5;
                    digitInString = digBuff.toString();
                    value = parseFloat(digBuff.toString())/100;
                    break;
                case 3:
                    readBuffer.copy(digBuff, 0, curPos, curPos + 6);
                    curPos += 6;
                    digitInString = digBuff.toString();
                    value = parseFloat(digBuff.toString())/100;
                    break;
                default:
                    console.warn('eror happened when parsing data from serial port');
                    break;
            }

            returnData.push(value);
        }
        $("#sys_info1").show()
        $("#sys_info").hide()
        scale=true
        clearTimeout(scale_time)
        scale_time=setTimeout(do_hide,1500)
        scale_row=returnData
        if(typeof(returnData[0])!='undefined'){$(".scale_weight").html(returnData[0].toFixed(3))}else{$(".scale_weight").html('0.000')}
        if(!scale_sel){
            if(typeof(returnData[1])!='undefined'){$(".scale_price").html(returnData[1].toFixed(2))}else{$(".scale_price").html('0.00')}
            if(typeof(returnData[2])!='undefined'){$(".scale_total").html(returnData[2].toFixed(2))}else{$(".scale_total").html('0.00')}
        }
        else{
            $(".scale_total").html((returnData[0]*parseFloat($(".scale_price").html())).toFixed(2))
        }
        if(nwjs){global.comm.dis_cus_scale(true,[$(".scale_weight").html(),$(".scale_price").html(),$(".scale_total").html()])}
        shrinkData(secondNewline);
        break;
    }

    return ;

    function shrinkData(curPos) {
        tmpBuffer.fill(0x0);
        readBuffer.copy(tmpBuffer, 0, curPos, buffLength);
        buffLength -= curPos;
        readBuffer.fill(0x0);
        tmpBuffer.copy(readBuffer, 0, 0, buffLength);

    }

}*/


function do_hide(){
    $("#sys_info1").hide()
    $("#sys_info").show()
    scale=false
    scale_row=[]
    if(nwjs){global.comm.dis_cus_scale(false,[])}
}


function change_detail(oobj){
    var rtn=$.Deferred()
        edit_status=false
        detail_status=false
        var _goods_id=oobj.parent().data('goods_id')
        if(oobj.parent().data('detail')==oobj.val()){
            oobj.parent().data('detail',oobj.val())
            var tg=scan_list.filter(function(item){return item.goods_id==_goods_id})[0]
            tg.total=tg.price*tg.count
            oobj.parents('tr').find('td:eq(3)').html(parseFloat(tg.price*tg.count).toFixed(2))
            oobj.parents('tr').find('td:eq(1)').html(parseFloat(tg.price).toFixed(2))
            draw_total()
            var _v = oobj.val()
            oobj.parent().html(_v)
            if(nwjs){global.comm.send(scan_list)}
            rtn.resolve();return rtn.promise();}
        update_goods(oobj.parent().data('can'),_goods_id,oobj.val())
            .done(function(){
                oobj.parent().data('detail',oobj.val())
                var tg=scan_list.filter(function(item){return item.goods_id==_goods_id})[0]
                tg.total=tg.price*tg.count
                oobj.parents('tr').find('td:eq(3)').html(parseFloat(tg.price*tg.count).toFixed(2))
                oobj.parents('tr').find('td:eq(1)').html(parseFloat(tg.price).toFixed(2))
                draw_total()
                var _v = oobj.val()
                oobj.parent().html(_v)
                if(nwjs){global.comm.send(scan_list)}
                rtn.resolve()
            })
            .fail(function(){
                edit_status=true
                detail_status=true
                detail_first=true
                oobj.focus().select()
                error_mp3.play()
                rtn.reject()
            })
    return rtn.promise();
}
function show_option(obj){
    var rtn=$.Deferred()
        obj.animate({'right':'42.7%'},function(){rtn.resolve()})
    return rtn.promise()
}
function hide_option(obj){
    var rtn=$.Deferred()
        obj.animate({'right':'100%'},function(){rtn.resolve()})
    return rtn.promise()
}
function login(){
    std_ajax('login',{shop_id:shop_id,openid:oper_openid,on_stamp:Date.parse(new Date()) / 1000})
}
function logout(){
    var rtn=$.Deferred()
        var ban_detail={}
        ban_detail.cash=$("#ban_cash").val()
        ban_detail.card=$("#ban_card").val()
        ban_detail.other=$("#ban_other").val()
        ban_detail.wex=$("#ban_wex").val()
        ban_detail.ali=$("#ban_ali").val()
        ban_detail.pay=$("#ban_pay").val()
        ban_detail.memo=$("#ban_memo").val()
        std_ajax('logout',{shop_id:shop_id,openid:oper_openid,off_stamp:Date.parse(new Date()) / 1000,ban_detail:JSON.stringify(ban_detail)})
            .done(function(data){
                print_ban(data)
                setTimeout(function(){
                    rtn.resolve(data)
                },1000)
            })//还需打印
    return rtn.promise()
}
function update_shop_detail(){
    print_name=$("#print_name option:selected").html()
    print_barcode=$("#print_barcode option:selected").html()
    print_id=parseInt($("#print_name").val())
    print_mode=$("#print_mode").val()
    serial_port=$("#serial_port").val()
    var sys_setup={print_id:print_id,print_name:print_name,print_mode:print_mode,print_barcode:print_barcode,serial_port:serial_port}
   console.log(JSON.stringify(sys_setup))
    std_ajax('update_sys_setup',{shop_id:shop_id,sys_setup:JSON.stringify(sys_setup)})
}
function update_goods(pos,goods_id,val){
    var rtn=$.Deferred()
        var _g = scan_list.filter(function(item){return item.goods_id==goods_id})[0]
        switch (pos){
            case "name":
                _g.name=val;
                break;
            case "price":
                if(regex.isDecimal(val)){
                    _g.price=parseFloat(val);
                }
                else{
                    rtn.reject()
                }
                break;
            case "count":
                if(regex.isNum(val)){
                    _g.count=parseInt(val);
                }
                else{
                    rtn.reject()
                }
                break;
        }
        var _p=goods_pvt.filter(function(item){return item.goods_id==_g.goods_id})
        if(_p.length>0){
            _g.pvt=_p[0].pvt
            _g.pic=_p[0].pic.substr(31)
        }
        else{
            _g.pvt=0
        }
        renew_goods(_g)
        if(goods_to_renew.some(function(item){return item.goods_id==_g.goods_id})){
            goods_to_renew.filter(function(item){return item.goods_id==_g.goods_id})[0]=_g
        }
        else{
            goods_to_renew.push(_g)
        }
        rtn.resolve()
    return rtn.promise()
}
function upload_goods(goods){
    var rtn=$.Deferred()
        std_ajax('upload_goods',{shop_id:shop_id,goods:JSON.stringify(goods)})
            .done(function(id){
                rtn.resolve(id)})
            .fail(function(){
                rtn.reject()}
            )
    return rtn.promise()
}
function check_index(dir){
    var rtn=snap.cur
    if(dir=='left'){
        rtn--;
    }
    else{
        rtn++;
    }
    if(rtn<0){rtn+=3}
    if(rtn>2){rtn-=3}
    return rtn
}
function do_snap(index){
    snap.tmps[snap.cur]=scan_list
    snap.cur=index
    scan_list=snap.tmps[index]
    redraw_tmp_list()
    if(nwjs){global.comm.send(scan_list)}
    $("#in_count").html('1')
    $(".goods_refund").removeClass('button-highlight')
    goods_refund=1
    var obj=$(".order_sel:eq("+index+")")
    $(".order_sel").removeClass('button-primary')
    obj.addClass('button-primary')
}
function do_dpay_d(txt) {
    var rtn=$.Deferred()
        if(regex.isDecimal(txt)&&txt.length<8){
            $("#in_count").html('1')
            var _goods={}
            _goods.bn='0'
            _goods.name='直接收银'
            _goods.count=1
            _goods.goods_id=0
            _goods.from=true
            _goods.shop_id=shop_id
            _goods.price=parseFloat(txt)
            add_tmp_list(_goods)
            if(nwjs){global.comm.send(scan_list)}
            rtn.resolve()
        }
        else{
            error_mp3.play()
            $("#barcode").css('background-color','red')
            setTimeout(function(){$("#barcode").css('background-color','white')},200)
            rtn.reject()
        }
    return rtn.promise()
}
function do_dpay(){
    var dpay=$("#in_dpay").html()
    $("#in_dpay").html('')
    var rtn=$.Deferred()
        if(dpay==''){
            rtn.reject()
        }
        else{
            if(regex.isDecimal(dpay)){
                $("#in_count").html('1')
                var _goods={}
                _goods.bn='0'
                _goods.name='直接收银'
                _goods.count=1
                _goods.goods_id=0
                _goods.from=true
                _goods.shop_id=shop_id
                _goods.price=parseFloat(dpay)
                add_tmp_list(_goods)
                if(nwjs){global.comm.send(scan_list)}
                rtn.resolve()
            }
            else{
                rtn.reject()
            }
        }
    return rtn.promise()
}
function act_pos(pos){
    cur_pos=pos
    $(".keydiv").removeClass("key_active")
    $(cur_pos).addClass("key_active")
}
function main_key(keycode){
    console.log(keycode)
    var obj=$(cur_pos)
    var _txt=obj.html()
    if(!edit_status){
        switch(keycode)
        {
            case 13:
                switch (cur_pos){
                    case "#in_dpay":
                        $(".d_ok").tap();
                        break;
                    case "#barcode":
                        if((_txt.indexOf('.')!=-1)&&(_txt.length>8)){//限制蓝牙扫码错误.出现
                            _txt=_txt.substr(_txt.indexOf('.')+1)
                        }
                        if(_txt==''){
                            $(".abs_scale").animate({right:"-41.5%"})
                            do_abs(true)
                            do_order()
                            draw_no_bn_goods()
                            if(nwjs){global.comm.cash(true)}
                        }
                        else{
                            if(_txt.indexOf('.')!=-1){
                                do_dpay_d(_txt).done(function(){})
                                    .fail(function(){})
                            }
                            else{
                                if(regex.isNum(_txt)){
                                    query_bn(_txt)
                                        .done(function(goods){
                                            add_tmp_list(goods)
                                            if(nwjs){global.comm.send(scan_list)}
                                            $("#in_count").html('1')
                                        })
                                        .fail(function(e){
                                            console.log('这里',e)
                                            error_mp3.play()
                                            create_goods(_txt)
                                            $("#barcode").css('background-color','red')
                                            setTimeout(function(){$("#barcode").css('background-color','white')},200)
                                        })
                                }
                                else{
                                    do_fast_query(_txt)
                                    $(".abs_scale").animate({right:"0"})
                                    show_no_bn()
                                }

                            }

                            obj.html('')
                        }
                        break;
                    case "#in_count":
                        var rtn=check_in_count(obj)
                        //do_abs(!rtn.status)
                        break;
                    case "#confirm_modal":
                        $(".m_ok").tap()
                        break;
                    case "#in_order":
                        if(!hold_on){
                            if($("#in_order").html()!=''){
                                proc_order()
                                    .done(function(){
                                        do_order_comfirm()
                                    })
                                    .fail(function(e){
                                        hold_on=false;
                                        error_mp3.play();
                                        _confirm('支付错误❌提示','<p>您刚提交的支付未成功</p><p>错误原因:'+e+'</p><p>请重新扫码，或者换用其他方式付款</p>')
                                            .done(function() {pre_pos="#barcode";$("#in_order").html('');$(".pay_status").html('等待付款');$("body").off('tap')})
                                            .fail(function(){pre_pos="#barcode";$("#in_order").html('');$(".pay_status").html('等待付款');$("body").off('tap')})
                                    })
                            }
                            else{
                                order_msg('什么也没输入啊？')

                            }
                        }
                        break;
                    case "#order_confirm":
                        finish_order();
                        hold_on=false;
                        break;
                }
                break;
            case 27:
                hold_on=false;
                proc_esc()
                break;
            case 46:
                del_bill()
                break;
            case 8:
                obj.html(_txt.substr(0,_txt.length-1))
                break;
            case 112:
                print_namecard();
                break;
            case 114:
                print_prev();
                break;
            case 115:
                if(cur_pos=='#barcode'){$(".direct_pay").tap()}
                break;
            case 116:
                $(".cash_box").tap()
                break;
            default:
                if(order_sw&&cur_pos=="#in_order"){
                    $("#in_order").html('');
                    _txt=''
                    order_sw=false
                }
                //if($(cur_pos).hasClass("keydiv")){
                    if(keycode>=96&&keycode<=105){keycode-=48}
                    var _ac
                    if(keycode==190||keycode==110){
                        _ac='.'
                    }
                    else{
                        _ac=String.fromCharCode(keycode)
                    }
                    if(regex.isPwd(_ac)||regex.isDecimal(_ac)||_ac=='.'){
                        obj.html(_txt+_ac)
                    }
                //}
                break;
        }
    }
}
function hide_finished(){
    $.each($(".order_label"),function(){
        var obj=$(this)
        if(obj.hasClass('label-success')){
            obj.parents('.net_order_index').addClass('disnone')
        }
    })
}
function show_finished(){
    $(".net_order_index").removeClass('disnone')
}
function draw_last_30(){
    var _txt=''
    last_orders.map(function(order){
        _txt+='<div class="last_order_index"><div class="row" style="background-color:white;padding-right:0.5rem;margin-top:0.5rem;" data-toggle="collapse" href="#order'+order.id+'" aria-expanded="false" aria-controls="collapseExample">\
                   <div class="col-sm-5" style="height: 5rem;line-height: 5rem;"><i class="aw-icon-caret-right"></i> '+new Date(parseInt(order.stamp) * 1000).Format("yyyy-MM-dd hh:mm:ss")+'</div>\
                   <div class="col-sm-3" style="height: 5rem;line-height: 5rem;">￥'+parseFloat(order.total).toFixed(2)+'</div>\
                   <div class="col-sm-4" style="height:5rem;text-align: right;padding-top: 0.5rem;padding-bottom: 0.5rem">\
                   <select class="form-control pst_style_in" data-order_id="'+order.id+'" style="font-size: 2rem;height: 4rem;text-align: center">\
                    <option value="0">现金</option>\
                    <option value="1">刷卡</option>\
                    <option value="5">微信转账</option>\
                    <option value="6">支付宝转账</option>\
                    <option value="4">其他</option>\
                   </select></div>\
                   </div><div class="collapse" style="background-color: #EEEEEE" id="order'+order.id+'">'
        order.detail.map(function(goods){
            _txt+='<div class="row" style="padding-left:1rem;margin-top:1px;background-color: white">\
                       <div class="col-sm-8">'+goods.name+'</div>\
                       <div class="col-sm-2" style="text-align: right">'+parseFloat(goods.price).toFixed(2)+'</div>\
                       <div class="col-sm-2">'+goods.count+'</div>\
                       </div>'
        })
        _txt+='</div></div>'
    })
    $("#last_30_cont").html(_txt)
    last_orders.forEach(function(val,ind){
        $(".pst_style_in:eq("+ind+")").val(val.pst)
    })
    $(".pst_style_in").off('change').on('change',function(){
        var obj=$(this)
        var _order_id=obj.data('order_id')
        var _pst=obj.val()
        std_ajax('change_pst',{id:_order_id,pst:_pst})
        return false
    })
}
function draw_net_orders(){
    var _txt=''
    net_orders.map(function(order){
        _txt+='<div class="net_order_index"><div class="row" style="background-color:white;padding-right:0.5rem;margin-top:0.5rem;" data-toggle="collapse" href="#order'+order.id+'" aria-expanded="false" aria-controls="collapseExample">\
                   <div class="col-sm-8" style="height: 5rem;line-height: 5rem;"><span class="order_label label label-'+order_style[order.status].style+'">'+order_style[order.status].text+'</span> '+new Date(parseInt(order.stamp) * 1000).Format("yyyy-MM-dd hh:mm:ss")+'</div>\
                   <div class="col-sm-3" style="height: 5rem;line-height: 5rem;">￥'+parseFloat(order.total).toFixed(2)+'元</div>\
                   <div class="col-sm-1" style="height:5rem;text-align: right;"><span style="line-height: 5rem;font-size:3rem ;color: darkgrey" class="aw-icon-angle-right"></span></div>\
                   </div><div class="collapse" style="background-color: #EEEEEE" id="order'+order.id+'">'
        _txt+='<div class="row net_order" style="height: 5rem;text-align:center;margin: 0.5rem">\
                   <div class="col-sm-2 no-gutter"><button class="order_act btn btn-danger btn-lg btn-block" data-status="1">配货</button></div>\
                   <div class="col-sm-2 no-gutter"><button class="order_act btn btn-primary btn-lg btn-block" data-status="2">送货</button></div>\
                   <div class="col-sm-2 no-gutter"><button class="order_act btn btn-success btn-lg btn-block" data-status="3">完成</button></div>\
                   <div class="col-sm-2 no-gutter"><button class="order_act btn btn-default btn-lg btn-block" data-status="4">取消</button></div>\
                   <div class="col-sm-4 no-gutter"><button class="order_act btn btn-warning btn-lg btn-block">打印配货单</button></div>\
                   </div>'
        _txt+='<div style="margin-top: 1px">用户昵称:'+unescape(order.nickname)+'</div>'
        _txt+='<div style="margin-top: 1px">联系电话:'+order.addrs[0].tel+'</div>'
        _txt+='<div style="margin-top: 1px">送货地址:'+order.addrs[0].addr+'</div>'
        _txt+='<div style="margin-top: 1px">用户留言:<span style="color: red">'+JSON.parse(order.memo)+'<span></div>'
        order.orders.map(function(goods){
            _txt+='<div class="row" style="margin-top:1px;background-color: white">\
                       <div class="col-sm-8">'+goods.name+'</div>\
                       <div class="col-sm-2" style="text-align: right">'+parseFloat(goods.price).toFixed(1)+'</div>\
                       <div class="col-sm-2">'+goods.count+'</div>\
                       </div>'
        })
        _txt+='</div></div>'
    })
    $("#net_order_cont").html(_txt)
    net_orders.forEach(function(val,ind){
        $(".net_order:eq("+ind+")").data('order',val)
    })
    $(".net_order .order_act").off('click').on('click',function(){
        var obj=$(this)
        var _label=obj.parents('.net_order_index').find('.order_label')
        var _order=obj.parents('.net_order').data('order')
        var _ind=$(".net_order .order_act").index(this)%5
        var _status=obj.data('status')
        console.log(_ind,_status,order_style[_order.status],order_style[_status])
        switch (parseInt(_ind)){
            case 4:
                print_out(_order);
                break;
            default:
                std_ajax('update_net_orders_status',{id:_order.id,status:_status})
                net_orders.filter(function(item){return item.id==_order.id})[0].status=_status
                _label.removeClass().addClass('order_label label').addClass('label-'+order_style[_status].style).html(order_style[_status].text)
                _order.status=_status
                obj.parents('.net_order').data('order',_order)
                break;
        }
    })
}
function draw_cat(){
    std_ajax('get_cat',{})
        .done(function(cat){
            cats=cat
            var _txt='<option value="0" selected>暂不分类，去手机重新分类</option>'
            cats.filter(function(item){return item.parent_id==0}).map(function(root){
                _txt+='<optgroup label="'+root.cat_name+'">'
                cats.filter(function(item){return item.parent_id==root.cat_id}).map(function(cat){
                    _txt+='<option value='+cat.cat_id+'>'+cat.cat_name+'</option>'
                })
                _txt+='</optgroup>'
            })
            $("#new_cat").html(_txt)
        })
}
function create_goods(bn){
    edit_status=true
    $("#new_goods_alert").html('')
    $("#new_cat").val(0)
    $("#new_goods_modal input").val('')
    $("#new_pvt").val(0)
    $("#new_bn").html(bn)
    $("#new_goods_modal").modal()
    $("#new_name").focus()
    $('#new_goods_modal').off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
        edit_status=false
    })
}
function do_order(){
    order_sw=true
    if(parseFloat($(".total_price").html())>0){
        $("#in_order").html($(".total_price").html())
        $(".refund_price").html('0')
/*
        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","合计金额，人民币"+$(".total_price").html()+"元")}
*/
    }

    if(cur_pos=='#barcode'&&scan_list.length>0){
        $(".order_esc").one('tap',function(){
            order_sw=false
            proc_esc()
        })
        an_order_div(true)
        pre_pos=cur_pos
        cur_pos="#in_order"
        act_pos(cur_pos)
        $("body").off('tap')
    }
}
function an_order_div(status){
    if(status){
        $(".order_div").animate({"right":"42.5%"})
    }
    else{
        $(".order_div").animate({"right":"-57%"})
    }
}
function proc_order(){
    var rtn=$.Deferred()
        var paycode=$("#in_order").html()
        $("#in_order").html('')
        if(!regex.isDecimal(paycode))
        {
            rtn.reject('输入非法');
        }
        else
        {
            if(paycode.length==18){
                hold_on=true
                if(paycode.substr(0,2)>=10&&paycode.substr(0,2)<=15){//微信
                    $(".pay_status").html('微信支付中...')
/*
                    if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","微信刷卡支付中，请稍等")}
*/
                    $(".refund_price").html('')
                    wxpay(paycode)
                        .done(function(){if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","微信刷卡支付成功，谢谢惠顾")};$(".pay_ok").show();rtn.resolve()})
                        .fail(function(e){if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","微信支付失败，请重新支付")};hold_on=false;rtn.reject(e)})
                }
                else{//支付宝
                    $(".pay_status").html('支付宝支付中...')
                    if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","支付宝刷卡支付中，请稍等")}
                    $(".refund_price").html('')
                    alipay(paycode)
                        .done(function(){if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","支付宝刷卡支付成功，谢谢惠顾")};$(".pay_ok").show();rtn.resolve()})
                        .fail(function(e){if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","支付宝支付失败，请重新支付")};hold_on=false;rtn.reject(e)})
                }
            }
            else{//现金及其他记账支付
                if(parseFloat(paycode)<100000){
                    $(".pay_status").html('现金支付')
                    $(".refund_price").html((parseFloat(paycode)-parseFloat($(".total_price").html())).toFixed(2))
                    if(pay_style==0){
                        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","收到现金,"+paycode+"元，找零"+(parseFloat(paycode)-parseFloat($(".total_price").html())).toFixed(2)+"元，"+"支付成功，谢谢惠顾")}
                        open_cash_box().done(function(){rtn.resolve()})
                    }//现金打开钱箱
                    else{
                        if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100","支付成功，谢谢惠顾")}
                        rtn.resolve()
                    }
                }
                else{
                    rtn.reject('输入数字长度错误，可能是扫码错误，请重新扫描客户手机支付码。'+paycode)
                }

            }
        }
    return rtn.promise()
}
function update_order(_out){
    var order={}
    var timestamp = Date.parse(new Date()) / 1000;
    order.txtDate = new Date().Format("yyyy-MM-dd hh:mm:ss")
    order.stamp = timestamp
    order.total = parseFloat($(".total_price").html()).toFixed(2)
    scan_list.map(function(goods){
        delete goods.shop_id
        delete goods.from
    })
    order.order = scan_list
    order.pst = pay_style
    order.out_trade_no=_out
    order.shop_id=shop_id
    order.oper_openid=oper_openid
    std_ajax('update_order',{order:JSON.stringify(order)})
        .done(function(data){
            print_ticket(data.order_id,order)
        })
        .fail(function(){
            print_ticket(order.txtDate,order)
            pool_order(order)
        })
    var p=[]
    goods_to_renew.map(function(goods){
        renew_goods(goods)
        p.push(upload_goods(goods))
    })
    $.when.apply(this,p).done(function(){goods_to_renew=[]})
}
function update_orders(){
    get_all_orders().done(function(orders){
        if(orders.length>0){
            var p=[]
            orders.map(function(order){
                p.push(std_ajax('update_order',{order:JSON.stringify(order)}))
            })
            $.when.apply(this,p).done(function(){
                clear_orders()
            })
        }
    })
}
function proc_net_orders(data){

    if(data.status){//有新单
        $(".net_sign").addClass('net_alert')
        order_mp3.play()
        std_ajax('get_net_orders',{shop_id:shop_id})
            .done(function(orders){
                net_orders=orders
                draw_net_orders()
            })
    }
}
function pool_order(order){
    var rtn =new Promise(function(resolve,reject){
        var req = indexedDB.open("shop");
        req.onerror = function(event) {
            reject('数据库打开错误');
        };
        req.onsuccess = function(event) {
            var db=req.result
            db.transaction("orders","readwrite").objectStore("orders").add(order).onsuccess = function(event) {
                db.close()
                resolve('ok')
            };
        }
    })
    return rtn
}
function get_all_orders(){
    var rtn=$.Deferred()
        var req = indexedDB.open("shop");
        req.onerror = function(event) {
            rtn.reject('数据库打开错误');
        };
        req.onsuccess = function(event) {
            var db=req.result
            db.transaction("orders","readwrite").objectStore("orders").getAll().onsuccess = function(event) {
                rtn.resolve(event.target.result)
                db.close()
            }
        }
    return rtn.promise()
}
function clear_orders(){
    var rtn =new Promise(function(resolve,reject){
        var req = indexedDB.open("shop");
        req.onerror = function(event) {
            reject('数据库打开错误');
        };
        req.onsuccess = function(event) {
            var db=req.result
            db.transaction("orders","readwrite").objectStore("orders").clear()
            db.close()
            resolve('ok')
        }
    })
    return rtn
}
function renew_goods(goods){
    var rtn=$.Deferred()
        if(!goods.pvt){goods.pvt=0}
        if(goods.pvt==0){
            var _ind=goods_pvt.findIndex(function(item){return item.goods_id==goods.goods_id})
            if(_ind!=-1){
                goods_pvt.splice(_ind,1)
                pvt_write().done(function(){
                    draw_scale_goods()
                    draw_no_bn_goods()
                })
            }
            var req = indexedDB.open("shop");
            req.onerror = function(event) {
                rtn.reject('数据库打开错误');
            };
            req.onsuccess = function(event) {
                var db=req.result
                db.transaction(["goods"],"readwrite").objectStore("goods").put(goods).onsuccess = function(event) {
                    db.close()
                    rtn.resolve('ok')
                }
            }
        }
        else{
            if(typeof(goods.pic)=='undefined'|| goods.pic==''){goods.pic='http://yichihui.com/goods_imgs/nopic.png'}
            else{
                goods.pic='http://yichihui.com/goods_imgs/'+goods.pic
            }
            get_local_64(goods).done(function(){
                var pvt=goods_pvt.filter(function(item){return item.goods_id==goods.goods_id})
                if(pvt.length>0){
                    pvt[0].name=goods.name;
                    pvt[0].price=goods.price;
                    pvt[0].cat_id=goods.cat_id
                    pvt[0].pvt=goods.pvt
                    pvt[0].base64=goods.base64
                    pvt[0].pic=goods.pic
                }
                else{
                    var tmp_pvt={}
                    tmp_pvt.goods_id=goods.goods_id
                    tmp_pvt.bn=goods.bn
                    tmp_pvt.name=goods.name
                    tmp_pvt.price=goods.price
                    tmp_pvt.shop_id=shop_id
                    tmp_pvt.cat_id=goods.cat_id
                    tmp_pvt.pvt=goods.pvt
                    tmp_pvt.base64=goods.base64
                    tmp_pvt.pic=goods.pic
                    goods_pvt.push(tmp_pvt)
                }
                pvt_write().done(function(){
                    draw_scale_goods()
                    draw_no_bn_goods()
                })
                rtn.resolve('ok')
            })
        }

    return rtn.promise()
}
function wxpay(paycode){
    var rtn=$.Deferred()
        if(!window.navigator.onLine){reject('网络离线，无法进行微信支付！请让客户扫店内付款码支付');return}
        std_ajax('wxpay',{shop_id:shop_id,total:parseInt(parseFloat($(".total_price").html())*100),cash_code:paycode})
            .done(function(data){
                if(data.status){
                    $("#pay_st_sel td:eq(2)").tap()
                    $("#pay_img").attr('src','/yichi/支付成功.png')
                    $("#pay_txt").text('支付成功！请返回')
                    pay_rem('微信支付',shop_name,parseFloat($(".total_price").html()),function(){})
                    pay_style=2
                    update_order(data.out_trade_no)
                    rtn.resolve()
                }
                else{
                    if(data.msg){
                        rtn.reject(data.msg)
                    }
                    else{
                        rtn.reject('支付失败！您的店铺没有开通支付宝扫码支付功能，请用其他支付方式重新支付！')
                    }
                }
            })
    return rtn.promise()
}
function pay_rem(pay_style,shop_name,price,_func) {
    $.ajax({
        type: "post",
        url: "http://yichihui.com/send_tmp",
        data: {tmp_id:'pay_rem',_data:JSON.stringify({}),shop_name:shop_name,pay_style:pay_style,price:price},
        success: function(data, textStatus) {
            _func(JSON.parse(data))
        }
    });
}
function alipay(paycode){
    var rtn=$.Deferred()
        if(!window.navigator.onLine){reject('网络离线，无法进行支付宝支付！请让客户扫店内付款码支付');return}
        std_ajax('alipay',{shop_id:shop_id,total:parseFloat($(".total_price").html()),cash_code:paycode,memo:shop_name})
            .done(function(data){
                if(data.hasAlipay){
                    var res=data.alipay_trade_pay_response
                    if(res.code==10000){
                        pay_rem('支付宝',shop_name,parseFloat($(".total_price").html()),function(){})
                        pay_style=3
                        update_order(data.out_trade_no)
                        rtn.resolve()
                    }
                    else{
                        if(res.code==10003){
                            $(".pay_status").html('支付宝正在支付,30秒...')
                            std_ajax('alipay_query',{out_trade_no:res.out_trade_no,shop_id:shop_id})
                                .done(function(data){
                                    var query_res=data.alipay_trade_query_response
                                    console.log(query_res,data)
                                    if(query_res.trade_status=='TRADE_SUCCESS'||query_res.trade_status=='TRADE_FINISHED'){
                                        pay_rem('支付宝',shop_name,parseFloat($(".total_price").html()).toFixed(2),function(){})
                                        rtn.resolve()
                                    }
                                    else{
                                        reject('支付失败，系统取消支付'+query_res.trade_status)
                                    }
                                })
                        }
                        else{
                            rtn.reject(res.sub_msg)
                        }
                    }
                }
                else{
                    rtn.reject('支付失败！您的店铺没有开通支付宝扫码支付功能，请用其他支付方式重新支付！')
                }
            })
    return rtn.promise()
}
function do_order_comfirm(){
    cur_pos="#order_confirm"
    act_pos(cur_pos)
    $(".pay_status").html('支付成功，按确认完成')
}
function finish_order(){
    if(nwjs){global.comm.cash(false)}
    if(pay_style!=2&&pay_style!=3){
        update_order('')
    }
    an_order_div(false)
    $("#in_order").html('')
    scan_list=[]
    $(".pay_style:eq(0)").tap()
    $(".all_tmp .yes").fadeOut()
    $(".total_count").html('0')
    $(".total_price").html('0.00')
    $(".pay_status").html('等待支付')
    $(".refund_price").html('')
    $(".pay_ok").hide()
    pay_style=0
    //结账界面清理
    cur_pos=pre_pos
    act_pos(cur_pos)
    if(nwjs){global.comm.send(scan_list)}
    order_sw=false
}
function proc_esc(){
    if(nwjs){global.comm.cash(false)}
    order_sw=false
    if(cur_pos=="#in_order"||(cur_pos=="#order_confirm"&&pay_style!=2&&pay_style!=3)){
        $("#in_order").html('')
        $(".pay_status").html('等待支付')
        $(".refund_price").html('')
        an_order_div(false)
        cur_pos="#barcode"
        act_pos(cur_pos)
        $("body").on('tap',function(){
            var obj=$("#in_count")
            check_in_count(obj)
        })
        return;
    }
    if(cur_pos=="#confirm_modal"){
        $(cur_pos).modal('hide')
        return
    }
    if(cur_pos=="#in_dpay"){
        $("#in_dpay").html('')
        $(".d_cancel").tap()

    }

}
function order_msg(msg){
    error_mp3.play()
    $(".order_msg .msgtxt").html(msg)
    $(".order_msg").fadeIn()
    setTimeout(function(){$(".order_msg").fadeOut()},1000)
}
function del_bill(){
    if(cur_pos=='#barcode'&&scan_list.length>0){
        _confirm('删除订单确认','删除这个订单，系统将会做记录，请再次确认您要删除这个订单')
            .done(function(){
                scan_list=[]
               if(nwjs) {global.comm.send(scan_list)}
                if(goods_to_renew.length>0){
                    var p=[]
                    goods_to_renew.map(function(goods){//将所有需要更新的订单提交，未成功的，下次订单的时候再试
                        renew_goods(goods)
                        p.push(upload_goods(goods))
                    })
                    $.when.apply(this,p).done(function(){goods_to_renew=[]})
                }

                $(".total_price").html('0.00')
                $(".total_count").html('0')
                $(".all_tmp .yes").fadeOut()
            })
            .fail(function(){})
    }
}
function check_in_count(obj){
    var rtn={status:false}
    var _count=obj.html()
    if(!regex.isNum(_count)){
        obj.focus().select()
        obj.popover('show')
        error_mp3.play()
        setTimeout(function(){
            obj.popover('destroy');
            if(_count==''){obj.html('1');act_pos("#barcode")}
        },1000)
    }
    else{
        if(_count<1){obj.html('1')}
        if(_count>99){obj.html('99')}
        act_pos("#barcode")
        rtn.status=true
    }
    return rtn
}
function proc_keypad(_key){
    if(regex.isNum(_key)||_key=='.'||_key=='00'){
        var v=$(cur_pos).html()
        if(detail_status){
            if(detail_first){detail_obj.val(_key);detail_first=false}
            else{
                detail_obj.val(detail_obj.val()+_key)
            }
        }
        else{
            if(order_sw&&cur_pos=="#in_order"){
                $("#in_order").html('');
                v=''
                order_sw=false
            }
            $(cur_pos).html(v+_key)
        }

    }
    else{
        var obj=$(cur_pos)
        var _count=obj.html()
        switch(_key){
            case 'e':
                if(detail_status){
                change_detail(detail_obj)
                }
                else{
                    main_key(13)
                }

                break;
            case 'b':
                if(detail_status){
                if(detail_first){
                    detail_first=false;
                    detail_obj.val('')
                }
                else{
                    detail_obj.val(detail_obj.val().substr(0,detail_obj.val().length-1))
                }
                }
                else{
                    obj.html(_count.substr(0,_count.length-1))
                }

                break;
        }
    }
}
function do_abs(status) {
    if(status){
        $(".abs").animate({right:"0"})
        $(".abs_scale").animate({right:"-41.5%"})
        abs=!abs
    }
    else{
        $(".abs").animate({right:'-40.5%'})
        abs=!abs
    }
}
function tg_abs(){
    do_abs(!abs)
}

var regex = {
    decmal: "^\\d*\\.?\\d{1,}$",
    decmal1: "(?:^-\\d*\\.?\\d{1,}$)|^0$",
    intege: "^-?[1-9]\\d*$",
    intege1: "^[1-9]\\d*$",
    intege2: "^-[1-9]\\d*$",
    num: "(?:^[0-9]\\d*$)|^0$",
    num1: "(?:^-[1-9]\\d*$)|^0$",
    ascii: "^[\\x00-\\xFF]+$",
    chinese: "^[\\u4e00-\\u9fa5]+$",
    color: "^[a-fA-F0-9]{6}$",
    date: "^\\d{4}(\\-|\\/|\.)\\d{1,2}\\1\\d{1,2}$",
    email: "^\\w+((-\\w+)|(\\.\\w+))*\\@[A-Za-z0-9]+((\\.|-)[A-Za-z0-9]+)*\\.[A-Za-z0-9]+$",
    ip4: "^(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)\\.(25[0-5]|2[0-4]\\d|[0-1]\\d{2}|[1-9]?\\d)$",
    letter: "^[A-Za-z]+$",
    letter_l: "^[a-z]+$",
    letter_u: "^[A-Z]+$",
    mobile: "(?:^(?:13|15|18|14)[0-9]{9}$)|(?:^189(\\d{8})+$)",
    notempty: "^\\S+$",
    password: "^[A-Za-z0-9_-]+$",
    picture: "(.*)\\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$",
    qq: "^[1-9]*[1-9][0-9]*$",
    args: "^[&|?]?.*=([^&?]*)&$",
    rar: "(.*)\\.(rar|zip|7zip|tgz)$",
    tel: "(?:^[0-9]{3,4}\-[0-9]{7,8}$)|(?:^[0-9]{7,8}$)",
    url: "^http[s]?:\\/\\/([\\w-]+\\.)+[\\w-]+([\\w-./?%&=]*)?$",
    username: "^[A-Za-z0-9_\\-\\u4e00-\\u9fa5]+$",
    deptname: "^[A-Za-z0-9_()（）\\-\\u4e00-\\u9fa5]+$",
    time: "^((\\d{4}-)(0?[1-9]|1[0-2])-(0?[1-9]|[1-2][0-9]|3[0-1])\\s(([0-1]?[0-9])|(2[0-3])):([0-5]?[0-9])(:[0-5]?[0-9])?)$",
    zipcode: "^\\d{6}$",
    trim: function(chars) {
        chars += "";
        return chars.replace(/(^\s*)|(\s*$)/g, "");
    },
    charTotal: function(chars) {
        var k = 0;
        chars = this.trim(chars);
        for (var i = 0; i < chars.length; i++) {
            if (chars.charCodeAt(i) > 255) {
                k += 2;
            } else {
                k += 1;
            }
        }
        return k;
    },
    isNull: function(chars) {
        if (chars == null) return true;
        if (this.trim(chars).length == 0) return true;
        return false;
    },
    isAcc: function(chars) {
        return new RegExp(this.username).test(this.trim(chars));
    },
    isTime: function(chars) {
        return new RegExp(this.time).test(this.trim(chars));
    },
    isPwd: function(chars) {
        return new RegExp(this.password).test(this.trim(chars));
    },
    isEmail: function(chars) {
        return new RegExp(this.email).test(this.trim(chars));
    },
    isTel: function(chars) {
        return new RegExp(this.tel).test(this.trim(chars));
    },
    isMobile: function(chars) {
        return new RegExp(this.mobile).test(this.trim(chars));
    },
    isNum: function(chars) {
        return new RegExp(this.num).test(this.trim(chars));
    },
    isNum1: function(chars) {
        return new RegExp(this.intege1).test(this.trim(chars));
    },
    isDecimal: function(chars) {
        return new RegExp(this.decmal).test(this.trim(chars));
    },
    isDecimal1: function(chars) {
        return new RegExp(this.decmal1).test(this.trim(chars));
    },
    isDeptName: function(chars) {
        return new RegExp(this.deptname).test(this.trim(chars));
    },
    isChinese: function(chars) {
        return new RegExp(this.chinese).test(this.trim(chars));
    },
    isZip: function(chars) {
        return new RegExp(this.zipcode).test(this.trim(chars));
    },
    isArgs: function(chars) {
        return new RegExp(this.args).test(this.trim(chars));
    },
    isUrl: function(chars) {
        return new RegExp(this.url).test(this.trim(chars));
    },
    delQuery: function(val) {
        var len = arguments.length;
        var uri = len > 1 ? arguments[1] : window.location.search;
        var re = new RegExp("[&|?]?" + val + "=([^&?]*)[&]?", "ig");
        if (uri.match(re)) {
            val = uri.match(re)[0];
            if (val.indexOf('?') != -1) {
                if (uri.length > val.length) return uri.replace(uri.match(re)[0], '?');
                else return uri.replace(uri.match(re)[0], '');
            } else {
                if (regex.isArgs(val)) return uri.replace(uri.match(re)[0], '&');
                else return uri.replace(uri.match(re)[0], '');
            }
        } else return uri;
    },
    getQuery: function(val) {
        var len = arguments.length;
        var uri = len > 1 ? arguments[1] : window.location.search;
        var re = new RegExp("[&?]+" + val + "=([^&?]*)", "ig");
        return ((uri.match(re)) ? (uri.match(re)[0].substr(val.length + 2)) : '');
    }
};
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function redraw_tmp_list(){
    proc_esc()
    var _trip=false
    var _txt='<thead style="background-color: rgba(0,153,51,0.67);color: white;font-size: 2rem" class="tmp_list">\
        <td align="center" style="width: 55%">商品名</td>\
        <td align="center" style="width: 15%">单价</td>\
        <td align="center" style="width: 10%;">数量</td>\
        <td align="center" style="width: 15%">小计</td>\
        <td align="center" style="width: 5%"></td>\
        </thead>'
    scan_list.map(function(goods){
        var _tp_txt="trip"
        !_trip;
        if(_trip){_tp_txt=''}
        if(goods.from){
            _txt+='<tr class="table-bordered yes '+_tp_txt+'">'
        }
        else{
            _txt+='<tr class="table-bordered yes from_all '+_tp_txt+'">'
        }
        _txt+=' <td class="table-bordered can" align="center" style="width: 55%" data-goods_id='+goods.goods_id+' data-can="name" data-detail='+goods.name+'>'+goods.name+'</td>\
            <td class="table-bordered can" align="right" style="width: 15%"  data-goods_id='+goods.goods_id+' data-can="price" data-detail='+goods.price+'>'+parseFloat(goods.price).toFixed(2)+'</td>\
            <td class="table-bordered can" align="center" style="width: 10%;"  data-goods_id='+goods.goods_id+' data-can="count" data-detail='+goods.count+'>'+goods.count+'</td>\
            <td class="table-bordered" align="right" style="width: 15%">'+parseFloat(goods.total).toFixed(2)+'</td>\
            <td class="table-bordered del_tmp" data-goods_id='+goods.goods_id+' data-detail='+goods.name+' align="center" style="width: 5%"><img style="width:3rem" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACeVBMVEUAAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAAAAAABIeguUAAAA0XRSTlMAB70OB8LfDTdtAAfC2gtQnQUHwtQKbtYUB8LPCQKQQAfCyQgJt0O4xAcV40cIrr8GJUoBhLkFOk1gtARTUEGvAwBxVCmqAwOUVxbkpQIKvFsJtKECFuhfAomcASdiZJdmRWosbhjrcgq6dhjsgSl9P3hZdAB4cASckMBsDMSUAQOTaBnxmQEAbWUrngFMYUGjAjJdXKcCHfhZAHysAw3GVgWgsQQEmVINybcFAHJPLrwFUEwvwQY1SC/GBx8fL8wID8xPL9EJBZ5PL9YLAHYuDJa1m1UAAAABYktHRACIBR1IAAAAB3RJTUUH4QMQEhMNBokF+QAAAgZJREFUSMdjYBhGgJGJmST1LKwX2djxKeC4yMmFxOXmuXjxIi8fbvX8QHkBQThXSPgiCIiI4lIvBpYXl4ByJaUuQoC0DFblsnJQeXkIX0HxIgwoKWNRr6IKlVWDCqhfRAANTQz1WtpQOR2YiK4ekg59AzT1hjAZI4SYsQmSDlMzFPXmMHELFGFLJB1W1kgSNjBRWzSL7ZB02DvARB2dYGLOGF5zQdLh6gYRc/eAiXhiCTwvb4QOH1+QiJ8/jB+ANXoCgxA6gkMYGELDYLxwHPEfEYnQERUdA2fHMuAEcQgd8XBWAgMekHgRAyQx4AXJ6OpTGAiA1DQU9emE1DMwZGQiqc8irJ6BITsHrj6XGPV5yC7KJ6y+ANXPhYTUF6GHUjFe5SWlmPFQhkd9eQVCXWUVjFWNU31NLUJ9XX1DI4zdhEN9cwtCfWsbA0N7B4zXiVV9F5K7u3vAQr0wfh8W9f1I6idMhApOgolMxlA/BUn91Glw4ekzoGIzUZXPmo2kfs5cJJl586GiC5DVL1yEpH7xEhSzli6Dii9HiK1YiaR+1Wo0x65ZC5VZBxdaj6R+w0bM8NgEldsMF9kCV791G7YQ3w6V3QEX2QkV2bUbe5zugcrvhYvsA/P3H8CVag4eAskfRhI5AuQfPcaAExw/cfHiSRSRUxdPn2HAA86eO4kmcv4CwxAFAGqaNq1Uhib3AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAzLTE2VDE4OjE5OjEzKzA4OjAwqqCxfAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMy0xNlQxODoxOToxMyswODowMNv9CcAAAAAASUVORK5CYII="></td></tr>'
    })
    $('.all_tmp').html(_txt)
    draw_total()
}
function add_tmp_list(goods){
    var _txt=''
    var _count=parseInt($("#in_count").html())
    $(".goods_refund").removeClass('button-highlight')
    goods.count=_count
    if(!goods.total){goods.total=parseFloat(goods.price*goods.count)}
    goods.total=goods.total*goods_refund
    goods.count=goods.count*goods_refund

    goods_refund=1
    var _g=scan_list.filter(function(item){return item.goods_id==goods.goods_id})
    if(_g.length==0){
        if(goods.goods_id==0){goods.price=goods.price*_count;goods.count=1}
        scan_list.unshift(goods)
        if(goods.from){
            if($(".all_tmp tr:eq(1)").hasClass('trip')){
                _txt='<tr class="table-bordered yes">'
            }
            else{
                _txt='<tr class="table-bordered yes trip">'
            }
        }
        else{
            if(!goods_to_renew.some(function(item){return item.goods_id==goods.goods_id})){
                goods_to_renew.push(goods)
            }
            warn_mp3.play()
            if($(".all_tmp tr:eq(1)").hasClass('trip')){
                _txt='<tr class="table-bordered yes from_all">'
            }
            else{
                _txt='<tr class="table-bordered yes from_all trip">'
            }
        }
        _txt+='<td class="table-bordered can" align="center" style="width: 55%" data-goods_id='+goods.goods_id+' data-can="name" data-detail='+goods.name+'>'+goods.name+'</td>\
            <td class="table-bordered can" align="right" style="width: 15%" data-goods_id='+goods.goods_id+' data-can="price" data-detail='+goods.price+'>'+parseFloat(goods.price).toFixed(2)+'</td>\
            <td class="table-bordered can" align="center" style="width: 10%;" data-goods_id='+goods.goods_id+' data-can="count" data-detail='+goods.count+'>'+goods.count+'</td>\
            <td class="table-bordered" align="right" style="width: 15%">'+goods.total.toFixed(2)+'</td>\
            <td class="table-bordered del_tmp" data-goods_id='+goods.goods_id+' data-detail='+goods.name+'  align="center" style="width: 5%"><img style="width:3rem" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACeVBMVEUAAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAAAAAABIeguUAAAA0XRSTlMAB70OB8LfDTdtAAfC2gtQnQUHwtQKbtYUB8LPCQKQQAfCyQgJt0O4xAcV40cIrr8GJUoBhLkFOk1gtARTUEGvAwBxVCmqAwOUVxbkpQIKvFsJtKECFuhfAomcASdiZJdmRWosbhjrcgq6dhjsgSl9P3hZdAB4cASckMBsDMSUAQOTaBnxmQEAbWUrngFMYUGjAjJdXKcCHfhZAHysAw3GVgWgsQQEmVINybcFAHJPLrwFUEwvwQY1SC/GBx8fL8wID8xPL9EJBZ5PL9YLAHYuDJa1m1UAAAABYktHRACIBR1IAAAAB3RJTUUH4QMQEhMNBokF+QAAAgZJREFUSMdjYBhGgJGJmST1LKwX2djxKeC4yMmFxOXmuXjxIi8fbvX8QHkBQThXSPgiCIiI4lIvBpYXl4ByJaUuQoC0DFblsnJQeXkIX0HxIgwoKWNRr6IKlVWDCqhfRAANTQz1WtpQOR2YiK4ekg59AzT1hjAZI4SYsQmSDlMzFPXmMHELFGFLJB1W1kgSNjBRWzSL7ZB02DvARB2dYGLOGF5zQdLh6gYRc/eAiXhiCTwvb4QOH1+QiJ8/jB+ANXoCgxA6gkMYGELDYLxwHPEfEYnQERUdA2fHMuAEcQgd8XBWAgMekHgRAyQx4AXJ6OpTGAiA1DQU9emE1DMwZGQiqc8irJ6BITsHrj6XGPV5yC7KJ6y+ANXPhYTUF6GHUjFe5SWlmPFQhkd9eQVCXWUVjFWNU31NLUJ9XX1DI4zdhEN9cwtCfWsbA0N7B4zXiVV9F5K7u3vAQr0wfh8W9f1I6idMhApOgolMxlA/BUn91Glw4ekzoGIzUZXPmo2kfs5cJJl586GiC5DVL1yEpH7xEhSzli6Dii9HiK1YiaR+1Wo0x65ZC5VZBxdaj6R+w0bM8NgEldsMF9kCV791G7YQ3w6V3QEX2QkV2bUbe5zugcrvhYvsA/P3H8CVag4eAskfRhI5AuQfPcaAExw/cfHiSRSRUxdPn2HAA86eO4kmcv4CwxAFAGqaNq1Uhib3AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAzLTE2VDE4OjE5OjEzKzA4OjAwqqCxfAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMy0xNlQxODoxOToxMyswODowMNv9CcAAAAAASUVORK5CYII="></td></tr>'
        $('.tmp_list').after(_txt)
    }
    else{
        if(goods.goods_id==0){
            _g[0].total+=goods.total
        }
        else{
            _g[0].count+=goods.count
            _g[0].total+=goods.total
        }
        goods=_g[0]
        var _ind=scan_list.findIndex(function(item){return item.goods_id==goods.goods_id})
        if((goods.count==0&&goods.goods_id==0)||goods.total==0){
            $(".all_tmp tr:eq("+(_ind+1)+")").remove()
            scan_list.splice(_ind,1)
        }
        else{
            _txt+='<td class="table-bordered can" align="center" style="width: 55%" data-goods_id='+goods.goods_id+' data-can="name">'+goods.name+'</td>\
            <td class="table-bordered can" align="right" style="width: 15%" data-goods_id='+goods.goods_id+' data-can="price">'+parseFloat(goods.price).toFixed(2)+'</td>\
            <td class="table-bordered can" align="center" style="width: 10%;" data-goods_id='+goods.goods_id+' data-can="count">'+goods.count+'</td>\
            <td class="table-bordered" align="right" style="width: 15%">'+parseFloat(goods.total).toFixed(2)+'</td>\
            <td class="table-bordered del_tmp" align="center" data-goods_id='+goods.goods_id+' data-detail='+goods.name+' style="width: 5%"><img style="width:3rem" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACeVBMVEUAAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAADiAAAAAABIeguUAAAA0XRSTlMAB70OB8LfDTdtAAfC2gtQnQUHwtQKbtYUB8LPCQKQQAfCyQgJt0O4xAcV40cIrr8GJUoBhLkFOk1gtARTUEGvAwBxVCmqAwOUVxbkpQIKvFsJtKECFuhfAomcASdiZJdmRWosbhjrcgq6dhjsgSl9P3hZdAB4cASckMBsDMSUAQOTaBnxmQEAbWUrngFMYUGjAjJdXKcCHfhZAHysAw3GVgWgsQQEmVINybcFAHJPLrwFUEwvwQY1SC/GBx8fL8wID8xPL9EJBZ5PL9YLAHYuDJa1m1UAAAABYktHRACIBR1IAAAAB3RJTUUH4QMQEhMNBokF+QAAAgZJREFUSMdjYBhGgJGJmST1LKwX2djxKeC4yMmFxOXmuXjxIi8fbvX8QHkBQThXSPgiCIiI4lIvBpYXl4ByJaUuQoC0DFblsnJQeXkIX0HxIgwoKWNRr6IKlVWDCqhfRAANTQz1WtpQOR2YiK4ekg59AzT1hjAZI4SYsQmSDlMzFPXmMHELFGFLJB1W1kgSNjBRWzSL7ZB02DvARB2dYGLOGF5zQdLh6gYRc/eAiXhiCTwvb4QOH1+QiJ8/jB+ANXoCgxA6gkMYGELDYLxwHPEfEYnQERUdA2fHMuAEcQgd8XBWAgMekHgRAyQx4AXJ6OpTGAiA1DQU9emE1DMwZGQiqc8irJ6BITsHrj6XGPV5yC7KJ6y+ANXPhYTUF6GHUjFe5SWlmPFQhkd9eQVCXWUVjFWNU31NLUJ9XX1DI4zdhEN9cwtCfWsbA0N7B4zXiVV9F5K7u3vAQr0wfh8W9f1I6idMhApOgolMxlA/BUn91Glw4ekzoGIzUZXPmo2kfs5cJJl586GiC5DVL1yEpH7xEhSzli6Dii9HiK1YiaR+1Wo0x65ZC5VZBxdaj6R+w0bM8NgEldsMF9kCV791G7YQ3w6V3QEX2QkV2bUbe5zugcrvhYvsA/P3H8CVag4eAskfRhI5AuQfPcaAExw/cfHiSRSRUxdPn2HAA86eO4kmcv4CwxAFAGqaNq1Uhib3AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE3LTAzLTE2VDE4OjE5OjEzKzA4OjAwqqCxfAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNy0wMy0xNlQxODoxOToxMyswODowMNv9CcAAAAAASUVORK5CYII="></td>'
            $(".all_tmp tr:eq("+(_ind+1)+")").html(_txt)
        }
    }
    draw_total()
}
function draw_total(){
    var total_price=0
    var total_count=0
    scan_list.map(function(goods){
        total_price+=goods.total
        if(goods.goods_id!=0){total_count+=goods.count}
    })
    $(".total_price").html(parseFloat(total_price).toFixed(2))
    $(".total_count").html(total_count)
}
function query_bn(bn){
    console.log('query_bn',bn)
    var rtn=$.Deferred()
        var pvt=goods_pvt.filter(function(item){return item.bn==bn&&item.pvt>1})///店铺自有商品
        if(pvt.length>0){
            var _p={}
            _p.from=true
            _p.goods_id=pvt[0].goods_id
            _p.price=pvt[0].price
            _p.total=pvt[0].price
            _p.goods_id=pvt[0].goods_id
            _p.shop_id=pvt[0].shop_id
            _p.cat_id=pvt[0].cat_id
            _p.name=pvt[0].name
            rtn.resolve(_p)
        }
        else{
            var req = indexedDB.open("shop");
            req.onerror = function(event) {
                rtn.reject('数据库打开错误');
            };
            req.onsuccess = function(event) {
                var db=req.result;
                var transaction = db.transaction(['goods'], "readwrite");
                transaction.onerror = function (event) {
                    db.close()
                    rtn.reject(event)
                };
                var tb = transaction.objectStore('goods')
                var boundKeyRange = IDBKeyRange.only(bn);
                tb.index("bn").openCursor(boundKeyRange).onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        cursor.value.from = true
                        delete cursor.value.count;
                        delete cursor.value.total;
                        rtn.resolve(cursor.value)
                        db.close()
                    }
                    else {
                        transaction = req.result.transaction(['all_goods'], "readwrite");
                        tb = transaction.objectStore('all_goods')
                        boundKeyRange = IDBKeyRange.only(bn);
                        tb.index("bn").openCursor(boundKeyRange).onsuccess = function (event) {
                            var cursor = event.target.result;
                            if (cursor) {
                                cursor.value.from = false
                                delete cursor.value.count;
                                delete cursor.value.total;
                                rtn.resolve(cursor.value)
                                db.close
                            }
                            else {
                                if(bn.length==13){
                                    var pvt=goods_pvt.filter(function(item){return item.bn==bn.substr(0,item.bn.length)})
                                    if(pvt.length>0){
                                        var _p={}
                                        _p.from=true
                                        //_p.count=(bn.substr(7,5)/100/pvt[0].price).toFixed(3)
                                        _p.bn=bn.substr(0,7);
                                        _p.goods_id=pvt[0].goods_id
                                        _p.price=pvt[0].price
                                        _p.total=bn.substr(7,5)/100
                                        _p.shop_id=pvt[0].shop_id
                                        _p.cat_id=pvt[0].cat_id
                                        _p.name=pvt[0].name
                                        rtn.resolve(_p)
                                        db.close
                                    }
                                    else{
                                        rtn.reject('没有数据')
                                        db.close()
                                    }
                                }
                                else{
                                    if(bn.length==7){
                                        console.log('PVT=7')
                                        var pvt=goods_pvt.filter(function(item){return item.bn==bn})
                                        if(pvt.length>0){
                                            var _p={}
                                            _p.from=true
                                            //_p.count=(bn.substr(7,5)/100/pvt[0].price).toFixed(3)
                                            _p.goods_id=pvt[0].goods_id
                                            _p.price=pvt[0].price
                                            _p.total='0.00'
                                            _p.goods_id=pvt[0].goods_id
                                            _p.shop_id=pvt[0].shop_id
                                            _p.cat_id=pvt[0].cat_id
                                            _p.name=pvt[0].name
                                            console.log('_pvt:',_p)
                                            rtn.resolve(_p)
                                            db.close
                                        }
                                        else{
                                            rtn.reject('没有数据')
                                            db.close()
                                        }
                                    }
                                    else{
                                        rtn.reject('没有数据')
                                        db.close()
                                    }

                                }

                            }
                        }
                    }
                }
            }
        }

    return rtn.promise()
}
function do_create_structs(db_name){
    var objs=[
        {name:"goods",keypath:{keyPath:"goods_id"},index:[{index_name:"shop_id",unique: false},{index_name:"bn",unique: false},{index_name:"name",unique: false}]},
        {name:"all_goods",keypath:{keyPath:"goods_id"},index:[{index_name:"shop_id",unique: false},{index_name:"bn",unique: false},{index_name:"name",unique: false}]},
        {name:"orders",keypath:{keyPath:"id",autoIncrement: true},index:[{index_name:"txtDate",unique:false}]},
    ]
    var rtn=$.Deferred()
        var del=indexedDB.deleteDatabase(db_name)
        del.onsuccess=function(event){
            var req = indexedDB.open(db_name,in_version);
            req.onerror = function(event) {
                rtn.reject('创建数据库：'+db_name+'错误，代码:'+event.target.error.message)
            };
            req.onupgradeneeded=function(event){
                var cur_db=event.target.result
                objs.map(function(obj){
                    var store=cur_db.createObjectStore(obj.name,obj.keypath)
                    obj.index.map(function(index){
                        store.createIndex(index.index_name,index.index_name,{unique:index.unique})
                    })
                })
                rtn.resolve()
            }
        }
        del.onerror=function(event){
            rtn.reject('无法删除旧数据库，建库失败')
        }
    return rtn.promise()
}
function refresh_goods(){
    window.localStorage.removeItem('last_goods')
    get_shop_goods(shop_id)
}
function get_shop_goods(shop_id){
    wait_mp3.play()
   get_db()
        .done(function(status){
            if(status){
                std_ajax('get_shop_goods',{shop_id:shop_id})
                    .done(function(goods){
                        last_goods=Date.parse(new Date())/1000
                        window.localStorage.setItem('last_goods',last_goods)
                        goods_pvt=goods.pvt;
                        var p=[]
                        goods_pvt.map(function(pvt){
                            if(typeof(pvt.base64)=='undefined'){
                                p.push(get_local_64(pvt))
                            }
                        })
                        $.when.apply(this,p).always(function(){
                            console.log('获取图像了')
                            pvt_write().always(function(){
                                console.log('写数据完成')
                                draw_scale_goods()
                                draw_no_bn_goods()
                            })
                            })
                        F1_msg('商品数据写入本地数据库');
                        return write_db(goods)
                    })
                    .done(function(){F1_msg('优化商品检索速度');return query_bn('鬼')})
                    .done(function(){;wait_mp3.pause();ready_mp3.play();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');$(".start_btn").focus()})
                    .fail(function(e){wait_mp3.pause();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');ready_mp3.play();;$(".start_btn").focus()})
            }
            else{
                get_new_goods()
                    .done(function(){
                        F1_msg('优化商品检索速度');
                        query_bn('鬼')
                            .done(function(){wait_mp3.pause();ready_mp3.play();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');$(".start_btn").focus()})
                            .fail(function(e){wait_mp3.pause();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');ready_mp3.play();$(".start_btn").focus()})
                    })
                    .fail(function(){
                        F1_msg('优化商品检索速度');
                        query_bn('鬼')
                            .done(function(){wait_mp3.pause();ready_mp3.play();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');$(".start_btn").focus()})
                            .fail(function(e){wait_mp3.pause();F1_msg('<button class="btn btn-danger btn-lg start_btn" onclick="F1_click()">初始化完成 点击进入系统</button>');ready_mp3.play();$(".start_btn").focus()})
                    })
            }
       })
}
function get_new_goods(){
    last_goods=window.localStorage.getItem('last_goods')
    var rtn=$.Deferred()
        std_ajax('get_new_goods',{shop_id:shop_id,last_goods:last_goods})
            .done(function(goods){
                last_goods=Date.parse(new Date())/1000
                window.localStorage.setItem('last_goods',last_goods)
                var p=[]
                goods.map(function(good){
                    p.push(renew_goods(good))
                })
                $.when.apply(this,p).done(function(){rtn.resolve()})
            })
            .fail(function(){rtn.reject()})
    return rtn.promise()
}
function get_db(){
    var rtn=$.Deferred()
        var req = indexedDB.open("shop");
        req.onerror = function(event) {
            rtn.reject('数据库打开错误');
        };
        req.onsuccess = function(event) {
            if(req.result.version< in_version){
                req.result.close()
                do_create_structs("shop")
                    .done(function(){rtn.resolve(true)})
                    .fail(function(e){rtn.reject(e)})
            }
            else{
                if(window.localStorage.getItem('last_goods')==null){
                    rtn.resolve(true)
                }
                else{
                    rtn.resolve(false)
                }
            }
        };

    return rtn.promise()
}
function write_db(goods){
    var rtn=$.Deferred()
        var req = indexedDB.open("shop");
        req.onerror = function(event) {
            rtn.reject('数据库打开错误');
        };
        req.onsuccess = function(event) {
            db=req.result
            var transaction = req.result.transaction("goods", "readwrite");
            transaction.onerror = function (event) {
                rtn.reject(event)
            };
            var tb = transaction.objectStore('goods')
            tb.clear().onsuccess = function(event) {
                goods.goods.map(function(good){
                    var req=tb.put(good);
                })
            };
            var transaction_1 = req.result.transaction("all_goods", "readwrite");
            var tb1 = transaction_1.objectStore('all_goods')
            tb1.clear().onsuccess = function(event) {

                goods.all_goods.map(function (good) {
                    var req = tb1.put(good);
                })
            }
            req.result.close()
            rtn.resolve('ok')
        }
    return rtn.promise()
}
function _confirm(title,msg){
    ask_mp3.play()
    pre_pos=cur_pos
    cur_pos="#confirm_modal"
    $("#confirm_modal .modal-title").html(title)
    $("#confirm_modal .modal-body").html(msg)
    $("#confirm_modal").modal()
    $("body").off('tap')
    var rtn=$.Deferred()
        $('#confirm_modal').off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
            act_pos(pre_pos)
            rtn.reject()
            $("body").off('tap').on('tap',function(){
                var obj=$("#in_count")
                check_in_count(obj)
            })
        })
        $('#confirm_modal .m_ok').off('tap').one('tap', function (e) {
            $('#confirm_modal').off('hidden.bs.modal')
            act_pos(pre_pos)
            rtn.resolve()
            $("#confirm_modal").modal('hide')
            $("body").off('tap').on('tap',function(){
                var obj=$("#in_count")
                check_in_count(obj)
            })
        })
    return rtn.promise()
}
function std_ajax(opt,_data) {
        var rtn=$.Deferred()
        _data.rand_plus=Math.random();
        $.ajax({
            type: "post",
            url: "http://yichihui.com/nc/"+opt,
            data: _data
        })
            .done(function(data){rtn.resolve(data)})
            .fail(function(){rtn.reject('获取数据错误'+opt)})
    return rtn.promise()
}
function print_ban(data){
    if(typeof(LODOP)!='undefined'&&P_status){
        var pst=[0,0,0,0,0]
        var pay=parseFloat($("#ban_pay").val())
        var total=0
        var in_cash=parseFloat($("#ban_cash").val())
        var in_card=parseFloat($("#ban_card").val())
        var in_other=parseFloat($("#ban_other").val())
        var in_wex=parseFloat($("#ban_wex").val())
        var in_ali=parseFloat($("#ban_ali").val())
        var act=in_cash+in_card+in_other+in_wex+in_ali
        var s_total=0
        data.data.map(function(d){
            if(d.pst!=2&&d.pst!=3){s_total+=d.total}
            total+=d.total
            pst[d.pst]+=d.total
        })
        LODOP.PRINT_INIT("test")
        LODOP. SET_PRINTER_INDEX(print_name)
        LODOP.SET_PRINT_PAGESIZE(0,parseInt(print_mode)*10,0,'')
        LODOP.SET_PRINT_STYLE('FontName','微软雅黑 Light')
        LODOP.SET_PRINT_STYLE('Alignment',2)
        LODOP.SET_PRINT_STYLE('Bold',0)
        LODOP.SET_PRINT_STYLE('FontSize',12)
        LODOP.ADD_PRINT_TEXT(0,0,'100%','BottomMargin:0mm',shop_name)//如果不换行，会直接覆盖，这样便于定位做格式。
        LODOP.SET_PRINT_STYLE('Alignment',2)
        LODOP.SET_PRINT_STYLE('Bold',0)
        LODOP.SET_PRINT_STYLE('FontSize',8)
        LODOP.ADD_PRINT_TEXT(20,0,'100%','BottomMargin:0',"交接班凭证")
        LODOP.ADD_PRINT_LINE(38,0,38,'100%',0,2)
        LODOP.SET_PRINT_STYLE('Alignment',1)
        LODOP.ADD_PRINT_TEXT(40,10,'100%','BottomMargin:0',"上："+data.time.on_time)
        LODOP.ADD_PRINT_TEXT(56,10,'100%','BottomMargin:0',"下："+data.time.off_time)
        LODOP.ADD_PRINT_TEXT(72,10,'100%','BottomMargin:0',"交　班　人："+nickname)
        LODOP.ADD_PRINT_TEXT(88,10,'100%','BottomMargin:0',"当班营业额："+parseFloat(total).toFixed(2))
        LODOP.ADD_PRINT_TEXT(104,10,'100%','BottomMargin:0',"现金营业额："+parseFloat(pst[0]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(120,10,'100%','BottomMargin:0',"刷卡营业额："+parseFloat(pst[1]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(136,10,'100%','BottomMargin:0',"微信扫码额："+parseFloat(pst[2]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(152,10,'100%','BottomMargin:0',"支付宝扫码："+parseFloat(pst[3]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(168,10,'100%','BottomMargin:0',"其他营业额："+parseFloat(pst[4]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(184,10,'100%','BottomMargin:0',"微信转账额："+parseFloat(pst[4]).toFixed(2))
        LODOP.ADD_PRINT_TEXT(200,10,'100%','BottomMargin:0',"支付宝转账："+parseFloat(pst[4]).toFixed(2))

        LODOP.ADD_PRINT_LINE(216,0,216,'100%',0,2)
        LODOP.SET_PRINT_STYLE('FontSize',12)
        LODOP.ADD_PRINT_TEXT(250,10,'100%','BottomMargin:0',"合计收入额："+parseFloat(total).toFixed(2))
        LODOP.ADD_PRINT_TEXT(300,10,'100%','BottomMargin:0',"合计支出额："+parseFloat(pay).toFixed(2))
        LODOP.ADD_PRINT_TEXT(350,10,'100%','BottomMargin:0',"清点现金数："+parseFloat(in_cash).toFixed(2))
        LODOP.ADD_PRINT_TEXT(400,10,'100%','BottomMargin:0',"清点刷卡数："+parseFloat(in_card).toFixed(2))
        LODOP.ADD_PRINT_TEXT(450,10,'100%','BottomMargin:0',"清点其他数："+parseFloat(in_other).toFixed(2))
        LODOP.ADD_PRINT_TEXT(500,10,'100%','BottomMargin:0',"微信转账数："+parseFloat(in_wex).toFixed(2))
        LODOP.ADD_PRINT_TEXT(550,10,'100%','BottomMargin:0',"支付宝转账："+parseFloat(in_ali).toFixed(2))
        LODOP.ADD_PRINT_TEXT(600,10,'100%','BottomMargin:0',"　收支差额："+parseFloat(act-s_total+pay).toFixed(2))
        LODOP.ADD_PRINT_TEXT(650,10,'100%','BottomMargin:0',"交班人："+'_________签名')
        LODOP.ADD_PRINT_TEXT(700,10,'100%','BottomMargin:0',"接班人："+'_________签名')
        if(P_debug){
            LODOP.PREVIEW()
        }
        else{
            LODOP.PRINT()
        }

    }
}
function print_prev(){
    if(typeof(pre_id)!='undefined'&&P_status){
        var _P=P_ON
        P_ON=true
        print_ticket(pre_id,pre_order)
            .done(function(){
                P_ON=_P
            })
    }
}
function print_lbc(){
    LODOP.PRINT_INIT("test1")
    LODOP.SET_PRINTER_INDEX(print_barcode)
    LODOP.SET_PRINT_PAGESIZE(1,0,0,'')
    LODOP.SET_PRINT_STYLE('Angle',180)
    LODOP.SET_PRINT_STYLE('FontName','微软雅黑')
    LODOP.SET_PRINT_STYLE('FontSize',10)
    LODOP.SET_PRINT_STYLE('Alignment',1)
    LODOP.ADD_PRINT_TEXT('32mm','65mm','100%','BottomMargin:0',"测试商品可口可乐330")
    LODOP.ADD_PRINT_BARCODE('7mm','35mm','30mm','8mm',"128Auto","123456789012");
    LODOP.SET_PRINT_STYLE('FontSize',24)
    LODOP.SET_PRINT_STYLE('FontName','微软雅黑')
    LODOP.ADD_PRINT_TEXT('25mm','30mm','100%','BottomMargin:0',"128.00")
    LODOP.PREVIEW()
}

function print_out(data){
    if(typeof(LODOP)!='undefined'&&P_status){
        var addr=data.addrs[0]
        var goods=data.orders
        var p_width=parseInt(print_mode)*10
        LODOP.PRINT_INIT("test")
        LODOP.SET_PRINTER_INDEX(print_name)
        LODOP.SET_PRINT_PAGESIZE(0,p_width,0,'')
        LODOP.SET_PRINT_STYLE('FontName','微软雅黑 Light')
        LODOP.SET_PRINT_STYLE('Alignment',2)
        LODOP.SET_PRINT_STYLE('Bold',0)
        LODOP.SET_PRINT_STYLE('FontSize',12)
        LODOP.ADD_PRINT_TEXT(0,0,'100%','BottomMargin:0mm',shop_name)//如果不换行，会直接覆盖，这样便于定位做格式。
        LODOP.SET_PRINT_STYLE('Alignment',2)
        LODOP.SET_PRINT_STYLE('Bold',0)
        LODOP.SET_PRINT_STYLE('FontSize',8)
        LODOP.ADD_PRINT_TEXT(20,0,'100%','BottomMargin:0',"外送备货单")
        LODOP.ADD_PRINT_LINE(38,0,38,'100%',0,1)
        LODOP.SET_PRINT_STYLE('Alignment',1)
        LODOP.ADD_PRINT_TEXT(40,10,'100%','BottomMargin:0',"时间："+new Date(parseInt(data.stamp) * 1000).Format("yyyy-MM-dd hh:mm:ss"))
        LODOP.ADD_PRINT_TEXT(56,10,'100%','BottomMargin:0',"姓名："+unescape(data.nickname))
        LODOP.ADD_PRINT_TEXT(72,10,'100%','BottomMargin:0',"电话："+addr.tel)
        LODOP.ADD_PRINT_TEXT(88,10,'100%','BottomMargin:0',"地址："+addr.addr)
        LODOP.ADD_PRINT_TEXT(120,10,'100%','BottomMargin:0',"备注："+data.memo)
        LODOP.ADD_PRINT_LINE(152,0,152,'100%',0,1)
        var _txt='<table width="100%"><thead style="font-size: 0.8rem"><td width="70%" align="center">商品名称</td><td width="15%" align="center" >数</td><td width="15%" align="center">价</td></thead>'
        var total=0
        goods.map(function(goods){
            total+=goods.price*goods.count
            _txt+='<tr align="center" style="font-size: 0.8rem"><td >'+goods.name+'</td><td>'+goods.count+'</td><td >'+parseFloat(goods.price).toFixed(2)+'</td></tr>'
        })
        _txt+='<tr><td align="center" style="font-size:1rem;font-family: 微软雅黑 Light;font-weight: 500">合计金额</td><td colspan="2" align="center" style="font-size:1rem;font-family: 微软雅黑 Light;font-weight: 500">'+parseFloat(total).toFixed(2)+'</td></tr>'
        _txt+='</table><div style="text-align: center"><p><span style="font-size: 0.5rem;font-style: italic">以上商品仅供备货参考，不是最终送货收款凭证</span></p></div>'
        LODOP.ADD_PRINT_HTM(154,'-4mm',print_mode+'mm','BottomMargin:10mm',_txt)
        if(P_debug){
            LODOP.PREVIEW()
        }
        else{
            LODOP.PRINT()
        }
    }


}
function print_namecard(){
    if(typeof(LODOP)!='undefined'&&P_status){
        LODOP.PRINT_INIT("test")
        LODOP.SET_PRINTER_INDEX(print_name)
        LODOP.SET_PRINT_PAGESIZE(0,parseInt(print_mode)*10,0,'')
        var _txt='<div style="text-align: center;font-family: 微软雅黑 Light">\
            <p><span style="font-weight: 500">打开微信，扫一扫</span></p>\
                <img src="'+qr_base64+'" style="width:70%;max-width: 100pt">\
                <p><span style="font-weight: 500">'+shop_name+'</span></p>\
                <div style="text-align:left;padding-left: 1rem">\
                <span style="font-size: smaller">地址:'+shop_detail.addr+'</span>\
            </div>\
            <div style="text-align: left;padding-left: 1rem">\
                <span style="font-size:smaller;font-family: monospace" >送货电话:</span><span style="font-size: small;font-weight: bold;font-family: monospace">'+shop_detail.order_tel+'</span>\
            </div>\
            </div><p></p>'
        LODOP.ADD_PRINT_HTM('10mm','0','100%','BottomMargin:10mm',_txt)
        if(P_debug){
            LODOP.PREVIEW()
        }
        else{
            LODOP.PRINT()
        }
    }
}
function print_ticket(order_id,order){
    var rtn=$.Deferred()
        pre_id=order_id
        pre_order=order
        if(!P_ON){
            return}
        if(typeof(LODOP)!='undefined'&&P_status){
            LODOP.PRINT_INIT("test")
            LODOP.SET_PRINTER_INDEX(print_name)
            LODOP.SET_PRINT_PAGESIZE(0,parseInt(print_mode)*10,0,'')
            var _txt='<div style="font-size:smaller;text-align:center;font-family:微软雅黑">\
                    <p><span style="font-weight: 600;font-size: small">'+shop_name+'</span></p>\
                    <p>收银条</p>\
                    <div style="text-align: left;padding-left: 1rem">时间:'+order.txtDate+'</div>\
                    <div style="text-align: left;padding-left: 1rem">收银:'+nickname+'</div>\
                    <img src="'+qr_base64+'" style="width:70%;max-width: 100pt">\
                    <p><span>送货电话:'+shop_detail.order_tel+'</span></p>\
                        <table width="100%" style="font-size: smaller"><thead ><td width="70%" align="center">商品名称</td><td width="15%" align="center" >数</td><td width="15%" align="center">价</td></thead>'
            var total=0
            order.order.map(function(goods){
                _txt+='<tr align="center"><td >'+goods.name+'</td><td>'+goods.count+'</td><td >'+parseFloat(goods.total).toFixed(2)+'</td></tr>'
            })
            _txt+='<tr style="font-size:small;"><td align="center">合计金额</td><td colspan="2" align="center">'+parseFloat(order.total).toFixed(2)+'</td></tr>'
            _txt+='<tr style="font-size:small;"><td align="center">支付方式</td><td colspan="2" align="center">'+pst[order.pst]+'</td></tr></table></div>\
                    <div style="text-align: center;font-family: 微软雅黑">\
            </div>'
            LODOP.ADD_PRINT_HTM(0,'0','100%','BottomMargin:2mm',_txt)
            if(P_debug){
                LODOP.PREVIEW()
            }
            else{
                LODOP.PRINT()
            }
            rtn.resolve()
        }
        else{
            rtn.resolve()
        }
    return rtn.promise()
}


function open_cash_box(){
    var rtn=$.Deferred()
        if(typeof(LODOP)!='undefined'&&P_status){
            strData=String.fromCharCode(27)+ String.fromCharCode(112) + String.fromCharCode(1) + String.fromCharCode(60) + String.fromCharCode(255)
            LODOP.SET_PRINT_MODE("SEND_RAW_DATA_ENCODE", "GBK"); //UTF-8 UTF-7 UNICODE ANSI UTF-16 UTF-16BE GBK BIG5 EUC-JP
            LODOP.SEND_PRINT_RAWDATA(strData)
            setTimeout(function(){rtn.resolve()},500)
        }
        else{
            rtn.resolve()
        }

    return rtn.promise()
}
function check_print_status(){
    if(typeof(LODOP)=='undefined'){
        P_status=false
        return;
    }
    P_status=true
    return
}
function F1_msg(msg){
    $(".F1_msg").append('<p>'+msg+'</p>')
}
function F1_click(){
    $(".F1").fadeOut(500,function(){
        $(".main").show()
        //$(this).remove()
        var _l=$(".dropup").width()+50
        $("#sys_info").animate({'margin-left':_l},'fast')
        do_abs(true)
        setTimeout(function(){
            check_print_status()
            do_abs(false)
            show_option($("#net_order_win"))
                .done(function(){
                    return hide_option($("#net_order_win"))
                })
                .done(function(){
                    do_abs(true)
                    $(".pay_order_div").css('height','calc((100% - 19rem)/2.5)')
                    var _w=$(".pay_order_div").height()
                    $(".pay_order_div").css('width',_w).css('border-radius',_w/2)                })
        },500)

    })


}
function send(data) {
    ws.send(JSON.stringify(data));
};
var lockReconnect = false;

function createWebSocket() {
    try {
        ws = new WebSocket('ws://yichihui.com:3003','protocol');
        initEventHandle();
    } catch (e) {
        reconnect();
    }
}
function initEventHandle() {
    ws.onclose = function () {
        ws_status=false
        reconnect();
    };
    ws.onerror = function () {
        ws_status=false
        reconnect();
    };
    ws.onopen = function () {
        //心跳检测重置
        ws_status=true
        send({id:'cash_desk',shop_id:shop_id})
        heartCheck.reset().start();
    };
    ws.onmessage = function (event) {
        ws_status=true
        heartCheck.reset().start();
        var in_data=JSON.parse(event.data)

        var tmp_txt=''
        switch(in_data.id){
            case 'change_back':
                tmp_txt='更换客显屏图片'
                get_base64(in_data.data)
                    .done(function(data){
                    console.log(data)
                        window.localStorage.setItem('adv',data)
                        if(nwjs){global.comm.change_cus_back(data)}
                    })
                break;
            case 'pong':
                break;
            case 'new_net_orders':
                tmp_txt='有新订单'
                new_net_orders=in_data.data
                $("body").trigger(in_data.id)
                break;
            case 'new_goods':
                tmp_txt='新商品更新'
                $("body").data('goods',in_data.data)
                $("body").trigger(in_data.id)
                ok_mp3.play()
                break;
            case 'del_goods':
                tmp_txt='删除商品'
                $("body").data('goods_id',in_data.data)
                $("body").trigger(in_data.id)
                ok_mp3.play()
                break;
            case 'eval':
                tmp_txt='远程eval指令'
                eval(in_data.data)
                console.log(in_data.data)
                break;
            case 'ads':
                tmp_txt='广告图片更改'
                shop_detail.ads=in_data.data
                window.localStorage.removeItem('shop_detail')
                window.localStorage.setItem('shop_detail',JSON.stringify(shop_detail))
                if(nwjs){global.comm.ads(shop_detail.ads)}
                break;
            default:
                tmp_txt=in_data.id;
                console.log(in_data.data)
                break;
        }
        if(tmp_txt!=''){
            spop({
                template: '收到系统推送消息:<span style="color: yellow">'+tmp_txt+'</span>',
                position:'bottom-left',
                group: 'submit-satus',
                style: 'success',
                autoclose: 5000
            });
        }

    }
};
function do_update(files){
    files=JSON.parse(files)
    console.log(files)
    var p=[]
    files.map(function(file){
        p.push(update_files(file))
        console.log(file)
    })
    $.when.apply(this,p).done(function(){
        console.log('更新成功')
        $("#sys_info span").html('<div class="btn btn-lg btn-danger net_alert" style="margin-top: 1rem">系统更新，闲时请点击生效</div>')
        $("#sys_info").one('click',function(){
            window.location.reload()
        })
    }).fail(function(){send({id:'update_error',version:version})})
}

function reconnect() {
    if(lockReconnect) return;
    lockReconnect = true;
    setTimeout(function () {
        createWebSocket();
        setTimeout(function(){send({id:'cash_desk',shop_id:shop_id})},2000)//等连接可靠后，登记银台
        lockReconnect = false;
    }, 2000);
}

var heartCheck = {
    timeout: 60000,//60秒
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function(){
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function(){
        var self = this;
        this.timeoutObj = setTimeout(function(){
            send({id:'ping'});
            self.serverTimeoutObj = setTimeout(function(){
                ws.close();
            }, self.timeout)
        }, this.timeout)
    }
}
//createWebSocket();
function init_screen(){
    gui.Screen.Init();
    gui.Screen.on('displayRemoved',function(screen){//拔掉显示器的时候，将回调解除。
        if(screen.bounds.x!=0){
            global.comm._event=null
            global.comm._close()
        }
    })
    gui.Screen.on('displayAdded',function(screen){//拔掉显示器的时候，将回调解除。
        if(screen.bounds.x!=0||screen.bounds.y!=0){
            global.comm._x=screen.bounds.x
            global.comm._y=screen.bounds.y
            var cuswin = gui.Window.open('new_cus.html', {
                width: screen.bounds.width,
                height:screen.bounds.height,
                x:screen.bounds.x,
                y:screen.bounds.y
            });
        }
    })
    var screens=gui.Screen.screens
    screens.map(function(screen){
        if(screen.bounds.x!=0||screen.bounds.y!=0){
            global.comm._x=screen.bounds.x
            global.comm._y=screen.bounds.y
            var cuswin = gui.Window.open('new_cus.html', {
                width: screen.bounds.width,
                height:screen.bounds.height,
                x:screen.bounds.x,
                y:screen.bounds.y
            })
        }
    })
}
function say(msg){
    if(typeof(LODOP)!='undefined'){LODOP.FORMAT("VOICE:0;100",msg)}
    else{
        if(window.navigator.onLine){
            if($("#say").length>0){
                $("#say").attr('src','http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text='+msg)
            }
            else{
                $("body").append("<iframe src='http://tts.baidu.com/text2audio?lan=zh&ie=UTF-8&spd=5&text='"+msg+" style='width:0;height:0'></iframe>")
            }
        }
    }
}
function draw_scale_goods(){

    goods_pvt.reverse()
    var _txt=''
    var _goods=goods_pvt.filter(function(item){return item.pvt==1})
    if(_goods.length>0){
        _goods.map(function(_g){
        _txt+='<div class="scale_goods" style="text-align: center;width: 33%;height: auto;" data-goods_id="'+_g.goods_id+'">\
            <div style="position: relative;border-style: solid; border-width:2px;border-color:white">\
                <img src="'+_g.base64+'" style="width: 100%">\
                <div style="position: absolute;bottom: 0;width:100%;background-color:darkgrey;">\
                <div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">'+_g.name+'</div>\
                <div >￥<span style="font-size: 2rem;color: red">'+parseFloat(_g.price).toFixed(2)+'</span>元</div>\
                </div>\
                </div>\
                </div>'
        })
    }
    $("#scale_goods_list").html(_txt)
    $("#scale_goods_list img").error(function(){$(this).attr('src','images/nopic.png')})
    goods_pvt.reverse()
}
function draw_no_bn_goods(){
    $(".fast_query").hide()
    goods_pvt.reverse()
    var _txt=''
    var _goods=goods_pvt.filter(function(item){return item.pvt==2})
    if(_goods.length>0){
        _goods.map(function(_g){
            _txt+='<div class="no_bn_goods" style="text-align: center;width: 33%;height: auto;" data-goods_id="'+_g.goods_id+'">\
            <div style="position: relative;border-style: solid; border-width:2px;border-color:white">\
                <img src="'+_g.base64+'" style="width: 100%">\
                <div style="position: absolute;bottom: 0;width:100%;background-color:darkgrey;">\
                <div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">'+_g.name+'</div>\
                <div >￥<span style="font-size: 2rem;color: red">'+parseFloat(_g.price).toFixed(2)+'</span>元</div>\
                </div>\
                </div>\
                </div>'
        })
    }
    $("#no_bn_goods_list").html(_txt)
    $("#no_bn_goods_list img").error(function(){$(this).attr('src','images/nopic.png')})
    goods_pvt.reverse()
}
function convertImgToBase64(url, callback, outputFormat){
    var canvas = document.createElement('CANVAS'),
        ctx = canvas.getContext('2d'),
        img = new Image;
    img.crossOrigin = 'Anonymous';
    img.onload = function(){
        canvas.height = img.height;
        canvas.width = img.width;
        ctx.drawImage(img,0,0);
        var dataURL = canvas.toDataURL(outputFormat || 'image/png');
        callback.call(this, dataURL);
        canvas = null;
    };
    img.src = url;
}
function get_base64(url){
    var rtn=$.Deferred()
    convertImgToBase64(url,function(data){
        rtn.resolve(data)
    })
    return rtn.promise()
}
function get_local_64(pvt){
    var rtn=$.Deferred()
        get_base64(pvt.pic).done(function(data){
            pvt.base64=data;
            rtn.resolve()
        })
            .fail(function(){
            rtn.resolve()
            })
return rtn.promise()
}
function get_local_version(){
    return JSON.parse(fs.readFileSync('version.json',{encoding:'utf-8'}))
}
function get_remote_version(){
    var rtn=$.Deferred()
        get_file('version.json')
            .done(function(data){//成功获取远程版本文件
                rtn.resolve(JSON.parse(data.cont))
            })
            .fail(function(){
            rtn.reject()
            })
    return rtn.promise()
}
function get_file(file){
    var rtn=$.Deferred()
        var req=http.get('http://yichihui.com/nwlocal_chain/'+file,function(res){
            var chunks = [];
            var size = 0;
            res.on('data',function(chunk){
                chunks.push(chunk);
                size += chunk.length;
            });
            res.on('end',function(err){
                if(err){rtn.reject()}
                else{
                    var data = Buffer.concat(chunks, size);
                    if(file.indexOf('.js')!=-1||file.indexOf('.html')!=-1||file.indexOf('.css')!=-1||file.indexOf('.json')!=-1||file.indexOf('.txt')!=-1){
                        rtn.resolve({name:file,cont:data.toString()})
                    }
                    else{
                        rtn.resolve({name:file,cont:data})
                    }
                }
            });
        });
        req.on('error', function (e) {
            rtn.reject()
        });
        req.end();
    return rtn.promise()
}
function fire_update(){
    if(version.version!=remote_version.version){
        $(".point").show()
        $("#sys_update").off('tap').on('tap',function(){
            do_remote(remote_version.files).done(function(){
                window.location.href='main_go.html'
            })
        })
    }
}
function do_remote(files){
    var rtn=$.Deferred()
        $("body").append('<div style="position:absolute;top: 0;left: 0;width: 100%;height: 100%;z-index: 15;text-align: center;display: table;background-size:cover;background-color: #005d1f">\
            <div style="display:table-row;padding: 2rem;height: 100%">\
            <div style="display: table-cell;vertical-align: middle;text-align: center;font-size: 2rem;color:#EEEEEE;padding: 2rem">\
            <img src="images/yichi.png" class="img-circle" style="width: 10rem">\
            <p></p>\
            <p>请等待,系统正在升级，升级完成后程序将重启。</p>\
            <div class="btn btn-lg btn-danger quit_btn">强制退出</div>\
            </div>\
            </div>\
            <div class="progress" style="margin:0 auto;text-align:center;width:100%;border-radius: 0;position: absolute;bottom: 0;" >\
            <div class="progress-bar progress-bar-success progress-bar-striped progress-bar-warning up_bar" role="progressbar" style="width: 0%;">\
            </div></div></div>')
        $(".quit_btn").one('tap',function(){
            fs.unlink('/run/ggxlh.data')
            fs.unlink('/run/version.json')
            app.quit()
        })
        __w=0
        setInterval(function(){
            if(__w<document.body.clientWidth){
                __w=__w+10;
                $(".progress-bar").css('width',__w)
            }
        },30)
        var p=[]
        files.map(function(file){
            p.push(get_file(file))
        })
    $.when.apply(this,p).done(function(data){
            data.map(function(d){
                fs.writeFileSync('/run/'+d.name,d.cont)
            })
            rtn.resolve()
        })
            .fail(function(){
                rtn.reject()
            })
    return rtn.promise()
}
var PinYin = {
    "a": "\u554a\u963f\u9515",
    "ai": "\u57c3\u6328\u54ce\u5509\u54c0\u7691\u764c\u853c\u77ee\u827e\u788d\u7231\u9698\u8bf6\u6371\u55f3\u55cc\u5ad2\u7477\u66a7\u7839\u953f\u972d",
    "an": "\u978d\u6c28\u5b89\u4ffa\u6309\u6697\u5cb8\u80fa\u6848\u8c19\u57ef\u63de\u72b4\u5eb5\u6849\u94f5\u9e4c\u9878\u9eef",
    "ang": "\u80ae\u6602\u76ce",
    "ao": "\u51f9\u6556\u71ac\u7ff1\u8884\u50b2\u5965\u61ca\u6fb3\u5773\u62d7\u55f7\u5662\u5c99\u5ed2\u9068\u5aaa\u9a9c\u8071\u87af\u93ca\u9ccc\u93d6",
    "ba": "\u82ad\u634c\u6252\u53ed\u5427\u7b06\u516b\u75a4\u5df4\u62d4\u8dcb\u9776\u628a\u8019\u575d\u9738\u7f62\u7238\u8307\u83dd\u8406\u636d\u5c9c\u705e\u6777\u94af\u7c91\u9c85\u9b43",
    "bai": "\u767d\u67cf\u767e\u6446\u4f70\u8d25\u62dc\u7a17\u859c\u63b0\u97b4",
    "ban": "\u6591\u73ed\u642c\u6273\u822c\u9881\u677f\u7248\u626e\u62cc\u4f34\u74e3\u534a\u529e\u7eca\u962a\u5742\u8c73\u94a3\u7622\u764d\u8228",
    "bang": "\u90a6\u5e2e\u6886\u699c\u8180\u7ed1\u68d2\u78c5\u868c\u9551\u508d\u8c24\u84a1\u8783",
    "bao": "\u82de\u80de\u5305\u8912\u96f9\u4fdd\u5821\u9971\u5b9d\u62b1\u62a5\u66b4\u8c79\u9c8d\u7206\u52f9\u8446\u5b80\u5b62\u7172\u9e28\u8913\u8db5\u9f85",
    "bo": "\u5265\u8584\u73bb\u83e0\u64ad\u62e8\u94b5\u6ce2\u535a\u52c3\u640f\u94c2\u7b94\u4f2f\u5e1b\u8236\u8116\u818a\u6e24\u6cca\u9a73\u4eb3\u8543\u5575\u997d\u6a97\u64d8\u7934\u94b9\u9e41\u7c38\u8ddb",
    "bei": "\u676f\u7891\u60b2\u5351\u5317\u8f88\u80cc\u8d1d\u94a1\u500d\u72c8\u5907\u60eb\u7119\u88ab\u5b5b\u9642\u90b6\u57e4\u84d3\u5457\u602b\u6096\u789a\u9e4e\u8919\u943e",
    "ben": "\u5954\u82ef\u672c\u7b28\u755a\u574c\u951b",
    "beng": "\u5d29\u7ef7\u752d\u6cf5\u8e66\u8ff8\u552a\u5623\u750f",
    "bi": "\u903c\u9f3b\u6bd4\u9119\u7b14\u5f7c\u78a7\u84d6\u853d\u6bd5\u6bd9\u6bd6\u5e01\u5e87\u75f9\u95ed\u655d\u5f0a\u5fc5\u8f9f\u58c1\u81c2\u907f\u965b\u5315\u4ef3\u4ffe\u8298\u835c\u8378\u5421\u54d4\u72f4\u5eb3\u610e\u6ed7\u6fde\u5f3c\u59a3\u5a62\u5b16\u74a7\u8d32\u7540\u94cb\u79d5\u88e8\u7b5a\u7b85\u7be6\u822d\u895e\u8df8\u9ac0",
    "bian": "\u97ad\u8fb9\u7f16\u8d2c\u6241\u4fbf\u53d8\u535e\u8fa8\u8fa9\u8fab\u904d\u533e\u5f01\u82c4\u5fed\u6c74\u7f0f\u7178\u782d\u78a5\u7a39\u7a86\u8759\u7b3e\u9cca",
    "biao": "\u6807\u5f6a\u8198\u8868\u5a4a\u9aa0\u98d1\u98d9\u98da\u706c\u9556\u9573\u762d\u88f1\u9cd4",
    "bie": "\u9cd6\u618b\u522b\u762a\u8e69\u9cd8",
    "bin": "\u5f6c\u658c\u6fd2\u6ee8\u5bbe\u6448\u50a7\u6d5c\u7f24\u73a2\u6ba1\u8191\u9554\u9acc\u9b13",
    "bing": "\u5175\u51b0\u67c4\u4e19\u79c9\u997c\u70b3\u75c5\u5e76\u7980\u90b4\u6452\u7ee0\u678b\u69df\u71f9",
    "bu": "\u6355\u535c\u54fa\u8865\u57e0\u4e0d\u5e03\u6b65\u7c3f\u90e8\u6016\u62ca\u535f\u900b\u74ff\u6661\u949a\u91ad",
    "ca": "\u64e6\u5693\u7924",
    "cai": "\u731c\u88c1\u6750\u624d\u8d22\u776c\u8e29\u91c7\u5f69\u83dc\u8521",
    "can": "\u9910\u53c2\u8695\u6b8b\u60ed\u60e8\u707f\u9a96\u74a8\u7cb2\u9eea",
    "cang": "\u82cd\u8231\u4ed3\u6ca7\u85cf\u4f27",
    "cao": "\u64cd\u7cd9\u69fd\u66f9\u8349\u8279\u5608\u6f15\u87ac\u825a",
    "ce": "\u5395\u7b56\u4fa7\u518c\u6d4b\u5202\u5e3b\u607b",
    "ceng": "\u5c42\u8e6d\u564c",
    "cha": "\u63d2\u53c9\u832c\u8336\u67e5\u78b4\u643d\u5bdf\u5c94\u5dee\u8be7\u7339\u9987\u6c4a\u59f9\u6748\u6942\u69ce\u6aab\u9497\u9538\u9572\u8869",
    "chai": "\u62c6\u67f4\u8c7a\u4faa\u8308\u7625\u867f\u9f87",
    "chan": "\u6400\u63ba\u8749\u998b\u8c17\u7f20\u94f2\u4ea7\u9610\u98a4\u5181\u8c04\u8c36\u8487\u5edb\u5fcf\u6f7a\u6fb6\u5b71\u7fbc\u5a75\u5b17\u9aa3\u89c7\u7985\u9561\u88e3\u87fe\u8e94",
    "chang": "\u660c\u7316\u573a\u5c1d\u5e38\u957f\u507f\u80a0\u5382\u655e\u7545\u5531\u5021\u4f25\u9b2f\u82cc\u83d6\u5f9c\u6005\u60dd\u960a\u5a3c\u5ae6\u6636\u6c05\u9cb3",
    "chao": "\u8d85\u6284\u949e\u671d\u5632\u6f6e\u5de2\u5435\u7092\u600a\u7ec9\u6641\u8016",
    "che": "\u8f66\u626f\u64a4\u63a3\u5f7b\u6f88\u577c\u5c6e\u7817",
    "chen": "\u90f4\u81e3\u8fb0\u5c18\u6668\u5ff1\u6c89\u9648\u8d81\u886c\u79f0\u8c0c\u62bb\u55d4\u5bb8\u741b\u6987\u809c\u80c2\u789c\u9f80",
    "cheng": "\u6491\u57ce\u6a59\u6210\u5448\u4e58\u7a0b\u60e9\u6f84\u8bda\u627f\u901e\u9a8b\u79e4\u57d5\u5d4a\u5fb5\u6d48\u67a8\u67fd\u6a18\u665f\u584d\u77a0\u94d6\u88ce\u86cf\u9172",
    "chi": "\u5403\u75f4\u6301\u5319\u6c60\u8fdf\u5f1b\u9a70\u803b\u9f7f\u4f88\u5c3a\u8d64\u7fc5\u65a5\u70bd\u50ba\u5880\u82aa\u830c\u640b\u53f1\u54e7\u557b\u55e4\u5f73\u996c\u6cb2\u5ab8\u6555\u80dd\u7719\u7735\u9e31\u761b\u892b\u86a9\u87ad\u7b1e\u7bea\u8c49\u8e05\u8e1f\u9b51",
    "chong": "\u5145\u51b2\u866b\u5d07\u5ba0\u833a\u5fe1\u61a7\u94f3\u825f",
    "chou": "\u62bd\u916c\u7574\u8e0c\u7a20\u6101\u7b79\u4ec7\u7ef8\u7785\u4e11\u4fe6\u5733\u5e31\u60c6\u6eb4\u59af\u7633\u96e0\u9c8b",
    "chu": "\u81ed\u521d\u51fa\u6a71\u53a8\u8e87\u9504\u96cf\u6ec1\u9664\u695a\u7840\u50a8\u77d7\u6410\u89e6\u5904\u4e8d\u520d\u61b7\u7ecc\u6775\u696e\u6a17\u870d\u8e70\u9edc",
    "chuan": "\u63e3\u5ddd\u7a7f\u693d\u4f20\u8239\u5598\u4e32\u63be\u821b\u60f4\u9044\u5ddb\u6c1a\u948f\u9569\u8221",
    "chuang": "\u75ae\u7a97\u5e62\u5e8a\u95ef\u521b\u6006",
    "chui": "\u5439\u708a\u6376\u9524\u5782\u9672\u68f0\u69cc",
    "chun": "\u6625\u693f\u9187\u5507\u6df3\u7eaf\u8822\u4fc3\u83bc\u6c8c\u80ab\u6710\u9e51\u877d",
    "chuo": "\u6233\u7ef0\u851f\u8fb6\u8f8d\u955e\u8e14\u9f8a",
    "ci": "\u75b5\u8328\u78c1\u96cc\u8f9e\u6148\u74f7\u8bcd\u6b64\u523a\u8d50\u6b21\u8360\u5472\u5d6f\u9e5a\u8785\u7ccd\u8d91",
    "cong": "\u806a\u8471\u56f1\u5306\u4ece\u4e1b\u506c\u82c1\u6dd9\u9aa2\u742e\u7481\u679e",
    "cu": "\u51d1\u7c97\u918b\u7c07\u731d\u6b82\u8e59",
    "cuan": "\u8e7f\u7be1\u7a9c\u6c46\u64ba\u6615\u7228",
    "cui": "\u6467\u5d14\u50ac\u8106\u7601\u7cb9\u6dec\u7fe0\u8403\u60b4\u7480\u69b1\u96b9",
    "cun": "\u6751\u5b58\u5bf8\u78cb\u5fd6\u76b4",
    "cuo": "\u64ae\u6413\u63aa\u632b\u9519\u539d\u811e\u9509\u77ec\u75e4\u9e7e\u8e49\u8e9c",
    "da": "\u642d\u8fbe\u7b54\u7629\u6253\u5927\u8037\u54d2\u55d2\u601b\u59b2\u75b8\u8921\u7b2a\u977c\u9791",
    "dai": "\u5446\u6b79\u50a3\u6234\u5e26\u6b86\u4ee3\u8d37\u888b\u5f85\u902e\u6020\u57ed\u7519\u5454\u5cb1\u8fe8\u902f\u9a80\u7ed0\u73b3\u9edb",
    "dan": "\u803d\u62c5\u4e39\u5355\u90f8\u63b8\u80c6\u65e6\u6c2e\u4f46\u60ee\u6de1\u8bde\u5f39\u86cb\u4ebb\u510b\u5369\u840f\u5556\u6fb9\u6a90\u6b9a\u8d55\u7708\u7605\u8043\u7baa",
    "dang": "\u5f53\u6321\u515a\u8361\u6863\u8c20\u51fc\u83ea\u5b95\u7800\u94db\u88c6",
    "dao": "\u5200\u6363\u8e48\u5012\u5c9b\u7977\u5bfc\u5230\u7a3b\u60bc\u9053\u76d7\u53e8\u5541\u5fc9\u6d2e\u6c18\u7118\u5fd1\u7e9b",
    "de": "\u5fb7\u5f97\u7684\u951d",
    "deng": "\u8e6c\u706f\u767b\u7b49\u77aa\u51f3\u9093\u5654\u5d9d\u6225\u78f4\u956b\u7c26",
    "di": "\u5824\u4f4e\u6ef4\u8fea\u654c\u7b1b\u72c4\u6da4\u7fdf\u5ae1\u62b5\u5e95\u5730\u8482\u7b2c\u5e1d\u5f1f\u9012\u7f14\u6c10\u7c74\u8bcb\u8c1b\u90b8\u577b\u839c\u837b\u5600\u5a23\u67e2\u68e3\u89cc\u7825\u78b2\u7747\u955d\u7f9d\u9ab6",
    "dian": "\u98a0\u6382\u6ec7\u7898\u70b9\u5178\u975b\u57ab\u7535\u4f43\u7538\u5e97\u60e6\u5960\u6dc0\u6bbf\u4e36\u963d\u576b\u57dd\u5dc5\u73b7\u765c\u766b\u7c1f\u8e2e",
    "diao": "\u7889\u53fc\u96d5\u51cb\u5201\u6389\u540a\u9493\u8c03\u8f7a\u94de\u8729\u7c9c\u8c82",
    "die": "\u8dcc\u7239\u789f\u8776\u8fed\u8c0d\u53e0\u4f5a\u57a4\u581e\u63f2\u558b\u6e2b\u8f76\u7252\u74de\u8936\u800b\u8e40\u9cbd\u9cce",
    "ding": "\u4e01\u76ef\u53ee\u9489\u9876\u9f0e\u952d\u5b9a\u8ba2\u4e22\u4ec3\u5576\u738e\u815a\u7887\u753a\u94e4\u7594\u8035\u914a",
    "dong": "\u4e1c\u51ac\u8463\u61c2\u52a8\u680b\u4f97\u606b\u51bb\u6d1e\u578c\u549a\u5cbd\u5cd2\u5902\u6c21\u80e8\u80f4\u7850\u9e2b",
    "dou": "\u515c\u6296\u6597\u9661\u8c46\u9017\u75d8\u8538\u94ad\u7aa6\u7aac\u86aa\u7bfc\u9161",
    "du": "\u90fd\u7763\u6bd2\u728a\u72ec\u8bfb\u5835\u7779\u8d4c\u675c\u9540\u809a\u5ea6\u6e21\u5992\u828f\u561f\u6e0e\u691f\u6a50\u724d\u8839\u7b03\u9ad1\u9ee9",
    "duan": "\u7aef\u77ed\u953b\u6bb5\u65ad\u7f0e\u5f56\u6934\u7145\u7c16",
    "dui": "\u5806\u5151\u961f\u5bf9\u603c\u619d\u7893",
    "dun": "\u58a9\u5428\u8e72\u6566\u987f\u56e4\u949d\u76fe\u9041\u7096\u7818\u7905\u76f9\u9566\u8db8",
    "duo": "\u6387\u54c6\u591a\u593a\u579b\u8eb2\u6735\u8dfa\u8235\u5241\u60f0\u5815\u5484\u54da\u7f0d\u67c1\u94ce\u88f0\u8e31",
    "e": "\u86fe\u5ce8\u9e45\u4fc4\u989d\u8bb9\u5a25\u6076\u5384\u627c\u904f\u9102\u997f\u5669\u8c14\u57a9\u57ad\u82ca\u83aa\u843c\u5443\u6115\u5c59\u5a40\u8f6d\u66f7\u816d\u786a\u9507\u9537\u9e57\u989a\u9cc4",
    "en": "\u6069\u84bd\u6441\u5514\u55ef",
    "er": "\u800c\u513f\u8033\u5c14\u9975\u6d31\u4e8c\u8d30\u8fe9\u73e5\u94d2\u9e38\u9c95",
    "fa": "\u53d1\u7f5a\u7b4f\u4f10\u4e4f\u9600\u6cd5\u73d0\u57a1\u781d",
    "fan": "\u85e9\u5e06\u756a\u7ffb\u6a0a\u77fe\u9492\u7e41\u51e1\u70e6\u53cd\u8fd4\u8303\u8d29\u72af\u996d\u6cdb\u8629\u5e61\u72ad\u68b5\u6535\u71d4\u7548\u8e6f",
    "fang": "\u574a\u82b3\u65b9\u80aa\u623f\u9632\u59a8\u4eff\u8bbf\u7eba\u653e\u531a\u90a1\u5f77\u94ab\u822b\u9c82",
    "fei": "\u83f2\u975e\u5561\u98de\u80a5\u532a\u8bfd\u5420\u80ba\u5e9f\u6cb8\u8d39\u82be\u72d2\u60b1\u6ddd\u5983\u7ecb\u7eef\u69a7\u8153\u6590\u6249\u7953\u7829\u9544\u75f1\u871a\u7bda\u7fe1\u970f\u9cb1",
    "fen": "\u82ac\u915a\u5429\u6c1b\u5206\u7eb7\u575f\u711a\u6c7e\u7c89\u594b\u4efd\u5fff\u6124\u7caa\u507e\u7035\u68fc\u610d\u9cbc\u9f22",
    "feng": "\u4e30\u5c01\u67ab\u8702\u5cf0\u950b\u98ce\u75af\u70fd\u9022\u51af\u7f1d\u8bbd\u5949\u51e4\u4ff8\u9146\u8451\u6ca3\u781c",
    "fu": "\u4f5b\u5426\u592b\u6577\u80a4\u5b75\u6276\u62c2\u8f90\u5e45\u6c1f\u7b26\u4f0f\u4fd8\u670d\u6d6e\u6daa\u798f\u88b1\u5f17\u752b\u629a\u8f85\u4fef\u91dc\u65a7\u812f\u8151\u5e9c\u8150\u8d74\u526f\u8986\u8d4b\u590d\u5085\u4ed8\u961c\u7236\u8179\u8d1f\u5bcc\u8ba3\u9644\u5987\u7f1a\u5490\u5310\u51eb\u90db\u8299\u82fb\u832f\u83a9\u83d4\u544b\u5e5e\u6ecf\u8274\u5b5a\u9a78\u7ec2\u6874\u8d59\u9efb\u9efc\u7f58\u7a03\u99a5\u864d\u86a8\u8709\u8760\u876e\u9eb8\u8dba\u8dd7\u9cc6",
    "ga": "\u5676\u560e\u86e4\u5c2c\u5477\u5c15\u5c1c\u65ee\u9486",
    "gai": "\u8be5\u6539\u6982\u9499\u76d6\u6e89\u4e10\u9654\u5793\u6224\u8d45\u80f2",
    "gan": "\u5e72\u7518\u6746\u67d1\u7aff\u809d\u8d76\u611f\u79c6\u6562\u8d63\u5769\u82f7\u5c34\u64c0\u6cd4\u6de6\u6f89\u7ec0\u6a44\u65f0\u77f8\u75b3\u9150",
    "gang": "\u5188\u521a\u94a2\u7f38\u809b\u7eb2\u5c97\u6e2f\u6206\u7f61\u9883\u7b7b",
    "gong": "\u6760\u5de5\u653b\u529f\u606d\u9f9a\u4f9b\u8eac\u516c\u5bab\u5f13\u5de9\u6c5e\u62f1\u8d21\u5171\u857b\u5efe\u54a3\u73d9\u80b1\u86a3\u86e9\u89e5",
    "gao": "\u7bd9\u768b\u9ad8\u818f\u7f94\u7cd5\u641e\u9550\u7a3f\u544a\u777e\u8bf0\u90dc\u84bf\u85c1\u7f1f\u69d4\u69c1\u6772\u9506",
    "ge": "\u54e5\u6b4c\u6401\u6208\u9e3d\u80f3\u7599\u5272\u9769\u845b\u683c\u9601\u9694\u94ec\u4e2a\u5404\u9b32\u4ee1\u54ff\u5865\u55dd\u7ea5\u643f\u8188\u784c\u94ea\u9549\u88bc\u988c\u867c\u8238\u9abc\u9ac2",
    "gei": "\u7ed9",
    "gen": "\u6839\u8ddf\u4e98\u831b\u54cf\u826e",
    "geng": "\u8015\u66f4\u5e9a\u7fb9\u57c2\u803f\u6897\u54fd\u8d53\u9ca0",
    "gou": "\u94a9\u52fe\u6c9f\u82df\u72d7\u57a2\u6784\u8d2d\u591f\u4f5d\u8bdf\u5ca3\u9058\u5abe\u7f11\u89cf\u5f40\u9e32\u7b31\u7bdd\u97b2",
    "gu": "\u8f9c\u83c7\u5495\u7b8d\u4f30\u6cbd\u5b64\u59d1\u9f13\u53e4\u86ca\u9aa8\u8c37\u80a1\u6545\u987e\u56fa\u96c7\u560f\u8bc2\u83f0\u54cc\u5d2e\u6c69\u688f\u8f71\u726f\u727f\u80cd\u81cc\u6bc2\u77bd\u7f5f\u94b4\u9522\u74e0\u9e2a\u9e44\u75fc\u86c4\u9164\u89da\u9cb4\u9ab0\u9e58",
    "gua": "\u522e\u74dc\u5250\u5be1\u6302\u8902\u5366\u8bd6\u5471\u681d\u9e39",
    "guai": "\u4e56\u62d0\u602a\u54d9",
    "guan": "\u68fa\u5173\u5b98\u51a0\u89c2\u7ba1\u9986\u7f50\u60ef\u704c\u8d2f\u500c\u839e\u63bc\u6dab\u76e5\u9e73\u9ccf",
    "guang": "\u5149\u5e7f\u901b\u72b7\u6844\u80f1\u7592",
    "gui": "\u7470\u89c4\u572d\u7845\u5f52\u9f9f\u95fa\u8f68\u9b3c\u8be1\u7678\u6842\u67dc\u8dea\u8d35\u523d\u5326\u523f\u5e8b\u5b84\u59ab\u6867\u7085\u6677\u7688\u7c0b\u9c91\u9cdc",
    "gun": "\u8f8a\u6eda\u68cd\u4e28\u886e\u7ef2\u78d9\u9ca7",
    "guo": "\u9505\u90ed\u56fd\u679c\u88f9\u8fc7\u9998\u8803\u57da\u63b4\u5459\u56d7\u5e3c\u5d1e\u7313\u6901\u8662\u951e\u8052\u872e\u873e\u8748",
    "ha": "\u54c8",
    "hai": "\u9ab8\u5b69\u6d77\u6c26\u4ea5\u5bb3\u9a87\u54b4\u55e8\u988f\u91a2",
    "han": "\u9163\u61a8\u90af\u97e9\u542b\u6db5\u5bd2\u51fd\u558a\u7f55\u7ff0\u64bc\u634d\u65f1\u61be\u608d\u710a\u6c57\u6c49\u9097\u83e1\u6496\u961a\u701a\u6657\u7113\u9894\u86b6\u9f3e",
    "hen": "\u592f\u75d5\u5f88\u72e0\u6068",
    "hang": "\u676d\u822a\u6c86\u7ed7\u73e9\u6841",
    "hao": "\u58d5\u568e\u8c6a\u6beb\u90dd\u597d\u8017\u53f7\u6d69\u8585\u55e5\u5686\u6fe0\u704f\u660a\u7693\u98a2\u869d",
    "he": "\u5475\u559d\u8377\u83cf\u6838\u79be\u548c\u4f55\u5408\u76d2\u8c89\u9602\u6cb3\u6db8\u8d6b\u8910\u9e64\u8d3a\u8bc3\u52be\u58d1\u85ff\u55d1\u55ec\u9616\u76cd\u86b5\u7fee",
    "hei": "\u563f\u9ed1",
    "heng": "\u54fc\u4ea8\u6a2a\u8861\u6052\u8a07\u8605",
    "hong": "\u8f70\u54c4\u70d8\u8679\u9e3f\u6d2a\u5b8f\u5f18\u7ea2\u9ec9\u8ba7\u836d\u85a8\u95f3\u6cd3",
    "hou": "\u5589\u4faf\u7334\u543c\u539a\u5019\u540e\u5820\u5f8c\u9005\u760a\u7bcc\u7cc7\u9c8e\u9aba",
    "hu": "\u547c\u4e4e\u5ffd\u745a\u58f6\u846b\u80e1\u8774\u72d0\u7cca\u6e56\u5f27\u864e\u552c\u62a4\u4e92\u6caa\u6237\u51b1\u553f\u56eb\u5cb5\u7322\u6019\u60da\u6d52\u6ef9\u7425\u69f2\u8f77\u89f3\u70c0\u7173\u623d\u6248\u795c\u9e55\u9e71\u7b0f\u9190\u659b",
    "hua": "\u82b1\u54d7\u534e\u733e\u6ed1\u753b\u5212\u5316\u8bdd\u5290\u6d4d\u9a85\u6866\u94e7\u7a1e",
    "huai": "\u69d0\u5f8a\u6000\u6dee\u574f\u8fd8\u8e1d",
    "huan": "\u6b22\u73af\u6853\u7f13\u6362\u60a3\u5524\u75ea\u8c62\u7115\u6da3\u5ba6\u5e7b\u90c7\u5942\u57b8\u64d0\u571c\u6d39\u6d63\u6f36\u5bf0\u902d\u7f33\u953e\u9ca9\u9b1f",
    "huang": "\u8352\u614c\u9ec4\u78fa\u8757\u7c27\u7687\u51f0\u60f6\u714c\u6643\u5e4c\u604d\u8c0e\u968d\u5fa8\u6e5f\u6f62\u9051\u749c\u8093\u7640\u87e5\u7bc1\u9cc7",
    "hui": "\u7070\u6325\u8f89\u5fbd\u6062\u86d4\u56de\u6bc1\u6094\u6167\u5349\u60e0\u6666\u8d3f\u79fd\u4f1a\u70e9\u6c47\u8bb3\u8bf2\u7ed8\u8bd9\u8334\u835f\u8559\u54d5\u5599\u96b3\u6d04\u5f57\u7f0b\u73f2\u6656\u605a\u867a\u87ea\u9ebe",
    "hun": "\u8364\u660f\u5a5a\u9b42\u6d51\u6df7\u8be8\u9984\u960d\u6eb7\u7f17",
    "huo": "\u8c41\u6d3b\u4f19\u706b\u83b7\u6216\u60d1\u970d\u8d27\u7978\u6509\u56af\u5925\u94ac\u952a\u956c\u8020\u8816",
    "ji": "\u51fb\u573e\u57fa\u673a\u7578\u7a3d\u79ef\u7b95\u808c\u9965\u8ff9\u6fc0\u8ba5\u9e21\u59ec\u7ee9\u7f09\u5409\u6781\u68d8\u8f91\u7c4d\u96c6\u53ca\u6025\u75be\u6c72\u5373\u5ac9\u7ea7\u6324\u51e0\u810a\u5df1\u84df\u6280\u5180\u5b63\u4f0e\u796d\u5242\u60b8\u6d4e\u5bc4\u5bc2\u8ba1\u8bb0\u65e2\u5fcc\u9645\u5993\u7ee7\u7eaa\u5c45\u4e0c\u4e69\u525e\u4f76\u4f74\u8114\u58bc\u82a8\u82b0\u8401\u84ba\u857a\u638e\u53fd\u54ad\u54dc\u5527\u5c8c\u5d74\u6d0e\u5f50\u5c50\u9aa5\u757f\u7391\u696b\u6b9b\u621f\u6222\u8d4d\u89ca\u7284\u9f51\u77f6\u7f81\u5d47\u7a37\u7620\u7635\u866e\u7b08\u7b04\u66a8\u8dfb\u8dfd\u9701\u9c9a\u9cab\u9afb\u9e82",
    "jia": "\u5609\u67b7\u5939\u4f73\u5bb6\u52a0\u835a\u988a\u8d3e\u7532\u94be\u5047\u7a3c\u4ef7\u67b6\u9a7e\u5ac1\u4f3d\u90cf\u62ee\u5cac\u6d43\u8fe6\u73c8\u621b\u80db\u605d\u94d7\u9553\u75c2\u86f1\u7b33\u8888\u8dcf",
    "jian": "\u6b7c\u76d1\u575a\u5c16\u7b3a\u95f4\u714e\u517c\u80a9\u8270\u5978\u7f04\u8327\u68c0\u67ec\u78b1\u7877\u62e3\u6361\u7b80\u4fed\u526a\u51cf\u8350\u69db\u9274\u8df5\u8d31\u89c1\u952e\u7bad\u4ef6\u5065\u8230\u5251\u996f\u6e10\u6e85\u6da7\u5efa\u50ed\u8c0f\u8c2b\u83c5\u84b9\u641b\u56dd\u6e54\u8e47\u8b07\u7f23\u67a7\u67d9\u6957\u620b\u622c\u726e\u728d\u6bfd\u8171\u7751\u950f\u9e63\u88e5\u7b15\u7bb4\u7fe6\u8dbc\u8e3a\u9ca3\u97af",
    "jiang": "\u50f5\u59dc\u5c06\u6d46\u6c5f\u7586\u848b\u6868\u5956\u8bb2\u5320\u9171\u964d\u8333\u6d1a\u7edb\u7f30\u729f\u7913\u8029\u7ce8\u8c47",
    "jiao": "\u8549\u6912\u7901\u7126\u80f6\u4ea4\u90ca\u6d47\u9a84\u5a07\u56bc\u6405\u94f0\u77eb\u4fa5\u811a\u72e1\u89d2\u997a\u7f34\u7ede\u527f\u6559\u9175\u8f7f\u8f83\u53eb\u4f7c\u50ec\u832d\u6322\u564d\u5ce4\u5fbc\u59e3\u7e9f\u656b\u768e\u9e6a\u86df\u91ae\u8de4\u9c9b",
    "jie": "\u7a96\u63ed\u63a5\u7686\u79f8\u8857\u9636\u622a\u52ab\u8282\u6854\u6770\u6377\u776b\u7aed\u6d01\u7ed3\u89e3\u59d0\u6212\u85c9\u82a5\u754c\u501f\u4ecb\u75a5\u8beb\u5c4a\u5048\u8ba6\u8bd8\u5588\u55df\u736c\u5a55\u5b51\u6840\u7352\u78a3\u9534\u7596\u88b7\u9889\u86a7\u7faf\u9c92\u9ab1\u9aeb",
    "jin": "\u5dfe\u7b4b\u65a4\u91d1\u4eca\u6d25\u895f\u7d27\u9526\u4ec5\u8c28\u8fdb\u9773\u664b\u7981\u8fd1\u70ec\u6d78\u5c3d\u537a\u8369\u5807\u5664\u9991\u5ed1\u5997\u7f19\u747e\u69ff\u8d46\u89d0\u9485\u9513\u887f\u77dc",
    "jing": "\u52b2\u8346\u5162\u830e\u775b\u6676\u9cb8\u4eac\u60ca\u7cbe\u7cb3\u7ecf\u4e95\u8b66\u666f\u9888\u9759\u5883\u656c\u955c\u5f84\u75c9\u9756\u7adf\u7ade\u51c0\u522d\u5106\u9631\u83c1\u734d\u61ac\u6cfe\u8ff3\u5f2a\u5a67\u80bc\u80eb\u8148\u65cc",
    "jiong": "\u70af\u7a98\u5182\u8fe5\u6243",
    "jiu": "\u63ea\u7a76\u7ea0\u7396\u97ed\u4e45\u7078\u4e5d\u9152\u53a9\u6551\u65e7\u81fc\u8205\u548e\u5c31\u759a\u50e6\u557e\u9604\u67e9\u6855\u9e6b\u8d73\u9b0f",
    "ju": "\u97a0\u62d8\u72d9\u75bd\u9a79\u83ca\u5c40\u5480\u77e9\u4e3e\u6cae\u805a\u62d2\u636e\u5de8\u5177\u8ddd\u8e1e\u952f\u4ff1\u53e5\u60e7\u70ac\u5267\u5028\u8bb5\u82e3\u82f4\u8392\u63ac\u907d\u5c66\u741a\u67b8\u6910\u6998\u6989\u6a58\u728b\u98d3\u949c\u9514\u7aad\u88fe\u8d84\u91b5\u8e3d\u9f83\u96ce\u97ab",
    "juan": "\u6350\u9e43\u5a1f\u5026\u7737\u5377\u7ee2\u9104\u72f7\u6d93\u684a\u8832\u9529\u954c\u96bd",
    "jue": "\u6485\u652b\u6289\u6398\u5014\u7235\u89c9\u51b3\u8bc0\u7edd\u53a5\u5282\u8c32\u77cd\u8568\u5658\u5d1b\u7357\u5b53\u73cf\u6877\u6a5b\u721d\u9562\u8e76\u89d6",
    "jun": "\u5747\u83cc\u94a7\u519b\u541b\u5cfb\u4fca\u7ae3\u6d5a\u90e1\u9a8f\u6343\u72fb\u76b2\u7b60\u9e87",
    "ka": "\u5580\u5496\u5361\u4f67\u5494\u80e9",
    "ke": "\u54af\u5777\u82db\u67ef\u68f5\u78d5\u9897\u79d1\u58f3\u54b3\u53ef\u6e34\u514b\u523b\u5ba2\u8bfe\u5ca2\u606a\u6e98\u9a92\u7f02\u73c2\u8f72\u6c2a\u778c\u94b6\u75b4\u7aa0\u874c\u9ac1",
    "kai": "\u5f00\u63e9\u6977\u51ef\u6168\u5240\u57b2\u8488\u5ffe\u607a\u94e0\u950e",
    "kan": "\u520a\u582a\u52d8\u574e\u780d\u770b\u4f83\u51f5\u83b0\u83b6\u6221\u9f9b\u77b0",
    "kang": "\u5eb7\u6177\u7ce0\u625b\u6297\u4ea2\u7095\u5751\u4f09\u95f6\u94aa",
    "kao": "\u8003\u62f7\u70e4\u9760\u5c3b\u6832\u7292\u94d0",
    "ken": "\u80af\u5543\u57a6\u6073\u57a0\u88c9\u9880",
    "keng": "\u542d\u5fd0\u94ff",
    "kong": "\u7a7a\u6050\u5b54\u63a7\u5025\u5d06\u7b9c",
    "kou": "\u62a0\u53e3\u6263\u5bc7\u82a4\u853b\u53e9\u770d\u7b58",
    "ku": "\u67af\u54ed\u7a9f\u82e6\u9177\u5e93\u88e4\u5233\u5800\u55be\u7ed4\u9ab7",
    "kua": "\u5938\u57ae\u630e\u8de8\u80ef\u4f89",
    "kuai": "\u5757\u7b77\u4fa9\u5feb\u84af\u90d0\u8489\u72ef\u810d",
    "kuan": "\u5bbd\u6b3e\u9acb",
    "kuang": "\u5321\u7b50\u72c2\u6846\u77ff\u7736\u65f7\u51b5\u8bd3\u8bf3\u909d\u5739\u593c\u54d0\u7ea9\u8d36",
    "kui": "\u4e8f\u76d4\u5cbf\u7aa5\u8475\u594e\u9b41\u5080\u9988\u6127\u6e83\u9997\u532e\u5914\u9697\u63c6\u55b9\u559f\u609d\u6126\u9615\u9035\u668c\u777d\u8069\u8770\u7bd1\u81fe\u8dec",
    "kun": "\u5764\u6606\u6346\u56f0\u6083\u9603\u7428\u951f\u918c\u9cb2\u9ae1",
    "kuo": "\u62ec\u6269\u5ed3\u9614\u86de",
    "la": "\u5783\u62c9\u5587\u8721\u814a\u8fa3\u5566\u524c\u647a\u908b\u65ef\u782c\u760c",
    "lai": "\u83b1\u6765\u8d56\u5d03\u5f95\u6d9e\u6fd1\u8d49\u7750\u94fc\u765e\u7c41",
    "lan": "\u84dd\u5a6a\u680f\u62e6\u7bee\u9611\u5170\u6f9c\u8c30\u63fd\u89c8\u61d2\u7f06\u70c2\u6ee5\u5549\u5c9a\u61d4\u6f24\u6984\u6593\u7f71\u9567\u8934",
    "lang": "\u7405\u6994\u72fc\u5eca\u90ce\u6717\u6d6a\u83a8\u8497\u5577\u9606\u9512\u7a02\u8782",
    "lao": "\u635e\u52b3\u7262\u8001\u4f6c\u59e5\u916a\u70d9\u6d9d\u5520\u5d02\u6833\u94d1\u94f9\u75e8\u91aa",
    "le": "\u52d2\u4e50\u808b\u4ec2\u53fb\u561e\u6cd0\u9cd3",
    "lei": "\u96f7\u956d\u857e\u78ca\u7d2f\u5121\u5792\u64c2\u7c7b\u6cea\u7fb8\u8bd4\u837d\u54a7\u6f2f\u5ad8\u7f27\u6a91\u8012\u9179",
    "ling": "\u68f1\u51b7\u62ce\u73b2\u83f1\u96f6\u9f84\u94c3\u4f36\u7f9a\u51cc\u7075\u9675\u5cad\u9886\u53e6\u4ee4\u9143\u5844\u82d3\u5464\u56f9\u6ce0\u7eeb\u67c3\u68c2\u74f4\u8046\u86c9\u7fce\u9cae",
    "leng": "\u695e\u6123",
    "li": "\u5398\u68a8\u7281\u9ece\u7bf1\u72f8\u79bb\u6f13\u7406\u674e\u91cc\u9ca4\u793c\u8389\u8354\u540f\u6817\u4e3d\u5389\u52b1\u783e\u5386\u5229\u5088\u4f8b\u4fd0\u75e2\u7acb\u7c92\u6ca5\u96b6\u529b\u7483\u54e9\u4fea\u4fda\u90e6\u575c\u82c8\u8385\u84e0\u85dc\u6369\u5456\u5533\u55b1\u7301\u6ea7\u6fa7\u9026\u5a0c\u5ae0\u9a8a\u7f21\u73de\u67a5\u680e\u8f79\u623e\u783a\u8a48\u7f79\u9502\u9e42\u75a0\u75ac\u86ce\u870a\u8821\u7b20\u7be5\u7c9d\u91b4\u8dde\u96f3\u9ca1\u9ce2\u9ee7",
    "lian": "\u4fe9\u8054\u83b2\u8fde\u9570\u5ec9\u601c\u6d9f\u5e18\u655b\u8138\u94fe\u604b\u70bc\u7ec3\u631b\u8539\u5941\u6f4b\u6fc2\u5a08\u740f\u695d\u6b93\u81c1\u81a6\u88e2\u880a\u9ca2",
    "liang": "\u7cae\u51c9\u6881\u7cb1\u826f\u4e24\u8f86\u91cf\u667e\u4eae\u8c05\u589a\u690b\u8e09\u9753\u9b49",
    "liao": "\u64a9\u804a\u50da\u7597\u71ce\u5be5\u8fbd\u6f66\u4e86\u6482\u9563\u5ed6\u6599\u84fc\u5c25\u5639\u7360\u5bee\u7f2d\u948c\u9e69\u8022",
    "lie": "\u5217\u88c2\u70c8\u52a3\u730e\u51bd\u57d2\u6d0c\u8d94\u8e90\u9b23",
    "lin": "\u7433\u6797\u78f7\u9716\u4e34\u90bb\u9cde\u6dcb\u51db\u8d41\u541d\u853a\u5d99\u5eea\u9074\u6aa9\u8f9a\u77b5\u7cbc\u8e8f\u9e9f",
    "liu": "\u6e9c\u7409\u69b4\u786b\u998f\u7559\u5218\u7624\u6d41\u67f3\u516d\u62a1\u507b\u848c\u6cd6\u6d4f\u905b\u9a9d\u7efa\u65d2\u7198\u950d\u954f\u9e68\u938f",
    "long": "\u9f99\u804b\u5499\u7b3c\u7abf\u9686\u5784\u62e2\u9647\u5f04\u5785\u830f\u6cf7\u73d1\u680a\u80e7\u783b\u7643",
    "lou": "\u697c\u5a04\u6402\u7bd3\u6f0f\u964b\u55bd\u5d5d\u9542\u7618\u8027\u877c\u9ac5",
    "lu": "\u82a6\u5362\u9885\u5e90\u7089\u63b3\u5364\u864f\u9c81\u9e93\u788c\u9732\u8def\u8d42\u9e7f\u6f5e\u7984\u5f55\u9646\u622e\u5786\u6445\u64b8\u565c\u6cf8\u6e0c\u6f09\u7490\u680c\u6a79\u8f73\u8f82\u8f98\u6c07\u80ea\u9565\u9e2c\u9e6d\u7c0f\u823b\u9c88",
    "lv": "\u9a74\u5415\u94dd\u4fa3\u65c5\u5c65\u5c61\u7f15\u8651\u6c2f\u5f8b\u7387\u6ee4\u7eff\u634b\u95fe\u6988\u8182\u7a06\u891b",
    "luan": "\u5ce6\u5b6a\u6ee6\u5375\u4e71\u683e\u9e3e\u92ae",
    "lue": "\u63a0\u7565\u950a",
    "lun": "\u8f6e\u4f26\u4ed1\u6ca6\u7eb6\u8bba\u56f5",
    "luo": "\u841d\u87ba\u7f57\u903b\u9523\u7ba9\u9aa1\u88f8\u843d\u6d1b\u9a86\u7edc\u502e\u8366\u645e\u7321\u6cfa\u6924\u8136\u9559\u7630\u96d2",
    "ma": "\u5988\u9ebb\u739b\u7801\u8682\u9a6c\u9a82\u561b\u5417\u551b\u72b8\u5b37\u6769\u9ebd",
    "mai": "\u57cb\u4e70\u9ea6\u5356\u8fc8\u8109\u52a2\u836c\u54aa\u973e",
    "man": "\u7792\u9992\u86ee\u6ee1\u8513\u66fc\u6162\u6f2b\u8c29\u5881\u5e54\u7f26\u71b3\u9558\u989f\u87a8\u9cd7\u9794",
    "mang": "\u8292\u832b\u76f2\u5fd9\u83bd\u9099\u6f2d\u6726\u786d\u87d2",
    "meng": "\u6c13\u840c\u8499\u6aac\u76df\u9530\u731b\u68a6\u5b5f\u52d0\u750d\u77a2\u61f5\u791e\u867b\u8722\u8813\u824b\u8268\u9efe",
    "miao": "\u732b\u82d7\u63cf\u7784\u85d0\u79d2\u6e3a\u5e99\u5999\u55b5\u9088\u7f08\u7f2a\u676a\u6dfc\u7707\u9e4b\u8731",
    "mao": "\u8305\u951a\u6bdb\u77db\u94c6\u536f\u8302\u5192\u5e3d\u8c8c\u8d38\u4f94\u88a4\u52d6\u8306\u5cc1\u7441\u6634\u7266\u8004\u65c4\u61cb\u7780\u86d1\u8765\u87ca\u9ae6",
    "me": "\u4e48",
    "mei": "\u73ab\u679a\u6885\u9176\u9709\u7164\u6ca1\u7709\u5a92\u9541\u6bcf\u7f8e\u6627\u5bd0\u59b9\u5a9a\u5776\u8393\u5d4b\u7338\u6d7c\u6e44\u6963\u9545\u9e5b\u8882\u9b45",
    "men": "\u95e8\u95f7\u4eec\u626a\u739f\u7116\u61d1\u9494",
    "mi": "\u772f\u919a\u9761\u7cdc\u8ff7\u8c1c\u5f25\u7c73\u79d8\u89c5\u6ccc\u871c\u5bc6\u5e42\u8288\u5196\u8c27\u863c\u5627\u7315\u736f\u6c68\u5b93\u5f2d\u8112\u6549\u7cf8\u7e3b\u9e8b",
    "mian": "\u68c9\u7720\u7ef5\u5195\u514d\u52c9\u5a29\u7f05\u9762\u6c94\u6e4e\u817c\u7704",
    "mie": "\u8511\u706d\u54a9\u881b\u7bfe",
    "min": "\u6c11\u62bf\u76bf\u654f\u60af\u95fd\u82e0\u5cb7\u95f5\u6cef\u73c9",
    "ming": "\u660e\u879f\u9e23\u94ed\u540d\u547d\u51a5\u8317\u6e9f\u669d\u7791\u9169",
    "miu": "\u8c2c",
    "mo": "\u6478\u6479\u8611\u6a21\u819c\u78e8\u6469\u9b54\u62b9\u672b\u83ab\u58a8\u9ed8\u6cab\u6f20\u5bde\u964c\u8c1f\u8309\u84e6\u998d\u5aeb\u9546\u79e3\u763c\u8031\u87c6\u8c8a\u8c98",
    "mou": "\u8c0b\u725f\u67d0\u53b6\u54de\u5a7a\u7738\u936a",
    "mu": "\u62c7\u7261\u4ea9\u59c6\u6bcd\u5893\u66ae\u5e55\u52df\u6155\u6728\u76ee\u7766\u7267\u7a46\u4eeb\u82dc\u5452\u6c90\u6bea\u94bc",
    "na": "\u62ff\u54ea\u5450\u94a0\u90a3\u5a1c\u7eb3\u5185\u637a\u80ad\u954e\u8872\u7bac",
    "nai": "\u6c16\u4e43\u5976\u8010\u5948\u9f10\u827f\u8418\u67f0",
    "nan": "\u5357\u7537\u96be\u56ca\u5583\u56e1\u6960\u8169\u877b\u8d67",
    "nao": "\u6320\u8111\u607c\u95f9\u5b6c\u57b4\u7331\u7459\u7847\u94d9\u86f2",
    "ne": "\u6dd6\u5462\u8bb7",
    "nei": "\u9981",
    "nen": "\u5ae9\u80fd\u6798\u6041",
    "ni": "\u59ae\u9713\u502a\u6ce5\u5c3c\u62df\u4f60\u533f\u817b\u9006\u6eba\u4f32\u576d\u730a\u6029\u6ee0\u6635\u65ce\u7962\u615d\u7768\u94cc\u9cb5",
    "nian": "\u852b\u62c8\u5e74\u78be\u64b5\u637b\u5ff5\u5eff\u8f87\u9ecf\u9c87\u9cb6",
    "niang": "\u5a18\u917f",
    "niao": "\u9e1f\u5c3f\u8311\u5b32\u8132\u8885",
    "nie": "\u634f\u8042\u5b7d\u556e\u954a\u954d\u6d85\u4e5c\u9667\u8616\u55eb\u8080\u989e\u81ec\u8e51",
    "nin": "\u60a8\u67e0",
    "ning": "\u72de\u51dd\u5b81\u62e7\u6cde\u4f5e\u84e5\u549b\u752f\u804d",
    "niu": "\u725b\u626d\u94ae\u7ebd\u72c3\u5ff8\u599e\u86b4",
    "nong": "\u8113\u6d53\u519c\u4fac",
    "nu": "\u5974\u52aa\u6012\u5476\u5e11\u5f29\u80ec\u5b65\u9a7d",
    "nv": "\u5973\u6067\u9495\u8844",
    "nuan": "\u6696",
    "nuenue": "\u8650",
    "nue": "\u759f\u8c11",
    "nuo": "\u632a\u61e6\u7cef\u8bfa\u50a9\u6426\u558f\u9518",
    "ou": "\u54e6\u6b27\u9e25\u6bb4\u85d5\u5455\u5076\u6ca4\u6004\u74ef\u8026",
    "pa": "\u556a\u8db4\u722c\u5e15\u6015\u7436\u8469\u7b62",
    "pai": "\u62cd\u6392\u724c\u5f98\u6e43\u6d3e\u4ff3\u848e",
    "pan": "\u6500\u6f58\u76d8\u78d0\u76fc\u7554\u5224\u53db\u723f\u6cee\u88a2\u897b\u87e0\u8e52",
    "pang": "\u4e53\u5e9e\u65c1\u802a\u80d6\u6ec2\u9004",
    "pao": "\u629b\u5486\u5228\u70ae\u888d\u8dd1\u6ce1\u530f\u72cd\u5e96\u812c\u75b1",
    "pei": "\u5478\u80da\u57f9\u88f4\u8d54\u966a\u914d\u4f69\u6c9b\u638a\u8f94\u5e14\u6de0\u65c6\u952b\u9185\u9708",
    "pen": "\u55b7\u76c6\u6e53",
    "peng": "\u7830\u62a8\u70f9\u6f8e\u5f6d\u84ec\u68da\u787c\u7bf7\u81a8\u670b\u9e4f\u6367\u78b0\u576f\u580b\u562d\u6026\u87db",
    "pi": "\u7812\u9739\u6279\u62ab\u5288\u7435\u6bd7\u5564\u813e\u75b2\u76ae\u5339\u75de\u50fb\u5c41\u8b6c\u4e15\u9674\u90b3\u90eb\u572e\u9f19\u64d7\u567c\u5e80\u5ab2\u7eb0\u6787\u7513\u7765\u7f74\u94cd\u75e6\u7656\u758b\u868d\u8c94",
    "pian": "\u7bc7\u504f\u7247\u9a97\u8c1d\u9a88\u728f\u80fc\u890a\u7fe9\u8e41",
    "piao": "\u98d8\u6f02\u74e2\u7968\u527d\u560c\u5ad6\u7f25\u6b8d\u779f\u87b5",
    "pie": "\u6487\u77a5\u4e3f\u82e4\u6c15",
    "pin": "\u62fc\u9891\u8d2b\u54c1\u8058\u62da\u59d8\u5ad4\u6980\u725d\u98a6",
    "ping": "\u4e52\u576a\u82f9\u840d\u5e73\u51ed\u74f6\u8bc4\u5c4f\u4fdc\u5a09\u67b0\u9c86",
    "po": "\u5761\u6cfc\u9887\u5a46\u7834\u9b44\u8feb\u7c95\u53f5\u9131\u6ea5\u73c0\u948b\u94b7\u76a4\u7b38",
    "pou": "\u5256\u88d2\u8e23",
    "pu": "\u6251\u94fa\u4ec6\u8386\u8461\u83e9\u84b2\u57d4\u6734\u5703\u666e\u6d66\u8c31\u66dd\u7011\u530d\u5657\u6fee\u749e\u6c06\u9564\u9568\u8e7c",
    "qi": "\u671f\u6b3a\u6816\u621a\u59bb\u4e03\u51c4\u6f06\u67d2\u6c8f\u5176\u68cb\u5947\u6b67\u7566\u5d0e\u8110\u9f50\u65d7\u7948\u7941\u9a91\u8d77\u5c82\u4e5e\u4f01\u542f\u5951\u780c\u5668\u6c14\u8fc4\u5f03\u6c7d\u6ce3\u8bab\u4e9f\u4e93\u573b\u8291\u840b\u847a\u5601\u5c7a\u5c90\u6c54\u6dc7\u9a90\u7eee\u742a\u7426\u675e\u6864\u69ed\u6b39\u797a\u61a9\u789b\u86f4\u871e\u7da6\u7dae\u8dbf\u8e4a\u9ccd\u9e92",
    "qia": "\u6390\u6070\u6d3d\u845c",
    "qian": "\u7275\u6266\u948e\u94c5\u5343\u8fc1\u7b7e\u4edf\u8c26\u4e7e\u9ed4\u94b1\u94b3\u524d\u6f5c\u9063\u6d45\u8c34\u5811\u5d4c\u6b20\u6b49\u4f65\u9621\u828a\u82a1\u8368\u63ae\u5c8d\u60ad\u614a\u9a9e\u6434\u8930\u7f31\u6920\u80b7\u6106\u94a4\u8654\u7b9d",
    "qiang": "\u67aa\u545b\u8154\u7f8c\u5899\u8537\u5f3a\u62a2\u5af1\u6a2f\u6217\u709d\u9516\u9535\u956a\u8941\u8723\u7f9f\u8deb\u8dc4",
    "qiao": "\u6a47\u9539\u6572\u6084\u6865\u77a7\u4e54\u4fa8\u5de7\u9798\u64ac\u7fd8\u5ced\u4fcf\u7a8d\u5281\u8bee\u8c2f\u835e\u6100\u6194\u7f32\u6a35\u6bf3\u7857\u8df7\u9792",
    "qie": "\u5207\u8304\u4e14\u602f\u7a83\u90c4\u553c\u60ec\u59be\u6308\u9532\u7ba7",
    "qin": "\u94a6\u4fb5\u4eb2\u79e6\u7434\u52e4\u82b9\u64d2\u79bd\u5bdd\u6c81\u82a9\u84c1\u8572\u63ff\u5423\u55ea\u5659\u6eb1\u6a8e\u8793\u887e",
    "qing": "\u9752\u8f7b\u6c22\u503e\u537f\u6e05\u64ce\u6674\u6c30\u60c5\u9877\u8bf7\u5e86\u5029\u82d8\u570a\u6aa0\u78ec\u873b\u7f44\u7b90\u8b26\u9cad\u9ee5",
    "qiong": "\u743c\u7a77\u909b\u8315\u7a79\u7b47\u928e",
    "qiu": "\u79cb\u4e18\u90b1\u7403\u6c42\u56da\u914b\u6cc5\u4fc5\u6c3d\u5def\u827d\u72b0\u6e6b\u9011\u9052\u6978\u8d47\u9e20\u866c\u86af\u8764\u88d8\u7cd7\u9cc5\u9f3d",
    "qu": "\u8d8b\u533a\u86c6\u66f2\u8eaf\u5c48\u9a71\u6e20\u53d6\u5a36\u9f8b\u8da3\u53bb\u8bce\u52ac\u8556\u8627\u5c96\u8862\u9612\u74a9\u89d1\u6c0d\u795b\u78f2\u766f\u86d0\u883c\u9eb4\u77bf\u9ee2",
    "quan": "\u5708\u98a7\u6743\u919b\u6cc9\u5168\u75ca\u62f3\u72ac\u5238\u529d\u8be0\u8343\u737e\u609b\u7efb\u8f81\u754e\u94e8\u8737\u7b4c\u9b08",
    "que": "\u7f3a\u7094\u7638\u5374\u9e4a\u69b7\u786e\u96c0\u9619\u60ab",
    "qun": "\u88d9\u7fa4\u9021",
    "ran": "\u7136\u71c3\u5189\u67d3\u82d2\u9aef",
    "rang": "\u74e4\u58e4\u6518\u56b7\u8ba9\u79b3\u7a70",
    "rao": "\u9976\u6270\u7ed5\u835b\u5a06\u6861",
    "ruo": "\u60f9\u82e5\u5f31",
    "re": "\u70ed\u504c",
    "ren": "\u58ec\u4ec1\u4eba\u5fcd\u97e7\u4efb\u8ba4\u5203\u598a\u7eab\u4ede\u834f\u845a\u996a\u8f6b\u7a14\u887d",
    "reng": "\u6254\u4ecd",
    "ri": "\u65e5",
    "rong": "\u620e\u8338\u84c9\u8363\u878d\u7194\u6eb6\u5bb9\u7ed2\u5197\u5d58\u72e8\u7f1b\u6995\u877e",
    "rou": "\u63c9\u67d4\u8089\u7cc5\u8e42\u97a3",
    "ru": "\u8339\u8815\u5112\u5b7a\u5982\u8fb1\u4e73\u6c5d\u5165\u8925\u84d0\u85b7\u5685\u6d33\u6ebd\u6fe1\u94f7\u8966\u98a5",
    "ruan": "\u8f6f\u962e\u670a",
    "rui": "\u854a\u745e\u9510\u82ae\u8564\u777f\u868b",
    "run": "\u95f0\u6da6",
    "sa": "\u6492\u6d12\u8428\u5345\u4ee8\u6332\u98d2",
    "sai": "\u816e\u9cc3\u585e\u8d5b\u567b",
    "san": "\u4e09\u53c1\u4f1e\u6563\u5f61\u9993\u6c35\u6bf5\u7cc1\u9730",
    "sang": "\u6851\u55d3\u4e27\u6421\u78c9\u98a1",
    "sao": "\u6414\u9a9a\u626b\u5ac2\u57fd\u81ca\u7619\u9ccb",
    "se": "\u745f\u8272\u6da9\u556c\u94e9\u94ef\u7a51",
    "sen": "\u68ee",
    "seng": "\u50e7",
    "sha": "\u838e\u7802\u6740\u5239\u6c99\u7eb1\u50bb\u5565\u715e\u810e\u6b43\u75e7\u88df\u970e\u9ca8",
    "shai": "\u7b5b\u6652\u917e",
    "shan": "\u73ca\u82eb\u6749\u5c71\u5220\u717d\u886b\u95ea\u9655\u64c5\u8d61\u81b3\u5584\u6c55\u6247\u7f2e\u5261\u8baa\u912f\u57cf\u829f\u6f78\u59d7\u9a9f\u81bb\u9490\u759d\u87ee\u8222\u8dda\u9cdd",
    "shang": "\u5892\u4f24\u5546\u8d4f\u664c\u4e0a\u5c1a\u88f3\u57a7\u7ef1\u6b87\u71b5\u89de",
    "shao": "\u68a2\u634e\u7a0d\u70e7\u828d\u52fa\u97f6\u5c11\u54e8\u90b5\u7ecd\u52ad\u82d5\u6f72\u86f8\u7b24\u7b72\u8244",
    "she": "\u5962\u8d4a\u86c7\u820c\u820d\u8d66\u6444\u5c04\u6151\u6d89\u793e\u8bbe\u538d\u4f58\u731e\u7572\u9e9d",
    "shen": "\u7837\u7533\u547b\u4f38\u8eab\u6df1\u5a20\u7ec5\u795e\u6c88\u5ba1\u5a76\u751a\u80be\u614e\u6e17\u8bdc\u8c02\u5432\u54c2\u6e16\u6939\u77e7\u8703",
    "sheng": "\u58f0\u751f\u7525\u7272\u5347\u7ef3\u7701\u76db\u5269\u80dc\u5723\u4e1e\u6e11\u5ab5\u771a\u7b19",
    "shi": "\u5e08\u5931\u72ee\u65bd\u6e7f\u8bd7\u5c38\u8671\u5341\u77f3\u62fe\u65f6\u4ec0\u98df\u8680\u5b9e\u8bc6\u53f2\u77e2\u4f7f\u5c4e\u9a76\u59cb\u5f0f\u793a\u58eb\u4e16\u67ff\u4e8b\u62ed\u8a93\u901d\u52bf\u662f\u55dc\u566c\u9002\u4ed5\u4f8d\u91ca\u9970\u6c0f\u5e02\u6043\u5ba4\u89c6\u8bd5\u8c25\u57d8\u83b3\u84cd\u5f11\u5511\u9963\u8f7c\u8006\u8d33\u70bb\u793b\u94c8\u94ca\u87ab\u8210\u7b6e\u8c55\u9ca5\u9cba",
    "shou": "\u6536\u624b\u9996\u5b88\u5bff\u6388\u552e\u53d7\u7626\u517d\u624c\u72e9\u7ef6\u824f",
    "shu": "\u852c\u67a2\u68b3\u6b8a\u6292\u8f93\u53d4\u8212\u6dd1\u758f\u4e66\u8d4e\u5b70\u719f\u85af\u6691\u66d9\u7f72\u8700\u9ecd\u9f20\u5c5e\u672f\u8ff0\u6811\u675f\u620d\u7ad6\u5885\u5eb6\u6570\u6f31\u6055\u500f\u587e\u83fd\u5fc4\u6cad\u6d91\u6f8d\u59dd\u7ebe\u6bf9\u8167\u6bb3\u956f\u79eb\u9e6c",
    "shua": "\u5237\u800d\u5530\u6dae",
    "shuai": "\u6454\u8870\u7529\u5e05\u87c0",
    "shuan": "\u6813\u62f4\u95e9",
    "shuang": "\u971c\u53cc\u723d\u5b40",
    "shui": "\u8c01\u6c34\u7761\u7a0e",
    "shun": "\u542e\u77ac\u987a\u821c\u6042",
    "shuo": "\u8bf4\u7855\u6714\u70c1\u84b4\u6420\u55cd\u6fef\u5981\u69ca\u94c4",
    "si": "\u65af\u6495\u5636\u601d\u79c1\u53f8\u4e1d\u6b7b\u8086\u5bfa\u55e3\u56db\u4f3a\u4f3c\u9972\u5df3\u53ae\u4fdf\u5155\u83e5\u549d\u6c5c\u6cd7\u6f8c\u59d2\u9a77\u7f0c\u7940\u7960\u9536\u9e36\u801c\u86f3\u7b25",
    "song": "\u677e\u8038\u6002\u9882\u9001\u5b8b\u8bbc\u8bf5\u51c7\u83d8\u5d27\u5d69\u5fea\u609a\u6dde\u7ae6",
    "sou": "\u641c\u8258\u64de\u55fd\u53df\u55d6\u55fe\u998a\u6eb2\u98d5\u778d\u953c\u878b",
    "su": "\u82cf\u9165\u4fd7\u7d20\u901f\u7c9f\u50f3\u5851\u6eaf\u5bbf\u8bc9\u8083\u5919\u8c21\u850c\u55c9\u612b\u7c0c\u89eb\u7a23",
    "suan": "\u9178\u849c\u7b97",
    "sui": "\u867d\u968b\u968f\u7ee5\u9ad3\u788e\u5c81\u7a57\u9042\u96a7\u795f\u84d1\u51ab\u8c07\u6fc9\u9083\u71e7\u772d\u7762",
    "sun": "\u5b59\u635f\u7b0b\u836a\u72f2\u98e7\u69ab\u8de3\u96bc",
    "suo": "\u68ad\u5506\u7f29\u7410\u7d22\u9501\u6240\u5522\u55e6\u5a11\u686b\u7743\u7fa7",
    "ta": "\u584c\u4ed6\u5b83\u5979\u5854\u736d\u631e\u8e4b\u8e0f\u95fc\u6ebb\u9062\u69bb\u6c93",
    "tai": "\u80ce\u82d4\u62ac\u53f0\u6cf0\u915e\u592a\u6001\u6c70\u90b0\u85b9\u80bd\u70b1\u949b\u8dc6\u9c90",
    "tan": "\u574d\u644a\u8d2a\u762b\u6ee9\u575b\u6a80\u75f0\u6f6d\u8c2d\u8c08\u5766\u6bef\u8892\u78b3\u63a2\u53f9\u70ad\u90ef\u8548\u6619\u94bd\u952c\u8983",
    "tang": "\u6c64\u5858\u642a\u5802\u68e0\u819b\u5510\u7cd6\u50a5\u9967\u6e8f\u746d\u94f4\u9557\u8025\u8797\u87b3\u7fb0\u91a3",
    "thang": "\u5018\u8eba\u6dcc",
    "theng": "\u8d9f\u70eb",
    "tao": "\u638f\u6d9b\u6ed4\u7ee6\u8404\u6843\u9003\u6dd8\u9676\u8ba8\u5957\u6311\u9f17\u5555\u97ec\u9955",
    "te": "\u7279",
    "teng": "\u85e4\u817e\u75bc\u8a8a\u6ed5",
    "ti": "\u68af\u5254\u8e22\u9511\u63d0\u9898\u8e44\u557c\u4f53\u66ff\u568f\u60d5\u6d95\u5243\u5c49\u8351\u608c\u9016\u7ee8\u7f07\u9e48\u88fc\u918d",
    "tian": "\u5929\u6dfb\u586b\u7530\u751c\u606c\u8214\u8146\u63ad\u5fdd\u9617\u6b84\u754b\u94bf\u86ba",
    "tiao": "\u6761\u8fe2\u773a\u8df3\u4f7b\u7967\u94eb\u7a95\u9f86\u9ca6",
    "tie": "\u8d34\u94c1\u5e16\u841c\u992e",
    "ting": "\u5385\u542c\u70c3\u6c40\u5ef7\u505c\u4ead\u5ead\u633a\u8247\u839b\u8476\u5a77\u6883\u8713\u9706",
    "tong": "\u901a\u6850\u916e\u77b3\u540c\u94dc\u5f64\u7ae5\u6876\u6345\u7b52\u7edf\u75db\u4f5f\u50ee\u4edd\u833c\u55f5\u6078\u6f7c\u783c",
    "tou": "\u5077\u6295\u5934\u900f\u4ea0",
    "tu": "\u51f8\u79c3\u7a81\u56fe\u5f92\u9014\u6d82\u5c60\u571f\u5410\u5154\u580d\u837c\u83df\u948d\u9174",
    "tuan": "\u6e4d\u56e2\u7583",
    "tui": "\u63a8\u9893\u817f\u8715\u892a\u9000\u5fd2\u717a",
    "tun": "\u541e\u5c6f\u81c0\u9968\u66be\u8c5a\u7a80",
    "tuo": "\u62d6\u6258\u8131\u9e35\u9640\u9a6e\u9a7c\u692d\u59a5\u62d3\u553e\u4e47\u4f57\u5768\u5eb9\u6cb1\u67dd\u7823\u7ba8\u8204\u8dce\u9f0d",
    "wa": "\u6316\u54c7\u86d9\u6d3c\u5a03\u74e6\u889c\u4f64\u5a32\u817d",
    "wai": "\u6b6a\u5916",
    "wan": "\u8c4c\u5f2f\u6e7e\u73a9\u987d\u4e38\u70f7\u5b8c\u7897\u633d\u665a\u7696\u60cb\u5b9b\u5a49\u4e07\u8155\u525c\u8284\u82cb\u83c0\u7ea8\u7efe\u742c\u8118\u7579\u873f\u7ba2",
    "wang": "\u6c6a\u738b\u4ea1\u6789\u7f51\u5f80\u65fa\u671b\u5fd8\u5984\u7f54\u5c22\u60d8\u8f8b\u9b4d",
    "wei": "\u5a01\u5dcd\u5fae\u5371\u97e6\u8fdd\u6845\u56f4\u552f\u60df\u4e3a\u6f4d\u7ef4\u82c7\u840e\u59d4\u4f1f\u4f2a\u5c3e\u7eac\u672a\u851a\u5473\u754f\u80c3\u5582\u9b4f\u4f4d\u6e2d\u8c13\u5c09\u6170\u536b\u502d\u504e\u8bff\u9688\u8473\u8587\u5e0f\u5e37\u5d34\u5d6c\u7325\u732c\u95f1\u6ca9\u6d27\u6da0\u9036\u5a13\u73ae\u97ea\u8ece\u709c\u7168\u71a8\u75ff\u8249\u9c94",
    "wen": "\u761f\u6e29\u868a\u6587\u95fb\u7eb9\u543b\u7a33\u7d0a\u95ee\u520e\u6120\u960c\u6c76\u74ba\u97eb\u6b81\u96ef",
    "weng": "\u55e1\u7fc1\u74ee\u84ca\u8579",
    "wo": "\u631d\u8717\u6da1\u7a9d\u6211\u65a1\u5367\u63e1\u6c83\u83b4\u5e44\u6e25\u674c\u809f\u9f8c",
    "wu": "\u5deb\u545c\u94a8\u4e4c\u6c61\u8bec\u5c4b\u65e0\u829c\u68a7\u543e\u5434\u6bcb\u6b66\u4e94\u6342\u5348\u821e\u4f0d\u4fae\u575e\u620a\u96fe\u6664\u7269\u52ff\u52a1\u609f\u8bef\u5140\u4ef5\u9622\u90ac\u572c\u82b4\u5e91\u6003\u5fe4\u6d6f\u5be4\u8fd5\u59a9\u9a9b\u727e\u7110\u9e49\u9e5c\u8708\u92c8\u9f2f",
    "xi": "\u6614\u7199\u6790\u897f\u7852\u77fd\u6670\u563b\u5438\u9521\u727a\u7a00\u606f\u5e0c\u6089\u819d\u5915\u60dc\u7184\u70ef\u6eaa\u6c50\u7280\u6a84\u88ad\u5e2d\u4e60\u5ab3\u559c\u94e3\u6d17\u7cfb\u9699\u620f\u7ec6\u50d6\u516e\u96b0\u90d7\u831c\u8478\u84f0\u595a\u550f\u5f99\u9969\u960b\u6d60\u6dc5\u5c63\u5b09\u73ba\u6a28\u66e6\u89cb\u6b37\u71b9\u798a\u79a7\u94b8\u7699\u7a78\u8725\u87cb\u823e\u7fb2\u7c9e\u7fd5\u91af\u9f37",
    "xia": "\u778e\u867e\u5323\u971e\u8f96\u6687\u5ce1\u4fa0\u72ed\u4e0b\u53a6\u590f\u5413\u6380\u846d\u55c4\u72ce\u9050\u7455\u7856\u7615\u7f45\u9ee0",
    "xian": "\u9528\u5148\u4ed9\u9c9c\u7ea4\u54b8\u8d24\u8854\u8237\u95f2\u6d8e\u5f26\u5acc\u663e\u9669\u73b0\u732e\u53bf\u817a\u9985\u7fa1\u5baa\u9677\u9650\u7ebf\u51bc\u85d3\u5c98\u7303\u66b9\u5a34\u6c19\u7946\u9e47\u75eb\u86ac\u7b45\u7c7c\u9170\u8df9",
    "xiang": "\u76f8\u53a2\u9576\u9999\u7bb1\u8944\u6e58\u4e61\u7fd4\u7965\u8be6\u60f3\u54cd\u4eab\u9879\u5df7\u6a61\u50cf\u5411\u8c61\u8297\u8459\u9977\u5ea0\u9aa7\u7f03\u87d3\u9c9e\u98e8",
    "xiao": "\u8427\u785d\u9704\u524a\u54ee\u56a3\u9500\u6d88\u5bb5\u6dc6\u6653\u5c0f\u5b5d\u6821\u8096\u5578\u7b11\u6548\u54d3\u54bb\u5d24\u6f47\u900d\u9a81\u7ee1\u67ad\u67b5\u7b71\u7bab\u9b48",
    "xie": "\u6954\u4e9b\u6b47\u874e\u978b\u534f\u631f\u643a\u90aa\u659c\u80c1\u8c10\u5199\u68b0\u5378\u87f9\u61c8\u6cc4\u6cfb\u8c22\u5c51\u5055\u4eb5\u52f0\u71ee\u85a4\u64b7\u5ee8\u7023\u9082\u7ec1\u7f2c\u69ad\u698d\u6b59\u8e9e",
    "xin": "\u85aa\u82af\u950c\u6b23\u8f9b\u65b0\u5ffb\u5fc3\u4fe1\u8845\u56df\u99a8\u8398\u6b46\u94fd\u946b",
    "xing": "\u661f\u8165\u7329\u60fa\u5174\u5211\u578b\u5f62\u90a2\u884c\u9192\u5e78\u674f\u6027\u59d3\u9649\u8347\u8365\u64e4\u60bb\u784e",
    "xiong": "\u5144\u51f6\u80f8\u5308\u6c79\u96c4\u718a\u828e",
    "xiu": "\u4f11\u4fee\u7f9e\u673d\u55c5\u9508\u79c0\u8896\u7ee3\u83a0\u5cab\u9990\u5ea5\u9e3a\u8c85\u9af9",
    "xu": "\u589f\u620c\u9700\u865a\u5618\u987b\u5f90\u8bb8\u84c4\u9157\u53d9\u65ed\u5e8f\u755c\u6064\u7d6e\u5a7f\u7eea\u7eed\u8bb4\u8be9\u5729\u84ff\u6035\u6d2b\u6e86\u987c\u6829\u7166\u7809\u76f1\u80e5\u7cc8\u9191",
    "xuan": "\u8f69\u55a7\u5ba3\u60ac\u65cb\u7384\u9009\u7663\u7729\u7eda\u5107\u8c16\u8431\u63ce\u9994\u6ceb\u6d35\u6e32\u6f29\u7487\u6966\u6684\u70ab\u714a\u78b9\u94c9\u955f\u75c3",
    "xue": "\u9774\u859b\u5b66\u7a74\u96ea\u8840\u5671\u6cf6\u9cd5",
    "xun": "\u52cb\u718f\u5faa\u65ec\u8be2\u5bfb\u9a6f\u5de1\u6b89\u6c5b\u8bad\u8baf\u900a\u8fc5\u5dfd\u57d9\u8340\u85b0\u5ccb\u5f87\u6d54\u66db\u7aa8\u91ba\u9c9f",
    "ya": "\u538b\u62bc\u9e26\u9e2d\u5440\u4e2b\u82bd\u7259\u869c\u5d16\u8859\u6daf\u96c5\u54d1\u4e9a\u8bb6\u4f22\u63e0\u5416\u5c88\u8fd3\u5a05\u740a\u6860\u6c29\u7811\u775a\u75d6",
    "yan": "\u7109\u54bd\u9609\u70df\u6df9\u76d0\u4e25\u7814\u8712\u5ca9\u5ef6\u8a00\u989c\u960e\u708e\u6cbf\u5944\u63a9\u773c\u884d\u6f14\u8273\u5830\u71d5\u538c\u781a\u96c1\u5501\u5f66\u7130\u5bb4\u8c1a\u9a8c\u53a3\u9765\u8d5d\u4fe8\u5043\u5156\u8ba0\u8c33\u90fe\u9122\u82ab\u83f8\u5d26\u6079\u95eb\u960f\u6d07\u6e6e\u6edf\u598d\u5ae3\u7430\u664f\u80ed\u814c\u7131\u7f68\u7b75\u917d\u9b47\u990d\u9f39",
    "yang": "\u6b83\u592e\u9e2f\u79e7\u6768\u626c\u4f6f\u75a1\u7f8a\u6d0b\u9633\u6c27\u4ef0\u75d2\u517b\u6837\u6f3e\u5f89\u600f\u6cf1\u7080\u70ca\u6059\u86d8\u9785",
    "yao": "\u9080\u8170\u5996\u7476\u6447\u5c27\u9065\u7a91\u8c23\u59da\u54ac\u8200\u836f\u8981\u8000\u592d\u723b\u5406\u5d3e\u5fad\u7039\u5e7a\u73e7\u6773\u66dc\u80b4\u9e5e\u7a88\u7e47\u9cd0",
    "ye": "\u6930\u564e\u8036\u7237\u91ce\u51b6\u4e5f\u9875\u6396\u4e1a\u53f6\u66f3\u814b\u591c\u6db2\u8c12\u90ba\u63f6\u9980\u6654\u70e8\u94d8",
    "yi": "\u4e00\u58f9\u533b\u63d6\u94f1\u4f9d\u4f0a\u8863\u9890\u5937\u9057\u79fb\u4eea\u80f0\u7591\u6c82\u5b9c\u59e8\u5f5d\u6905\u8681\u501a\u5df2\u4e59\u77e3\u4ee5\u827a\u6291\u6613\u9091\u5c79\u4ebf\u5f79\u81c6\u9038\u8084\u75ab\u4ea6\u88d4\u610f\u6bc5\u5fc6\u4e49\u76ca\u6ea2\u8be3\u8bae\u8c0a\u8bd1\u5f02\u7ffc\u7fcc\u7ece\u5208\u5293\u4f7e\u8bd2\u572a\u572f\u57f8\u61ff\u82e1\u858f\u5f08\u5955\u6339\u5f0b\u5453\u54a6\u54bf\u566b\u5cc4\u5db7\u7317\u9974\u603f\u6021\u6092\u6f2a\u8fe4\u9a7f\u7f22\u6baa\u8d3b\u65d6\u71a0\u9487\u9552\u9571\u75cd\u7617\u7654\u7fca\u8864\u8734\u8223\u7fbf\u7ff3\u914f\u9edf",
    "yin": "\u8335\u836b\u56e0\u6bb7\u97f3\u9634\u59fb\u541f\u94f6\u6deb\u5bc5\u996e\u5c39\u5f15\u9690\u5370\u80e4\u911e\u5819\u831a\u5591\u72fa\u5924\u6c24\u94df\u763e\u8693\u972a\u9f88",
    "ying": "\u82f1\u6a31\u5a74\u9e70\u5e94\u7f28\u83b9\u8424\u8425\u8367\u8747\u8fce\u8d62\u76c8\u5f71\u9896\u786c\u6620\u5b34\u90e2\u8314\u83ba\u8426\u6484\u5624\u81ba\u6ee2\u6f46\u701b\u745b\u748e\u6979\u9e66\u763f\u988d\u7f42",
    "yo": "\u54df\u5537",
    "yong": "\u62e5\u4f63\u81c3\u75c8\u5eb8\u96cd\u8e0a\u86f9\u548f\u6cf3\u6d8c\u6c38\u607f\u52c7\u7528\u4fd1\u58c5\u5889\u6175\u9095\u955b\u752c\u9cd9\u9954",
    "you": "\u5e7d\u4f18\u60a0\u5fe7\u5c24\u7531\u90ae\u94c0\u72b9\u6cb9\u6e38\u9149\u6709\u53cb\u53f3\u4f51\u91c9\u8bf1\u53c8\u5e7c\u5363\u6538\u4f91\u83b8\u5466\u56ff\u5ba5\u67da\u7337\u7256\u94d5\u75a3\u8763\u9c7f\u9edd\u9f2c",
    "yu": "\u8fc2\u6de4\u4e8e\u76c2\u6986\u865e\u611a\u8206\u4f59\u4fde\u903e\u9c7c\u6109\u6e1d\u6e14\u9685\u4e88\u5a31\u96e8\u4e0e\u5c7f\u79b9\u5b87\u8bed\u7fbd\u7389\u57df\u828b\u90c1\u5401\u9047\u55bb\u5cea\u5fa1\u6108\u6b32\u72f1\u80b2\u8a89\u6d74\u5bd3\u88d5\u9884\u8c6b\u9a6d\u79ba\u6bd3\u4f1b\u4fe3\u8c00\u8c15\u8438\u84e3\u63c4\u5581\u5704\u5709\u5d5b\u72f3\u996b\u5ebe\u9608\u59aa\u59a4\u7ea1\u745c\u6631\u89ce\u8174\u6b24\u65bc\u715c\u71e0\u807f\u94b0\u9e46\u7610\u7600\u7ab3\u8753\u7afd\u8201\u96e9\u9f89",
    "yuan": "\u9e33\u6e0a\u51a4\u5143\u57a3\u8881\u539f\u63f4\u8f95\u56ed\u5458\u5706\u733f\u6e90\u7f18\u8fdc\u82d1\u613f\u6028\u9662\u586c\u6c85\u5a9b\u7457\u6a7c\u7230\u7722\u9e22\u8788\u9f0b",
    "yue": "\u66f0\u7ea6\u8d8a\u8dc3\u94a5\u5cb3\u7ca4\u6708\u60a6\u9605\u9fa0\u6a3e\u5216\u94ba",
    "yun": "\u8018\u4e91\u90e7\u5300\u9668\u5141\u8fd0\u8574\u915d\u6655\u97f5\u5b55\u90d3\u82b8\u72c1\u607d\u7ead\u6b92\u6600\u6c32",
    "za": "\u531d\u7838\u6742\u62f6\u5482",
    "zai": "\u683d\u54c9\u707e\u5bb0\u8f7d\u518d\u5728\u54b1\u5d3d\u753e",
    "zan": "\u6512\u6682\u8d5e\u74d2\u661d\u7c2a\u7ccc\u8db1\u933e",
    "zang": "\u8d43\u810f\u846c\u5958\u6215\u81e7",
    "zao": "\u906d\u7cdf\u51ff\u85fb\u67a3\u65e9\u6fa1\u86a4\u8e81\u566a\u9020\u7682\u7076\u71e5\u5523\u7f2b",
    "ze": "\u8d23\u62e9\u5219\u6cfd\u4ec4\u8d5c\u5567\u8fee\u6603\u7b2e\u7ba6\u8234",
    "zei": "\u8d3c",
    "zen": "\u600e\u8c2e",
    "zeng": "\u589e\u618e\u66fe\u8d60\u7f2f\u7511\u7f7e\u9503",
    "zha": "\u624e\u55b3\u6e23\u672d\u8f67\u94e1\u95f8\u7728\u6805\u69a8\u548b\u4e4d\u70b8\u8bc8\u63f8\u5412\u54a4\u54f3\u600d\u781f\u75c4\u86b1\u9f44",
    "zhai": "\u6458\u658b\u5b85\u7a84\u503a\u5be8\u7826",
    "zhan": "\u77bb\u6be1\u8a79\u7c98\u6cbe\u76cf\u65a9\u8f97\u5d2d\u5c55\u8638\u6808\u5360\u6218\u7ad9\u6e5b\u7efd\u8c35\u640c\u65c3",
    "zhang": "\u6a1f\u7ae0\u5f70\u6f33\u5f20\u638c\u6da8\u6756\u4e08\u5e10\u8d26\u4ed7\u80c0\u7634\u969c\u4ec9\u9123\u5e5b\u5d82\u7350\u5adc\u748b\u87d1",
    "zhao": "\u62db\u662d\u627e\u6cbc\u8d75\u7167\u7f69\u5146\u8087\u53ec\u722a\u8bcf\u68f9\u948a\u7b0a",
    "zhe": "\u906e\u6298\u54f2\u86f0\u8f99\u8005\u9517\u8517\u8fd9\u6d59\u8c2a\u966c\u67d8\u8f84\u78d4\u9e67\u891a\u8707\u8d6d",
    "zhen": "\u73cd\u659f\u771f\u7504\u7827\u81fb\u8d1e\u9488\u4fa6\u6795\u75b9\u8bca\u9707\u632f\u9547\u9635\u7f1c\u6862\u699b\u8f78\u8d48\u80d7\u6715\u796f\u755b\u9e29",
    "zheng": "\u84b8\u6323\u7741\u5f81\u72f0\u4e89\u6014\u6574\u62ef\u6b63\u653f\u5e27\u75c7\u90d1\u8bc1\u8be4\u5ce5\u94b2\u94ee\u7b5d",
    "zhi": "\u829d\u679d\u652f\u5431\u8718\u77e5\u80a2\u8102\u6c41\u4e4b\u7ec7\u804c\u76f4\u690d\u6b96\u6267\u503c\u4f84\u5740\u6307\u6b62\u8dbe\u53ea\u65e8\u7eb8\u5fd7\u631a\u63b7\u81f3\u81f4\u7f6e\u5e1c\u5cd9\u5236\u667a\u79e9\u7a1a\u8d28\u7099\u75d4\u6ede\u6cbb\u7a92\u536e\u965f\u90c5\u57f4\u82b7\u646d\u5e19\u5fee\u5f58\u54ab\u9a98\u6809\u67b3\u6800\u684e\u8f75\u8f7e\u6534\u8d3d\u81a3\u7949\u7957\u9ef9\u96c9\u9e37\u75e3\u86ed\u7d77\u916f\u8dd6\u8e2c\u8e2f\u8c78\u89ef",
    "zhong": "\u4e2d\u76c5\u5fe0\u949f\u8877\u7ec8\u79cd\u80bf\u91cd\u4ef2\u4f17\u51a2\u953a\u87bd\u8202\u822f\u8e35",
    "zhou": "\u821f\u5468\u5dde\u6d32\u8bcc\u7ca5\u8f74\u8098\u5e1a\u5492\u76b1\u5b99\u663c\u9aa4\u5544\u7740\u501c\u8bf9\u836e\u9b3b\u7ea3\u80c4\u78a1\u7c40\u8233\u914e\u9cb7",
    "zhu": "\u73e0\u682a\u86db\u6731\u732a\u8bf8\u8bdb\u9010\u7af9\u70db\u716e\u62c4\u77a9\u5631\u4e3b\u8457\u67f1\u52a9\u86c0\u8d2e\u94f8\u7b51\u4f4f\u6ce8\u795d\u9a7b\u4f2b\u4f8f\u90be\u82ce\u8331\u6d19\u6e1a\u6f74\u9a7a\u677c\u69e0\u6a65\u70b7\u94e2\u75b0\u7603\u86b0\u7afa\u7bb8\u7fe5\u8e85\u9e88",
    "zhua": "\u6293",
    "zhuai": "\u62fd",
    "zhuan": "\u4e13\u7816\u8f6c\u64b0\u8d5a\u7bc6\u629f\u556d\u989b",
    "zhuang": "\u6869\u5e84\u88c5\u5986\u649e\u58ee\u72b6\u4e2c",
    "zhui": "\u690e\u9525\u8ffd\u8d58\u5760\u7f00\u8411\u9a93\u7f12",
    "zhun": "\u8c06\u51c6",
    "zhuo": "\u6349\u62d9\u5353\u684c\u7422\u8301\u914c\u707c\u6d4a\u502c\u8bfc\u5ef4\u855e\u64e2\u555c\u6d5e\u6dbf\u6753\u712f\u799a\u65ab",
    "zi": "\u5179\u54a8\u8d44\u59ff\u6ecb\u6dc4\u5b5c\u7d2b\u4ed4\u7c7d\u6ed3\u5b50\u81ea\u6e0d\u5b57\u8c18\u5d6b\u59ca\u5b73\u7f01\u6893\u8f8e\u8d40\u6063\u7726\u9531\u79ed\u8014\u7b2b\u7ca2\u89dc\u8a3e\u9cbb\u9aed",
    "zong": "\u9b03\u68d5\u8e2a\u5b97\u7efc\u603b\u7eb5\u8159\u7cbd",
    "zou": "\u90b9\u8d70\u594f\u63cd\u9139\u9cb0",
    "zu": "\u79df\u8db3\u5352\u65cf\u7956\u8bc5\u963b\u7ec4\u4fce\u83f9\u5550\u5f82\u9a75\u8e74",
    "zuan": "\u94bb\u7e82\u6525\u7f35",
    "zui": "\u5634\u9189\u6700\u7f6a",
    "zun": "\u5c0a\u9075\u6499\u6a3d\u9cdf",
    "zuo": "\u6628\u5de6\u4f50\u67de\u505a\u4f5c\u5750\u5ea7\u961d\u963c\u80d9\u795a\u9162",
    "cou": "\u85ae\u6971\u8f8f\u8160",
    "nang": "\u652e\u54dd\u56d4\u9995\u66e9",
    "o": "\u5594",
    "dia": "\u55f2",
    "chuai": "\u562c\u81aa\u8e39",
    "cen": "\u5c91\u6d94",
    "diu": "\u94e5",
    "nou": "\u8028",
    "fou": "\u7f36",
    "bia": "\u9adf"
};

function ConvertPinyin(l1) {
    var l2 = l1.length;
    var I1 = "";
    var reg = new RegExp('[a-zA-Z0-9\- ]');
    for (var i = 0; i < l2; i++) {
        var val = l1.substr(i, 1);
        var name = arraySearch(val, PinYin);
        if (reg.test(val)) {
            I1 += val;
        } else if (name !== false) {
            I1 += name;
        }

    }
    I1 = I1.replace(/ /g, '-');
    while (I1.indexOf('--') > 0) {
        I1 = I1.replace('--', '-');
    }
    return I1;
}

function arraySearch(l1) {
    for (var name in PinYin) {
        if (PinYin[name].indexOf(l1) != -1) {
            name=name.substr(0,1).toUpperCase()//这里取拼音的第一个字母并大写
            return name;
            break;
        }
    }
    return false;
}
function do_fast_query(txt){
    goods_pvt.reverse()
    var _txt=''
    var _goods=goods_pvt.filter(function(item){return item.pvt==2&&ConvertPinyin(item.name).indexOf(txt)!=-1})
    if(_goods.length>0){
        _goods.map(function(_g){
            _txt+='<div class="no_bn_goods" style="text-align: center;width: 33%;height: auto;" data-goods_id="'+_g.goods_id+'">\
            <div style="position: relative;border-style: solid; border-width:2px;border-color:white">\
                <img src="'+_g.base64+'" style="width: 100%">\
                <div style="position: absolute;bottom: 0;width:100%;background-color:darkgrey;">\
                <div style="overflow: hidden;text-overflow: ellipsis;white-space: nowrap;">'+_g.name+'</div>\
                <div >￥<span style="font-size: 2rem;color: red">'+parseFloat(_g.price).toFixed(2)+'</span>元</div>\
                </div>\
                </div>\
                </div>'
        })
    }
    $("#no_bn_goods_list").html(_txt)
    $("#no_bn_goods_list img").error(function(){$(this).attr('src','images/nopic.png')})
    $(".fast_query").show()
    goods_pvt.reverse()
}
function pvt_read(){
    var rtn=$.Deferred()
    var db = openDatabase('mydb', '1.0', 'websqldb', 20 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql('select * from pvt',[],function(tx,result){
            goods_pvt=[]
            for(var i=0;i<result.rows.length;i++){
                goods_pvt.push(result.rows.item(i))
            }
            rtn.resolve()
        })
    })
    return rtn.promise()
    }
function pvt_write(){
    var rtn=$.Deferred()
    if (goods_pvt.length==0){rtn.reject('没有合适的商品数据')}
    else{
        var db = openDatabase('mydb', '1.0', 'websqldb', 20 * 1024 * 1024);
        db.transaction(function (tx) {
            console.log(1)
            tx.executeSql('DROP TABLE IF EXISTS pvt',[],function(){
                console.log(2)
                tx.executeSql('CREATE TABLE pvt(goods_id,shop_id,name,bn,cat_id,price,pvt,pic,base64)',[],function(){
                    goods_pvt.map(function(val){
                        console.log(val)
                        tx.executeSql('INSERT INTO pvt(goods_id,shop_id,name,bn,cat_id,price,pvt,pic,base64) VALUES(?,?,?,?,?,?,?,?,?)',[val.goods_id,val.shop_id,val.name,val.bn,val.cat_id,val.price,val.pvt,val.pic,val.base64]);
                    })
                    rtn.resolve()
                },function(tx,err){console.log(err.message)});
            },function(tx,err){console.log(err.message)})
        });
    }
    return rtn.promise()
}
if (!Array.prototype.findIndex) {
    Object.defineProperty(Array.prototype, 'findIndex', {
        value: function(predicate) {
            // 1. Let O be ? ToObject(this value).
            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            // 2. Let len be ? ToLength(? Get(O, "length")).
            var len = o.length >>> 0;

            // 3. If IsCallable(predicate) is false, throw a TypeError exception.
            if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
            }

            // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
            var thisArg = arguments[1];

            // 5. Let k be 0.
            var k = 0;

            // 6. Repeat, while k < len
            while (k < len) {
                // a. Let Pk be ! ToString(k).
                // b. Let kValue be ? Get(O, Pk).
                // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                // d. If testResult is true, return k.
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                    return k;
                }
                // e. Increase k by 1.
                k++;
            }

            // 7. Return -1.
            return -1;
        }
    });
}