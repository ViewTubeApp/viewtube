import { env } from "@/env";

// CSS styles for browser console
const CSS = {
  TITLE: "color: #3b82f6; font-weight: bold; font-size: 12px;", // blue
  BRAND: "color: #22c55e; font-weight: bold;", // green
  ENV: "color: #eab308; font-weight: bold;", // yellow
  GIT: "color: #a855f7; font-weight: bold;", // purple
};

const ASCII_ART = `
  _    ___              ______      __         
 | |  / (_)__ _      __/_  __/_  __/ /_  ___   
 | | / / / _ \\ | /| / // / / / / / __ \\/ _ \\  
 | |/ / /  __/ |/ |/ // / / /_/ / /_/ /  __/  
 |___/_/\\___/|__/|__//_/  \\__,_/_.___/\\___/   
`;

export function displayConsoleArt() {
  const hash = env.NEXT_PUBLIC_GIT_COMMIT_HASH?.slice(0, 7);
  console.log("%c" + ASCII_ART, CSS.TITLE);
  console.log("%cWelcome to %c%s%c!", "color: inherit;", CSS.BRAND, env.NEXT_PUBLIC_BRAND, "color: inherit;");
  console.log("%cRunning in %c%s%c mode", "color: inherit;", CSS.ENV, env.NEXT_PUBLIC_NODE_ENV, "color: inherit;");
  hash && console.log("%cGit commit: %c%s", "color: inherit;", CSS.GIT, hash);
}
