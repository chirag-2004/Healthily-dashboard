"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';

const RoomPage = ({ roomId: propRoomId, userRole }) => { 
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
          router.push(userRole === 'doctor' ? "/dashboard" : "/"); 
          return;
        }

        const userID = Date.now().toString() + Math.floor(Math.random() * 10000);
        
       
        let userName = " User " + userID.slice(-4); 
        if (userRole === 'doctor') {
          userName = "Doctor " + userID.slice(-4); 
        } else if (userRole === 'patient') { 
          userName = "Patient " + userID.slice(-4); 
        }
        

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          propRoomId.toString(),
          userID,
          userName 
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
            
            if (userRole === 'doctor') {
              router.push("/dashboard"); 
            } else {
              router.push("/"); 
            }
          },
          sharedLinks: [
            {
              name: 'Copy Link',
              url: window.location.href,
            },
          ],
         
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
       
      }
    };

  }, [propRoomId, userRole, router]); 

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