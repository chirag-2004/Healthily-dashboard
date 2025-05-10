// "use client";
// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { io } from "socket.io-client";

// const Dashboard = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [playing, setPlaying] = useState(null);
//   const socket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);

//   // Real-time updates for new appointments
//   useEffect(() => {
//     // Listen for new appointments
//     socket.on("notify-admin", (newAppointment) => {
//       console.log("New Appointment Received:", newAppointment.data);
//       startNotificationSound();

//       const appointmentWithTimestamp = {
//         ...newAppointment.data,
//         status: "pending",
//         createdAt: Date.now(),
//       };

//       setAppointments((prev) => [...prev, appointmentWithTimestamp]);
//     });

//     // Listen for appointment status updates from other users
//     socket.on("appointment-status-updated", ({ appointmentId, status, userId }) => {
//       setAppointments((prev) => 
//         prev.map((appointment) =>
//           appointment.id === appointmentId
//             ? { ...appointment, status, acceptedBy: userId }
//             : appointment
//         )
//       );
      
//       // If another user accepted the appointment, stop the notification sound
//       if (status === "accepted") {
//         stopNotificationSound();
//       }
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, []);

//   // Check for expired appointments every second
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       const now = Date.now();
//       setAppointments((prev) => {
//         const updatedAppointments = prev.filter((appointment) => {
//           const age = now - appointment.createdAt;
//           // Remove if older than 30 seconds
//           return age < 30000;
//         });

//         if (updatedAppointments.length < prev.length && 
//             !updatedAppointments.some(app => app.status === "pending")) {
//           stopNotificationSound();
//         }

//         return updatedAppointments;
//       });
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, []);

//   const startNotificationSound = () => {
//     if (!playing) {
//       const intervalId = setInterval(() => {
//         const audio = new Audio("/notify.mp3");
//         audio.playbackRate = 2.0;
//         audio.play().catch((error) => {
//           console.error("Error playing sound:", error);
//         });
//       }, 1000);
//       setPlaying(intervalId);
//     }
//   };

//   const stopNotificationSound = () => {
//     if (playing) {
//       clearInterval(playing);
//       setPlaying(null);
//     }
//   };

//   const handleRoomCall = async (phone, appointmentId) => {
//     try {
//       // First, check if the appointment is still available
//       const currentAppointment = appointments.find(app => app.id === appointmentId);
//       if (!currentAppointment || currentAppointment.status !== "pending") {
//         alert("This appointment is no longer available");
//         return;
//       }

//       // Emit status update with the current user's ID
//       socket.emit("update-appointment-status", {
//         appointmentId,
//         status: "accepted",
//         userId: "current-user-id" // Replace with actual user ID from your auth system
//       });

//       // Update local state
//       stopNotificationSound();
//       setAppointments((prev) =>
//         prev.map((appointment) =>
//           appointment.id === appointmentId
//             ? { 
//                 ...appointment, 
//                 status: "accepted",
//                 acceptedBy: "current-user-id" // Replace with actual user ID
//               }
//             : appointment
//         )
//       );

//       // Open the room
//       window.open(`http:/localhost:3001/Room/${phone}`, "_blank");
//     } catch (error) {
//       console.error("Error accepting appointment:", error);
//       alert("Failed to accept appointment. Please try again.");
//     }
//   };

//   const handleDecline = (index, appointmentId) => {
//     stopNotificationSound();
    
//     // Emit decline status
//     socket.emit("update-appointment-status", {
//       appointmentId,
//       status: "declined",
//       userId: "current-user-id" // Replace with actual user ID
//     });
    
//     setAppointments((prev) => prev.filter((_, i) => i !== index));
//   };

//   const getTimeLeft = (createdAt) => {
//     const timeLeft = 30 - Math.floor((Date.now() - createdAt) / 1000);
//     return Math.max(0, timeLeft);
//   };

//   const getAppointmentStatus = (appointment) => {
//     if (appointment.status === "accepted") {
//       return appointment.acceptedBy === "current-user-id" // Replace with actual user ID
//         ? "You accepted this appointment"
//         : "Accepted by another doctor";
//     }
//     return appointment.status === "declined" ? "Declined" : "Pending";
//   };

