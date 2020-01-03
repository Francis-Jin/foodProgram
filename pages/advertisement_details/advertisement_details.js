// pages/advertisement_details/advertisement_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: '',
        urlBefore: app.globalData.urlBefore,
        deliveryMode:2,
        haveMealAddresInfo: null, // 用餐地址选择返回
        takeMealsAddressId: null, //选择回来的取餐地址ID
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            itemId: options.itemId,
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })

        this.getDataFn()
    },

    /** 获取推荐广告数据. */
    getDataFn() {
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
        let id = that.data.itemId
        let userId = 0
        if (!userInfo) {
            userId = 0
        } else {
            userId = userInfo.id
        }
        app.appRequest({
            url: "/app/dishInfo/dishInfoDetail.action",
            method: "get",
            getParams: {
                dishId: id,
                userId: userId
            },
            success(res) {
                if (res.data.DishInfoVo) {
                    let info = res.data.DishInfoVo
                    res.data.DishInfoVo.intro = res.data.DishInfoVo.intro.replace(/\<img/gi, `<img style="max-width:100%;height:auto"`)
                    that.setData({
                        info: info
                    })
                }
            }
        })
    },

    // 点击微信支付
    wxBuyFn(){
        this.setData({
            showSpellList: true
        })
    },

    /** 用餐方式选择. */
    selectedFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        this.setData({
            deliveryMode: _type
        })
        that.calculatedPriceFn()
    },

    /** 跳转地址选择列表. */
    selectedAddressFn(e) {
        // 我的地址
        let type = e.currentTarget.dataset.type
        if (type == 1) {
            wx.navigateTo({
                url: '/pages/take_meals_address/take_meals_address',
            })
        }
        if (type == 2) {
            wx.navigateTo({
                url: '/pages/my_address/my_address?selected=true',
            })
        }
    },

    /** 关闭拼单弹框. */
    onCloseSpellList() {
        this.setData({
            showSpellList: false
        })
    },

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.redirectTo({
            url: '/pages/index/index',
        })
    },

    goPayIndentFn(){
        let that = this
        let Info = that.data.info
        let addressItem = that.data.haveMealAddresInfo
        let deliveryMode = that.data.deliveryMode
        let cartLists = that.data.cartLists
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let dishInfo = []
        dishInfo.push({
            dishId: Info.id,
            quantity: 1,
            isRecommend: 0,
            ingredientId: ''
        })
        if (!that.data.deliveryMode) {
            wx.showToast({
                title: '请选择用餐方式',
                icon: 'none'
            })
            return false
        }
        if (!takeMealsAddressId && deliveryMode == 1) {
            wx.showToast({
                title: '请选择取餐地址',
                icon: 'none'
            })
            return false
        }

        if (!addressItem && deliveryMode == 2) {
            wx.showToast({
                title: '请选择配送地址',
                icon: 'none'
            })
            return false
        }

        let params = {
            dishInfoArr: JSON.stringify(dishInfo),
            category: 1,
            message: '',
            deliveryMode: that.data.deliveryMode, //配送方式(1自取 2配送)
            createUser: wx.getStorageSync("userInfo").id,
            phone: deliveryMode == 1 ? 0 : addressItem.phone,
            name: deliveryMode == 1 ? 0 : addressItem.name,
            communityId: deliveryMode == 1 ? 0 : addressItem.communityId,
            communitySectionId: deliveryMode == 1 ? 0 : addressItem.communitySectionId,
            communityBuildingId: deliveryMode == 1 ? 0 : addressItem.communityBuildingId,
            communityBuildingUnitId: deliveryMode == 1 ? 0 : addressItem.communityBuildingUnitId,
            address: deliveryMode == 1 ? '' : (addressItem.address + addressItem.doorplate),
            locationId: 0,
            bookId: 0,
            getDinnerTime: null,
            getDinnerTimeStr: '',
            dinnerCategory: 0,
            bookLabel: '',
            ad: 1,
        }

        app.appRequest({
            url: "/app/orderInfo/saveOrderInfo.action",
            method: "post",
            postData: params,
            success(res) {
                if (res.code == 200) {
                    let orderNumber = res.message
                    that.setData({
                        orderId: orderNumber
                    })
                    that.wxPayFn()
                }
            }
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
                        console.log(err)
                        wx.showModal({
                            title: '提示',
                            content: '支付失败',
                            showCancel: false,
                            confirmColor: "#5bcbc8",
                            success(res) {
                                wx.redirectTo({
                                    url: '/pages/order/order',
                                })
                            }
                        })
                    }
                })
            }
        })
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
        let that = this
        return {
            title: '产品分享',
            path: '/pages/advertisement_details/advertisement_details',
            success: function(res) {}
        }
    }
})