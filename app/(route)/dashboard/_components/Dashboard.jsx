// "use client";
// import React, { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { io } from "socket.io-client";
// import { toast } from "sonner";

// const Dashboard = () => {
//   const [appointments, setAppointments] = useState([]);
//   const [socket, setSocket] = useState(null);
//   const socketRef = useRef(null); // For stable socket instance
//   const audioRef = useRef(null);
//   const [isSoundPlaying, setIsSoundPlaying] = useState(false);

//   const ACTUAL_USER_ID = "doctor-admin-001"; // Replace with actual logged-in admin/doctor ID

//   useEffect(() => {
//     const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
//       transports: ['websocket', 'polling'] // Explicitly define transports
//     });
//     setSocket(newSocket);
//     socketRef.current = newSocket;

//     newSocket.on("connect", () => {
//         console.log("Dashboard: Socket connected successfully. ID:", newSocket.id);
//         console.log("Dashboard: Requesting initial pending appointments.");
//         newSocket.emit("request-initial-pending-appointments");
//     });

//     newSocket.on("disconnect", (reason) => {
//       console.log("Dashboard: Socket disconnected. Reason:", reason);
//     });

//     newSocket.on("connect_error", (err) => {
//       console.error("Dashboard: Socket connection error.", err);
//       toast.error("Connection issue with dashboard. Trying to reconnect...");
//     });

//     // Initialize audio - do this once
//     audioRef.current = new Audio("/notify.mp3"); // Ensure this path is correct in your /public folder
//     audioRef.current.playbackRate = 2.0;
//     audioRef.current.preload = "auto";
//     audioRef.current.loop = true;

//     return () => {
//       console.log("Dashboard: Cleaning up socket connection.");
//       newSocket.disconnect();
//       socketRef.current = null;
//       if (audioRef.current) {
//           audioRef.current.pause();
//           audioRef.current.loop = false; // Stop looping on unmount
//       }
//     };
//   }, []);

//   // Sound effect logic
//   useEffect(() => {
//     const hasPending = appointments.some(app => app.status === 'pending');
//     if (hasPending && !isSoundPlaying) {
//       console.log("Dashboard: Pending appointments found, starting notification sound.");
//       audioRef.current?.play().catch(error => console.error("Dashboard: Error playing sound:", error));
//       setIsSoundPlaying(true);
//     } else if (!hasPending && isSoundPlaying) {
//       console.log("Dashboard: No pending appointments, stopping notification sound.");
//       audioRef.current?.pause();
//       if(audioRef.current) audioRef.current.currentTime = 0; // Reset audio
//       setIsSoundPlaying(false);
//     }
//   }, [appointments, isSoundPlaying]); // Re-run when appointments or sound state changes


//   // Socket event listeners (only re-bind if `socket` instance actually changes, which it shouldn't after initial setup)
//   useEffect(() => {
//     if (!socket) {
//         console.log("Dashboard: Socket not yet available for binding listeners.");
//         return;
//     }
//     console.log("Dashboard: Binding socket event listeners.");

//     const handleInitialAppointments = (initialAppointmentsFromServer) => {
//         console.log("Dashboard: Received 'initial-pending-appointments':", initialAppointmentsFromServer);
//         setAppointments(prevAppointments => {
//             // Keep existing non-pending appointments, replace all pending with the new list from server
//             const nonPending = prevAppointments.filter(app => app.status !== 'pending');
//             const updatedAppointments = [...nonPending];

//             // Add or update from initialAppointmentsFromServer
//             initialAppointmentsFromServer.forEach(serverApp => {
//                 const existingIndex = updatedAppointments.findIndex(app => app.id === serverApp.id);
//                 if (existingIndex > -1) {
//                     // If it's a pending one from server, update it, otherwise server's pending list is king
//                     if(serverApp.status === 'pending') {
//                         updatedAppointments[existingIndex] = serverApp;
//                     }
//                 } else {
//                     // Add if new and pending
//                      if(serverApp.status === 'pending') {
//                         updatedAppointments.push(serverApp);
//                     }
//                 }
//             });
//             // Filter out any local pending appointments that are no longer in the server's initial list (stale)
//             const serverPendingIds = new Set(initialAppointmentsFromServer.map(app => app.id));
//             return updatedAppointments.filter(app => {
//                 if (app.status === 'pending') {
//                     return serverPendingIds.has(app.id);
//                 }
//                 return true; // Keep all non-pending
//             });
//         });
//     };

