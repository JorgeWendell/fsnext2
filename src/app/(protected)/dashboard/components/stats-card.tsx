"use client";

import {
  BookImage,
  CircleDollarSign,
  GraduationCap,
  School,
  TrendingUp,
  UserPen,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const iconMap: Record<string, LucideIcon> = {
  GraduationCap,
  School,
  UserPen,
  CircleDollarSign,
  BookImage,
  TrendingUp,
};

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName: keyof typeof iconMap;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  gradient?: string;
}

export function StatsCard({
  title,
  value,
  description,
  iconName,
  trend,
  gradient = "from-blue-500/10 to-purple-500/10",
}: StatsCardProps) {
  const Icon = iconMap[iconName] || GraduationCap;

  return (
    <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`} />
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`rounded-full bg-background/80 p-2 backdrop-blur-sm`}>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground">vs mês anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

