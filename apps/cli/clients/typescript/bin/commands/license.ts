import { select, text, isCancel } from "@clack/prompts";
import chalk from "chalk";
import fs from "fs-extra";
import axios from "axios";
import * as path from "path";
import { getUserInfo } from "../helpers/git.js";
import { checkAndUpdate, getBackendDomain } from "../helpers/network.js";
import { Command } from "commander";

const LICENSES: Record<string, (year: number, author: string) => string> = {
  MIT: (year, author) => `MIT License

Copyright (c) ${year} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`,

  ISC: (year, author) => `ISC License

Copyright (c) ${year} ${author}

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
`,

  "Apache-2.0": (year, author) => `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright (c) ${year} ${author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
`,

  "GPL-3.0": (year, author) => `GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) ${year} ${author}

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
`,

  "BSD-2-Clause": (year, author) => `BSD 2-Clause License

Copyright (c) ${year} ${author}

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
`,

  Unlicense: () => `This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the software
to the public domain. We make this dedication for the benefit of the
public at large and to the detriment of our heirs and successors. We
intend this dedication to be an overt act of relinquishment in
perpetuity of all present and future rights to this software under
copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
`,
};

export function registerLicenseCommand(program: Command) {
  const projectDir = process.cwd();
  const projectName = path.basename(projectDir);

  program
    .command("license")
    .description(`Generate a LICENSE file for ${projectName}`)
    .action(async () => {
      await checkAndUpdate();

      const licensePath = path.join(projectDir, "LICENSE");

      if (await fs.pathExists(licensePath)) {
        const overwrite = await select({
          message: `A LICENSE file already exists for ${projectName}. Overwrite it?`,
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        });
        if (isCancel(overwrite) || overwrite === "no") {
          console.log(chalk.yellow("Cancelled."));
          return;
        }
      }

      const licenseType = await select({
        message: "Which license?",
        options: [
          { 
            value: "MIT", 
            label: "MIT License", 
            hint: `Anyone can use, modify, and sell ${projectName}. Must include your copyright notice. You aren't liable if it breaks.` 
          },
          { 
            value: "ISC", 
            label: "ISC License", 
            hint: `Same as MIT but shorter. Anyone can use, edit, and sell ${projectName}. Must include your copyright notice.` 
          },
          { 
            value: "Apache-2.0", 
            label: "Apache 2.0", 
            hint: `Permissive. Allows commercial use and edits to ${projectName}. Requires copyright notices. Grants patent rights.` 
          },
          { 
            value: "GPL-3.0", 
            label: "GNU GPLv3", 
            hint: `Strong copyleft. If anyone modifies or shares ${projectName}, they must make their source code open-source too.` 
          },
          { 
            value: "BSD-2-Clause", 
            label: "BSD 2-Clause", 
            hint: `Permissive. Allows commercial use of ${projectName}. Must keep copyright notice. Cannot use your name for promotion.` 
          },
          { 
            value: "Unlicense", 
            label: "Unlicense", 
            hint: `Public domain. Anyone can do absolutely anything with ${projectName} with no rules, attribution, or conditions.` 
          },
        ],
      });

      if (isCancel(licenseType)) {
        console.log(chalk.yellow("Cancelled."));
        return;
      }

      const userInfo = await getUserInfo();
      const author = userInfo?.username || (await text({
        message: "Author name:",
        placeholder: "Your Name",
      }) as string);

      if (isCancel(author)) {
        console.log(chalk.yellow("Cancelled."));
        return;
      }

      const year = new Date().getFullYear();
      const template = LICENSES[licenseType as string];
      const content = template(year, author.trim());

      await fs.writeFile(licensePath, content, "utf-8");
      console.log(chalk.green(`\nLICENSE file generated (${licenseType}) at ${licensePath}`));

      // Fire-and-forget usage tracking
      try {
        const backendDomain = await getBackendDomain();
        if (userInfo?.username && userInfo?.email) {
          axios.post(`${backendDomain}/api/track`, { userInfo }).catch(() => {});
        }
      } catch { /* never block the user */ }
    });
}
