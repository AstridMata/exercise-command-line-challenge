

// Clase que representa un archivo o directorio
class FileSystemNode {
  constructor(name, type = 'directory') {
    this.name = name;
    this.type = type; // 'directory' o 'file'
    this.children = new Map(); // solo los directorios tienen hijos
    this.content = null; // solo los archivos tendrán contenido (para archivos de texto)
  }

  isDirectory() {
    return this.type === 'directory';
  }

  isFile() {
    return this.type === 'file';
  }
}

// Clase principal que maneja el sistema de archivos
class FileSystem {
  constructor() {
    this.root = new FileSystemNode('/', 'directory'); // raíz del sistema de archivos
    this.currentDir = this.root; // directorio actual donde estamos
  }

  // Función para cambiar de directorio
  cd(path) {
    const target = this.resolvePath(path);
    if (target && target.isDirectory()) {
      this.currentDir = target;
      return true;
    }
    return false; // No existe el directorio
  }

  // Función para listar archivos y directorios
  ls() {
    if (!this.currentDir) return [];
    return Array.from(this.currentDir.children.keys());
  }

  // Resolver una ruta en el sistema de archivos
  resolvePath(path) {
    let target = this.currentDir;
    const parts = path.split('/').filter(Boolean); // dividir el path en partes

    for (const part of parts) {
      if (target.isDirectory()) {
        target = target.children.get(part);
        if (!target) return null; // No se encuentra la ruta
      }
    }
    return target;
  }

  // Inicializa la estructura por defecto
  initializeDefaultStructure(structure) {
    const buildStructure = (parent, structure) => {
      for (const [name, value] of Object.entries(structure)) {
        const node = new FileSystemNode(name, typeof value === 'object' ? 'directory' : 'file');
        if (node.isDirectory()) {
          buildStructure(node, value);
        } else {
          node.content = value; // Si es un archivo, agregar contenido
        }
        parent.children.set(name, node);
      }
    };

    buildStructure(this.root, structure);
  }

  // Obtener el directorio actual
  pwd() {
    return this.currentDir.name;
  }
}

// Ahora podemos crear una instancia de FileSystem y usarla

const initialStructure = {
  "thecmdchallenge": {
    "home": {
      "user": {
        "documents": {
          "file1.txt": "contenido del archivo 1",
          "file2.txt": "contenido del archivo 2"
        },
        "downloads": {}
      }
    }
  }
};

const fs = new FileSystem();  // Crear una instancia de FileSystem
fs.initializeDefaultStructure(initialStructure);  // Inicializar la estructura predeterminada

// Aquí puedes probar los comandos

console.log(fs.pwd()); // Debería mostrar '/'
fs.cd('thecmdchallenge'); // Cambia al directorio 'thecmdchallenge'
console.log(fs.pwd()); // Ahora debería mostrar '/thecmdchallenge'
console.log(fs.ls()); // Deberías ver los directorios y archivos dentro de 'thecmdchallenge'




// class FileSystem {


//   constructor() {
//     this.root = new FileSystemNode("/", "directory");
//     this.currentDir = this.root;
//   }
//   // Función para cambiar de directorio
//   cd(path) {
//     const target = this.resolvePath(path);
//     if (target && target.isDirectory()) {
//       this.currentDir = target;
//       return true;
//     }
//     return false; // No existe el directorio
//   }

//   // Función para listar archivos y directorios
//   ls() {
//     if (!this.currentDir) return [];
//     return Array.from(this.currentDir.children.keys());
//   }

//   // Resolver una ruta en el sistema de archivos
//   resolvePath(path) {
//     let target = this.currentDir;
//     const parts = path.split('/').filter(Boolean); // dividir el path en partes

//     for (const part of parts) {
//       if (target.isDirectory()) {
//         target = target.children.get(part);
//         if (!target) return null; // No se encuentra la ruta
//       }
//     }
//     return target;
//   }

//   // Inicializa la estructura por defecto
//   initializeDefaultStructure(structure) {
//     const buildStructure = (parent, structure) => {
//       for (const [name, value] of Object.entries(structure)) {
//         const node = new FileSystemNode(name, typeof value === 'object' ? 'directory' : 'file');
//         if (node.isDirectory()) {
//           buildStructure(node, value);
//         } else {
//           node.content = value; // Si es un archivo, agregar contenido
//         }
//         parent.children.set(name, node);
//       }
//     };

