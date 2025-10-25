import * as React from "react"
import { Calendar } from "./calendar"
import { Label } from "./label"
import { Input } from "./input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export function InlineDatePicker({ startDate, endDate, onStartDateChange, onEndDateChange, onBothDatesChange, validateStartDate, projectStartDate, className }) {
  const [selectingEnd, setSelectingEnd] = React.useState(false)
  const [duration, setDuration] = React.useState(7)
  const [durationType, setDurationType] = React.useState("days") // "days" or "weeks"
  const [startDateInput, setStartDateInput] = React.useState("")
  const [endDateInput, setEndDateInput] = React.useState("")
  const [initialized, setInitialized] = React.useState(false)

  // Initialize - always start with start date selection
  React.useEffect(() => {
    console.log('InlineDatePicker initialized:', { startDate, endDate, selectingEnd })
    if (!initialized) {
      setSelectingEnd(false)
      setInitialized(true)
    }
  }, [initialized, startDate, endDate, selectingEnd])

  // Reset to start date selection when component mounts or when both dates are cleared
  React.useEffect(() => {
    if (!startDate && !endDate) {
      setSelectingEnd(false)
    }
  }, [startDate, endDate])

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
      
      // Calculate the number of days between dates (inclusive)
      // We need to count both the start and end dates
      const diffTime = end - start
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
      
      // Add 1 to make it inclusive (e.g., Oct 22 to Oct 24 = 3 days: 22, 23, 24)
      const actualDays = diffDays + 1
      
      console.log('🔄 useEffect recalculating duration:', { 
        startDate, 
        endDate, 
        diffDays, 
        actualDays, 
        durationType,
        currentDuration: duration
      })
      
      // Update duration based on type
      if (durationType === "weeks") {
        const calculatedWeeks = Math.round(actualDays / 7)
        console.log('📊 Weeks calculation:', { actualDays, calculatedWeeks })
        setDuration(calculatedWeeks)
      } else {
        setDuration(actualDays)
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
    // Extract date components to format as YYYY-MM-DD
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const formatted = `${year}-${month}-${day}`
    
    console.log('📅 handleDateSelect called:', { 
      selectingEnd, 
      startDate, 
      endDate, 
      formatted,
      willSetStartDate: !selectingEnd,
      willSetEndDate: selectingEnd
    })
    
    if (selectingEnd) {
      // Selecting end date
      console.log('✅ Setting END date to:', formatted)
      if (startDate) {
        const start = parseDate(startDate)
        start.setHours(0, 0, 0, 0)
        const selectedDate = new Date(date)
        selectedDate.setHours(0, 0, 0, 0)
        
        // Allow end date to be same as or after start date (allows single-day deliverables)
        if (selectedDate < start) {
          console.log('❌ End date is before start date, rejecting')
          return
        }
      }
      onEndDateChange(formatted)
    } else {
      // Selecting start date
      console.log('✅ Setting START date to:', formatted)
      
      // Validate the start date before proceeding
      if (validateStartDate && !validateStartDate(formatted)) {
        console.log('❌ Start date validation failed, not setting end date or switching mode')
        // Still call onStartDateChange to trigger error display
        onStartDateChange(formatted)
        // Do NOT set end date, do NOT switch to end date mode
        return
      }
      
      // If end date exists and is before new start date, adjust end date to match start date
      if (endDate) {
        const end = parseDate(endDate)
        end.setHours(0, 0, 0, 0)
        const selectedDate = new Date(date)
        selectedDate.setHours(0, 0, 0, 0)
        
        if (end < selectedDate) {
          // Set both dates at once to avoid state inconsistency
          console.log('📝 Adjusting end date to match start date')
          if (onBothDatesChange) {
            onBothDatesChange(formatted, formatted)
          } else {
            onStartDateChange(formatted)
            onEndDateChange(formatted)
          }
        } else {
          onStartDateChange(formatted)
        }
      } else {
        // If no end date, set both dates at once (single-day deliverable by default)
        console.log('📝 Setting both dates (single-day)')
        if (onBothDatesChange) {
          onBothDatesChange(formatted, formatted)
        } else {
          onStartDateChange(formatted)
          onEndDateChange(formatted)
        }
      }
      
      // Automatically switch to end date selection after setting start date
      console.log('🔄 Auto-switching to end date mode')
      setSelectingEnd(true)
    }
  }

  const handleDurationChange = (value) => {
    const amount = parseInt(value)
    if (isNaN(amount) || amount < 1) return // Minimum 1 day/week
    
    console.log('🔢 handleDurationChange:', { value, amount, durationType, startDate })
    
    setDuration(amount)
    if (startDate) {
      const start = parseDate(startDate)
      const newEnd = new Date(start)
      
      // Calculate based on duration type
      if (durationType === "weeks") {
        const daysToAdd = (amount * 7) - 1
        newEnd.setDate(newEnd.getDate() + daysToAdd) // -1 to make it inclusive
        console.log('📆 Weeks calculation:', { amount, daysToAdd, startDate, newEndDate: newEnd.toDateString() })
      } else {
        newEnd.setDate(newEnd.getDate() + amount - 1) // -1 to make it inclusive (1 day = same day)
        console.log('📆 Days calculation:', { amount, startDate, newEndDate: newEnd.toDateString() })
      }
      
      const year = newEnd.getFullYear()
      const month = String(newEnd.getMonth() + 1).padStart(2, '0')
      const day = String(newEnd.getDate()).padStart(2, '0')
      const formattedEnd = `${year}-${month}-${day}`
      console.log('✅ Setting end date to:', formattedEnd)
      onEndDateChange(formattedEnd)
    }
  }

  const handleDurationTypeChange = (type) => {
    console.log('🔄 Switching duration type to:', type)
    setDurationType(type)
    
    // Just convert the display units, don't modify the actual date range
    if (startDate && endDate) {
      const start = parseDate(startDate)
      const end = parseDate(endDate)
      const diffTime = end - start
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
      
      // Add 1 to make it inclusive
      const actualDays = diffDays + 1
      
      console.log('📊 Converting units:', { actualDays, fromType: durationType, toType: type })
      
      if (type === "weeks") {
        // Just display in weeks, don't change the end date
        const weeks = Math.round(actualDays / 7)
        console.log('  → Display as weeks:', weeks)
        setDuration(weeks)
      } else {
        // Display in days
        console.log('  → Display as days:', actualDays)
        setDuration(actualDays)
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
        
        // If end date exists and is before new start date, adjust end date to match start date
        if (endDate) {
          const end = parseDate(endDate)
          end.setHours(0, 0, 0, 0)
          const start = new Date(y, m - 1, d)
          start.setHours(0, 0, 0, 0)
          
          if (end < start) {
            onEndDateChange(formatted)
          }
        }
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
        
        // Validate that end date is not before start date
        if (startDate) {
          const start = parseDate(startDate)
          start.setHours(0, 0, 0, 0)
          const end = new Date(y, m - 1, d)
          end.setHours(0, 0, 0, 0)
          
          if (end >= start) {
            onEndDateChange(formatted)
          }
          // If end date is before start, don't update (silently reject invalid input)
        } else {
          onEndDateChange(formatted)
        }
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
              onFocus={() => {
                console.log('🔵 Start date field focused')
                setSelectingEnd(false)
              }}
              onClick={() => {
                console.log('👆 Start date field clicked')
                setSelectingEnd(false)
              }}
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
              onFocus={() => {
                console.log('🔵 End date field focused')
                setSelectingEnd(true)
              }}
              onClick={() => {
                console.log('👆 End date field clicked')
                setSelectingEnd(true)
              }}
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
