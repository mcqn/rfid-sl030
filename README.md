# rfid-sl030

Node.js module for a Raspberry Pi to talk to an SL030 RFID reader

Because of how the library accesses the i2c bus, it needs to be run as root.  The default baud rate used to talk to the i2c bus also seems to produce unreliable results with the SL030 hardware.  If you're seeing the "Check modprobe baud rate" message then you should run the following commands before using this module:

    sudo modprobe -r i2c-bcm2708
    sudo modprobe i2c-bcm2708 baudrate=200000

## Raspberry Pi 1 Users

If you're running on a Raspberry Pi 1 or a Pi Zero you'll need to change the version of libbcm2835.so that you're using.  In the ```lib/``` folder, rename the current libbcm2835.so to libbcm2835.so.rp2 and then rename the current libbcm2835.so.rp1 to libbcm2835.so

