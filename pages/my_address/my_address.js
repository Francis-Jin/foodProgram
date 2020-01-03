// pages/my_address/my_address.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        addressLists: [],
        selected: '',
        isSelectedAddress: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        let that = this
        that.setData({
            myAdd: options.myAdd,
            isSelectedAddress: options.selected == 'true' ? true : false
        })
    },

    /** 点击选择地址时. */
    checkGoodsChange(e) {
        let that = this
        let ItemId = e.currentTarget.dataset.itemid
        let addressLists = that.data.addressLists
        addressLists.forEach(item => {
            if (ItemId == item.id) {
                item.checked = true
            } else {
                item.checked = false
            }
        })
        that.setData({
            addressLists: addressLists
        })
    },

    /** 默认地址设置改变时 */
    switch1Change(e) {
        let that = this
        let Item = e.target.dataset.item
        let isdefaultAddress = e.detail.value
        app.appRequest({
            url: '/app/userAddress/updateIsDefault.action',
            method: 'post',
            postData: {
                id: Item.id,
                createUser: wx.getStorageSync('userInfo').id,
                isDefault: isdefaultAddress ? 1 : 0
            },
            success(res){
                if(res.code == 200){
                    that.getUserAddressFn()
                }
            }
        })
    },

    /** 跳转到添加地址页面. */
    addAddressFn(e) {
        let isSelectedAddress = this.data.isSelectedAddress
        let type = e.currentTarget.dataset.type
        let addressLists = this.data.addressLists
        if (!isSelectedAddress) {
            if (type == 'edit') {
                let item = e.currentTarget.dataset.item
                let code = []
                code.push(item.communitySectionId)
                code.push(item.communityBuildingId)
                code.push(item.communityBuildingUnitId)
                let addressId = item.id
                let userName = item.name
                let userPhone = item.phone
                let isDefault = item.isDefault
                let addressSelectedText = item.address
                let doorpValue = item.doorplate
                let selectIndex = item.selectIndex
                wx.navigateTo({
                    url: '/pages/add_address/add_address?isDefault=' + isDefault + '&selectIndex=' + selectIndex + '&type=' + type + "&addressId=" + addressId + "&userName=" + userName + "&userPhone=" + userPhone + "&addressSelectedText=" + addressSelectedText + "&doorpValue=" + doorpValue + '&code=' + code.join(),
                })
            } else {
                wx.navigateTo({
                    url: '/pages/add_address/add_address?type=' + type,
                })
            }
        } else {
            if (addressLists.length > 0) {
                let addstatus = e.currentTarget.dataset.addstatus
                if (type == 'edit') {
                    let item = e.currentTarget.dataset.item
                    let code = []
                    code.push(item.communitySectionId)
                    code.push(item.communityBuildingId)
                    code.push(item.communityBuildingUnitId)
                    let addressId = item.id
                    let userName = item.name
                    let userPhone = item.phone
                    let isDefault = item.isDefault
                    let addressSelectedText = item.address
                    let doorpValue = item.doorplate
                    let selectIndex = item.selectIndex
                    wx.navigateTo({
                        url: '/pages/add_address/add_address?isDefault=' + isDefault + '&selectIndex=' + selectIndex + '&type=' + type + "&addressId=" + addressId + "&userName=" + userName + "&userPhone=" + userPhone + "&addressSelectedText=" + addressSelectedText + "&doorpValue=" + doorpValue + '&code=' + code.join(),
                    })
                } else {
                    if (addstatus == 'true') {
                        wx.navigateTo({
                            url: '/pages/add_address/add_address?type=' + type,
                        })
                    } else {
                        let addressLists = this.data.addressLists
                        let arr = addressLists.filter(item => item.checked)
                        let pages = getCurrentPages(); //获取当前页面js里面的pages里的所有信息。
                        let prevPage = pages[pages.length - 2];
                        //prevPage 是获取上一个页面的js里面的pages的所有信息。 -2 是上一个页面，-3是上上个页面以此类推。
                        prevPage.setData({ // 将我们想要传递的参数在这里直接setData。上个页面就会执行这里的操作。
                            haveMealAddresInfo: arr[0]
                        })
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                }
            } else {
                wx.navigateTo({
                    url: '/pages/add_address/add_address?type=' + type,
                })
            }
        }
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
                if (res.data != null) {
                    res.data.forEach(item => {
                        item.checked = false
                        item.isDefault = item.isDefault == 0 ? false : true
                    })
                    that.setData({
                        addressLists: res.data
                    })
                } else {
                    that.setData({
                        addressLists: []
                    })
                }
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
        this.getUserAddressFn()
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