// import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';


import Home from './pages/Home.tsx';
import Introduction from './pages/Introduction.tsx';
import Installation from './pages/Installation.tsx';

import './App.css'

const App = () => {
 return (
   <BrowserRouter>
     <Routes>
       <Route path='/' element={<Home />} />
       <Route path='/intro' element={<Introduction />} />
       <Route path='/installation' element={<Installation />}/>
     </Routes>
   </BrowserRouter>
 )
}

export default App;
