echo "bluelight" >> /etc/hostname
cat << EOF > /etc/hosts
127.0.0.1 localhost
::1 localhost
127.0.1.1 bluelight.localdomain bluelight
EOF
pacman-key --init
pacman-key --populate archlinuxarm
pacman -Syu --noconfirm
pacman -S --noconfirm git nodejs npm git xorg-xinit xorg-server xorg-xdpyinfo xorg-xprop python2 make gcc pulseaudio pulseaudio-alsa openssh networkmanager autofs sudo mtools zsh jq ttf-dejavu sox wget ca-certificates ca-certificates-utils
update-ca-trust
npm install -g electron
wget -O /usr/lib/os-release https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/usr/lib/os-release
wget -O /opt/launcher.js https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/opt/launcher.js
wget -O /etc/autofs/auto.misc https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/autofs/auto.misc
wget -O /etc/sudoers https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/sudoers
wget -O /etc/X11/xinit/xinitrc https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/X11/xinit/xinitrc
wget -O /etc/pam.d/system-auth https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/pam.d/system-auth
wget -O /etc/login.group.allowed https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/login.group.allowed
mkdir -p /etc/systemd/scripts
mkdir /etc/systemd/system/getty@tty1.service.d
wget -O /etc/systemd/scripts/choose-mirror https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/systemd/scripts/choose-mirror
wget -O /etc/systemd/system/pacman-init.service https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/systemd/system/pacman-init.service
wget -O /etc/systemd/system/choose-mirror.service https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/systemd/system/choose-mirror.service
wget -O /etc/systemd/system/getty@tty1.service.d/autologin.conf https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/systemd/system/getty@tty1.service.d/autologin.conf
wget -O /etc/polkit-1/rules.d/50-org.freedesktop.NetworkManager.rules https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/polkit-1/rules.d/50-org.freedesktop.NetworkManager.rules
mkdir -p /etc/skel
touch /etc/skel/.Xauthority
wget -O /etc/skel/.bash_profile https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/skel/.bash_profile
wget -O /etc/skel/.zprofile https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/etc/skel/.zprofile
wget -O- https://raw.githubusercontent.com/BlueLightOS/bluelight/master/configs/bluelight/airootfs/root/customize_airootfs.sh | sudo bash
cp /etc/skel -r /home/osjs
chown osjs:osjs -R /home/osjs
echo "osjs" | su osjs -c "cd /opt/os.js && npm remove osjs-bluelight-installer-application && npm run package:discover"
