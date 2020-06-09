// pages/make_an_appointment/make_an_appointment.js
var app = getApp()
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
        deliveryObj: {},
        isShowDate: false,
        showPaySuccessStatus: false, // 支付成功回显弹窗
        urlBefore: app.globalData.urlBefore,
        systemInfo: '', //系统配置信息
        showSpellList: false, //弹起拼单或单独购买弹框
        waysOfPurchasing: '', // 选择购买方式 1：单独购买 2：拼单购买
        assembleMode: '', //选择配送或自取时间 1：早餐 2：午餐 3：晚餐
        deliveryMode: 2, //选择用餐方式 1：自取 2：配送
        messageText: '', // 商家留言信息
        payShow: false, // 是否显示支付方式选择
        selectedId: '', // 选择支付方式 1：微信支付 2：余额支付
        showTime: false, //是否显示时间选择器
        bookTime: '', //明日日期
        haveMealAddresInfo: null,
        selectedTime: '', // 用餐时间
        totalPriceAll: 0, // 总价
        totalPriceAllModal: 0, //弹框总价计算，自取，配送
        bookId: 0, // 传参ID
        isVipShow: '', // 是否是VIP
        messageArr: [],
        selectedMessageArr: [],
        collocation: [],
        foodIngredient: [],
        garnishInfo: [],
        takeMealsAddressId: null,
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址
        columns: [],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this
        let type = options.type
        that.setData({
            deliveryObj: wx.getStorageSync('deliveryMode'),
            selectedDateValue: options.selectedDateValue,
            selectedWordId: options.selectedWordId,
            symptomId: options.symptomId,
            isThisDay: options.isThisDay,
            thisTime: options.thisTime
        })
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })
        /** 今日日期时间处理. */
        that.toDayTimeFn()
        // 食材+搭配商品
        that.getListFoodIngredientByBookTimeFn()
        // 推荐单点
        that.getListDishInfoByRecommendFn()
        // 获取商家定义留言信息
        that.getMessageDataFn()
        // 获取配菜信息
        that.getGarnishDataFn()
        // 获取基础米饭、服务费
        that.getJichuMiFanFn()


    },

    /** 跳转到取快递. */
    toDeliveryFn() {
        this.setData({
            isShowDate: true
        })
    },

    /** 今日日期时间处理. */
    toDayTimeFn() {
        let that = this
        let isThisDay = that.data.isThisDay
        let thisTime = that.data.thisTime
        let thisTimeArr = thisTime.split(":")
        let hours = thisTimeArr[0] * 1 + 1
        // 时索引
        let hoursIndex = 0
        // 分索引
        let miu = Math.floor((thisTimeArr[1] * 1 + 10) / 10);
        if (miu > 5) {
            miu = 0
            hours = hours + 1
        }
        let minValue = miu * 10
        h.forEach((item, _index) => {
            if (item == hours) hoursIndex = _index
        })
        that.setData({
            columns: [{
                    values: h,
                    className: 'column1',
                    defaultIndex: isThisDay == 'true' ? hoursIndex : 0
                },
                {
                    values: m,
                    className: 'column2',
                    defaultIndex: isThisDay == 'true' ? miu : 0
                },
                {
                    values: ['可预约'],
                    className: 'column3',
                    defaultIndex: 0
                }
            ],
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

    /** 跳转预约早餐. */
    toAppointmentTodayFn(e) {
        let that = this
        let selectedDateValue = that.data.selectedDateValue
        let ThisDateValue = new Date()
        let y = ThisDateValue.getFullYear()
        let m = ThisDateValue.getMonth() + 1
        let d = ThisDateValue.getDate()
        let h = ThisDateValue.getHours()
        let mm = ThisDateValue.getMinutes()
        let s = ThisDateValue.getSeconds()
        let ThisDateValueStr = y + '-' + that.isZeroFn(m) + '-' + that.isZeroFn(d)
        let ThisTimeValueStr = that.isZeroFn(h) + ':' + that.isZeroFn(mm) + ':' + that.isZeroFn(s)
        let isThisDay = new Date(selectedDateValue).getTime() - new Date(ThisDateValueStr).getTime()
        isThisDay = isThisDay == 0 ? true : false
        wx.navigateTo({
            url: '/pages/appointment_today/appointment_today?isToDay=false&selectedDate=' + this.data.selectedDateValue + '&category=1' + '&isThisDay=' + isThisDay + '&thisTime=' + ThisTimeValueStr,
        })
    },

    /** 判断数值是否小于10 */
    isZeroFn(str) {
        if (str < 10) str = '0' + str
        return str
    },

    /** 获取基础米饭、服务费 */
    getJichuMiFanFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/getJichuMiFan.action',
            method: 'get',
            success(res) {
                if (res.code == 200) {
                    if (res.data) {
                        res.data.name = res.data.name.split(',')
                        that.setData({
                            jiChuMiFanInfo: res.data
                        })
                        that.allPrcieCalculationFn()
                    }
                }
            }
        })
    },

    /** 获取配菜数据. */
    getGarnishDataFn() {
        let that = this
        app.appRequest({
            url: '/app/recommend/listBookVegetables.action',
            method: 'get',
            getParams: {
                bookTime: that.data.selectedDateValue,
                organsId: that.data.selectedWordId
            },
            success(res) {
                if (res.code == 200) {
                    if (res.data) {
                        res.data.forEach(item => item.checked = item.selected == 1 ? true : false)
                        that.setData({
                            garnishInfo: res.data
                        })
                        that.allPrcieCalculationFn()
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

    /** 点击选择配菜. */
    clickGarnishItemFn(e) {
        let that = this;
        let Item = e.currentTarget.dataset.item;
        let garnishInfo = that.data.garnishInfo;
        let newGarnishInfo = garnishInfo.filter(item => item.checked)
        if (!Item.checked && newGarnishInfo.length > 1) {
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

    /** 获取留言数据. */
    getMessageDataFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/listBookLabel.action',
            method: 'get',
            getParams: {
                bookTime: that.data.selectedDateValue
            },
            success(res) {
                wx.hideLoading()
                if (res.code == 200) {
                    if (res.data) {
                        res.data.forEach(item => {
                            item.checked = false
                        })
                        that.setData({
                            messageArr: res.data
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

    /** 点击选择留言信息. */
    selectedMessageFn(e) {
        let that = this
        let Item = e.currentTarget.dataset.item
        let messageArr = that.data.messageArr
        messageArr.forEach(item => {
            if (item.id == Item.id) item.checked = !item.checked
        })
        let newArr = messageArr.filter(item => item.checked)
        let strArr = []
        newArr.forEach(item => {
            strArr.push(item.name)
        })
        console.log(strArr)
        that.setData({
            messageArr: messageArr,
            selectedMessageArr: strArr
        })

    },

    /** 换一组. */
    anotherGroupFn() {
        let that = this

        wx.showLoading({
            title: '加载中',
        })
        app.appRequest({
            url: '/app/dishInfo/changeListFoodIngredientByBookTime.action',
            method: 'get',
            getParams: {
                bookTime: that.data.selectedDateValue
            },
            success(res) {
                wx.hideLoading()
                if (res.code == 200) {
                    if (res.data.foodIngredient) {
                        let foodIngredient = res.data.foodIngredient
                        that.setData({
                            foodIngredient: foodIngredient,
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

    /** 获取预约食材与菜品. */
    getListFoodIngredientByBookTimeFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/listFoodIngredientByBookTime.action',
            method: 'get',
            getParams: {
                bookTime: that.data.selectedDateValue,
                organsId: that.data.selectedWordId,
                symptomId: that.data.symptomId
                // bookTime: '2019-12-04',
                // organsId: 1
            },
            success(res) {
                if (res.code == 200) {
                    if (res.data.foodIngredient && res.data.dishInfo) {
                        let foodIngredient = res.data.foodIngredient
                        let collocation = res.data.dishInfo.details
                        collocation.forEach(item => {
                            item.quantity = 0
                            item.isRecommend = 0
                        })
                        that.setData({
                            foodIngredient: foodIngredient,
                            collocation: collocation,
                            bookId: res.data.dishInfo.id
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

    /** 获取推荐单点数据. */
    getListDishInfoByRecommendFn() {
        let that = this
        app.appRequest({
            url: '/app/dishInfo/listDishInfoByRecommend.action',
            method: 'get',
            success(res) {
                console.log(res)
                if (res.code == 200) {
                    let arr = res.data
                    arr.forEach(item => {
                        item.quantity = 0
                        item.dishId = item.id
                        item.isRecommend = 1
                    })
                    that.setData({
                        listDishInfoByRecommendArr: arr
                    })
                }
            }
        })
    },


    /** 数量加减. */
    addReduceFn(e) {
        // dp:搭配，dd:单点，1:减少，2:增加
        let that = this
        let status = e.currentTarget.dataset.status
        let type = e.currentTarget.dataset.type
        let Item = e.currentTarget.dataset.item
        let itemQuantity = Item.quantity
        // 搭配数据
        let collocation = that.data.collocation
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
            if (status == 'dp') {
                itemQuantity--
                collocation.forEach(item => {
                    if (Item.dishId == item.dishId) {
                        item.quantity = itemQuantity
                    }
                })

                that.setData({
                    collocation: collocation
                })
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

            if (status == 'dp') {
                itemQuantity++
                collocation.forEach(item => {
                    if (Item.dishId == item.dishId) {
                        console.log(item)
                        item.quantity = itemQuantity
                    }
                })

                that.setData({
                    collocation: collocation
                })
            }

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

    /** 价格计算. */
    allPrcieCalculationFn() {
        // 计算总价
        let that = this
        let garnishInfo = that.data.garnishInfo
        let collocation = that.data.collocation
        let jiChuMiFanInfo = that.data.jiChuMiFanInfo // 基础米饭、服务费
        let listDishInfoByRecommendArr = that.data.listDishInfoByRecommendArr
        let arrColl = collocation.length > 0 ? collocation.filter(item => item.quantity > 0) : []
        let arrRecom = listDishInfoByRecommendArr.length > 0 ? listDishInfoByRecommendArr.filter(item => item.quantity > 0) : []
        let newGarnishArr = garnishInfo.length > 0 ? garnishInfo.filter(item => item.checked) : []
        let totalPriceAll = 0
        if (newGarnishArr.length > 0 && jiChuMiFanInfo != null) totalPriceAll = jiChuMiFanInfo.price
        arrColl.forEach(item => {
            totalPriceAll += item.quantity * item.bookPrice
        })
        listDishInfoByRecommendArr.forEach(item => {
            totalPriceAll += item.quantity * item.bookPrice
        })
        newGarnishArr.forEach(item => {
            totalPriceAll += item.price
        })
        that.setData({
            totalPriceAll: totalPriceAll.toFixed(2)
        })
    },

    /** 点击立即预约按钮. */
    waysOfPurchasingFn() {
        let that = this
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

    /** 选择时间改变时. */
    onChangeSelectedTimeFn(e) {
        let that = this
        let {
            picker,
            value,
            index
        } = e.detail
        let selectedDateValue = that.data.selectedDateValue
        let newDate = selectedDateValue + ' ' + value[0] + ':' + value[1] + ':' + '00'
        let isThisDay = that.data.isThisDay
        let thisTime = that.data.thisTime
        let thisTimeArr = thisTime.split(":")
        let hours = thisTimeArr[0] * 1 + 1
        // 时索引
        let hoursIndex = 0
        // 分索引
        let miu = Math.floor((thisTimeArr[1] * 1 + 10) / 10);
        if (miu > 5) {
            miu = 0
            hours = hours + 1
        }
        let minValue = miu * 10
        h.forEach((item, _index) => {
            if (item == hours) hoursIndex = _index
        })
        if (isThisDay == 'true') {
            if (hours > value[0] || (hours == value[0] && minValue > value[1])) {
                picker.setColumnIndex(0, hoursIndex);
                picker.setColumnIndex(1, miu);
            }
        }
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
                    columnVal = ['未开放']
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

    /** 点击预约下单按钮. */
    goPayIndentFn() {
        let that = this
        let deliveryMode = that.data.deliveryMode // 用餐方式
        let bookTime = that.data.selectedDateValue // 用餐日期
        let selectedTime = that.data.selectedTime // 用餐时间
        let addressItem = that.data.haveMealAddresInfo // 选择的地址
        let messageText = that.data.messageText // 留言信息
        let assembleMode = that.data.assembleMode //1:早餐 2：午餐 3：晚餐
        let bookId = that.data.bookId // 传参ID
        let selectedMessageArr = that.data.selectedMessageArr
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let listDishInfoByRecommendArr = that.data.listDishInfoByRecommendArr // 推荐单点
        let collocation = that.data.collocation // 搭配口味
        let foodIngredient = that.data.garnishInfo //食材
        let jiChuMiFanInfo = that.data.jiChuMiFanInfo // 基础米饭、服务费
        let HaveMealsLists = []
        let arr1 = listDishInfoByRecommendArr.filter(item => item.quantity > 0)
        let arr2 = collocation.filter(item => item.quantity > 0)
        let arr3 = []
        foodIngredient.forEach(item => {
            if (item.checked) arr3.push(item.ingredientId)
        })
        HaveMealsLists = HaveMealsLists.concat(arr1).concat(arr2)
        // 默认先添加基础米饭和服务费
        let dishInfoArr = []
        if (arr3.length > 0) {
            dishInfoArr.push({
                dishId: jiChuMiFanInfo.id,
                quantity: 1,
                isRecommend: 1,
                ingredientId: arr3.join()
            })
        }
        let getDinnerTimeStr = ''
        getDinnerTimeStr = bookTime + ' ' + selectedTime + ':00'
        let getDinnerTime = bookTime + 'T' + selectedTime + ':00'

        getDinnerTime = new Date(getDinnerTime)

        if (HaveMealsLists.length == 0 && dishInfoArr.length == 0) {
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
                isRecommend: item.isRecommend,
                ingredientId: item.isRecommend == 0 ? arr3.join() : ''
            })
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
                address: '',
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                getDinnerTimeStr: getDinnerTimeStr,
                dinnerCategory: 2,
                locationId: !takeMealsAddressId ? 0 : takeMealsAddressId,
                bookLabel: selectedMessageArr.join()
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
                address: addressItem.address + addressItem.doorplate,
                bookId: bookId,
                getDinnerTime: getDinnerTime,
                getDinnerTimeStr: getDinnerTimeStr,
                dinnerCategory: 2,
                locationId: !takeMealsAddressId ? 0 : takeMealsAddressId,
                bookLabel: selectedMessageArr.join()

            }
        }

        this.setData({
            parm: parm,
            payShow: true
        })



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
        that.getSysConfFn()
        console.log(that.data.haveMealAddresInfo)
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