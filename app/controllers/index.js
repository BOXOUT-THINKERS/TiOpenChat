Alloy.Globals.navigation = $.index;
Alloy.Globals.menuC = $.menuC;
Alloy.Globals.loginC = Alloy.createController('login');
Alloy.Globals.loginC.requiredLogin();

//버전체크 후 실행동작 정하기.
var appVersionCheck = function(){
	var Version = defineVersion();

	//처음 서버의 app정보 가져오기.
	var currentVersion = new Version(Titanium.App.version);

	Alloy.Globals.appInfoM = Alloy.createModel('appInfo');

	//버전 정보를 가져온 후. app 초기화 및 실행.
	fetchAppInfo(3);

	/////////////////////////////////////////
	function fetchAppInfo(retryCount) {
		Ti.API.debug('retryCount Remain : ', retryCount, '/3', 'name :', Titanium.App.name);
		Alloy.Globals.appInfoM.fetch({
			query: { where: { "name": Titanium.App.name }},
			success : successCallbackAfterFetch,
			//fetch에러시 세번시도 후 alert:'재시도 해주세요.' 확인. 확인누르면 다시 반복.
			error: function(err) {
				Ti.API.debug('fetchAppInfo error :', err);
				if(retryCount <= 0) {
					//재시도 횟수를 모두 소모했다면? 알림 후 반복. 안드로이드는 일반 alert이 비동기로 동작하기에..아래처럼.
					var dialog = Ti.UI.createAlertDialog({
						ok: 0,
						buttonNames: [L('c_alertMsgOk')],
						message: L("c_alertFailFetchAppInfo")
					});
					// dialog.addEventListener('click', function(e){
					// 	fetchAppInfo(3);
					// });

					dialog.show();
				}else{
					fetchAppInfo(--retryCount);
				}
			}
		});
	}

	function successCallbackAfterFetch(res) {
		var results = res.attributes.results || [null];
		var appInfoData = results[0];
		if(appInfoData){
			Alloy.Globals.appInfoM = Alloy.createModel('appInfo', appInfoData);
			verifyAndRunByAppVersion(currentVersion);
		}else{
			//TODO[faith]: 정보가져오는데 성공했는데. 버전정보가 없는경우가있을까?
			var msg = L('c_odizzo') + "의 버전 정보가 없습니다.";
			Alloy.Globals.alert(msg);
		};
	}

	function verifyAndRunByAppVersion(currentVersion) {
		var minVersion = new Version(Alloy.Globals.appInfoM.get('minVersion'));
		var recentVersion = new Version(Alloy.Globals.appInfoM.get('recentVersion'));
		var requestVersion = new Version(Alloy.Globals.appInfoM.get('requestVersion'));

		Ti.API.debug('appINfo : ', Alloy.Globals.appInfoM.attributes);
		Ti.API.debug(currentVersion, minVersion, recentVersion, requestVersion );

		//순서유지해야함. 순차적으로 강제적용되는 행동 범위가 작아짐.
		//현재버전이 최소요구버전 미만이라면. 사용못함 . 강제종료
		if(currentVersion.isLessThan(minVersion)) {
			var dialog = Ti.UI.createAlertDialog({
			ok: 0,
			buttonNames: ['ok'],
			message: L("c_alertRequestReinstall")
			});
			dialog.addEventListener('click', function(e){
				Ti.API.debug('====강제종료');
				//강제종료
				if(OS_IOS){
					// TODO[faith]:IOS에서 강제종료는 처리못함. 가이드상 권고하지 않고, ios 모듈을 사용해야되는 것으로 보임.
					//Ti.API.debug('IOS에서 강제종료는 처리못함. 가이드상 권고하지 않고, ios 모듈을 사용해야되는 것으로 보임.');
					Alloy.Globals.startWaiting("c_alertRequestReinstall");
				}else{
					var activity = Titanium.Android.currentActivity;
					activity.finish();
				}
			});
			dialog.show();
			return;
		}
		//현재버전이 requestVersion 이하면 컨펌으로 재설치할것인지 물어봄.
		if(currentVersion.isLessThan(requestVersion)) {
			//아니오 이면 그냥 실행.
			var dialog = Ti.UI.createAlertDialog({
			ok: 0,cancel: 1,
			buttonNames: [L('c_updateConfirmYes'), L('c_updateConfirmNo')],
			message: L("c_updateConfirmMessage")
			});
			dialog.addEventListener('click', function(e){
				if (e.index === e.source.cancel){
					//Alloy.Globals.loginC.requiredLogin();
				}
				if (e.index === e.source.ok){
					var linkInfo = { ios : {} , android: {}};
					linkInfo = (Alloy.Globals.currentLanguage == 'ko') ? Alloy.Globals.appInfoM.get('linkInfo_ko') : Alloy.Globals.appInfoM.get('linkInfo_en');
					linkInfo = (OS_IOS) ? linkInfo.ios : linkInfo.android;

					// { "ios" : { "message" : "오디쪼?", "url": "http://naver.com" } , "android": { "message" : "오디쪼?", "url": "http://naver.com" } }
					// { "ios" : { "message" : "Odizzo?", "url": "http://naver.com" } , "android": { "message" : "Odizzo?", "url": "http://naver.com" } }
					Ti.API.debug('===============새로운 버전 설치!하는 기능 추가해야함.================');
					Ti.API.debug(linkInfo);

					if(OS_IOS){
						// Ti.Platform.openURL('itms-apps://ax.itunes.apple.com/WebObjects/MZStore.woa/wa/viewContentsUserReviews?type=Purple+Software&id=nnnnnnnnnn');
					}else{
						// Ti.Platform.openURL('market://search?q=pname:com.package.name');
						// Ti.Platform.openURL('market://search?q=pname:com.package.name');
					}

					Ti.Platform.openURL(linkInfo.url);
				}
			});
			dialog.show();
			//예이면 재설치로......
			return;
		}
		//현재버전이 requestVersion 초과 이고, 최신버전보다는 작다면. 새버전나왔다는 toast? 체크안해도되는 알림만보여줘.
		if((currentVersion.isGreaterThan(requestVersion)) && (currentVersion.isLessThan(recentVersion)) ){

			//Alloy.Globals.loginC.requiredLogin();
			// 새버전 안내는 Android에서만, iOS는 정책상 안됌
			// Your app includes an update button or alerts the user to update the app. To avoid user confusion, app version updates must utilize the iOS built-in update mechanism.
			if (OS_ANDROID) {
				Alloy.Globals.toast('c_alertNewVersion');
			}
			return;
		}
		//최신버전이거나 위의 조건에서 걸리지 않는 경우. 실행..
		//Alloy.Globals.loginC.requiredLogin();
	};
};
///////////////////////////////////////////////////

