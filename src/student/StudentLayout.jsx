import { useCallback, useState } from "react";
import { Outlet } from "react-router-dom";
import { KEYS } from "../config";
import { useStored } from "../utils/storage";
import Navbar from "./Navbar";
import Footer from "./Footer";
import EventDetailsModal from "./EventDetailsModal";
import TicketModal from "./TicketModal";
import ProfilePanel from "./ProfilePanel";
import { useNotifications } from "./useStudentData";
import "./student.css";

/* Shell of the student site: navbar, page content, footer and shared pop-ups. */

export default function StudentLayout() {
  const [glassMode, setGlassMode] = useStored(KEYS.studentTheme, false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { unread } = useNotifications();

  const openEvent = useCallback((event) => setSelectedEvent(event), []);
  const openTicket = useCallback((ticket) => {
    setSelectedEvent(null);
    setSelectedTicket(ticket);
  }, []);

  return (
    <div className={`sbu ${glassMode ? "glass-theme" : ""}`}>
      <Navbar
        glassMode={glassMode}
        onToggleTheme={() => setGlassMode((value) => !value)}
        onOpenProfile={() => setProfileOpen(true)}
        unread={unread}
      />

      <main className="sbu-main">
        <Outlet context={{ openEvent, openTicket }} />
      </main>

      <Footer />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onViewTicket={openTicket}
        />
      )}
      {selectedTicket && (
        <TicketModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
      {profileOpen && <ProfilePanel onClose={() => setProfileOpen(false)} />}
    </div>
  );
}