//   return (
//     <div className="h-screen flex flex-col md:flex-row bg-gray-100">
//       {/* Static Sidebar */}
//       <aside className="h-full w-64 bg-white shadow-lg border-r hidden">
//         <div className="p-6">
//           <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
//           <nav className="mt-10 space-y-6">
//             <Link
//               href="/"
//               className="block p-4 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium transition"
//             >
//               Dashboard
//             </Link>
//             <Link
//               href="/"
//               className="block p-4 rounded-md text-gray-700 hover:bg-gray-100 hover:text-blue-600 font-medium transition"
//             >
//               My Appointments
//             </Link>
//           </nav>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">
//           Incoming <span className="text-primary font-bold">Appointments.</span>
//         </h1>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {appointments.length > 0 ? (
//             appointments.map((appointment, index) => (
//               <div
//                 key={index}
//                 className="bg-white p-4 rounded-lg shadow-lg border hover:shadow-xl transition"
//               >
//                 <div className="flex justify-between items-start">
//                   <h2 className="text-lg font-bold text-gray-800">
//                     {appointment.data.name}
//                   </h2>
//                   <span className="text-sm text-gray-500">
//                     {getTimeLeft(appointment.createdAt)}s
//                   </span>
//                 </div>
//                 <p className="text-gray-600 text-sm">
//                   at {new Date().toLocaleTimeString()}
//                 </p>
//                 <p className="text-gray-700 mt-2">
//                   Specialization: {appointment.data.specialization}
//                 </p>
//                 <div className="mt-4 flex justify-between gap-2">
//                   {appointment.status === "pending" ? (
//                     <>
//                       <button
//                         className="flex-1 py-2 bg-primary text-white rounded-lg shadow hover:bg-green-500 transition"
//                         onClick={() =>
//                           handleRoomCall(appointment.phone, appointment.id)
//                         }
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="flex-1 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
//                         onClick={() => handleDecline(index, appointment.id)}
//                       >
//                         Decline
//                       </button>
//                     </>
//                   ) : (
//                     <span className="text-gray-500">
//                       {getAppointmentStatus(appointment)}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-600 col-span-full text-center">
//               No appointments available.
//             </p>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// // export default Dashboard;
// "use client";
// import React, { useState, useEffect, useRef } from "react"; // Added useRef
// import Link from "next/link";
// import { io } from "socket.io-client";

// const Dashboard = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [playing, setPlaying] = useState(null);
//   const [socket, setSocket] = useState(null); // Initialize socket state

//   // Use a ref to store the audio object to prevent re-creation on every play
//   const audioRef = useRef(null);
//   // Use a ref to ensure only one sound interval is active
//   const soundIntervalRef = useRef(null);


//   // Initialize Socket and Audio
//   useEffect(() => {
//     const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
//     setSocket(newSocket);

//     // Preload audio
//     audioRef.current = new Audio("/notify.mp3"); // Ensure notify.mp3 is in /public
//     audioRef.current.playbackRate = 2.0;
//     audioRef.current.preload = "auto"; // Suggest browser to preload

//     return () => {
//       newSocket.disconnect();
//       if (soundIntervalRef.current) {
//         clearInterval(soundIntervalRef.current);
//       }
//     };
//   }, []);


