import { Outlet } from 'react-router-dom';
import NavBar from './helpers/NavBar';


const Layout = () => {
 return (
  <>
   <header>
    <NavBar onClick={() => alert('hello')} />
   </header>
 
   <main>
    <Outlet />
   </main>
  
   <footer>
   </footer>
  </>
 )
}

export default Layout;