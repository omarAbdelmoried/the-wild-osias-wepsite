"use client";

import { forwardRef } from "react";
import { useContactForm } from "./useContactForm";

function ContactForm() {
  const {
    register,
    submitForm,
    handleChange,
    errors,
    isSubmitting,
    status,
    errorMessage,
  } = useContactForm();

  return (
    <form
      onSubmit={submitForm}
      className="bg-primary-900 p-8 text-lg shadow-xl sm:p-10"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          error={errors.name?.message}
          {...register("name", {
            required: "Please enter your name.",
            onChange: handleChange,
          })}
        />
        <Field
          id="email"
          label="Email address"
          type="email"
          error={errors.email?.message}
          {...register("email", {
            required: "Please enter your email address.",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address.",
            },
            onChange: handleChange,
          })}
        />
      </div>

      <div className="mt-6">
        <Field
          id="phone"
          label="Phone number"
          type="tel"
          placeholder="How can we reach you?"
          error={errors.phone?.message}
          {...register("phone", {
            required: "Please enter your phone number.",
            onChange: handleChange,
          })}
        />
      </div>

      <div className="mt-6">
        <Field
          id="subject"
          label="Subject"
          placeholder="What can we help with?"
          error={errors.subject?.message}
          {...register("subject", {
            required: "Please enter a subject.",
            onChange: handleChange,
          })}
        />
      </div>

      <div className="mt-6 space-y-2">
        <label htmlFor="message">Your message</label>
        <textarea
          id="message"
          aria-invalid={errors.message ? "true" : "false"}
          {...register("message", {
            required: "Please enter your message.",
            onChange: handleChange,
          })}
          rows={7}
          placeholder="Tell us a little about what you have in mind..."
          className="min-h-44 w-full resize-y bg-primary-100 px-5 py-3 text-primary-800 shadow-sm outline-none transition-colors placeholder:text-primary-500 focus:ring-2 focus:ring-accent-400"
        />
        {errors.message && (
          <p className="text-sm text-red-300">{errors.message.message}</p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xs text-sm leading-6 text-primary-400">
          We usually reply within one working day.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-accent-500 px-8 py-4 font-semibold text-primary-800 transition-colors hover:bg-accent-400 focus:outline-none focus:ring-2 focus:ring-accent-300 focus:ring-offset-2 focus:ring-offset-primary-900"
        >
          {status === "sending" ? "Sending..." : "Send my message"}
        </button>
      </div>

      {status === "sent" && (
        <p role="status" className="mt-5 text-sm text-accent-300">
          Thanks, your message has been sent.
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-5 text-sm text-red-300">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

const Field = forwardRef(function Field(
  { id, label, error, ...inputProps },
  ref,
) {
  return (
    <div className="space-y-2">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={ref}
        className="w-full bg-primary-100 px-5 py-3 text-primary-800 shadow-sm outline-none transition-colors placeholder:text-primary-500 focus:ring-2 focus:ring-accent-400"
        {...inputProps}
      />
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
});

export default ContactForm;
