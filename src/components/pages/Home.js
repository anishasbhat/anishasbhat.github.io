import { Switch } from 'react-router-dom'
import '../../App.css'
import React from 'react';
import profile from  '/Users/anishasbhat/Desktop/Code/anishasbhat.github.io/src/images/anisha.jpg'


function Home() {
    return (
        <>
        {/*<h1 class="font"> ANISHA BHAT </h1> */}
        {/*<img src={profile} class="face"></img>*/}
        <p class="home-text">
        <h1 class="title"> Hi, I'm Anisha! </h1>

        <p class="subtext"> I'm a junior studying CS at Purdue University, with a minor in Management and a concentration in ML/AI.</p>
      <br></br>
      <p class="para"> 
      At Purdue, I lead the UX/Logistics team of Purdue's largest hackathon, Boilermake. <br></br>
      Currently, I serve on the Purdue CS Undergraduate Student Board and provide <br></br> guidance as a mentor at Launchpad, Purdue's
      freshmen technical project program. </p>
      <br></br> 
      <p class="para">In my free time, I like to cook new foods, and watch sunsets. </p>
      <br></br>
      <p class="subtext"> This website is currently still under construction... more coming soon! 🦋 </p>
      </p>
        </>
    );
}

export default Home;