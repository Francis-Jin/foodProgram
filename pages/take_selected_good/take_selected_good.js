// pages/take_selected_good/take_selected_good.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        urlBefore: app.globalData.urlBefore,
        lists: [],
        page: 1,
        pageSize: 10,
        searchVal: ''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getFoodsFn()
    },

    /** 搜索数据. */
    searchDataFn(e) {
        console.log(e)
        let searchVal = e.detail
        this.setData({
            searchVal: searchVal,
            lists: []
        })
        this.getFoodsFn()
    },

    /** 获取菜品/食材 */
    getFoodsFn(){
        let that = this
        app.appRequest({
            url: '/app/dishInfo/listDishInfoByLocation.action',
            method: 'get',
            getParams: {
                page: that.data.page,
                rows: that.data.pageSize,
                name: that.data.searchVal
            },
            success(res){
                if(res.code == 200){
                    if(res.data){
                        let lists = that.data.lists
                        res.data.forEach(item=>item.checked = false)
                        that.setData({
                            lists: lists.concat(res.data)
                        })
                    }
                }
            }
        })
    },

    /** 选择商品. */
    selectedFoodFn(e){
        let that = this
        let Item = e.currentTarget.dataset.item
        let lists = that.data.lists
        lists.forEach(item=>{
            if(Item.id == item.id){
                item.checked = !item.checked
            }
        })
        that.setData({
            lists:lists
        })
    },

    /** 确定已选择商品. */
    confirmSelectedContentFn(){
        let that = this
        let lists = that.data.lists
        let newArr = lists.filter(item=>item.checked)
        if(newArr.length == 0 ){
            wx.showToast({
                title: '请选择',
                iocn: 'none'
            })
            return false
        }
        newArr.forEach(item=>item.quantity=0) //设置item初始数量

        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
        let prevPage = pages[pages.length - 2];
        //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
        prevPage.setData({  // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
            selectedLists: newArr
        })
        wx.navigateBack({
            delta: 1
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
        let that = this
        let page = that.data.page
        page++
        taht.setData({
            page: page
        })
        that.getFoodsFn()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})