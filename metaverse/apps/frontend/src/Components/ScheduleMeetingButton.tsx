import { useState } from "react";
import { Calendar } from "lucide-react";
import { useParams } from "react-router-dom";
import { axios } from "../Axios/axios";
import { config } from "../config";
import { useAuth } from "../Context/UseAuth";

export default function ScheduleMeetingButton() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [meetingName, setMeetingName] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const { spaceId } = useParams();
  const { accessToken } = useAuth();

  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const meetingData = {
      name: meetingName,
      date: selectedDate,
      time: selectedTime,
      spaceId,
      createdAt: new Date().toISOString(),
    };

    if (
      !meetingData ||
      !meetingData.name ||
      !meetingData.date ||
      !meetingData.time ||
      !meetingData.spaceId ||
      !meetingData.createdAt
    ) {
      console.error("all feilds are required for creating meeting");
      return;
    }

    try {
      const creatingMeetingRes = await axios.post(
        `${config.BackendUrl}/space/createMeeting`,
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log(creatingMeetingRes.data);

      console.log("creating meeting");
      setShowCalendar(false);

      setMeetingName("");
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error(error);
    }
  };

  // Get current date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="relative">
      <button
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        onClick={toggleCalendar}
      >
        <Calendar size={20} />
        <span>Schedule Meeting</span>
      </button>

      {showCalendar && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 border border-gray-300 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-lg">Schedule a Meeting</h3>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setShowCalendar(false)}
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={meetingName}
              onChange={(e) => setMeetingName(e.target.value)}
              placeholder="Enter meeting title"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedDate}
              min={today}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={() => setShowCalendar(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleSubmit}
            >
              Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
