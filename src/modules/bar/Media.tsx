import AstalMpris from "gi://AstalMpris?version=0.1";
import options from "../../options";
import { createBinding, With } from "gnim";
import { Gdk, Gtk } from "ags/gtk4";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

const mpris = AstalMpris.get_default();
export let mprisCurrentPlayer: AstalMpris.Player | null

const getPlayer = () => {
  const playerList = mpris.get_players();
  if (playerList.length === 0) return null;

  const playerSet = new Set<AstalMpris.Player>();
  for (const whitelistName of options.mpris.whitelist) {
    if (whitelistName === "%any") {
      // add all players, ignoring ones in the blacklist
      for (const player of playerList) {
        if (!options.mpris.blacklist.includes(player.identity)) playerSet.add(player);
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
  return playerSet.values().next().value || null;
};

const MediaBox = (player: AstalMpris.Player) => {
  const coverArtBinding = createBinding(player, "coverArt");

  return (
    <box class={"media"}>
      <button
        onClicked={() => {
          const name = player.identity;
          if (!name || name.length === 0) return;

          const regex = `[${name[0].toUpperCase()}${name[0].toLowerCase()}]${name.slice(1)}`;
          if (options.currentDesktop === "hyprland") {
            AstalHyprland.get_default().message(`dispatch focuswindow class:${regex}`);
          }
        }}
        class={"cover"}
      >
        <box class={"image"} overflow={Gtk.Overflow.HIDDEN} css="border-radius: 2px;">
          <image
            pixelSize={14}
            file={coverArtBinding.as((coverArt) =>{
              if (coverArt) return coverArt;
              return `${SRC}/assets/a-sparkle-symbolic.svg`
            })}
            // visible={coverArtBinding.as((coverArt) => {
            //   if (!coverArt) return false;
            //   return true;
            // })}
          />
          {/* <image
            pixelSize={14}
            iconName={"a-sparkle-symbolic"}
            visible={coverArtBinding.as((coverArt) => {
              if (!coverArt) return true;
              return false;
            })}
          /> */}
        </box>
      </button>
      <box class={"text"}>
        <Gtk.GestureClick
          button={Gdk.BUTTON_PRIMARY}
          onPressed={() => {
            player.play_pause();
          }}
        />
        <Gtk.GestureClick
          button={Gdk.BUTTON_SECONDARY}
          onPressed={() => {
            player.next();
          }}
        />
        <Gtk.EventControllerScroll
          flags={Gtk.EventControllerScrollFlags.VERTICAL}
          onScroll={(_event, _deltaX, deltaY) => {
            if (deltaY < 0) {
              player.volume += 0.05;
            } else {
              player.volume -= 0.05;
            }
          }}
        />
        <label
          class={"artist"}
          label={createBinding(
            player,
            "artist",
          )((artist) => {
            if (!artist || artist === "Unknown artist") {
              return player.identity ? `${player.identity} ` : "";
            }
            if (artist.length > 40) return `${artist.slice(0, 37)}... `;
            return `${artist} `;
          })}
        ></label>

        <label
          class={"title"}
          label={createBinding(
            player,
            "title",
          )((title) => {
            if (title.length > 40) return `${title.slice(0, 37)}...`;
            return title || "";
          })}
        ></label>
      </box>
    </box>
  );
};

export default () => {
  return (
    <box>
      <With value={createBinding(mpris, "players")}>
        {(value) => {
          const player = getPlayer();
          mprisCurrentPlayer = player;
          if (!player) {
            return <box visible={false}></box>;
          }
          return MediaBox(player);
        }}
      </With>
    </box>
  );
};
