
var ffi = require('ffi');
var ref = require('ref');
var struct = require('ref-struct');
var sleep = require('sleep');
var path = require('path');

// We have the libbcm2835.so file in the same directory as this file
var libbcm2835 = ffi.Library(path.dirname(module.filename)+'/libbcm2835.so', {
    'bcm2835_init': ['uint8', [] ],
    'bcm2835_close': ['uint8', [] ],
    // SPI functions
    'bcm2835_spi_begin': ['uint8', [] ],
    'bcm2835_spi_end': ['uint8', [] ],
    'bcm2835_spi_transfer': ['uint8', ['uint8'] ],
    'bcm2835_spi_transfernb': ['void', ['pointer', 'pointer', 'uint'] ],
    'bcm2835_spi_setClockDivider': ['void', ['uint8'] ],
    'bcm2835_spi_setBitOrder': ['void', ['uint8'] ],
    'bcm2835_spi_chipSelect': ['void', ['uint8'] ],
    'bcm2835_spi_setDataMode': ['void', ['uint8'] ],
    'bcm2835_spi_setChipSelectPolarity': ['void', ['uint8', 'uint8'] ],
    // I2C functions
    'bcm2835_i2c_begin': ['void', [] ],
    'bcm2835_i2c_end': ['void', [] ],
    'bcm2835_i2c_setSlaveAddress': ['void', ['uint8'] ],
    'bcm2835_i2c_setClockDivider': ['void', ['uint16'] ],
    'bcm2835_i2c_set_baudrate': ['void', ['uint32'] ],
    'bcm2835_i2c_write': ['uint8', ['pointer', 'uint32'] ],
    'bcm2835_i2c_read': ['uint8', ['pointer', 'uint32'] ],
    'bcm2835_i2c_read_register_rs': ['uint8', ['pointer', 'pointer', 'uint32'] ],
    'bcm2835_i2c_write_read_rs': ['uint8', ['pointer', 'uint32', 'pointer', 'uint32'] ]
});

function RFID_SL018() {
    this.kCardTypeNames = [ 'Mifare 1K', 'Mifare Pro', 'Mifare Ultralight', 'Mifare 4K', 'Mifare ProX', 'Mifare DesFire'];
    // RFID card types
    this.kMifare1K = 0x01;
    this.kMifarePro = 0x02;
    this.kMifareUltralight = 0x03;
    this.kMifare4K = 0x04;
    this.kMifareProX = 0x05;
    this.kMifareDesFire = 0x06;
    // Command constants
    this.kCmdIdle = 0x00;
    this.kCmdSelect = 0x01;
    this.kCmdLogin = 0x02;
    this.kCmdRead16 = 0x03;
    this.kCmdWrite16 = 0x04;
    this.kCmdReadValue = 0x05;
    this.kCmdWriteValue = 0x06;
    this.kCmdWriteKey = 0x07;
    this.kCmdIncValue = 0x08;
    this.kCmdDecValue = 0x09;
    this.kCmdCopyValue = 0x0A;
    this.kCmdRead4 = 0x10;
    this.kCmdWrite4 = 0x11;
    this.kCmdSeek = 0x20;
    this.kCmdSetLED = 0x40;
    this.kCmdSleep = 0x50;
    this.kCmdReset = 0xFF;
    // Various packet offsets
    this.kResponseOffsetLength = 0;
    this.kResponseOffsetCommand = 1;
    this.kResponseOffsetStatus = 2;
    this.kResponseOffsetData = 3;
    // Variables
    this.libbcm2835 = null; // To access the Pi's i2c bus
}
exports.RFID_SL018 = RFID_SL018;

RFID_SL018.prototype.init = function() {
    this.libbcm2835 = libbcm2835;
    this.libbcm2835.bcm2835_init();
    this.libbcm2835.bcm2835_i2c_begin();
    this.libbcm2835.bcm2835_i2c_setSlaveAddress(0x50); // FIXME Magic number
}

RFID_SL018.prototype.sendCommand = function(aCommandCode) {
    var cmd = new Buffer(2);
    cmd[0] = 0x01; // length of the command
    cmd[1] = aCommandCode;
    //console.log("Writing command "+aCommandCode);
    return this.libbcm2835.bcm2835_i2c_write(cmd, cmd.length);
}

RFID_SL018.prototype.selectTag = function() {
    this.sendCommand(this.kCmdSelect);
    sleep.usleep(50000);
    // We'll get an 11 byte response to this
    var respHeader = struct({
        len: ref.types.byte,
        command: ref.types.byte,
        status: ref.types.byte
    });
    var resp = new Buffer(11);
    var ret = (this.libbcm2835.bcm2835_i2c_read(resp, resp.length));
    if (ret == 0) {
        // Successfully read a tag
        var hdr = respHeader(resp.slice(0,3));
        //console.log("Read:");
        //console.log("- len: "+hdr.len);
        //console.log("- cmd: "+hdr.command);
        //console.log("- status: "+hdr.status);
        if (hdr.len > 2) {
            var uid;
            var cardType;
            if (hdr.len == 10) {
                // 7 byte UID
                uid = resp.slice(3,10)
                cardType = this.kCardTypeNames[resp[10]-1];
            } else if (hdr.len == 7) {
                // 4 byte UID
                uid = resp.slice(3,7);
                cardType = this.kCardTypeNames[resp[7]-1];
            }
            var uidString = "0x";
            for (i = 0; i < uid.length; i++) {
                if (uid[i] < 0x10) {
                    uidString += "0";
                }
                uidString += uid[i].toString(16);
            }
            return { tagID: uid, tagIDString: uidString, tagType: cardType };
        }
        // else we didn't find a tag
    } else {
        console.log("read failed");
    }
    return null;
}

RFID_SL018.prototype.authenticate = function(aBlock) {
    var cmd = new Buffer(10);
    cmd[0] = 9;
    cmd[1] = this.kCmdLogin;
    cmd[2] = aBlock;
    cmd[3] = 0xAA;
    cmd.fill(0xFF, 4);
}

RFID_SL018.prototype.readBlock = function(aBlock) {
}

