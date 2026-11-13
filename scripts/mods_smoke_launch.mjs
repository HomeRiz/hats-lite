import { spawn } from "node:child_process";

const child = spawn(process.execPath, process.argv.slice(2), { env: {}, stdio: "inherit" });
child.on("error", () => process.exit(1));
child.on("close", (code, signal) => process.exit(signal ? 1 : (code ?? 1)));
