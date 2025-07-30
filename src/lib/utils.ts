import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { TreeItems } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a record of file to a tree structure
 * @param files - Record of file paths to content
 * @returns - Tree structure for TreeView component
 *
 * @example
 * Input:{"src/Button.tsx":"...","Readme.md":"..."}
 * Output:[["src","Button.tsx"],"Readme.md"]
 */

// designed to convert flat file collection into a hierarchical tree structure

export function convertFilesToTreeItem(files: {
  [path: string]: string;
}): TreeItems[] {
  interface TreeNode {
    [key: string]: TreeNode | string; // Either a subfolder (TreeNode) or file content (string)
  }

  // Start with empty tree
  const tree: TreeNode = {};

  // SORT PATHS FOR CONSISTENT OUTPUT
  // Ensures directories appear before files, alphabetical order
  const sortedPaths = Object.keys(files).sort();

  // Process each file path
  for (const filePath of sortedPaths) {
    const parts = filePath.split("/"); // Split path into parts
    let current = tree; // Start at root

    // Build directory structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];

      if (!current[part]) {
        current[part] = {}; // Create directory
      }

      // MOVE DEEPER INTO THE TREE
      current = current[part] as TreeNode;
    }

    // Add file with content
    const fileName = parts[parts.length - 1];
    current[fileName] = files[filePath]; // Add file content
  }

  // RECURSIVE FUNCTION: Convert tree structure to TreeItems format
  function convertNodes(
    node: TreeNode,
    name?: string
  ): TreeItems[] | TreeItems {
    const entries = Object.entries(node);

    if (entries.length === 0) {
      return name || "";
    }

    const children: TreeItems[] = [];

    for (const [key, value] of entries) {
      if (typeof value === "string") {
        children.push(key); // this is a file
      } else {
        // this is a folder
        const subTree = convertNodes(value, key);

        if (Array.isArray(subTree)) {
          children.push([key, ...subTree]);
        } else {
          children.push([key, subTree]);
        }
      }
    }

    return children;
  }

  // CONVERT ROOT TREE TO TreeItems FORMAT
  const result = convertNodes(tree);
  return Array.isArray(result) ? result : [result];
}

/**
Step 1: Building the Internal Tree Structure

Processing "app/page.tsx":
tree = {} → tree = { app: {} } → tree = { app: { "page.tsx": "<div>..." } }

Processing "app/layout.tsx":
tree = { app: { "page.tsx": "..." } } → tree = { app: { "page.tsx": "...", "layout.tsx": "..." } }

Processing "components/Button.tsx":
tree = { ..., components: {} } → tree = { ..., components: { "Button.tsx": "..." } }

Final tree structure:
{
  app: {
    "page.tsx": "<div>Homepage</div>",
    "layout.tsx": "export default function Layout() {...}"
  },
  components: {
    "Button.tsx": "export const Button = () => {...}"
  },
  lib: {
    "utils.ts": "export const cn = () => {...}"
  },
  "README.md": "# My App"
}


Step 2: Converting Tree to TreeItems Format

Internal Tree Structure:
{
  app: { "page.tsx": "...", "layout.tsx": "..." },
  components: { "Button.tsx": "..." },
  lib: { "utils.ts": "..." },
  "README.md": "..."
}

↓ convertNodes() processes each entry ↓

TreeItems Format:
[
  ["app", "page.tsx", "layout.tsx"],      // Directory with files
  ["components", "Button.tsx"],           // Directory with one file
  ["lib", "utils.ts"],                   // Directory with one file
  "README.md"                            // Root-level file
]



-------> Data Flow Visualization <-------

Flat File Paths                Tree Structure              TreeItems Output
───────────────────────────────────────────────────────────────────────────────

"app/page.tsx"           →      app: {                →    ["app",
"app/layout.tsx"         →        "page.tsx": "...",  →      "page.tsx",
"components/Button.tsx"  →        "layout.tsx": "..." →      "layout.tsx"]
"lib/utils.ts"           →      },                    →
"README.md"              →      components: {         →    ["components",
                         →        "Button.tsx": "..." →      "Button.tsx"]
                         →      },                    →
                         →      lib: {                →    ["lib",
                         →        "utils.ts": "..."   →      "utils.ts"]
                         →      },                    →
                         →      "README.md": "..."    →    "README.md"

 */
