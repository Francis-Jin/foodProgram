// pages/spell_list_details/spell_list_details.js
const util = require('../../utils/util');
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        deliveryObj: {},
        userInfo:null,
        imgLists: [1,2],
        urlBefore: app.globalData.urlBefore,
        lists:[],
        addressLists: [], // 显示用户地址列表
        systemInfo: '', //系统配置信息
        showSpellList: false, //弹起拼单或单独购买弹框
        groupBuyId: '', // 拼单ID
        waysOfPurchasing: '', // 选择购买方式 1：单独购买 2：拼单购买
        deliveryMode: 2, //选择用餐方式 1：自取 2：配送
        showAddress: false, // 是否选择地址弹窗
        addressText: '选择配送地址', //显示选择的地址
        addressItem: '', //选择的地址Item元素
        messageText: '', // 商家留言信息
        payShow: false, // 是否显示支付方式选择
        selectedId: 1, // 选择支付方式 1：微信支付 2：余额支付
        listGroupBuyByIngLists: [], //正在拼单的列表
        groupPrice: '', //拼单支付金额

        makeAppointmentShow: false, //是否显示预约点餐

        // ================================
        haveMealAddresInfo: null, // 用餐地址选择返回
        takeMealsAddressId: null, //选择回来的取餐地址ID
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this
        let userInfo = wx.getStorageSync('userInfo')
        that.setData({
            deliveryObj: wx.getStorageSync('deliveryMode'),
            foodName: options.foodName,
            foodId: options.foodId,
            userInfo: userInfo
        })
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })
        that.getSysConfFn()
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
    
    /** 获取拼单列表. */
    listGroupBuyByIngFn() {
        let that = this
        app.appRequest({
            url: '/app/orderInfo/listGroupBuyByIng.action',
            method: 'get',
            getParams: {
                productId: that.data.foodId
            },
            success(res) {
                if (res.code == 200) {
                    if (res.data) {
                        let systemParamInfo = that.data.systemInfo
                        let groupTimeLimit = systemParamInfo.groupTimeLimit
                        res.data.forEach(item=>{
                            item.createTime = item.createTime.replace(/\-/g, "/")
                            let Target = new Date(item.createTime).getTime() + (groupTimeLimit * 60 * 1000)
                            item.createTime = util.formatTime(new Date(Target))
                        })
                        that.setData({
                            lists: res.data
                        })
                    }
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
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

    /** 点击加入拼单按钮. */
    waysOfPurchasingFn(e) {
        let item = e.currentTarget.dataset.item
        let showTime = item.showTime
        let itemUserId = item.userId
        let price = item.price
        let groupPrice = item.groupPrice
        let groupBuyId = item.id
        let listDiscount = (price - groupPrice).toFixed(2)
        let userInfoUserId = wx.getStorageSync("userInfo").id
        if(itemUserId == userInfoUserId || showTime == '00:00'){
            return false
        }
        this.setData({
            listDiscount: listDiscount,
            groupPrice: groupPrice,
            groupBuyId: groupBuyId,
            showSpellList: true
        })
    },

    /** 关闭拼单弹框. */
    onCloseSpellList() {
        this.setData({
            showSpellList: false
        })
    },

    /** 选择用餐方式. */
    selectedFn(e) {
        let type = e.currentTarget.dataset.type
        this.setData({
            deliveryMode: type
        })
    },

    /** 弹出地址选择框. */
    addressShowFn() {
        this.setData({
            showAddress: true
        })
    },

    /** 关闭地址选择框. */
    onCloseAddressFn() {
        this.setData({
            showAddress: false
        })
    },

    /** 获取配置信息. */
    getSysConfFn() {
        let that = this
        app.appRequest({
            url: '/app/sysConf/getSysConf.action',
            method: 'get',
            success(res) {
                that.setData({
                    systemInfo: res.data
                })

                that.listGroupBuyByIngFn()
            }
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

    /** 选择配送地址 */
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
            addressText: addressText,
            addressLists: addressLists,
            showAddress: false,
            addressItem: addressItem
        })
    },

    /** 跳转到添加地址页面. */
    addAddressFn() {
        wx.navigateTo({
            url: '/pages/add_address/add_address',
        })
    },

    /** 输入留言信息 */
    messageInputFn(e) {
        let val = e.detail.value
        this.setData({
            messageText: val
        })
    },

    /** 点击加入拼单按钮. */
    goPayIndentFn() {
        let that = this
        let assembleId = that.data.assembleId // 拼单ID
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let addressItem = that.data.haveMealAddresInfo // 选择的地址
        let takeMealsAddressId = that.data.takeMealsAddressId // 选择的地址
        let messageText = that.data.messageText // 留言信息
        let addressText = that.data.addressText // 留言信息
        if (deliveryMode == '') {
            wx.showToast({
                title: '请选择用餐方式',
                icon: 'none'
            })
            return false
        }

        if (!takeMealsAddressId && deliveryMode == 1) {
            wx.showToast({
                title: '请选择自取地址',
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
        wx.showLoading({
            title: '加载中',
        })
        let parm
        if (deliveryMode == 1) {
            parm = {
                userId: wx.getStorageSync("userInfo").id,
                groupBuyId: that.data.groupBuyId,
                deliveryMode: deliveryMode,
                message: messageText,
                name: '',
                phone: '',
                communityId: 0,
                communitySectionId: 0,
                communityBuildingId: 0,
                communityBuildingUnitId: 0,
                address: '',
                locationId: that.data.takeMealsAddressId,
            }
        } else {
            parm = {
                userId: wx.getStorageSync("userInfo").id,
                groupBuyId: that.data.groupBuyId,
                deliveryMode: deliveryMode,
                message: messageText,
                name: addressItem.name,
                phone: addressItem.phone,
                communityId: addressItem.communityId,
                communitySectionId: addressItem.communitySectionId,
                communityBuildingId: addressItem.communityBuildingId,
                communityBuildingUnitId: addressItem.communityBuildingUnitId,
                address: addressItem.address + addressItem.doorplate,
                locationId: 0,
            }
        }
        app.appRequest({
            url: '/app/orderInfo/saveGroupBuyJoin.action',
            method: 'post',
            postData: parm,
            success(res) {
                wx.hideLoading()
                if (res.code == 200) {
                    that.setData({
                        orderId: res.message,
                        payShow: true
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            },
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
            payShow: false,
            showSpellList:false
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
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
            that.GetAdvertisingFn()
        }
        that.getUserAddressFn()
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