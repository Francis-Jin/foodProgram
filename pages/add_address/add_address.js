// pages/add_address/add_address.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userName: '',
        userPhone: '',
        doorpValue: '',
        addressSelectedText:'',
        isAddAndEdit: false,
        objectMultiArray: [],
        addressId: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        console.log(options)
        let type = options.type
        let addressId = options.addressId
        if(type == 'edit'){
            // 编辑地址
            let userName = options.userName
            let userPhone = options.userPhone
            let addressSelectedText = options.addressSelectedText
            let doorpValue = options.doorpValue
            this.setData({
                type: type,
                addressId: addressId,
                isAddAndEdit: true,
                userName: userName,
                userPhone: userPhone,
                addressSelectedText: addressSelectedText,
                doorpValue: doorpValue
            })
        }else{
            this.setData({
                type: type,
                addressId: '',
                isAddAndEdit: false
            })
        }
        this.getAddressListsFn()
    },

    /** 删除地址. */
    deleteAddressFn(){
        let that = this
        app.appRequest({
            url: '/app/userAddress/deleteUserAddress.action',
            method: 'post',
            postData: {
                id: that.data.addressId
            },
            success(res){
                wx.showToast({
                    title: '已删除',
                    icon: 'none',
                    duration: 3000,
                    success() {
                        setTimeout(function () {
                            wx.navigateBack({
                                detal: 1
                            })
                        }, 1000)
                    }
                })
            }
        })
    },

    /** 获取地址选项数据 */
    getAddressListsFn() {
        let that = this
        app.appRequest({
            url: "/app/userAddress/listAddress.action",
            method: "get",
            success(res) {
                console.log(res)
                that.setData({
                    objectMultiArray: res.data
                })
            }
        })
    },

    bindMultiPickerChange(e){
        let objectMultiArray = this.data.objectMultiArray
        let value = e.detail.value
        let text = objectMultiArray[0][value[0]].name + objectMultiArray[1][value[1]].name + objectMultiArray[2][value[2]].name
        this.setData({
            addressSelectedText: text
        })
    },

    /** 姓名输入时。 */
    onChange(e){
        this.setData({
            userName: e.detail
        })
    },
    /** 电话输入时。 */
    ageChange(e) {
        this.setData({
            userPhone: e.detail
        })
    },
    /** 门牌号输入时。 */
    addressChange(e) {
        this.setData({
            doorpValue: e.detail
        })
    },

    /** 点击添加按钮 */
    addAddressFn(){
        let that = this
        if(!that.data.userName){
            wx.showToast({
                title: '请输入姓名',
                icon: 'none'
            })
            return false
        }
        if (!that.data.userPhone) {
            wx.showToast({
                title: '请输入电话',
                icon: 'none'
            })
            return false
        }
        if (!that.data.addressSelectedText) {
            wx.showToast({
                title: '请选择地址',
                icon: 'none'
            })
            return false
        }
        if(that.data.isAddAndEdit){
            // 编辑更新
            app.appRequest({
                url: "/app/userAddress/updateUserAddress.action",
                method: 'post',
                postData: {
                    id: that.data.addressId,
                    name: that.data.userName,
                    phone: that.data.userPhone,
                    address: that.data.addressSelectedText,
                    doorplate: that.data.doorpValue,
                    createUser: wx.getStorageSync("userInfo").id
                },
                success(res) {
                    wx.showToast({
                        title: '已更新',
                        duration: 3000,
                        success() {
                            setTimeout(function () {
                                wx.navigateBack({
                                    detal: 1
                                })
                            }, 1000)
                        }
                    })
                }
            })
        }else{
            // 新添加
            app.appRequest({
                url: "/app/userAddress/saveUserAddress.action",
                method: 'post',
                postData: {
                    name: that.data.userName,
                    phone: that.data.userPhone,
                    address: that.data.addressSelectedText,
                    doorplate: that.data.doorpValue,
                    createUser: wx.getStorageSync("userInfo").id
                },
                success(res) {
                    wx.showToast({
                        title: '添加成功',
                        duration: 3000,
                        success() {
                            setTimeout(function () {
                                wx.navigateBack({
                                    detal: 1
                                })
                            }, 1000)
                        }
                    })
                }
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