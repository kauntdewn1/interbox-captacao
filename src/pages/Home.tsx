import { Link } from 'react-router-dom';
import { FaArrowTurnDown } from "react-icons/fa6";
import Footer from '../components/Footer';

const Home = () => {
  const products = [
    {
      id: 'judge',
      title: 'Inscrição Judge',
      description: 'Seja um Judge oficial do INTERBØX 2025',
      price: 'Gratuito',
      link: '/judge/cadastro',
      color: 'from-blue-500 to-purple-600',
      icon: '⧖'
    },
    {
      id: 'staff',
      title: 'Inscrição Staff',
      description: 'Faça parte da equipe organizacional',
      price: 'Gratuito',
      link: '/staff/cadastro',
      color: 'from-green-500 to-teal-600',
      icon: '⧉'
    },
    {
      id: 'loja',
      title: 'Loja INTERBØX',
      description: 'Produtos oficiais do INTERBØX 2025',
      price: 'A partir de R$ 139,90',
      link: '/produtos',
      color: 'from-pink-500 to-purple-600',
      icon: '🛍️'
    },
    {
      id: 'seguro',
      title: 'Sistema de Seguros',
      description: 'Proteja sua equipe com nossos seguros',
      link: '/seguro',
      color: 'from-purple-500 to-pink-600',
      icon: '⟠'
    }
  ];

  return (
    <div 
      className="min-h-screen text-white relative"
      style={{ 
        backgroundImage: 'url(/images/bg_grunge.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay escuro para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Header */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-12">
          {/* Logo no topo */}
          <img 
            src="/logos/nome_hrz.png" 
            alt="INTERBØX Logo" 
            className="mx-auto mb-8 max-w-md lg:max-w-lg drop-shadow-2xl"
          />
          
          <p className="text-xl text-white/90 mb-8 drop-shadow-lg">
            Escolha um dos links para continuar <FaArrowTurnDown className="inline-block ml-2" />
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {products.map((product) => (
            <Link
              key={product.id}
              to={product.link}
              className="group relative"
            >
              <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                {/* Glassmorphism Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-6xl mb-4 text-center">
                    {product.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3 text-center">
                    {product.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-300 text-center mb-4 leading-relaxed">
                    {product.description}
                  </p>
                  
                  {/* Price */}
                  <div className="text-center">
                    <span className="text-3xl font-bold text-white">
                      {product.price}
                    </span>
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-6">
                    <div className={`w-full py-3 px-6 rounded-xl bg-gradient-to-r ${product.color} text-white font-semibold text-center group-hover:shadow-lg transition-all duration-300`}>
                      Acessar
                    </div>
                  </div>
                </div>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