//   // Socket event listeners
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("notify-admin", (newAppointment) => {
//       console.log("New Appointment Received on Dashboard:", newAppointment); // Note: newAppointment is { data: appointmentData }
//       startNotificationSound();

//       const appointmentWithDetails = {
//         ...newAppointment.data, // Access the actual appointment data
//         id: newAppointment.data.phone || newAppointment.data.id, // Ensure 'id' is patient's phone for consistency
//         status: "pending",
//         createdAt: Date.now(),
//       };
//       console.log("Processed appointment for dashboard state:", appointmentWithDetails);
//       setAppointments((prev) => [...prev, appointmentWithDetails]);
//     });

//     socket.on("appointment-status-updated", ({ appointmentId, status, userId, appointmentData }) => {
//       console.log(`Dashboard: Appointment ${appointmentId} status updated to ${status} by ${userId}`);
//       setAppointments((prev) =>
//         prev.map((appointment) =>
//           appointment.id === appointmentId // Compare with appointment.id (which should be phone)
//             ? { ...appointment, status, acceptedBy: userId }
//             : appointment
//         )
//       );

//       // If this user accepted it, or another user accepted/declined a PENDING one, stop sound.
//       const relevantAppointment = appointments.find(app => app.id === appointmentId);
//       if ( (status === "accepted" || status === "declined") && relevantAppointment?.status === "pending") {
//         stopNotificationSound();
//       }
//     });

//     socket.on("appointment-expired", ({ appointmentId, message }) => {
//         console.log(`Dashboard: Appointment ${appointmentId} expired. Message: ${message}`);
//         toast.warn(`Appointment for ${appointmentId} has expired.`); // Using toast for user feedback
//         setAppointments((prev) => prev.filter(app => app.id !== appointmentId));
//         // Check if any pending appointments are left to decide if sound should stop
//         if (!appointments.some(app => app.id !== appointmentId && app.status === 'pending')) {
//             stopNotificationSound();
//         }
//     });


//     // No need to return socket.disconnect() here if it's handled in the initial useEffect
//   }, [socket, appointments]); // Added appointments to dependency array for the stopNotificationSound logic

//   // Check for EXPIRED appointments locally (UI cleanup)
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       const now = Date.now();
//       setAppointments((prev) => {
//         const updatedAppointments = prev.filter((appointment) => {
//           if (appointment.status !== "pending") return true; // Keep non-pending appointments
//           const age = now - appointment.createdAt;
//           return age < 30000; // Remove if PENDING and older than 30 seconds
//         });

//         // If pending appointments were removed by expiry and no other pending ones exist
//         if (updatedAppointments.length < prev.length &&
//             !updatedAppointments.some(app => app.status === "pending")) {
//           stopNotificationSound();
//         }
//         return updatedAppointments;
//       });
//     }, 1000);

//     return () => clearInterval(intervalId);
//   }, []); // Empty dependency array, runs once

//   const startNotificationSound = () => {
//     if (!soundIntervalRef.current && audioRef.current) { // Check if interval isn't already set
//       soundIntervalRef.current = setInterval(() => {
//         audioRef.current.play().catch((error) => {
//           // Autoplay policy might prevent playing without user interaction.
//           // The first sound might require a click on the page.
//           console.error("Error playing sound:", error);
//           // Attempt to play might fail if document is not focused or no user interaction yet.
//           // Consider a visual cue or a button to enable sound if autoplay fails.
//         });
//       }, 1500); // Play every 1.5 seconds
//       setPlaying(true); // Simplified state for UI, actual interval ID is in ref
//     }
//   };

//   const stopNotificationSound = () => {
//     if (soundIntervalRef.current) {
//       clearInterval(soundIntervalRef.current);
//       soundIntervalRef.current = null;
//     }
//     setPlaying(false); // Simplified state
//   };

//   const handleRoomCall = async (phone, appointmentId) => {
//     if (!socket) {
//         alert("Socket not connected. Cannot accept appointment.");
//         return;
//     }
//     try {
//       const currentAppointment = appointments.find(app => app.id === appointmentId);
//       if (!currentAppointment) {
//         alert("This appointment is no longer in the list.");
//         return;
//       }
//       if (currentAppointment.status !== "pending") {
//         alert(`This appointment is already ${currentAppointment.status}.`);
//         return;
//       }

//       const actualUserId = "doctor-admin-001"; // Replace with actual logged-in admin/doctor ID

//       socket.emit("update-appointment-status", {
//         appointmentId,
//         status: "accepted",
//         userId: actualUserId
//       });
//       console.log("Emitted update-appointment-status for accept:", { appointmentId, status: "accepted", userId: actualUserId });


//       // Update local state immediately for responsiveness
//       setAppointments((prev) =>
//         prev.map((app) =>
//           app.id === appointmentId
//             ? { ...app, status: "accepted", acceptedBy: actualUserId }
//             : app
//         )
//       );
//       stopNotificationSound(); // Stop sound for this admin

//       // Open the room - using relative path assumes RoomPage is in the same Next.js app
//       window.open(`/Room/${phone}`, "_blank");

//     } catch (error) {
//       console.error("Error accepting appointment:", error);
//       alert("Failed to accept appointment. Please try again.");
//       // Potentially revert local state or re-fetch if needed
//     }
//   };

//   const handleDecline = (appointmentId) => { // Pass appointmentId instead of index for robustness
//     if (!socket) {
//         alert("Socket not connected. Cannot decline appointment.");
//         return;
//     }
//     const actualUserId = "doctor-admin-001"; // Replace with actual logged-in admin/doctor ID

//     socket.emit("update-appointment-status", {
//       appointmentId,
//       status: "declined",
//       userId: actualUserId
//     });
//     console.log("Emitted update-appointment-status for decline:", { appointmentId, status: "declined", userId: actualUserId });

//     // Optimistically update UI, remove from list.
//     // Or mark as declined if you want to keep it in the list with 'declined' status
//     setAppointments((prev) => prev.filter((app) => app.id !== appointmentId));
    
//     // Check if any other pending appointments are left to decide if sound should stop
//     if (!appointments.some(app => app.id !== appointmentId && app.status === 'pending')) {
//         stopNotificationSound();
//     }
//   };

//   const getTimeLeft = (createdAt) => {
//     const timeLeft = 30 - Math.floor((Date.now() - createdAt) / 1000);
//     return Math.max(0, timeLeft);
//   };

//   const getAppointmentStatusText = (appointment) => {
//     const actualUserId = "doctor-admin-001"; // Replace with actual logged-in admin/doctor ID
//     if (appointment.status === "accepted") {
//       return appointment.acceptedBy === actualUserId
//         ? "You accepted this"
//         : `Accepted by ${appointment.acceptedBy || 'another doctor'}`;
//     }
//     return appointment.status === "declined" ? "Declined" : "Pending";
//   };

//   return (
//     <div className="min-h-screen flex flex-col md:flex-row bg-gray-100">
//       {/* Sidebar can be added back if needed */}
//       {/* <aside className="h-full w-64 bg-white shadow-lg border-r hidden md:block"> ... </aside> */}

//       <main className="flex-1 p-6">
//         <div className="flex justify-between items-center mb-6">
//             <h1 className="text-2xl font-bold text-gray-800">
//             Incoming <span className="text-primary font-bold">Appointments</span>
//             </h1>
//             {playing && <span className="text-red-500 animate-pulse">New Appointment Alert!</span>}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {appointments.length > 0 ? (
//             appointments.map((appointment) => ( // Use appointment.id as key
//               <div
//                 key={appointment.id || appointment.phone} // Fallback to phone if id is missing temporarily
//                 className={`p-4 rounded-lg shadow-lg border hover:shadow-xl transition 
//                             ${appointment.status === 'pending' ? 'bg-white' : 
//                              appointment.status === 'accepted' ? 'bg-green-50' : 'bg-red-50'}`}
//               >
//                 <div className="flex justify-between items-start">
//                   <h2 className="text-lg font-bold text-gray-800">
//                     {appointment.name} {/* Access name directly */}
//                   </h2>
//                   {appointment.status === "pending" && (
//                     <span className="text-sm text-red-500 font-semibold animate-ping">
//                         {getTimeLeft(appointment.createdAt)}s
//                     </span>
//                   )}
//                 </div>
//                 <p className="text-gray-600 text-sm">
//                   {/* Displaying createdAt time, not current time */}
//                   Requested at: {new Date(appointment.createdAt).toLocaleTimeString()}
//                 </p>
//                 <p className="text-gray-700 mt-2">
//                   Phone: {appointment.phone}
//                 </p>
//                 <p className="text-gray-700 mt-1">
//                   Specialization: {appointment.specialization} {/* Access specialization directly */}
//                 </p>
//                 <div className="mt-4 flex justify-between items-center gap-2">
//                   {appointment.status === "pending" ? (
//                     <>
//                       <button
//                         className="flex-1 py-2 bg-primary text-white rounded-lg shadow hover:bg-green-500 transition"
//                         onClick={() => handleRoomCall(appointment.phone, appointment.id)}
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="flex-1 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
//                         onClick={() => handleDecline(appointment.id)}
//                       >
//                         Decline
//                       </button>
//                     </>
//                   ) : (
//                     <span className={`font-semibold ${appointment.status === 'accepted' ? 'text-green-600' : 'text-red-600'}`}>
//                       {getAppointmentStatusText(appointment)}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-600 col-span-full text-center py-10">
//               No new appointments at the moment.
//             </p>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;




"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link"; // Keep if you have sidebar links
import { io } from "socket.io-client";
import { toast } from "sonner"; // Assuming you've installed and set up sonner

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const audioRef = useRef(null);
  const soundIntervalRef = useRef(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false); // More direct state for sound

  const ACTUAL_USER_ID = "doctor-admin-001"; // Replace with actual logged-in admin/doctor ID

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`);
    setSocket(newSocket);

    audioRef.current = new Audio("/notify.mp3");
    audioRef.current.playbackRate = 2.0;
    audioRef.current.preload = "auto";
    audioRef.current.loop = true; // Loop the audio element itself

    return () => {
      newSocket.disconnect();
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current); // Legacy, but good to clear
      if (audioRef.current) { // Stop and clear loop on unmount
          audioRef.current.pause();
          audioRef.current.loop = false;
      }
    };
  }, []);

  const startNotificationSound = () => {
    if (audioRef.current && !isSoundPlaying) {
      audioRef.current.play().catch(error => console.error("Error playing sound:", error));
      setIsSoundPlaying(true);
    }
  };

  const stopNotificationSound = () => {
    if (audioRef.current && isSoundPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio position
      setIsSoundPlaying(false);
    }
  };

  // Effect to manage sound based on pending appointments
  useEffect(() => {
    const hasPending = appointments.some(app => app.status === 'pending');
    if (hasPending && !isSoundPlaying) {
      startNotificationSound();
    } else if (!hasPending && isSoundPlaying) {
      stopNotificationSound();
    }
  }, [appointments, isSoundPlaying]); // Re-run when appointments change or sound state changes


  useEffect(() => {
    if (!socket) return;

    socket.on("notify-admin", (newAppointmentEvent) => {
      const newAppointmentData = newAppointmentEvent.data;
      console.log("Dashboard: 'notify-admin' received:", newAppointmentData);
      const appointmentId = newAppointmentData.phone || newAppointmentData.id;

      if (!appointmentId) {
        console.error("Dashboard: Received appointment via 'notify-admin' without an ID.");
        return;
      }

      setAppointments((prevAppointments) => {
        const existingAppointment = prevAppointments.find(app => app.id === appointmentId);

        // This is always a pending appointment as per backend logic for 'notify-admin'
        const updatedOrNewAppointment = {
          ...newAppointmentData,
          id: appointmentId,
          status: "pending",
          createdAt: newAppointmentData.createdAt || Date.now(), // Prefer server's createdAt if available
          // acceptedBy will be undefined as it's pending
        };

        if (existingAppointment) {
          // If it existed but wasn't pending (e.g., was accepted, now re-booked), treat as new for sound
          if (existingAppointment.status !== 'pending') {
            // Sound will be handled by the general useEffect for sound management
          }
          return prevAppointments.map(app => app.id === appointmentId ? updatedOrNewAppointment : app);
        } else {
          return [...prevAppointments, updatedOrNewAppointment];
        }
      });
    });

    socket.on("appointment-status-updated", ({ appointmentId, status, userId, appointmentData }) => {
      console.log(`Dashboard: 'appointment-status-updated' for ${appointmentId} to ${status} by ${userId}`);
      toast.info(`Appointment for ${appointmentData.name || appointmentId} is now ${status}.`);
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointmentData } // Use authoritative data from server
            : appointment
        )
      );
    });

    socket.on("appointment-expired", ({ appointmentId, message }) => {
      console.log(`Dashboard: Appointment ${appointmentId} expired. Message: ${message}`);
      toast.warn(`Appointment ${appointmentId} has expired.`);
      setAppointments((prev) => prev.filter(app => app.id !== appointmentId));
    });
    
    socket.on("appointment-error", ({ message, appointmentId, currentStatus, acceptedBy }) => {
        toast.error(`Action failed for ${appointmentId || 'appointment'}: ${message}`);
        // Optionally, re-fetch or update local state if an action failed due to race condition
        if (appointmentId && currentStatus) {
            setAppointments(prev => prev.map(app =>
                app.id === appointmentId ? { ...app, status: currentStatus, acceptedBy: acceptedBy } : app
            ));
        }
    });


  }, [socket]);

  // Local UI expiry for PENDING cards (visual only, server handles actual expiry)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      setAppointments((prev) =>
        prev.map(app => {
          if (app.status === 'pending' && (now - app.createdAt > 30000)) {
            // This is just for UI timer, not removing it
            // The actual removal will happen via 'appointment-expired' from server
            // or if it gets accepted/declined.
            // If you want to visually remove after 30s even if server hasn't expired,
            // then filter it out: return prev.filter(a => a.id !== app.id)
            // For now, we just let the timer go to 0.
          }
          return app;
        })
      );
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);


  const handleRoomCall = async (phone, appointmentId) => {
    if (!socket) {
      toast.error("Connection issue. Cannot accept appointment.");
      return;
    }
    const currentAppointment = appointments.find(app => app.id === appointmentId);
    if (!currentAppointment) {
      toast.error("Appointment not found in list.");
      return;
    }
    if (currentAppointment.status !== "pending") {
      toast.info(`Appointment is already ${currentAppointment.status}.`);
      return;
    }

    // Optimistic UI update
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, status: "accepted", acceptedBy: ACTUAL_USER_ID } : app
      )
    );

    socket.emit("update-appointment-status", {
      appointmentId, status: "accepted", userId: ACTUAL_USER_ID
    });
    window.open(`/Room/${phone}`, "_blank");
  };

  const handleDecline = (appointmentId) => {
    if (!socket) {
      toast.error("Connection issue. Cannot decline appointment.");
      return;
    }
    const currentAppointment = appointments.find(app => app.id === appointmentId);
     if (!currentAppointment) {
      toast.error("Appointment not found in list.");
      return;
    }
    if (currentAppointment.status !== "pending") {
      toast.info(`Appointment is already ${currentAppointment.status}.`);
      return;
    }
    
    // Optimistic UI update - marking as declined locally
    setAppointments((prev) =>
      prev.map(app => app.id === appointmentId ? {...app, status: "declined", acceptedBy: ACTUAL_USER_ID} : app)
    );

    socket.emit("update-appointment-status", {
      appointmentId, status: "declined", userId: ACTUAL_USER_ID
    });
  };

  const getTimeLeft = (createdAt) => {
    const timeLeft = 30 - Math.floor((Date.now() - createdAt) / 1000);
    return Math.max(0, timeLeft);
  };

  const getAppointmentStatusText = (appointment) => {
    if (appointment.status === "accepted") {
      return appointment.acceptedBy === ACTUAL_USER_ID
        ? "You accepted this"
        : `Accepted by ${appointment.acceptedBy || 'another doctor'}`;
    }
    return appointment.status === "declined" ? "Declined by " + (appointment.acceptedBy === ACTUAL_USER_ID ? "You" : appointment.acceptedBy || "admin") : "Pending";
  };

  const pendingAppointments = appointments.filter(app => app.status === 'pending').sort((a,b) => b.createdAt - a.createdAt);
  const otherAppointments = appointments.filter(app => app.status !== 'pending').sort((a,b) => b.createdAt - a.createdAt);


  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Incoming <span className="text-primary font-bold">Appointments</span>
          </h1>
          {isSoundPlaying && <span className="text-red-500 animate-pulse font-semibold">New Appointment Sound Playing!</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingAppointments.length === 0 && otherAppointments.length === 0 ? (
            <p className="text-gray-600 col-span-full text-center py-10 text-lg">
              No appointments at the moment.
            </p>
          ) : (
            <>
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary hover:shadow-xl transition animate-pulse"
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-800">{appointment.name}</h2>
                    <span className="text-sm text-red-600 font-semibold">
                      {getTimeLeft(appointment.createdAt)}s left
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Requested at: {new Date(appointment.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-700 mt-2">Phone: {appointment.phone}</p>
                  <p className="text-gray-700 mt-1">Specialization: {appointment.specialization}</p>
                  <div className="mt-4 flex justify-between items-center gap-2">
                    <button
                      className="flex-1 py-2 bg-primary text-white rounded-lg shadow hover:bg-green-500 transition"
                      onClick={() => handleRoomCall(appointment.phone, appointment.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
                      onClick={() => handleDecline(appointment.id)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
              {otherAppointments.map((appointment) => (
                 <div
                  key={appointment.id}
                  className={`p-4 rounded-lg shadow-lg border hover:shadow-xl transition 
                              ${appointment.status === 'accepted' ? 'bg-green-50 border-green-200' : 
                               appointment.status === 'declined' ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-800">{appointment.name}</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Requested at: {new Date(appointment.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-700 mt-2">Phone: {appointment.phone}</p>
                  <p className="text-gray-700 mt-1">Specialization: {appointment.specialization}</p>
                  <div className="mt-4">
                    <span className={`font-semibold ${appointment.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
                      {getAppointmentStatusText(appointment)}
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;