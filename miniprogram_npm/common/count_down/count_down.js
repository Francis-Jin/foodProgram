// miniprogram_npm/common/count_down/count_down.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        countTime: {
            type: String,
            value: ''
        },
        align: {
            type: String,
            value: "left"
        },
        color: {
            type: String,
            value: ''
        },
        size: {
            type: String,
            value: ''
        }

    },

    /**
     * 组件的初始数据
     */
    data: {
        color: '#666',
        size: '24',
        countTime: ''
    },

    /**
     * 在组件在视图层布局完成后执行
     */
    ready() {
        let that = this
        that.countTimeFn()
        setInterval(function() {
            that.countTimeFn()
        }, 1000)
    },
    /**
     * 组件的方法列表
     */
    methods: {
        countTimeFn(){
            let that = this
            let countTime = that.data.countTime
            let showTime = '00:00'
            countTime = countTime.replace(/\-/g, "/")
            let Target = new Date(countTime)
            let targetTime = Target.getTime()
            let Now = new Date()
            let nowTime = Now.getTime()
            let time_difference = Math.round((targetTime - nowTime) / 1000)
            if (time_difference > 0) {
                // 分
                let m = parseInt(time_difference / 60 % 60)
                // 秒
                let s = parseInt(time_difference % 60)
                if (m.toString().length == 1) m = `0${m}`;
                if (s.toString().length == 1) s = `0${s}`;
                showTime = m + ':' + s
            }
            that.setData({
                showTime: showTime
            })
        }
    }
})