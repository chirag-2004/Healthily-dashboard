// File: app/_components/RoomPageClient.jsx

"use client";

import React from "react";
import RoomPage from "./RoomPage"; // Assuming RoomPage.jsx is in the same _components folder

export default function RoomPageClient({ roomId, userRole }) { // Accept userRole
  return (
    <div>
      <RoomPage roomId={roomId} userRole={userRole} /> {/* Pass userRole down */}
    </div>
  );
}