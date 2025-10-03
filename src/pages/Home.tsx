import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <div className="bg-white min-h-screen text-gray-800">
      {/* HERO SECTION */}
      <section className="relative bg-gray-900 text-white">
        <img
          src="/images/banner-hero.jpg" // Substitua pela imagem que você enviar
          alt="Banner do INTERBØX 2025"
          className="w-full h-[400px] object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <img
            src="/logos/nome_hrz.png"
            alt="Logo INTERBØX"
            className="h-16 md:h-24 mb-4 drop-shadow-lg"
          />
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Competição. Comunidade. Propósito.
          </h1>
          <p className="mt-4 text-white/80 max-w-xl text-sm md:text-base">
            O maior campeonato fitness de times da América Latina.
          </p>
        </div>
      </section>

      {/* LOJA - DESTAQUES */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-2">🛍️ Produtos Oficiais</h2>
          <p className="text-gray-600">Garanta seu item exclusivo do INTERBØX 2025</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Cards de Produto */}
          <div className="border rounded-xl p-6 bg-white shadow hover:shadow-lg transition">
            <img src="/images/produto2.jpg" alt="Produto" className="rounded mb-4" />
            <h3 className="text-lg font-semibold">Cropped Mocha Mousse</h3>
            <p className="text-gray-500">A partir de R$ 139,90</p>
          </div>

          <div className="border rounded-xl p-6 bg-white shadow hover:shadow-lg transition">
            <img src="/images/produto3.jpg" alt="Produto" className="rounded mb-4" />
            <h3 className="text-lg font-semibold">Cropped Preto</h3>
            <p className="text-gray-500">A partir de R$ 139,90</p>
          </div>

          <div className="border rounded-xl p-6 bg-white shadow hover:shadow-lg transition">
            <img src="/images/produto1.jpg" alt="Produto" className="rounded mb-4" />
            <h3 className="text-lg font-semibold">Camiseta Amora</h3>
            <p className="text-gray-500">A partir de R$ 139,90</p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            to="/produtos"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition"
          >
            Ver todos os produtos
          </Link>
        </div>
      </section>

      {/* SOBRE O EVENTO */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">🏋️‍♀️ Sobre o INTERBØX</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            O INTERBØX é mais que uma competição: é um movimento que une atletas, treinadores e entusiastas em uma celebração da força, superação e trabalho em equipe. Conheça também nossa plataforma de gamificação exclusiva: <a href="https://cerradointerbox.com.br" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">cerradointerbox.com.br</a>
          </p>
        </div>
      </section>

      {/* INSCRIÇÕES DESTAQUE */}
      <section className="py-16 px-4 bg-purple-50">
        <div className="max-w-6xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold">⏳ Últimos dias para inscrições</h2>
          <p className="text-gray-600">Ainda dá tempo de fazer parte do time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link to="/judge/cadastro" className="bg-white border-l-4 border-blue-600 p-6 rounded-xl shadow hover:shadow-lg transition block">
            <h3 className="text-xl font-semibold text-blue-700">Inscrição Judge</h3>
            <p className="text-gray-600 text-sm mt-2">Faça parte do corpo técnico da competição.</p>
          </Link>

          <Link to="/staff/cadastro" className="bg-white border-l-4 border-green-600 p-6 rounded-xl shadow hover:shadow-lg transition block">
            <h3 className="text-xl font-semibold text-green-700">Inscrição Staff</h3>
            <p className="text-gray-600 text-sm mt-2">Ajude na organização e execução do evento.</p>
          </Link>
        </div>
      </section>

      {/* SOBRE A FLOWPAY */}
      <section className="py-8 px-4 bg-gray-100 text-center text-sm text-gray-500">
        <p>
          Ambiente seguro operado por <strong className="text-purple-600">FlowPay</strong> — plataforma oficial de pagamentos do INTERBØX 2025.
        </p>
      </section>

      <Footer />
    </div>
  );
}