// File: app/_components/RoomPage.jsx

"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';

const RoomPage = ({ roomId: propRoomId, userRole }) => { // Accept userRole
  const router = useRouter();
  const meetingRef = useRef(null);

  useEffect(() => {
    if (!propRoomId || !meetingRef.current) {
      console.log("RoomPage: Waiting for roomId prop or meetingRef.", { propRoomId, meetingRefCurrent: !!meetingRef.current });
      return;
    }

    let zpInstance = null;

    const initMeeting = async () => {
      console.log("RoomPage: Initializing meeting for roomId:", propRoomId, "as role:", userRole);
      try {
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        const appID = Number(process.env.NEXT_PUBLIC_ZEGOCLOUD_APP_ID);
        const serverSecret = process.env.NEXT_PUBLIC_ZEGOCLOUD_SECRET;

        if (!appID || !serverSecret) {
          console.error("ZegoCloud App ID or Server Secret is missing.");
          alert("Video service configuration error. Please contact support.");
          router.push(userRole === 'doctor' ? "/dashboard" : "/"); // Redirect based on role
          return;
        }

        const userID = Date.now().toString() + Math.floor(Math.random() * 10000);
        
        // Determine User Name based on role
        let userName = "MGood User " + userID.slice(-4); // Default
        if (userRole === 'doctor') {
          userName = "Doctor " + userID.slice(-4); // Or use actual doctor name if available
        } else if (userRole === 'patient') { // Assuming patient side might also pass a role
          userName = "Patient " + userID.slice(-4); // Or use actual patient name
        }
        // If you have the actual doctor's name (e.g., from an auth context when they are on the dashboard),
        // you would ideally pass that name to this component and use it.
        // For now, "Doctor" + random suffix is a placeholder.

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          propRoomId.toString(),
          userID,
          userName // Use the role-based userName
        );

        zpInstance = ZegoUIKitPrebuilt.create(kitToken);

        zpInstance.joinRoom({
          container: meetingRef.current,
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: true,
          showLeavingView: true,
          onLeaveRoom: () => {
            console.log("Left ZegoCloud room. Redirecting...");
            // Redirect doctors to dashboard, patients to home or another page
            if (userRole === 'doctor') {
              router.push("/dashboard"); // Path to your doctor/admin dashboard
            } else {
              router.push("/"); // Or /book-tc or a "thank you" page for patients
            }
          },
          sharedLinks: [
            {
              name: 'Copy Link',
              url: window.location.href,
            },
          ],
          // You can customize more Zego UI features here
          // e.g., turn off chat for doctors if not needed, or customize layout
        });
      } catch (error) {
        console.error("Failed to initialize ZegoCloud meeting:", error);
        alert("Could not start the video call. Please try again or contact support.");
        router.push(userRole === 'doctor' ? "/dashboard" : "/");
      }
    };

    initMeeting();

    return () => {
      if (zpInstance) {
        console.log("RoomPage: Cleaning up Zego instance.");
        // zpInstance.destroy(); // Check Zego docs for proper cleanup if needed beyond leaving room
      }
    };

  }, [propRoomId, userRole, router]); // Added userRole to dependencies

  if (!propRoomId) {
    return (
      <div className="h-screen w-screen flex justify-center items-center text-lg bg-gray-700 text-white">
        Loading Room ID...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex justify-center items-center">
      <div ref={meetingRef} style={{ width: "100vw", height: "100vh" }} />
    </div>
  );
};

export default RoomPage;