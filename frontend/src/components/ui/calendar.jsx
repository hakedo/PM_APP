import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Parse date string to local Date object
const parseDate = (dateString) => {
  if (!dateString) return null
  // If it's already a full ISO string, parse it directly
  if (dateString.includes('T')) {
    return new Date(dateString)
  }
  // If it's just YYYY-MM-DD, treat it as local date
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  selectedRange,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = React.useState(
    selected ? new Date(selected) : new Date()
  )

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      })
    }

    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i)
      dayDate.setHours(12, 0, 0, 0) // Set to noon for consistent time handling
      days.push({
        date: dayDate,
        isCurrentMonth: true,
      })
    }

    // Next month's days
    const remainingDays = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      })
    }

    return days
  }

  const days = getDaysInMonth(currentMonth)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return
    
    const isDisabled = disabled && typeof disabled === 'function' && disabled(day.date)
    if (isDisabled) return

    // Log what we're about to send
    console.log('Calendar sending date:', {
      original: day.date,
      year: day.date.getFullYear(),
      month: day.date.getMonth(),
      date: day.date.getDate(),
      toString: day.date.toString()
    })

    // Create a clean date object with noon time
    const cleanDate = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate(), 12, 0, 0, 0)
    console.log('Clean date being sent:', cleanDate.toString())
    
    onSelect && onSelect(cleanDate)
  }

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false
    const d1 = date1 instanceof Date ? date1 : parseDate(date1)
    const d2 = date2 instanceof Date ? date2 : parseDate(date2)
    d1.setHours(0, 0, 0, 0)
    d2.setHours(0, 0, 0, 0)
    return d1.getTime() === d2.getTime()
  }

  const isToday = (date) => isSameDay(date, today)
  const isSelected = (date) => selected && isSameDay(date, selected)
  
  const isInRange = (date) => {
    if (!selectedRange || !selectedRange.start || !selectedRange.end) return false
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const start = parseDate(selectedRange.start)
    start.setHours(0, 0, 0, 0)
    const end = parseDate(selectedRange.end)
    end.setHours(0, 0, 0, 0)
    return d >= start && d <= end
  }
  
  const isRangeStart = (date) => {
    if (!selectedRange || !selectedRange.start) return false
    return isSameDay(date, selectedRange.start)
  }
  
  const isRangeEnd = (date) => {
    if (!selectedRange || !selectedRange.end) return false
    return isSameDay(date, selectedRange.end)
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-sm font-medium text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-0.5 hover:bg-gray-100 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="px-3 pb-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="h-6 flex items-center justify-center text-xs font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isDisabled = disabled && typeof disabled === 'function' && disabled(day.date)
            const dayIsToday = isToday(day.date)
            const dayIsSelected = isSelected(day.date)
            const inRange = isInRange(day.date)
            const rangeStart = isRangeStart(day.date)
            const rangeEnd = isRangeEnd(day.date)

            return (
              <div key={index} className="relative">
                {/* Background for range - continuous across cells */}
                {inRange && !rangeStart && !rangeEnd && day.isCurrentMonth && (
                  <div className="absolute inset-0 bg-blue-100" />
                )}
                {rangeStart && day.isCurrentMonth && (
                  <div className="absolute inset-0 bg-blue-100" style={{ borderTopLeftRadius: '0.25rem', borderBottomLeftRadius: '0.25rem' }} />
                )}
                {rangeEnd && day.isCurrentMonth && (
                  <div className="absolute inset-0 bg-blue-100" style={{ borderTopRightRadius: '0.25rem', borderBottomRightRadius: '0.25rem' }} />
                )}
                
                <button
                  type="button"
                  onClick={() => handleDayClick(day)}
                  disabled={isDisabled || !day.isCurrentMonth}
                  className={cn(
                    "h-7 w-full flex items-center justify-center text-xs transition-colors relative z-10",
                    "hover:bg-gray-200 rounded",
                    !day.isCurrentMonth && "text-gray-300 hover:bg-transparent cursor-default",
                    day.isCurrentMonth && "text-gray-900",
                    dayIsToday && !rangeStart && !rangeEnd && "ring-1 ring-blue-400 ring-inset font-medium rounded",
                    (rangeStart || rangeEnd) && "bg-blue-500 text-white font-semibold rounded shadow-sm",
                    isDisabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
                  )}
                >
                  {day.date.getDate()}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { Calendar }
