import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  calendarProps?: React.ComponentProps<typeof Calendar>;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
  className,
  calendarProps,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | { from?: Date; to?: Date } | undefined) => {
    let chosen: Date | undefined;
    if (!selectedDate) chosen = undefined;
    else if (selectedDate instanceof Date) chosen = selectedDate;
    else chosen = (selectedDate as { from?: Date }).from;

    onDateChange?.(chosen);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, "dd/MM/yyyy", { locale: es })
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {/* Build props as any to avoid DayPicker/Calendar union typing issues in TS */}
          {(() => {
            const pickerProps = {
              mode: 'single',
              selected: date,
              onSelect: (d: unknown) => handleDateSelect(d as Date | { from?: Date; to?: Date } | undefined),
              initialFocus: true,
              ...(calendarProps as React.ComponentProps<typeof Calendar>)
            } as React.ComponentProps<typeof Calendar>;
            return <Calendar {...pickerProps} />;
          })()}
        </PopoverContent>
    </Popover>
  );
}

interface DateRangePickerProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange?: (date: Date | undefined) => void;
  onDateToChange?: (date: Date | undefined) => void;
  placeholderFrom?: string;
  placeholderTo?: string;
  disabled?: boolean;
  className?: string;
}

export function DateRangePicker({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  placeholderFrom = "Fecha desde",
  placeholderTo = "Fecha hasta",
  disabled = false,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      <DatePicker
        date={dateFrom}
        onDateChange={onDateFromChange}
        placeholder={placeholderFrom}
        disabled={disabled}
        calendarProps={{
          toDate: dateTo,
        }}
      />
      <DatePicker
        date={dateTo}
        onDateChange={onDateToChange}
        placeholder={placeholderTo}
        disabled={disabled}
        calendarProps={{
          fromDate: dateFrom,
        }}
      />
    </div>
  );
}