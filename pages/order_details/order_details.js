// pages/order_details/order_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        detailsInfo: '',
        isIpx: false ,
        cancelOrderShow: false, // 是否显示取消订单弹窗
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        let orderId = options.orderId
        this.setData({
            orderId: orderId
        })
        this.getOrderDetailsFn(orderId)
        this.getSysConfFn()
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
    },

    /** 拨打配送员电话. */
    callTelFn(e){
        let tel = e.currentTarget.dataset.tel
        wx.makePhoneCall({
            phoneNumber: tel,
        })
    },

    /** 获取配置信息. */
    getSysConfFn() {
        let that = this
        let cartLists = wx.getStorageSync('cartLists')
        let quantityAll = 0
        let deliveryCost = 0
        app.appRequest({
            url: '/app/sysConf/getSysConf.action',
            method: 'get',
            success(res) {
               that.setData({
                    systemInfo: res.data
                })
            }
        })
    },

    /** 获取订单详情. */
    getOrderDetailsFn(orderId){
        let that = this
        app.appRequest({
            url: "/app/orderInfo/orderInfoDetail.action",
            method: "get",
            getParams: {
                orderId: orderId
            },
            success(res){
                that.setData({
                    detailsInfo: res.data
                })
            }
        })
    },

    /** 显示取消订单弹窗. */
    cancleOrderFn(){
        let that = this
        that.setData({
            cancelOrderShow: true
        })
    },

    /** 隐藏取消订单弹窗. */
    onCancelOrderFn() {
        let that = this
        that.setData({
            cancelOrderShow: false
        })
    },

    /** 确认取消订单. */
    confirmCancelFn(){
        let that = this
        let orderId = that.data.orderId
        wx.showLoading({
            title: '取消中',
        })
        app.appRequest({
            url: '/app/orderInfo/cancelOrderInfo.action',
            method: 'post',
            postData: {
                orderId: orderId
            },
            success(res) {
                wx.hideLoading()
                if (res.code == 200) {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                    that.setData({
                        cancelOrderShow: false
                    })
                    that.getOrderDetailsFn(orderId)
                }
            }
        })
    },

    /** 点击头部返回订单列表. */
    backOrderListsFn(){
        wx.switchTab({
            url: '/pages/order/order',
        })
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