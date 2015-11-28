/*

********************************************************************************

Firebase iOS Module for Titanium

Released by Left Lane Lab, LLC

********************************************************************************

This module is constructed to mimic the official Firebase JavaScript Library.

All functions available with the official Firebase library are also available
on this module. All methods take the same arguments and return the same values.

Online Documentation: http://firebase.leftlanelab.com

*******************************************************************************/

// Load the Module
var Firebase = require('com.leftlanelab.firebase');

// Create a [Users] reference from your Firebase
var Users = Firebase.new('https://l3-appcelerator-demo.firebaseio.com/users');

// Open a [Users] Window with a [User] Label
var winUsers = Ti.UI.createWindow({backgroundColor:'white'});
var lblUser = Ti.UI.createLabel();
winUsers.add(lblUser);
winUsers.open();

// Add a Listener to the [Users] reference
Users.on('child_added', function (snapshot)
{
	// Update the [User] label
	lblUser.text = "Hello, " + snapshot.val().name;
});
