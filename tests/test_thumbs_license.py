import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

import thumbs_rules as rules

MIT = "MIT License\n\nPermission is hereby granted, free of charge, to any person"
APACHE = "Apache License\nVersion 2.0, January 2004"
BSD2 = "Redistribution and use in source and binary forms, with or without modification"
BSD3 = BSD2 + " Neither the name of the copyright holder"
ISC = "ISC License\nPermission to use, copy, modify, and/or distribute this software for any purpose"
UNLICENSE = "This is free and unencumbered software released into the public domain."
CC0 = "CC0 1.0 Universal"
GPL3 = "GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007"
GPL2 = "GNU GENERAL PUBLIC LICENSE\nVersion 2, June 1991"
LGPL = "GNU LESSER GENERAL PUBLIC LICENSE Version 3 This version of the GNU Lesser General Public License"
MPL = "Mozilla Public License Version 2.0"


@pytest.mark.parametrize(
    "text,expected",
    [
        (MIT, "MIT"),
        (APACHE, "Apache-2.0"),
        (BSD2, "BSD-2-Clause"),
        (BSD3, "BSD-3-Clause"),
        (ISC, "ISC"),
        (UNLICENSE, "Unlicense"),
        (CC0, "CC0-1.0"),
        (GPL3, "GPL-3.0"),
        (GPL2, "GPL-2.0"),
        (LGPL, "LGPL"),
        (MPL, "MPL-2.0"),
        ("SPDX-License-Identifier: MIT\n", "MIT"),
        ("All rights reserved", "restricted"),
        ("GNU AFFERO GENERAL PUBLIC LICENSE", "AGPL-3.0"),
        ("This project is unlicensed.", None),
        ("Released under the misc license of the author.", None),
        ("Terms permit licensees to do things.", None),
        ("This is NOT under the MIT License", "restricted"),
        (MIT + "\n\nFor non-commercial use only.", "restricted"),
        (MIT + "\nNoncommercial", "restricted"),
        (MIT + "\nCommons Clause License Condition v1.0", "restricted"),
        (MIT + "\nNo Derivatives", "restricted"),
        (MIT + "\nAll Rights Reserved", "restricted"),
        ("Copyright (c) 2024 Jane Doe. All rights reserved.\n\n" + MIT, "MIT"),
        (MIT + "\n\nWallpapers are (c) the photographer, all rights reserved.", "restricted"),
        (MIT + "\n\n" + "\n" * 150 + APACHE, "MIT"),
        (None, None),
        ("Copyright (c) 2015, Salesforce.com, Inc.\nAll rights reserved.\n\n" + BSD3, "BSD-3-Clause"),
        ("Copyright (c) 2020 A. B. Smith. All rights reserved.\n\n" + MIT, "MIT"),
        ("Copyright (c) 2020 Jane (jane.dev) All rights reserved\n\n" + MIT, "MIT"),
        ("\u00a9 2020 Jane\nALL RIGHTS RESERVED.\n\n" + MIT, "MIT"),
        ("(c) 2020 Jane\nAll rights reserved\n\n" + BSD3, "BSD-3-Clause"),
        (MIT + "\nAll rights reserved by the author for photos in /img", "restricted"),
        (MIT + "\nCopyright (c) 2020 Jane\nAll rights reserved by the author for photos in /img", "restricted"),
        (MIT + "\nThe photos are not covered by this license.", "restricted"),
        (MIT + "\nThe wallpapers are excluded from the license.", "restricted"),
        (MIT + "\nThe images are not licensed under the same terms.", "restricted"),
        (MIT + "\nThe images are not under the MIT license.", "restricted"),
    ],
)
def test_classify_license(text, expected):
    assert rules.classify_license(text) == expected


def test_mixed_markers_resolve_to_first_and_are_not_permissive():
    text = GPL3 + "\n\nPortions are Apache License\nVersion 2.0, January 2004"
    assert rules.detect_license(text) == ("GPL-3.0", True, False)
    assert rules.classify_license(text) == "mixed"
    swapped = MIT + "\n\n" + APACHE
    assert rules.detect_license(swapped)[0] == "MIT"
    assert rules.classify_license(swapped) == "mixed"
    assert "mixed" not in rules.PERMISSIVE


def test_markers_past_the_head_window_are_ignored():
    assert rules.classify_license("\n" * 45 + MIT) == "MIT"
    assert rules.classify_license("\n" * 130 + MIT) is None


def test_license_file_name_only_root():
    assert rules.license_file_name(["/docs/LICENSE", "/themes/a.yaml"]) is None
    assert rules.license_file_name(["/README.md", "/license.txt"]) == "license.txt"
    assert rules.license_file_name(["/COPYING", "/LICENSE.md"]) == "LICENSE.md"


def test_notice_stripping_is_linear_on_hostile_lines():
    import time

    for line in ("copyright " + " " * 32000, "copyright x" + "." * 32000 + "x", "copyright x" + " \t" * 16000 + "x"):
        start = time.time()
        rules.classify_license(line)
        assert time.time() - start < 1.0


@pytest.mark.parametrize(
    "text",
    [
        "// Copyright 2020 The Chromium Authors. All rights reserved.\n\n" + MIT,
        "Copyright (c) 2020 Jane Doe\nAll rights reserved.\n\n" + MIT,
    ],
)
def test_prefixed_and_two_line_notices_keep_the_license(text):
    assert rules.classify_license(text) == "MIT"


def test_unlicense_commercial_or_noncommercial_is_not_restricted():
    text = (
        "This is free and unencumbered software released into the public domain.\n"
        "Anyone is free to copy, modify, publish, use, compile, sell, or distribute this software, "
        "either in source code form or as a compiled binary, for any purpose, commercial or non-commercial."
    )
    assert rules.classify_license(text) == "Unlicense"