//     const handleNotifyAdmin = (newAppointmentEvent) => {
//       const newAppointmentData = newAppointmentEvent.data;
//       console.log("Dashboard: 'notify-admin' received with new/updated PENDING appointment:", newAppointmentData);
//       if (!newAppointmentData || !newAppointmentData.id) {
//         console.error("Dashboard: 'notify-admin' received invalid data.", newAppointmentData);
//         return;
//       }
//       // This event should always signify a new or re-notified PENDING appointment
//       // Ensure status is pending if it comes through here.
//       const appointmentToAddOrUpdate = { ...newAppointmentData, status: "pending" };

//       setAppointments((prevAppointments) => {
//         const existingAppointmentIndex = prevAppointments.findIndex(app => app.id === appointmentToAddOrUpdate.id);
//         if (existingAppointmentIndex !== -1) {
//           // Update existing appointment if it's already there (e.g., re-notification)
//           console.log("Dashboard: Updating existing appointment from 'notify-admin':", appointmentToAddOrUpdate.id);
//           const updatedList = [...prevAppointments];
//           updatedList[existingAppointmentIndex] = appointmentToAddOrUpdate;
//           return updatedList;
//         } else {
//           // Add new appointment
//           console.log("Dashboard: Adding new appointment from 'notify-admin':", appointmentToAddOrUpdate.id);
//           return [...prevAppointments, appointmentToAddOrUpdate];
//         }
//       });
//     };

//     const handleStatusUpdate = ({ appointmentId, status, userId, appointmentData }) => {
//       console.log(`Dashboard: 'appointment-status-updated' for ${appointmentId} to ${status} by ${userId}. Data:`, appointmentData);
//       const patientName = appointmentData?.name || appointmentId;
//       toast.info(`Appointment for ${patientName} is now ${status}.`);
      
//       setAppointments((prev) =>
//         prev.map((appointment) =>
//           appointment.id === appointmentId
//             ? { ...appointmentData } // Use authoritative data from server
//             : appointment
//         )
//       );
//     };

//     const handleAppointmentExpired = ({ appointmentId, message }) => {
//       console.log(`Dashboard: Appointment ${appointmentId} expired. Message: ${message}`);
//       toast.warn(`Appointment ${appointmentId} has expired.`);
//       setAppointments((prev) => prev.filter(app => app.id !== appointmentId));
//     };
    
//     const handleAppointmentError = ({ message, appointmentId, currentStatus, acceptedBy }) => {
//         toast.error(`Action failed for ${appointmentId || 'appointment'}: ${message}`);
//         console.error("Dashboard: Received 'appointment-error'", { message, appointmentId, currentStatus, acceptedBy });
//         // If server indicates the appointment had a different status (e.g., already handled)
//         // update the local state to reflect the server's truth.
//         if (appointmentId && currentStatus) {
//             setAppointments(prev => prev.map(app =>
//                 app.id === appointmentId ? { ...app, status: currentStatus, acceptedBy: acceptedBy } : app
//             ));
//         }
//     };

//     socket.on("initial-pending-appointments", handleInitialAppointments);
//     socket.on("notify-admin", handleNotifyAdmin);
//     socket.on("appointment-status-updated", handleStatusUpdate);
//     socket.on("appointment-expired", handleAppointmentExpired);
//     socket.on("appointment-error", handleAppointmentError);

//     return () => {
//         console.log("Dashboard: Unbinding socket event listeners.");
//         socket.off("initial-pending-appointments", handleInitialAppointments);
//         socket.off("notify-admin", handleNotifyAdmin);
//         socket.off("appointment-status-updated", handleStatusUpdate);
//         socket.off("appointment-expired", handleAppointmentExpired);
//         socket.off("appointment-error", handleAppointmentError);
//     };
//   }, [socket]); // This effect runs when `socket` instance is set.

