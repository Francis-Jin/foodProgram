//app.js
App({
    globalData: {
        successPics: [],
        sessionKey: '',
        userInfo: null,
        WW: 0,//系统默认宽度
        HH: 0,//系统默认高度
        // baseApi: 'https://dongk.4kb.cn/food', //测试服 接口请求前缀
        // urlBefore: 'https://dongk.4kb.cn/food/upload', //测试服 图片前缀
        baseApi: 'https://food.zhiyanginfo.top/food', //正试服 接口请求前缀
        urlBefore: 'https://food.zhiyanginfo.top/food/upload/', //正试服 图片前缀
        //获取数据列表，默认获取10条数据
        dataLimit: 10,
    },

    /** 
     * methods： 请求方式 
     * getParams get请求方法URL传参
     * url: 请求地址 
     * postData： post请求方法要传递的参数
     * callback： 请求成功回调函数 
     * errFun： 请求失败回调函数 
     */
    appRequest: function(obj) {
        let str = '?';
        for (let key in obj.getParams) {
            str += key + '=' + obj.getParams[key] + '&';
        }
        str = str.substring(0, str.length - 1);

        wx.request({
            url: this.globalData.baseApi + obj.url + str,
            method: obj.method,
            header: {
                'content-type': obj.methods == 'GET' ? 'application/json' : 'application/x-www-form-urlencoded'
            },
            dataType: 'json',
            data: obj.postData,
            success: function(res) {
                obj.success(res.data);
            },
            fail: function(err) {
                obj.error(err);
            }
        })
    },

    /**
     * 文件上传公用函数
     */
    uploadimg: function(data) {
        console.log(data);
        let that = this;
        if (data.path.length > 0) {
            wx.showLoading({
                title: '正在提交...',
            })
            let successPics = that.globalData.successPics;
            var i = data.i ? data.i : 0, //当前上传的哪张图片
                success = data.success ? data.success : 0, //上传成功的个数
                fail = data.fail ? data.fail : 0; //上传失败的个数
            wx.uploadFile({
                url: data.url,
                filePath: data.path[i],
                name: 'file', //这里根据自己的实际情况改
                formData: null, //这里是上传图片时一起上传的数据
                success: (resp) => {
                    console.log(resp);
                    if (resp.statusCode == 200) {
                        let a = JSON.parse(resp.data).data
                        console.log(a)
                        success++; //图片上传成功，图片上传成功的变量+1
                        successPics.push(a);
                    }
                },
                fail: (res) => {
                    fail++; //图片上传失败，图片上传失败的变量+1
                    console.log('fail:' + i + "fail:" + fail);
                },
                complete: () => {
                    console.log(i);
                    i++; //这个图片执行完上传后，开始上传下一张
                    if (i == data.path.length) { //当图片传完时，停止调用    
                        // that.data.successPics = successPics;
                        wx.hideLoading();
                        if (fail == 0) {
                            data.submitFn(successPics);
                            that.globalData.successPics = [];
                        }
                        if (fail > 0) {
                            wx.showModal({
                                title: '提示',
                                content: '上传失败!成功：' + success + "张,失败：" + fail + "张。请返回重新选择上传",
                                showCancel: false,
                                confirmText: '知道了'
                            })
                        }
                        // console.log('执行完毕');
                        // console.log('成功：' + success + " 失败：" + fail);
                    } else {
                        //若图片还没有传完，则继续调用函数
                        // console.log(i);
                        data.i = i;
                        data.success = success;
                        data.fail = fail;
                        that.uploadimg(data);
                    }
                }
            });
        } else {
            let arr = [];
            data.submitFn(arr);
        }
    },

    onLaunch: function(){
        var that = this
        wx.getSystemInfo({
            success: function(res) {
                wx.setStorageSync("systemInfo", res)
                var WW = res.windowWidth
                var HH = res.windowHeight
                that.globalData.WW = WW
                that.globalData.HH = HH
            },
        })
    },

    bezier: function (pots, amount) {
        // 购物车动画特效算法
        var pot;
        var lines;
        var ret = [];
        var points;
        for (var i = 0; i <= amount; i++) {
            points = pots.slice(0);
            lines = [];
            while (pot = points.shift()) {
                if (points.length) {
                    lines.push(pointLine([pot, points[0]], i / amount));
                } else if (lines.length > 1) {
                    points = lines;
                    lines = [];
                } else {
                    break;
                }
            }
            ret.push(lines[0]);
        }
        function pointLine(points, rate) {
            var pointA, pointB, pointDistance, xDistance, yDistance, tan, radian, tmpPointDistance;
            var ret = [];
            pointA = points[0];//点击
            pointB = points[1];//中间
            xDistance = pointB.x - pointA.x;
            yDistance = pointB.y - pointA.y;
            pointDistance = Math.pow(Math.pow(xDistance, 2) + Math.pow(yDistance, 2), 1 / 2);
            tan = yDistance / xDistance;
            radian = Math.atan(tan);
            tmpPointDistance = pointDistance * rate;
            ret = {
                x: pointA.x + tmpPointDistance * Math.cos(radian),
                y: pointA.y + tmpPointDistance * Math.sin(radian)
            };
            return ret;
        }
        return {
            'bezier_points': ret
        };
    }
})