import { IUser } from "@/components/context/UserContext";
import Card from "@/components/ui/Card";
import { useState } from "react";

interface HelpViewProps {
  user: IUser;
}
const faqs = [
  {
    question: "What is SmartSpend?",
    answer:
      "SmartSpend is a personal finance app designed for students but available to anyone. It helps users manage their spending, track savings, and make better financial decisions.",
  },
  {
    question: "Who created SmartSpend?",
    answer:
      "SmartSpend was created by Trent Calvin and Josh Trowbridge-Roan as part of a coding competition for FBLA (Coding and Programming).",
  },
  {
    question: "How can I use SmartSpend?",
    answer:
      "You can start by connecting your bank account to SmartSpend. This allows the app to analyze your spending habits and provide personalized insights.",
  },
  {
    question: "Is my data safe with SmartSpend?",
    answer:
      "Yes, SmartSpend uses encryption such as Argon2 and secure connections to bank APIs to ensure your data is secure. We do not share your information with third parties.",
  },
  {
    question: "Where can I use SmartSpend?",
    answer:
      "SmartSpend is an online application that can be accessed anywhere with an internet connection.",
  },
  {
    question: "When was SmartSpend developed?",
    answer:
      "SmartSpend was developed as part of an FBLA competition project in 2025 and continues to be improved over time.",
  },
  {
    question: "Why should I use SmartSpend?",
    answer:
      "SmartSpend provides an easy-to-use platform to help students and individuals gain financial literacy and manage their money effectively.",
  },
  {
    question: "What if I have more questions?",
    answer:
      "You can contact us via our support email above for any further questions.",
  },
];

export default function HelpView({ user }: HelpViewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <Card className="h-full w-full p-6 bg-dark text-white">
      <h1 className="text-4xl font-black mb-6">Help</h1>

      {/* Support Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Support</h2>
        <p>
          If you need assistance, please contact us at:
          <a href="mailto:support@smartspend.online" className="text-primary ml-1">
            support@smartspend.online
          </a>
        </p>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">FAQ</h2>
        <div className="flex flex-col gap-2">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-primary rounded-lg p-3 transition-all duration-300"
            >
              <button
                className="w-full text-left font-medium flex justify-between"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <span
                  className="transition-transform duration-300"
                  style={{
                    transform:
                      openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-max-height duration-300 ${openIndex === index ? "max-h-40" : "max-h-0"}`}
              >
                <p className="mt-2 text-text">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
