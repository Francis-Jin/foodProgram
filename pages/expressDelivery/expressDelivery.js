// pages/expressDelivery/expressDelivery.js
var app = getApp()
let h = []
for (let i = 0; i <= 23; i++) {
    if (i < 10) {
        i = '0' + i
    }
    i = i + ''
    h.push(i)
}

// let m = ['00', '10', '20', '30', '40', '50']
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
        tapStauts: 0, // 0:默认，1：输入文本，2：图片信息
        selectedDateValue: '2020-03-05',
        selectedTime: '', // 配送时间
        showTime: false, //是否显示时间选择器
        haveMealAddresInfo: null,
        takeMealsAddressId: null,
        deliveryMode: '', // 配送方式
        takeMealsAddress: '选择取餐地址', //选择回来的取餐地址
        columns: [],
        payShow: false,
        expressInfo: "", // 输入的快递信息
        photo: '', // 上传的快递图片
        photoFile: '',
        isVipShow: '', // 是否是VIP
        systemInfo: '', // 系统配置信息
        selectedId: 1, // 选择支付方式 1：微信支付 2：余额支付
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        let addressItem = wx.getStorageSync('addressItem')
        let takeMealsAddressItem = wx.getStorageSync('takeMealsAddressItem')
        this.setData({
            selectedDateValue: options.date,
            haveMealAddresInfo: addressItem,
            takeMealsAddressId: takeMealsAddressItem.id, //选择回来的取餐地址ID
            takeMealsAddress: takeMealsAddressItem.address, //选择回来的取餐地址
        })
        /** 今日日期时间处理. */
        this.toDayTimeFn()
        this.getSysConfFn()
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

    /** 今日日期时间处理. */
    toDayTimeFn() {
        let that = this
        that.setData({
            columns: [{
                values: h,
                className: 'column1',
                defaultIndex: 0
            },
            {
                values: m,
                className: 'column2',
                defaultIndex: 0
            }
            ]
        })
    },

    /** 点击切换模式 */
    clickTapStatus(){
        let that = this
        that.setData({
            tapStauts: 2
        })
    },

    // 输入选择
    textareaInputFn(e){
        this.setData({
            expressInfo: e.detail.value
        })
    },

    /** 选择用餐方式. */
    selectedFn(e) {
        let that = this
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

    /** 确认选择的时间并隐藏弹窗. */
    confirmSelectedTimeFn(e) {
        console.log(e)
        let that = this
        let value = e.detail.value
        let index = e.detail.index
        let selectedTime = value[0]+ ':' + value[1]
        // if (selectedTime) {
            that.setData({
                selectedTime: selectedTime,
                showTime: false
            })
        // } else {
        //     wx.showToast({
        //         title: '请重新选择',
        //         icon: 'none'
        //     })
        // }
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
        that.setData({
            selectedTime: value[0] + ':' + value[1]
        })
        // picker.setColumnIndex(0, hoursIndex);
        // picker.setColumnIndex(1, miu);
    },

    // 点击上传图片按钮
    uploadImageBtnFn(){
        let that = this
        wx.chooseImage({
            count: 1,
            success: function(res) {
                console.log(res)
                let file = res.tempFilePaths[0]
                that.setData({
                    tapStauts: 2,
                    photoFile: file
                })
                wx.showLoading({
                    title: '图片上传中',
                    mask: true
                })
                wx.uploadFile({
                    url: app.globalData.baseApi + '/app/takeExpressDelivery/uploadFile.action',
                    filePath: file,
                    name: 'file',
                    formData: {
                        "folder": '/take_express_delivery/'
                    },
                    success: function(res) {
                        console.log(res.data)
                        res.data = JSON.parse(res.data)
                        console.log(res.data)
                        wx.hideLoading()
                        if(res.data.code == 200){
                            wx.showToast({
                                title: '上传成功'
                            })
                            that.setData({
                                photo: res.data.data
                            })
                        }else{
                            wx.showToast({
                                title: '上传失败',
                                icon: 'none'
                            })
                        }
                    },
                    fail:function(error){
                        wx.hideLoading()
                        wx.showToast({
                            title: '上传失败',
                            icon: 'none'
                        })
                    }
                })
                
            }
        })
    },

    // 提交订单支付
    goPayIndentFn(){
        let that = this
        let expressInfo = that.data.expressInfo
        let photo = that.data.photo
        let deliveryMode = that.data.deliveryMode // 配送方式
        let bookTime = that.data.selectedDateValue // 用餐日期
        let selectedTime = that.data.selectedTime // 用餐时间
        let addressItem = that.data.haveMealAddresInfo // 选择的地址
        let takeMealsAddressId = that.data.takeMealsAddressId // 取餐地址Id
        let expectDeliveryTime = bookTime + ' ' + selectedTime + ':' + '00'
        console.log(expectDeliveryTime)
        if(expressInfo == '' && photo == ''){
            wx.showToast({
                title: '请输入或粘贴或上传快递信息',
                icon: 'none'
            })
            return false
        }

        if (selectedTime == '') {
            wx.showToast({
                title: '请选择送达时间',
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
        let parm = {
            expressInfo: expressInfo,
            photo: photo,
            expectDeliveryTime: expectDeliveryTime, // 选择的时间
            deliveryMode: deliveryMode,
            locationId: deliveryMode == 1 ? takeMealsAddressId : 0,
            name: deliveryMode == 1 ? '' : addressItem.name,
            phone: deliveryMode == 1 ? '' :addressItem.phone,
            communityId: deliveryMode == 1 ? 0 :addressItem.communityId,
            communitySectionId: deliveryMode == 1 ? 0 :addressItem.communitySectionId,
            communityBuildingId: deliveryMode == 1 ? 0 :addressItem.communityBuildingId,
            communityBuildingUnitId: deliveryMode == 1 ? 0 :addressItem.communityBuildingUnitId,
            address: deliveryMode == 1 ? '' :addressItem.address + addressItem.doorplate,
            createUser: wx.getStorageSync('userInfo').id
        }
        console.log(parm)
        this.setData({
            parm: parm,
            payShow: true
        })
    },

    /** 取消支付. */
    onPayClose() {
        this.setData({
            payShow: false
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

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
            url: '/app/takeExpressDelivery/saveExpressOrder.action',
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
            url: "/app/orderInfo/savePayFeeExpress.action",
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
                                    url: '/pages/oneYuanOrder/oneYuanOrder',
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let that = this
        let balancePaySuccess = wx.getStorageSync('balancePaySuccess')
        if (balancePaySuccess) {
            that.setData({
                payShow: false,
                showSpellList: false,
                makeAppointmentShow: true
            })
        }
        that.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
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