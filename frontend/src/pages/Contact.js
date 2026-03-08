import React from 'react';

export default function Contact(){
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Get In Touch</h1>
          <p className="text-lg text-gray-600">We'd love to hear from you. Drop us a message anytime.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Email Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 break-all">
              <a href="mailto:info@goldenage.ng" className="text-blue-600 hover:underline">info@goldenage.ng</a>
            </p>
          </div>

          {/* Phone Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">
              <a href="tel:+234800000000" className="text-blue-600 hover:underline">+234 814 742 0339</a>
              <a href="tel:+234800000000" className="text-blue-600 hover:underline">+234 906 857 5937</a>
            </p>
          </div>

          {/* Location Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600 mb-3">Enugu State, Nigeria</p>
            <a href="https://maps.google.com/?q=GOLDEN%20AGE%20FOOD%20AND%20GRILL%20ENUGU%20State%20Nigeria" target="_blank" rel="noreferrer" className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition">
              View Map →
            </a>
          </div>
        </div>

        {/* Hours Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Hours</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-2"><span className="font-semibold text-gray-900">Monday - Friday:</span></p>
              <p className="text-lg text-gray-900">9:00 AM - 10:00 PM</p>
            </div>
            <div>
              <p className="text-gray-600 mb-2"><span className="font-semibold text-gray-900">Saturday - Sunday:</span></p>
              <p className="text-lg text-gray-900">12:00 PM - 11:00 PM</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-6 pt-6 border-t">📞 For event bookings and catering inquiries, please call us during business hours or send an email.</p>
        </div>
      </div>
    </div>
  );
}
