"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import Footer from "@/components/shared/Footer";

const faqs = [
  {
    question: "How quickly can I get pre-approved?",
    answer:
      "Most applicants receive pre-approval offers within a few minutes after submitting an application. Timing can vary by profile and lender response.",
  },
  {
    question: "Will this affect my credit score?",
    answer:
      "Initial matching uses a soft credit inquiry, which does not impact your credit score. A lender may request a hard pull later if you choose to move forward.",
  },
  {
    question: "Do I need to choose a vehicle first?",
    answer:
      "No. Many borrowers start with a target budget so they can shop with clearer financing guardrails before selecting a vehicle.",
  },
  {
    question: "Is Auto Loan Pro free to use?",
    answer:
      "Yes. Borrowers can explore the platform and compare options without paying an application fee.",
  },
];

type ContactSubmissionPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ContactApiResponse =
  | { success: true; data?: { message?: string } }
  | { success: false; error?: string };

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = "Contact Us — Auto Loan Pro";
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");
    setSubmitMessage("");

    const payload: ContactSubmissionPayload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: ContactApiResponse = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = "error" in result ? result.error : undefined;
        throw new Error(errorMessage || "Failed to send your message.");
      }

      setSubmitMessage(result.data?.message || "Your message has been sent successfully.");
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("General");
      setMessage("");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to send your message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="premium-page min-h-screen bg-white text-[#425466]">
      <section className="animate-fade-in-up px-6 py-20 pt-28 md:py-24 md:pt-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <div className="inline-flex items-center rounded-full border border-[#E3E8EE] bg-[#F6F9FC] px-4 py-2 text-sm font-medium text-[#0A2540]">
              Contact Auto Loan Pro
            </div>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-[#0A2540] sm:text-5xl">
              Reach the team with questions about the platform, partnerships, or support.
            </h1>
            <p className="mt-6 text-base leading-relaxed text-[#425466] sm:text-lg">
              Use the form below and we will route your message to the right team. If you are exploring financing,
              the fastest path is usually to start your application and compare offers from there.
            </p>
          </div>

          <div className="mt-16 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
              <div className="sr-only" aria-live="polite">
                {submitted
                  ? "Message sent successfully."
                  : submitting
                    ? "Sending your message."
                    : "Contact form ready."}
              </div>

              {submitted ? (
                <div className="premium-card rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#2563EB]">
                    <Check className="h-7 w-7" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-[#0A2540]">Message sent</h2>
                  <p className="mt-3 text-sm leading-relaxed text-[#425466]">{submitMessage}</p>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="premium-button mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-[#0A2540]">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Your name"
                      className="premium-input w-full rounded-xl border border-[#E3E8EE] bg-gray-50 px-4 py-3 text-sm text-[#0A2540] placeholder:text-[#6B7C93]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-[#0A2540]">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="premium-input w-full rounded-xl border border-[#E3E8EE] bg-gray-50 px-4 py-3 text-sm text-[#0A2540] placeholder:text-[#6B7C93]"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="mb-2 block text-sm font-medium text-[#0A2540]">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="premium-input w-full rounded-xl border border-[#E3E8EE] bg-gray-50 px-4 py-3 text-sm text-[#0A2540]"
                    >
                      <option>General</option>
                      <option>Support</option>
                      <option>Lender Partnership</option>
                      <option>Dealer Partnership</option>
                      <option>Press</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-[#0A2540]">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={6}
                      placeholder="How can we help?"
                      className="premium-input w-full rounded-xl border border-[#E3E8EE] bg-gray-50 px-4 py-3 text-sm text-[#0A2540] placeholder:text-[#6B7C93]"
                    />
                  </div>

                  {submitError && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" aria-live="assertive">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="premium-button inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {submitting ? "Sending..." : "Send message"}
                  </button>
                </form>
              )}
            </div>

            <aside className="grid h-full auto-rows-fr gap-6 self-start">
              <div className="premium-card rounded-xl border border-[#E3E8EE] bg-[#F6F9FC] p-8">
                <h2 className="text-2xl font-semibold text-[#0A2540]">Contact information</h2>
                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E3E8EE] bg-white text-[#2563EB]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A2540]">Email</p>
                      <a href="mailto:hello@autoloanpro.co" className="mt-1 inline-block text-sm leading-relaxed text-[#425466] hover:text-[#0A2540]">
                        hello@autoloanpro.co
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E3E8EE] bg-white text-[#2563EB]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A2540]">Phone</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#425466]">(000) 000-0000</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E3E8EE] bg-white text-[#2563EB]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0A2540]">Address</p>
                      <p className="mt-1 text-sm leading-relaxed text-[#425466]">
                        123 Market Street
                        <br />
                        Suite 400
                        <br />
                        San Francisco, CA 94105
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card rounded-xl border border-[#E3E8EE] bg-white p-8">
                <h2 className="text-2xl font-semibold text-[#0A2540]">Prefer to self-serve?</h2>
                <p className="mt-3 text-sm leading-relaxed text-[#425466]">
                  Review how the process works or estimate a monthly payment before you reach out.
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    href="/how-it-works"
                    className="premium-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Review the process
                  </Link>
                  <Link
                    href="/calculator"
                    className="premium-button inline-flex min-h-11 items-center justify-center rounded-full border border-[#E3E8EE] bg-white px-5 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    Open the calculator
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-[#0A2540] sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#425466] sm:text-lg">
              A few quick answers for common pre-approval and support questions.
            </p>
          </div>

          <div className="mt-14 space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = expandedFaq === index;

              return (
                <div key={faq.question} className="premium-card rounded-xl border border-[#E3E8EE] bg-white">
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : index)}
                    className="flex min-h-11 w-full items-center justify-between gap-4 px-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
                    aria-expanded={isExpanded}
                    aria-controls={`contact-faq-${index}`}
                  >
                    <span className="text-base font-semibold text-[#0A2540]">{faq.question}</span>
                    <ChevronDown className={`h-5 w-5 flex-none text-[#6B7C93] transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div id={`contact-faq-${index}`} className="px-6 pb-6">
                      <p className="text-sm leading-relaxed text-[#425466]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
