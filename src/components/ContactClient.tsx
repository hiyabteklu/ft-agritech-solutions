'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function ContactClient() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null as null | { ok: boolean; msg: string });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (status && !status.ok) {
      const t = setTimeout(() => setStatus(null), 4500);
      return () => clearTimeout(t);
    }
  }, [status]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({ ok: false, msg: 'Please fill in name, email, and message.' });
      return;
    }

    setSending(true);
    const { error } = await supabase.from('contact_messages').insert([
      {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || null,
        message: message.trim(),
      },
    ]);
    setSending(false);

    if (error) {
      setStatus({
        ok: false,
        msg:
          'Could not send via form right now. Please reach us on Telegram or LinkedIn instead.',
      });
      return;
    }

    setStatus({ ok: true, msg: 'Message sent. Our team will get back to you.' });
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navbar />
      <main className="mx-auto max-w-2xl animate-fade-up px-4 py-12 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-brand-gold/60 bg-brand-gold/10 px-5 py-2.5 text-base font-semibold text-brand-gold transition hover:bg-brand-gold/20 active:scale-[0.98]"
        >
          <span className="text-lg leading-none" aria-hidden>
            ←
          </span>
          Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
        <p className="mb-8 text-base text-gray-400">
          Partnerships, deployment inquiries, or general questions — send a message or use the
          channels below.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="https://t.me/FT_Agri_Tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#0088cc] px-6 py-2.5 text-base font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            Telegram
          </a>
          <a
            href="https://www.linkedin.com/company/ft-agritech-solutions/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center rounded-full bg-[#0A66C2] px-6 py-2.5 text-base font-semibold text-white shadow-md transition hover:opacity-90 active:scale-[0.98]"
          >
            LinkedIn
          </a>
        </div>

        <form
          onSubmit={submit}
          className="card-alive rounded-2xl border border-white/10 bg-brand-card p-6 sm:p-8"
        >
          {status?.ok ? (
            <div className="animate-scale-in rounded-xl border border-brand-green/40 bg-brand-green/10 p-5 text-center">
              <p className="text-base font-medium text-brand-green">{status.msg}</p>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className="mt-4 min-h-[44px] w-full rounded-xl border border-brand-green/50 bg-brand-green/20 py-2.5 text-base font-semibold text-brand-green transition hover:bg-brand-green/30 active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm text-gray-400">Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="Your name"
                />
              </label>
              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm text-gray-400">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="you@example.com"
                />
              </label>
              <label className="mb-4 block">
                <span className="mb-1.5 block text-sm text-gray-400">Subject (optional)</span>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="Partnership / Quote / Support"
                />
              </label>
              <label className="mb-6 block">
                <span className="mb-1.5 block text-sm text-gray-400">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-base text-white outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/30"
                  placeholder="How can we help?"
                />
              </label>
              <button
                type="submit"
                disabled={sending}
                className="min-h-[52px] w-full rounded-xl bg-brand-gold py-3.5 text-base font-bold text-black shadow-lg shadow-brand-gold/20 transition hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send message'}
              </button>
              {status && !status.ok && (
                <p className="mt-4 animate-scale-in text-center text-base font-medium text-brand-gold">
                  {status.msg}
                </p>
              )}
            </>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
