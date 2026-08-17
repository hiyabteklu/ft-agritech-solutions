'use client';

import { useState } from 'react';
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
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Link href="/" className="mb-6 inline-block text-sm text-brand-gold hover:underline">
          ← Back to home
        </Link>
        <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">Contact us</h1>
        <p className="mb-8 text-gray-400">
          Partnerships, deployment inquiries, or general questions — send a message or use the
          channels below.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          <a
            href="https://t.me/FT_Agri_Tech"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#0088cc] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            Telegram
          </a>
          <a
            href="https://www.linkedin.com/company/ft-agritech-solutions/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-[#0A66C2] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
          >
            LinkedIn
          </a>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-white/10 bg-brand-card p-6 sm:p-8"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs text-gray-400">Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
              placeholder="Your name"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs text-gray-400">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
              placeholder="you@example.com"
            />
          </label>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs text-gray-400">Subject (optional)</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
              placeholder="Partnership / Quote / Support"
            />
          </label>
          <label className="mb-6 block">
            <span className="mb-1.5 block text-xs text-gray-400">Message</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-brand-gold"
              placeholder="How can we help?"
            />
          </label>
          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-lg bg-brand-gold py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send message'}
          </button>
          {status && (
            <p
              className={
                'mt-4 text-center text-sm ' +
                (status.ok ? 'text-brand-green' : 'text-brand-gold')
              }
            >
              {status.msg}
            </p>
          )}
        </form>
      </main>
      <Footer />
    </div>
  );
}
