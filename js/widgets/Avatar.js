import { Widget } from "../imports.js";
import options from "../options.js";

export default (props) =>
  Widget.Box({
    ...props,
    className: "avatar",
    css: `
    background-image: url("${options.avatar}");
    background-size: contain;`,
    setup: (self) => {
      self.hook(self, "draw", (box) => {
        const h = box.get_allocated_height();
        box.set_size_request(h, -1);
      });
    },
  });
