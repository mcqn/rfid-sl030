# rfid-sl030

Node.js module for a Raspberry Pi to talk to an SL030 RFID reader

Because of how the library accesses the i2c bus, it needs to be run as root.  The default baud rate used to talk to the i2c bus also seems to produce unreliable results with the SL030 hardware.  If you're seeing the "Check modprobe baud rate" message then you should run the following commands before using this module:

    sudo modprobe -r i2c-bcm2708
    sudo modprobe i2c-bcm2708 baudrate=200000

## Creating libbcm2835.so

1. Download and build [Mike McCauley's libbcm2835 library](http://www.airspayce.com/mikem/bcm2835/)
1. By default that creates a src/libbcm2835.a, whereas we want a .so.  To create that, run this in the bcm2835-1.50 directory:
    gcc -shared -o src/libbcm2835.so -fPIC src/bcm2835.c

