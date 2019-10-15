// pages/cook_details/cook_details.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        detailInfo: ''
    },

    /** 跳转视频播放. */
    toPlayVideo(e){
        let url = e.currentTarget.dataset.url
        let cookName = this.data.detailInfo.name
        console.log(cookName)
        wx.navigateTo({
            url: '/pages/play_video/play_video?url=' + url + "&cookName=" + cookName
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let itemId = options.itemId
        this.getCookInfoVoFn(itemId)
    },

    /** 获取厨师详情. */
    getCookInfoVoFn(id){
        let that = this
        app.appRequest({
            url: "/app/recommend/getCookInfoVo.action",
            method: "get",
            getParams:{
                id:id
            },
            success(res){
                // res.data.intro = res.data.content.replace(/\<img/gi, `<img style="max-width:90%;height:auto"`)
                that.setData({
                    detailInfo:res.data
                })
            }
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