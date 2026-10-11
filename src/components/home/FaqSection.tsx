'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'এই ৩ডি বায়ো সাইট তৈরি করা কি সম্পূর্ণ ফ্রি?',
    answer:
      'হ্যাঁ, একদম ১০০% সম্পূর্ণ ফ্রি! কোনো ক্রেডিট কার্ড বা সাবস্ক্রিপশন চার্জ ছাড়াই আপনি সাইন আপ করে এক মিনিটে নিজের জন্য আল্ট্রা-ফাস্ট ৩ডি লিংক-ইন-বায়ো প্রোফাইল তৈরি করতে পারবেন।',
  },
  {
    question: 'কীভাবে আমি আমার Instagram বা TikTok বায়োতে এই লিংক ব্যবহার করব?',
    answer:
      'খুবই সহজ! সাইন আপ করার পর আপনার ড্যাশবোর্ড থেকে এক ক্লিকে "Copy Link" বাটনে চাপুন (যেমন: /u/yourname)। এরপর আপনার Instagram বা TikTok প্রোফাইলে গিয়ে "Edit Profile" ➔ "Links / Website" অপশনে লিংকটি পেস্ট করে দিলেই আপনার সব ফলোয়াররা এই ৩ডি প্রোফাইল দেখতে পাবে।',
  },
  {
    question: 'আমি কি পরে আমার ছবি ও সোশ্যাল লিংক পরিবর্তন করতে পারব?',
    answer:
      'অবশ্যই! আপনার পার্সোনাল ড্যাশবোর্ডে যেকোনো সময় লগইন করে আপনার ডিসপ্লে নেম, বায়ো লেখা, ৪টি পার্সোনাল ছবি, সোশ্যাল লিংক এবং গ্লো থিম পরিবর্তন করতে পারবেন। পরিবর্তন করার সাথে সাথে তা সেকেন্ডের মধ্যে লাইভ পেজে আপডেট হয়ে যাবে।',
  },
  {
    question: 'আমার ৪টি ছবি কি ভিজিটররা ফুলস্ক্রিন HD কোয়ালিটিতে দেখতে পারবে?',
    answer:
      'হ্যাঁ! আপনার আপলোড করা ছবিগুলো একটি প্রিমিয়াম ৪-ফটো গ্রিডে প্রদর্শিত হয়। ভিজিটররা যেকোনো ছবিতে ক্লিক করলেই ফুলস্ক্রিন HD লাইটবক্স ওপেন হবে, ছবি বড় করে দেখতে পারবে এবং হার্ট রিঅ্যাকশন দিতে পারবে।',
  },
  {
    question: 'আমি কি নিজের বায়োর জন্য QR Code পাব?',
    answer:
      'হ্যাঁ! আপনার ড্যাশবোর্ডে "QR Code" বাটনে ক্লিক করলে আপনার প্রোফাইলের জন্য একটি এক্সক্লুসিভ হাই-রেজোলিউশন QR Code তৈরি হবে, যা আপনি সরাসরি ডাউনলোড করে ইনস্টাগ্রাম স্টোরি বা বিজনেস কার্ডে ব্যবহার করতে পারবেন।',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-[#090909]">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max px-4 md:px-8 relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
            <HelpCircle size={13} />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
            সাধারণ জিজ্ঞাসা ও উত্তর
          </h2>
          <p className="text-white/50 text-sm mt-2 max-w-lg mx-auto">
            আপনার বায়ো সাইট তৈরি, সোশ্যাল লিংক শেয়ারিং এবং ফিচার সম্পর্কিত দরকারি তথ্যাবলী
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div
                key={index}
                className={`glass gradient-border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-orange-500/30 bg-white/[0.04]' : 'hover:border-white/20'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-white text-sm md:text-base pr-2">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'bg-orange-500 text-white rotate-180 shadow-md shadow-orange-500/30'
                        : 'bg-white/5 text-white/50'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-white/[0.04]">
                        <p className="text-white/70 text-xs md:text-sm leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
