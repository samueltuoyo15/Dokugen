import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
const Home = lazy(() => import('./pages/Home.tsx'));
const Installation = lazy(() => import('./pages/Installation.tsx'));
import './App.css';
const App = () => {
    return (<BrowserRouter>
    <Routes>
     <Route path='/' element={<Layout />}>
       <Route index element={<Suspense>
         <Home />
        </Suspense>}/>
       <Route path='installation' element={<Suspense>
          <Installation />
        </Suspense>}/>
     </Route>
    </Routes>
   </BrowserRouter>);
};
export default App;
