
import os
import glob

def check_file(f):
    try:
        with open(f, "rb") as fd:
            header = fd.read(8)
            return header.hex().upper()
    except Exception as e:
        return str(e)

path = r"c:\Users\lead\Desktop\my-fellow\assets\images"
for root, dirs, files in os.walk(path):
    for f in files:
        if f.endswith(".png"):
            fullpath = os.path.join(root, f)
            header = check_file(fullpath)
            print(f"{fullpath} | {header}")