// 앱이 백그라운드 상태에서 알림을 클릭시 동작.
// $.index.addEventListener('open', function() {
//
// });

// 초기 로딩
$.centerWindow.addEventListener('open', function(e) {
	Alloy.Globals.startWaiting('c_waitingMsgFirst');

	// 대화목록
	Alloy.Globals.chatListC = Alloy.createController('chat/chatList');
	// 초기 데이터 로딩 (연락처, 채팅방, 메시지)
	if (Alloy.Globals.user) {
		Alloy.Globals.chatListC.fetchInitialData('sync');
	} else {
		Alloy.Globals.loginC.on('login:user',function(){
			Alloy.Globals.chatListC.fetchInitialData('sync');
		});
	}

	// 대화목록 로딩 완료후에 할일 들 잔뜩
	Alloy.Globals.chatListC.on('start:complete', function() {
		// firebase 컨트롤러
		_.defer(function() {
			if (!Alloy.Globals.firebaseC) {
				Alloy.Globals.firebaseC = Alloy.createController('firebase');
				Alloy.Globals.firebaseC.on('receive:message', function(message) {
					Alloy.Globals.chatService._onReceiveMessage(message);
				});
			}
			Alloy.Globals.firebaseC.listenStart(Alloy.Globals.user.get('id'));

			_.defer(function() {
				// 채팅방에 입장해도 되는 타이밍
				Alloy.Globals.chatListC.trigger('firebase:ready');

				// Push 컨트롤러
				_.defer(function() {
					if (!Alloy.Globals.parsePushC) {
						Alloy.Globals.parsePushC = Alloy.createController('parsePush');
					}

					// 로긴 완료 이벤트 발생시킴 - 현재는 수신하는 곳이 parsePushC뿐...
					_.defer(function() {
						Alloy.Globals.loginC.trigger('login:after', Alloy.Globals.user);

						// Push 관련된 이벤트 전달
						_.defer(function() {
							Alloy.Globals.parsePushC.trigger('parsePush:ready');

							// 알림을 클릭시 처리
							_.defer(function() {
								if (OS_ANDROID) {
									//알림을 클릭시만.
									var notifyStr = null;
									if(Titanium.App.Android.launchIntent && Titanium.App.Android.launchIntent.getStringExtra){
										notifyStr = Titanium.App.Android.launchIntent.getStringExtra('com.parse.Data');
									}

									if (notifyStr) {
										var msg = JSON.parse(notifyStr);
										//백그라운드에서 알림 클릭
										var chatRoomCollection = Alloy.Collections.instance('chatRoom');

										if(Alloy.Globals.user && msg.roomId && msg.fromUserId){
											var myId = Alloy.Globals.user.get('id');
											chatRoomCollection.getOrCreate(msg.roomId, [myId, msg.fromUserId], myId)
												.then(function(chatRoomM){
													return Alloy.Globals.chatViewManager.openView(chatRoomM);
												})
												.fail(function(error) {
													Ti.API.error(error);
												});
										}
									}
								}

								//타임존오프셋설정.
								_.defer(function() {
									var now = new Date();
									Parse.Cloud.run('userModify', {
										"timezoneOffset":now.getTimezoneOffset(),
										"currentLanguage": Alloy.Globals.currentLanguage
									});

									// 앱 버전 체크를 하자
									_.defer(function() {
										appVersionCheck();

										// 시작 프로세스가 완전히 끝남음을 알림
										_.defer(function() {
											Alloy.Globals.appStartProcess = false;
											Alloy.Globals.chatListC.startComplete = true;
											Alloy.Globals.chatListC.trigger('appStartProcess:complete');
											Ti.API.debug('==============================================================');
											Ti.API.debug('실행 초기화 마무리작업끝');
											Ti.API.debug('==============================================================');
										});
									});
								});
							});
						});
					});
				});
			});
		});

		Alloy.Globals.chatListC.off('start:complete',arguments.callee);
	});

	// 열자
	changeCenterView(Alloy.Globals.chatListC, 'chatlist');

	$.centerWindow.removeEventListener('open',arguments.callee);
});

