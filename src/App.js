import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs(BrowserRouter, { children: [_jsx(ToastContainer, { position: "top-center" }), _jsxs(Routes, { children: [_jsx(Route, { path: "/captacao/judge-staff", element: _jsx(JudgeStaff, {}) }), _jsx(Route, { path: "/judge/cadastro", element: _jsx(JudgeCadastro, {}) }), _jsx(Route, { path: "/staff/cadastro", element: _jsx(StaffCadastro, {}) }), _jsx(Route, { path: "/produtos", element: _jsx(ProdutosPage, {}) }), _jsx(Route, { path: "/produto/:slug", element: _jsx(ProdutoDetalhes, {}) }), _jsx(Route, { path: "/admin", element: _jsx(AdminDashboard, {}) }), _jsx(Route, { path: "/admin/seguro", element: _jsx(AdminSeguro, {}) }), _jsx(Route, { path: "/seguro", element: _jsx(SeguroPage, {}) }), _jsx(Route, { path: "/fornecedor", element: _jsx(FornecedorDashboard, {}) }), _jsx(Route, { path: "/evento/interbox25", element: _jsx(Interbox25EventPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "", element: _jsx(Home, {}) })] })] }));
}
export default App;
