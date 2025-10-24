import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Switch } from "./switch"
import { Label } from "./label"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, placeholder = "Pick a date", className }) {
  const [hasEndDate, setHasEndDate] = React.useState(!!endDate)
  const [selectingEnd, setSelectingEnd] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (date) => {
    if (!hasEndDate) {
      // Single date mode
      const formatted = format(date, 'yyyy-MM-dd')
      onStartDateChange(formatted)
      setOpen(false)
    } else {
      // Timeline mode
      if (selectingEnd) {
        // Selecting end date
        if (startDate && date < new Date(startDate)) {
          return
        }
        const formatted = format(date, 'yyyy-MM-dd')
        onEndDateChange(formatted)
        setOpen(false)
      } else {
        // Selecting start date
        const formatted = format(date, 'yyyy-MM-dd')
        onStartDateChange(formatted)
        if (!endDate) {
          setSelectingEnd(true)
        }
      }
    }
  }

  const handleToggleEndDate = (checked) => {
    setHasEndDate(checked)
    if (!checked) {
      onEndDateChange(null)
      setSelectingEnd(false)
    } else {
      setSelectingEnd(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return null
    return format(new Date(date), "MMM d, yyyy")
  }

  const displayText = React.useMemo(() => {
    if (!startDate) return placeholder
    if (!hasEndDate || !endDate) return formatDate(startDate)
    return `${formatDate(startDate)} → ${formatDate(endDate)}`
  }, [startDate, endDate, hasEndDate, placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {hasEndDate && (
            <div className="flex gap-0 border-b">
              <button
                type="button"
                onClick={() => setSelectingEnd(false)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-r ${
                  !selectingEnd
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {formatDate(startDate) || "Start"}
              </button>
              <button
                type="button"
                onClick={() => setSelectingEnd(true)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  selectingEnd
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {formatDate(endDate) || "End"}
              </button>
            </div>
          )}
          
          <Calendar
            mode="single"
            selected={selectingEnd ? (endDate ? new Date(endDate) : null) : (startDate ? new Date(startDate) : null)}
            onSelect={handleDateSelect}
            disabled={hasEndDate && selectingEnd && startDate ? (date) => date < new Date(startDate) : undefined}
          />
          
          <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50 rounded-b-lg">
            <Label htmlFor="end-date-toggle" className="text-sm font-medium text-gray-700 cursor-pointer">
              End date
            </Label>
            <Switch
              id="end-date-toggle"
              checked={hasEndDate}
              onCheckedChange={handleToggleEndDate}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
