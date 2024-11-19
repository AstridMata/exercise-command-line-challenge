class FileSystemNode {
  constructor(name, type = 'file', content = '') {
    this.name = name;
    this.type = type; // 'file' or 'directory'
    this.content = content;
    this.children = new Map(); // For directories
    this.parent = null;
  }
}

class FileSystem {
  constructor() {
    this.root = new FileSystemNode('/', 'directory');
    this.currentDir = this.root;
    this.initializeDefaultStructure();
  }

  initializeDefaultStructure() {
    // Helper function to recursively create the structure
    const createStructure = (parentNode, structure) => {
      for (const [name, value] of Object.entries(structure)) {
        const isFile = typeof value === 'string';
        const node = new FileSystemNode(name, isFile ? 'file' : 'directory', isFile ? value : '');
        node.parent = parentNode;
        parentNode.children.set(name, node);
        
        if (!isFile) {
          createStructure(node, value);
        }
      }
    };

    // Default challenge structure
    const defaultStructure = {
      thecmdchallenge: {
        "the-ultimate-joke.txt": "",
        "small-name": {
          "level1": {
            "level2": {
              "level3": {
                "level4": {
                  "level5": {
                    "level6": {
                      "trophy.txt": ""
                    }
                  }
                }
              }
            }
          }
        },
        "funcode": {
          "kids.jpg": "",
          "the-most-funny": {},
          "images": {
            "hello": {}
          }
        },
        "boringfolder": {
          "child": {
            "the-mostboring-text.txt": ""
          }
        },
        "kamehameha": {
          "dragon-ball-jokes.md": ""
        }
      }
    };

    createStructure(this.root, defaultStructure);
  }

  // Helper method to resolve path
  resolvePath(path) {
    if (!path) return this.currentDir;
    
    const parts = path.split('/').filter(Boolean);
    let current = path.startsWith('/') ? this.root : this.currentDir;
    
    for (const part of parts) {
      if (part === '..') {
        current = current.parent || current;
      } else if (part !== '.') {
        const next = current.children.get(part);
        if (!next) return null;
        current = next;
      }
    }
    return current;
  }

  // Helper to create all parent directories
  mkdirp(path) {
    const parts = path.split('/').filter(Boolean);
    let current = this.currentDir;
    
    for (const part of parts) {
      if (!current.children.has(part)) {
        const newDir = new FileSystemNode(part, 'directory');
        newDir.parent = current;
        current.children.set(part, newDir);
      }
      current = current.children.get(part);
    }
    return '';
  }

  // File system operations
  mkdir(name) {
    if (this.currentDir.children.has(name)) {
      return `mkdir: ${name}: Directory already exists`;
    }
    const newDir = new FileSystemNode(name, 'directory');
    newDir.parent = this.currentDir;
    this.currentDir.children.set(name, newDir);
    return '';
  }

  cd(path) {
    if (path === '/') {
      this.currentDir = this.root;
      return '';
    }
    
    const target = this.resolvePath(path);
    if (!target) {
      return `cd: ${path}: No such directory`;
    }
    if (target.type !== 'directory') {
      return `cd: ${path}: Not a directory`;
    }
    
    this.currentDir = target;
    return '';
  }

  ls(path) {
    const target = path ? this.resolvePath(path) : this.currentDir;
    if (!target) {
      return `ls: ${path}: No such file or directory`;
    }
    if (target.type === 'file') {
      return target.name;
    }
    return Array.from(target.children.keys()).join('\n') || '';
  }

  pwd() {
    const parts = [];
    let current = this.currentDir;
    while (current) {
      if (current === this.root) {
        parts.unshift('');
        break;
      }
      parts.unshift(current.name);
      current = current.parent;
    }
    return parts.join('/') || '/';
  }

  touch(name) {
    if (this.currentDir.children.has(name)) {
      return `touch: ${name}: File already exists`;
    }
    const newFile = new FileSystemNode(name, 'file');
    newFile.parent = this.currentDir;
    this.currentDir.children.set(name, newFile);
    return '';
  }

  rm(path) {
    if (!path) {
      return 'rm: missing operand';
    }
    
    const parts = path.split('/');
    const name = parts.pop();
    const parentPath = parts.join('/');
    const parent = parentPath ? this.resolvePath(parentPath) : this.currentDir;
    
    if (!parent || !parent.children.has(name)) {
      return `rm: ${path}: No such file or directory`;
    }
    
    const target = parent.children.get(name);
    if (target.type === 'directory') {
      return `rm: ${path}: Is a directory`;
    }
    
    parent.children.delete(name);
    return '';
  }

  rmdir(path) {
    if (!path) {
      return 'rm: missing operand';
    }
    
    const parts = path.split('/');
    const name = parts.pop();
    const parentPath = parts.join('/');
    const parent = parentPath ? this.resolvePath(parentPath) : this.currentDir;
    
    if (!parent || !parent.children.has(name)) {
      return `rm: ${path}: No such file or directory`;
    }
    
    parent.children.delete(name);
    return '';
  }

  tree(node = this.currentDir, prefix = '', isLast = true) {
    const nodeType = node.type === 'directory' ? '📁' : '📄';
    const connector = isLast ? '└── ' : '├── ';
    let result = prefix + connector + nodeType + ' ' + (node === this.root ? '/' : node.name) + '\n';
    
    if (node.type === 'directory') {
      const children = Array.from(node.children.values());
      children.forEach((child, index) => {
        const isLastChild = index === children.length - 1;
        const newPrefix = prefix + (isLast ? '    ' : '│   ');
        result += this.tree(child, newPrefix, isLastChild);
      });
    }
    
    return result;
  }
}

// Create and export a single instance
export const fileSystem = new FileSystem();
