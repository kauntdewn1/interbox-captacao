import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AudiovisualAnalysis from './components/AudiovisualAnalysis';
import CheckoutCard from './components/CheckoutCard';
import JudgeStaff from './pages/captacao/judge-staff';
import AdminDashboard from './pages/admin';
import NeoProtocol from './pages/neo-protocol';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/audiovisual" element={<AudiovisualAnalysis />} />
        <Route path="/audiovisual/pagar" element={<CheckoutCard type="audiovisual" subtitle="Inscrição Audiovisual INTERBØX 2025" amount="R$ 29,90" />} />
        <Route path="/captacao/judge-staff" element={<JudgeStaff />} />
        <Route path="/judge/pagar" element={<CheckoutCard type="judge" subtitle="Inscrição Judge INTERBØX 2025" amount="R$ 19,90" />} />
        <Route path="/staff/pagar" element={<CheckoutCard type="staff" subtitle="Inscrição Staff INTERBØX 2025" amount="R$ 19,90" />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/neo-protocol" element={<NeoProtocol />} />
        <Route path="/" element={<AudiovisualAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
