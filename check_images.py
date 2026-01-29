
import os

files = [
    r"c:\Users\lead\Desktop\my-fellow\assets\images\leaders\leader4.png",
    r"c:\Users\lead\Desktop\my-fellow\assets\images\leaders\leader5.png",
    r"c:\Users\lead\Desktop\my-fellow\assets\images\programs\bss.png"
]

for f in files:
    if os.path.exists(f):
        with open(f, "rb") as fd:
            header = fd.read(8)
            print(f"{f}: {header.hex().upper()}")
    else:
        print(f"{f}: NOT FOUND")
