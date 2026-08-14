let sdkPromise;
let clangPromise;

async function reportSize(url, file, message) {
  try {
    const response = await fetch(url, { method: "HEAD", mode: "cors" });
    const total = Number(response.headers.get("content-length")) || 0;
    self.postMessage({ type: "progress", message, file, loaded: 0, total });
    return total;
  } catch {
    self.postMessage({ type: "progress", message, file, loaded: 0, total: 0 });
    return 0;
  }
}

async function compiler() {
  if (!sdkPromise) {
    const sdkUrl = "https://unpkg.com/@wasmer/sdk@0.10.0/dist/index.mjs";
    const total = await reportSize(sdkUrl, "Wasmer SDK", "Downloading the WebAssembly runtime...");
    sdkPromise = import(sdkUrl).then(async (sdk) => { self.postMessage({ type: "progress", message: "WebAssembly runtime downloaded.", file: "Wasmer SDK", loaded: total, total }); self.postMessage({ type: "status", message: "Initializing the WebAssembly runtime..." }); await sdk.init(); return sdk; });
  }
  const sdk = await sdkPromise;
  if (!clangPromise) {
    self.postMessage({ type: "progress", message: "Downloading the Clang toolchain (large one-time download)...", file: "clang/clang", loaded: 0, total: 0 });
    clangPromise = sdk.Wasmer.fromRegistry("clang/clang");
  }
  return { sdk, clang: await clangPromise };
}

self.onmessage = async ({ data }) => {
  if (data?.type !== "run") return;
  try {
    const { sdk, clang } = await compiler();
    const project = new sdk.Directory();
    const isCpp = data.language === "cpp";
    const sourceName = isCpp ? "main.cpp" : "main.c";
    await project.writeFile(sourceName, data.code);
    self.postMessage({ type: "status", message: `Compiling ${isCpp ? "C++" : "C"}...` });
    const args = [`/project/${sourceName}`, "-o", "/project/program.wasm"];
    if (isCpp) args.unshift("-x", "c++");
    const process = await clang.entrypoint.run({ args, mount: { "/project": project } });
    const compiled = await process.wait();
    if (!compiled.ok) return self.postMessage({ type: "result", stdout: compiled.stdout || "", stderr: compiled.stderr || `Compilation failed with exit code ${compiled.code}.` });
    self.postMessage({ type: "status", message: "Running compiled WebAssembly..." });
    const wasm = await project.readFile("program.wasm");
    const program = await sdk.Wasmer.fromFile(wasm);
    const instance = await program.entrypoint.run();
    const result = await instance.wait();
    self.postMessage({ type: "result", stdout: result.stdout || "", stderr: result.stderr || (result.ok ? "" : `Program exited with code ${result.code}.`) });
  } catch (error) {
    const detail = error?.message || String(error);
    if (/oneshot canceled/i.test(detail) && !data._retried) {
      self.postMessage({ type: "status", message: "The compiler process was interrupted; restarting it once..." });
      sdkPromise = null;
      clangPromise = null;
      await self.onmessage({ data: { ...data, _retried: true } });
      return;
    }
    const friendly = /oneshot canceled/i.test(detail)
      ? "The browser C/C++ compiler process was interrupted while starting. Run it again; if it repeats, reload the page and check that WebAssembly and cross-origin isolation are allowed."
      : detail;
    self.postMessage({ type: "error", error: friendly });
  }
};
