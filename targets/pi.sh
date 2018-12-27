#!/bin/sh
[ ! -d "out" ] && rm -rf out
[ ! -d "rootfs" ] && rm -rf rootfs
mkdir out
mkdir rootfs
fallocate -l 3G "out/bluelight-$VERSION-pi.img"
LOOP=$(sudo losetup --find --show "out/bluelight-$VERSION-pi.img")
parted --script $LOOP mklabel msdos
parted --script $LOOP mkpart primary fat32 0% 100M
parted --script $LOOP mkpart primary ext4 100M 100%
mkfs.vfat -F32 ${LOOP}p1
mkfs.ext4 -F ${LOOP}p2
mount ${LOOP}p2 rootfs
mkdir rootfs/boot
mount ${LOOP}p1 rootfs/boot
wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-$REV-latest.tar.gz
tar -xpf "ArchLinuxARM-rpi-$REV-latest.tar.gz" -C rootfs
rm "ArchLinuxARM-rpi-$REV-latest.tar.gz"
mv rootfs/etc/resolv.conf rootfs/etc/resolv.conf.bak
cp /etc/resolv.conf rootfs/etc/resolv.conf
cp /usr/bin/qemu-arm-static rootfs/usr/bin/
#mount -t proc none rootfs/proc
#mount -t sysfs none rootfs/sys
#mount -o bind /dev rootfs/dev
cat helpers/chroot.sh | arch-chroot rootfs /usr/bin/bash
#umount rootfs/proc
#umount rootfs/sys
#umount rootfs/dev
rm rootfs/etc/resolv.conf
mv rootfs/etc/resolv.conf.bak rootfs/etc/resolv.conf
rm rootfs/usr/bin/qemu-arm-static
umount rootfs/boot
umount rootfs
losetup --detach "$LOOP"
