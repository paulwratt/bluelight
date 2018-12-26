source config.sh
mkdir out
mkdir rootfs
fallocate -l 2G "out/bluelight-$VERSION-pi.img"
LOOP=$(sudo losetup --find --show "out/bluelight-$VERSION-pi.img")
parted --script $LOOP mklabel msdos
parted --script $LOOP mkpart primary fat32 0% 100M
parted --script $LOOP mkpart primary ext4 100M 100%
mkfs.vfat -F32 ${LOOP}p1
mkfs.ext4 -F ${LOOP}p2
mount ${LOOP}p2 rootfs
mkdir rootfs/boot
mount ${LOOP}p1 rootfs/boot
if [ $REV -eq 2 ]; then
  wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-2-latest.tar.gz
  tar -xpf "ArchLinuxARM-rpi-2-latest.tar.gz" -C mnt
  rm "ArchLinuxARM-rpi-2-latest.tar.gz"
else;
  wget http://archlinuxarm.org/os/ArchLinuxARM-rpi-1-latest.tar.gz
  tar -xpf "ArchLinuxARM-rpi-1-latest.tar.gz" -C mnt
  rm "ArchLinuxARM-rpi-1-latest.tar.gz"
fi;
cp /etc/resolv.conf rootfs/etc/resolv.conf
cp /usr/bin/qemu-arm-static rootfs/usr/bin/
mount -t proc none rootfs/proc
mount -t sysfs none rotfs/sys
mount -o bind /dev rootfs/dev
cat chroot.sh | chroot rootfs
umount rootfs/proc
umount rootfs/sys
umount rootfs/dev
rm rootfs/etc/resolv.conf
rm rootfs/usr/bin/qemu-arm-static
umount rootfs/boot
umount rootfs
losetup --detach "$LOOP"
