import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Gift,
  MapPin,
  Phone,
  ClipboardList,
  Heart,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * KAD KAHWIN INTERAKTIF – MIRROR SAMPLES (ELEGAN GELAP + EMAS)
 * - Bottom nav dengan 6 item
 * - Cover Arabic/Latin, tarikh Hijri & BM uppercase
 * - RSVP ringkas (Hadir / Tidak Hadir)
 * - Money Gift (akaun + QR + butang Simpan)
 * - Wishlist, Contact, Location, Calendar (.ics)
 * Nota: Guna Tailwind + shadcn/ui + framer-motion + lucide-react + qrcode.react.
 */

const CONFIG = {
  theme: { bg: "#2b2b2b", gold: "#d4af37", goldSoft: "#c8a94b" },
  couple: {
    groom: "مزالن",
    bride: "مرياني",
    arabic: { walimah: "وليمة العروس", dan: "و" },
    latin: { groom: "Mazlan", bride: "Mriyani" },
  },
  event: {
    title: "WALIMATULURUS",
    hijri: "أحد، ٢٠ جمادى الآخر ١٤٤٦",
    date: new Date("2024-12-22T12:00:00+08:00"),
    dateMalayUpper: "AHAD, 22 DISEMBER 2024",
    venueName: "BUKIT BERUNTUNG GOLF CLUB",
    venueAddress: "Jalan BR 1/2, 48300 Bukit Beruntung, Selangor",
    mapsUrl:
      "https://www.google.com/maps?q=Bukit+Beruntung+Golf+%26+Country+Club",
    quote:
      "“Dan Kami menciptakan kamu berpasang-pasangan” Surah An-Naba (78:8)",
  },
  bank: {
    bankName: "Maybank Berhad",
    accountNumber: "162076697556",
    accountName: "Mriyani & Mazlan",
    duitNowId: "",
  },
  contact: {
    person1: { name: "Idham", phone: "+60123456789" },
    person2: { name: "Ying", phone: "+60198765432" },
  },
  wishlist: [
    { label: "Toaster", url: "https://shopee.com.my/" },
    { label: "Tuala Mandi", url: "https://www.lazada.com.my/" },
    { label: "Set Pinggan", url: "https://www.ikea.com/" },
  ],
};

function formatDateRange(d) {
  const opts = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Intl.DateTimeFormat("ms-MY", opts).format(d);
}

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch (e) {
      console.error(e);
    }
  };
  return { copied, copy };
}

