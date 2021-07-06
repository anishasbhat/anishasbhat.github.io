import React, {useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import './Navbar.css';
import { Button } from './Button';

function Navbar() {
    const [click, setClick] = useState(false);
    const [button, setButton] = useState(true)
    const handleClick = () => setClick(!click);
    const closeMobileMenu = () => setClick(false);
    const openLinkedin = () => window.location.href="https://www.linkedin.com/in/anishabhat/";
    const openGithub = () => window.location.href="https://github.com/anishasbhat";

    const showButton = () => {
        if(window.innerWidth <= 960) {
            setButton(false);
        } else {
            setButton(true);
        }
    }

    useEffect(() => {
        showButton()
    }, [])

    window.addEventListener('resize', showButton);
    return (
        <>
        <nav className='navbar'>
            <div className='navbar-container'>
                <Link to="/" className='navbar-logo' onClick= 
                {closeMobileMenu}>
                    AB <i className='fab fa-typo3'></i >
                    <div comment="fab fa-typo3 can del"> </div>
                </Link>
                <div className='menu-icon' onClick={handleClick}>
                    <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
                </div>
                <ul className={click ? 'nav-menu active' : 'nav-menu'}>
                    <li className='nav-item'>
                        <Link to='/projects' className='nav-links' onClick={closeMobileMenu}>
                            Projects
                        </Link>
                    </li>

                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={openLinkedin}>
                            Linkedin
                        </Link>
                    </li>

                    <li className='nav-item'>
                        <Link to='/' className='nav-links' onClick={openGithub}>
                            Github
                        </Link>
                    </li>
                    {/*
                    <li className='nav-item'>
                        <Link to='/sign-up' className='nav-links-mobile' onClick={closeMobileMenu}>
                            Sign Up
                        </Link>
                    </li>
                    */}
                </ul>
                {/*{button && <Button buttonStyle='btn--outline'>Sign Up</Button>}*/}
            </div>
        </nav> 
        </>
    )
}

export default Navbar
