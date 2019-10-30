// pages/make_up_list/make_up_list.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: '', //菜品信息
        foodId: '', // 当前商品ID
        urlBefore: app.globalData.urlBefore,
        isShowOverTime: false,
        addressLists: [], // 显示用户地址列表
        systemInfo: '', //系统配置信息
        showSpellList: false, //弹起拼单或单独购买弹框
        waysOfPurchasing: '', // 选择购买方式 1：单独购买 2：拼单购买
        assembleMode: '', //选择拼团方式 1：2人拼团 2：多人拼团
        deliveryMode: '', //选择用餐方式 1：自取 2：配送
        showAddress: false, // 是否选择地址弹窗
        addressText: '', //显示选择的地址
        addressItem: '', //选择的地址Item元素
        messageText: '', // 商家留言信息
        payShow: false, // 是否显示支付方式选择
        selectedId: '', // 选择支付方式 1：微信支付 2：余额支付
        listGroupBuyByIngLists: [], //正在拼单的列表

        twoPrice: 0, //两人拼金额，
        morePrice: 0, // 多人拼金额

        makeAppointmentShow: false, //是否显示预约点餐
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let foodId = options.foodId
        let that = this
        this.setData({
            foodId: foodId
        })
        that.getDetails()
        that.getSysConfFn()
    },

    /** 获取拼单列表. */
    listGroupBuyByIngFn(){
        let that = this
        app.appRequest({
            url: '/app/orderInfo/listGroupBuyByIng.action',
            method: 'get',
            getParams: {
                productId: that.data.foodId
            },
            success(res){
                if(res.code == 200){
                    if(res.data){
                        res.data.forEach(item => {
                            item.createTime = item.createTime.trim().split(/\s+/)[1]
                        })
                        that.setData({
                            listGroupBuyByIngLists: res.data
                        })
                    }
                }else{
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 获取菜品信息. */
    getDetails() {
        let that = this
        app.appRequest({
            url: "/app/dishInfo/dishInfoDetail.action",
            method: "get",
            getParams: {
                dishId: that.data.foodId,
                userId: wx.getStorageSync("userInfo").id
            },
            success(res) {
                let info = res.data.DishInfoVo
                that.setData({
                    info: info,
                    twoPrice: info.doublePrice,
                    morePrice: info.multiplePrice,
                    buyNumber: res.data.shoppingCartTotal
                })
            }
        })
    },

    /** 购买方式. */
    waysOfPurchasingFn(e) {
        let type = e.currentTarget.dataset.type
        if (type == 1) {
            wx.navigateBack({
                detal: 1
            })
        } else {

            this.setData({
                showSpellList: true
            })
        }
    },

    /** 关闭拼单或单独购买弹框. */
    onCloseSpellList() {
        this.setData({
            showSpellList: false
        })
    },

    /** 选择拼团方式. */
    selectedAssembleFn(e) {
        let type = e.currentTarget.dataset.type
        this.setData({
            assembleMode: type
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

    /** 点击发起拼单按钮. */
    goPayIndentFn() {
        let that = this
        let assembleMode = that.data.assembleMode // 拼单方式
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let addressItem = that.data.addressItem // 选择的地址
        let messageText = that.data.messageText // 留言信息
        let addressText = that.data.addressText // 留言信息
        console.log(deliveryMode)
        console.log(addressItem)
        if(assembleMode == ''){
            wx.showToast({
                title: '请选择拼单方式',
                icon: 'none'
            })
            return false
        }
        if (deliveryMode == '') {
            wx.showToast({
                title: '请选择用餐方式',
                icon: 'none'
            })
            return false
        }

        if (addressItem == '' && deliveryMode == 2) {
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
        if (deliveryMode == 1){
            parm = {
                userId: wx.getStorageSync("userInfo").id,
                dishId: that.data.foodId,
                groupBuyModel: assembleMode,
                deliveryMode: deliveryMode,
                message: messageText,
                name: '',
                phone: '',
                communityId: 0,
                communitySectionId: 0,
                communityBuildingId: 0,
                communityBuildingUnitId: 0,
                address: addressText
            }
        }else{
            parm = {
                userId: wx.getStorageSync("userInfo").id,
                dishId: that.data.foodId,
                groupBuyModel: assembleMode,
                deliveryMode: deliveryMode,
                message: messageText,
                name: addressItem.name,
                phone: addressItem.phone,
                communityId: addressItem.communityId,
                communitySectionId: addressItem.communitySectionId,
                communityBuildingId: addressItem.communityBuildingId,
                communityBuildingUnitId: addressItem.communityBuildingUnitId,
                address: addressText
            }
        }
        app.appRequest({
            url: '/app/orderInfo/saveGroupBuy.action',
            method: 'post',
            postData: parm,
            success(res){
                wx.hideLoading()
                if(res.code == 200){
                    that.setData({
                        orderId: res.message,
                        payShow: true
                    })
                }else{
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
            showSpellList: false
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

    /** 跳转到拼单详情 */
    toPageFn(){
        wx.navigateTo({
            url: '/pages/spell_list_details/spell_list_details?foodId=' + this.data.foodId + "&foodName=" + this.data.info.name,
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
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let that = this
        // 获取用户地址列表
        that.setData({
            isShowOverTime: false,
            showSpellList: false, //弹起平团弹框
            assembleMode: '', //选择拼团方式 1：2人拼团 2：多人拼团
            deliveryMode: '', //选择用餐方式 1：自取 2：配送
            showAddress: false, // 是否选择地址弹窗
            addressText: '', //显示选择的地址
            addressItem: '', //选择的地址Item元素
            messageText: '', // 商家留言信息
            payShow: false, // 是否显示支付方式选择
            selectedId: '', // 选择支付方式 1：微信支付 2：余额支付
        })
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
        }
        // 获取用户地址列表。
        that.getUserAddressFn()
        // 获取拼单列表
        that.listGroupBuyByIngFn() 
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