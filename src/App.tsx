import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import BriefingPage from './pages/BriefingPage/BriefingPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<BriefingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
