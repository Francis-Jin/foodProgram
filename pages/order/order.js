// pages/order/order.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        page: 1,
        pageSize: 10,
        urlBefore: app.globalData.urlBefore,
        orderLists: [],
        userInfo: null,
        selectedId: '', //支付方式选择的id （1：微信支付，2：余额支付）
        payShow: false, // 是否显示支付方式选择弹框

        makeAppointmentShow: false, //是否显示预约点餐
        isVipShow: false, // 是否是vip,不是时弹出提示框

        wxActualPaymentAmount: '', // 微信实际支付金额
        totalVIPPriceAll: '', // VIP实际支付金额
        reductionTotalAll: '', // 代金池减免额度总计
        vipDiscountTotalAll: '', // vip优惠总计金额
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            userInfo: userInfo
        })
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
    },

    /** 获取随机广告. */
    GetAdvertisingFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/getDishInfoByAd.action',
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    let advertisingInfo = res.data
                    if (advertisingInfo) {
                        that.setData({
                            advertisingInfo: advertisingInfo
                        })
                    }
                }
            }
        })
    },

    /** 跳转支付成功后的广告详情. */
    toAdvertisementDetailsFn() {
        let advertisingInfo = this.data.advertisingInfo
        wx.navigateTo({
            url: '/pages/advertisement_details/advertisement_details?itemId=' + advertisingInfo.id,
        })
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.setData({
            page: 1,
            pageSize: 10,
            payShow: false,
            isVipShow: false,
            orderLists: []
        })
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
            this.GetAdvertisingFn()
        }
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            userInfo: userInfo
        })
        if (wx.getStorageSync('userInfo')) {
            this.getOrderLists()
        }
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
    confirmCancelFn() {
        wx.navigateTo({
            url: '/pages/recharge/recharge?vipPay=true',
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

    /** 显示支付方式选择. */
    payOrder(e) {
        let that = this
        let Item = e.currentTarget.dataset.item
        if (Item.status != 1) {
            return false
        }
        let wxActualPaymentAmount = 0
        let totalVIPPriceAll = 0
        let orderId = Item.id
        let category = Item.category
        let couponDeduct = Item.couponDeduct
        let reductionTotalAll = 0
        let deliveryMode = Item.deliveryMode
        if (category == 2) {
            reductionTotalAll = Item.groupDeduct.toFixed(2)
            wxActualPaymentAmount = (Item.orderAmount - Item.groupDeduct).toFixed(2)
            that.setData({
                selectedId: 1
            })
        } else {
            if (deliveryMode == 1){
                totalVIPPriceAll = (Item.productAmount - Item.vipDeduct).toFixed(2)
                wxActualPaymentAmount = (Item.productAmount - Item.deductAmount).toFixed(2)
            }else{
                totalVIPPriceAll = ((Item.productAmount + Item.expressFee) - Item.vipDeduct).toFixed(2)
                wxActualPaymentAmount = ((Item.productAmount + Item.expressFee) - Item.deductAmount).toFixed(2)
            }
            reductionTotalAll = Item.deductAmount.toFixed(2)
        }
        let vipDiscountTotalAll = Item.vipDeduct.toFixed(2)
        that.setData({
            wxActualPaymentAmount: wxActualPaymentAmount,
            reductionTotalAll: reductionTotalAll,
            totalVIPPriceAll: totalVIPPriceAll,
            vipDiscountTotalAll: vipDiscountTotalAll,
            categoryPay: category,
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
                        that.GetAdvertisingFn()
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
                                that.setData({
                                    orderLists: []
                                })
                                that.getOrderLists()
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