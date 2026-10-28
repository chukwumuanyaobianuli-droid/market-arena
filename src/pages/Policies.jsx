import React from 'react';
import { ShieldCheck, FileText, Truck, RefreshCw, Mail, AlertTriangle } from 'lucide-react';

export default function Policies() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-12 text-gray-800">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900">Market Arena Policies & Terms</h1>
        <p className="text-sm text-gray-500">Official guidelines and terms for buyers and sellers in Calabar & UNICAL.</p>
      </div>

      <section id="terms" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <FileText className="w-5 h-5" />
          <h2>1. Terms of Service</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Market Arena provides an online directory connecting buyers and sellers across the University of Calabar (UNICAL) and Calabar metropolis. By using this service, you agree that Market Arena acts solely as a venue for classified ads.
        </p>
      </section>

      <section id="privacy" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <ShieldCheck className="w-5 h-5" />
          <h2>2. Privacy Policy</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          We collect minimal personal data including your email, display name, and WhatsApp phone number to facilitate listing creation and communication. We never sell your personal information to third parties.
        </p>
      </section>

      <section id="acceptable-use" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <AlertTriangle className="w-5 h-5" />
          <h2>3. Acceptable Use Policy</h2>
        </div>
        <ul className="list-disc list-inside text-xs text-gray-600 space-y-1">
          <li>No illegal items, weapons, drugs, or stolen property.</li>
          <li>No spamming, deceptive listings, or duplicate posts.</li>
          <li>Sellers must provide accurate descriptions and real photos of items.</li>
        </ul>
      </section>

      <section id="shipping" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <Truck className="w-5 h-5" />
          <h2>4. Shipping & Delivery Policy</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Market Arena does not offer native logistics or escrow shipping. All physical deliveries, campus pickups, and meetups are arranged independently between the buyer and seller via WhatsApp.
        </p>
      </section>

      <section id="returns" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <RefreshCw className="w-5 h-5" />
          <h2>5. Returns & Refund Policy</h2>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Because payments and exchanges happen directly between buyers and sellers, Market Arena does not process refunds or cancellations for items. Buyers are advised to inspect items physically before making payment.
        </p>
      </section>

      <section id="contact" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center space-x-2 text-brand-600 font-bold text-lg">
          <Mail className="w-5 h-5" />
          <h2>6. Contact Us</h2>
        </div>
        <p className="text-xs text-gray-600">
          Have questions or need assistance? Reach out to support at <a href="mailto:support@marketarena.com" className="text-brand-600 font-medium">support@marketarena.com</a>.
        </p>
      </section>
    </div>
  );
}