import React from 'react';
import './Main.css';

function Main({ onRegister, onLogin }) {
  return (
    <main className='main'>
      <h1 className='main__title'>TaylorMade</h1>

      <div className='main__buttons'>
        <button
          className='main__button main__button-register'
          onClick={onRegister}
        >
          Sign Up
        </button>
        <button className='main__button main__button-login' onClick={onLogin}>
          Log In
        </button>
      </div>
    </main>
  );
}

export default Main;
