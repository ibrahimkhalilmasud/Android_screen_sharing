# Android_screen_sharing


Step 1:

You need to install scoop

use this commmend inside you windows power shell.
or follow this link (official link)

https://scoop.sh/

*****************************************************
Invoke-Expression (New-Object System.Net.WebClient).DownloadString('https://get.scoop.sh')

# or shorter

iwr -useb get.scoop.sh | iex

*****************************************************

inside here

	C:\Users\(UserName)\scoop
	
Noted if the folder dosent exsit create one inside
your user Name it scoop.


Step 2:

Now Install the video share part (https://github.com/Genymobile/scrcpy/)

create scrcpy as a new inside C:\
 
 
 
For sharing screen we need to install scrcpy

Try to install this script from the link below


#### this is why we need to install scoop

*****************************************************
scoop install scrcpy
scoop install adb    # if you don't have it yet
*****************************************************

	
It is also available in Chocolatey (https://chocolatey.org/):

## Install with cmd.exe
Run the following command:
*****************************************************
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"


## Install with powershell.exe

Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))

choco install scrcpy
choco install adb    # if you don't have it yet


*****************************************************
Run
Plug an Android device, and execute:

scrcpy

or use this 

scrcpy -s <serial>

hit enter

It accepts command-line arguments, listed by:

scrcpy --help
*****************************************************


Step 3: 

Now lets get the audio part

for that we need to install ****sndcpy****

*****************************************************
Create a folder

C:\sndcpy
*****************************************************

Donwload this and extract

https://github.com/rom1v/sndcpy

Now send the APK file you your android device


Step 4:

Requirements

## The Android device requires at least Android 10.
## VLC must be installed on the computer.


use this in the terminal to find your device 

If several devices are connected (listed by adb devices):
adb devices


Plug an Android 10 device with USB debugging enabled, and execute:
*****************************************************
cd .\sndcpy\
*****************************************************
noted use this commend do inside the folder

*****************************************************
cd .. (use this commend in terminal you go back to the root folder) 

*****************************************************
./sndcpy


./sndcpy <serial>  # replace <serial> by the device serial
*****************************************************
Or

sndcpy -s <serial>



