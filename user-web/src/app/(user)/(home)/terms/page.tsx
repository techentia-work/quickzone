import React from 'react'

function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-green-100">
        <h1 className="text-3xl font-bold mb-4 text-center text-green-700">
          Quickzon – Terms & Conditions
        </h1>
        <p className="text-green-600 text-sm text-center mb-8">
          Effective Date: 01 January 2025
        </p>

        <p className="text-gray-700 mb-6">
          Welcome to <span className="font-semibold text-green-700">Quickzon</span>, operated by Shri Balaji Mart
          (“we,” “our,” or “us”). By downloading, installing, or using our mobile application (“App”) or our website,
          you agree to these Terms & Conditions (“Terms”). Please read them carefully before using Quickzon’s services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">1. Acceptance of Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing or using Quickzon, you agree to comply with and be bound by these Terms.
          If you do not agree, you should not use our services.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">2. Eligibility</h2>
        <p className="text-gray-700 mb-4">
          You must be at least 18 years old to place orders through Quickzon. If you are under 18,
          you may use the app only under the supervision of a parent or guardian.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">3. Services Provided</h2>
        <p className="text-gray-700 mb-4">
          Quickzon is a grocery delivery platform that allows users to order groceries, daily essentials,
          and other listed products for home delivery in Agra and selected service areas.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">4. Account Registration</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>You must register with accurate details, including your name, phone number, address, and payment information.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
          <li>You agree to notify us immediately in case of unauthorized account use.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">5. Orders & Payments</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>All orders are subject to availability and confirmation.</li>
          <li>Prices are displayed in Indian Rupees (INR) and include applicable taxes unless stated otherwise.</li>
          <li>Payment methods include Cash on Delivery (COD), UPI, debit/credit cards, and other options as shown in the app.</li>
          <li>In case of incorrect pricing due to system error, Quickzon reserves the right to cancel the order.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">6. Delivery</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>We aim to deliver orders within the promised time frame, but delays may occur due to traffic, weather, or other factors beyond our control.</li>
          <li>Delivery charges may apply and will be displayed before checkout.</li>
          <li>The customer must ensure that someone is available to receive the order at the delivery address.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">7. Cancellations & Refunds</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>Orders can be cancelled before they are dispatched.</li>
          <li>Perishable items (fruits, vegetables, dairy) cannot be returned unless they are damaged or expired at delivery.</li>
          <li>Refunds, if approved, will be processed within 7 working days to the original payment method.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">8. Prohibited Use</h2>
        <p className="text-gray-700 mb-4">You agree not to:</p>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>Misuse the app or use it for illegal purposes.</li>
          <li>Attempt to hack, reverse-engineer, or disrupt the app’s operations.</li>
          <li>Place fake or fraudulent orders.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">9. Limitation of Liability</h2>
        <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
          <li>Quickzon will not be liable for delays or non-delivery caused by external factors.</li>
          <li>Indirect or incidental damages arising from the use of our services.</li>
          <li>Issues caused by third-party vendors or suppliers.</li>
        </ul>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">10. Intellectual Property</h2>
        <p className="text-gray-700 mb-4">
          All content, logos, and designs in the Quickzon app and website are the property of Shri Balaji Mart
          and are protected by applicable laws. You may not use them without our permission.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">11. Privacy Policy</h2>
        <p className="text-gray-700 mb-4">
          Your personal data will be collected, stored, and processed in accordance with our Privacy Policy,
          available in the app.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">12. Changes to Terms</h2>
        <p className="text-gray-700 mb-4">
          We may update these Terms at any time. Updated Terms will be posted in the app,
          and your continued use will mean you accept the changes.
        </p>

        <h2 className="text-xl font-semibold mt-6 mb-2 text-green-700">13. Contact Us</h2>
        <p className="text-gray-700 mb-2">
          For questions or concerns regarding these Terms, please contact us:
        </p>
        <p className="font-medium text-green-700">📧 support@quickzon.in</p>
      </div>
    </div>
  )
}

export default Page
