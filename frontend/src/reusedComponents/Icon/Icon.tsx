import type { LucideProps } from "lucide-react";
import {
  Home,
  LayoutDashboard,
  Users,
  Bell,
  Shield,
  Settings,
  User,
  LogOut,
  Menu,
  Search,
  ChevronDown,
  Sun,
  Moon,
  X,
  Folder,
  Building2,
  Database,
  Plus,
  Mail,
  Trash2,
  Power,
  MessageCircle,
} from "lucide-react";

const ICONS = {
  home: Home,
  dashboard: LayoutDashboard,
  users: Users,
  bell: Bell,
  shield: Shield,
  settings: Settings,
  user: User,
  logout: LogOut,
  menu: Menu,
  search: Search,
  chevronDown: ChevronDown,
  sun: Sun,
  moon: Moon,
  close: X,
  folder: Folder,
  building: Building2,
  database: Database,
  plus: Plus,
  mail: Mail,
  trash: Trash2,
  power: Power,
  chat: MessageCircle,
} satisfies Record<string, React.ComponentType<LucideProps>>;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
  size?: number;
}

export function Icon({ name, size = 20, ...rest }: IconProps) {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} strokeWidth={2} aria-hidden="true" {...rest} />;
}
