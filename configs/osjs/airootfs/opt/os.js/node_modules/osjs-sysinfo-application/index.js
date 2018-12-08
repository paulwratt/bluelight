import osjs from "osjs";
import {name as applicationName} from "./metadata.json";

const strftime = require("strftime");

import {
	h,
	app
} from "hyperapp";

import {
	Box,BoxContainer,Button,Icon,Menubar,MenubarItem,Video
} from "@osjs/gui";

const batteryIcon = (percent,ischarging) => {
	if(percent == 100 && ischarging) return "battery-full-charged";
	if(percent >= 90 && ischarging) return "battery-full-charging";
	if(percent >= 90) return "battery-full";
	
	if(percent >= 70 && ischarging) return "battery-good-charging";
	if(percent >= 70) return "battery-good";
	
	if(percent >= 40 && ischarging) return "battery-low-charging";
	if(percent >= 40) return "battery-low";
	
	if(percent >= 20 && ischarging) return "battery-caution-charging";
	if(percent >= 20) return "battery-caution";
	
	if(percent == 0) return "battery-empty";
	return "battery";
};

const createBatteryDetailsDialog = (core,_) => {
	const hw = core.make("hw");
	core.make("osjs/dialogs").create({
		buttons: ["close"],
		window: { title: _("DIALOG_BATTERY_TITLE"), dimension: { width: 200, height: 400 }, icon: core.make("osjs/theme").icon("battery") }
	},dialog => null,(btn,value,dialog) => {}).render(async ($content,dialogWindow,dialog) => {
		dialog.app = app({
			battery: await hw.battery.get()
		},{},(state,actions) => dialog.createView([
			h(Box,{ grow: 1, padding: false },[
				h(BoxContainer,{},"hasbattery: "+state.battery.hasbattery),
				h(BoxContainer,{},"cyclecount: "+state.battery.cyclecount),
				h(BoxContainer,{},"maxcapacity: "+state.battery.maxcapacity),
				h(BoxContainer,{},"currentcapacity: "+state.battery.currentcapacity),
				h(BoxContainer,{},"percent: "+state.battery.percent),
				h(BoxContainer,{},"timeremaining: "+state.battery.timeremaining),
				h(BoxContainer,{},"acconnected: "+state.battery.acconnected),
				h(BoxContainer,{},"type: "+state.battery.type),
				h(BoxContainer,{},"model: "+state.battery.model),
				h(BoxContainer,{},"manufacturer: "+state.battery.manufacturer),
				h(BoxContainer,{},"serial: "+state.battery.serial)
			])
		]),$content);
		dialogWindow.on("dialog:button",() => dialog.destroy());
	});
};

const register = (core,args,options,metadata) => {
	const proc = core.make("osjs/application",{args,options,metadata});
	const {translatable} = core.make("osjs/locale");
	const _ = translatable(require("./locales.js"));
	try {
		const hw = core.make("hw");
		var intervals = [];
		hw.battery.get().then(bat => {
			if(bat.hasbattery) {
				var entry = core.make("osjs/tray",{
					title: _("ITEM_BATTERY_CHARGE",bat.percent),
					icon: core.make("osjs/theme").icon(batteryIcon(bat.percent,bat.ischarging)),
					onclick: async ev => {
						const battery = await hw.battery.get();
						core.make("osjs/contextmenu").show({
							position: ev.target,
							menu: [
								{ label: _("ITEM_BATTERY_CHARGE",battery.percent) },
								{ label: _("ITEM_BATTERY_TIME",strftime("%H:%M",new Date(battery.timeremaining*1000))) },
								{ label: _("ITEM_BATTERY_DETAILS"), onclick: () => createBatteryDetailsDialog(core,_) }
							]
						});
					}
				});
				intervals.push(setInterval(async () => {
					const battery = await hw.battery.get();
					if(battery.percent <= 20) {
						core.make("osjs/notification",{
							message: _("NOTIF_BATTERY_LOW"),
							icon: core.make("osjs/theme").icon(batteryIcon(battery.percent,battery.ischarging))
						});
					}
					entry.update({
						title: _("ITEM_BATTERY_CHARGE",battery.percent),
						icon: core.make("osjs/theme").icon(batteryIcon(battery.percent,battery.ischarging))
					});
				},1000));
				proc.on("destroy",() => entry.destroy());
			}
		}).catch(err => {
			throw err;
		});
		proc.on("destroy",() => {
			for(var int of intervals) clearInterval(int);
		});
	} catch(ex) {
		core.make("osjs/dialog","alert",{ message: ex.message, title: ex.name },(btn, value) => {});
	}
	return proc;
};
osjs.register(applicationName,register);
