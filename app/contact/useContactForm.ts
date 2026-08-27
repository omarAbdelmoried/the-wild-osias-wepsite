"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

export type ContactFormValues = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const defaultValues: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function useContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ defaultValues });

  function handleChange() {
    setStatus("idle");
    setErrorMessage("");
  }

  async function submitForm(form: ContactFormValues) {
    setStatus("sending");
    setErrorMessage("");
    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 20000);
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        signal: controller.signal,
      });

      const responseText = await response.text();
      let result;

      try {
        result = JSON.parse(responseText);
      } catch {
        throw new Error(
          "The contact service returned an invalid response. Please restart the website and try again.",
        );
      }

      if (!response.ok) {
        throw new Error(result.error || "Your message could not be sent.");
      }

      setStatus("sent");
      reset();
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error.name === "AbortError"
          ? "The email service took too long to respond. Please try again."
          : error.message || "Your message could not be sent.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    register,
    submitForm: handleSubmit(submitForm),
    handleChange,
    errors,
    isSubmitting,
    status,
    errorMessage,
  };
}