function downloadICS({
  title,
  start,
  durationMins = 180,
  location,
  description,
}) {
  const dt = new Date(start);
  const dtStart = dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dtEnd =
    new Date(dt.getTime() + durationMins * 60000)
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//kad-kahwin//web-invite//MY",
    "BEGIN:VEVENT",
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${title}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\n");
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "walimatulurus.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Ornamental kiri ala batik
const DecorativeBorder = () => (
  <div className="absolute inset-y-0 left-0 w-24 flex items-center">
    <svg
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <defs>
        <pattern
          id="motif"
          x="0"
          y="0"
          width="100"
          height="140"
          patternUnits="userSpaceOnUse"
        >
          <g fill={CONFIG.theme.gold} opacity="0.95">
            <path d="M50 10 l10 10 -10 10 -10-10z" />
            <circle cx="25" cy="35" r="6" />
            <circle cx="75" cy="35" r="6" />
            <path d="M50 55 a15 15 0 1 0 0.1 0" />
            <path d="M20 90 h60" stroke={CONFIG.theme.gold} strokeWidth="2" />
          </g>
        </pattern>
      </defs>
      <rect x="0" y="0" width="100" height="1000" fill="url(#motif)" />
    </svg>
  </div>
);

const Panel = ({ children }) => (
  <Card className="bg-white/95 backdrop-blur border-0 shadow-lg rounded-2xl">
    <CardContent className="p-6">{children}</CardContent>
  </Card>
);

// RSVP ringkas (dua butang)
const SimpleRSVP = () => {
  const [saved, setSaved] = useState("");
  const save = (val) => {
    const data = JSON.parse(localStorage.getItem("rsvp_simple") || "[]");
    data.push({ status: val, at: Date.now() });
    localStorage.setItem("rsvp_simple", JSON.stringify(data));
    setSaved(val);
    setTimeout(() => setSaved(""), 1200);
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
          <ClipboardList className="h-5 w-5" />
          <span className="text-xs">RSVP</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[60vh]">
        <SheetHeader>
          <SheetTitle>RSVP</SheetTitle>
        </SheetHeader>
        <div className="p-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-14 text-base" onClick={() => save("hadir")}>
              Hadir
            </Button>
            <Button
              variant="outline"
              className="h-14 text-base"
              onClick={() => save("tidak_hadir")}
            >
              Tidak Hadir
            </Button>
          </div>
          {saved && (
            <div className="text-center text-sm opacity-80">
              {saved === "hadir"
                ? "Terima kasih, jumpa di majlis!"
                : "Terima kasih atas maklum balas!"}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

const MoneyGiftSheet = () => {
  const { copied, copy } = useCopy();
  const payload = useMemo(() => CONFIG.bank.accountNumber, []);
  const qrRef = useRef(null);
  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;
    const a = document.createElement("a");
    a.href = image64;
    a.download = "kod-qr.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
          <Gift className="h-5 w-5" />
          <span className="text-xs">Money Gift</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[75vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Money Gift</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <Panel>
            <div className="grid gap-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Nama Bank</div>
                  <div className="font-medium">{CONFIG.bank.bankName}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Nama Akaun</div>
                  <div className="font-medium">{CONFIG.bank.accountName}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-muted-foreground">No Akaun</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono tracking-wider text-lg">
                      {CONFIG.bank.accountNumber}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => copy(CONFIG.bank.accountNumber)}
                    >
                      {copied ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div
                className="mt-4 flex flex-col items-center gap-3"
                ref={qrRef}
              >
                <div className="text-sm text-muted-foreground">Kod QR</div>
                <QRCodeSVG
                  value={payload}
                  includeMargin
                  className="rounded-xl p-2 bg-white"
                  size={200}
                />
                <Button variant="outline" onClick={downloadQR}>
                  Simpan
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const WishlistSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
        <Heart className="h-5 w-5" />
        <span className="text-xs">Wishlist</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom" className="max-h-[70vh] overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Wishlist</SheetTitle>
      </SheetHeader>
      <div className="py-4 grid gap-3">
        {CONFIG.wishlist.map((w, i) => (
          <a
            key={i}
            href={w.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-4 py-3 border rounded-xl hover:bg-muted"
          >
            <div className="font-medium">{w.label}</div>
            <ExternalLink className="h-4 w-4" />
          </a>
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

const ContactSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
        <Phone className="h-5 w-5" />
        <span className="text-xs">Contact</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>Contact</SheetTitle>
      </SheetHeader>
      <div className="py-4 grid gap-3">
        {[CONFIG.contact.person1, CONFIG.contact.person2].map((p, i) => (
          <a
            key={i}
            href={`tel:${p.phone}`}
            className="flex items-center justify-between px-4 py-3 border rounded-xl hover:bg-muted"
          >
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-muted-foreground">{p.phone}</div>
            </div>
            <Phone className="h-4 w-4" />
          </a>
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

const LocationSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
        <MapPin className="h-5 w-5" />
        <span className="text-xs">Location</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>Lokasi</SheetTitle>
      </SheetHeader>
      <div className="py-4 grid gap-4">
        <Panel>
          <div className="space-y-2">
            <div className="font-medium">{CONFIG.event.venueName}</div>
            <div className="text-sm text-muted-foreground">
              {CONFIG.event.venueAddress}
            </div>
            <Button asChild className="mt-2">
              <a href={CONFIG.event.mapsUrl} target="_blank" rel="noreferrer">
                <MapPin className="h-4 w-4 mr-2" />
                Buka Google Maps
              </a>
            </Button>
          </div>
        </Panel>
      </div>
    </SheetContent>
  </Sheet>
);

const CalendarSheet = () => (
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="ghost" className="flex-1 flex flex-col gap-1 py-3">
        <Calendar className="h-5 w-5" />
        <span className="text-xs">Calendar</span>
      </Button>
    </SheetTrigger>
    <SheetContent side="bottom">
      <SheetHeader>
        <SheetTitle>Add to Calendar</SheetTitle>
      </SheetHeader>
      <div className="py-4 grid gap-3">
        <Button
          onClick={() =>
            downloadICS({
              title: `${CONFIG.couple.latin.bride} & ${CONFIG.couple.latin.groom} – ${CONFIG.event.title}`,
              start: CONFIG.event.date,
              location: `${CONFIG.event.venueName}, ${CONFIG.event.venueAddress}`,
              description: `Walimatulurus ${CONFIG.couple.latin.bride} dan ${CONFIG.couple.latin.groom}`,
            })
          }
        >
          Muat Turun .ics
        </Button>
        <div className="text-xs text-muted-foreground">
          Serasi dengan Google/Apple/Outlook Calendar.
        </div>
      </div>
    </SheetContent>
  </Sheet>
);

export default function WeddingInvite() {
  const dText = formatDateRange(CONFIG.event.date);
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: CONFIG.theme.bg, color: CONFIG.theme.gold }}
    >
      <div className="relative flex-1 flex items-center justify-center px-6 py-10">
        <DecorativeBorder />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-sm w-full text-center"
        >
          <div className="space-y-6">
            <div
              className="tracking-widest text-sm"
              style={{ color: CONFIG.theme.goldSoft }}
            >
              {CONFIG.event.title}
            </div>
            <div
              className="font-serif leading-tight text-[42px]"
              style={{ color: CONFIG.theme.gold }}
            >
              <div className="[font-family:'Scheherazade New',serif]">
                {CONFIG.couple.bride}
              </div>
              <div className="text-base mt-1 opacity-80">
                {CONFIG.couple.arabic.dan}
              </div>
              <div className="[font-family:'Scheherazade New',serif]">
                {CONFIG.couple.groom}
              </div>
            </div>
            <div className="text-sm opacity-80 [font-family:'Scheherazade New',serif]">
              {CONFIG.event.hijri}
            </div>
            <div className="text-lg font-medium">
              {CONFIG.event.dateMalayUpper}
            </div>
            <div
              className="mx-auto w-16 border-t"
              style={{ borderColor: CONFIG.theme.goldSoft }}
            />
            <div className="space-y-1">
              <div
                className="tracking-widest text-xs"
                style={{ color: CONFIG.theme.goldSoft }}
              >
                {CONFIG.event.venueName}
              </div>
            </div>
            <div className="text-xs italic opacity-80">
              {CONFIG.event.quote}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <div
        className="sticky bottom-0 w-full"
        style={{
          borderTop: `1px solid ${CONFIG.theme.goldSoft}33`,
          background: "rgba(20,20,20,0.85)",
        }}
      >
        <div className="max-w-md mx-auto flex items-stretch">
          <SimpleRSVP />
          <MoneyGiftSheet />
          <WishlistSheet />
          <ContactSheet />
          <LocationSheet />
          <CalendarSheet />
        </div>
      </div>
    </div>
  );
}
