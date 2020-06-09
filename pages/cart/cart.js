// pages/cart/cart.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        deliveryObj:{},
        userInfo: '',
        urlBefore: app.globalData.urlBefore,
        administrationType: 1, //点击管理type,
        checkedAll: false,
        cartNumber: 0,
        buyNumber: 1, //购买数量
        page: 1,
        pageSize: 10,
        deleteCartShopShow: false, // 是否显示删除弹窗
        haveMealAddresInfo: null, // 用餐地址选择返回
        takeMealsAddressId: null, //选择回来的取餐地址ID
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址

        cartLists: [], //购买的商品
        totalPrice: 0, //选择商品结算的总价
        totalVIPPriceAll: 0, //vip总价
        deliveryCost: 0,
        deliveryFee: " ", //第一份配送价格，
        increaseFee: " ", //增加一份，增加配送费
        maxDeliveryFee: " ", //配送费上限
        deliveryMode: 2, //配送方式选择 配送方式(1自取 2配送)
        show: false, //是否显示地址列表弹窗
        addressLists: [],
        addressText: '选择配送地址', //显示选择的地址
        messageText: '', // 商家留言
        userPhone: '', // 用户电话
        payShow: false, // 是否显示支付方式选择弹框
        selectedId: '', //支付方式选择的id （1：微信支付，2：余额支付）
        wxActualPaymentAmount: '', // 微信支付实际金额
        reductionTotalAll: '', // 代金池减免额度总计
        vipDiscountTotalAll: '', // vip优惠总计金额
        expressVipDiscountTotalAll: '', // vip快递配送总计金额
        expressWxDiscountTotalAll: '', // 微信快递配送总计金额
        expressPageDiscountTotalAll: '', // 页面快递配送总计金额

        makeAppointmentShow: false, //是否显示预约点餐
        isVipShow: false, // 是否是vip,不是时弹出提示框

        isIpx: false, //是否是iPhone X
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            cartLists: [],
            checkedAll: false,
            totalPrice: 0,
            administrationType: 1
        })
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })
        this.getDeliveryModeFn()
        this.getCartListsFn()
        this.getSysConfFn()
        this.isIpxFn()
    },

    /** 获取配送按钮是否开启. */
    getDeliveryModeFn() {
        let that = this
        app.appRequest({
            url: '/app/sysConf/listDimDeliveryMode.action',
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    let obj = {}
                    obj.self = res.data[0].status
                    obj.delivery = res.data[1].status
                    that.setData({
                        deliveryObj: obj
                    })
                    wx.setStorageSync('deliveryMode', obj)
                }
            }
        })
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

    /** 判断是否是iPhoneX. */
    isIpxFn() {
        let that = this
        wx.getSystemInfo({
            success: function(res) {
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

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
            this.GetAdvertisingFn()
        }
        that.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
        this.getCartBuyNumberFn()
    },

    /** 获取购物车数量 */
    getCartBuyNumberFn() {
        let that = this
        if (wx.getStorageSync("userInfo")) {
            app.appRequest({
                url: "/app/shoppingCart/countTotal.action",
                method: 'get',
                getParams: {
                    userId: wx.getStorageSync("userInfo").id
                },
                success(res) {
                    that.setData({
                        cartNumber: res.data
                    })
                }
            })
        }
    },

    /** 获取配置信息. */
    getSysConfFn() {
        let that = this
        app.appRequest({
            url: '/app/sysConf/getSysConf.action',
            method: 'get',
            success(res) {
                that.setData({
                    systemInfo: res.data,
                    deliveryFee: res.data.deliveryFee,
                    increaseFee: res.data.increaseFee,
                    maxDeliveryFee: res.data.maxDeliveryFee
                })
            }
        })
    },

    /** 支付方式选择. */
    selectedPayFn(e) {
        let type = e.currentTarget.dataset.type
        this.setData({
            selectedId: type
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

    /** 获取购物车列表 */
    getCartListsFn() {
        let that = this
        app.appRequest({
            url: '/app/shoppingCart/listShoppingCartByApp.action',
            method: "post",
            getParams: {
                "userId": wx.getStorageSync("userInfo").id,
                "page": that.data.page,
                "rows": that.data.pageSize
            },
            success(res) {
                res.data.forEach(item => {
                    item.checked = true
                })
                that.setData({
                    cartLists: that.data.cartLists.concat(res.data)
                })
                setTimeout(() => {
                    that.calculatedPriceFn()
                }, 500)
            }
        })
    },

    /** 选择商品时. */
    checkGoodsChange(e) {
        return false
        let that = this
        let itemId = e.currentTarget.dataset.itemid
        let cartLists = that.data.cartLists
        let checkedAll
        cartLists.forEach(item => {
            if (item.id == itemId) item.checked = !item.checked
        })
        let arr = cartLists.filter(item => item.checked == true)
        arr.length == that.data.cartLists.length ? checkedAll = true : checkedAll = false
        that.setData({
            checkedAll: checkedAll,
            cartLists: cartLists
        })
        that.calculatedPriceFn()
    },

    /** 点击全选按钮改变时. */
    checkboxChange(e) {
        let that = this
        let checkedAll = e.currentTarget.dataset.checked
        let cartLists = that.data.cartLists
        if (checkedAll == 'false') {
            cartLists.forEach(item => item.checked = false)
            this.setData({
                cartLists: cartLists,
                checkedAll: false
            })
        } else {
            cartLists.forEach(item => item.checked = true)
            this.setData({
                cartLists: cartLists,
                checkedAll: true
            })
        }
        that.calculatedPriceFn()
    },

    /** 数量加减. */
    addReduceFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let itemId = e.currentTarget.dataset.itemid
        let cartLists = that.data.cartLists
        let thisItem = cartLists.filter(item => item.id == itemId)[0]
        let productId
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
                // 调用函数更新数量
                that.updateQuantityFn(productId, thisItem.quantity)
                this.setData({
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
            // 调用函数更新数量
            that.updateQuantityFn(productId, thisItem.quantity)
            this.setData({
                cartLists: cartLists
            })
        }
        that.getCartBuyNumberFn()
        that.calculatedPriceFn()
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
            success(res) {

            }
        })
    },

    /** 跳转到商品详情页面. */
    toDetailsFn(e) {
        let itemId = e.currentTarget.dataset.itemid
        wx.navigateTo({
            url: '/pages/food_details/food_details?itemId=' + itemId,
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
                payShow: false,
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
        that.setData({
            cartLists: []
        })
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

    /** 隐藏支付方式选择弹窗 */
    onPayClose() {
        this.setData({
            payShow: false,
            cartLists: []
        })
        wx.redirectTo({
            url: '/pages/order/order',
        })
    },

    /** 提交订单. */
    submitOrderFn() {
        let that = this
        let addressItem = that.data.haveMealAddresInfo
        let deliveryMode = that.data.deliveryMode
        let cartLists = that.data.cartLists
        cartLists = cartLists.filter(item => item.checked)
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let dishInfo = []
        cartLists.forEach(item => {
            dishInfo.push({
                dishId: item.productId,
                quantity: item.quantity,
                isRecommend: 0,
                ingredientId: ''
            })
        })
        if (cartLists.length == 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'none'
            })
            return false
        }
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
                        payShow: true,
                    })
                    that.getCartListsFn()
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
                        that.GetAdvertisingFn()
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

    /** 页面跳转. */
    toPageFn(e) {
        let _type = e.currentTarget.dataset.type
        // 去充值
        wx.navigateTo({
            url: '/pages/recharge/recharge',
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

    /** 点击删除商品按钮. */
    deleteGoodFn(e) {
        console.log(e)
        let productId = e.currentTarget.dataset.productid
        this.setData({
            productId: productId,
            deleteCartShopShow: true
        })
    },

    /** 点击取消按钮隐藏弹窗. */
    onCancelDeleteFn(e) {
        this.setData({
            deleteCartShopShow: false
        })
    },

    /** 点击确认按钮删除当前商品、隐藏弹窗. */
    confirmDeleteFn(e) {
        let that = this
        that.delCartListsFn()
    },

    /** 删除购物车列表. */
    delCartListsFn() {
        let that = this
        app.appRequest({
            url: "/app/shoppingCart/deleteShoppingCarts.action",
            method: "GET",
            getParams: {
                "productId": that.data.productId,
                "userId": wx.getStorageSync("userInfo").id
            },
            success(res) {
                that.setData({
                    cartLists: [],
                    checkedAll: false,
                    totalPrice: 0,
                    deleteCartShopShow: false,
                    administrationType: 1
                })
                wx.showToast({
                    title: '已删除',
                    icon: 'none'
                })
                that.getCartListsFn()
                that.getCartBuyNumberFn()
            }
        })
    },

    /** 各种价格计算. */
    calculatedPriceFn() {
        let that = this
        let cartLists = that.data.cartLists
        cartLists = cartLists.filter(item => item.checked)
        let maxDeliveryFee = that.data.maxDeliveryFee
        let increaseFee = that.data.increaseFee
        let deliveryFee = that.data.deliveryFee
        let expressVipDiscountTotalAll = 0,
            expressWxDiscountTotalAll = 0,
            expressPageDiscountTotalAll = 0
        // expressVipDiscountTotalAll: '', // vip快递配送总计金额
        // expressWxDiscountTotalAll: '', // 微信快递配送总计金额
        // expressVipDiscountTotalAll
        // vipDiscountTotalAll
        // totalVIPPriceAll
        let totalPrice = 0
        let quantityAll = 0
        let totalVIPPriceAll = 0
        let deliveryCost = 0
        let reductionTotalAll = 0
        let vipDiscountTotalAll = 0
        cartLists.forEach(item => {
            // 商品总额
            totalPrice += (item.price * item.quantity)
            // 计算每个商品小计金额
            item.subtotal = (item.price * item.quantity).toFixed(2)
            //减免额度总计
            reductionTotalAll += (item.deductAmount * item.quantity)
            //vip优惠额度总计
            vipDiscountTotalAll += ((item.price - item.vipPrice) * item.quantity)
            //购买总数量
            quantityAll += item.quantity
        })

        quantityAll > 10 ? deliveryCost = maxDeliveryFee : deliveryCost = ((quantityAll - 1) * increaseFee + deliveryFee)
        that.setData({
            totalPrice: totalPrice.toFixed(2),
            expressWxDiscountTotalAll: (totalPrice + deliveryCost - reductionTotalAll).toFixed(2),
            totalVIPPriceAll: (totalPrice - vipDiscountTotalAll).toFixed(2),
            expressVipDiscountTotalAll: (totalPrice + deliveryCost - vipDiscountTotalAll).toFixed(2),
            expressPageDiscountTotalAll: (totalPrice + deliveryCost).toFixed(2),
            wxActualPaymentAmount: (totalPrice - reductionTotalAll).toFixed(2),
            reductionTotalAll: reductionTotalAll.toFixed(2),
            vipDiscountTotalAll: vipDiscountTotalAll.toFixed(2),
            deliveryCost: deliveryCost
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