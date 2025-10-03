import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import JudgeStaff from './pages/captacao/judge-staff';
import AdminDashboard from './pages/admin';
import AdminSeguro from './pages/admin/seguro';
import JudgeCadastro from './pages/judge/cadastro';
import StaffCadastro from './pages/staff/cadastro';
import SeguroPage from './pages/seguro';
import FornecedorDashboard from './pages/fornecedor';
import ProdutosPage from './pages/produtos';
import ProdutoDetalhes from './pages/produto/ProdutoDetalhes';
import Interbox25EventPage from '../evento/interbox25/Interbox25EventPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Routes />
    <ToastContainer position="top-center" />
        {/** Rotas de audiovisual removidas */}
        <Route path="/captacao/judge-staff" element={<JudgeStaff />} />
        <Route path="/judge/cadastro" element={<JudgeCadastro />} />
        <Route path="/staff/cadastro" element={<StaffCadastro />} />
        <Route path="/produtos" element={<ProdutosPage />} />
        <Route path="/produto/:slug" element={<ProdutoDetalhes />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/seguro" element={<AdminSeguro />} />
        <Route path="/seguro" element={<SeguroPage />} />
        <Route path="/fornecedor" element={<FornecedorDashboard />} />
        <Route path="/evento/interbox25" element={<Interbox25EventPage />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
