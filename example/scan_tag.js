// Simple test program to show use of the rfid-sl030 module
// (c) Copyright 2014 MCQN Ltd
//
// Tries to read a tag.  If one is detected, it prints out some basic
// details about the tag.
//
// See README.md for more details.
// Usage:
//    sudo node scan_tag.js

var rfid_sl030 = require('rfid-sl030');

// Create and initialise a reader
var rfid = new rfid_sl030.RFID_SL030();
rfid.init();

// Try to find a tag
var tag = rfid.selectTag();

if (tag) {
    console.log("Got tag:");
    console.log("- UID: "+tag.tagID.inspect());
    console.log("- UID string: "+tag.tagIDString);
    console.log("- Type: "+tag.tagType);
} else {
    console.log("Couldn't read tag");
}

