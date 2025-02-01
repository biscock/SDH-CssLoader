import deckyPlugin from "@decky/rollup";
import alias from "@rollup/plugin-alias";

export default deckyPlugin({
  plugins: [
    alias({
      entries: [
        { find: "@zusteebles", replacement: `${import.meta.dirname}//src/zusteebles` },
        { find: "@cssloader/backend", replacement: `${import.meta.dirname}//src/backend` },
        { find: "@/backend", replacement: `${import.meta.dirname}/src/backend-impl` },
        { find: "@/lib", replacement: `${import.meta.dirname}/src/lib` },
        { find: "@/styles", replacement: `${import.meta.dirname}/src/styles` },
        { find: "@/types", replacement: `${import.meta.dirname}/src/types` },
        { find: "@/modules", replacement: `${import.meta.dirname}/src/modules` },
        { find: "@/decky-patches", replacement: `${import.meta.dirname}/src/decky-patches` },
      ],
    }),
  ],
});
