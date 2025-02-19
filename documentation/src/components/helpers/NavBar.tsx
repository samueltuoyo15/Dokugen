import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CiMenuFries } from "react-icons/ci";
import { FiExternalLink } from "react-icons/fi";
import { FaGithubAlt } from "react-icons/fa6";


const NavBar = () => {
 const [openMenu, setOpenMenu] = useState<boolean>(false);
 
 return (
  <nav>
   <ul className='navbar'>
    <li>
     <h1> 🦸 Dokugen </h1>
    </li>
    
    <li 
    onClick={() => setOpenMenu(!openMenu)}>
     <button arial-label='Menu button'> 
      <CiMenuFries size={26} />
     </button>
    </li>
   </ul>
   
   
   <ul 
     class='drop-down'
     style={{left: openMenu ? '0' : '-100%'}}
     onClick={() => setOpenMenu(!openMenu)}>
    <li>
     <Link to='/installation'>
      Docs 
      
      <span>
       <FiExternalLink />
      </span>
     </Link>
    </li>
    
    <li>
     <a href='https://github.com/samueltuoyo1/Dokugen' target='_blank'>
       Github
       
       <span> 
        <FaGithubAlt />
       </span>
     </a>
    </li>
   </ul>
  </nav>
 )
}

export default NavBar;