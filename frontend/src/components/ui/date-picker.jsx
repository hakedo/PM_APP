import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, minDate, maxDate }) {
  const [open, setOpen] = React.useState(false);
  
  const handleSelect = (date) => {
    if (date) {
      // Format as YYYY-MM-DD for consistency with Input type="date"
      const formatted = format(date, 'yyyy-MM-dd');
      onChange(formatted);
      setOpen(false);
    }
  };

  const displayDate = value ? format(new Date(value), 'MM/dd/yyyy') : null;

  // Prepare disabled dates matcher
  const disabledMatcher = (date) => {
    if (minDate && date < new Date(minDate)) {
      return true;
    }
    if (maxDate && date > new Date(maxDate)) {
      return true;
    }
    return false;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ? new Date(value) : undefined}
          onSelect={handleSelect}
          disabled={disabledMatcher}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