// 창 전환 이벤트 처리
var addHandler = function() {
	Alloy.Globals.appOnline = true;
	if (Alloy.Globals.firebaseC) {
		Alloy.Globals.firebaseC.goOnline();
	}

	// android 앱을 켜면 푸시를 정리해주자
	if (OS_ANDROID) {
		if (Alloy.Globals.parsePushC) {
			Alloy.Globals.parsePushC.notificationClear();
		}
	}
};
var removeHandler = function() {
	Alloy.Globals.appOnline = false;
	// 대화방이 열려있는 경우를 제외하면 firebase를 offline으로 변경한다
	if (Alloy.Globals.firebaseC && !(Alloy.Globals.chatViewManager && Alloy.Globals.chatViewManager.currentOpenedRoomId)) {
		Alloy.Globals.firebaseC.goOffline();
	}

	// iOS 읽지 않은 게시물 수 만큼 뱃지 갯수 설정
	if (OS_IOS) {
		if (!_.isEmpty(Alloy.Globals.user) && Alloy.Globals.parsePushC) {
			var myId = Alloy.Globals.user.get('id');
			var models = Alloy.Collections.instance('message').where({isRead: false});
			var badgeCount = _.filter(models, function(model){
				return (model.get('fromUserId') != myId && (model.get('type') == "send:message" || model.get('type') == "request:where")) ? true : false;
			}).length;
			Alloy.Globals.parsePushC.setBadge(parseInt(badgeCount));
		}
	}
};

var Context = require('Context');

function onOpen(evt) {
	Ti.API.debug("Open Event");

	Ti.App.addEventListener('resumed', addHandler);
	Ti.App.addEventListener('paused', removeHandler);
	if (OS_ANDROID) {
		Context.on('index', this.activity);
	}
}

function onClose(evt) {
	Ti.API.debug("Close Event");

	if (OS_ANDROID) {
		Context.off(this.activity);
	}
	removeHandler();

	Ti.App.removeEventListener('resumed', addHandler);
	Ti.App.removeEventListener('paused', removeHandler);
}

