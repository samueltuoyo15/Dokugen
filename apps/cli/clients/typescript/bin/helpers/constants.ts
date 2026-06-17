import { createRequire } from "module";
const require = createRequire(import.meta.url);
export const { version: CURRENT_VERSION } = require("../../../package.json");

export const DOKUGEN_BANNER = `
   ___   ____  __ ____  _____________  __
  / _ \\ / __ \\/ //_/ / / / ____/ ____/ / /
 / / / / / / / ,< / / / / / __/ __/ / /_
/ /_/ / /_/ / /| / /_/ / /_/ / /___/ / /
\\____/\\____/_/ |_\\____/\\____/_____/_/ /
                                   /_/
`;

export const API_TIMEOUT = 300000;
