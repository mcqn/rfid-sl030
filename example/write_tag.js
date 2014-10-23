// Simple test program to show writing to a tag with the rfid-sl030 module
// (c) Copyright 2014 MCQN Ltd
//
// Looks for a tag, then reads out the contents of block 2, overwrites them
// with "Hello world!", and then re-reads the contents to check that the
// write succeeded.
//
// See README.md for more details.
// Usage:
//    sudo node write_tag.js

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

    // Block we're going to write to.
    // NOTE: It seems the authentication key is stored in the last block
    // NOTE: of each sector (so blocks 3, 7, 11, etc.)  If you overwrite
    // NOTE: that block then you won't be able to read/write any of those
    // NOTE: sector's blocks again (until you write a new authenticate()
    // NOTE: method that takes a key, and provide the right key :-)
    var block = 2;

    // Need to authenticate first
    if (rfid.authenticate(rfid.sectorForBlock(block))) {
        console.log("Block contents beforehand:");
        console.log(rfid.readBlock(block));

        // Build up the data we want to write into the block
        // Blocks on MiFare 1K tags are 16 bytes long
        var data = new Buffer(16);
        data.fill(0);
        data.write("Hello world!");
        // Now write the data to the tag
        console.log(rfid.writeBlock(block, data));
        console.log("Block contents afterwards:");
        console.log(rfid.readBlock(block));
    } else {
        console.log("Failed to authenticate");
    }
} else {
    console.log("Couldn't read tag");
}

