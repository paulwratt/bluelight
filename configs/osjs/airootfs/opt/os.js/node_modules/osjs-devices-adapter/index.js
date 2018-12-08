const fs = require("fs-extra");
const path = require("path");
const si = require("systeminformation");

const DEFAULT_VFS_ATTRS = {
	exclude: []
};

const devfsPathObj = pq => {
	var mount = pq.substring(0,pq.indexOf(":/"));
	if(mount.endsWith("/")) mount = mount.substring(0,mount.length-1);
	pq = pq.replace(mount+":/","");
	var devname = pq.split("/")[0];
	var p = pq.replace(devname,"");
	return { mount, p, devname };
};

module.exports = core => ({
	readdir: vfs => location => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) {
				var dirs = [];
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var stats = fs.statSync(blockdev.mount);
						dirs.push({
							isDirectory: true,
							isFile: false,
							path: mount+":/"+label,
							filename: label,
							size: stats.size,
							stat: stats,
							mime: null,
							icon: blockdev.removable ? "/icons/GnomeIcons/icons/drive-removable-media.png" : "/icons/GnomeIcons/icons/drive-harddisk.png"
						});
					}
				}
				return resolve(dirs);
			} else {
				if(!p.endsWith("/")) p += "/";
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var pth = path.join(blockdev.mount,p);
						var dirs = [];
						for(var c of fs.readdirSync(pth)) {
							if(c == "..") continue;
							var loc = mount+":/"+devname+p+c;
							var phys = path.join(pth,c);
							var stats = fs.statSync(phys);
							if(stats.isDirectory()) loc += "/";
							dirs.push({
								isDirectory: stats.isDirectory(),
								isFile: stats.isFile(),
								mime: stats.isFile() ? core.make("osjs/vfs").mime(phys) : null,
								path: loc,
								filename: loc.split("/")[loc.split("/").length-1].length > 0 ? loc.split("/")[loc.split("/").length-1] : loc.split("/")[loc.split("/").length-2],
								size: stats.size,
								stat: stats
							});
						}
						return resolve(dirs);
					}
				}
				reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	readfile: vfs => (location,options={}) => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			for(var blockdev of blockdevs) {
				var label = blockdev.label.length > 0 ? blockdev.label
					: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
				if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
					var pth = path.join(blockdev.mount,p);
					return resolve(fs.createReadStream(pth,{ flags: "r" }));
				}
			}
			reject(new Error("Mount point not found"));
		}).catch(err => reject(err));
	}),
	exists: vfs => location => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		si.blockDevices().then(blockdevs => {
			var { mount, p, devname } = devfsPathObj(location);
			if(devname.length == 0) return resolve(true);
			else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						return resolve(fs.access(path.join(blockdev.mount,p),fs.F_OK));
					}
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	stat: vfs => location =>  new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) {
			} else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var pth = path.join(blockdev.mount,p);
						var loc = mount+":/"+devname+p;
						var stats = fs.statSync(pth);
						if(stats.isDirectory()) loc += "/";
						return resolve({
								isDirectory: stats.isDirectory(),
								isFile: stats.isFile(),
								mime: stats.isFile() ? core.make("osjs/vfs").mime(phys) : null,
								path: loc,
								filename: loc.split("/")[loc.split("/").length-1].length > 0 ? loc.split("/")[loc.split("/").length-1] : loc.split("/")[loc.split("/").length-2],
								size: stats.size,
								stat: stats
						});
					}
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	mkdir: vfs => location => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var pth = path.join(blockdev.mount,p);
						var loc = mount+":/"+devname+p;
						return resolve(fs.mkdirSync(pth));
					}
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	writefile: vfs => (location,data) => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var pth = path.join(blockdev.mount,p);
						var loc = mount+":/"+devname+p;
						var stat = fs.statSync(pth);
						if(stat.isDirectory()) return resolve(false);
						const stream = fs.createWriteStream(pth);
						data.on("error",err => reject(err));
						data.on("end",() => resolve(true));
						return data.pipe(stream);
					}
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	rename: vfs => (src,dest) => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var source = devfsPathObj(src);
		var dest = devfsPathObj(src);
		si.blockDevices().then(blockdevs => {
			if(source.devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				var sourceBlockdev = null;
				var destBlockdev = null;
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						if(label == source.devname) sourceBlockdev = blockdev;
						if(label == dest.devname) destBlockdev = blockdev;
					}
				}
				if(sourceBlockdev != null && destBlockdev != null) {
					var sourcePth = path.join(sourceBlockdev.mount,source.p);
					var destPth = path.join(destBlockdev.mount,dest.p);
					return resolve(fs.renameSync(sourcePth,destPth));
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	copy: vfs => (src,dest) => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var source = devfsPathObj(src);
		var dest = devfsPathObj(src);
		si.blockDevices().then(blockdevs => {
			if(source.devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				var sourceBlockdev = null;
				var destBlockdev = null;
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						if(label == source.devname) sourceBlockdev = blockdev;
						if(label == dest.devname) destBlockdev = blockdev;
					}
				}
				if(sourceBlockdev != null && destBlockdev != null) {
					var sourcePth = path.join(sourceBlockdev.mount,source.p);
					var destPth = path.join(destBlockdev.mount,dest.p);
					return resolve(fs.copySync(sourcePth,destPth));
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	unlink: vfs => location => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						var pth = path.join(blockdev.mount,p);
						var loc = mount+":/"+devname+p;
						return resolve(fs.removeSync(pth));
					}
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	}),
	search: vfs => (root,pattern) => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(root);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) {
				var found = [];
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) {
						pattern = pattern.split("*").join("");
						if((new RegExp(pattern)).test(label) == false) continue;
						var stats = fs.statSync(blockdev.mount);
						found.push({
							isDirectory: true,
							isFile: false,
							path: mount+":/"+label,
							filename: label,
							size: stats.size,
							stat: stats,
							mime: null,
							icon: blockdev.removable ? "/icons/GnomeIcons/icons/drive-removable-media.png" : "/icons/GnomeIcons/icons/drive-harddisk.png"
						});
					}
				}
				resolve(found);
			} else return reject(new Error("Unsupported search in drive"));
		}).catch(err => reject(err));
	}),
	touch: vfs => location => new Promise((resolve,reject) => {
		var attrs = Object.assign(DEFAULT_VFS_ATTRS,vfs.mount.attributes);
		var { mount, p, devname } = devfsPathObj(location);
		si.blockDevices().then(blockdevs => {
			if(devname.length == 0) reject(new Error("Cannot write in root"));
			else {
				for(var blockdev of blockdevs) {
					var label = blockdev.label.length > 0 ? blockdev.label
						: (blockdev.model.length > 0 ? blockdev.model : blockdev.name);
					if(blockdev.mount.length > 0 && label == devname && (attrs.exclude.indexOf(blockdev.name) == -1 || attrs.exclude.indexOf(label) == -1)) return resolve(fs.ensureFile(path.join(blockdev.mount,p)));
				}
				return reject(new Error("Mount point not found"));
			}
		}).catch(err => reject(err));
	})
});
