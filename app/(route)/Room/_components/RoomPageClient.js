"use client";

import React from "react";
import RoomPage from "./RoomPage"; 

export default function RoomPageClient({ roomId, userRole }) { 
  return (
    <div>
      <RoomPage roomId={roomId} userRole={userRole} /> {/* Pass userRole down */}
    </div>
  );
}