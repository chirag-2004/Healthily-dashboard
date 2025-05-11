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