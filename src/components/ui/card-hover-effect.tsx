import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  KeyRound,
  CreditCard,
  BarChart,
  Database,
  Layers,
  Cloud,
  LucideIcon,
} from "lucide-react";

// Map of icons based on card title
const iconMap: Record<string, LucideIcon> = {
  Authentication: KeyRound,
  Payments: CreditCard,
  Analytics: BarChart,
  Database: Database,
  "UI Components": Layers,
  Deployment: Cloud,
};

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description: string;
    link: string;
    icon?: LucideIcon;
  }[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {items.map((item, idx) => {
        // Use provided icon or fallback to the map based on title
        const IconComponent = item.icon || iconMap[item.title] || KeyRound;

        return (
          <a
            href={item?.link}
            key={item?.link}
            className="relative group block p-2 h-full w-full"
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <AnimatePresence>
              {hoveredIndex === idx && (
                <motion.span
                  className="absolute inset-0 h-full w-full bg-sky-100/80 dark:bg-sky-900/30 block rounded-3xl shadow-lg shadow-sky-200/50 dark:shadow-sky-800/30"
                  layoutId="hoverBackground"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    transition: { duration: 0.15 },
                  }}
                  exit={{
                    opacity: 0,
                    transition: { duration: 0.15, delay: 0.2 },
                  }}
                />
              )}
            </AnimatePresence>
            <Card>
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/50 mr-3">
                  <IconComponent className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                </div>
              </div>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </Card>
          </a>
        );
      })}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md shadow-sky-100/40 dark:shadow-sky-900/20 group-hover:shadow-lg group-hover:shadow-sky-200/50 dark:group-hover:shadow-sky-800/30 group-hover:border-sky-200 dark:group-hover:border-sky-700 relative z-20 transform transition-all duration-300 ease-in-out group-hover:-translate-y-1",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4
      className={cn(
        "text-slate-900 dark:text-slate-100 font-bold tracking-wide mt-4",
        className
      )}
    >
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-8 text-slate-600 dark:text-slate-300 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
