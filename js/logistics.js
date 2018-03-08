var warningDiv = 0x04;

$("#fileupload").change(function() {
    var file = document.getElementById("fileupload").files[0];
    var reader = new FileReader();
    reader.onloadend = function(e) {
        var arrayBuffer = reader.result;
        romCheck(arrayBuffer);
    };
    reader.readAsArrayBuffer(file);
});

$("#randomizeRom").click(function(){
    seedGenerator(document.getElementById("seed").value.toUpperCase());
    flagGenerator(document.getElementById("flags").value.toUpperCase());
    var file = document.getElementById("fileupload").files[0];
    var reader = new FileReader();
    reader.onloadend = function(e) {
        doRandomize(reader.result);
    };
    reader.readAsArrayBuffer(file);
});

function romCheck(buffer) {
    var romTest = new Uint8Array(buffer);
    var print = "Not a ROM of MARIOLAND2";
    var origRom = [0x4D, 0x41, 0x52, 0x49, 0x4F, 0x4C, 0x41, 0x4E, 0x44, 0x32];
    var cSum = [0xE0, 0xF9];
    var romVerify = 12;
    for (var i = 0; i < origRom.length; i++) {
        if (romTest[0x134 + i] == origRom[i]) {
            romVerify--;
        }
    }
    for (var i = 0; i < cSum.length; i++) {
        if (romTest[0x14E + i] == cSum[i]) {
            romVerify--;
        }
    }
    if (romVerify == 0) {
        if (romTest[0x148] != warningDiv) {
            $("#warning").toggleClass('hidden');
            warningDiv = romTest[0x148];
        }
        var vOne = romTest[0x14C] == 0x00 ? "v1.0" : "v1.2";
        var dxRom = romTest[0x148] == 0x05 ? "DX - " : "";
        print = "ROM: MARIOLAND2 - " + dxRom + vOne;
        document.getElementById("randomizeRom").disabled = false;
    } else {
        document.getElementById("randomizeRom").disabled = true;
        warningDiv = 0x04;
        $("#warning").addClass(function() {
            if (!$("#warning").hasClass('hidden')) {
                return 'hidden';
            }
        });
    }
    document.getElementById("romVersion").innerHTML = print;
}

function seedGenerator(custom = null) {
    if (custom != null && (parseInt(custom, 16).toString(16).toUpperCase() == custom) && custom.length == 8) {
        prng.setSeed(custom);
    } else {
        var partA = (Math.floor(Math.random() * 3839) + 256).toString(16).toUpperCase();
        var partB = Date.now().toString(16).toUpperCase().substr(-5,5);
        prng.setSeed(partA.concat(partB));
        document.getElementById("seed").value = prng.printSeed.toUpperCase();
    }
}

function flagGenerator(custom = null) {
    var flags = 0;
    if (custom != null && (parseInt(custom, 16).toString(16).toUpperCase() === custom) && custom.length == 3) {
        flags = parseInt(custom, 16);
        doLevels = (flags & 0x001) != 0;
        doExits = (flags & 0x002) != 0;
        doBosses = (flags & 0x004) != 0;
        doEnemies = (flags & 0x008) != 0;
        doPowerups = (flags & 0x010) != 0;
        doPlatforms = (flags & 0x020) != 0;
        doPhysics = (flags & 0x040) != 0;
        doScrolling = (flags & 0x080) != 0;
        doMusic = (flags & 0x100) != 0;
        beastMode = (flags & 0x200) != 0;
        document.getElementById("flags").value = custom.toUpperCase();
    } else {
        if (document.getElementById("randomizeLevels").checked) {
            doLevels = true;
            flags |= 0x001;
        }
        if (document.getElementById("swapExits").checked) {
            doExits = true;
            flags |= 0x002;
        }
        if (document.getElementById("randomizeBosses").checked) {
            doBosses = true;
            flags |= 0x004;
        }
        if (document.getElementById("randomizeEnemies").checked) {
            doEnemies = true;
            flags |= 0x008;
        }
        if (document.getElementById("randomizePowerups").checked) {
            doPowerups = true;
            flags |= 0x010;
        }
        if (document.getElementById("randomizePlatforms").checked) {
            doPlatforms = true;
            flags |= 0x020;
        }
        if (document.getElementById("randomizePhysics").checked) {
            doPhysics = true;
            flags |= 0x040;
        }
        if (document.getElementById("randomizeScrolling").checked) {
            doScrolling = true;
            flags |= 0x080;
        }
        if (document.getElementById("randomizeMusic").checked) {
            doMusic = true;
            flags |= 0x100;
        }
        if (document.getElementById("beastMode").checked) {
            beastMode = true;
            flags |= 0x200;
        }
        document.getElementById("flags").value = ("00" + flags.toString(16).toUpperCase()).substr(-3);
    }
};

function doRandomize(buffer) {
    var rom = new Uint8Array(buffer);
    if (doLevels) {
        randomizeLevels(rom);
    }
    if (doExits) {
        swapExits(rom);
    }
    if (doBosses) {
        randomizeBosses(rom);
    }
    if (doEnemies) {
        randomizeEnemies(rom);
    }
    if (doPowerups) {
        randomizePowerups(rom);
    }
    if (doPlatforms) {
        randomizePlatforms(rom);
    }
    if (doPhysics) {
        randomizePhysics(rom);
    }
    if (doScrolling) {
        randomizeScrolling(rom);
    }
    if (doMusic) {
        randomizeMusic(rom);
    }
    if (beastMode) {
        randomizeBossHealth(rom);
    }
    checksum(rom);
    var ifDx = rom[0x148] == 0x05 ? "DX-" : "";
    var filename = "sml2r-" + ifDx + prng.printSeed + "-" + document.getElementById("flags").value + ".gb";
    saveAs(new Blob([buffer], {type: "octet/stream"}), filename);
}
