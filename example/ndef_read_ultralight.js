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
var ndef = require('ndef');

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
    console.log(tag);

    var sector = null;
    var authenticated = false;
    var block = 4;
    var data = null;
    var ndefdata = [];
    do {
        data = rfid.readPage(block);
        ndefdata.push(data);
        block++;
    } while (data != null);
    // We'll always end with a "null" last entry in ndefdata, so remove it
    ndefdata.pop();
    console.log(ndefdata);
    console.log(Buffer.concat(ndefdata));
                            var rawNDEF = Buffer.concat(ndefdata);
                            var idx = 0;
                            var ndefRecords = [];
                            while (idx < rawNDEF.length) {
                                // Look for the initial TLV structure
                                var t = rawNDEF[idx++];
                                if (t != 0) {
                                    // It's not a NULL TLV, see how long it is
                                    var l = rawNDEF[idx++];
                                    if (l == 0xFF) {
                                        // 3-byte length format, the next two 
                                        // bytes give our length
                                        l = rawNDEF[idx++] << 8 | rawNEF[idx++];
                                    }
                                    if (t == 0x03) {
                                        console.log("Found NDEF message");
                                        var message = [];
                                        while (l-- > 0) {
                                            message.push(rawNDEF[idx++]);
                                        }
                                        ndefRecords = ndefRecords.concat(ndef.decodeMessage(message));   
                                    } else if (t == 0xFE) {
                                        // Terminator TLV block, so give up now
                                        console.log("Found terminator block");
                                        break;
                                    } else {
                                        // Skip over l bytes to get to the next TLV
                                        console.log("Skipping "+t.toString(16)+" block, length "+l+" bytes");
                                        idx += l;
                                    }
                                } else {
                                    console.log("NULL TLV");
                                }
                            }
                            //console.log(ndefRecords);
                            for (i = 0; i < ndefRecords.length; i++) {
                                //var msg = {topic:"pi/rfid-ndef", payload:ndefRecords[i], ndef: ndefRecords[i]};
                                var msg = {};
                                msg.topic="pi/rfid-ndef";
                                msg.payload=ndefRecords[i];
                                msg.ndef= ndefRecords[i];
                                console.log(msg);
                            }
} else {
    console.log("Couldn't read tag");
}

