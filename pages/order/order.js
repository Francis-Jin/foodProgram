// pages/order/order.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        pageSize: 10,
        orderLists: [],
        payShow: false, // 是否显示支付方式选择弹框
        selectedId: '', //支付方式选择的id （1：微信支付，2：余额支付）

        makeAppointmentShow: false, //是否显示预约点餐
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userInfo = wx.getStorageSync('userInfo')
        if(!userInfo){
            wx.redirectTo({
                url: '/pages/start/start?isLogin=true',
            })
        }
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            page: 1,
            pageSize: 10,
            payShow:false,
            orderLists: []
        })
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
        }
        this.getOrderLists()
    },

    /** 获取用户订单列表. */
    getOrderLists() {
        let that = this
        app.appRequest({
            url: "/app/orderInfo/listOrderInfoByUser.action",
            method: 'get',
            getParams: {
                "userId": wx.getStorageSync("userInfo").id,
                "page": that.data.page,
                "rows": that.data.pageSize
            },
            success(res) {
                console.log(res)
                if (res.data) {
                    that.setData({
                        orderLists: that.data.orderLists.concat(res.data)
                    })
                }
                // 隐藏导航栏加载框
                wx.hideNavigationBarLoading();
                // 停止下拉动作
                wx.stopPullDownRefresh();
            }
        })
    },

    /** 查看订单详情. */
    toDeailsFn(e) {
        let orderId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: '/pages/order_details/order_details?orderId=' + orderId,
        })
    },

    /** 支付方式选择. */
    selectedPayFn(e) {
        let type = e.currentTarget.dataset.type
        this.setData({
            selectedId: type
        })
    },

    /** 点击支付方式弹框确认按钮. */
    confirmAppointFn() {
        let that = this
        let selectedId = that.data.selectedId
        let orderId = that.data.orderId
        if (selectedId == 1) {
            that.wxPayFn()
        }
        if (selectedId == 2) {
            wx.navigateTo({
                url: '/pages/inputPassword/inputPassword?orderId=' + orderId,
            })
        }
        that.setData({
            payShow: false
        })
    },

    /** 隐藏支付方式选择. */
    onPayClose(){
        this.setData({
            payShow: false
        })
    },

    /** 显示支付方式选择. */
    payOrder(e) {
        let that = this
        let orderId = e.currentTarget.dataset.id
        that.setData({
            orderId: orderId,
            payShow: true
        })
    },

    /** 微信支付. */
    wxPayFn() {
        let that = this
        app.appRequest({
            url: "/app/orderInfo/payFee.action",
            method: "post",
            postData: {
                orderId: that.data.orderId,
                unionId: wx.getStorageSync("userInfo").unionId
            },
            success(res) {
                let str = JSON.parse(res.data)
                wx.requestPayment({
                    timeStamp: str.timeStamp,
                    nonceStr: str.nonceStr,
                    package: str.package,
                    signType: str.signType,
                    paySign: str.paySign,
                    success(res) {
                        that.setData({
                            makeAppointmentShow: true 
                        })
                    },
                    fail(err) {
                        that.setData({
                            payShow: false
                        })
                        wx.showModal({
                            title: '提示',
                            content: '支付失败',
                            showCancel: false,
                            confirmColor: "#5bcbc8"
                        })
                    }
                })
            }
        })
    },

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

    /** 点击预约点餐按钮. */
    toMakeAppointmentFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.redirectTo({
            url: '/pages/start/start?paySuccessType=true',
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        wx.setStorageSync('balancePaySuccess', false)
        this.setData({
            makeAppointmentShow: false
        })
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        // 显示顶部刷新图标
        wx.showNavigationBarLoading();
        this.setData({
            page: 1,
            pageSize: 10,
            orderLists: []
        })
        this.getOrderLists()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let that = this
        let page = that.data.page
        page++
        this.setData({
            page: page
        })
        that.getOrderLists()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})