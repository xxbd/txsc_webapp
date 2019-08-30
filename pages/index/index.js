//index.js
//获取应用实例
const app = getApp()
const ctx2 = wx.createCanvasContext('myCanvas2') // 显示的canvas

var imgFilePath = ""
var ratio=2;
wx.getSystemInfo({
  success: function(res) {
    ratio= res.pixelRatio;
    console.log(ratio)
  },
})


var genWidth = 600
var showWidth = genWidth/ratio
console.log("width="+showWidth)
var order = ['red', 'yellow', 'blue', 'green', 'red']
Page({
  data: {
    userInfo: {},
    canvasWidth: showWidth,
    hasUserInfo: false,
    user_avatar_loaded:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    btn_start_disabled: true,
    btn_download_disabled: true,
    avatar_border_list:
      [ "/resources/img/avatar0.png", 
        "/resources/img/avatar1.png",
        "/resources/img/avatar2.png",
        // "/resources/img/avatar3.png", 版权
        "/resources/img/avatar4.png",
        "/resources/img/avatar5.png",
     ],
    selected_avatar_border:"",
    avatar_url:"",
    border_css:
      ["avatar-border",
        "avatar-border",
        "avatar-border",
        "avatar-border", 
        "avatar-border",
        "avatar-border", 
        "avatar-border",
        "avatar-border",
      ],
    gen_img_tempurl:"",
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        this.setData({
          // https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTJXPiaZFqkBUGtqFljhJnAfia1libOXia86xibdHjOhACvEQB90II9GiaeLayzAjgC8qmo263uK03MPReiaw/0
          avatar_url: this.data.userInfo.avatarUrl.substr(0, this.data.userInfo.avatarUrl.length-3).concat('0') // data.avatar_url 中存了头像的网络地址
        })
        ctx2.drawImage("/resources/img/loading.png", 0, 0, showWidth, showWidth)
        ctx2.draw()       
        this.downloadUrl()
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    if(this.data.hasUserInfo){
      this.setData({
        avatar_url: this.data.userInfo.avatarUrl.substr(0, this.data.userInfo.avatarUrl.length - 3).concat('0') // data.avatar_url 中存了头像的网络地址
      })
      ctx2.drawImage("/resources/img/loading.png", 0, 0, showWidth, showWidth)
      ctx2.draw()
      this.downloadUrl() 
    }

  },
  
  downloadUrl:function (){
    let that = this;
    wx.downloadFile({
      url: that.data.avatar_url,
      success: function (res) {
        // console.log(res.tempFilePath);
        that.setData({
          avatar_url: res.tempFilePath,
          user_avatar_loaded:true,
        })
        //绘图方法
        ctx2.drawImage(that.data.avatar_url, 0, 0, showWidth, showWidth)
        ctx2.draw()
      }, fail: function (fres) {

      }
    })
  },

  // circleImg: function (ctx, imgurl, x, y, r) {
  //   ctx.save()
  //   var d = 2 * r
  //   var cx = x + r
  //   var cy = y + r
  //   ctx.arc(cx, cy, r, 0, 2 * Math.PI)
  //   ctx.clip()
  //   ctx.drawImage(imgurl, x, y, d, d)
  //   ctx.restore()
  // },

  drawImageForSave:function(which_ctx){
    which_ctx.draw(false, function(){
        wx.canvasToTempFilePath({
          canvasId: 'myCanvas2',
          destHeight: genWidth,
          destWidth: genWidth,
          fileType:'jpg',
          quality:1,
          success:function(res){
            // 获得图片临时路径
            imgFilePath = res.tempFilePath
          }
        }, this)
      }
    )
  },
  saveImg: function () {

    wx.saveImageToPhotosAlbum({
      filePath: imgFilePath,
      success:function(){
        wx.showToast({
          title: '保存成功',
        })
      }
    })
  },
  select: function (event) {
    if (!this.data.user_avatar_loaded)
      return
    for (var i = 0; i < 8; i++) {
      var css_str = "border_css[" + (i) + "]"
      this.setData({
        [css_str]: "avatar-border"
      })
    }

    var id = event.target.id
    var str = this.data.avatar_border_list[id ]
    var css_str = "border_css[" + (id) + "]"

    this.setData({
      btn_start_disabled: false,
      selected_avatar_border: str,
      [css_str]: "avatar-border-selected",
      btn_download_disabled: false,      
    })
    // ctx.clearRect(0, 0, savedWidth, savedWidth)
    // ctx.drawImage(this.data.avatar_url, 0,0,savedWidth,savedWidth)
    // ctx.drawImage(this.data.selected_avatar_border, 0, 0, savedWidth, savedWidth)
    ctx2.clearRect(0, 0, showWidth, showWidth)
    ctx2.drawImage(this.data.avatar_url, 0, 0, showWidth, showWidth)
    ctx2.drawImage(this.data.selected_avatar_border, 0, 0, showWidth, showWidth)
    this.drawImageForSave(ctx2)
    // ctx2.draw()
    
    var str2 = this.data.border_css

  },
})
