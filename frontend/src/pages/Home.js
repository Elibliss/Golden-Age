import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [popular, setPopular] = useState([]);
  const [regular, setRegular] = useState([]);
  useEffect(()=>{
    api.get('/api/products').then(r=>{
      const arr = Array.isArray(r.data) ? r.data : [];
      setPopular(arr.filter(x=>x.is_popular).slice(0,8));
      setRegular(arr.filter(x=>!x.is_popular).slice(0,8));
    }).catch(()=>{});
  },[]);
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <section className="relative overflow-hidden rounded-3xl mb-8 mx-4 md:mx-8">
        <img src="https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=60" alt="" className="w-full h-[450px] object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex items-end md:items-center">
          <div className="p-8 md:p-14 text-white w-full md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">Savor the Flavor</h1>
            <p className="text-lg md:text-xl text-gray-200 mb-6">Your ultimate food destination for premium small chops, refreshing smoothies, and unforgettable event services in Enugu.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link to="/shop" className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-lg">🛒 Make Order</Link>
              <Link to="/events" className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">📅 Book Event</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 mx-4 md:mx-8">
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-blue-600">
          <div className="text-3xl font-bold text-blue-600">120+</div>
          <div className="text-gray-600 mt-2">Food Items Available</div>
          <p className="text-sm text-gray-500 mt-1">Carefully selected dishes</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-green-600">
          <div className="text-3xl font-bold text-green-600">1.2k</div>
          <div className="text-gray-600 mt-2">Daily Orders Served</div>
          <p className="text-sm text-gray-500 mt-1">Trusted by our community</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-orange-600">
          <div className="text-3xl font-bold text-orange-600">20+</div>
          <div className="text-gray-600 mt-2">Expert Chefs</div>
          <p className="text-sm text-gray-500 mt-1">Passionate professionals</p>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="mb-16 mx-4 md:mx-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">⭐ Our Popular Dishes</h2>
            <p className="text-gray-600 mt-2">Handpicked customer favorites</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popular.map(p=>(
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-4xl">🍽️</div>}
                  <div className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">₦{p.price}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.category || 'Special Dish'}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="text-yellow-500">★★★★★</span>
                    <span className="ml-2">{p.rating || '4.5'}</span>
                    <span className="mx-2">•</span>
                    <span>15–25 min</span>
                  </div>
                  <Link to="/shop" className="w-full mt-4 bg-blue-600 text-white py-1 px-1 rounded-lg font-semibold hover:bg-blue-700 transition text-center text-[12px]">Order Now</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section className="mb-16 mx-4 md:mx-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Our Regular Menu</h2>
            <p className="text-gray-600 mt-2">Everyday favorites at great prices</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {regular.map(p=>(
              <div key={p.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden relative">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-4xl">🍽️</div>}
                  <div className="absolute top-2 right-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">₦{p.price}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{p.category || 'Meal'}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-600">
                    <span className="text-yellow-500">★★★★☆</span>
                    <span className="ml-2">{p.rating || '4.5'}</span>
                    <span className="mx-2">•</span>
                    <span>20–30 min</span>
                  </div>
                  <Link to="/shop" className="w-full mt-4 bg-green-600 text-white py-1 px-1 rounded-lg font-semibold hover:bg-green-700 transition text-center text-[12px]">Order Now</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-8 md:p-12 text-white mb-16 mx-4 md:mx-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Why Choose Us?</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <div className="font-bold text-lg">Fresh Ingredients</div>
                  <p className="text-blue-100">Daily sourced fresh produce for premium taste</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <div className="font-bold text-lg">Expert Chefs</div>
                  <p className="text-blue-100">Passionate professionals with years of experience</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <div className="font-bold text-lg">Fast Delivery</div>
                  <p className="text-blue-100">Quick and reliable service to your doorstep</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-3xl">✓</div>
                <div>
                  <div className="font-bold text-lg">Best Value</div>
                  <p className="text-blue-100">Premium quality at competitive prices</p>
                </div>
              </div>
            </div>
          </div>
          <img src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80" alt="Why choose us" className="rounded-2xl w-full h-80 object-cover" />
        </div>
      </section>

      {/* Events Gallery Section with Carousel */}
      <section className="mb-16 mx-4 md:mx-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Events We've Handled</h2>
        <p className="text-gray-600 mb-8">See the amazing events we've catered for</p>
        <style>{`
          @keyframes carousel-slide {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-5px); opacity: 1; }
          }
          .carousel-card {
            animation: carousel-slide 0.3s ease-out;
          }
          .carousel-card:hover {
            transform: translateY(-8px);
          }
        `}</style>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            'https://images.unsplash.com/photo-1519671482677-504be0270b68?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1519335307602-b80cf2ce3145?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=600&h=400&fit=crop',
          ].map((img, idx) => (
            <div key={idx} className="carousel-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
              <div className="relative h-72 overflow-hidden bg-gray-200">
                <img src={img} alt={`Event ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="absolute inset-0 p-6 flex items-end">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <p className="text-sm font-semibold">Event {idx + 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
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
                <p className="text-yellow-400">★★★★★</p>
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

      <section className="text-center mb-12 mt-10 mx-4 md:mx-8">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
        <p className="text-gray-600 text-lg mb-6">Browse our complete menu and place your order today</p>
        <Link to="/shop" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg">Explore Our Full Menu →</Link>
      </section>
    </div>
  );
}
