#!/bin/bash

set -e -u

sed -i 's/#\(en_US\.UTF-8\)/\1/' /etc/locale.gen
locale-gen

ln -sf /usr/share/zoneinfo/UTC /etc/localtime

usermod -s /usr/bin/zsh root
cp -aT /etc/skel/ /root/
chmod 700 /root

groupadd osjs
useradd osjs -p `openssl passwd -1 osjs` -d /home/osjs -g osjs -G network,wheel,users,power
useradd demo -p `openssl passwd -1 osjs` -d /home/demo -g osjs

sed -i 's/#\(PermitRootLogin \).\+/\1yes/' /etc/ssh/sshd_config
sed -i "s/#Server/Server/g" /etc/pacman.d/mirrorlist
sed -i 's/#\(Storage=\)auto/\1volatile/' /etc/systemd/journald.conf

sed -i 's/#\(HandleSuspendKey=\)suspend/\1ignore/' /etc/systemd/logind.conf
sed -i 's/#\(HandleHibernateKey=\)hibernate/\1ignore/' /etc/systemd/logind.conf
sed -i 's/#\(HandleLidSwitch=\)suspend/\1ignore/' /etc/systemd/logind.conf

systemctl enable pacman-init.service choose-mirror.service sshd.service NetworkManager.service autofs.service
systemctl set-default multi-user.target

chown root:root /etc/sudoers
git clone -b v3 --single-branch https://github.com/BlueLightOS/OS.js.git /opt/os.js
chown osjs:osjs /opt/os.js -R
cd /opt/os.js
sudo npm install --save --unsafe-perm=true --allow-root
chown osjs:osjs /opt/os.js -R
su -c "npm run package:discover"
npm run build
chown osjs:osjs /opt/os.js -R
