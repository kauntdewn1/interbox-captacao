
import { useNavigate } from "react-router-dom";

export default function AudiovisualAnalysis() {
    const navigate = useNavigate();
  
  const handleParticipateClick = () => {
    navigate('/audiovisual/pagar');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background grunge */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/bg_grunge.png)' }}
      />
      
      {/* Overlay escuro para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Imagem creators no topo */}
      <div className="relative z-10 pt-20 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <img
            src="/images/ArtIA/creators.webp"
            alt="Creators e Influenciadores"
            className="w-full h-64 md:h-80 object-cover rounded-lg shadow-2xl"
          />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 max-w-6xl mx-auto text-white py-8 px-4">
        
        {/* Header Principal */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            🎥 SEÇÃO AUDIOVISUAL
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 font-medium">
            Para criativos que enxergam além da lente.
          </p>
        </div>

        {/* Seção O QUE É */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-pink-400 mb-6 text-center">
            O QUE É
          </h2>
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-pink-500/30">
            <div className="max-w-3xl mx-auto px-6 md:px-10 py-8 md:py-10">
              <div className="space-y-5 md:space-y-6 text-gray-200 text-lg md:text-xl leading-relaxed md:leading-8 text-justify">
                <p>
                  Estamos reunindo uma equipe criativa para viver o Cerrado INTERBOX 2025 por dentro da arena.
                </p>
                <p>
                  Mais do que uma cobertura, essa missão é sobre eternizar a intensidade do momento, a estética da superação e a emoção de quem veio para fazer história.
                </p>
                <p>
                  Para conquistar seu lugar, é preciso preencher corretamente todas as informações solicitadas e passar pelo processo de seleção. Apenas os aprovados farão parte dessa comunidade visual que transforma suor em memória, esforço em narrativa e momentos em legado.
                </p>
                <p>
                  Esta etapa inicial inclui uma pequena taxa de inscrição e seleção. Os candidatos aprovados serão posteriormente convidados para a inscrição oficial com credenciamento completo, mediante taxa da inscrição no valor de R$ 1k.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cards informativos (mobile-first, PWA friendly) */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card: O QUE ESPERAMOS */}
            <section className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-500/30">
              <h3 className="text-2xl md:text-3xl font-bold text-pink-400 mb-4">O QUE ESPERAMOS DE VOCÊ</h3>
              <ul className="text-base md:text-lg text-gray-200 space-y-3 md:space-y-4">
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Olhar sensível e mente afiada para storytelling</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Agilidade e experiência com eventos e esporte</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Disponibilidade para atuar nos dias do evento</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Noção de conteúdo para redes sociais e marcas</span></li>
              </ul>
            </section>

            {/* Card: O QUE OS ATLETAS ESPERAM */}
            <section className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-500/30">
              <h3 className="text-2xl md:text-3xl font-bold text-pink-400 mb-4">O QUE OS ATLETAS ESPERAM DE VOCÊ</h3>
              <div className="text-base md:text-lg text-gray-200 space-y-4 leading-relaxed">
                <p>Os atletas buscam registrar suas <span className="text-pink-400 font-semibold">melhores versões</span> e, se você for selecionado, confiarão em você para eternizar esse momento.</p>
                <p>Durante o evento, você será <span className="text-pink-400 font-semibold">procurado, recomendado e valorizado</span>.</p>
                <p>Seu trabalho permanece quando o <span className="text-pink-400 font-semibold">pódio já tiver sido desmontado</span>.</p>
              </div>
            </section>

            {/* Card: O QUE VOCÊ RECEBE */}
            <section className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-500/30">
              <h3 className="text-2xl md:text-3xl font-bold text-pink-400 mb-4">O QUE VOCÊ RECEBE</h3>
              <ul className="text-base md:text-lg text-gray-200 space-y-3 md:space-y-4">
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Acesso VIP completo ao evento</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Kit oficial exclusivo Interbox</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Créditos em vídeos e postagens oficiais</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Portfólio com visibilidade real e nacional</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Networking com atletas, marcas e agências</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Convites prioritários para projetos FlowOFF</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Destaque nos canais oficiais</span></li>
                <li className="flex items-start"><span className="text-pink-400 mr-3">•</span><span>Possibilidade de bônus por entrega de alto impacto</span></li>
              </ul>
            </section>

            {/* Card: COMO FUNCIONA */}
            <section className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-pink-500/30">
              <h3 className="text-2xl md:text-3xl font-bold text-pink-400 mb-4">COMO FUNCIONA</h3>
              <div className="text-base md:text-lg text-gray-200 space-y-4 leading-relaxed">
                <p><span className="text-pink-400 font-semibold">Áreas:</span> <span className="font-semibold">Foto, Vídeo, Drone, Pós‑produção, Direção Criativa e Social Media</span></p>
                <p>Você terá acesso antecipado a briefings, áreas restritas e cronogramas de ação.</p>
                <p>A seleção será feita com base no seu portfólio, perfil e disponibilidade.</p>
              </div>
            </section>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-pink-500/30">
            <p className="text-lg md:text-xl text-gray-200 mb-6">
              <span className="text-pink-400 font-semibold">As vagas são limitadas.</span>
            </p>
            <p className="text-lg md:text-xl text-gray-200">
              Envie seu portfólio e candidate-se. Apenas os selecionados farão parte do time responsável por contar a história do <span className="text-pink-400 font-semibold">Interbox 2025</span>.
            </p>
          </div>
        </div>

        {/* Botão com fita rosa */}
        <div className="w-full flex justify-center">
          {/* Fita rosa como botão */}
          <button 
            onClick={handleParticipateClick}
            className="relative inline-block transform transition-all duration-300 hover:scale-105 hover:rotate-1 group"
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/images/pngtree-light-gray-old-paper.png"
              alt="Fita decorativa"
              className="h-16 w-auto object-contain"
            />
            
            {/* Texto sobre a fita */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <span className="text-2xl font-bold text-white">
                Quero participar
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
