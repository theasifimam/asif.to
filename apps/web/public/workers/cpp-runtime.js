let runtimeWorker = null;
let requestId = 0;

async function loadRuntime() {
  if (runtimeWorker) return runtimeWorker;
  const url = "/runtimes/JSCPP.es5.min.js";
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The C++ runtime could not be downloaded (${response.status}).`);
  const total = Number(response.headers.get("content-length")) || 619555;
  const reader = response.body?.getReader();
  if (!reader) {
    await response.arrayBuffer();
    runtimeWorker = new Worker(url);
    return runtimeWorker;
  }
  let loaded = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    loaded += value.byteLength;
    self.postMessage({ type: "progress", message: "Downloading the browser C++ interpreter...", file: "JSCPP runtime", loaded, total });
  }
  // The response is now in the HTTP cache. JSCPP provides its own classic
  // worker protocol, so run it as a nested worker instead of evaluating it.
  runtimeWorker = new Worker(url);
  return runtimeWorker;
}

function execute(worker, code, input, options = {}) {
  return new Promise((resolve, reject) => {
    const id = ++requestId;
    let stdout = "";
    const onMessage = ({ data }) => {
      if (data?.type === "stdio.write") { stdout += String(data.data); return; }
      if (data?.id !== id) return;
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      if (data.err) reject(new Error(data.msg || "C++ execution failed."));
      else resolve({ stdout, exitCode: Number(data.data ?? data.returnCode ?? 0) });
    };
    const onError = (event) => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      reject(new Error(event.message || "The C++ interpreter could not start."));
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage([id, "run", code, input, options]);
  });
}

self.onmessage = async ({ data }) => {
  if (data?.type !== "run") return;
  try {
    const worker = await loadRuntime();
    self.postMessage({ type: "status", message: "Running C++..." });
    let includes = {};
    if (data.files) {
      for (const [path, fileObj] of Object.entries(data.files)) {
        if (!fileObj.code) continue;
        let name = path.split("/").pop();
        includes[name] = fileObj.code;
      }
    }
    const { stdout, exitCode } = await execute(worker, String(data.code || ""), String(data.input || ""), { includes });
    self.postMessage({ type: "result", stdout, stderr: exitCode ? `Program exited with code ${exitCode}.` : "" });
  } catch (error) {
    self.postMessage({ type: "error", error: error?.message || String(error) });
  }
};