//   // Timer update for display (no state modification, just triggers re-render)
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setAppointments(prev => [...prev]); // Force re-render to update countdowns
//     }, 1000);
//     return () => clearInterval(intervalId);
//   }, []);


//   const handleRoomCall = async (appointmentId) => {
//     if (!socketRef.current || !socketRef.current.connected) {
//       toast.error("Connection issue. Cannot accept appointment.");
//       return;
//     }
//     const currentAppointment = appointments.find(app => app.id === appointmentId);
//     if (!currentAppointment) {
//       toast.error("Appointment not found locally.");
//       return;
//     }
//     if (currentAppointment.status !== "pending") {
//       toast.info(`Appointment for ${currentAppointment.name} is already ${currentAppointment.status}.`);
//       return;
//     }

//     // Optimistic UI update (optional, server is source of truth)
//     // setAppointments((prev) =>
//     //   prev.map((app) =>
//     //     app.id === appointmentId ? { ...app, status: "accepted", acceptedBy: ACTUAL_USER_ID } : app
//     //   )
//     // );

//     console.log(`Dashboard: Emitting 'update-appointment-status' to ACCEPT for ${appointmentId}`);
//     socketRef.current.emit("update-appointment-status", {
//       appointmentId, status: "accepted", userId: ACTUAL_USER_ID
//     });
//     // The window.open should ideally happen AFTER server confirms acceptance via 'appointment-status-updated'
//     // For now, keeping it here for immediate action feel.
//     // Consider moving it to the 'appointment-status-updated' handler if status is 'accepted' by this user.
//     window.open(`/Room/${currentAppointment.phone}`, "_blank"); // phone is the room ID here
//   };

//   const handleDecline = (appointmentId) => {
//     if (!socketRef.current || !socketRef.current.connected) {
//       toast.error("Connection issue. Cannot decline appointment.");
//       return;
//     }
//     const currentAppointment = appointments.find(app => app.id === appointmentId);
//      if (!currentAppointment) {
//       toast.error("Appointment not found locally.");
//       return;
//     }
//     if (currentAppointment.status !== "pending") {
//       toast.info(`Appointment for ${currentAppointment.name} is already ${currentAppointment.status}.`);
//       return;
//     }
    
//     // Optimistic UI update (optional)
//     // setAppointments((prev) =>
//     //   prev.map(app => app.id === appointmentId ? {...app, status: "declined", acceptedBy: ACTUAL_USER_ID} : app)
//     // );
//     console.log(`Dashboard: Emitting 'update-appointment-status' to DECLINE for ${appointmentId}`);
//     socketRef.current.emit("update-appointment-status", {
//       appointmentId, status: "declined", userId: ACTUAL_USER_ID
//     });
//   };

//   const getTimeLeft = (createdAtStrOrNum) => {
//     const createdAt = typeof createdAtStrOrNum === 'string' ? new Date(createdAtStrOrNum).getTime() : Number(createdAtStrOrNum);
//     if (isNaN(createdAt)) {
//         console.warn("Dashboard: Invalid createdAt value for timer:", createdAtStrOrNum);
//         return "N/A";
//     }
//     const serverExpiryDuration = 300000; // 5 minutes in ms (match server)
//     const elapsed = Date.now() - createdAt;
//     const timeLeftSeconds = Math.floor((serverExpiryDuration - elapsed) / 1000);
//     return Math.max(0, timeLeftSeconds); // Ensure it doesn't go negative
//   };

//   const getAppointmentStatusText = (appointment) => {
//     if (!appointment || !appointment.status) return "Status Unknown";
//     if (appointment.status === "accepted") {
//       return appointment.acceptedBy === ACTUAL_USER_ID
//         ? "You accepted this"
//         : `Accepted by ${appointment.acceptedBy || 'another doctor'}`;
//     }
//     return appointment.status === "declined" ? "Declined by " + (appointment.acceptedBy === ACTUAL_USER_ID ? "You" : appointment.acceptedBy || "admin") : "Pending";
//   };

