$.container.title = L('s_versionInfo');
$.c_currentVersion.text = L('c_currentVersion');
$.c_recentVersion.text = L('c_recentVersion');
$.updateBtn.text = L('c_updateRecentVersion');

var Version = defineVersion();

var currentVersion = new Version(Titanium.App.version);
var recentVersion = new Version(Alloy.Globals.appInfoM.get('recentVersion'));

$.recentVersion.text = recentVersion.toString();
$.currentVersion.text = currentVersion.toString();

// $.versionInfoView.width = (Alloy.Globals.currentLanguage == 'ko') ? 230 : 280;

// iOS 는 정책 상 앱에 업데이트 버튼을 넣으면 안됌
// Your app includes an update button or alerts the user to update the app. To avoid user confusion, app version updates must utilize the iOS built-in update mechanism.
if (OS_IOS) {
  $.bottomViewWrap.visible = false;
}

function updateRecentVersion() {
  var linkInfo = { ios : {} , android: {}};
  linkInfo = (Alloy.Globals.currentLanguage == 'ko') ? Alloy.Globals.appInfoM.get('linkInfo_ko') : Alloy.Globals.appInfoM.get('linkInfo_en');
  linkInfo = (OS_IOS) ? linkInfo.ios : linkInfo.android;

  Ti.Platform.openURL(linkInfo.url);
}



///////////////////////
 //version check에 사용되는 클래스
 function defineVersion() {
   //major minor  patch build로 구분하여. 비교를 수행함.
   var Version = function(versionStr) {
     //각부분 할당.
     if(_.isNumber(versionStr)) versionStr = versionStr.toString();

     var numbers = versionStr.split(".");
     //비교에 사용됨. 정해지지않은 경우는 기본값 0
     this.major = numbers[0] ? Number(numbers[0]) : 0;
     this.minor = numbers[1] ? Number(numbers[1]) : 0;
     this.patch = numbers[2] ? Number(numbers[2]) : 0;
     this.build = numbers[3] ? Number(numbers[3]) : 0;
   }

   //왼쪽이 더 작은지 확인
   Version.prototype.isLessThan = function (rVersion) {
     //major부터 순차적으로 하나씩 체크.
     //두가지 크고 작음에 대한 return 판단을 하고, 그 아래상황은 같을경우에 발생되는것.
     if(this.major < rVersion.major) return true;
     if(this.major > rVersion.major) return false;

     if(this.minor < rVersion.minor) return true;
     if(this.minor > rVersion.minor) return false;

     if(this.patch < rVersion.patch) return true;
     if(this.patch > rVersion.patch) return false;

     if(this.build < rVersion.build) return true;
     if(this.build > rVersion.build) return false;



     //모든 경우가 아닌 것은 두 버전이 같은 경우. less이므로 false
     return false;
   };
   //왼쪽이 더 큰지 확인
   Version.prototype.isGreaterThan = function (rVersion) {
     //major부터 순차적으로 하나씩 체크.
     //두가지 크고 작음에 대한 return 판단을 하고, 그 아래상황은 같을경우에 발생되는것.
     if(this.major > rVersion.major) return true;
     if(this.major < rVersion.major) return false;

     if(this.minor > rVersion.minor) return true;
     if(this.minor < rVersion.minor) return false;

     if(this.patch > rVersion.patch) return true;
     if(this.patch < rVersion.patch) return false;

     if(this.build > rVersion.build) return true;
     if(this.build < rVersion.build) return false;



     //모든 경우가 아닌 것은 두 버전이 같은 경우. less이므로 false
     return false;
   }
   //둘이 같은 버전인지 확인
   Version.prototype.isEqual = function (rVersion) {
     //major부터 순차적으로 하나씩 체크.
     if(this.major == rVersion.major &&
       this.minor == rVersion.minor &&
       this.patch == rVersion.patch &&
       this.build == rVersion.build) {

       return true;
     }else{
       return false;
     }
   }

   //메이저, 마이너, patch까지만 보여주자.
   Version.prototype.toString = function () {
     return this.major + "." + this.minor + "." + this.patch;
   }

   ////
   return Version;
 }
