var args = arguments[0] || {};

$.container.title = L('cb_friendTitle');
$.blockBtn.title = L('cb_banFriendBtn');
$.hiddenBtn.title = L('cb_hideFriendBtn');

var contactsCol = Alloy.Collections.instance('contacts');
var Q = Alloy.Globals.Q;

var friendContactsCol;
var selectedModels = [];

$.getView().addEventListener('open', function () {
  var allContactsCol = Alloy.Collections.instance('contacts');
  var models = allContactsCol.filter(function(model){
    return model.get('User_objectId_To') && !(model.get('isHidden') || model.get('isBlock'));
  });
  friendContactsCol = Alloy.createCollection('contacts');
  //set은 없고, reset은된다. 버전차이인.
  friendContactsCol.reset(models);

  drawContacts();
  Alloy.Globals.stopWaiting();
});

var drawContacts = function() {
  var items = [];
  friendContactsCol.each(function(model){

    var friend = model.get('User_object_To') || {};
    var imageUrl = friend.profileImage ? friend.profileImage.url : '/images/friendlist_profile_default_img.png';

    items.push({
      template : "rowTemplate",
      checkIcon : {
        image : '/images/friendlist_edit_un_checkbox.png'
      },
      profileImage : {
        image : imageUrl
      },
      profileName: {
        text : model.get('fullName') || friend.name || ''
      },
      properties : {
        itemId : model.id,
        searchableText : model.get('fullName') || friend.name
      }
    });
  });
  $.section.setItems(items);
};

$.listView.addEventListener('itemclick', function(e){
  var item = $.section.getItemAt(e.itemIndex);
  var itemId = e.itemId;
  var clickModel = friendContactsCol.get(itemId);
  if (_.findWhere(selectedModels, clickModel)) {
    item.checkIcon.image = '/images/friendlist_edit_un_checkbox.png';
    selectedModels = _.without(selectedModels, clickModel);
  } else {
    item.checkIcon.image = '/images/friendlist_edit_checkbox.png';
    selectedModels.push(clickModel);
  }
  $.blockBtn.title = L('cb_banFriendBtn') + ' (' + selectedModels.length + ')';
  $.hiddenBtn.title = L('cb_hideFriendBtn') + ' (' + selectedModels.length + ')';
  $.section.updateItemAt(e.itemIndex, item);
});

function blockContacts() {
  Alloy.Globals.startWaiting('c_waitingMsgDefault');
  blockContactsQ(0).then(function() {
    Alloy.Globals.toast("cb_banFriend");

    Alloy.Globals.stopWaiting();
    contactsCol.trigger('redraw');
    $.getView().close();
  });
}

function hiddenContacts() {
  Alloy.Globals.startWaiting('c_waitingMsgDefault');

  hiddenContactQ(0).then(function() {
    Alloy.Globals.toast("cb_hideFriend");

    Alloy.Globals.stopWaiting();
    contactsCol.trigger('redraw');
    $.getView().close();
  });
}

function blockContactsQ(idx) {
  Ti.API.debug("blockContactsQ function idx : ", idx);
  if (idx > selectedModels.length -1) { return Q(true); }
  var selectedModel = selectedModels[idx];
  return selectedModel.qSave({"isBlock" : true}).then(function(result) {
    return blockContactsQ(idx+ 1);
  }).fail(function(result) {
    return blockContactsQ(idx+ 1);
  });
}

function hiddenContactQ(idx) {
  Ti.API.debug("hiddenContactQ function idx : ", idx);
  if (idx > selectedModels.length -1) { return Q(true); }
  var selectedModel = selectedModels[idx];
  return selectedModel.qSave({"isHidden" : true}).then(function(result) {
    return hiddenContactQ(idx+ 1);
  }).fail(function(result) {
    return hiddenContactQ(idx+ 1);
  });
}
