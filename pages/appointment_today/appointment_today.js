// pages/appointment_today/appointment_today.js
var app = getApp();

let h = []
for (let i = 6; i <= 21; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    h.push(i)
}

let m = ['00', '10', '20', '30', '40', '50']

Page({

    /**
     * 页面的初始数据
     */
    data: {
        isToDay: null,
        lists: [],
        urlBefore: app.globalData.urlBefore,
        messageText: '', // 留言信息
        totalPriceAll: 0, // 购买总价
        payShow: false, // 是否显示支付弹窗
        deliveryMode: 2, //选择用餐方式 1：自取 2：配送
        bookId: 0,
        haveMealAddresInfo: null, // 用餐地址
        takeMealsAddressId: null,
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址
        selectedTime: '', // 用餐时间
        columns: [{
                values: h,
                className: 'column1',
                defaultIndex: 0
            },
            {
                values: m,
                className: 'column2',
                defaultIndex: 3
            },
            {
                values: ['可预约'],
                className: 'column3',
                defaultIndex: 0
            }
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        let that = this
        let isToday = options.isToDay
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })
        that.setData({
            selectedDateValue: options.selectedDate,
            category: options.category,
            isToDay: isToday == 'true' ? true : false
        })
        if (isToday == 'true') {
            wx.setNavigationBarTitle({
                title: '预约今日菜品',
            })
        } else {
            wx.setNavigationBarTitle({
                title: '预约早餐',
            })
        }
        that.getDataFn()
    },

    /** 跳转支付成功后的广告详情. */
    toAdvertisementDetailsFn() {
        let advertisingInfo = this.data.advertisingInfo
        wx.navigateTo({
            url: '/pages/advertisement_details/advertisement_details?itemId=' + advertisingInfo.id,
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

    /** 获取菜品数据. */
    getDataFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/getBookDishInfoByCategory.action',
            method: 'get',
            getParams: {
                bookTime: that.data.selectedDateValue,
                category: that.data.category
            },
            success(res) {
                if (res.code == 200) {
                    let lists = res.data.details
                    lists.forEach(item => {
                        item.quantity = 0
                    })
                    that.setData({
                        lists: lists,
                        bookId: res.data.id
                    })
                }
            }
        })
    },

    /** 数量加减. */
    addReduceFn(e) {
        console.log(e)
        // dp:搭配，dd:单点，1:减少，2:增加
        let that = this
        let type = e.currentTarget.dataset.type
        let Item = e.currentTarget.dataset.item
        let itemQuantity = Item.quantity
        // 搭配数据
        let lists = that.data.lists
        // 减少
        if (type == 1) {
            if (itemQuantity == 0) {
                wx.showToast({
                    title: '不可减少了哟',
                    icon: 'none'
                })
                return false
            }
            itemQuantity--
            lists.forEach(item => {
                if (Item.dishId == item.dishId) {
                    item.quantity = itemQuantity
                }
            })

            that.setData({
                lists: lists
            })
        }

        // 增加
        if (type == 2) {

            itemQuantity++
            lists.forEach(item => {
                if (Item.dishId == item.dishId) {
                    item.quantity = itemQuantity
                }
            })

            that.setData({
                lists: lists
            })
        }

        // 计算总价
        lists = that.data.lists
        let arrLists = lists.filter(item => item.quantity > 0)
        let totalPriceAll = 0
        arrLists.forEach(item => {
            totalPriceAll += item.quantity * item.bookPrice
        })
        that.setData({
            totalPriceAll: totalPriceAll.toFixed(2)
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


    /** 点击预约下单按钮. */
    goPayIndentFn() {
        let that = this
        let messageText = that.data.messageText // 留言
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let addressItem = that.data.haveMealAddresInfo // 选择的地址
        let lists = that.data.lists
        let bookId = that.data.bookId // 传参ID
        let bookTime = that.data.selectedDateValue // 用餐日期
        let selectedTime = that.data.selectedTime // 用餐时间
        let HaveMealsLists = lists.filter(item => item.quantity > 0)
        let dishInfoArr = []
        let getDinnerTimeStr = ''
        getDinnerTimeStr = bookTime + ' ' + selectedTime + ':00'
        let getDinnerTime = bookTime + 'T' + selectedTime + ':00'

        getDinnerTime = new Date(getDinnerTime)

        if (HaveMealsLists.length == 0) {
            wx.showToast({
                title: '请添加商品',
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

        if (deliveryMode == '') {
            wx.showToast({
                title: '请选择配送方式',
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

        HaveMealsLists.forEach(item => {
            dishInfoArr.push({
                dishId: item.dishId,
                quantity: item.quantity,
                isRecommend: 0,
                ingredientId: ''
            })
        })

        let parm
        if (deliveryMode == 1) {
            parm = {
                dishInfoArr: JSON.stringify(dishInfoArr),
                ingredientIds: 0,
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
                address: '',
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                getDinnerTimeStr: getDinnerTimeStr,
                dinnerCategory: 1,
                locationId: !takeMealsAddressId ? 0 : takeMealsAddressId
            }
        } else {
            parm = {
                dishInfoArr: JSON.stringify(dishInfoArr),
                ingredientIds: 0,
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
                address: addressItem.address + addressItem.doorplate,
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                getDinnerTimeStr: getDinnerTimeStr,
                dinnerCategory: 1,
                locationId: !takeMealsAddressId ? 0 : takeMealsAddressId
            }
        }

        that.setData({
            parm: parm,
            payShow: true
        })

    },

    /** 选择时间改变时. */
    onChangeSelectedTimeFn(e) {
        console.log(e)
        let that = this
        let {
            picker,
            value,
            index
        } = e.detail
        let selectedDateValue = that.data.selectedDateValue
        let newDate = selectedDateValue + ' ' + value[0] + ':' + value[1] + ':' + '00'
        app.appRequest({
            url: '/app/sysConf/getDeliveryTimeStatus.action',
            method: 'get',
            getParams: {
                deliveryTime: newDate
            },
            success(res) {
                let columnVal = []
                if (res.message == '该时段可选') {
                    columnVal = ['可预约']
                    that.setData({
                        selectedTime: value[0] + ':' + value[1]
                    })
                } else {
                    columnVal = ['该时段已约满']
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                    that.setData({
                        selectedTime: ''
                    })
                }

                picker.setColumnValues(2, columnVal);
            }
        })
    },

    /** 确认选择的时间并隐藏弹窗. */
    confirmSelectedTimeFn(e) {
        let that = this
        let selectedTime = that.data.selectedTime
        if (selectedTime) {
            that.setData({
                showTime: false
            })
        } else {
            wx.showToast({
                title: '请重新选择',
                icon: 'none'
            })
        }
    },

    /** 选择配送或自取时间显示弹出. */
    selectedAssembleFn(e) {
        this.setData({
            showTime: true
        })
    },

    /** 取消时间选择. */
    onCloseAddressFn() {
        this.setData({
            showTime: false
        })
    },

    /** 取消支付. */
    onPayClose() {
        this.setData({
            payShow: false
        })
    },

    /** 支付方式选择. */
    selectedPayFn(e) {
        let type = e.currentTarget.dataset.type
        this.setData({
            selectedId: type
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

    /** 点击支付方式弹框确认按钮. */
    confirmAppointFn() {
        let that = this
        that.saveOrderFn()
    },

    /** 确认生成订单. */
    saveOrderFn() {
        let that = this
        let selectedId = that.data.selectedId
        let totalPriceAll = that.data.totalPriceAll
        let userInfo = wx.getStorageSync('userInfo')
        let vipBalance = userInfo.balance ? userInfo.balance : 0
        wx.showLoading({
            title: '加载中',
        })
        app.appRequest({
            url: '/app/orderInfo/saveBookOrderInfo.action',
            method: 'post',
            postData: that.data.parm,
            success(res) {
                wx.hideLoading()
                if (res.code == 200) {
                    let orderId = res.message
                    that.setData({
                        orderId: orderId
                    })
                    if (selectedId == 1) {
                        that.wxPayFn()
                        that.setData({
                            payShow: false
                        })
                    } else {
                        if (userInfo.vip == 0) {
                            that.setData({
                                isVipShow: true
                            })
                        } else {

                            if (vipBalance > totalPriceAll) {
                                wx.navigateTo({
                                    url: '/pages/inputPassword/inputPassword?orderId=' + orderId,
                                })
                            } else {
                                // 会员充值
                                wx.navigateTo({
                                    url: '/pages/recharge/recharge',
                                })
                            }

                            that.setData({
                                payShow: false
                            })

                        }
                    }
                } else {
                    wx.showToast({
                        title: res.message,
                        icon: 'none'
                    })
                }
            },
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
                        that.GetAdvertisingFn()
                        that.setData({
                            payShow: false,
                            showSpellList: false,
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

    /** 点击返回首页按钮. */
    toBackIndexFn() {
        wx.setStorageSync('balancePaySuccess', false)
        wx.redirectTo({
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
                makeAppointmentShow: true
            })
            that.GetAdvertisingFn()
        }
        that.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
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