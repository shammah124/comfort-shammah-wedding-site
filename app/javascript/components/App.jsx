import React, { useState, useEffect } from "react";
import EnvelopeLanding from "./EnvelopeLanding";
import WeddingDetails from "./WeddingDetails";
import LoveStory from "./LoveStory";
import EventSchedule from "./EventSchedule";
import RSVPSection from "./RSVPSection";
import LocationMap from "./LocationMap";
import FloatingPetals from "./FloatingPetals";
import MusicToggle from "./MusicToggle";

export default function App() {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get("guest");
    if (name) setGuestName(decodeURIComponent(name));
  }, []);

  return (
    <div className="relative overflow-x-hidden">
      <FloatingPetals />
      <MusicToggle />
      {!envelopeOpened ? (
        <EnvelopeLanding onOpen={() => setEnvelopeOpened(true)} guestName={guestName} />
      ) : (
        <main className="invitation-content">
          <WeddingDetails guestName={guestName} />
          <LoveStory />
          <EventSchedule />
          <RSVPSection />
          <LocationMap />
        </main>
      )}
    </div>
  );
}
