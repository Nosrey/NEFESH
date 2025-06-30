import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import './App.css';

// Import images
import image1 from './assets/image-1.jpg';
import image2 from './assets/image-2.jpg';
import image3 from './assets/image-3.jpg';
import logo from './assets/logo.png';

// Componente del carrusel personalizado
const TestimoniosCarousel = ({ testimonios }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef();
  const [visibleCards, setVisibleCards] = useState(3);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Responsive cards count
  useEffect(() => {
    const updateVisibleCards = () => {
      if (window.innerWidth < 768) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    updateVisibleCards();
    window.addEventListener('resize', updateVisibleCards);
    return () => window.removeEventListener('resize', updateVisibleCards);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonios.length);
      }, 4000); // 4 segundos para dar tiempo a leer
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, testimonios.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Reanudar auto-play después de 5 segundos
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonios.length) % testimonios.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonios.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoPlay();
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    } else {
      // Si no hay swipe suficiente, reanudar auto-play
      setTimeout(() => setIsAutoPlaying(true), 1000);
    }
  };

  // Get visible testimonios
  const getVisibleTestimonios = () => {
    const visible = [];
    for (let i = 0; i < visibleCards; i++) {
      const index = (currentIndex + i) % testimonios.length;
      visible.push({ ...testimonios[index], originalIndex: index });
    }
    return visible;
  };

  return (
    <motion.div 
      className="testimonios-carousel"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      onMouseEnter={pauseAutoPlay}
      onMouseLeave={resumeAutoPlay}
    >
      {/* Cards Container */}
      <div 
        className="testimonios-track"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div 
          className="testimonios-grid"
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {getVisibleTestimonios().map((testimonio, index) => (
            <motion.div
              key={`${testimonio.originalIndex}-${currentIndex}`}
              className="testimonio-card"
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                ease: "easeOut"
              }}
              whileHover={{ y: -8, scale: 1.03 }}
            >
              {/* Gradient Background */}
              <div className="card-gradient"></div>
              
              {/* Quote Icon */}
              <motion.div 
                className="quote-decoration"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.3 }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                </svg>
              </motion.div>

              {/* Content */}
              <motion.div 
                className="card-content"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}
              >
                <p className="testimonio-text">"{testimonio.content}"</p>
                
                <div className="author-section">
                  <div className="author-avatar">
                    <div className="avatar-placeholder">
                      {testimonio.author.charAt(0)}
                    </div>
                  </div>
                  <div className="author-details">
                    <h4 className="author-name">{testimonio.author}</h4>
                    <div className="rating">
                      {Array(testimonio.rating).fill(0).map((_, i) => (
                        <motion.span 
                          key={i}
                          className="star"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 + i * 0.05, duration: 0.2 }}
                        >
                          ⭐
                        </motion.span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="carousel-navigation">
        <motion.button 
          className="nav-button prev"
          onClick={goToPrevious}
          whileHover={{ scale: 1.1, x: -3 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </motion.button>

        <motion.button 
          className="nav-button next"
          onClick={goToNext}
          whileHover={{ scale: 1.1, x: 3 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </motion.button>
      </div>

      {/* Dots Indicator */}
      <div className="carousel-indicators">
        {testimonios.map((_, index) => (
          <motion.button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            <span className="sr-only">Ir al testimonio {index + 1}</span>
          </motion.button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="progress-container">
        <motion.div 
          className="progress-bar"
          initial={{ width: 0 }}
          animate={{ width: isAutoPlaying ? '100%' : '0%' }}
          transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          key={currentIndex}
        />
      </div>
    </motion.div>
  );
};

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    mensaje: ''
  });

  const lenisRef = useRef();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);

  // Prevent animation flash on initial load
  useEffect(() => {
    document.body.classList.add('motion-loading');
    const timer = setTimeout(() => {
      document.body.classList.remove('motion-loading');
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Lenis smooth scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  // Track active section
  useEffect(() => {
    const sections = ['inicio', 'servicios', 'nosotros', 'historia', 'contacto'];
    const observers = sections.map(sectionId => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(sectionId);
          }
        },
        { threshold: 0.3 }
      );

      const element = document.getElementById(sectionId);
      if (element) observer.observe(element);

      return observer;
    });

    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const mensaje = `¡Hola Luis Armando! Me gustaría solicitar un presupuesto. Mi nombre es ${formData.nombre}. Detalles: ${formData.mensaje}. Mi teléfono es: ${formData.telefono}`;
    const whatsappUrl = `https://wa.me/34666754608?text=${encodeURIComponent(mensaje)}`;
    window.open(whatsappUrl, '_blank');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && lenisRef.current) {
      lenisRef.current.scrollTo(element, { offset: -80 });
    }
    setIsMenuOpen(false);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const testimonios = [
    {
      content: "La puntualidad y la calidad del servicio son impecables. Totalmente recomendados.",
      author: "Cliente Satisfecho",
      rating: 5
    },
    {
      content: "Su capacidad para resolver imprevistos rápidamente es lo que los diferencia. Un socio de confianza.",
      author: "Empresa Local",
      rating: 5
    },
    {
      content: "Servicio de alta calidad a un precio justo. Cuidan la mercancía como si fuera suya.",
      author: "Cliente Frecuente",
      rating: 5
    },
    {
      content: "Profesionales de primera. Siempre cumplen con los plazos acordados.",
      author: "Comercio Zaragoza",
      rating: 5
    }
  ];

  return (
    <div className="App">
      <motion.header 
        className="header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="container">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img src={logo} alt="NEFESH Logo" className="logo-img" />
          </motion.div>
          
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul>
              {['inicio', 'servicios', 'nosotros', 'contacto'].map((section) => (
                <motion.li key={section}>
                  <motion.a 
                    href={`#${section}`} 
                    onClick={() => scrollToSection(section)}
                    className={activeSection === section ? 'active' : ''}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </nav>
          
          <motion.div 
            className="header-cta"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <a href="tel:666754608" className="btn-header">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Llamar
            </a>
          </motion.div>
          
          <motion.button 
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={isMenuOpen ? 'close' : 'open'}
                initial={{ rotate: 0 }}
                animate={{ rotate: isMenuOpen ? 45 : 0 }}
                exit={{ rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? '✕' : '☰'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.header>

      <main>
        <motion.section 
          id="inicio" 
          className="hero" 
          style={{ 
            backgroundImage: `url(${image1})`,
            opacity: heroOpacity,
            scale: heroScale
          }}
        >
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <motion.div 
              className="hero-badge"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span>✓ Disponible 24/7</span>
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Soluciones de Transporte Confiables y Eficientes
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              Conectamos personas y empresas con seguridad, puntualidad y un servicio que genera confianza en cada trayecto.
            </motion.p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.button 
                className="btn-primary" 
                onClick={() => scrollToSection('contacto')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Pide tu Presupuesto
              </motion.button>
              
              <motion.a 
                href="https://wa.me/34666754608" 
                className="btn-secondary" 
          target="_blank"
          rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.510-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                </svg>
                WhatsApp
              </motion.a>
            </motion.div>
          </div>
        </motion.section>

        <section id="servicios" className="servicios">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              Nuestros Servicios
            </motion.h2>
            
            <motion.p 
              className="section-subtitle"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              Ofrecemos una gama completa de soluciones de transporte para adaptarnos a tus necesidades.
            </motion.p>
            
            <motion.div 
              className="servicios-grid"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
                  title: "Portes Nacional e Internacional",
                  description: "Conectamos destinos lejanos con la máxima eficiencia y seguridad para tu mercancía."
                },
                {
                  icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
                  title: "Servicio de Desalojos",
                  description: "Gestionamos desalojos de manera rápida, profesional y discreta."
                },
                {
                  icon: "M7.5 4C5.57 4 4 5.57 4 7.5S5.57 11 7.5 11 11 9.43 11 7.5 9.43 4 7.5 4zM16 13c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z",
                  title: "Recogida a Puntos Limpios",
                  description: "Nos encargamos de tus residuos de forma responsable y ecológica."
                },
                {
                  icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
                  title: "Transporte de Motos",
                  description: "Tu moto, en las mejores manos. Transporte especializado y seguro."
                },
                {
                  icon: "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z",
                  title: "Servicio Taxi 24 Horas",
                  description: "Disponibilidad total para llevarte a tu destino, a cualquier hora."
                },
                {
                  icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
                  title: "Alquiler de furgoneta con conductor incluido",
                  description: "Furgoneta con conductor profesional para tus mudanzas y transportes especiales."
                }
              ].map((servicio, index) => (
                <motion.div 
                  key={index}
                  className="servicio-card"
                  variants={scaleIn}
                  whileHover={{ 
                    y: -10, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="servicio-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                      <path d={servicio.icon}/>
                    </svg>
                  </div>
                  <h3>{servicio.title}</h3>
                  <p>{servicio.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section id="nosotros" className="nosotros">
          <div className="container">
            <div className="nosotros-content">
              <motion.div 
                className="nosotros-text"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={slideInLeft}
              >
                <div className="section-badge">Sobre Nosotros</div>
                <h2 className="section-title">Nuestra Misión: Mover Confianza</h2>
                <p>En NEFESH, no solo transportamos objetos, movemos la confianza de nuestros clientes. Nacimos para ofrecer un servicio donde la puntualidad, la seguridad y la cercanía son la base de todo lo que hacemos.</p>
                
                <motion.div 
                  className="stats-grid"
                  variants={staggerContainer}
                >
                  {[
                    { number: "24/7", label: "Disponibilidad" },
                    { number: "100%", label: "Confianza" },
                    { number: "365", label: "Días al año" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="stat-item"
                      variants={scaleIn}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">{stat.number}</div>
                      <div className="stat-label">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="nosotros-image"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={slideInRight}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img src={image2} alt="Equipo de Nefesh trabajando" />
              </motion.div>
            </div>
          </div>
        </section>

        <section id="historia" className="historia">
          <div className="container">
            <motion.div 
              className="historia-image"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInLeft}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img src={image3} alt="Camión de Nefesh en ruta" />
            </motion.div>
            
            <motion.div 
              className="historia-text"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={slideInRight}
            >
              <div className="section-badge">Nuestra Historia</div>
              <h2 className="section-title">Nuestro Trayecto</h2>
              <p>Todo comenzó con una furgoneta y un compromiso inquebrantable: tratar a cada cliente como si fuera el único. Hoy, hemos crecido y perfeccionado cada detalle para ser un aliado confiable.</p>
              
              <motion.div 
                className="timeline"
                variants={staggerContainer}
              >
                {[
                  { year: "2020", content: "Inicio con una furgoneta y mucha pasión" },
                  { year: "2022", content: "Expansión de servicios y flota" },
                  { year: "2024", content: "Líder en confianza y calidad" }
                ].map((item, index) => (
                  <motion.div 
                    key={index}
                    className="timeline-item"
                    variants={fadeInUp}
                    whileHover={{ x: 10 }}
                  >
                    <div className="timeline-year">{item.year}</div>
                    <div className="timeline-content">{item.content}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="testimonios">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              La Confianza de Nuestros Clientes
            </motion.h2>
            
            <TestimoniosCarousel testimonios={testimonios} />
          </div>
        </section>
        
        <section id="contacto" className="contacto">
          <div className="container">
            <motion.h2 
              className="section-title"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
            >
              Contacta con Nosotros
            </motion.h2>
            
            <motion.p 
              className="section-subtitle"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              transition={{ delay: 0.1 }}
            >
              Estamos disponibles 24/7 para ayudarte. Rellena el formulario y te contactaremos en menos de 24 horas.
            </motion.p>
            
            <motion.div 
              className="contacto-wrapper"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
            >
              <motion.div 
                className="contacto-form"
                variants={slideInLeft}
              >
                <h3>Solicita tu Presupuesto</h3>
                <form onSubmit={handleSubmit}>
                  <motion.div 
                    className="form-group"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <input 
                      type="text" 
                      name="nombre" 
                      placeholder="Tu nombre" 
                      value={formData.nombre} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <input 
                      type="tel" 
                      name="telefono" 
                      placeholder="Tu teléfono" 
                      value={formData.telefono} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </motion.div>
                  
                  <motion.div 
                    className="form-group"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <textarea 
                      name="mensaje" 
                      placeholder="¿Qué necesitas transportar?" 
                      value={formData.mensaje} 
                      onChange={handleInputChange} 
                      rows="4" 
                      required
                    ></textarea>
                  </motion.div>
                  
                  <motion.button 
                    type="submit" 
                    className="btn-submit"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.510-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                    </svg>
                    Enviar por WhatsApp
                  </motion.button>
                </form>
              </motion.div>
              
              <motion.div 
                className="contacto-info"
                variants={slideInRight}
              >
                <h3>Información Directa</h3>
                <div className="info-cards">
                  {[
                    {
                      icon: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
                      title: "Luis Armando",
                      content: "666 754 608",
                      link: "tel:666754608"
                    },
                    {
                      icon: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
                      title: "Email",
                      content: "presupuestosnefesh@gmail.com",
                      link: "mailto:presupuestosnefesh@gmail.com"
                    },
                    {
                      icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                      title: "Ubicación",
                      content: "Zaragoza, España",
                      link: null
                    }
                  ].map((info, index) => (
                    <motion.div 
                      key={index}
                      className="info-card"
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="info-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d={info.icon}/>
                        </svg>
                      </div>
                      <div>
                        <strong>{info.title}</strong>
                        <p>
                          {info.link ? (
                            <a href={info.link}>{info.content}</a>
                          ) : (
                            info.content
                          )}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      <motion.div 
        className="chatbot-float"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <a href="https://wa.me/34666754608" target="_blank" rel="noopener noreferrer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.510-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
          </svg>
        </a>
      </motion.div>

      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Decorative gradient line */}
        <div className="footer-gradient-line"></div>
        
        <div className="container">
          <motion.div 
            className="footer-content"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Main Brand Section */}
            <motion.div 
              className="footer-brand"
              variants={fadeInUp}
            >
              <motion.div 
                className="footer-logo"
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ duration: 0.3 }}
              >
                <img src={logo} alt="NEFESH Logo" className="footer-logo-img" />
              </motion.div>
              <motion.h3
                className="footer-brand-title"
                variants={fadeInUp}
              >
                NEFESH EXPRESS
              </motion.h3>
              <motion.p 
                className="footer-tagline"
                variants={fadeInUp}
              >
                Transportamos confianza y conectamos con el propósito de cada cliente. 
                Tu socio de confianza en Zaragoza.
              </motion.p>
              
              {/* CTA Button */}
              <motion.div
                variants={fadeInUp}
                className="footer-cta"
              >
                <motion.a 
                  href="https://wa.me/34666754608" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="footer-cta-button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.510-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.488"/>
                  </svg>
                  Contactar Ahora
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Links Grid */}
            <div className="footer-links-grid">
              <motion.div 
                className="footer-section"
                variants={fadeInUp}
              >
                <h4 className="footer-section-title">Navegación</h4>
                <ul className="footer-links">
                  {['inicio', 'servicios', 'nosotros', 'contacto'].map((section, index) => (
                    <motion.li 
                      key={section}
                      variants={fadeInUp}
                      transition={{ delay: 0.1 * index }}
                    >
                      <motion.a 
                        href={`#${section}`} 
                        onClick={() => scrollToSection(section)}
                        whileHover={{ x: 8, color: "var(--color-secondary)" }}
                        transition={{ duration: 0.2 }}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </motion.a>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                className="footer-section"
                variants={fadeInUp}
              >
                <h4 className="footer-section-title">Servicios</h4>
                <ul className="footer-links">
                  {[
                    'Portes Nacional',
                    'Transporte Internacional', 
                    'Desalojos',
                    'Recogida Puntos Limpios',
                    'Transporte de Motos',
                    'Taxi 24h'
                  ].map((servicio, index) => (
                    <motion.li 
                      key={index}
                      variants={fadeInUp}
                      transition={{ delay: 0.1 * index }}
                    >
                      <motion.span
                        whileHover={{ x: 8, color: "var(--color-secondary)" }}
                        transition={{ duration: 0.2 }}
                      >
                        {servicio}
                      </motion.span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
              
              <motion.div 
                className="footer-section"
                variants={fadeInUp}
              >
                <h4 className="footer-section-title">Contacto</h4>
                <div className="footer-contact">
                  <motion.div 
                    className="contact-item"
                    whileHover={{ x: 5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="contact-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="contact-label">Teléfono</span>
                      <a href="tel:666754608" className="contact-value">666 754 608</a>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="contact-item"
                    whileHover={{ x: 5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="contact-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="contact-label">Email</span>
                      <a href="mailto:presupuestosnefesh@gmail.com" className="contact-value">presupuestosnefesh@gmail.com</a>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="contact-item"
                    whileHover={{ x: 5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="contact-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="contact-label">Ubicación</span>
                      <span className="contact-value">Miguel Angel Blanco Nº34-36, Bajo B<br/>50012, Zaragoza</span>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="contact-item"
                    whileHover={{ x: 5, scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="contact-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
                        <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="contact-label">Horario</span>
                      <span className="contact-value">24/7 - 365 días</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
          
          {/* Bottom Section */}
          <motion.div 
            className="footer-bottom"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <div className="footer-bottom-content">
              <p>&copy; {new Date().getFullYear()} NEFESH EXPRESS. Todos los derechos reservados.</p>
              <div className="footer-badges">
                <motion.span 
                  className="footer-badge"
                  whileHover={{ scale: 1.05 }}
                >
                  ✓ Empresa Verificada
                </motion.span>
                <motion.span 
                  className="footer-badge"
                  whileHover={{ scale: 1.05 }}
                >
                  ✓ Servicio 24/7
                </motion.span>
                <motion.span 
                  className="footer-badge"
                  whileHover={{ scale: 1.05 }}
                >
                  ✓ Zaragoza
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}

export default App;