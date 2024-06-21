// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

"use strict";

import { dotnet, exit } from './_framework/dotnet.js'

function log (text) {
    document.querySelector("span").textContent += text + "\n";
}

class FrameApp {
    async init({ getAssemblyExports }) {
        const exports = await getAssemblyExports("Wasm.Browser.Bench.Sample.dll");
        exports.Sample.AppStartTask.FrameApp.ReachedManaged();
    }

    reachedCallback() {
        log("// reached");
    }
}

let mute = false;
try {
    globalThis.frameApp = new FrameApp();
    globalThis.frameApp.ReachedCallback = globalThis.frameApp.reachedCallback.bind(globalThis.frameApp);
    window.addEventListener("pageshow", event => { log("// pageshow"); })

    window.muteErrors = () => {
        mute = true;
    }

    const runtime = await dotnet
        .withConfig({
            maxParallelDownloads: 10000,
            // diagnosticTracing:true,
        })
        .withModuleConfig({
            printErr: log,
            print: log
        })
        .create();

    await frameApp.init(runtime);
}
catch (err) {
    log(`WASM ERROR ${err}`);
    exit(1, err);
}
