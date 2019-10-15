// pages/author/author.js
var app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: '', //家乡
        constellationValue: '', //星座value
        constellationId: '', //星座ID
        sexValue: '', //性别value
        sexId: '', //性别ID
        ageValue: '', //年龄
        modalShow: false, //是否显示上拉选择
        modalType: '',
        modalTitle: '',
        array: ['男', '女'],
        actions1: [{
                code: 1,
                name: '男'
            },
            {
                code: 2,
                name: '女'
            }
        ], // 性别
        array2: [], //星座
        constellationLists: null,
    },

    /**
     * 输入家乡变化时
     */
    onChange(e) {
        this.setData({
            address: e.detail
        })
    },
    /**
     * 输入年龄变化时
     */
    ageChange(e) {
        this.setData({
            ageValue: e.detail
        })
    },
    /** 性别选择. */
    bindPickerChange: function(e) {
        this.setData({
            sexValue: this.data.array[e.detail.value]
        })
    },
    /** 星座选择. */
    bindPickerConstellationChange(e) {
       this.setData({
           constellationValue: this.data.array2[e.detail.value]
       })
    },
    
    /** 下一步 */
    nextFn() {
        let that = this
        if (that.data.address == '') {
            wx.showToast({
                title: '请输入家乡地址',
                icon: 'none'
            })
            return false
        }
        if (that.data.ageValue == '') {
            wx.showToast({
                title: '请输入年龄',
                icon: 'none'
            })
            return false
        }
        if (that.data.sexValue == '') {
            wx.showToast({
                title: '请选择性别',
                icon: 'none'
            })
            return false
        }

        let sexCode = that.data.actions1.filter(item => item.name == that.data.sexValue)[0].code
        let constellationCode = that.data.constellationLists.filter(item => item.name == that.data.constellationValue)[0].code
        app.appRequest({
            url: "/app/userInfo/updateUserInfo.action",
            method: 'post',
            getParams:{ 
                "homeplace": that.data.address,
                "constellation": constellationCode,
                "sex": sexCode,
                "age": that.data.ageValue,
                "unionId": wx.getStorageSync("userInfo").unionId
            },
            success(res){
                if(res.code == 200){
                    wx.redirectTo({
                        url: '/pages/solar_terms/solar_terms',
                    })
                }else{
                    wx.showToast({
                        title: '服务器出错了,稍后再试',
                        icon: 'none'
                    })
                }
            }
        })
    },

    /** 获取星座. */
    getConstellationFn(){
        let that = this
        app.appRequest({
            url: "/app/sysConf/getConstellation.action",
            method: 'get',
            success(res){
                console.log(res)
                let lists = []
                res.data.forEach(item=>{
                    lists.push(item.name)
                })
                that.setData({
                    array2: lists,
                    constellationLists: res.data
                })
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.getConstellationFn()
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