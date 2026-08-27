import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact us",
  description: "Get in touch with The Wild Oasis.",
};

function Contact() {
  return (
    <div className="grid items-start gap-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
      <div className="pt-2">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-accent-400">
          We would love to hear from you
        </p>
        <h1 className="text-4xl font-medium leading-tight text-primary-50 sm:text-5xl">
          Let&apos;s plan something memorable.
        </h1>
        <p className="mt-7 max-w-md text-lg leading-8 text-primary-300">
          Have a question about the cabins, the mountains, or your next stay?
          Send us a note and our family will get back to you shortly.
        </p>

        <div className="mt-12 space-y-6 border-t border-primary-800 pt-7 text-base text-primary-300">
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-accent-400">
              Email
            </p>
            <a
              href="mailto:omarapdelmorid@gmail.com"
              className="mt-2 inline-block transition-colors hover:text-primary-50"
            >
              omarapdelmorid@gmail.com
            </a>
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.16em] text-accent-400">
              Visit
            </p>
            <p className="mt-2 leading-7">
              Forest Road 17
              <br />
              Northwood, 48210
            </p>
          </div>
        </div>
      </div>

      <ContactForm />
    </div>
  );
}

export default Contact;
