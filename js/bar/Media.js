import { bind } from "astal";
import { App } from "astal/gtk3";
import { Hyprland, Mpris, Widget } from "../imports.js";
import options from "../options.js";

Mpris.cacheCoverArt = true;

globalThis.MPRIS_CURRENT_PLAYER = null;

const getPlayer = () => {
  const playerList = Mpris.get_players();
  if (playerList.length === 0) return null;

  const playerSet = new Set();
  for (const whitelistName of options.mpris.whitelist) {
    if (whitelistName === "%any") {
      // add all players, ignoring ones in the blacklist
      for (const player of playerList) {
        if (!options.mpris.blacklist.includes(player.name)) playerSet.add(player);
      }
      continue;
    }

    for (const player of playerList) {
      if (player.identity.toLowerCase() === whitelistName.toLowerCase()) {
        playerSet.delete(player);
        playerSet.add(player);
      }
    }
  }
  return playerSet.values().next().value;
};

const MediaBox = (player) =>
  Widget.Box({
    className: "media",
    children: [
      Widget.Button({
        onClicked: () => {
          const name = player.identity;
          if (!name || name.length === 0) return;

          const regex = `[${name[0].toUpperCase()}${name[0].toLowerCase()}]${name.slice(1)}`;
          Hyprland.message(`dispatch focuswindow class:${regex}`);
        },
        className: "cover",
        child: Widget.Box({
          className: "image",
          children: [
            Widget.Icon({
              icon: "a-sparkle-symbolic",
              visible: false,
            }),
          ],
          setup: (self) => {
            self.hook(player, "notify::cover-art", (self) => {
              if (!player.coverArt) {
                self.children[0].visible = true;
                self.css = "background-image: none";
                return;
              }
              self.children[0].visible = false;
              self.css = `background-image: url("${player.coverArt}")`;
            });
            if (player.coverArt) {
              self.children[0].visible = false;
              self.css = `background-image: url("${player.coverArt}")`;
            } else {
              self.children[0].visible = true;
            }
          },
        }),
      }),
      Widget.Button({
        className: "text",
        onClick: (self, event) => {
          switch (event.button) {
            case 1:
              player?.play_pause();
              break;
            case 3:
              player?.next();
              break;
          }
        },
        onScroll: (self, event) => {
          if (event.delta_y < 0) player.volume += 0.05;
          else player.volume -= 0.05;
        },
        child: Widget.Box({
          children: [
            Widget.Label({
              className: "artist",
              label: bind(player, "artist").as((artist) => {
                if (!artist || artist === "Unknown artist") {
                  return player.name ? `${player.name} ` : "";
                }
                if (artist.length > 40) return `${artist.slice(0, 37)}... `;
                return `${artist} `;
              }),
            }),
            Widget.Label({
              className: "title",
              label: bind(player, "title").as((title) => {
                if (title.length > 40) return `${title.slice(0, 37)}...`;
                return title || "";
              }),
            }),
          ],
        }),
      }),
    ],
  });

export default () => {
  return Widget.Box({
    setup: (self) => {
      const update = () => {
        const player = getPlayer();
        MPRIS_CURRENT_PLAYER = player;
        if (!player) {
          self.visible = false;
          if (self.child) self.child.destroy();
          return;
        }
        if (self.child) self.child.destroy();
        self.add(MediaBox(player));
        self.visible = true;
      };
      self.hook(Mpris, "notify::players", update);
      update();
    },
  });
};
