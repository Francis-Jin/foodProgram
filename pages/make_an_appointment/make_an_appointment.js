// pages/make_an_appointment/make_an_appointment.js
var app = getApp()
let h = []
for (let i = 0; i <= 23; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    h.push(i)
}

let m = []
for (let i = 0; i <= 59; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    m.push(i)
}
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showPaySuccessStatus: false, // 支付成功回显弹窗
        urlBefore: app.globalData.urlBefore,
        addressLists: [], // 显示用户地址列表
        systemInfo: '', //系统配置信息
        showSpellList: false, //弹起拼单或单独购买弹框
        waysOfPurchasing: '', // 选择购买方式 1：单独购买 2：拼单购买
        assembleMode: '', //选择配送或自取时间 1：早餐 2：午餐 3：晚餐
        deliveryMode: '', //选择用餐方式 1：自取 2：配送
        showAddress: false, // 是否选择地址弹窗
        addressText: '', //显示选择的地址
        addressItem: '', //选择的地址Item元素
        messageText: '', // 商家留言信息
        payShow: false, // 是否显示支付方式选择
        selectedId: '', // 选择支付方式 1：微信支付 2：余额支付
        showTime: false, //是否显示时间选择器
        bookTime: '', //明日日期
        selectedTime: '', // 用餐时间
        HaveMealsLists: [], // 早餐、午餐、晚餐数据列表
        totalPriceAll: 0, // 总价
        totalPriceAllModal: 0, //弹框总价计算，自取，配送
        bookId: '', // 传参ID
        columns: [{
                values: h,
                className: 'column1'
            },
            {
                values: m,
                className: 'column2'
            }
        ],

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        let type = options.type
        let titleText = ''
        that.setData({
            assembleMode: type
        })

        if (type == 1) {
            titleText = '早餐预约'
        } else if (type == 2) {
            titleText = '午餐预约'
        } else {
            titleText = '晚餐预约'
        }
        wx.setNavigationBarTitle({
            title: titleText,
        })
        that.getBookDishInfoByTomorrowFn()
    },

    /** 点击头部返回首页. */
    backOrderListsFn() {
        wx.switchTab({
            url: '/pages/index/index',
        })
    },

    /** 获取预约单列表. */
    getBookDishInfoByTomorrowFn() {
        let that = this
        let assembleMode = that.data.assembleMode
        app.appRequest({
            url: '/app/dishInfo/getBookDishInfoByTomorrow.action',
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    let dataArr = res.data.details
                    let totalPriceAll = that.data.totalPriceAll
                    if (dataArr) {
                        dataArr.forEach(item => {
                            item.quantity = 1
                            if (item.category == assembleMode) {
                                totalPriceAll += item.bookPrice * 1
                            }
                        })
                        that.setData({
                            bookId: res.data.id,
                            bookTime: res.data.bookTime,
                            totalPriceAll: totalPriceAll,
                            totalPriceAllModal: totalPriceAll,
                            HaveMealsLists: dataArr
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

    /** 数量加减. */
    addReduceFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let item = e.currentTarget.dataset.itemid
        let itemId = item.dishId
        let HaveMealsLists = that.data.HaveMealsLists
        let assembleMode = that.data.assembleMode
        let thisItem = HaveMealsLists.filter(item => item.dishId == itemId)[0]
        let totalPriceAll = 0
        if (_type == 1) {
            // 减
            if (thisItem.quantity == 0) {
                wx.showToast({
                    title: '不可以在减少了哟',
                    icon: 'none'
                })
            } else {
                thisItem.quantity--
                    HaveMealsLists.forEach(item => {
                        if (item.dishId == itemId) {
                            item.quantity = thisItem.quantity
                        }
                    })
                setTimeout(function() {
                    HaveMealsLists.forEach(item => {
                        if (item.category == assembleMode) {
                            totalPriceAll += item.bookPrice * item.quantity
                        }
                    })
                    that.setData({
                        totalPriceAll: totalPriceAll,
                        HaveMealsLists: HaveMealsLists
                    })
                }, 200)
            }
        } else {
            // 加
            thisItem.quantity++
                HaveMealsLists.forEach(item => {
                    if (item.dishId == itemId) {
                        item.quantity = thisItem.quantity
                    }
                })
            setTimeout(function() {
                HaveMealsLists.forEach(item => {
                    if (item.category == assembleMode) {
                        totalPriceAll += item.bookPrice * item.quantity
                    }
                })
                that.setData({
                    totalPriceAll: totalPriceAll,
                    HaveMealsLists: HaveMealsLists
                })
            }, 200)
        }
    },

    /** 点击立即预约按钮. */
    waysOfPurchasingFn() {
        let that = this
        let totalPriceAll = that.data.totalPriceAll
        if (totalPriceAll == 0) {
            wx.showToast({
                title: '请选择商品',
                icon: 'none'
            })
            return false
        }
        let HaveMealsLists = that.data.HaveMealsLists
        let assembleMode = that.data.assembleMode
        let quantityAll = 0
        HaveMealsLists.forEach(item => {
            if (assembleMode == item.category) {
                quantityAll += item.quantity
            }
        })
        let arr = HaveMealsLists.filter(item => item.category == assembleMode)
        let totalPriceAllModal = that.data.totalPriceAllModal
        let deliveryMode = that.data.deliveryMode // 1自取，2 配送
        let maxDeliveryFee = that.data.maxDeliveryFee // 配送最大
        let deliveryFee = that.data.deliveryFee // 基础配送费
        let increaseFee = that.data.increaseFee // 多一份增加配送费
        let modalPriceAll = deliveryFee + (quantityAll - 1) * increaseFee
        if (modalPriceAll > maxDeliveryFee) {
            modalPriceAll = maxDeliveryFee
        }
        if (deliveryMode == 2) {
            totalPriceAllModal = totalPriceAll + modalPriceAll
        } else {
            totalPriceAllModal = totalPriceAll
        }
        this.setData({
            totalPriceAllModal: totalPriceAllModal,
            modalPriceAll: modalPriceAll,
            modalFoodArr: arr,
            quantityAll: quantityAll,
            showSpellList: true
        })
    },

    /** 关闭立即预约弹框. */
    onCloseSpellList() {
        this.setData({
            showSpellList: false
        })
    },

    /** 选择配送或自取时间显示弹出. */
    selectedAssembleFn(e) {
        this.setData({
            showTime: true
        })
    },

    /** 确认选择的时间并隐藏弹窗. */
    confirmSelectedTimeFn(e) {
        let that = this
        let time = e.detail.value
        that.setData({
            selectedTime: time[0] + ':' + time[1],
            showTime: false
        })
    },

    /** 选择用餐方式. */
    selectedFn(e) {
        let that = this
        let type = e.currentTarget.dataset.type
        let totalPriceAll = that.data.totalPriceAll
        let modalPriceAll = that.data.modalPriceAll
        if (type == 1) {
            this.setData({
                totalPriceAllModal: totalPriceAll
            })
        } else {
            this.setData({
                totalPriceAllModal: (modalPriceAll + totalPriceAll)
            })
        }
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
            showTime: false,
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
                    systemInfo: res.data,
                    maxDeliveryFee: res.data.maxDeliveryFee, // 配送最大
                    deliveryFee: res.data.deliveryFee, // 基础配送费
                    increaseFee: res.data.increaseFee // 多一份增加配送费
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

    /** 点击确认预约按钮. */
    goPayIndentFn() {
        let that = this
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let bookTime = that.data.bookTime // 用餐日期
        let selectedTime = that.data.selectedTime // 用餐时间
        let addressItem = that.data.addressItem // 选择的地址
        let messageText = that.data.messageText // 留言信息
        let HaveMealsLists = that.data.HaveMealsLists //明日菜单列表
        let addressText = that.data.addressText // 选择的地址文字
        let assembleMode = that.data.assembleMode //1:早餐 2：午餐 3：晚餐
        let bookId = that.data.bookId // 传参ID
        let dishInfoArr = []
        let getDinnerTime = bookTime + 'T' + selectedTime + ':00'
        getDinnerTime = new Date(getDinnerTime)
        if (deliveryMode == '') {
            wx.showToast({
                title: '请选择用餐方式',
                icon: 'none'
            })
            return false
        }

        if (selectedTime == '') {
            wx.showToast({
                title: '请选择用餐时间',
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
        HaveMealsLists.forEach(item => {
            if (item.category == assembleMode) {
                dishInfoArr.push({
                    dishId: item.dishId,
                    quantity: item.quantity
                })
            }
        })
        let parm
        if (deliveryMode == 1) {
            parm = {
                dishInfoArr: JSON.stringify(dishInfoArr),
                category: 3,
                deliveryMode: deliveryMode,
                createUser: wx.getStorageSync('userInfo').id,
                message: messageText,
                name: '',
                phone: '',
                communityId: 0,
                communitySectionId: 0,
                communityBuildingId: 0,
                communityBuildingUnitId: 0,
                address: addressText,
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                dinnerCategory: assembleMode
            }
        } else {
            parm = {
                dishInfoArr: JSON.stringify(dishInfoArr),
                category: 3,
                deliveryMode: deliveryMode,
                createUser: wx.getStorageSync('userInfo').id,
                message: messageText,
                name: addressItem.name,
                phone: addressItem.phone,
                communityId: addressItem.communityId,
                communitySectionId: addressItem.communitySectionId,
                communityBuildingId: addressItem.communityBuildingId,
                communityBuildingUnitId: addressItem.communityBuildingUnitId,
                address: addressText,
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                dinnerCategory: assembleMode
            }
        }
        app.appRequest({
            url: '/app/orderInfo/saveBookOrderInfo.action',
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
                            payShow: false,
                            showSpellList: false,
                            showPaySuccessStatus: true
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

    /** 取消预约 */
    cancelBlanceFn() {
        let that = this
        let orderId = that.data.orderId
        app.appRequest({
            url: '/app/orderInfo/cancelOrderInfo.action',
            method: 'post',
            postData: {
                orderId: orderId
            },
            success(res) {
                wx.setStorageSync('balancePaySuccess', false)
                that.setData({
                    payShow: false,
                    showSpellList: false,
                    showPaySuccessStatus: false
                })
                if (res.code == 200) {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            }
        })
    },


    /** 返回首页. */
    backIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.switchTab({
            url: '/pages/index/index',
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
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            that.setData({
                payShow: false,
                showSpellList: false,
                showPaySuccessStatus: true
            })
        }
        that.getSysConfFn()
        that.getUserAddressFn()
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