import { createConstructOpenCodePlugin } from "/Users/sarakay/.npm-global/lib/node_modules/@geraldmaron/construct/lib/opencode-runtime-plugin.mjs";

export const ConstructFallbackPlugin = createConstructOpenCodePlugin({
  toolkitDir: process.env.CX_TOOLKIT_DIR || "/Users/sarakay/.npm-global/lib/node_modules/@geraldmaron/construct",
});
