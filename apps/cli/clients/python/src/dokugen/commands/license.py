import os
import sys
import datetime
import questionary
from rich.console import Console
from dokugen import utils

console = Console()

LICENSES = {
    "MIT": lambda year, author: f"""MIT License

Copyright (c) {year} {author}

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
""",
    "ISC": lambda year, author: f"""ISC License

Copyright (c) {year} {author}

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
""",
    "Apache-2.0": lambda year, author: f"""Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright (c) {year} {author}

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
""",
    "GPL-3.0": lambda year, author: f"""GNU GENERAL PUBLIC LICENSE
Version 3, 29 June 2007

Copyright (C) {year} {author}

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
""",
    "BSD-2-Clause": lambda year, author: f"""BSD 2-Clause License

Copyright (c) {year} {author}

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
""",
    "Unlicense": lambda: """This is free and unencumbered software released into the public domain.

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
""",
}


def cmd_license(args):
    utils.check_and_update()
    project_dir = os.getcwd()
    license_path = os.path.join(project_dir, "LICENSE")

    project_name = os.path.basename(project_dir)

    if os.path.exists(license_path):
        overwrite = questionary.select(
            f"A LICENSE file already exists for {project_name}. Overwrite it?",
            choices=["Yes", "No"],
        ).ask()
        if overwrite is None or overwrite == "No":
            console.print("[yellow]Cancelled.[/yellow]")
            return

    license_type = questionary.select(
        "Which license?",
        choices=[
            questionary.Choice([
                ("class:text", "MIT License: "),
                ("class:comment", f"Anyone can use, modify, and sell {project_name}. Must include your copyright notice. You aren't liable if it breaks.")
            ], value="MIT"),
            questionary.Choice([
                ("class:text", "ISC License: "),
                ("class:comment", f"Same as MIT but shorter. Anyone can use, edit, and sell {project_name}. Must include your copyright notice.")
            ], value="ISC"),
            questionary.Choice([
                ("class:text", "Apache 2.0:   "),
                ("class:comment", f"Permissive. Allows commercial use and edits to {project_name}. Requires copyright notices. Grants patent rights.")
            ], value="Apache-2.0"),
            questionary.Choice([
                ("class:text", "GNU GPLv3:     "),
                ("class:comment", f"Strong copyleft. If anyone modifies or shares {project_name}, they must make their source code open-source too.")
            ], value="GPL-3.0"),
            questionary.Choice([
                ("class:text", "BSD 2-Clause: "),
                ("class:comment", f"Permissive. Allows commercial use of {project_name}. Must keep copyright notice. Cannot use your name for promotion.")
            ], value="BSD-2-Clause"),
            questionary.Choice([
                ("class:text", "Unlicense:    "),
                ("class:comment", f"Public domain. Anyone can do absolutely anything with {project_name} with no rules, attribution, or conditions.")
            ], value="Unlicense"),
        ],
    ).ask()

    if license_type is None:
        console.print("[yellow]Cancelled.[/yellow]")
        return

    user_info = utils.get_user_info()
    git_username = user_info.get("username", "")

    author = git_username
    if not author:
        author = questionary.text(
            "Author name:",
            placeholder="Your Name",
        ).ask()

    if author is None:
        console.print("[yellow]Cancelled.[/yellow]")
        return

    author = author.strip()
    template = LICENSES[license_type]

    if license_type == "Unlicense":
        content = template()
    else:
        year = datetime.datetime.now().year
        content = template(year, author)

    try:
        with open(license_path, "w", encoding="utf-8") as f:
            f.write(content)
        console.print(f"[green]\nLICENSE file generated ({license_type}) at {license_path}[/green]")
    except Exception as e:
        console.print(f"[red]Failed to generate LICENSE: {e}[/red]")
        sys.exit(1)


def register_license_parser(subparsers):
    project_name = os.path.basename(os.getcwd())
    subparsers.add_parser("license", help=f"Generate a LICENSE file for {project_name}")
