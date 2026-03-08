import React, { useState } from 'react';
import axios from 'axios';
import { isValidEmail, isValidName, isValidPhone, isValidGuestCount, isValidFutureDate } from '../utils';

export default function Events(){
  const [form, setForm] = useState({ event_type:'', guests:'', event_date:'', name:'', email:'', phone:'', notes:'' });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  function validateForm() {
    const newErrors = {};
    
    if (!form.event_type.trim()) {
      newErrors.event_type = 'Event type is required';
    }
    
    if (!form.guests) {
      newErrors.guests = 'Number of guests is required';
    } else if (!isValidGuestCount(form.guests)) {
      newErrors.guests = 'Please enter a valid number of guests (at least 1)';
    }
    
    if (!form.event_date) {
      newErrors.event_date = 'Event date is required';
    } else if (!isValidFutureDate(form.event_date)) {
      newErrors.event_date = 'Event date must be in the future';
    }
    
    if (!form.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!isValidName(form.name)) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!form.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!isValidPhone(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits)';
    }
    
    if (!form.notes.trim()) {
      newErrors.notes = 'Please tell us about your event';
    } else if (form.notes.trim().length < 10) {
      newErrors.notes = 'Event description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  async function submit(e){
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try{
      await axios.post('/api/events', {
        event_type: form.event_type.trim(),
        guests: parseInt(form.guests),
        event_date: form.event_date,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        notes: form.notes.trim()
      });
      setDone(true);
      setTimeout(() => setDone(false), 4000);
      setForm({ event_type:'', guests:'', event_date:'', name:'', email:'', phone:'', notes:'' });
    }catch(err){
      const errorMsg = err.response?.data?.error || 'Booking failed. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12 mb-12">
        <div className="container-pro text-center">
          <h1 className="text-4xl font-bold mb-2">Book Your Event</h1>
          <p className="text-lg text-blue-100">Let Golden Age cater your special moments</p>
        </div>
      </div>

      {/* Our Events Gallery */}
      <div className="container-pro mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Events We've Covered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Corporate Events', desc: 'Professional catering for conferences and business gatherings', img: 'https://images.unsplash.com/photo-1519671482677-504be0270b68?w=600&h=400&fit=crop' },
            { title: 'Weddings', desc: 'Memorable catering for your special wedding day', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop' },
            { title: 'Birthdays', desc: 'Perfect food for unforgettable birthday celebrations', img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop' },
            { title: 'Parties', desc: 'Dynamic catering for fun and festive celebrations', img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop' },
            { title: 'Banquets', desc: 'Elegant catering for formal dining events', img: 'https://images.unsplash.com/photo-1519335307602-b80cf2ce3145?w=600&h=400&fit=crop' },
            { title: 'Receptions', desc: 'Beautiful settings for memorable celebrations', img: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop' },
          ].map((event, idx) => (
            <div key={idx} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="relative h-72 bg-gray-200 overflow-hidden">
                <img src={event.img} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <h3 className="text-xl font-bold text-white mb-2 transform group-hover:translate-y-0 transition-transform duration-300">{event.title}</h3>
                <p className="text-gray-200 text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">{event.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">AB</div>
                <div className="ml-3">
                  <h4 className="font-bold text-gray-900">Ade Blessing</h4>
                  <p className="text-sm text-gray-600">Corporate Client</p>
                </div>
              </div>
              <p className="text-yellow-400">★★★★★</p>
              <p className="text-gray-600 mt-3">"Golden Age provided exceptional service at our company event. The food was delicious and the delivery was on time."</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-pink-400 flex items-center justify-center text-white font-bold">MC</div>
                <div className="ml-3">
                  <h4 className="font-bold text-gray-900">Mary Chinedu</h4>
                  <p className="text-sm text-gray-600">Event Organizer</p>
                </div>
              </div>
              <p className="text-yellow-400">★★★★</p>
              <p className="text-gray-600 mt-3">"Highly recommend! They made our wedding reception unforgettable. Professional staff and amazing dishes."</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-white font-bold">JK</div>
                <div className="ml-3">
                  <h4 className="font-bold text-gray-900">John Kachianya</h4>
                  <p className="text-sm text-gray-600">Birthday Host</p>
                </div>
              </div>
              <p className="text-yellow-400">★★★★</p>
              <p className="text-gray-600 mt-3">"Best catering service in Enugu! The food was fresh, tasty, and everyone at my party loved it."</p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="bg-gray-50 py-12">
        <div className="container-pro max-w-2xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Book Your Event Now</h2>
          <form onSubmit={submit} className="bg-white rounded-lg shadow-lg p-8">
            {errors.submit && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-lg">{errors.submit}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input className={`input border ${errors.event_type ? 'border-red-500' : ''}`} placeholder="Event type" value={form.event_type} onChange={e=>setForm({...form, event_type:e.target.value})} />
                {errors.event_type && <p className="text-red-600 text-xs mt-1">{errors.event_type}</p>}
              </div>
              <div>
                <input className={`input border ${errors.guests ? 'border-red-500' : ''}`} placeholder="Number of guests" type="number" value={form.guests} onChange={e=>setForm({...form, guests:e.target.value})} />
                {errors.guests && <p className="text-red-600 text-xs mt-1">{errors.guests}</p>}
              </div>
              <div>
                <input className={`input border ${errors.event_date ? 'border-red-500' : ''}`} type="date" value={form.event_date} onChange={e=>setForm({...form, event_date:e.target.value})} />
                {errors.event_date && <p className="text-red-600 text-xs mt-1">{errors.event_date}</p>}
              </div>
              <div>
                <input className={`input border ${errors.name ? 'border-red-500' : ''}`} placeholder="Your name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <input className={`input border ${errors.email ? 'border-red-500' : ''}`} type="email" placeholder="Your email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <input className={`input border ${errors.phone ? 'border-red-500' : ''}`} type="tel" placeholder="Your phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <textarea className={`textarea mt-4 w-full border ${errors.notes ? 'border-red-500' : ''}`} placeholder="Tell us about your event..." rows="5" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
              {errors.notes && <p className="text-red-600 text-xs mt-1">{errors.notes}</p>}
            </div>
            <div className="mt-6 flex justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Event Booking'}
              </button>
            </div>
            {done && (
              <div className="mt-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">Event Booking Received! ✓</h3>
                    <p className="text-green-700 mt-2">Thank you for choosing Golden Age for your event!</p>
                    <p className="text-green-600 text-sm mt-3">We have received your booking details and our team will review your request shortly.</p>
                    <p className="text-green-600 text-sm mt-2">You can expect to hear from us within 24 hours at the contact information you provided.</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}