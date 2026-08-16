let pyodidePromise;
let stdout = "";
let stderr = "";

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

async function runtime() {
  if (!pyodidePromise) {
    const moduleUrl = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";
    const total = await reportSize(moduleUrl, "pyodide.mjs", "Downloading the Python runtime loader...");
    pyodidePromise = import(moduleUrl).then(({ loadPyodide }) => {
      self.postMessage({ type: "progress", message: "Python runtime loader downloaded.", file: "pyodide.mjs", loaded: total, total });
      self.postMessage({ type: "status", message: "Initializing Python WebAssembly..." });
      return loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/" });
    });
  }
  const pyodide = await pyodidePromise;
  pyodide.setStdout({ raw: (value) => { stdout += String.fromCharCode(value); } });
  pyodide.setStderr({ raw: (value) => { stderr += String.fromCharCode(value); } });
  return pyodide;
}

self.onmessage = async ({ data }) => {
  if (data?.type !== "run") return;
  stdout = ""; stderr = "";
  try {
    const pyodide = await runtime();
    self.postMessage({ type: "status", message: "Running Python..." });
    if (data.files) {
      for (const [path, fileObj] of Object.entries(data.files)) {
        if (!fileObj.code) continue;
        const parts = path.split("/").filter(Boolean);
        let currentPath = "";
        for (let i = 0; i < parts.length - 1; i++) {
          currentPath += "/" + parts[i];
          try {
            pyodide.FS.mkdir(currentPath);
          } catch (e) {
            // ignore if exists
          }
        }
        pyodide.FS.writeFile(path, fileObj.code);
      }
    }
    const codeToRun = data.code || "";
    await pyodide.loadPackagesFromImports(codeToRun);
    await pyodide.runPythonAsync(codeToRun);
    self.postMessage({ type: "result", stdout, stderr });
  } catch (error) {
    self.postMessage({ type: "error", error: error?.message || String(error) });
  }
};
