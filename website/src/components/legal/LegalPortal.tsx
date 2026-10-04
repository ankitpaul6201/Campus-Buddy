import React, { useState } from 'react';
import { motion } from 'framer-motion';

export type LegalDocType = 'terms' | 'privacy' | 'guidelines';

interface LegalPortalProps {
  initialDoc?: LegalDocType;
  onBackToHome: () => void;
  onNavigateDoc: (doc: LegalDocType) => void;
  onDownloadClick?: () => void;
}

export const LegalPortal: React.FC<LegalPortalProps> = ({
  initialDoc = 'terms',
  onBackToHome,
  onNavigateDoc,
  onDownloadClick
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);

  const handleTabChange = (doc: LegalDocType) => {
    setActiveDoc(doc);
    onNavigateDoc(doc);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#0860E8] selection:text-white pt-6 pb-20 relative overflow-x-hidden">
      
      {/* Light ambient top glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-[#DCEDFD]/60 via-[#EBF4FE]/30 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        
        {/* Main Document Card with Rounded Corners & Outer Border */}
        <div className="rounded-[28px] sm:rounded-[36px] overflow-hidden border border-slate-200/90 shadow-[0_20px_70px_rgba(8,96,232,0.08),0_4px_20px_rgba(0,0,0,0.04)] bg-white relative">
          
          {/* Top Light Header using the Footer's App Gradient Theme */}
          <div 
            className="px-5 sm:px-10 pt-6 pb-10 sm:pb-12 relative overflow-hidden text-slate-800 border-b border-blue-100/90"
            style={{
              background: "linear-gradient(180deg, #FFFFFF 0%, #EEF6FE 25%, #DCEDFD 55%, #C5E3FE 85%, #FFFFFF 100%)",
            }}
          >
            
            {/* Top Navigation Bar without logo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 w-full">
              
              {/* Mobile Top Row: Back to Home + Download App */}
              <div className="flex sm:hidden items-center justify-between w-full">
                <button 
                  onClick={onBackToHome}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#0860E8] transition-colors cursor-pointer"
                >
                  <span>← Home</span>
                </button>

                <button
                  onClick={onDownloadClick || onBackToHome}
                  className="px-3.5 py-1 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0860E8] border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  Download App
                </button>
              </div>

              {/* Desktop Left: Back to Home link */}
              <button 
                onClick={onBackToHome}
                className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 hover:text-[#0860E8] transition-colors cursor-pointer"
              >
                <span>← Home</span>
              </button>

              {/* Center Navigation Switcher Tabs matching uploaded image */}
              <div className="flex justify-center max-w-full">
                <nav className="inline-flex items-center relative bg-white rounded-full p-1 border border-slate-100/90 shadow-[0_10px_30px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.04)]">
                  {[
                    { id: 'privacy' as LegalDocType, full: 'Privacy Policy', short: 'Privacy' },
                    { id: 'terms' as LegalDocType, full: 'Terms of Service', short: 'Terms' },
                    { id: 'guidelines' as LegalDocType, full: 'Student Guidelines', short: 'Guidelines' },
                  ].map((tab) => {
                    const isSelected = activeDoc === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`relative px-2.5 sm:px-5 py-1.5 sm:py-2 text-[11.5px] sm:text-[13.5px] transition-colors cursor-pointer select-none whitespace-nowrap ${
                          isSelected
                            ? 'text-[#0860E8] font-bold'
                            : 'text-slate-500 hover:text-slate-800 font-medium'
                        }`}
                      >
                        <span className="sm:hidden">{tab.short}</span>
                        <span className="hidden sm:inline">{tab.full}</span>
                        {isSelected && (
                          <motion.div
                            layoutId="legalPortalNavbarIndicator"
                            className="absolute bottom-0 left-2 right-2 sm:left-4 sm:right-4 h-[3.5px] bg-[#0860E8] rounded-t-full shadow-[0_2px_6px_rgba(8,96,232,0.35)]"
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                          />
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Desktop Right: Download App Button */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onDownloadClick || onBackToHome}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 hover:text-[#0860E8] border border-slate-200/90 shadow-2xs transition-all cursor-pointer"
                >
                  Download App
                </button>
              </div>

            </div>

            {/* Centered Document Hero Heading */}
            <div className="text-center mt-7 sm:mt-10 mb-1 relative z-10">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0A1629] tracking-tight">
                {activeDoc === 'privacy' && 'Privacy Policy'}
                {activeDoc === 'terms' && 'Terms of Service'}
                {activeDoc === 'guidelines' && 'Student Guidelines'}
              </h1>
              <p className="mt-2.5 text-slate-500 text-xs sm:text-sm font-medium">
                Last updated on Oct 2026
              </p>
            </div>

            {/* Soft ambient light accent */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-gradient-to-r from-transparent via-[#0860E8]/10 via-[#38BDF8]/15 to-transparent blur-xl pointer-events-none" />

          </div>

          {/* White Document Body */}
          <div className="bg-white px-6 sm:px-14 md:px-20 py-10 sm:py-16 text-slate-800">
            
            {activeDoc === 'terms' && <TermsContent />}
            {activeDoc === 'privacy' && <PrivacyContent />}
            {activeDoc === 'guidelines' && <GuidelinesContent />}

            {/* Statutory Redressal & Contact Section at document bottom */}
            <div className="mt-16 pt-10 border-t border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-900 text-[13px]">
                  Campus Buddy Technologies India Pvt. Ltd.
                </p>
                <p className="text-[12px] text-slate-500 mt-0.5">
                  Published in compliance with IT Act 2000 & DPDP Act 2023 · Grievance Officer: Ankit Paul
                </p>
              </div>

              <a
                href="mailto:legal@campusbuddy.in"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
              >
                <span>legal@campusbuddy.in</span>
              </a>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// ==========================================
// 1. PRIVACY POLICY DETAILED CONTENT
// ==========================================
export const PrivacyContent: React.FC = () => {
  return (
    <div className="space-y-10 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700">
      
      {/* Intro Paragraph centered matching uploaded reference */}
      <p className="text-slate-600 text-xs sm:text-[13.5px] max-w-2xl mx-auto text-center leading-relaxed">
        Campus Buddy is dedicated to protecting your personal information and respecting your privacy. This Privacy Policy outlines the types of information we collect, how we use it, and your rights regarding that information. By accessing or using our Services, you agree to the practices described in this Privacy Policy.
      </p>

      {/* Section 1: Information We Collect */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Information We Collect
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-4">
          We collect different types of personal information depending on how you interact with our Services.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
              1. Personal Information You Provide to Us
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
              We may collect the following types of information that you voluntarily provide:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">• Account Information:</strong> When you register on our Services, we may ask for information such as your name, email address (you may register with your personal Gmail, Google account, or college institutional email), university or institute name, branch/batch, and account preferences.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Student Verification Details:</strong> Uploaded college ID cards or campus verification credentials, encrypted and utilized exclusively for student KYC and verification to keep your campus marketplace safe.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Marketplace & Listing Details:</strong> Photographs, asking price, item condition notes, academic department categories, and campus pickup landmarks for items you post.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Communications & In-App Chat:</strong> Direct messages exchanged between buyers and sellers within the Campus Buddy secure chat system to coordinate handovers and question item condition.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Feedback and Correspondence:</strong> When you communicate with us for support, disputes, surveys, or other correspondence, we collect the information necessary to respond to your requests.
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
              2. Information Collected Automatically
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
              When you interact with our Services, we collect certain information automatically, which may include:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">• Device Information:</strong> Details about the device used to access our Services, such as device type, operating system, app build version, and unique device identifiers.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Usage Data:</strong> Information about your interactions with our Services, including browsing history, searched textbooks, bookmarked items, clicked links, and other engagement metrics.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Location Data:</strong> Approximate location derived from your IP address or chosen college campus to curate and default your local campus feed. We do not continuously poll real-time background GPS coordinates.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Cookies and Tracking Technologies:</strong> We use essential session cookies and local storage tokens to preserve your login session and theme preferences. We do not use third-party advertising tracking cookies or ad network trackers.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: How We Use Your Information */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          How We Use Your Information
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          We use the collected information to enhance and personalize your experience and ensure the smooth, safe functioning of our Services. Specifically, we may use your information for the following purposes:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Service Delivery:</strong> Provide, operate, and maintain our peer-to-peer campus marketplace, and facilitate listing discovery and member interactions.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Campus Isolation & Relevance:</strong> Filter listings by university campus so that students see items readily accessible in their own hostels, departments, or nearby colleges.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Communication:</strong> Send essential account notifications, listing inquiries from fellow students, chat message alerts, and security updates.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Trust, Safety & Anti-Fraud:</strong> Authenticate student credentials, detect and eliminate bot profiles, spam, and protect our collegiate community from unauthorized commercial exploitation.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Improvement and Analysis:</strong> Analyze trends, track website performance, and understand user behavior to improve our Services and make data-driven decisions.
          </li>
        </ul>
      </section>

      {/* Section 3: Data Security and Storage */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Data Security & Indian Data Localization
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          We implement rigorous technical, operational, and administrative measures to safeguard student information against unauthorized access, loss, or misuse:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Zero Data Selling Guarantee:</strong> Campus Buddy never sells, rents, or monetizes student personal data to third-party advertising brokers, commercial aggregators, or predatory loan companies.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Encryption in Transit:</strong> Enforced TLS 1.3 encryption across all web and mobile API endpoints with HTTP Strict Transport Security (HSTS).
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Encryption at Rest:</strong> AES-256 standard encryption for databases, chat logs, and student verification files.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Indian Data Localization:</strong> All student records, databases, and uploaded verification files are stored exclusively within Tier-4 Indian data centers (Mumbai and Delhi-NCR regions) compliant with Indian data residency mandates.
          </li>
        </ul>
      </section>

      {/* Section 4: Your Statutory Rights (DPDP Act 2023) */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Your Statutory Rights (DPDP Act 2023)
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          As a Data Principal under India's Digital Personal Data Protection (DPDP) Act 2023, you have full sovereignty over your information:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Right to Access:</strong> Request a complete portable export of all profile data, listings, and chat archives associated with your account.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Right to Correction:</strong> Update or rectify inaccurate academic branch, semester, or contact details directly inside account settings.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Right to Erasure ("Right to be Forgotten"):</strong> Request full account deletion upon graduation or departure. All personal details, chats, and uploaded ID photos will be permanently expunged within 30 days.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Right to Nominate:</strong> You may designate an authorized representative in case of incapacitation.
          </li>
        </ul>
      </section>

    </div>
  );
};

// ==========================================
// 2. TERMS OF SERVICE DETAILED CONTENT
// ==========================================
export const TermsContent: React.FC = () => {
  return (
    <div className="space-y-10 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700">
      
      {/* Intro Paragraph centered matching uploaded reference */}
      <p className="text-slate-600 text-xs sm:text-[13.5px] max-w-2xl mx-auto text-center leading-relaxed">
        These Terms of Service outline the rules, rights, and responsibilities governing your use of the Campus Buddy peer-to-peer campus marketplace. By accessing or downloading our platform, you agree to comply with and be legally bound by these terms.
      </p>

      {/* Section 1: Acceptance & Eligibility */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Acceptance of Agreement & Student Eligibility
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-4">
          These Terms constitute a legally binding agreement between you and Campus Buddy Technologies India Private Limited.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
              1. Student Registration & Eligibility
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
              To preserve campus safety and trusted peer exchanges, all users must satisfy the following:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">• Age & Affiliation:</strong> You must be at least 17 years old and an enrolled student, researcher, or faculty member at an accredited educational institution in India.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Flexible Email Registration:</strong> You may sign up using your personal email (such as personal Gmail, Google account, Outlook) or your official student institutional email. Campus student verification is completed via email confirmation and college ID card check or campus verification.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Profile Integrity:</strong> Creation of fake profiles, bot networks, impersonation of college faculty, or multi-accounting is strictly prohibited and subject to immediate permanent ban.
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
              2. Platform Nature & Intermediary Role
            </h3>
            <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
              Campus Buddy operates as a technology intermediary under Section 79 of the Information Technology Act, 2000:
            </p>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">• Discovery Platform:</strong> Campus Buddy provides campus-filtered search, listing cataloging, secure in-app peer chat, and university verification badges.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• No Warehousing or Custody:</strong> We do not warehouse, inspect, own, ship, or hold escrow payments for listed goods. Transactions occur face-to-face on campus.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Inspection Before Payment:</strong> Sellers and buyers negotiate directly. Users agree to inspect all physical items (textbooks, calculators, cycles, electronic equipment, hostel lamps) in person prior to transferring any payment.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Prohibited Items */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Strictly Prohibited Items & Activities
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          Campus Buddy enforces a strict zero-tolerance policy. The following items and activities may never be posted, solicited, or exchanged:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Academic Dishonesty:</strong> Unreleased exam question papers, solved test leaks, proxy attendance devices, or commercial assignment drafting.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Regulated Substances:</strong> Alcohol, tobacco, e-cigarettes, vape pens, and prescription pharmaceuticals.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Weapons & Hazard:</strong> Weapons, hazardous laboratory chemicals, blades, fireworks, or dangerous contraband.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Intellectual Property Violations:</strong> Pirated software keys, cracked licenses, or unauthorized mass digital scans of entire copyright books.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Commercial Scalping & Schemes:</strong> Commercial wholesale retailing, multi-level marketing solicitations, predatory campus loans, or cryptocurrency schemes.
          </li>
        </ul>
      </section>

      {/* Section 3: Pricing & Payments */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Pricing, Subscriptions & Zero-Commission Handovers
        </h2>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• 0% Commission on Transactions:</strong> Campus Buddy charges 0% commission on peer-to-peer student transactions. Sellers retain 100% of the price negotiated with the buyer.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Optional Premium Features:</strong> We offer optional student plans (Free, Premium ₹49/mo, Pro ₹149/mo) for power sellers needing priority campus listing bumps and extended multi-campus reach.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Transparent Billing:</strong> Subscriptions are processed via authorized Indian payment gateways (UPI, debit card, net banking) and can be cancelled anytime before the next renewal date.
          </li>
        </ul>
      </section>

      {/* Section 4: Limitation of Liability */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Limitation of Liability & Governing Law
        </h2>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Limitation of Liability:</strong> In no event shall Campus Buddy, its officers, or campus ambassadors be liable for any indirect, incidental, or consequential damages resulting from transactions conducted between users or physical items exchanged.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Governing Law:</strong> These Terms shall be governed by and construed in accordance with the laws of the Republic of India. Disputes shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </li>
        </ul>
      </section>

    </div>
  );
};

// ==========================================
// 3. STUDENT GUIDELINES DETAILED CONTENT
// ==========================================
export const GuidelinesContent: React.FC = () => {
  return (
    <div className="space-y-10 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700">
      
      {/* Intro Paragraph centered matching uploaded reference */}
      <p className="text-slate-600 text-xs sm:text-[13.5px] max-w-2xl mx-auto text-center leading-relaxed">
        The Campus Buddy Student Guidelines establish community standards, safe handover protocols, and collegiate respect among verified college peers. By participating in our campus community, you agree to uphold these standards.
      </p>

      {/* Section 1: Student Honor Code */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          The Campus Buddy Student Code & Honor System
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-4">
          Campus Buddy is built by students, for students. You are dealing with classmates, hostel batchmates, and campus seniors. Treat every peer with fairness, honesty, and collegiate respect.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
              1. Listing Accuracy & Pricing Honesty
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
              <li>
                <strong className="text-slate-900 font-semibold">• Genuine Photographs Only:</strong> Take clear, real photos of your exact item. Do not upload commercial catalog stock images from e-commerce sites.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Disclose Flaws Upfront:</strong> Disclose highlighted pages, missing book chapters, cycle gear defects, or cosmetic scuffs in your listing description.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Fair Student Pricing:</strong> Campus Buddy is for circular campus reuse. Second-hand academic books should generally be offered at 40%–70% off original retail MRP.
              </li>
              <li>
                <strong className="text-slate-900 font-semibold">• Mark Sold Promptly:</strong> Once an exchange is completed, mark the item as 'Completed' immediately so fellow students don't send unneeded inquiries.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2: Safe Handover Protocols */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Designated Safe Campus Handover Protocols
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          Always coordinate physical exchanges in populated, well-lit campus landmarks during daylight hours:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Central Canteen / Food Court:</strong> High footfall, easy seating to test electronics, inspect lab instruments, or turn book pages.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Library Foyer / Steps:</strong> High campus security presence and quiet atmosphere, ideal for notes, textbooks, and engineering drafters.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Hostel Security Gate:</strong> Perfect for test-riding bicycles or transferring large luggage, mattress, or hostel study lamps.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Payment In-Person:</strong> Always physically inspect items before transferring payment via UPI or cash. Never transfer advance booking fees to strangers.
          </li>
        </ul>
      </section>

      {/* Section 3: Anti-Harassment & Anti-Ragging */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Zero Harassment & Anti-Ragging Enforcement
        </h2>
        <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed mb-3">
          Campus Buddy strictly upholds the Supreme Court of India Anti-Ragging Mandate and UGC Regulations on Curbing the Menace of Ragging in Higher Educational Institutions:
        </p>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• In-App Chat Boundaries:</strong> The in-app chat is strictly for negotiating listings and coordinating meetups. Unsolicited romantic advances, stalking, or inappropriate messaging will trigger an immediate permanent account ban.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Anti-Bullying:</strong> Senior-junior intimidation, harassment, coercion, or demanding free items is prohibited and may be reported directly to your college administration.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Equal Respect:</strong> Derogatory remarks based on caste, religion, gender, sexual orientation, or regional background are strictly barred.
          </li>
        </ul>
      </section>

      {/* Section 4: Academic Integrity */}
      <section>
        <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight mb-2">
          Academic Integrity & Study Notes
        </h2>
        <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-1">
          <li>
            <strong className="text-slate-900 font-semibold">• Sharing Handwritten Notes:</strong> We encourage passing down previous semester handwritten lecture notes, formula sheets, lab manual formats, and project documentation guidelines.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• No Exam Leaks:</strong> Never post leaked mid-semester or end-semester exam question papers.
          </li>
          <li>
            <strong className="text-slate-900 font-semibold">• Original Authorship:</strong> Do not submit someone else's capstone code, dissertation, or thesis as your own assignment.
          </li>
        </ul>
      </section>

    </div>
  );
};
