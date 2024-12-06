import { fileSystem } from "./fileSystem";

const COMMANDS = [
  "help",
  "clear",
  "echo",
  "date",
  "whoami",
  "ls",
  "cd",
  "pwd",
  "mkdir",
  "touch",
  "rm",
  "tree",
  "cat",
  "cp",
  "mv",
];

export const getSuggestions = (input) => {
  const [cmd, ...args] = input.split(" ");

  // If completing a command (no space)
  if (args.length === 0) {
    return COMMANDS.filter((command) => command.startsWith(cmd.toLowerCase()));
  }

  // If completing a path argument
  if (
    ["cd", "ls", "rm", "cat", "cp", "mv"].includes(cmd.toLowerCase().trim()) &&
    args.length === 1
  ) {
    const path = args[0] || "";
    const parts = path.split("/");
    const lastPart = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join("/");

    // Get the directory we're searching in
    const searchDir = parentPath
      ? fileSystem.resolvePath(parentPath)
      : fileSystem.currentDir;

    if (!searchDir || searchDir.type !== "directory") return [];

    // Get suggestions from current directory level
    const suggestions = [];
    for (const [name, node] of searchDir.children) {
      if (name.startsWith(lastPart)) {
        // Add trailing slash to directories
        const suggestion = node.type === "directory" ? name + "/" : name;
        // Concatenate with parent path if it exists
        suggestions.push(
          parentPath ? `${parentPath}/${suggestion}` : suggestion,
        );
      }
    }

    return suggestions;
  }

  return [];
};

export const executeCommand = (command) => {
  const [cmd, ...args] = command.trim().split(" ");

  // Handle compound commands with &&
  if (command.includes("&&")) {
    const commands = command.split("&&").map((cmd) => cmd.trim());
    let output = "";

    for (const cmd of commands) {
      const result = executeCommand(cmd);
      if (result) {
        output += result + "\n";
      }
    }
    return output.trim();
  }

  switch (cmd.toLowerCase()) {
    case "help":
      return `
Available commands:
  help              - Show this help message
  clear             - Clear the terminal screen
  echo <text>       - Display a line of text
  date              - Display current date and time
  whoami            - Display current user
  tree              - Display directory structure with emojis

File System Commands:
  ls [-a|-R] [path] - List directory contents (-a: show hidden, -R: recursive)
  cd <path>         - Change directory
  pwd               - Print working directory
  mkdir [-p] <path> - Create a new directory (-p: create parent dirs)
  touch <name>      - Create a new empty file
  rm [-r] <path>    - Remove a file or directory (-r: recursive)
  cat <file>        - Display file contents
  cp <src> <dest>   - Copy a file
  mv <src> <dest>   - Move a file or directory`;

    case "echo":
      return args.join(" ");

    case "date":
      return new Date().toLocaleString();

    case "whoami":
      return "guest";

    case "tree":
      return fileSystem.tree();

    case "ls":
      let showHidden = false;
      let recursive = false;
      let path = "";

      args.forEach((arg) => {
        if (arg === "-a") showHidden = true;
        else if (arg === "-R") recursive = true;
        else if (!arg.startsWith("-")) path = arg;
      });

      return fileSystem.ls(path, { showHidden, recursive });

    case "cd":
      return fileSystem.cd(args[0] || "/");

    case "pwd":
      return fileSystem.pwd();

    case "mkdir":
      if (!args[0]) return "mkdir: missing operand";
      if (args[0] === "-p") {
        if (!args[1]) return "mkdir: missing directory operand";
        return fileSystem.mkdirp(args[1]);
      }
      return fileSystem.mkdir(args[0]);

    case "touch":
      if (!args[0]) return "touch: missing operand";
      return fileSystem.touch(args[0]);

    case "rm":
      if (!args[0]) return "rm: missing operand";
      if (args[0] === "-r" || args[0] === "-rf") {
        if (!args[1]) return "rm: missing directory operand";
        return fileSystem.rmdir(args[1]);
      }
      return fileSystem.rm(args[0]);

    case "cat":
      if (!args[0]) return "cat: missing operand";
      return fileSystem.cat(args[0]);

    case "cp":
      if (args.length < 2) return "cp: missing destination operand";
      return fileSystem.cp(args[0], args[1]);

    case "mv":
      if (args.length < 2) return "mv: missing destination operand";
      return fileSystem.mv(args[0], args[1]);

    default:
      return `Command not found: ${cmd}. Type 'help' for available commands.`;
  }
};

