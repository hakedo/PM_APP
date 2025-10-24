import * as React from "react"
import { Calendar } from "./calendar"
import { Label } from "./label"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function InlineDatePicker({ startDate, endDate, onStartDateChange, onEndDateChange, className }) {
  const [selectingEnd, setSelectingEnd] = React.useState(false)
  const [duration, setDuration] = React.useState(7)
  const [durationType, setDurationType] = React.useState("days") // "days" or "weeks"
  const [startDateInput, setStartDateInput] = React.useState("")
  const [endDateInput, setEndDateInput] = React.useState("")

  // Parse date string to local Date object
  const parseDate = (dateString) => {
    if (!dateString) return null
    // If it's already a full ISO string with timezone, parse it directly
    if (dateString.includes('T')) {
      return new Date(dateString)
    }
    // If it's just YYYY-MM-DD, treat it as local date
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day, 12, 0, 0, 0)
  }

  const formatDate = (date) => {
    if (!date) return null
    const dateObj = parseDate(date)
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, '0')
    const day = String(dateObj.getDate()).padStart(2, '0')
    return `${month}/${day}/${year}`
  }

  // Update duration when dates change
  React.useEffect(() => {
    if (startDate && endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Update duration based on type
      if (durationType === "weeks") {
        setDuration(Math.ceil(diffDays / 7))
      } else {
        setDuration(diffDays)
      }
    }
  }, [startDate, endDate, durationType])

  // Update input fields when dates change
  React.useEffect(() => {
    setStartDateInput(startDate ? formatDate(startDate) : "")
  }, [startDate])

  React.useEffect(() => {
    setEndDateInput(endDate ? formatDate(endDate) : "")
  }, [endDate])

  const handleDateSelect = (date) => {
    // Extract date components to avoid any timezone issues
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}`
    
    if (selectingEnd) {
      // Selecting end date
      if (startDate && date < parseDate(startDate)) {
        return
      }
      onEndDateChange(formatted)
    } else {
      // Selecting start date
      onStartDateChange(formatted)
      // Automatically switch to end date selection
      setSelectingEnd(true)
      
      // If no end date, set it to 7 days from start
      if (!endDate) {
        const newEnd = new Date(date)
        newEnd.setDate(newEnd.getDate() + 7)
        const endYear = newEnd.getFullYear()
        const endMonth = String(newEnd.getMonth() + 1).padStart(2, '0')
        const endDay = String(newEnd.getDate()).padStart(2, '0')
        onEndDateChange(`${endYear}-${endMonth}-${endDay}`)
      }
    }
  }

  const handleDurationChange = (value) => {
    const amount = parseInt(value)
    if (isNaN(amount) || amount < 0) return
    
    setDuration(amount)
    if (startDate) {
      const start = parseDate(startDate)
      const newEnd = new Date(start)
      
      // Calculate based on duration type
      if (durationType === "weeks") {
        newEnd.setDate(newEnd.getDate() + (amount * 7))
      } else {
        newEnd.setDate(newEnd.getDate() + amount)
      }
      
      const year = newEnd.getFullYear()
      const month = String(newEnd.getMonth() + 1).padStart(2, '0')
      const day = String(newEnd.getDate()).padStart(2, '0')
      onEndDateChange(`${year}-${month}-${day}`)
    }
  }

  const handleDurationTypeChange = (type) => {
    setDurationType(type)
    
    // Recalculate duration in new units
    if (startDate && endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)
      const diffTime = end - start
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (type === "weeks") {
        setDuration(Math.ceil(diffDays / 7))
      } else {
        setDuration(diffDays)
      }
    }
  }

  const handleStartDateInput = (value) => {
    setStartDateInput(value)
    // Try to parse MM/DD/YYYY format
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
      const [, month, day, year] = match
      const m = parseInt(month)
      const d = parseInt(day)
      const y = parseInt(year)
      
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        onStartDateChange(formatted)
      }
    }
  }

  const handleEndDateInput = (value) => {
    setEndDateInput(value)
    // Try to parse MM/DD/YYYY format
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (match) {
      const [, month, day, year] = match
      const m = parseInt(month)
      const d = parseInt(day)
      const y = parseInt(year)
      
      if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        const formatted = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        onEndDateChange(formatted)
      }
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="space-y-2">
        {/* Date Inputs Row */}
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1 px-1">Start date</div>
            <Input
              type="text"
              value={startDateInput}
              onChange={(e) => handleStartDateInput(e.target.value)}
              onClick={() => setSelectingEnd(false)}
              placeholder="MM/DD/YYYY"
              className={cn(
                "h-8 text-xs transition-colors",
                !selectingEnd
                  ? "border-2 border-blue-500"
                  : "border border-gray-300"
              )}
            />
          </div>
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1 px-1">End date</div>
            <Input
              type="text"
              value={endDateInput}
              onChange={(e) => handleEndDateInput(e.target.value)}
              onClick={() => setSelectingEnd(true)}
              placeholder="MM/DD/YYYY"
              disabled={!startDate}
              className={cn(
                "h-8 text-xs transition-colors",
                selectingEnd
                  ? "border-2 border-blue-500"
                  : "border border-gray-300"
              )}
            />
          </div>
          <div className="flex-[0.8]">
            <div className="text-xs text-gray-500 mb-1 px-1">Duration</div>
            <div className="relative">
              <Input
                type="number"
                value={duration}
                onChange={(e) => handleDurationChange(e.target.value)}
                placeholder="0"
                min="0"
                disabled={!startDate}
                className="h-8 text-xs pr-12"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
                {durationType}
              </span>
            </div>
            
            {/* Duration Type Radio Buttons */}
            <div className="flex items-center gap-3 px-1 mt-1">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="durationType"
                  value="days"
                  checked={durationType === "days"}
                  onChange={(e) => handleDurationTypeChange(e.target.value)}
                  className="w-3 h-3 text-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-700">Days</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="durationType"
                  value="weeks"
                  checked={durationType === "weeks"}
                  onChange={(e) => handleDurationTypeChange(e.target.value)}
                  className="w-3 h-3 text-blue-500 cursor-pointer"
                />
                <span className="text-xs text-gray-700">Weeks</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Calendar */}
        <Calendar
          mode="single"
          selected={selectingEnd ? (endDate ? parseDate(endDate) : null) : (startDate ? parseDate(startDate) : null)}
          onSelect={handleDateSelect}
          disabled={selectingEnd && startDate ? (date) => date < parseDate(startDate) : undefined}
          selectedRange={startDate && endDate ? { start: startDate, end: endDate } : null}
          className="border rounded-md"
        />
      </div>
    </div>
  )
}