//     buildStructure(this.root, structure);
//   }

//   // Obtener el directorio actual
//   pwd() {
//     return this.currentDir.name;
//   }
//   // Inicializa la estructura por defecto
//   initializeDefaultStructure(structure) {
//     const buildStructure = (parent, structure) => {
//       for (const [name, value] of Object.entries(structure)) {
//         const node = new FileSystemNode(name, typeof value === 'object' ? 'directory' : 'file');
//         if (node.isDirectory()) {
//           buildStructure(node, value);
//         } else {
//           node.content = value; // Si es un archivo, agregar contenido
//         }
//         parent.children.set(name, node);
//       }
//     };

//     buildStructure(this.root, structure);
//   }
//   // Obtener el directorio actual
//   pwd() {
//     return this.currentDir.name;
//   }



//   // Helper method to resolve path
//   resolvePath(path) {
//     if (!path) return this.currentDir;

//     const parts = path.split("/").filter(Boolean);
//     let current = path.startsWith("/") ? this.root : this.currentDir;

//     for (const part of parts) {
//       if (part === "..") {
//         current = current.parent || current;
//       } else if (part !== ".") {
//         const next = current.children.get(part);
//         if (!next) return null;
//         current = next;
//       }
//     }
//     return current;
//   }

//   // Helper to create all parent directories
//   mkdirp(path) {
//     const parts = path.split("/").filter(Boolean);
//     let current = this.currentDir;

//     for (const part of parts) {
//       if (!current.children.has(part)) {
//         const newDir = new FileSystemNode(part, "directory");
//         newDir.parent = current;
//         current.children.set(part, newDir);
//       }
//       current = current.children.get(part);
//     }
//     return "";
//   }

//   // File system operations
//   cat(path) {
//     const target = this.resolvePath(path);
//     if (!target) {
//       return `cat: ${path}: No such file or directory`;
//     }
//     if (target.type === "directory") {
//       return `cat: ${path}: Is a directory`;
//     }
//     return target.content || "";
//   }

//   cp(src, dest) {
//     const sourceNode = this.resolvePath(src);
//     if (!sourceNode) {
//       return `cp: ${src}: No such file or directory`;
//     }
//     if (sourceNode.type === "directory") {
//       return `cp: ${src}: Is a directory`;
//     }

//     const destDir = this.resolvePath(dest);
//     if (destDir && destDir.type === "directory") {
//       const newFile = new FileSystemNode(
//         sourceNode.name,
//         "file",
//         sourceNode.content,
//       );
//       newFile.parent = destDir;
//       destDir.children.set(sourceNode.name, newFile);
//     } else {
//       const parentPath = dest.split("/").slice(0, -1).join("/");
//       const fileName = dest.split("/").pop();
//       const parent = parentPath
//         ? this.resolvePath(parentPath)
//         : this.currentDir;

//       if (!parent) {
//         return `cp: cannot create regular file '${dest}': No such file or directory`;
//       }

//       const newFile = new FileSystemNode(fileName, "file", sourceNode.content);
//       newFile.parent = parent;
//       parent.children.set(fileName, newFile);
//     }
//     return "";
//   }

//   mv(src, dest) {
//     const sourceNode = this.resolvePath(src);
//     if (!sourceNode) {
//       return `mv: ${src}: No such file or directory`;
//     }

//     const destDir = this.resolvePath(dest);
//     if (destDir && destDir.type === "directory") {
//       sourceNode.parent.children.delete(sourceNode.name);
//       sourceNode.parent = destDir;
//       sourceNode.name = sourceNode.name;
//       destDir.children.set(sourceNode.name, sourceNode);
//     } else {
//       const parentPath = dest.split("/").slice(0, -1).join("/");
//       const fileName = dest.split("/").pop();
//       const parent = parentPath
//         ? this.resolvePath(parentPath)
//         : this.currentDir;

//       if (!parent) {
//         return `mv: cannot move '${src}' to '${dest}': No such file or directory`;
//       }

//       sourceNode.parent.children.delete(sourceNode.name);
//       sourceNode.parent = parent;
//       sourceNode.name = fileName;
//       parent.children.set(fileName, sourceNode);
//     }
//     return "";
//   }

