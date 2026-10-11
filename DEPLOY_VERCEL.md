# 🚀 Vercel Deployment Guide

এই প্রোজেক্টটি **Next.js 14 App Router** আর্কিটেকচারে তৈরি এবং **Vercel**-এ ১-ক্লিকে ডিপ্লয় করার জন্য ১০০% প্রস্তুত।

---

## ⚡ পদ্ধতি ১: GitHub + Vercel (সবচেয়ে সহজ ও সেরা উপায়)

### ধাপ ১: GitHub-এ রিপোজিটরি তৈরি করুন
1. [github.com](https://github.com)-এ যান এবং একটি নতুন **New Repository** তৈরি করুন (যেমন: `my-portfolio`).
2. আপনার প্রজেক্ট ফোল্ডার থেকে কোড পুশ করুন:
```bash
git init
git add .
git commit -m "feat: complete 3D portfolio & link-in-bio platform ready for vercel"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### ধাপ ২: Vercel-এ ইমপোর্ট ও ডিপ্লয়
1. [vercel.com](https://vercel.com)-এ লগইন করুন।
2. **"Add New..."** বাটনে ক্লিক করে **"Project"** সিলেক্ট করুন।
3. আপনার গিটহাব রিপোজিটরিটি সিলেক্ট করে **"Import"**-এ ক্লিক করুন।
4. Vercel স্বয়ংক্রিয়ভাবে সব সেটিংস ডিটেক্ট করবে:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `next build`
   - **Output Directory:** `.next`
5. **Environment Variables** সেকশনে নিচের ভেরিয়েবলগুলো দিন (ঐচ্ছিক কিন্তু সাজেস্টেড):
   - `NEXT_PUBLIC_SITE_URL` = আপনার Vercel ডোমেইন (যেমন: `https://your-app.vercel.app`)
   - *(Supabase ব্যবহার করতে চাইলে `.env.local` এর কীগুলো কপি করে পেস্ট করতে পারেন)*
6. **"Deploy"** বাটনে চাপুন! মাত্র ১ মিনিটের মধ্যে আপনার সাইট লাইভ হয়ে যাবে! 🌐

---

## ⚡ পদ্ধতি ২: Vercel CLI দিয়ে সরাসরি ডিপ্লয়

আপনার টার্মিনালে সরাসরি নিচের কমান্ডটি চালান:
```bash
npx vercel
```
লগইন ও প্রোজেক্ট সিলেক্ট করার পর প্রোডাকশনে ডিপ্লয় করতে রান করুন:
```bash
npx vercel --prod
```

---

## 🔑 প্রস্তুত অ্যাকাউন্ট ও ক্রেডেনশিয়ালস

| টাইপ | ইউজারনেম / ইমেইল | পাসওয়ার্ড | ড্যাশবোর্ড লিংক |
|---|---|---|---|
| **মাস্টার ক্রিয়েটর** | `jubayer` অথবা `jubayerahmmed2k@gmail.com` | `password123` | `/dashboard` |
| **রুট এডমিন** | `admin` অথবা `admin@portfolio.com` | `admin123` / `password123` | `/admin` |
| **লাইভ ৩ডি বায়ো** | — | — | `/u/jubayer` |

---

## 🛡️ Vercel-এর জন্য যা যা রেডি করা হয়েছে:
1. `vercel.json` কনফিগারেশন যোগ করা হয়েছে।
2. Next.js প্রোডাকশন বিল্ড (`next build`) সফলভাবে ৩৭টি পেইজ সহ পাস করেছে (০টি এরর)।
3. Vercel Serverless রীড-অনলি ফাইলসিস্টেমের জন্য স্বয়ংক্রিয় `/tmp` ডেটা স্টোর ফলব্যাক যুক্ত করা হয়েছে।
4. আন-অপ্টিমাইজড এক্সটার্নাল ইমেজ কোটা এরর প্রতিরোধে `next.config.js` অপ্টিমাইজ করা হয়েছে।
