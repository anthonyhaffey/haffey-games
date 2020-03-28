import serial
import eel

# Set web files folder and optionally specify which file types to check for eel.expose()
#   *Default allowed_extensions are: ['.js', '.html', '.txt', '.htm', '.xhtml']
eel.init('web', allowed_extensions=['.js', '.html'])

#eel.say_hello_js("hi")

ser = serial.Serial("COM3",9600)
print("hi")

def my_other_thread():
    while True:
        eel.sleep(.001)

        cc = str(ser.readline())
        heart_val = cc[2:][:-5]
        print(heart_val)
        try:
            eel.clean_heart_val(heart_val)
        except:
            print("it would have crashed here")

eel.spawn(my_other_thread)


eel.start('psychophys.html',block=False)


while True:
    eel.sleep(1.0)