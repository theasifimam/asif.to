import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.mjs";

const PYODIDE_BASE = "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/";
let pyodidePromise;
let stdout = "";
let stderr = "";

async function runtime() {
  if (!pyodidePromise) {
    self.postMessage({
      type: "status",
      message: "Downloading and initializing Python WebAssembly...",
    });

    pyodidePromise = loadPyodide({ indexURL: PYODIDE_BASE }).then((pyodide) => {
      pyodide.setStdout({
        raw: (value) => {
          stdout += String.fromCharCode(value);
        },
      });
      pyodide.setStderr({
        raw: (value) => {
          stderr += String.fromCharCode(value);
        },
      });
      return pyodide;
    });
  }

  return pyodidePromise;
}

self.onmessage = async ({ data }) => {
  if (data?.type !== "run") return;

  stdout = "";
  stderr = "";

  try {
    const pyodide = await runtime();

    if (data.files) {
      for (const [path, fileObj] of Object.entries(data.files)) {
        if (!fileObj?.code) continue;

        const parts = path.split("/").filter(Boolean);
        let currentPath = "";

        for (let i = 0; i < parts.length - 1; i += 1) {
          currentPath += `/${parts[i]}`;
          try {
            pyodide.FS.mkdir(currentPath);
          } catch {
            // Directory already exists.
          }
        }

        pyodide.FS.writeFile(path, fileObj.code);
      }
    }

    const codeToRun = String(data.code || "");
    self.postMessage({ type: "status", message: "Preparing Python imports..." });
    await pyodide.loadPackagesFromImports(codeToRun);

    self.postMessage({ type: "status", message: "Running Python..." });
    await pyodide.runPythonAsync(codeToRun);

    self.postMessage({ type: "result", stdout, stderr });
  } catch (error) {
    self.postMessage({
      type: "error",
      error:
        error?.message ||
        String(error) ||
        "The Python browser runtime could not execute this code.",
    });
  }
};
