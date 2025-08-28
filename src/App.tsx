import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AudiovisualAnalysis from './components/AudiovisualAnalysis';
import CheckoutCard from './components/CheckoutCard';
import JudgeStaff from './pages/captacao/judge-staff';
import AdminDashboard from './pages/admin';
import NeoProtocol from './pages/neo-protocol';
import AudiovisualSuccessPage from './pages/audiovisual/success';
import JudgeCadastro from './pages/judge/cadastro';
import StaffCadastro from './pages/staff/cadastro';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/audiovisual" element={<AudiovisualAnalysis />} />
        <Route path="/audiovisual/pagar" element={<CheckoutCard type="audiovisual" subtitle="Inscrição Audiovisual INTERBØX 2025" amount="R$ 29,90" />} />
        <Route path="/audiovisual/success" element={<AudiovisualSuccessPage />} />
        <Route path="/captacao/judge-staff" element={<JudgeStaff />} />
        <Route path="/judge/cadastro" element={<JudgeCadastro />} />
        <Route path="/staff/cadastro" element={<StaffCadastro />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/neo-protocol" element={<NeoProtocol />} />
        <Route path="/" element={<AudiovisualAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
