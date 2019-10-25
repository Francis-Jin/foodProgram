// pages/recharge/recharge.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.baseApi,
        isShowPaySuccess: false,
        priceArr: [{
            price: 50,
            checked: false
        }, {
            price: 100,
            checked: false
        }, {
            price: 200,
            checked: false
        }, {
            price: 300,
            checked: false
        }, {
            price: 500,
            checked: false
        }, {
            price: 800,
            checked: false
        }],
        RechargeAmount: 0,
        inputVal: '',
    },

    /** 点击选择金额. */
    slectedChoneZhiFn(e){
        let that = this
        let _index = e.currentTarget.dataset.index
        let priceArr = that.data.priceArr
        let RechargeAmount = that.data.RechargeAmount
        priceArr.forEach((item, index)=>{
            if(index == _index){
                item.checked = true
                RechargeAmount = item.price
            }else{
                item.checked = false
            }
        })
        that.setData({
            inputVal: '',
            priceArr: priceArr,
            RechargeAmount: RechargeAmount
        })
    },
    /** 输入金额失去焦点时. */
    inputBlurFn(e){
        let value = e.detail.value
        if(value< 1){
            wx.showToast({
                title: '金额输入太小，请重新输入',
                icon: 'none'
            })
            this.setData({
                inputVal: ''
            })
            return false
        }
    },
    /** 输入充值的金额. */
    rechargeAmountInputFn(e){
        let value = e.detail.value
        let priceArr = this.data.priceArr
        priceArr.forEach(item=>{
            item.checked = false
        })
        this.setData({
            priceArr: priceArr 
        })
        this.setData({
            inputVal: value,
            RechargeAmount:value * 1
        })
    },

    /** 去支付. */
    toRechargeFn() {
        let that = this
        let RechargeAmount = that.data.RechargeAmount
        wx.showLoading({
            title: '加载中',
        })
        app.appRequest({
            url: '/app/orderInfo/saveUserRechargeRecord.action',
            method: 'post',
            postData: {
                userId: wx.getStorageSync('userInfo').id,
                amount: RechargeAmount
            },
            success(res){
                let vipOrderId = res.message
                that.vipWxPayFn(vipOrderId)
            }
        })
    },

    /** vip充值、微信支付. */
    vipWxPayFn(vipOrderId){
        let that = this
        app.appRequest({
            url: '/app/orderInfo/payFeeVip.action',
            method: 'post',
            postData: {
                vipOrderId: vipOrderId,
                unionId: wx.getStorageSync('userInfo').unionId
            },
            success(res){
                wx.hideLoading()
                let str = JSON.parse(res.data)
                wx.requestPayment({
                    timeStamp: str.timeStamp,
                    nonceStr: str.nonceStr,
                    package: str.package,
                    signType: str.signType,
                    paySign: str.paySign,
                    success(res) {
                        wx.showToast({
                            title: '充值成功',
                        })
                        that.getUserInfoFn()
                        wx.switchTab({
                            url: '/pages/index/index',
                        })
                    },
                    fail(err) {
                        console.log(err)
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

    /** 获取用户信息. */
    getUserInfoFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserInfo.action',
            method: 'get',
            getParams: {
                id: wx.getStorageSync('userInfo').id,
                newUser: wx.getStorageSync('userInfo').newUser
            },
            success(res) {
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

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

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    }
})