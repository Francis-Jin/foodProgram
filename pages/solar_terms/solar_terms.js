// pages/solar_terms/solar_terms.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalShow: true,
        urlBefore: app.globalData.urlBefore,
        thisDate: '',
        modalTitle: '您的膳食方向',
        directionValue: '',
        show: false,
        columns: [],
        otherShow: false, //选择其他时弹框
        otherValue: '', // 选择其他输入的关键字
        selectedCode: '',
        guideMongoliaShowStatus: false, //是否显示引导蒙层
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onLoad: function(options) {
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
        let paySuccessType = options.paySuccessType
        let newUser = wx.getStorageSync('userInfo').newUser
        if (newUser == 1) {
            this.setData({
                guideMongoliaShowStatus: true
            })
        }
        this.setData({
            paySuccessType: paySuccessType
        })
        this.getDateFn()
        this.getDietOrientationFn()
        this.getSolarTermFn()
    },

    /** 关闭引导蒙层. */
    closeGuideMongoliaFn(){
        this.setData({
            guideMongoliaShowStatus: false
        })
    },

    /** 获取节气 */
    getSolarTermFn() {
        let that = this
        app.appRequest({
            url: '/app/recommend/getSolarTerm.action',
            method: 'GET',
            success(res) {
                that.setData({
                    solarTermInfo: res.data
                })
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
                wx.setStorageSync('userInfo', res.data)
            }
        })
    },

    /** 获取膳食方向. */
    getDietOrientationFn() {
        let that = this
        app.appRequest({
            url: "/app/sysConf/getDietOrientation.action",
            method: 'get',
            success(res) {
                let lists = res.data
                res.data.forEach(item => {
                    item.checked = false
                })
                if (wx.getStorageSync("userInfo").userDietOrientation) {
                    let value = []
                    let selectedCode = []
                    wx.getStorageSync("userInfo").userDietOrientation.forEach(item => {
                        value.push(item.dietOrientationName)
                        selectedCode.push(item.dietOrientationId)
                    })
                    selectedCode.sort()
                    that.setData({
                        directionValue: value,
                        selectedCode: selectedCode.join()
                    })
                    wx.setStorageSync('selectedCode', selectedCode.join())
                }
                that.setData({
                    columns: lists
                })
            }
        })
    },

    /** 选择膳食方向. */
    selectedFn(e) {
        let that = this
        let code = e.currentTarget.dataset.code
        let columns = that.data.columns
        let len = columns.filter(item => item.checked == true).length
        let directionValue = that.data.directionValue
        if (code == 2) {
            columns.forEach(item => {
                if (item.code == code) {
                    directionValue = item.name
                }
            })
            that.setData({
                directionValue: directionValue,
                selectedCode: code,
                otherShow: true
            })
            return false
        }
        columns.forEach(item => {
            if (item.code == code) {
                if (item.checked) {
                    item.checked = false
                } else {
                    if (len != 2) {
                        item.checked = true
                    } else {
                        wx.showToast({
                            title: '最多选择两个哦!',
                            icon: 'none'
                        })
                    }
                }
            }
        })
        that.setData({
            columns: columns
        })
    },

    /** 获取输入其他关键字. */
    reportInputFn(e) {
        this.setData({
            otherValue: e.detail.value
        })
    },

    /** 输入其他关键字确认. */
    confirmAppointFn() {
        let that = this
        app.appRequest({
            url: '/app/userInfo/saveSearchKeyword.action',
            method: 'post',
            postData: {
                userId: wx.getStorageSync("userInfo").id,
                keyword: that.data.otherValue
            },
            success(res) {
                if (res.code == 200) {
                    app.appRequest({
                        url: '/app/userInfo/updateUserDietOrientation.action',
                        method: 'post',
                        getParams: {
                            dietOrientation: that.data.selectedCode,
                            unionId: wx.getStorageSync("userInfo").unionId
                        },
                        success(res) {
                            if (res.code == 200) {
                                that.setData({
                                    otherShow: false,
                                    show: false,
                                    directionValue: that.data.directionValue,
                                })
                                that.getUserInfoFn()
                                wx.setStorageSync('selectedCode', that.data.selectedCode)
                            }
                        }
                    })
                }
            }
        })
    },

    /** 确定选择选择膳食方向并更新膳食方向. */
    onConfirm() {
        let that = this
        let columns = that.data.columns
        let arr = columns.filter(item => item.checked == true)
        let str = []
        let directionValueArr = []
        arr.forEach(item => {
            str.push(item.code)
            directionValueArr.push(item.name)
        })
        str.sort()
        app.appRequest({
            url: '/app/userInfo/updateUserDietOrientation.action',
            method: 'post',
            getParams: {
                dietOrientation: str.join(),
                unionId: wx.getStorageSync("userInfo").unionId
            },
            success(res) {
                that.setData({
                    show: false,
                    directionValue: directionValueArr,
                })
                that.getUserInfoFn()
                wx.setStorageSync('selectedCode', str.join())
            }
        })
    },

    /** 显示选择膳食方向. */
    showDirectionFn() {
        this.setData({
            show: true
        })
    },

    /** 隐藏选择膳食方向 */
    onClose() {
        this.setData({
            show: false
        })
    },


    /** 获取当前日期，时间 */
    getDateFn() {
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        var myddy = date.getDay(); //获取存储当前日期
        var weekday = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = year + ' 年 ' + month + ' 月 ' + strDate + ' 日 '
        this.setData({
            thisDate: currentdate,
            weekDay: weekday[myddy],
        })
    },


    /** 点击下一步跳转页面. */
    nextFn() {
        let selectedCode = this.data.selectedCode
        let paySuccessType = this.data.paySuccessType
        if (paySuccessType == 'true'){
            wx.redirectTo({
                url: '/pages/booking_method/booking_method'
            })
        }else{
            wx.redirectTo({
                url: '/pages/start/start?index=true&selectedCode=' + selectedCode
            })
        }
        
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