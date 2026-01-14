// Add imports at the top
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Image from 'next/image';
// Popular Cities Section Component (add after WhyBookEventsSection)
const PopularCitiesSection = ({ onCityClick }: { onCityClick: (cityName: string) => void }) => {
  const cities = [
    { name: 'Chennai', image: '/cities/chennai.jpg' },
    { name: 'Coimbatore', image: '/cities/coimbatore.jpg' },
    { name: 'Bangalore', image: '/cities/bangalore.jpg' },
    { name: 'Hyderabad', image: '/cities/hyderabad.jpg' },
    { name: 'Delhi', image: '/cities/delhi.jpg' },
    { name: 'Kolkata', image: '/cities/kolkata.jpg' },
    { name: 'Mumbai', image: '/cities/mumbai.jpg' },
    { name: 'Pune', image: '/cities/pune.jpg' },
    { name: 'Kochi', image: '/cities/kochi.jpg' },
    { name: 'Ahmedabad', image: '/cities/ahmedabad.jpg' },
    { name: 'Jaipur', image: '/cities/jaipur.jpg' },
    { name: 'Lucknow', image: '/cities/lucknow.jpg' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        {/* Header - exactly matching the image */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Popular Cities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore top events and experiences happening near you!
          </p>
        </div>

        {/* Swiper Container */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            // spaceBetween={12}
            slidesPerView={6}
            loop={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
               424: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 12,
              },
              1280: {
                slidesPerView: 6,
                spaceBetween: 12,
              },
            }}
            className="popular-cities-swiper"
          >
            {cities.map((city, index) => (
              <SwiperSlide key={index}>
                <div 
                  className="cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => onCityClick(city.name)}
                >
                  <div className="relative">
                    {/* City Image Circle */}
                    <div className="w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <Image
                        src={city.image}
                        alt={city.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* City Name */}
                    <h3 className="text-center text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                      {city.name}
                    </h3>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12  flex items-center justify-center text-gray-600 hover:text-green-500  transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12  flex items-center justify-center text-gray-600 hover:text-green-500  transition-all duration-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PopularCitiesSection ;