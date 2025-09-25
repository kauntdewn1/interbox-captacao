import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AudiovisualAnalysis from './components/AudiovisualAnalysis';
import CheckoutCard from './components/CheckoutCard';
import JudgeStaff from './pages/captacao/judge-staff';
import AdminDashboard from './pages/admin';
import AdminSeguro from './pages/admin/seguro';
import AudiovisualSuccessPage from './pages/audiovisual/success';
import JudgeCadastro from './pages/judge/cadastro';
import StaffCadastro from './pages/staff/cadastro';
import SeguroPage from './pages/seguro';
import ProdutosPage from './pages/produtos';

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
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/seguro" element={<AdminSeguro />} />
        <Route path="/seguro" element={<SeguroPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;