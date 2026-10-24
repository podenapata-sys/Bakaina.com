import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import FooterLogo from "./FooterLogo";
import NewsletterForm from "./NewsletterForm";

const quickLinks = ["Shop all", "New arrivals", "Best sellers", "Offers"];
const serviceLinks = ["Track order", "Delivery information", "Returns & refunds", "Privacy policy", "Contact us"];
const payments = ["bKash", "Nagad", "Visa", "Mastercard", "Cash on Delivery"];

async function CopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

function SocialIcon({ label, path }: { label: string; path: string }) {
  return (
    <Link
      href="#"
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full bg-on-primary/10 transition hover:bg-accent hover:text-on-accent"
    >
      <svg viewBox="0 0 24 24" className="size-5 fill-current" aria-hidden>
        <path d={path} />
      </svg>
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-primary text-on-primary">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <FooterLogo />
          <p className="text-sm leading-relaxed opacity-85">
            Global products, trusted quality. Trending products delivered across Bangladesh.
          </p>
          <div className="flex gap-2">
            <SocialIcon label="Facebook" path="M14 8h3V4h-3c-2.8 0-4 1.7-4 4.3V10H7v4h3v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z" />
            <SocialIcon label="Instagram" path="M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM17 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM16 2H8a6 6 0 0 0-6 6v8a6 6 0 0 0 6 6h8a6 6 0 0 0 6-6V8a6 6 0 0 0-6-6zm4 14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4z" />
            <SocialIcon label="YouTube" path="M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12a31 31 0 0 0 .4 3.8 3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-3.8 31 31 0 0 0-.4-3.8zM10 15V9l5.2 3z" />
            <SocialIcon label="TikTok" path="M16.5 3c.4 2.2 1.8 3.6 4 3.9v3.2a7.4 7.4 0 0 1-4-1.3v6.1A6 6 0 1 1 10 9v3.3a2.8 2.8 0 1 0 2.2 2.7V3z" />
          </div>
        </div>

        <nav aria-label="Quick links" className="flex flex-col gap-3">
          <h2 className="font-semibold">Quick Links</h2>
          {quickLinks.map((l) => (
            <Link key={l} href="#" className="w-fit text-sm opacity-85 transition hover:text-accent hover:opacity-100">
              {l}
            </Link>
          ))}
        </nav>

        <nav aria-label="Customer service" className="flex flex-col gap-3">
          <h2 className="font-semibold">Customer Service</h2>
          {serviceLinks.map((l) => (
            <Link key={l} href="#" className="w-fit text-sm opacity-85 transition hover:text-accent hover:opacity-100">
              {l}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="font-semibold">Newsletter</h2>
          <p className="text-sm opacity-85">Get offers and new arrivals first.</p>
          <NewsletterForm />
          <div className="mt-2 flex flex-col gap-2 text-sm opacity-85">
            <span className="flex items-center gap-2"><Phone className="size-4" aria-hidden /> [PHONE NUMBER]</span>
            <span className="flex items-center gap-2"><MessageCircle className="size-4" aria-hidden /> WhatsApp: [NUMBER]</span>
            <span className="flex items-center gap-2"><Mail className="size-4" aria-hidden /> [EMAIL]</span>
          </div>
        </div>
      </div>

      <div className="border-t border-on-primary/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <ul aria-label="Payment methods" className="flex flex-wrap gap-2">
            {payments.map((p) => (
              <li key={p} className="rounded-md bg-bg px-3 py-1 text-xs font-semibold text-primary">
                {p}
              </li>
            ))}
          </ul>
          <p className="text-sm opacity-85">© <CopyrightYear /> BAKAINA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
