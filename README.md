rfid-sl018
==========

Node.js module for a Raspberry Pi to talk to an SL018 RFID reader

Because of how the library accesses the i2c bus, it needs to be run as root.  The default baud rate used to talk to the i2c bus also seems to produce unreliable results with the SL018 hardware.  If you're seeing the "Check modprobe baud rate" message then you should run the following commands before using this module:

    sudo modprobe -r i2c-bcm2708
    sudo modprobe i2c-bcm2708 baudrate=200000


