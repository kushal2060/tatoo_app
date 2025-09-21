
'use client';

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/util";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white rounded-lg", className)}
      classNames={{
      months: "space-y-4 ",
month: "space-y-4 ",
caption: "flex justify-between items-center px-1 py-2",
caption_label: "text-lg font-semibold",
nav: "flex items-center space-x-4",
nav_button: "p-1.5 hover:bg-gray-100 rounded-full transition-colors",
table: "w-full border-collapse",
head_row: "flex w-full", 
head_cell: "flex-1 text-gray-500 font-normal text-[0.8rem] pt-2 text-center", 
row: "flex w-full mt-2", 
cell: "flex-1 text-center relative p-0", 
day: cn(
  "h-8 w-8 pl-2 font-normal text-sm rounded-full hover:bg-gray-100 transition-colors mx-auto",
  "aria-selected:bg-purple-600 aria-selected:text-white aria-selected:hover:bg-purple-700"
),
day_selected: "bg-purple-600 text-white hover:bg-purple-700",
day_today: "border border-purple-600 rounded-full",
day_outside: "text-gray-400",
day_disabled: "text-gray-300",
...classNames,
      }}
    components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-6 w-6" />
          ) : (
            <ChevronRight className="h-6 w-6" />
          ),
      }}
      {...props}
    />
  );
}

export { Calendar };