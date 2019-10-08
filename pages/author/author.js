// pages/author/author.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        address: '',        //家乡
        constellationValue: '',     //星座value
        constellationId: '',     //星座ID
        sexValue: '',     //性别value
        sexId: '',     //性别ID
        modalShow: false,     //是否显示上拉选择
        modalType: '',
        modalTitle: '',
        actions: []
    },

    /**
     * 输入家乡变化时
     */
    onChange(e) {
        this.setData({
            address: e.detail
        })
    },

    /** 显示弹框. */
    modalClickFn(e){
        let modalType = e.currentTarget.dataset.type
        console.log(modalType)
        if(modalType === '1'){
            let arr = [
                {
                    id: 1,
                    name: '男'
                },
                {
                    id: 2,
                    name: '女'
                }
            ]
            this.setData({
                modalTitle: '选择性别',
                actions: arr
            })
        }else{
            let arr = [
                {
                    id: 1,
                    name: '白羊座'
                },
                {
                    id: 2,
                    name: '金牛座'
                },
                {
                    id: 3,
                    name: '双子座'
                },
                {
                    id: 4,
                    name: '巨蟹座'
                },
                {
                    id: 5,
                    name: '狮子座'
                },
                {
                    id: 6,
                    name: '处女座'
                },
                {
                    id: 7,
                    name: '天秤座'
                },
                {
                    id: 8,
                    name: '天蝎座'
                },
                {
                    id: 9,
                    name: '射手座'
                },
                {
                    id: 10,
                    name: '摩羯座'
                },
                {
                    id: 11,
                    name: '水瓶座'
                },
                {
                    id: 12,
                    name: '双鱼座'
                }
            ]
            this.setData({
                modalTitle: '选择星座',
                actions: arr
            })
        }
        this.setData({
            modalType:modalType,
            modalShow: true
        })
    },

    /** 取消选择. */
    onClose() {
        this.setData({ modalShow: false });
    },

    /** 选择. */
    onSelect(e) {
        if (this.data.modalType === '1'){
            this.setData({
                sexValue:e.detail.name,
                sexId: e.detail.id
            })
        }else{
            this.setData({
                constellationValue: e.detail.name,
                constellationId: e.detail.id
            })
        }
        console.log(e.detail);
    },

    /** 下一步 */
    nextFn(){
        wx.redirectTo({
            url: '/pages/solar_terms/solar_terms',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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