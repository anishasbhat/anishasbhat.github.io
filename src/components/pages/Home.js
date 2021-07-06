import { Switch } from 'react-router-dom'
import '../../App.css'
import React from 'react';
import profile from  '/Users/anishasbhat/Desktop/Code/anishasbhat.github.io/src/images/anisha.jpg'


function Home() {
    return (
        <>
        {/*<h1 class="font"> ANISHA BHAT </h1> */}
        <img src={profile} class="face"></img>
        <p class="home-text">
        <h1 class="font"> ANISHA BHAT </h1>

        <p class="subtext"> Computer Science Undergraduate at Purdue University</p>
      <br></br><br></br>
      <p class="para">I'm a junior studying CS at Purdue University, with a minor in Management and a concentration in ML/AI. 
      At Purdue, I lead the UX/Logistics team of Purdue's largest hackathon, Boilermake. 
      Currently, I serve on the Purdue CS Undergraduate Student Board and provide guidance as a mentor at Launchpad, Purdue's
      freshmen technical project program. </p>
      <br></br> 
      <p class="para">In my free time, I like to cook new foods, and watch sunsets. This website is currently still under construction... stay tuned for updates! 🦋</p>
      <br></br>
      </p>
        </>
    );
}

export default Home;