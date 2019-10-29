// pages/my/my.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        roleId: 0,
        userInfo: null,
        groupLeaderType: '', // 1:组员
        elementArr1: [{
                name1: "热量",
                percentage: '0%',
                value: '0',
                unit: '千卡'
            },
            {
                name1: "蛋白质",
                percentage: '0%',
                value: '0',
                unit: 'g'
            },
            {
                name1: "碳水化合物",
                percentage: '0%',
                value: '0',
                unit: 'g'
            },
            {
                name1: "脂肪",
                percentage: '0%',
                value: '0',
                unit: 'g'
            },
            {
                name1: "膳食纤维",
                percentage: '0%',
                value: '0',
                unit: 'g'
            }
        ],
        elementArr2: [{
                name1: "A",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "B1",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "B2",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "B6",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "C",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "生物素",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "胡萝卜素",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "叶酸",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "泛酸",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "烟酸",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            }
        ],
        elementArr3: [{
                name1: "钙",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "铁",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "磷",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "钾",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "钠",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "镁",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "锌",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "硒",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            },
            {
                name1: "铜",
                percentage: '0%',
                value: '0',
                unit: 'mg'
            }
        ],
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            userInfo: wx.getStorageSync('userInfo')
        })
    },
    
    /** 点击登录按钮去登录. */
    toLoginFn(){
        wx.redirectTo({
            url: '/pages/start/start?isLogin=true',
        })
    },

    /** 获取普通用户微量元素计算. */
    getUserFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/getUserNutrient.action',
            method: 'get',
            getParams: {
                userId: wx.getStorageSync('userInfo').id
            },
            success(res) {
                if (res.data.length > 0) {
                    let objAll = res.data[0]
                    let objAllArr = Object.keys(objAll)
                    let objAllArrNum = objAllArr.slice(1,objAllArr.length)
                    let elementArr1 = that.data.elementArr1
                    let elementArr2 = that.data.elementArr2
                    let elementArr3 = that.data.elementArr3
                    let maxValue1 = [],maxValue2 = [],maxValue3 = []
                    elementArr1.forEach((item, index)=>{
                        item.value = objAll[objAllArrNum[index]]
                    })
                    elementArr2.forEach((item, index) => {
                        item.value = objAll[objAllArrNum[elementArr1.length + index]]
                    })
                    elementArr3.forEach((item, index) => {
                        item.value = objAll[objAllArrNum[elementArr1.length + elementArr2.length + index]]
                    })
                    elementArr1.forEach(item=>{
                        maxValue1.push(item.value)
                    })
                    elementArr2.forEach(item => {
                        maxValue2.push(item.value)
                    })
                    elementArr3.forEach(item => {
                        maxValue3.push(item.value)
                    })
                    maxValue1.sort()
                    maxValue2.sort()
                    maxValue3.sort()

                    elementArr1.forEach(item => {
                        item.percentage = parseInt(item.value / maxValue1[maxValue1.length - 1] * 100) + '%'
                    })
                    elementArr2.forEach(item => {
                        item.percentage = parseInt(item.value / maxValue2[maxValue2.length - 1] * 100) + '%'
                    })
                    elementArr3.forEach(item => {
                        item.percentage = parseInt(item.value / maxValue3[maxValue3.length - 1] * 100) + '%'
                    })
                    that.setData({
                        elementArr1: elementArr1,
                        elementArr2: elementArr2,
                        elementArr3: elementArr3
                    })

                }
            }
        })


    },

    /** 普通用户页面跳转. */
    toPageFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let userInfo = wx.getStorageSync("userInfo")
        if (!userInfo) {
            wx.redirectTo({
                url: '/pages/start/start?isLogin=true',
            })
            return false
        }
        if (_type == 1) {
            // 历史记录
            wx.navigateTo({
                url: '/pages/history/history',
            })
        } else if (_type == 2) {
            // 身份认证
            wx.navigateTo({
                url: '/pages/identity_authentication/identity_authentication',
            })
        } else if (_type == 3) {
            // 我的地址
            wx.navigateTo({
                url: '/pages/my_address/my_address',
            })
        } else if (_type == 4) {
            // 会员充值
            wx.navigateTo({
                url: '/pages/recharge/recharge',
            })
        }else if (_type == 5) {
            // 收支明细
            wx.navigateTo({
                url: '/pages/budget_ detailed/budget_ detailed',
            })
        } else if (_type == 6){
            // 预约入口
            wx.redirectTo({
                url: '/pages/start/start?paySuccessType=true',
            })
        }
    },

    /** 配送员页面跳转. */
    toDeliveryFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        let groupLeaderType = wx.getStorageSync("userInfo").headMan
        if (_type == 1 || _type == 2) {
            // 团队订单
            wx.navigateTo({
                url: '/pages/delinvery_indent/delinvery_indent?groupLeaderType=' + groupLeaderType + "&type=" + _type,
            })
        } else {
            // 个人信息
            wx.navigateTo({
                url: '/pages/personal_information/personal_information',
            })
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

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
                    roleId: userInfo.roleId,
                    userInfo: userInfo,
                    groupLeaderType: userInfo.headMan
                })
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        this.getUserFn()
        this.getUserInfoFn()
        let roleId = wx.getStorageSync('userInfo').roleId
        let groupLeaderType = wx.getStorageSync('userInfo').headMan
        let userInfo = wx.getStorageSync('userInfo')
        this.setData({
            roleId: roleId,
            userInfo: userInfo,
            groupLeaderType: groupLeaderType
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