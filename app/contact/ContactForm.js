"use client";

import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [isReady, setIsReady] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setIsReady(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    const mailto = `mailto:hello@thewildoasis.com?subject=${encodeURIComponent(
      form.subject
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setIsReady(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-primary-900 p-8 text-lg shadow-xl sm:p-10"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Field
          id="email"
          label="Email address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mt-6">
        <Field
          id="subject"
          label="What can we help with?"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="message">Your message</label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={6}
          placeholder="Tell us a little about what you have in mind..."
          className="w-full resize-y bg-primary-100 px-5 py-3 text-primary-800 shadow-sm outline-none transition-colors placeholder:text-primary-500 focus:ring-2 focus:ring-accent-400"
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-sm leading-6 text-primary-400">
          We usually reply within one working day.
        </p>
        <button
          type="submit"
          className="bg-accent-500 px-8 py-4 font-semibold text-primary-800 transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2 focus:ring-offset-primary-900"
        >
          Prepare my email
        </button>
      </div>

      {isReady && (
        <p role="status" className="mt-5 text-sm text-accent-300">
          Your email app should open with the message ready to send.
        </p>
      )}
    </form>
  );
}

function Field({ id, label, ...props }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="w-full bg-primary-100 px-5 py-3 text-primary-800 shadow-sm outline-none transition-colors placeholder:text-primary-500 focus:ring-2 focus:ring-accent-400"
        {...props}
      />
    </div>
  );
}

export default ContactForm;