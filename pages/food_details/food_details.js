// pages/food_details/food_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        urlBefore: app.globalData.urlBefore,
        discountNumber:1,
        isPopping:false,
        buyNumber:0,
        foodId: '',//菜品ID
        vipSavePrice: '',

        guideMongoliaShowStatus: false, //是否显示引导蒙层

        // 加入购物车动画小球
        hide_good_box: true,
        bus_x: 0,
        bus_y: 0
    },
    
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        var _windowHeight = wx.getSystemInfoSync().windowHeight;

        // 目标终点元素 - 购物车的位置坐标
        this.busPos = {};
        this.busPos['x'] = 10; // x坐标暂写死，自己可根据UI来修改
        this.busPos['y'] = _windowHeight - 60; // y坐标，也可以根据自己需要来修改

        let that = this
        wx.getSystemInfo({
            success: function (res) {
                //model中包含着设备信息
                console.log(res)
                var model = res.model
                console.log(model.search('iPhone X') != -1)
                if (model.search('iPhone X') != -1) {
                    that.setData({
                        isIpx: true
                    })
                } else {
                    that.setData({
                        isIpx: false
                    })
                }
            }
        })
        let newUser = wx.getStorageSync('userInfo').newUser
        if (newUser == 1) {
            this.setData({
                guideMongoliaShowStatus: true
            })
        }
        let itemId = options.itemId
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
            foodId:itemId
        })
    },

    /** 关闭引导蒙层. */
    closeGuideMongoliaFn() {
        this.setData({
            guideMongoliaShowStatus: false
        })
        this.getUserInfoFn()
    },

    /** 获取用户信息. */
    getUserInfoFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserInfo.action',
            method: 'get',
            getParams: {
                id: wx.getStorageSync('userInfo').id,
                newUser: 0
            },
            success(res) {
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /** 获取菜品信息. */
    getDetails(id){
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
        let userId = 0
        if(!userInfo){
            userId = 0
        }else{
            userId = userInfo.id
        }
        app.appRequest({
            url: "/app/dishInfo/dishInfoDetail.action",
            method: "get",
            getParams: {
                dishId:id,
                userId: userId
            },
            success(res){
                res.data.DishInfoVo.intro = res.data.DishInfoVo.intro.replace(/\<img/gi, `<img style="max-width:100%;height:auto"`)
                that.setData({
                    info: res.data.DishInfoVo,
                    vipSavePrice: (res.data.DishInfoVo.price - res.data.DishInfoVo.vipPrice).toFixed(2),
                    buyNumber: res.data.shoppingCartTotal
                })
            }
        })
    },

    /** 添加购物车 */
    addCart(e) {
        console.log(e)
        let that = this
        let itemId = that.data.foodId
        let addPic = e.currentTarget.dataset.pic
        console.log(addPic)
        that.setData({
            addPic: addPic,
            itemId: itemId
        })
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/start/start?isLogin=true',
            })
            return false
        }
        // 如果good_box正在运动，不能重复点击
        if (!this.data.hide_good_box) return;
        this.finger = {};
        var topPoint = {};
        //点击点的坐标
        this.finger['x'] = e.touches["0"].clientX;
        this.finger['y'] = e.touches["0"].clientY;

        //控制点的y值定在低的点的上方150处
        if (this.finger['y'] < this.busPos['y']) {
            topPoint['y'] = this.finger['y'] - 200;
        } else {
            topPoint['y'] = this.busPos['y'] - 200;
        }

        //控制点的x值在点击点和购物车之间
        if (this.finger['x' > this.busPos['x']]) {
            topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
        } else {
            topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
        }

        this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
        this.startAnimation();

    },

    /** 加入购物车动画. */
    startAnimation: function () {
        var index = 0,
            that = this,
            bezier_points = that.linePos['bezier_points'];
        this.setData({
            hide_good_box: false,
            bus_x: that.finger['x'],
            bus_y: that.finger['y']
        })
        index = bezier_points.length;
        this.timer = setInterval(function () {
            index--;
            // 设置球的位置
            that.setData({
                bus_x: bezier_points[index]['x'],
                bus_y: bezier_points[index]['y']
            })
            // 到最后一个点的时候，开始购物车的一系列变化，并清除定时器，隐藏小球
            if (index < 1) {
                clearInterval(that.timer);
                that.requestAddCart()
                that.setData({
                    hide_good_box: true
                })
            }
        }, 33);
    },

    /** 请求加入购物车. */
    requestAddCart() {
        let that = this
        app.appRequest({
            url: "/app/shoppingCart/saveShoppingCart.action",
            method: 'post',
            getParams: {
                productId: that.data.foodId,
                quantity: 1,
                createUser: wx.getStorageSync("userInfo").id
            },
            success(res) {
                // wx.showToast({
                //     title: res.message,
                //     icon: 'none'
                // })
                that.getDetails(that.data.foodId)
            }
        })
    },

    /** 页面跳转. */
    toPageFn(e) {
        let _type = e.currentTarget.dataset.type
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/start/start?isLogin=true',
            })
            return false
        }
        if (_type == 1) {
            // 推荐理由
            wx.showToast({
                title: '功能正在更新',
                icon: 'none'
            })
            // wx.navigateTo({
            //     url: '/pages/account/account',
            // })
        } else if (_type == 2) {
            // 去拼单
            wx.navigateTo({
                url: '/pages/make_up_list/make_up_list?foodId=' + this.data.foodId,
            })
        } else if (_type == 3) {
            // 去充值
            wx.navigateTo({
                url: '/pages/recharge/recharge',
            })
        } else if (_type == 4) {
            // 去结算
            console.log("去结算页面")
            // wx.switchTab({
            //     url: '/pages/cart/cart',
            // })
        }
    },

    /** 数量加减. */
    addReduceFn(e) {
        let _type = e.currentTarget.dataset.type
        let discountNumber = this.data.discountNumber
        if (_type == 1) {
            // 减
            if (discountNumber == 1) {
                wx.showToast({
                    title: '不可以在减少了哟',
                    icon: 'none'
                })
            } else {
                let reduceNumber = this.data.discountNumber
                reduceNumber--
                this.setData({
                    discountNumber: reduceNumber
                })
            }
        } else {
            // 加
            let addNumber = this.data.discountNumber
            addNumber++
            this.setData({
                discountNumber: addNumber
            })
        }
    },

    /** 弹出收回. */
    plus() {
        // if (!this.data.isPopping) {
        //     //弹出
        //     this.setData({
        //         isPopping: true
        //     })
        // }
        // else {
            //缩回
            // this.setData({
            //     isPopping: false
            // });
            // console.log("弹出")
            wx.navigateTo({
                url: '/pages/cart/cart',
            })
        // }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this
        let itemId = this.data.foodId
        setTimeout(function(){
            that.getDetails(itemId)
        },200)
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})