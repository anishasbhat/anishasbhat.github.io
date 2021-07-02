import { Switch } from 'react-router-dom'
import '../../App.css'
import React from 'react';
import profile from  '/Users/anishasbhat/Desktop/Code/anishasbhat.github.io/src/images/profile.JPG'


function Home() {
    return (
        <>
        {/*<h1 class="font"> ANISHA BHAT </h1> */}
        <p class="home-text">
            {/*<img src={profile} class="face"></img>*/}

      <br></br>
      Hi, I'm Anisha Bhat and I'm a junior studying Computer Science at Purdue University! 
      <br></br> <br></br>
      This website is currently under construction... 🦋
      </p>
        </>
    );
}

export default Home;