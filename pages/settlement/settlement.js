// pages/settlement/settlement.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        urlBefore: app.globalData.urlBefore,
        cartLists: [], //购买的商品
        totalPrice: 0, //选择商品结算的总价
        deliveryCost: 0,
        deliveryFee: " ", //第一份配送价格，
        increaseFee: " ", //增加一份，增加配送费
        maxDeliveryFee: " ", //配送费上限
        deliveryMode: '', //配送方式选择 配送方式(1自取 2配送)
        show: false, //是否显示地址列表弹窗
        addressLists: [],
        addressText: '',
        messageText: '', // 商家留言
        userPhone: '', // 用户电话
        payShow: false, // 是否显示支付方式选择弹框
        selectedId: '', //支付方式选择的id （1：微信支付，2：余额支付）

        makeAppointmentShow: false, //是否显示预约点餐
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        let totalPrice = options.totalPrice
        this.getSysConfFn()
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
            totalPrice: totalPrice
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess){
            this.setData({
                makeAppointmentShow: true
            })
        }
        this.getUserAddressFn()
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

    /** 选择地址 */
    selectedAddresFn(e) {
        let itemId = e.currentTarget.dataset.itemid
        let addressLists = this.data.addressLists
        let addressText = this.data.addressText
        let userPhone = this.data.userPhone
        let addressItem = ''
        addressLists.forEach(item => {
            if (item.id == itemId) {
                item.checked = true
                addressText = item.address + item.doorplate
                addressItem = item
                userPhone = item.phone
            } else {
                item.checked = false
            }
        })
        this.setData({
            userPhone: userPhone,
            addressText: addressText,
            addressLists: addressLists,
            show: false,
            addressItem: addressItem
        })
    },

    /** 输入留言信息 */
    messageInputFn(e) {
        let val = e.detail.value
        this.setData({
            messageText: val
        })
    },


    /** 获取用户地址列表. */
    getUserAddressFn() {
        let that = this
        app.appRequest({
            url: "/app/userAddress/list.action",
            method: 'get',
            getParams: {
                userId: wx.getStorageSync("userInfo").id
            },
            success(res) {
                if (res.data) {
                    res.data.forEach(item => {
                        item.checked = false
                    })
                    that.setData({
                        addressLists: res.data
                    })
                }
            }
        })
    },

    /** 跳转到添加地址页面. */
    addAddressFn() {
        wx.navigateTo({
            url: '/pages/add_address/add_address',
        })
    },

    /** 用餐方式选择. */
    selectedFn(e) {
        let _type = e.currentTarget.dataset.type
        this.setData({
            deliveryMode: _type
        })
    },

    /** 显示地址列表出来 */
    addressShowFn() {
        this.setData({
            show: true
        })
    },


    /** 隐藏支付方式选择弹窗 */
    onPayClose() {
        this.setData({
            payShow: false
        })
        wx.switchTab({
            url: '/pages/order/order',
        })
    },

    /** 隐藏地址选择弹窗 */
    onClose() {
        this.setData({
            payShow: false,
            show: false
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
                cartLists.forEach(item => {
                    quantityAll += item.quantity
                })
                quantityAll > 10 ? deliveryCost = res.data.maxDeliveryFee : deliveryCost = ((quantityAll - 1) * res.data.increaseFee + res.data.deliveryFee)
                that.setData({
                    cartLists: cartLists,
                    deliveryCost: deliveryCost,
                    systemInfo: res.data,
                    deliveryFee: res.data.deliveryFee,
                    increaseFee: res.data.increaseFee,
                    maxDeliveryFee: res.data.maxDeliveryFee
                })
            }
        })
    },


    /** 数量加减. */
    addReduceFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let itemId = e.currentTarget.dataset.itemid
        let cartLists = that.data.cartLists
        let thisItem = cartLists.filter(item => item.id == itemId)[0]
        let arr = cartLists.filter(item => item.checked == true)
        let totalPrice = 0
        let productId
        let quantityAll = 0
        let deliveryCost = 0
        if (_type == 1) {
            // 减
            if (thisItem.quantity == 1) {
                wx.showToast({
                    title: '不可以在减少了哟',
                    icon: 'none'
                })
            } else {
                thisItem.quantity--
                    cartLists.forEach(item => {
                        if (item.id == itemId) {
                            item.quantity = thisItem.quantity
                            productId = item.productId
                        }
                    })
                // 计算配送费
                cartLists.forEach(item => {
                    quantityAll += item.quantity
                })
                quantityAll > 10 ? deliveryCost = that.data.maxDeliveryFee : deliveryCost = ((quantityAll - 1) * that.data.increaseFee + that.data.deliveryFee)
                // 调用函数更新数量
                that.updateQuantityFn(productId, thisItem.quantity)
                // 计算总价
                arr.forEach(item => {
                    totalPrice += item.price * item.quantity
                })
                this.setData({
                    deliveryCost: deliveryCost,
                    totalPrice: totalPrice,
                    cartLists: cartLists
                })
            }
        } else {
            // 加
            thisItem.quantity++
                cartLists.forEach(item => {
                    if (item.id == itemId) {
                        item.quantity = thisItem.quantity
                        productId = item.productId
                    }
                })
            // 计算配送费
            cartLists.forEach(item => {
                quantityAll += item.quantity
            })

            quantityAll > 10 ? deliveryCost = that.data.maxDeliveryFee : deliveryCost = ((quantityAll - 1) * that.data.increaseFee + that.data.deliveryFee)
            // 调用函数更新数量
            that.updateQuantityFn(productId, thisItem.quantity)
            // 计算总价
            arr.forEach(item => {
                totalPrice += item.price * item.quantity
            })
            this.setData({
                deliveryCost: deliveryCost,
                totalPrice: totalPrice,
                cartLists: cartLists
            })
        }
    },

    /** 加减数量，更新数据库数量 */
    updateQuantityFn(id, num) {
        let that = this
        app.appRequest({
            url: '/app/shoppingCart/updateQuantity.action',
            method: "post",
            getParams: {
                "productId": id,
                "quantity": num,
                "userId": wx.getStorageSync('userInfo').id
            },
            success(res) {}
        })
    },

    /** 提交订单. */
    submitOrderFn() {
        let that = this
        let addressItem = that.data.addressItem
        let deliveryMode = that.data.deliveryMode
        console.log(addressItem)
        let cartLists = that.data.cartLists
        let dishInfo = []
        cartLists.forEach(item => {
            dishInfo.push({
                dishId: item.productId,
                quantity: item.quantity
            })
        })
        if (!that.data.deliveryMode) {
            wx.showToast({
                title: '请选择用餐方式',
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
        let params
        if (deliveryMode == 1) {
            params = {
                dishInfoArr: JSON.stringify(dishInfo),
                category: 1,
                message: that.data.messageText,
                deliveryMode: that.data.deliveryMode, //配送方式(1自取 2配送)
                createUser: wx.getStorageSync("userInfo").id,
                phone: '',
                name: '',
                communityId: 0,
                communitySectionId: 0,
                communityBuildingId: 0,
                communityBuildingUnitId: 0,
                address: ''
            }
        } else {
            params = {
                dishInfoArr: JSON.stringify(dishInfo),
                category: 1,
                message: that.data.messageText,
                deliveryMode: that.data.deliveryMode, //配送方式(1自取 2配送)
                createUser: wx.getStorageSync("userInfo").id,
                phone: that.data.userPhone,
                name: addressItem.name,
                communityId: addressItem.communityId,
                communitySectionId: addressItem.communitySectionId,
                communityBuildingId: addressItem.communityBuildingId,
                communityBuildingUnitId: addressItem.communityBuildingUnitId,
                address: that.data.addressText
            }
        }

        app.appRequest({
            url: "/app/orderInfo/saveOrderInfo.action",
            method: "post",
            postData: params,
            success(res) {
                if (res.code == 200) {
                    let orderNumber = res.message
                    that.setData({
                        orderId: orderNumber,
                        payShow: true
                    })
                }
            }
        })

        // wx.navigateTo({
        //     url: '/pages/order_details/order_details',
        // })
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
                                wx.switchTab({
                                    url: '/pages/order/order',
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    /** 页面跳转. */
    toPageFn(e) {
        let _type = e.currentTarget.dataset.type
        // 去充值
        wx.navigateTo({
            url: '/pages/recharge/recharge',
        })

    },

    /** 点击返回首页按钮. */
    toBackIndexFn(){
        wx.setStorageSync('balancePaySuccess', false)
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

    /** 点击预约点餐按钮. */
    toMakeAppointmentFn(){
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