//   ls(path, { showHidden = false, recursive = false } = {}) {
//     const target = path ? this.resolvePath(path) : this.currentDir;
//     if (!target) {
//       return `ls: ${path}: No such file or directory`;
//     }
//     if (target.type === "file") {
//       return target.name;
//     }

//     const formatDirectory = (dir, prefix = "") => {
//       let result = "";
//       const entries = Array.from(dir.children.entries());

//       if (prefix) {
//         result += `\n${prefix}:\n`;
//       }

//       const visibleEntries = showHidden
//         ? entries
//         : entries.filter(([name]) => !name.startsWith("."));

//       result += visibleEntries.map(([name]) => name).join("\n");

//       if (recursive) {
//         entries
//           .filter(([, node]) => node.type === "directory")
//           .forEach(([name, node]) => {
//             const newPrefix = prefix ? `${prefix}/${name}` : name;
//             result += formatDirectory(node, newPrefix);
//           });
//       }

//       return result;
//     };

//     return formatDirectory(target);
//   }

//   mkdir(name) {
//     if (!name || name.trim() === "") {
//       return `mkdir: Invalid directory name`;
//     }
//     if (this.currentDir.children.has(name)) {
//       return `mkdir: ${name}: Directory already exists`;
//     }
//     const newDir = new FileSystemNode(name, "directory");
//     newDir.parent = this.currentDir;
//     this.currentDir.children.set(name, newDir);
//     return "";
//   }

//   cd(path) {
//     if (path === "/") {
//       this.currentDir = this.root;
//       return "";
//     }

//     const target = this.resolvePath(path);
//     if (!target) {
//       return `cd: ${path}: No such directory`;
//     }
//     if (target.type !== "directory") {
//       return `cd: ${path}: Not a directory`;
//     }

//     this.currentDir = target;
//     return "";
//   }

//   pwd() {
//     const parts = [];
//     let current = this.currentDir;

//     console.log("Starting from:", current.name); // Depuración

//     while (current) {
//       if (current === this.root) {
//         parts.unshift("");
//         break;
//       }
//       parts.unshift(current.name);
//       current = current.parent;
//     }

//     console.log("Built path parts:", parts); // Depuración
//     return parts.join("/") || "/";
//   }

//   touch(name) {
//     if (this.currentDir.children.has(name)) {
//       return `touch: ${name}: File already exists`;
//     }
//     const newFile = new FileSystemNode(name, "file");
//     newFile.parent = this.currentDir;
//     this.currentDir.children.set(name, newFile);
//     return "";
//   }

//   rm(path) {
//     if (!path) {
//       return "rm: missing operand";
//     }

//     const parts = path.split("/");
//     const name = parts.pop();
//     const parentPath = parts.join("/");
//     const parent = parentPath ? this.resolvePath(parentPath) : this.currentDir;

//     if (!parent || !parent.children.has(name)) {
//       return `rm: ${path}: No such file or directory`;
//     }

//     const target = parent.children.get(name);
//     if (target.type === "directory") {
//       return `rm: ${path}: Is a directory`;
//     }

//     parent.children.delete(name);
//     return "";
//   }

//   rmdir(path) {
//     if (!path) {
//       return "rm: missing operand";
//     }

//     const parts = path.split("/");
//     const name = parts.pop();
//     const parentPath = parts.join("/");
//     const parent = parentPath ? this.resolvePath(parentPath) : this.currentDir;

//     if (!parent || !parent.children.has(name)) {
//       return `rm: ${path}: No such file or directory`;
//     }

//     parent.children.delete(name);
//     return "";
//   }

//   tree(node = this.currentDir, prefix = "", isLast = true) {
//     const nodeType = node.type === "directory" ? "📁" : "📄";
//     const connector = isLast ? "└── " : "├── ";
//     let result =
//       prefix +
//       connector +
//       nodeType +
//       " " +
//       (node === this.root ? "/" : node.name) +
//       "\n";

//     if (node.type === "directory") {
//       const children = Array.from(node.children.values());
//       children.forEach((child, index) => {
//         const isLastChild = index === children.length - 1;
//         const newPrefix = prefix + (isLast ? "    " : "│   ");
//         result += this.tree(child, newPrefix, isLastChild);
//       });
//     }

//     return result;
//   }
// }




// Create and export a single instance
export const fileSystem = new FileSystem();
