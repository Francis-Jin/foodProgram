// pages/account/account.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isShowContent: false,
        showTitle: "",
        showIcon: '',
        uploadImgLists: [],
        value: "20%"
    },

    /** 展示内容. */
    showContentFn(e) {
        let that = this
        let _type = e.currentTarget.dataset.type
        if (_type == 1) {
            // 营养成分
            this.setData({
                showTitle: "所含营养成分",
                showIcon: '/images/icon/chengfen@2x.png',
                showContent: ``
            })
        } else if (_type == 2) {
            // 含量
            this.setData({
                showTitle: "最高含量的主治功能",
                showIcon: '/images/icon/hanliang@2x.png',
                showContent: `钾可以调节细胞内适宜的渗透压和体液的酸碱平衡，参与细胞内糖和蛋白质的代谢。有助于维持神经健康、心跳规律正常，可以预防中风，并协助肌肉正常收缩。在摄入高钠而导致高血压时，钾具有降血压作用。`
            })
        } else if (_type == 3) {
            // 主治功能
            this.setData({
                showTitle: "该菜品的主治功能",
                showIcon: '/images/icon/chengfen@2x.png',
                showContent: `1、预防三高绿豆中含有的多糖成份具有增强血清脂蛋白的活性的作用，因此也就可以起到一个促进血脂平衡，从而保护心血管健康。
                这种球蛋白和多糖还具有促进体内胆固醇分解的作用， 因
                此可减少人体对胆固醇的吸收， 从而起到一个预防三高的作
                用； 两者一结合， 可大大的减少夏季高温突发心绞痛， 冠心
                病， 动脉硬化等一些心脏疾病发病的机率。
                2、 保护肾脏
                绿豆中的胰蛋白酶是一种可以帮助减少蛋白分解， 可减少蛋
                白质分解对肾脏造成的损伤， 因此可起到一个保护肾脏健康
                的作用； 肾脏是人体先天之本， 对肾脏起到保护作用， 自然
                也能减少很多疾病的侵扰。
                3、 增进食欲
                由天气候炎热的的关系， 夏季很容易会有食欲不振的问题，
                而绿豆中含有丰富的蛋白质， 磷脂等元素不仅能补充身体所
                需要的营养素， 同时还可起到一个兴奋神经的作用， 从而促
                进食欲。 `
            })
        }
        this.setData({
            isShowContent: true
        })
    },

    /** 隐藏. */
    hideContentFn() {
        this.setData({
            isShowContent: false
        })
    },

    /** 选择照片上传. */
    uploadImgFn() {
        let that = this
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: function(res) {
                that.setData({
                    uploadImgLists: that.data.uploadImgLists.concat(res.tempFilePaths)
                })
            },
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

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