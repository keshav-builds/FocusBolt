"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

interface ThemedTabsListProps extends React.ComponentProps<typeof TabsPrimitive.List> {
  themeStyle?: React.CSSProperties;
}

function TabsList({
  className,
  themeStyle,
  style,
  ...props
}: ThemedTabsListProps) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] transition-all duration-300",
        className
      )}
      style={{
        ...themeStyle,
        ...style
      }}
      {...props}
    />
  )
}

interface ThemedTabsTriggerProps extends React.ComponentProps<typeof TabsPrimitive.Trigger> {
  themeStyle?: React.CSSProperties;
  activeThemeStyle?: React.CSSProperties;
  isActive?: boolean;
}

function TabsTrigger({
  className,
  themeStyle,
  activeThemeStyle,
  isActive,
  style,
  ...props
}: ThemedTabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all duration-200 focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring",
        className
      )}
      style={{
        ...themeStyle,
        ...(isActive && activeThemeStyle),
        ...style
      }}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