//   // Sort appointments: pending first, then by recency
//   const sortedAppointments = [...appointments].sort((a, b) => {
//     if (a.status === 'pending' && b.status !== 'pending') return -1;
//     if (a.status !== 'pending' && b.status === 'pending') return 1;
//     // If both are pending or both are not pending, sort by time
//     const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : Number(a.createdAt);
//     const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : Number(b.createdAt);
//     return (timeB || 0) - (timeA || 0); // Most recent first
//   });

//   const pendingAppointments = sortedAppointments.filter(app => app.status === 'pending');
//   const otherAppointments = sortedAppointments.filter(app => app.status !== 'pending');

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-100">
//       {/* ... (Your existing JSX for the dashboard layout and appointment cards) ... */}
//       {/* Ensure your appointment cards use `appointment.id` as key and correctly display data */}
//       {/* I will paste your JSX back here for completeness. */}
//       <main className="flex-1 p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">
//             Incoming <span className="text-primary font-bold">Appointments</span>
//           </h1>
//           {isSoundPlaying && <span className="text-red-500 animate-pulse font-semibold">New Appointment Sound Playing!</span>}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {pendingAppointments.length === 0 && otherAppointments.length === 0 ? (
//             <p className="text-gray-600 col-span-full text-center py-10 text-lg">
//               No appointments at the moment.
//             </p>
//           ) : (
//             <>
//               {pendingAppointments.map((appointment) => (
//                 <div
//                   key={appointment.id}
//                   className="bg-white p-4 rounded-lg shadow-lg border-2 border-primary hover:shadow-xl transition animate-pulse"
//                 >
//                   <div className="flex justify-between items-start">
//                     <h2 className="text-lg font-bold text-gray-800">{appointment.name || "N/A"}</h2>
//                     <span className="text-sm text-red-600 font-semibold">
//                       {getTimeLeft(appointment.createdAt)}s left
//                     </span>
//                   </div>
//                   <p className="text-gray-600 text-sm">
//                     Requested: {appointment.createdAt ? new Date(appointment.createdAt).toLocaleTimeString() : "N/A"}
//                   </p>
//                   <p className="text-gray-700 mt-2">Phone: {appointment.phone || "N/A"}</p>
//                   <p className="text-gray-700 mt-1">Specialization: {appointment.specialization || "N/A"}</p>
//                   <div className="mt-4 flex justify-between items-center gap-2">
//                     <button
//                       className="flex-1 py-2 bg-primary text-white rounded-lg shadow hover:bg-green-500 transition"
//                       onClick={() => handleRoomCall(appointment.id)} // Pass appointment.id
//                     >
//                       Accept
//                     </button>
//                     <button
//                       className="flex-1 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
//                       onClick={() => handleDecline(appointment.id)}
//                     >
//                       Decline
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               {otherAppointments.map((appointment) => (
//                  <div
//                   key={appointment.id}
//                   className={`p-4 rounded-lg shadow-lg border hover:shadow-xl transition 
//                               ${appointment.status === 'accepted' ? 'bg-green-50 border-green-200' : 
//                                appointment.status === 'declined' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
//                 >
//                   <div className="flex justify-between items-start">
//                     <h2 className="text-lg font-bold text-gray-800">{appointment.name || "N/A"}</h2>
//                   </div>
//                   <p className="text-gray-600 text-sm">
//                     Requested: {appointment.createdAt ? new Date(appointment.createdAt).toLocaleTimeString() : "N/A"}
//                   </p>
//                   <p className="text-gray-700 mt-2">Phone: {appointment.phone || "N/A"}</p>
//                   <p className="text-gray-700 mt-1">Specialization: {appointment.specialization || "N/A"}</p>
//                   <div className="mt-4">
//                     <span className={`font-semibold ${appointment.status === 'accepted' ? 'text-green-700' : 
//                                                       appointment.status === 'declined' ? 'text-red-700' : 'text-gray-700'}`}>
//                       {getAppointmentStatusText(appointment)}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Dashboard;




"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { toast } from "sonner";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);

  const ACTUAL_USER_ID = "doctor-admin-001"; 

  useEffect(() => {
    const newSocket = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}`, {
      transports: ['websocket', 'polling']
    });
    setSocket(newSocket);
    socketRef.current = newSocket;

    newSocket.on("connect", () => {
        console.log("Dashboard: Socket connected. ID:", newSocket.id);
        newSocket.emit("request-initial-pending-appointments");
    });
    newSocket.on("disconnect", (r) => console.log("Dashboard: Socket disconnected.", r));
    newSocket.on("connect_error", (e) => console.error("Dashboard: Socket conn error.", e));

    audioRef.current = new Audio("/notify.mp3");
    audioRef.current.playbackRate = 2.0;
    audioRef.current.preload = "auto";
    audioRef.current.loop = true;

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
      if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.loop = false;
      }
    };
  }, []);

  useEffect(() => {
    const hasPending = appointments.some(app => app.status === 'pending');
    if (hasPending && !isSoundPlaying) {
      audioRef.current?.play().catch(e => console.error("Dashboard: Play sound error:", e));
      setIsSoundPlaying(true);
    } else if (!hasPending && isSoundPlaying) {
      audioRef.current?.pause();
      if(audioRef.current) audioRef.current.currentTime = 0;
      setIsSoundPlaying(false);
    }
  }, [appointments, isSoundPlaying]);


  useEffect(() => {
    if (!socket) return;

    const handleInitialAppointments = (initialApps) => {
        console.log("Dashboard: Received 'initial-pending-appointments':", initialApps);
        setAppointments(prev => {
            const nonPending = prev.filter(a => a.status !== 'pending');
            const updated = [...nonPending];
            const serverPendingIds = new Set();
            initialApps.forEach(serverApp => {
                if (serverApp.status === 'pending') {
                    serverPendingIds.add(serverApp.id);
                    const existingIdx = updated.findIndex(a => a.id === serverApp.id);
                    if (existingIdx > -1) updated[existingIdx] = serverApp;
                    else updated.push(serverApp);
                }
            });
            return updated.filter(a => a.status !== 'pending' || serverPendingIds.has(a.id));
        });
    };

    const handleNotifyAdmin = (newEvent) => {
      const newAppData = newEvent.data;
      console.log("Dashboard: 'notify-admin' received PENDING appointment:", newAppData);
      if (!newAppData || !newAppData.id) return;
      const appToAdd = { ...newAppData, status: "pending" };
      setAppointments(prev => {
        const idx = prev.findIndex(a => a.id === appToAdd.id);
        if (idx > -1) {
          const updatedList = [...prev];
          updatedList[idx] = appToAdd;
          return updatedList;
        }
        return [...prev, appToAdd];
      });
    };

    const handleStatusUpdate = ({ appointmentId, status, userId, appointmentData }) => {
      console.log(`Dashboard: 'appointment-status-updated' for ${appointmentId} to ${status}. Data:`, appointmentData);
      toast.info(`Appointment for ${appointmentData?.name || appointmentId} is now ${status}.`);
      setAppointments(prev => prev.map(a => a.id === appointmentId ? { ...appointmentData } : a));
    };

    const handleAppointmentExpired = ({ appointmentId, message }) => {
      console.log(`Dashboard: Appointment ${appointmentId} expired. Msg: ${message}`);
      toast.warn(`Appointment ${appointmentId} has expired.`);
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    };
    
    const handleAppointmentError = ({ message, appointmentId, currentStatus, acceptedBy }) => {
        toast.error(`Action failed for ${appointmentId || 'appointment'}: ${message}`);
        if (appointmentId && currentStatus) {
            setAppointments(prev => prev.map(a =>
                a.id === appointmentId ? { ...a, status: currentStatus, acceptedBy } : a
            ));
        }
    };

    socket.on("initial-pending-appointments", handleInitialAppointments);
    socket.on("notify-admin", handleNotifyAdmin);
    socket.on("appointment-status-updated", handleStatusUpdate);
    socket.on("appointment-expired", handleAppointmentExpired);
    socket.on("appointment-error", handleAppointmentError);

    return () => {
        socket.off("initial-pending-appointments", handleInitialAppointments);
        socket.off("notify-admin", handleNotifyAdmin);
        socket.off("appointment-status-updated", handleStatusUpdate);
        socket.off("appointment-expired", handleAppointmentExpired);
        socket.off("appointment-error", handleAppointmentError);
    };
  }, [socket]);

  useEffect(() => {
    const intervalId = setInterval(() => setAppointments(prev => [...prev]), 1000);
    return () => clearInterval(intervalId);
  }, []);


  const handleRoomCall = (appointmentId) => {
    const sock = socketRef.current;
    if (!sock || !sock.connected) { toast.error("Connection issue."); return; }
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) { toast.error("Appointment not found."); return; }
    if (app.status !== "pending") { toast.info(`Already ${app.status}.`); return; }
    sock.emit("update-appointment-status", { appointmentId, status: "accepted", userId: ACTUAL_USER_ID });
    window.open(`/Room/${app.phone}`, "_blank");
  };

  const handleDecline = (appointmentId) => {
    const sock = socketRef.current;
    if (!sock || !sock.connected) { toast.error("Connection issue."); return; }
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) { toast.error("Appointment not found."); return; }
    if (app.status !== "pending") { toast.info(`Already ${app.status}.`); return; }
    sock.emit("update-appointment-status", { appointmentId, status: "declined", userId: ACTUAL_USER_ID });
  };

  const getTimeLeft = (createdAtStrOrNum) => {
    const createdAt = typeof createdAtStrOrNum === 'string' ? new Date(createdAtStrOrNum).getTime() : Number(createdAtStrOrNum);
    if (isNaN(createdAt)) return "N/A";
    const serverExpiryDuration = 30 * 1000; // 30 seconds (MUST MATCH SERVER)
    const elapsed = Date.now() - createdAt;
    return Math.max(0, Math.floor((serverExpiryDuration - elapsed) / 1000));
  };

  const getAppointmentStatusText = (appointment) => {
    if (!appointment?.status) return "Status Unknown";
    if (appointment.status === "accepted") {
      return appointment.acceptedBy === ACTUAL_USER_ID ? "You accepted" : `Accepted by ${appointment.acceptedBy || 'doc'}`;
    }
    return appointment.status === "declined" ? `Declined by ${appointment.acceptedBy === ACTUAL_USER_ID ? "You" : appointment.acceptedBy || "admin"}` : "Pending";
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : Number(a.createdAt);
    const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : Number(b.createdAt);
    return (timeB || 0) - (timeA || 0);
  });

  const pendingAppointments = sortedAppointments.filter(app => app.status === 'pending');
  const otherAppointments = sortedAppointments.filter(app => app.status !== 'pending');

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <main className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Incoming <span className="text-primary font-bold">Appointments</span>
          </h1>
          {isSoundPlaying && <span className="text-red-500 animate-pulse font-semibold">New Appointment Sound!</span>}
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
                    <h2 className="text-lg font-bold text-gray-800">{appointment.name || "N/A"}</h2>
                    <span className="text-sm text-red-600 font-semibold">
                      {getTimeLeft(appointment.createdAt)}s left
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Requested: {appointment.createdAt ? new Date(appointment.createdAt).toLocaleTimeString() : "N/A"}
                  </p>
                  <p className="text-gray-700 mt-2">Phone: {appointment.phone || "N/A"}</p>
                  <p className="text-gray-700 mt-1">Specialization: {appointment.specialization || "N/A"}</p>
                  <div className="mt-4 flex justify-between items-center gap-2">
                    <button
                      className="flex-1 py-2 bg-primary text-white rounded-lg shadow hover:bg-green-500 transition"
                      onClick={() => handleRoomCall(appointment.id)}
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
                               appointment.status === 'declined' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}
                >
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-800">{appointment.name || "N/A"}</h2>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Requested: {appointment.createdAt ? new Date(appointment.createdAt).toLocaleTimeString() : "N/A"}
                  </p>
                  <p className="text-gray-700 mt-2">Phone: {appointment.phone || "N/A"}</p>
                  <p className="text-gray-700 mt-1">Specialization: {appointment.specialization || "N/A"}</p>
                  <div className="mt-4">
                    <span className={`font-semibold ${appointment.status === 'accepted' ? 'text-green-700' : 
                                                      appointment.status === 'declined' ? 'text-red-700' : 'text-gray-700'}`}>
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