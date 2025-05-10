// File: app/Room/[roomId]/page.js

// Adjust path if your _components folder is elsewhere
import RoomPageClient from "../_components/RoomPageClient";

const Page = async ({ params }) => {
    const resolvedParams = await params;
    const roomId = resolvedParams.roomId;

  if (!roomId) {
    return <div>Error: Room ID is missing.</div>;
  }

  return (
    <div>
      <RoomPageClient roomId={roomId} userRole="doctor" /> {/* Optionally pass a role */}
    </div>
  );
};

export default Page;