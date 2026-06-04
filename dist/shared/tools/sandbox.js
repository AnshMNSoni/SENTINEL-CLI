import { execSync, execFileSync } from "node:child_process";
import { platform } from "node:os";

export function runSandboxed(command, options = {}) {
  const { cwd, timeout = 30000, maxBuffer = 10 * 1024 * 1024, env } = options;
  const os = platform();

  if (os === "win32") {
    return execSync(command, { cwd, timeout, maxBuffer, windowsHide: true, shell: true, env });
  }

  if (os === "linux") {
    try {
      execSync("which bwrap", { stdio: "ignore" });
      const sandboxArgs = [
        "bwrap",
        "--ro-bind", "/", "/",
        "--tmpfs", "/tmp",
        "--bind", cwd, cwd,
        "--unshare-net",
        "--die-with-parent",
        "--setenv", "HOME", "/tmp/home",
        "sh", "-c", command,
      ];
      return execFileSync("bwrap", sandboxArgs.slice(1), { cwd, timeout, maxBuffer, env });
    } catch {
      return execSync(command, { cwd, timeout, maxBuffer, env });
    }
  }

  if (os === "darwin") {
    try {
      const profile = [
        "(version 1)",
        "(deny default)",
        '(allow file-read*)',
        `(allow file-write* (subpath "${cwd}"))`,
        "(allow process-fork)",
        "(allow sysctl-read)",
        "(allow signal)",
      ].join("\n");

      return execSync(`echo "${profile.replace(/"/g, '\\"')}" | sandbox-exec -f /dev/stdin sh -c "${command.replace(/"/g, '\\"')}"`, {
        cwd, timeout, maxBuffer, env,
      });
    } catch {
      return execSync(command, { cwd, timeout, maxBuffer, env });
    }
  }

  return execSync(command, { cwd, timeout, maxBuffer, env });
}
