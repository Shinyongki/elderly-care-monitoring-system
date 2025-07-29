import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  BarChart3,
  Workflow,
  HardDrive,
  FolderOpen,
  Eye
} from "lucide-react";

const navigation = [
  { name: "대시보드", href: "/", icon: LayoutDashboard },
  { name: "워크플로우", href: "/workflow", icon: Workflow },
  { name: "공무원 설문", href: "/official-survey", icon: FileText },
  { name: "어르신 설문", href: "/elderly-survey", icon: Users },
  { name: "물품 관리", href: "/inventory", icon: Package },
  { name: "데이터 분석", href: "/analysis", icon: BarChart3 },
  { name: "로컬 저장소", href: "/storage", icon: HardDrive },
  { name: "문서 관리", href: "/documents", icon: FolderOpen },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-card border-b border-border sticky top-16 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === "/" ? location === "/" : location.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}