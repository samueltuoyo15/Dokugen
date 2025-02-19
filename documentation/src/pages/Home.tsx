import { LiaAngleRightSolid } from "react-icons/lia";

const Home = () => {
 return (
   <section className='home-section'>
    <h1> Dokugen </h1>
    <p>
     Your one stop CLI tool to automatically generate high-quality README files for your projects. Spend less time on documentation and more time building! 🚀
    </p>
    
    <div className='install-bar'>
     <span>
      <LiaAngleRightSolid size={22} />
     </span>
     
     <span>
       $ npm install -g dokugen 
     </span>
    </div>
    
    <img 
      src='developer-activity.png' 
      alt='Developer' />
   </section>
 )
}

export default Home;