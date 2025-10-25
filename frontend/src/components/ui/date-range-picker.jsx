import * as React from "react"
import { Calendar } from "./calendar"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Button } from "./button"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, placeholder = "Pick a date", className, projectStartDate }) {
  const [selectingEnd, setSelectingEnd] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleDateSelect = (date) => {
    // Always in range mode
    if (selectingEnd) {
      // Selecting end date
      if (startDate && date < new Date(startDate)) {
        return
      }
      // Format as YYYY-MM-DD using the date components directly to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      onEndDateChange(formatted)
      setOpen(false)
      setSelectingEnd(false)
    } else {
      // Selecting start date
      // Format as YYYY-MM-DD using the date components directly to avoid timezone issues
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      onStartDateChange(formatted)
      // Auto-switch to selecting end date
      setSelectingEnd(true)
    }
  }

  const parseDate = (dateString) => {
    if (!dateString) return null
    
    // Handle YYYY-MM-DD format as local date
    if (typeof dateString === 'string' && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number)
      return new Date(year, month - 1, day, 0, 0, 0, 0)
    }
    
    return new Date(dateString)
  }

  const formatDate = (date) => {
    if (!date) return null
    
    let dateObj
    if (typeof date === 'string') {
      if (date.includes('T')) {
        // ISO timestamp - extract date portion directly from string
        const datePart = date.split('T')[0]
        const [year, month, day] = datePart.split('-').map(Number)
        dateObj = new Date(year, month - 1, day)
      } else if (date.includes('-')) {
        // YYYY-MM-DD format
        const [year, month, day] = date.split('-').map(Number)
        dateObj = new Date(year, month - 1, day)
      } else {
        dateObj = new Date(date)
      }
    } else {
      dateObj = date
    }
    
    return format(dateObj, "MMM d, yyyy")
  }

  const displayText = React.useMemo(() => {
    if (!startDate) return placeholder
    if (!endDate) return formatDate(startDate)
    return `${formatDate(startDate)} → ${formatDate(endDate)}`
  }, [startDate, endDate, placeholder])

  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        setSelectingEnd(false)
      }
    }}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={className}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex gap-1 bg-gray-100 p-1 mx-2 mt-2 rounded-md">
            <button
              type="button"
              onClick={() => setSelectingEnd(false)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                !selectingEnd
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {formatDate(startDate) || "Start"}
            </button>
            <button
              type="button"
              onClick={() => setSelectingEnd(true)}
              className={`flex-1 px-3 py-1.5 text-xs font-medium rounded transition-all whitespace-nowrap ${
                selectingEnd
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {formatDate(endDate) || "End"}
            </button>
          </div>
          
          <Calendar
            mode="single"
            selected={selectingEnd ? (endDate ? new Date(endDate) : null) : (startDate ? new Date(startDate) : null)}
            onSelect={handleDateSelect}
            disabled={(date) => {
              // When selecting end date, disable dates before start date
              if (selectingEnd && startDate) {
                return date < new Date(startDate)
              }
              // When selecting start date, disable dates before project start date
              if (!selectingEnd && projectStartDate) {
                const projectStart = parseDate(projectStartDate)
                if (projectStart) {
                  // Set both dates to midnight for comparison
                  const checkDate = new Date(date)
                  checkDate.setHours(0, 0, 0, 0)
                  projectStart.setHours(0, 0, 0, 0)
                  // Disable dates strictly before project start (allow same day)
                  return checkDate < projectStart
                }
              }
              return false
            }}
            selectedRange={startDate && endDate ? { start: startDate, end: endDate } : null}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
