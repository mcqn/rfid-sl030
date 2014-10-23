// Simple test program to show reading from a tag with the rfid-sl030 module
// (c) Copyright 2014 MCQN Ltd
//
// Tries to read a tag.  If one is detected, it prints out some basic
// details about the tag and then reads each block and outputs its contents.
//
// See README.md for more details.
// Usage:
//    sudo node read_tag.js

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

    var sector = null;
    var authenticated = false;
    for (var block = 0; block < 64; block++) {
        if (sector != rfid.sectorForBlock(block)) {
            // You need to authenticate with the sector before
            // you can access the blocks in it
            sector = rfid.sectorForBlock(block);
            if (rfid.authenticate(sector)) {
                authenticated = true;
            } else {
                authenticated = false;
                console.log("Failed to authenticate");
            }
        }
        if (authenticated) {
            console.log("Sector "+sector+" Block "+block+": "+rfid.readBlock(block).inspect());
        }
    }
} else {
    console.log("Couldn't read tag");
}

