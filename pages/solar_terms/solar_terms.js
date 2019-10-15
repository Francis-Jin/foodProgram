// pages/solar_terms/solar_terms.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        modalShow:true,
        array:[],
        urlBefore: app.globalData.urlBefore,
        dietOrientationLists: null,
        modalTitle: '您的膳食方向',
        directionValue: '',
        directionId: '',
        thisDate: '',
    },

    /** 获取节气 */
    getSolarTermFn(){
        let that = this
        app.appRequest({
            url: '/app/recommend/getSolarTerm.action',
            method: 'GET',
            success(res){
                that.setData({
                    solarTermInfo: res.data
                })
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
                let lists = []
                res.data.forEach(item => {
                    lists.push(item.name)
                })
                if (wx.getStorageSync("userInfo").dietOrientation != 0){
                    let directionValue = res.data.filter(item => item.code == wx.getStorageSync("userInfo").dietOrientation)[0].name
                    that.setData({
                        directionValue: directionValue 
                    })
                }
                that.setData({
                    array: lists,
                    dietOrientationLists: res.data
                })
            }
        })
    },

    /** 更新膳食方向. */
    bindPickerChange: function (e) {
        let that = this
        this.setData({
            directionValue: this.data.array[e.detail.value]
        })
        let directionCode = that.data.dietOrientationLists.filter(item => item.name == that.data.directionValue)[0].code
        app.appRequest({
            url: '/app/userInfo/updateUserDietOrientation.action',
            method: 'post',
            getParams:{
                dietOrientation: directionCode,
                unionId: wx.getStorageSync("userInfo").unionId 
            },
            success(res){
                console.log(res)
            }
        })
    },

    /** 获取当前日期，时间 */
    getDateFn(){
        var date = new Date();
        var seperator1 = "-";
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        var myddy = date.getDay();//获取存储当前日期
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
    nextFn(){
        wx.redirectTo({
            url: '/pages/start/start?index=true',
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onLoad: function () {
        this.getDateFn()
        this.getDietOrientationFn()
        this.getSolarTermFn()
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