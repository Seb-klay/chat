import { UserIcon, Cog6ToothIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";

// add routes here to be displayed on sideBar
export const publicSidebarRoutes = [
  { name: "Account", href: "/account", icon: UserIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { name: "Documents", href: "/documents", icon: DocumentDuplicateIcon },
];


export const privateSidebarRoutes = [];
