import React, { useMemo, useRef, useState, useEffect } from "react";
import bgImage from "/public/bg-wedding.jpg";
//import { ReactComponent as QrCode } from "@/assets/kod-qr.svg";
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
  Instagram, 
  Facebook, 
  Music2, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight
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
    groom: "ادهم",
    bride: "أليسا",
    arabic: { walimah: "وليمة العروس", dan: "و" },
    latin: { groom: "Idham", bride: "Alyssa" },
  },
  event: {
    title: "WALIMATULURUS",
    hijri: "سبت، ٧ ربيع الأوّل ١٤٤٧",
    date: new Date("2025-08-29T12:00:00+08:00"),
    dateMalayUpper: "SABTU, 29 OGOS 2026",
    venueName: "RUMAH HAJI ABD RASHID ANUAR",
    venueAddress: "34, Jalan Sultan Salahuddin Abdul Aziz Shah 9/6, Seksyen 9, 40100 Shah Alam, Selangor",
    mapsUrl:
      "https://maps.app.goo.gl/nqrBej9o2XaFhkwK8",
    quote:
      "“Dan Kami menciptakan kamu berpasang-pasangan”\nSurah An-Naba (78:8)",
  },
  bank: {
    bankName: "CIMB Berhad",
    accountNumber: "7634409605",
    accountName: "NUR ALYSSA BINTI ABD RASHID ANUAR",
    duitNowId: "",
  },
  contact: {
    person1: { name: "Rashid", phone: "+60133811815" },
    person2: { name: "Jamaiah", phone: "+60133812323" },
    person3: { name: "Idham", phone: "+601111210750"},
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
    a.download = "kod-qr.jpg";
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
              className="mt-4 flex flex-col items-center gap-3">
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
        {[CONFIG.contact.person1, CONFIG.contact.person2, CONFIG.contact.person3].map((p, i) => (
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
      <div className="py-4 grid gap-4" >
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

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="h-px flex-1 bg-yellow-600"></div>
        <span className="text-2xl font-semibold tracking-wide text-yellow-500">
          MENANTI HARI
        </span>
        <div className="h-px flex-1 bg-yellow-600"></div>
      </div>

      <div className="flex justify-center gap-4 mt-4">
        <FlipUnit label="Hari" value={timeLeft.days} />
        <FlipUnit label="Jam" value={timeLeft.hours} />
        <FlipUnit label="Minit" value={timeLeft.minutes} />
        <FlipUnit label="Saat" value={timeLeft.seconds} />
      </div>
    </div>
  );
}

function FlipUnit({ label, value }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white text-black rounded-md shadow-md px-3 py-2 text-2xl font-bold min-w-[60px] text-center">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-sm text-yellow-500">{label}</span>
    </div>
  );
}

function getTimeRemaining(targetDate) {
  const total = Date.parse(targetDate) - Date.now();
  const seconds = Math.max(Math.floor((total / 1000) % 60), 0);
  const minutes = Math.max(Math.floor((total / 1000 / 60) % 60), 0);
  const hours = Math.max(Math.floor((total / (1000 * 60 * 60)) % 24), 0);
  const days = Math.max(Math.floor(total / (1000 * 60 * 60 * 24)), 0);

  return { total, days, hours, minutes, seconds };
}

function Gallery({ images }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative w-full max-w-md mx-auto">
      <img src={images[idx]} alt="" className="w-full rounded-xl shadow" />
      <button onClick={() => setIdx((idx - 1 + images.length) % images.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">
        <ChevronLeft />
      </button>
      <button onClick={() => setIdx((idx + 1) % images.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full">
        <ChevronRight />
      </button>
    </div>
  );
}

function Guestbook() {
  const [messages, setMessages] = useState(
    JSON.parse(localStorage.getItem("guestbook") || "[]")
  );
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", msg: "" });

  const submit = () => {
    const updated = [...messages, form];
    setMessages(updated);
    localStorage.setItem("guestbook", JSON.stringify(updated));
    setForm({ name: "", msg: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>
        <MessageSquare className="mr-2 h-4 w-4"/> Sampaikan ucapan
      </Button>
      {messages.map((m, i) => (
        <div key={i} className="border p-3 rounded-xl">
          <div className="font-semibold">{m.name}</div>
          <div className="text-sm text-muted-foreground">{m.msg}</div>
        </div>
      ))}

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-black rounded-xl p-6 w-80">
            <h3 className="font-semibold mb-3">Sampaikan ucapan</h3>
            <input
              className="w-full border p-2 rounded mb-2"
              placeholder="Nama"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <textarea
              className="w-full border p-2 rounded mb-2"
              placeholder="Ucapan"
              value={form.msg}
              onChange={(e) => setForm({ ...form, msg: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
              <Button onClick={submit}>Hantar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WeddingInvite() {
  const dText = formatDateRange(CONFIG.event.date);
  return (
    <div
      className="min-h-screen w-full bg-fixed bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})`, color: CONFIG.theme.gold }}
    >
      <div className="relative bg-black/50 flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
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
            <div className="text-xs italic opacity-80, whitespace-pre-line text-center">
              {CONFIG.event.quote}
            </div>
          </div>
        </motion.div>
      </div>
      {/* New Sections */}
      <div className="bg-black/50 max-w-md mx-auto px-4 py-8 space-y-10 text-gold">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
        <h2 className="font-semibold text-lg text-center">ASSALAMUALAIKUM WBT & SALAM SEJAHTERA</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p className="font-medium text-center">Abd Rashid Anuar bin Zakaria</p>
          <p className="font-medium text-center">&</p>
          <p className="font-medium text-center">Jamaiah binti Mahamad</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p className="font-medium text-center">
            Dengan penuh kesyukuran kehadrat Illahi, kami mempersilakan Dato'/Datin/Dr/Tuan/Puan/Encik/Cik ke walimatulurus anakanda kesayangan kami
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p className="font-medium text-center">Nur Alyssa binti Abd Rashid Anuar</p>
          <p className="font-medium text-center">&</p>
          <p className="font-medium text-center">Muhammad Idham bin Padil</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-center">Maklumat Majlis</h2>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <p className="font-small text-center">Tarikh: {CONFIG.event.dateMalayUpper}</p>
          <p className="font-small text-center">Masa: 11:00 Pagi - 4:00 Petang</p>
          <p className="font-small text-center">Tempat:</p>
          <p className="font-small text-center"> {CONFIG.event.venueName}, </p>
          <p className="font-small text-center"> {CONFIG.event.venueAddress}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h3 className="font-semibold mt-3 text-center">Aturcara Majlis</h3>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <ul className="list-disc ml-6 text-sm">
            <p className="font-small text-center">11:00 AM - Majlis Bermula</p>
            <p className="font-small text-center">12:30 PM - Ketibaan Pengantin</p>
            <p className="font-small text-center">4:00 PM - Majlis Berakhir</p>
          </ul>
        </motion.div>
        
        {/* Countdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
        <Countdown targetDate="2026-08-29T11:00:00" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-2 text-center">Galeri</h2>
          <Gallery images={["/hall1.jpg","/hall2.jpg","/hall3.jpg"]}/>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <h2 className="text-lg font-semibold mb-2 text-center">Guestbook</h2>
          <Guestbook/>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
        <div className="p-4 border rounded-xl italic text-center">
          Ya Allah, berkatilah majlis perkahwinan ini, 
          limpahkan baraqah dan rahmat kepada kedua mempelai ini, 
          Kurniakanlah mereka zuriat yang soleh dan solehah. 
          Kekalkanlah jodoh mereka di dunia dan di akhirat dan sempurnakanlah agama mereka dengan berkat ikatan ini.
        </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
        <div className="text-center space-y-2">
          <div className="font-semibold">#AlyssaXIdham</div>
          <div className="text-xs">Created with ❤️ by Muhammad Idham</div>
          <div className="flex justify-center gap-4 mt-2">
            <a href="#"><Instagram /></a>
            <a href="#"><Facebook /></a>
            <a href="#"><Music2 /></a>
          </div>
        </div>
        </motion.div>
      </div>

      {/* Bottom Nav */}
      <div
        className="sticky bottom-0 w-full left-0 right-0"
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
