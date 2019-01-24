#!/bin/bash

set -e -u

sed -i 's/#\(en_US\.UTF-8\)/\1/' /etc/locale.gen
locale-gen

ln -sf /usr/share/zoneinfo/UTC /etc/localtime

usermod -s /usr/bin/zsh root
cp -aT /etc/skel/ /root/
cp -aT /etc/skel/ /home/demo/
cp -aT /etc/skel/ /home/osjs/
chmod 700 /root

groupadd osjs
useradd osjs -p `openssl passwd -1 osjs` -d /home/osjs -g osjs -G network,wheel,users,power,input
useradd demo -p `openssl passwd -1 osjs` -d /home/demo -g osjs

chown demo:osjs -R /home/demo
chown osjs:osjs -R /home/demo

sed -i 's/#\(PermitRootLogin \).\+/\1yes/' /etc/ssh/sshd_config
sed -i "s/#Server/Server/g" /etc/pacman.d/mirrorlist
sed -i 's/#\(Storage=\)auto/\1volatile/' /etc/systemd/journald.conf

sed -i 's/#\(HandleSuspendKey=\)suspend/\1ignore/' /etc/systemd/logind.conf
sed -i 's/#\(HandleHibernateKey=\)hibernate/\1ignore/' /etc/systemd/logind.conf
sed -i 's/#\(HandleLidSwitch=\)suspend/\1ignore/' /etc/systemd/logind.conf

systemctl enable pacman-init.service choose-mirror.service sshd.service NetworkManager.service autofs.service bluetooth.service xorg.service
systemctl set-default multi-user.target

sed -i '2d' /etc/sudoers
chown root:root /etc/sudoers

cd /opt/os.js && npm run build
chown osjs:osjs /opt/os.js -R
