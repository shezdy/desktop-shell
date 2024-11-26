import { App, Astal } from "astal/gtk3";
import { Gdk, Widget } from "../imports.js";
import PopupWindow, { closePopupWindow } from "./PopupWindow.js";

const WINDOW_NAME = "confirm";

let action = () => {};

export function ConfirmAction(fun) {
  action = fun;
  App.get_window("confirm").visible = true;
}

export default () =>
  PopupWindow({
    name: WINDOW_NAME,
    layer: Astal.Layer.OVERLAY,
    exclusivity: Astal.Exclusivity.IGNORE,
    keymode: Astal.Keymode.ON_DEMAND,
    child: Widget.Box({
      vertical: true,
      className: "confirm",
      children: [
        Widget.Box({
          className: "text-box",
          vertical: true,
          children: [
            Widget.Label({
              className: "desc",
              label: "Are you sure?",
            }),
          ],
        }),
        Widget.Box({
          className: "buttons horizontal",
          vexpand: true,
          children: [
            Widget.Button({
              child: Widget.Label({ label: "No" }),
              onClicked: () => closePopupWindow(WINDOW_NAME),
              hexpand: true,
              setup: (self) => {
                self
                  .hook(self, "enter-notify-event", (self) => {
                    self.grab_focus();
                  })
                  .hook(self, "map", (self) => {
                    self.grab_focus();
                  });
              },
            }),
            Widget.Button({
              child: Widget.Label({ label: "Yes" }),
              onClicked: () => {
                action();
                closePopupWindow(WINDOW_NAME);
              },
              hexpand: true,
              setup: (self) => {
                self.hook(self, "enter-notify-event", (self) => {
                  self.grab_focus();
                });
              },
            }),
          ],
          setup: (self) => {
            self.hook(self, "key-press-event", (self, event) => {
              const key = event.get_keyval()[1];
              switch (key) {
                case Gdk.KEY_y:
                case Gdk.KEY_Y:
                  self.children[1].grab_focus();
                  return true;
                case Gdk.KEY_n:
                case Gdk.KEY_N:
                  self.children[0].grab_focus();
                  return true;
                case Gdk.KEY_Escape:
                  self.close();
                  return true;
                default:
                  return false;
              }
            });
          },
        }),
      ],
    }),
  });
