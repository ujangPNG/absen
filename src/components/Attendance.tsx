'use client'
import { useState, useEffect } from "react";

type Attendance = {
  id: number;
  userName: string | null;
  timestamp: string | null;
  photoBlobUrl: string | null;
  address: string | null;
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceData(selectedDate);
    }
  }, [selectedDate]);

  const fetchAttendanceData = async (date: string) => {
    const res = await fetch(`/api/absen?date=${date}`);
    const data = await res.json();
    setAttendanceData(data);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Attendance Data</h1>
      <div className="mb-4">
        <input type="date" onChange={handleDateChange} value={selectedDate} className="border p-2" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendanceData.map((attendance) => (
          <div key={attendance.id} className="border p-4 rounded-lg">
            <p>User: {attendance.userName || 'N/A'}</p>
            <p>Timestamp: {attendance.timestamp ? new Date(attendance.timestamp).toLocaleString() : 'N/A'}</p>
            <p>Address: {attendance.address}</p>
            {attendance.photoBlobUrl && (
              <img src={attendance.photoBlobUrl} alt="Attendance Photo" className="mt-2 rounded-lg" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}