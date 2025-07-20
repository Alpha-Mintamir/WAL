import { miniDevider } from "@/utils/Helper";
import React, { useState, useRef, useEffect } from "react";
import { IoTimeOutline } from "react-icons/io5";
import dayjs from "dayjs"; // Import dayjs
import customParseFormat from "dayjs/plugin/customParseFormat";  // Import the plugin

// Extend dayjs to use custom parsing
dayjs.extend(customParseFormat);

const CustomTimePicker = ({ value, onChange, setSelectedTimeSlot }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState("00");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedPeriod, setSelectedPeriod] = useState("PM");
  const [tempSelection, setTempSelection] = useState({ hour: "00", minute: "00", period: "PM" });
  const dropdownRef = useRef(null);

  // Generate hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  
  // Generate minutes (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTimeSelection = (type, value) => {
    if (type === "hour") setTempSelection(prev => ({ ...prev, hour: value }));
    if (type === "minute") setTempSelection(prev => ({ ...prev, minute: value }));
    if (type === "period") setTempSelection(prev => ({ ...prev, period: value }));
  };

  const handleOk = () => {
    setSelectedHour(tempSelection.hour);
    setSelectedMinute(tempSelection.minute);
    setSelectedPeriod(tempSelection.period);

    // Convert 12-hour format to 24-hour format
    let hour24 = parseInt(tempSelection.hour);
    if (tempSelection.period === "PM" && hour24 !== 12) hour24 += 12;
    if (tempSelection.period === "AM" && hour24 === 12) hour24 = 0;

    // Format the time string in 24-hour format
    const formattedTime = `${String(hour24).padStart(2, "0")}:${tempSelection.minute}-00`;
    
    onChange?.(formattedTime);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempSelection({ hour: selectedHour, minute: selectedMinute, period: selectedPeriod });
    setIsOpen(false);
  };

  // Format the display value
  const displayValue = value ? dayjs(value, "HH:mm-00").format("hh:mm A") : "Add Time";

  return (
    <div className="relative w-full !bg-transparent" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setSelectedTimeSlot(null);
          setTempSelection({ hour: selectedHour, minute: selectedMinute, period: selectedPeriod });
        }}
        className="w-full flex items-center gap-2 p-2 rounded-md"
      >
        <IoTimeOutline size={24} />
        <span>{miniDevider}</span>
        <span>{displayValue}</span>
      </button>

      {isOpen && (
        <div className="absolute mt-1 bg-white border rounded-lg shadow-lg z-50">
          <div className="flex">
            {/* Hours */}
            <div className="w-16 h-48 overflow-y-auto border-r">
              {hours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleTimeSelection("hour", hour)}
                  className={`w-full p-2 text-center hover:bg-blue-100 ${
                    tempSelection.hour === hour ? "primary_bg_color text-white" : ""
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>

            {/* Minutes */}
            <div className="w-16 h-48 overflow-y-auto border-r">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  onClick={() => handleTimeSelection("minute", minute)}
                  className={`w-full p-2 text-center hover:bg-blue-100 ${
                    tempSelection.minute === minute ? "primary_bg_color text-white" : ""
                  }`}
                >
                  {minute}
                </button>
              ))}
            </div>

            {/* AM/PM */}
            <div className="w-16">
              <button
                onClick={() => handleTimeSelection("period", "AM")}
                className={`w-full p-2 text-center hover:bg-blue-100 ${
                  tempSelection.period === "AM" ? "primary_bg_color text-white" : ""
                }`}
              >
                AM
              </button>
              <button
                onClick={() => handleTimeSelection("period", "PM")}
                className={`w-full p-2 text-center hover:bg-blue-100 ${
                  tempSelection.period === "PM" ? "primary_bg_color text-white" : ""
                }`}
              >
                PM
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 p-3 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOk}
              className="px-4 py-2 text-sm text-white primary_bg_color rounded-md hover:opacity-90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