// 오른쪽 버튼 설정 공통 기능
function rightBtnSet(params) {
	if (params && params.rightBtnOption && params.rightBtnFn) {
		if (OS_IOS) {
			var rightMenuView = Ti.UI.createView();
			var rightBtn = Ti.UI.createButton(params.rightBtnOption);
			rightBtn.addEventListener("click", function(e) {
				params.rightBtnFn(rightBtn);
			});
			rightMenuView.add(rightBtn);
			$.centerWindow.rightNavButton = rightMenuView;

			//중앙텍스트변경
			if(params.centerTitle){
				//타이틀
			    $.centerWindow.titleControl= Ti.UI.createLabel({
			    	text: params.centerTitle,
			    	color: 'white' ,
			    	font: {
						fontSize: '17',
						fontFamily: 'AppleSDGothicNeo-SemiBold'
					}
				});
				Ti.API.debug('title확인',$.centerWindow.titleControl.text);
			}
		} else {
			var activity = $.centerWindow.getActivity();

			//중앙텍스트변경
			if(params.centerTitle && activity.actionBar){
				activity.actionBar.title = params.centerTitle;
				Ti.API.debug('title확인',activity.actionBar.title);
			}
			activity.onCreateOptionsMenu = function(e) {
				Ti.API.debug("Menu Redraw");
				var rightBtn = e.menu.add(params.rightBtnOption);
				rightBtn.setShowAsAction(Ti.Android.SHOW_AS_ACTION_ALWAYS);
				rightBtn.addEventListener("click", function(e) {
					params.rightBtnFn(rightBtn);
				});
			};
			activity.invalidateOptionsMenu();
		}
	}
}

var _currentViewName;
var _currentController;
function changeCenterView(controller, viewName) {
	if(_currentViewName == viewName) {
		return;
	}

	//간혹 오프라인이 될때가 있어서 처리
	addHandler();

	// 에러 방지
	try {
		// right Button 관련 처리
		if (_.isFunction(controller.rightBtn)) {
			rightBtnSet(controller.rightBtn());
		}
	} catch(e) {  }

	// 에러 방지
	try {
		// open 이벤트 명시적 처리
		if (_.isFunction(controller.openFn)) {
			controller.openFn();
		}
	} catch(e) {  }

	// 화면을 바꾸자
	$.index.setCenterView(controller.getView()); //Arg shold be View(not window)

	// 에러 방지
	try {
		// exit 이벤트 명시적 처리
		if (_.isFunction(_currentController.closeFn)) {
			_currentController.closeFn();
		}
	} catch(e) {  }

	_currentViewName = viewName;
	_currentController = controller;

	// 메모리 관리를 위해 친구목록은 지워주기
	// if (viewName != 'contacts' && Alloy.Globals.contactsC) {
	// 	Alloy.Globals.contactsC = null;
	// }
}

// 안드로이드 백버튼으로 종료될 때
function indexBackButton() {
	if (OS_ANDROID) {
		Ti.API.debug("Android Back button on Index  ");

		Alloy.Globals.closeAllWindow();

		var intent = Ti.Android.createIntent({
			action: Ti.Android.ACTION_MAIN
		});
		intent.addCategory(Ti.Android.CATEGORY_HOME);
		Ti.Android.currentActivity.startActivity(intent);
	}

	return false;
}


function onMenuButtonClick(e){
	$.index.toggleLeftView();
}

function onDrawerOpen(e) {
	Ti.API.debug($.index.isLeftDrawerOpen);
}

function onDrawerClose(e) {
	Ti.API.debug($.index.isLeftDrawerOpen);
}


$.menuC.on('menuclick',function(e){

	switch(e.itemId){
		case 'contacts':
			// if (!Alloy.Globals.contactsC) {
			// }
			changeCenterView(Alloy.createController('contacts'), e.itemId);
		break;
		case 'chatlist':
			changeCenterView(Alloy.Globals.chatListC, e.itemId);
		break;
		case 'setting':
			changeCenterView(Alloy.createController('setting/setting'), e.itemId);
		break;

		default:
			// Alloy.Globals.openWindow(e.itemId);
			//$.index.openWindow(Alloy.createController(e.itemId).getView());
		break;
	}

	//직접 클릭외 이벤트 발생시 토글되지않도록메뉴열기위해 추가.
	if(!e.isNotToggle){
		 $.index.toggleLeftView({animated:false}); //animated option only work on ios
	}
});


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

	 ////
	 return Version;
 }
