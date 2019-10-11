//index.js

const app = getApp()
var timer = null
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hourDeg: 0,
        minuteDeg: 0,
        secondDeg: 0,
        urlBefore: app.globalData.urlBefore,
        listsLeft: [],
        listsRight: [],
        page: 1, //默认从第一页开始
        pageSize: 10, //每页获取数量
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.clockFn()
        timer = setInterval(this.clockFn, 1000);
        this.getDataLists()
    },

    /** 时钟 */
    clockFn() {
        let that = this;
        //(b-1)拿到时间对象
        var oDate = new Date();
        //(b-2)拿到此时的时间
        var iSec = oDate.getSeconds();
        var iMin = oDate.getMinutes() + iSec / 60;
        var iHour = oDate.getHours() + iMin / 60;
        that.setData({
            hourDeg: iHour * 30,
            minuteDeg: iMin * 6,
            secondDeg: iSec * 6
        })
    },

    /** 页面跳转. */
    topPageDetails(e) {
        console.log(e)
        let _type = e.currentTarget.dataset.type
        let _itemId = e.currentTarget.dataset.itemid
        console.log(_type)
        if (_type === '1') {
            wx.navigateTo({
                url: '/pages/cook_details/cook_details?itemId=' + _itemId,
            })
        } else if (_type === '2') {
            wx.navigateTo({
                url: '/pages/food_details/food_details?itemId=' + _itemId,
            })
        } else if (_type === '3') {
            wx.navigateTo({
                url: '/pages/food_details/food_details?itemId=' + _itemId,
            })
        } else if (_type === '4') {
            wx.navigateTo({
                url: '/pages/food_details/food_details?itemId=' + _itemId,
            })
        }
    },

    /** 获取数据列表 */
    getDataLists() {
        let that = this
        app.appRequest({
            url: "/app/recommend/list.action",
            method: "get",
            getParams: {
                page: that.data.page,
                rows: that.data.pageSize
            },
            success(res) {
                console.log(res)
                let listsLeft = res.data.filter((item, index) => (index + 1) % 2 == 1)
                let listsRight = res.data.filter((item, index) => (index + 1) % 2 == 0)
                that.setData({
                    listsLeft: that.data.listsLeft.concat(listsLeft),
                    listsRight: that.data.listsLeft.concat(listsRight)
                })
            }   
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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {
        // clearInterval(timer)
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