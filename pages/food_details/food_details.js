// pages/food_details/food_details.js
const util = require('../../utils/util');
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: '',
        deliveryObj: {},
        urlBefore: app.globalData.urlBefore,
        discountNumber: 1,
        isPopping: false,
        buyNumber: 0,
        foodId: '',//菜品ID
        vipSavePrice: '',

        isDaiJinChiShow: false,
        // =============
        haveMealAddresInfo: null, // 用餐地址选择返回
        takeMealsAddressId: null, //选择回来的取餐地址ID
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址

        bookProvincePrice: 0, // 预约省多少钱
        systemInfo: '', //系统配置信息
        showSpellList: false, //弹起拼单或单独购买弹框
        waysOfPurchasing: '', // 选择购买方式 1：单独购买 2：拼单购买
        assembleMode: '', //选择拼团方式 1：2人拼团 2：多人拼团
        deliveryMode: 2, //选择用餐方式 1：自取 2：配送
        showAddress: false, // 是否选择地址弹窗
        addressItem: '', //选择的地址Item元素
        messageText: '', // 商家留言信息
        payShow: false, // 是否显示支付方式选择
        selectedPayId: 1, // 选择支付方式 1：微信支付 2：余额支付
        listGroupBuyByIngLists: [], //正在拼单的列表

        twoPrice: 0, //两人拼金额，
        morePrice: 0, // 多人拼金额
        // ==============

        isVipBuyStatus: false, // 是否点击了vip直购
        vipPaySuccessStatus: false, // 是否显示VIP直购弹窗
        guideMongoliaShowStatus: false, //是否显示引导蒙层
        showPage: false,
        // 加入购物车动画小球
        hide_good_box: true,
        bus_x: 0,
        bus_y: 0,

        // 推荐小食数据
        listDishInfoByRecommendArr: '',
        garnishInfo: '',
        isTouchEnd: false, // 是否按下分享按钮
    },

    /** 分享按钮按下. */
    touchStartFn(){
        this.setData({
            isTouchEnd: true
        })
    },
    /** 分享按钮按下松开. */
    touchEndFn() {
        this.setData({
            isTouchEnd: false
        })
    },

    /** 跳转支付成功后的广告详情. */
    toAdvertisementDetailsFn(){
        let advertisingInfo = this.data.advertisingInfo
        wx.navigateTo({
            url: '/pages/advertisement_details/advertisement_details?itemId=' + advertisingInfo.id,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var _windowHeight = wx.getSystemInfoSync().windowHeight;

        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            deliveryObj: wx.getStorageSync('deliveryMode'),
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })

        // 目标终点元素 - 购物车的位置坐标
        this.busPos = {};
        this.busPos['x'] = 10; // x坐标暂写死，自己可根据UI来修改
        this.busPos['y'] = _windowHeight - 60; // y坐标，也可以根据自己需要来修改

        let that = this
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
        let newUser = wx.getStorageSync('userInfo').newUser
        if (newUser == 1) {
            this.setData({
                guideMongoliaShowStatus: true
            })
        }
        let itemId = options.itemId
        this.setData({
            userInfo: wx.getStorageSync('userInfo'),
            foodId: itemId
        })

        this.getUserInfoFn()
        this.getSysConfFn()
        this.getListDishInfoByRecommendFn()
        this.getGarnishDataFn()
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

    /** 获取配菜数据. */
    getGarnishDataFn(){
        let that = this
        app.appRequest({
            url: '/app/recommend/listTodayVegetables.action',
            method: 'get',
            success(res){
                if(res.code == 200){
                    if(res.data){
                        res.data.forEach(item=>item.checked=false)
                        that.setData({
                            garnishInfo: res.data
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

    /** 点击选择配菜. */
    clickGarnishItemFn(e){
        let that = this;
        let Item = e.currentTarget.dataset.item;
        let garnishInfo = that.data.garnishInfo;
        
        let newGarnishInfo = garnishInfo.filter(item => item.checked)
        if (!Item.checked && newGarnishInfo.length > 1){
            wx.showToast({
                title: '只能选择2个配菜',
                icon: 'none'
            })
            return false
        }
        garnishInfo.forEach(item => {
            if (item.ingredientId == Item.ingredientId) {
                item.checked = !item.checked
            }
        })

        that.setData({
            garnishInfo: garnishInfo
        })
        
        
        that.allPrcieCalculationFn()
    },

    /** 各种价格计算总价 */
    allPrcieCalculationFn(){
        // listDishInfoByRecommendArr
        let that = this
        // 主菜品
        let VipActualAmountPaid = 0
        let ActualAmountPaid = 0 //实付金额
        let TotalSavings = 0 // 总共节省
        let VipDiscount = 0 // vip优惠
        let DaiJinChiDiscount = 0 // 代金池优惠
        let info = that.data.info
        let userInfo = wx.getStorageSync('userInfo')
        // 配菜
        let garnishInfo = that.data.garnishInfo
        // 推荐小食
        let listDishInfoByRecommendArr = that.data.listDishInfoByRecommendArr
        console.log(listDishInfoByRecommendArr)
        /**
         * if (garnishInfo && listDishInfoByRecommendArr){
            let newGarnishInfo = garnishInfo.filter(item => item.checked)
            let newListDishInfo = listDishInfoByRecommendArr.filter(item => item.quantity > 0)
            newGarnishInfo.forEach(item => {
                ActualAmountPaid += item.price
            })
            newListDishInfo.forEach(item => {
                ActualAmountPaid += item.bookPrice * item.quantity
            })
        }
        */
        let newListDishInfo = []
        if (listDishInfoByRecommendArr){
            newListDishInfo = listDishInfoByRecommendArr.filter(item => item.quantity > 0)
        }
        // console
        newListDishInfo.forEach(item => {
            ActualAmountPaid += item.price * item.quantity
        })
        VipDiscount = info.price - info.vipPrice
        DaiJinChiDiscount = info.deductAmount
        ActualAmountPaid += info.price
        VipActualAmountPaid = ActualAmountPaid - info.price + info.vipPrice
        if(userInfo.vip == 1){
            ActualAmountPaid = ActualAmountPaid - info.price + info.vipPrice
            TotalSavings = VipDiscount
        }else{
            ActualAmountPaid = ActualAmountPaid - DaiJinChiDiscount
            TotalSavings = DaiJinChiDiscount
        }
        that.setData({
            VipActualAmountPaid: VipActualAmountPaid.toFixed(2),
            ActualAmountPaid: ActualAmountPaid.toFixed(2),
            TotalSavings: TotalSavings.toFixed(2),
            VipDiscount: VipDiscount.toFixed(2),
            DaiJinChiDiscount: DaiJinChiDiscount.toFixed(2)
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
                        res.data.forEach(item => {
                            item.createTime = item.createTime.replace(/\-/g, "/")
                            let Target = new Date(item.createTime).getTime() + (groupTimeLimit * 60 * 1000)
                            item.createTime = util.formatTime(new Date(Target))
                        })

                        that.setData({
                            listGroupBuyByIngLists: res.data
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
                let userInfo = res.data
                that.setData({
                    userInfo: userInfo
                })
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /** 点击立即支付. */
    ImmediatePaymentFn(){
        let that = this
        let Info = that.data.info
        if(Info.stock < 1) return false
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        // let GarnishInfo = that.data.garnishInfo
        // let newGarnishInfo = GarnishInfo.filter(item => item.checked)
        // if (newGarnishInfo.length < 1 && Info.openVegetable == 1) {
        //     wx.showToast({
        //         title: '请选择配菜',
        //         icon: 'none'
        //     })
        //     return false
        // }
        // 提示代金池余额不足
        if (userInfo.voucherBalance < Info.deductAmount){
            this.setData({
                isDaiJinChiShow: true
            })
        } else{
            that.setData({
                showSpellList: true,
                isVipBuyStatus: true
            })
        }
        
    },

    /** 点击直接购买. */
    directBuyFn(){
        this.setData({
            isDaiJinChiShow: false,
            showSpellList: true,
            isVipBuyStatus: true
        })
    },

    /** 点击vip直购. */
    vipBuyFn() {
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
        let info = that.data.info
        let Info = that.data.info
        if (Info.stock < 1) return false
        let voucherBalance = userInfo.balance
        let price = info.price
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        if (voucherBalance > price) {
            that.setData({
                showSpellList: true,
                isVipBuyStatus: true
            })
        } else {
            // 去充值
            wx.navigateTo({
                url: '/pages/recharge/recharge',
            })
        }
    },

    /** 立即支付。选择配菜，推荐小食下单购买. */
    ImmediatePaymentOrderGoPayFn(){
        let that = this
        let userInfo = that.data.userInfo 
        let Info = that.data.info
        Info.dishId = Info.id
        let GarnishInfo = that.data.garnishInfo
        let newGarnishInfo = []
        // newGarnishInfo = GarnishInfo.filter(item => item.checked)
        let ListDishInfoByRecommendArr = that.data.listDishInfoByRecommendArr
        let newListDishInfo = ListDishInfoByRecommendArr.filter(item => item.quantity > 0)
        let addressItem = that.data.haveMealAddresInfo
        let deliveryMode = that.data.deliveryMode
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let bookId = that.data.bookId
        // dishInfoArr.push({
        //     dishId: item.dishId,
        //     quantity: item.quantity,
        //     isRecommend: item.isRecommend,
        //     ingredientId: item.isRecommend == 0 ? arr3.join() : ''
        // })
        let GarnishId = []
        // newGarnishInfo.forEach(item=>{
        //     GarnishId.push(item.ingredientId)
        // })
        let dishInfoArr = []
        dishInfoArr.push({
            dishId: Info.dishId,
            quantity: 1,
            isRecommend: 0,
            ingredientId: GarnishId.join()
        })
        newListDishInfo.forEach(item=>{
            dishInfoArr.push({
                dishId: item.id,
                quantity: item.quantity,
                isRecommend: 0,
                ingredientId: ''
            })
        })
        let params = {
            dishInfoArr: JSON.stringify(dishInfoArr), 
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
            bookId: newGarnishInfo.length > 0 ? newGarnishInfo[0].bookId : 0,
            getDinnerTime: null,
            getDinnerTimeStr: '',
            dinnerCategory: 0,
            bookLabel: '',
        }
        let voucherBalance = userInfo.balance
        let price = Info.price
        
        app.appRequest({
            url: "/app/orderInfo/saveOrderInfo.action",
            method: "post",
            postData: params,
            success(res) {
                if (res.code == 200) {
                    let orderNumber = res.message
                    that.setData({
                        orderId: orderNumber,
                        // vipPaySuccessStatus: true
                    })
                    if (voucherBalance > price) {
                        that.vipPayConfirmFn()
                    } else {
                        that.wxPayFn()
                    }
                }
            }
        })
    },

    /** 确认VIP支付 */
    vipPayConfirmFn() {
        let orderId = this.data.orderId

        this.setData({
            vipPaySuccessStatus: false
        })

        wx.navigateTo({
            url: '/pages/inputPassword/inputPassword?orderId=' + orderId,
        })
    },

    /** 点击去拼单. */
    waysOfPurchasingFn(e) {
        let info = this.data.info
        if(info.stock < 1) return false
        let type = e.currentTarget.dataset.type
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        this.setData({
            isVipBuyStatus: false,
            showSpellList: true
        })
    },

    /** 关闭拼单弹框. */
    onCloseSpellList() {
        this.setData({
            showSpellList: false
        })
    },

    /** 选择拼团方式. */
    selectedAssembleFn(e) {
        let that = this
        let type = e.currentTarget.dataset.type
        let info = that.data.info
        let twoPrice = that.data.twoPrice
        let morePrice = that.data.morePrice
        let listDiscount
        if (type == 1) {
            listDiscount = (info.price - twoPrice).toFixed(2)
        } else {
            listDiscount = (info.price - morePrice).toFixed(2)
        }
        this.setData({
            listDiscount: listDiscount,
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

    /** 点击发起拼单按钮 开始拼单. */
    goPayIndentFn() {
        let isVipBuyStatus = this.data.isVipBuyStatus
        if (!isVipBuyStatus) {
            this.pingDanBuyFn()
        } else {
            this.ImmediatePaymentOrderGoPayFn()
            // this.vipSubmitOrderFn()
        }
    },

    /** 拼单下单. */
    pingDanBuyFn() {
        let that = this
        let assembleMode = that.data.assembleMode // 拼单方式
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let addressItem = that.data.haveMealAddresInfo // 选择的地址
        let takeMealsAddressId = that.data.takeMealsAddressId // 选择回来自取地址ID
        let messageText = that.data.messageText // 留言信息
        if (assembleMode == '') {
            wx.showToast({
                title: '请选择拼团方式',
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
                address: '',
                locationId: that.data.takeMealsAddressId,
            }
        } else {
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
                address: addressItem.address + addressItem.doorplate,
                locationId: 0,
            }
        }
        app.appRequest({
            url: '/app/orderInfo/saveGroupBuy.action',
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

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.redirectTo({
            url: '/pages/index/index',
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

                // 获取拼单列表
                that.listGroupBuyByIngFn()
            }
        })
    },

    /** 点击支付方式弹框确认按钮. */
    confirmAppointFn() {
        let that = this
        let selectedPayId = that.data.selectedPayId
        let orderId = that.data.orderId
        if (selectedPayId == 1) {
            that.wxPayFn()
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
                        that.GetAdvertisingFn()
                    },
                    fail(err) {
                        console.log(err)
                        wx.showToast({
                            title: '支付取消',
                            icon: 'none'
                        })
                        // wx.showModal({
                        //     title: '提示',
                        //     content: '支付失败',
                        //     showCancel: false,
                        //     confirmColor: "#5bcbc8",
                        //     success(res) {
                        //         wx.navigateTo({
                        //             url: '/pages/order/order',
                        //         })
                        //     }
                        // })
                    }
                })
            }
        })
    },

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.navigateTo({
            url: '/pages/index/index',
        })
    },

    /** ==================================================================================================================== */

    /** 播放音频. */
    playAudioFn(e) {
        let audioUrl = e.currentTarget.dataset.audiourl
        let name = this.data.info.name
        let audioBox = wx.getBackgroundAudioManager()
        audioBox.src = audioUrl
        audioBox.title = name
        audioBox.play()
    },

    /** 跳转视频播放. */
    toPlayVideo(e) {
        let url = e.currentTarget.dataset.url
        let category = e.currentTarget.dataset.category
        let cookName = this.data.info.name
        if (category != 2) return false
        wx.navigateTo({
            url: '/pages/play_video/play_video?url=' + url + "&cookName=" + cookName
        })
    },

    /** 关闭引导蒙层. */
    closeGuideMongoliaFn() {
        this.setData({
            guideMongoliaShowStatus: false
        })
        this.getUserInfoFn()
    },

    /** 获取用户信息. */
    getUserInfoFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserInfo.action',
            method: 'get',
            getParams: {
                id: wx.getStorageSync('userInfo').id,
                newUser: 0
            },
            success(res) {
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /** 获取推荐小食数据. */
    getListDishInfoByRecommendFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/listDishInfoBySnacks.action',
            method: 'get',
            success(res) {
                console.log(res)
                if (res.code == 200) {
                    let arr = res.data
                    arr.forEach(item => {
                        item.quantity = 0
                        item.dishId = item.id
                        item.isRecommend = 0
                    })
                    that.setData({
                        listDishInfoByRecommendArr: arr
                    })
                }
            }
        })
    },

    /** 获取菜品信息. */
    getDetails(id) {
        let that = this
        let userInfo = wx.getStorageSync("userInfo")
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
                        showPage: true,
                        twoPrice: info.doublePrice,
                        morePrice: info.multiplePrice,
                        info: info,
                        bookProvincePrice: (info.marketPrice - info.bookPrice).toFixed(2),
                        vipSavePrice: (res.data.DishInfoVo.price - res.data.DishInfoVo.vipPrice).toFixed(2),
                        buyNumber: res.data.shoppingCartTotal
                    })

                    // 价格计算
                    that.allPrcieCalculationFn()
                }
            }
        })
    },

    /** 添加购物车 */
    addCart(e) {
        let that = this
        let itemId = that.data.foodId
        let info = that.data.info
        if (info.stock == 0) return false
        let addPic = e.currentTarget.dataset.pic
        that.setData({
            addPic: addPic,
            itemId: itemId
        })
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        // 如果good_box正在运动，不能重复点击
        if (!this.data.hide_good_box) return;
        this.finger = {};
        var topPoint = {};
        //点击点的坐标
        this.finger['x'] = e.touches["0"].clientX;
        this.finger['y'] = e.touches["0"].clientY;

        //控制点的y值定在低的点的上方150处
        if (this.finger['y'] < this.busPos['y']) {
            topPoint['y'] = this.finger['y'] - 200;
        } else {
            topPoint['y'] = this.busPos['y'] - 200;
        }

        //控制点的x值在点击点和购物车之间
        if (this.finger['x' > this.busPos['x']]) {
            topPoint['x'] = (this.finger['x'] - this.busPos['x']) / 2 + this.busPos['x'];
        } else {
            topPoint['x'] = (this.busPos['x'] - this.finger['x']) / 2 + this.finger['x'];
        }

        this.linePos = app.bezier([this.busPos, topPoint, this.finger], 30);
        this.startAnimation();

    },

    /** 加入购物车动画. */
    startAnimation: function () {
        var index = 0,
            that = this,
            bezier_points = that.linePos['bezier_points'];
        this.setData({
            hide_good_box: false,
            bus_x: that.finger['x'],
            bus_y: that.finger['y']
        })
        index = bezier_points.length;
        this.timer = setInterval(function () {
            index--;
            // 设置球的位置
            that.setData({
                bus_x: bezier_points[index]['x'],
                bus_y: bezier_points[index]['y']
            })
            // 到最后一个点的时候，开始购物车的一系列变化，并清除定时器，隐藏小球
            if (index < 1) {
                clearInterval(that.timer);
                that.requestAddCart()
                that.setData({
                    hide_good_box: true
                })
            }
        }, 33);
    },

    /** 请求加入购物车. */
    requestAddCart() {
        let that = this
        app.appRequest({
            url: "/app/shoppingCart/saveShoppingCart.action",
            method: 'post',
            getParams: {
                productId: that.data.foodId,
                quantity: 1,
                createUser: wx.getStorageSync("userInfo").id
            },
            success(res) {
                // wx.showToast({
                //     title: res.message,
                //     icon: 'none'
                // })
                that.getDetails(that.data.foodId)
            }
        })
    },

    /** 页面跳转. */
    toPageFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let userInfo = wx.getStorageSync("userInfo")
        let info = that.data.info
        console.log(info)
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/login/login?isLogin=true',
            })
            return false
        }
        if (_type == 1) {
            // 推荐理由
            wx.showToast({
                title: '功能正在更新',
                icon: 'none'
            })
            // wx.navigateTo({
            //     url: '/pages/account/account',
            // })
        } else if (_type == 2) {
            if (info.stock < 1) return false
            // 去拼单
            wx.navigateTo({
                url: '/pages/make_up_list/make_up_list?foodId=' + this.data.foodId,
            })
        } else if (_type == 3) {
            if (info.stock < 1) return false
            // 去充值
            wx.navigateTo({
                url: '/pages/recharge/recharge',
            })
        } else if (_type == 4) {
            // 预约
            this.setData({
                isShowDate: true
            })
        } else if (_type == 5) {
            wx.navigateTo({
                url: '/pages/spell_list_details/spell_list_details?foodId=' + this.data.foodId + "&foodName=" + this.data.info.name,
            })
        }
    },

    /** 数量加减. */
    addReduceFn(e) {
        console.log("增加数量")
        let that = this
        let status = e.currentTarget.dataset.status
        let type = e.currentTarget.dataset.type
        let Item = e.currentTarget.dataset.item
        let itemQuantity = Item.quantity
        // 推荐单点数据
        let listDishInfoByRecommendArr = that.data.listDishInfoByRecommendArr
        // 减少
        if (type == 1) {
            if (itemQuantity == 0) {
                wx.showToast({
                    title: '不可减少了哟',
                    icon: 'none'
                })
                return false
            }
            if (status == 'dd') {
                itemQuantity--
                listDishInfoByRecommendArr.forEach(item => {
                    if (Item.id == item.id) {
                        item.quantity = itemQuantity
                    }
                })

                that.setData({
                    listDishInfoByRecommendArr: listDishInfoByRecommendArr
                })
            }
        }

        // 增加
        if (type == 2) {

            if (status == 'dd') {
                itemQuantity++
                listDishInfoByRecommendArr.forEach(item => {
                    if (Item.id == item.id) {
                        item.quantity = itemQuantity
                    }
                })
                that.setData({
                    listDishInfoByRecommendArr: listDishInfoByRecommendArr
                })
            }
        }
        that.allPrcieCalculationFn()
    },

    /** 弹出收回. */
    plus() {
        wx.redirectTo({
            url: '/pages/cart/cart',
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
        let itemId = this.data.foodId
        // setTimeout(function () {
        that.getDetails(itemId)
        // }, 200)
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            this.setData({
                makeAppointmentShow: true
            })
            this.GetAdvertisingFn()
        }

        this.setData({
            isShowDate: false,
            userInfo: wx.getStorageSync('userInfo')
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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

    /** 分享菜品，增加5元代金池. */
    updateDishShareFn(){
        let that = this
        app.appRequest({
            url: '/app/userInfo/updateDishShare.action',
            method: 'post',
            postData: {
                userId: wx.getStorageSync('userInfo').id,
                dishId: that.data.info.id
            },
            success(){
                that.getUserInfoFn()
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
        let that = this
        wx.setStorageSync('shareFoodId', this.data.info.id)
        wx.showShareMenu({
            withShareTicket: true
        })
        that.updateDishShareFn()
        return {
            title: '菜品分享',
            path: '/pages/food_details/food_details?itemId=' + wx.getStorageSync('shareFoodId'),
            success: function (res) {
            }
        }
    }
})