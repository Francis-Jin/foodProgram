// pages/order_details/order_details.js
const util = require('../../utils/util');
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        countTime: '2019-11-04 12:59:00',
        userInfo: null,
        urlBefore: app.globalData.urlBefore,
        detailsInfo: '',
        isIpx: false,
        cancelOrderShow: false, // 是否显示取消订单弹窗
        selectedId: '', //支付方式选择的id （1：微信支付，2：余额支付）
        payShow: false, // 是否显示支付方式选择弹框
        makeAppointmentShow: false, //是否显示预约点餐
        isVipShow: false, // 是否是vip,不是时弹出提示框
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        let that = this
        let orderId = options.orderId
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            orderId: orderId,
            userInfo: userInfo
        })
        this.getOrderDetailsFn()
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
        let advertisingInfo = wx.getStorageSync('advertisingInfo')
        this.setData({
            advertisingInfo: advertisingInfo,
        })
    },

    // 查看图片
    lookImageFn(e){
        let url = e.currentTarget.dataset.url
        let urls = []
        urls.push(url)
        wx.previewImage({
            current: 0,
            urls: urls
        })
    },

    /** 跳转支付成功后的广告详情. */
    toAdvertisementDetailsFn() {
        wx.navigateTo({
            url: '/pages/advertisement_details/advertisement_details',
        })
    },
    /** 拨打配送员电话. */
    callTelFn(e) {
        let tel = e.currentTarget.dataset.tel
        wx.makePhoneCall({
            phoneNumber: tel,
        })
    },

    /** 点击去充值按钮. */
    confirmCancelFn() {
        wx.navigateTo({
            url: '/pages/recharge/recharge?vipPay=true',
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

    /** 显示支付方式选择. */
    payOrderFn(e) {
        let that = this
        that.setData({
            payShow: true
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
        let userInfo = that.data.userInfo
        if (!selectedId) {
            wx.showToast({
                title: '选择支付方式',
                icon: 'none'
            })
            return false
        }
        if (selectedId == 1) {
            that.setData({
                payShow: false
            })
            that.wxPayFn()
        }
        if (selectedId == 2) {
            if (userInfo.vip == 0) {
                console.log("不是VIP")
                that.setData({
                    isVipShow: true
                })
            } else {
                that.setData({
                    payShow: false
                })
                wx.navigateTo({
                    url: '/pages/inputPassword/inputPassword?orderId=' + orderId,
                })
            }
        }
    },

    /** 点击去充值按钮. */
    confirmVipPayFn() {
        wx.navigateTo({
            url: '/pages/recharge/recharge?vipPay=true'
        })
    },

    /** 取消充值. */
    cancelRechargeFn() {
        this.setData({
            isVipShow: false
        })
    },

    /** 隐藏支付方式选择. */
    onPayClose() {
        this.setData({
            payShow: false
        })
    },

    /** 微信支付. */
    wxPayFn() {
        let that = this
        app.appRequest({
            url: "/app/orderInfo/savePayFeeExpress.action",
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
                            confirmColor: "#5bcbc8",
                            success() {
                                that.getOrderDetailsFn()
                            }
                        })
                    }
                })
            }
        })
    },

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.redirectTo({
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

    /** 获取订单详情. */
    getOrderDetailsFn() {
        let that = this
        app.appRequest({
            url: "/app/takeExpressDelivery/expressOrderDetail.action",
            method: "get",
            getParams: {
                id: that.data.orderId
            },
            success(res) {
                // res.data.photo = that.data.urlBefore + res.data.photo
                // console.log(res.data.photo)
                that.setData({
                    detailsInfo: res.data
                })
            }
        })
    },

    /** 显示取消订单弹窗. */
    cancleOrderFn() {
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

    /** 点击头部返回订单列表. */
    backOrderListsFn() {
        wx.redirectTo({
            url: '/pages/oneYuanOrder/oneYuanOrder',
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
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            payShow: false,
            isVipShow: false,
            userInfo: userInfo
        })
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
        }
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