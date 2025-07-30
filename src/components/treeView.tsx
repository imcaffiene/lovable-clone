import { TreeItems } from "@/lib/types";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRightIcon, FileIcon, FolderIcon } from "lucide-react";

interface TreeViewProps {
  data: TreeItems[];
  value?: string | null;
  onSelect?: (value: string) => void;
}

// MAIN TREE VIEW COMPONENT
export const TreeView = ({ data, value, onSelect }: TreeViewProps) => {

  return (
    <SidebarProvider>
      <Sidebar collapsible="none" className="w-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>

                {/* RENDER TOP-LEVEL TREE ITEMS */}
                {data.map((item, index) => (
                  <Tree
                    key={index}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
};


// RECURSIVE TREE ITEM COMPONENT
interface TreeProps {
  item: TreeItems;             // Single tree item (file or folder)
  selectedValue?: string | null; // Currently selected file path
  onSelect?: (value: string) => void; // Selection callback
  parentPath: string;          // Path of parent directory
}

const Tree = ({ item, parentPath, onSelect, selectedValue }: TreeProps) => {

  /**
  * DESTRUCTURE TREE ITEM
  * For files: item = "filename.txt" → name = "filename.txt", items = []
  * For folders: item = ["folder", ...children] → name = "folder", items = children
  */
  const [name, ...items] = Array.isArray(item) ? item : [item];

  /**
   * Build current file path
   * Combines parent path with current item name
   * Examples: "" + "README.md" = "README.md" "app" + "page.tsx" = "app/page.tsx"
   */
  const currentPath = parentPath ? `${parentPath}/${name}` : name;


  // CASE 1: FILE (no children)
  if (!items.length) {
    const isSelected = selectedValue === currentPath;

    return (
      <SidebarMenuButton
        isActive={isSelected}
        className="data-[is-active=true]:bg-transparent"
        onClick={() => onSelect?.(currentPath)}
      >
        <FileIcon />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }


  // CASE 2: FOLDER (has children)
  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRightIcon className="transition-transform " />
            <FolderIcon />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>

            {/* RECURSIVELY RENDER CHILD ITEMS */}
            {items.map((subItem, index) => (
              <Tree
                key={index}
                item={subItem}
                selectedValue={selectedValue}
                onSelect={onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};













/** 

SidebarProvider
└── Sidebar
    ├── SidebarContent
    │   └── SidebarGroup
    │       └── SidebarGroupContent
    │           └── SidebarMenu
    │               └── Tree (recursive)
    │                   ├── SidebarMenuButton (for files)
    │                   └── SidebarMenuItem (for folders)
    │                       └── Collapsible
    │                           ├── CollapsibleTrigger
    │                           └── CollapsibleContent
    │                               └── SidebarMenuSub
    │                                   └── Tree (recursion)
    └── SidebarRail

    */